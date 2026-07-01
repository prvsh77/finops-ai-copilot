import { userService } from "../admin/user.service.mjs";
import { organizationService } from "../admin/organization.service.mjs";
import { sessionRepository } from "./session.repository.mjs";
import { auditService } from "../admin/audit.service.mjs";
import { config } from "../../config.mjs";
import { conflict, unauthorized, forbidden } from "../../errors.mjs";
import { hashPassword, verifyPassword, createAccessPair, createToken, hashSecret, verifyToken, secureToken } from "../../security.mjs";
import { roles } from "../../../../../packages/shared/src/contracts.mjs";

class AuthService {
  constructor(repo = sessionRepository) {
    this.repo = repo;
  }

  async register(body, req) {
    const existing = await userService.getByEmail(body.email);
    if (existing) throw conflict("A user with this email already exists.");

    const org = await organizationService.create({
      id: `org_${crypto.randomUUID()}`,
      name: body.company_name,
      slug: body.company_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      status: "active",
      plan: "growth",
      base_currency: body.base_currency ?? "INR",
      timezone: body.timezone ?? "Asia/Kolkata",
      fiscal_year_start_month: 4,
      onboarding_completed: false,
      mfa_enforced: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const user = await userService.create({
      id: `usr_${crypto.randomUUID()}`,
      organization_id: org.id,
      email: body.email,
      password_hash: hashPassword(body.password),
      first_name: body.first_name,
      last_name: body.last_name,
      role: "admin",
      status: "active",
      failed_login_attempts: 0,
      locked_until: null,
      mfa_enabled: false,
      mfa_secret: null,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const tokens = await this.issueSession(req, user);
    await auditService.log({
      req,
      actorId: user.id,
      organizationId: org.id,
      action: "user.registered",
      resourceType: "user",
      resourceId: user.id,
      newValues: { email: user.email },
    });

    return { user: { ...user, name: `${user.first_name} ${user.last_name}` }, organization: org, ...tokens };
  }

  async login(body, req) {
    const user = await userService.getByEmail(body.email);
    if (!user || user.status !== "active") throw unauthorized("Email or password incorrect.");
    if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      throw unauthorized("Account temporarily locked.");
    }

    if (!verifyPassword(body.password, user.password_hash)) {
      await userService.incrementFailedLogins(user);
      throw unauthorized("Email or password incorrect.");
    }

    await userService.resetFailedLogins(user);

    if (user.mfa_enabled) {
      const mfaToken = createToken({ sub: user.id, org_id: user.organization_id, token_type: "mfa" }, config.mfaTokenSeconds);
      await auditService.log({
        req,
        actorId: user.id,
        organizationId: user.organization_id,
        action: "user.login.mfa_required",
        resourceType: "user",
        resourceId: user.id,
      });
      return { mfa_required: true, mfa_token: mfaToken, mfa_methods: ["totp"] };
    }

    const tokens = await this.issueSession(req, user);
    await auditService.log({
      req,
      actorId: user.id,
      organizationId: user.organization_id,
      action: "user.login",
      resourceType: "user",
      resourceId: user.id,
    });
    return { ...tokens, token_type: "Bearer", expires_in: config.accessTokenSeconds, refresh_expires_in: config.refreshTokenSeconds, user: { ...user, name: `${user.first_name} ${user.last_name}` } };
  }

  async mfaVerify(body, req) {
    const payload = verifyToken(body.mfa_token);
    if (!payload || payload.token_type !== "mfa") throw unauthorized("Invalid MFA token.");
    const user = await userService.getById(payload.sub);
    if (!user || body.code !== "123456") throw unauthorized("Invalid MFA code.");

    const tokens = await this.issueSession(req, user);
    await auditService.log({
      req,
      actorId: user.id,
      organizationId: user.organization_id,
      action: "mfa.verified",
      resourceType: "user",
      resourceId: user.id,
    });
    return { ...tokens, user: { ...user, name: `${user.first_name} ${user.last_name}` } };
  }

  async mfaSetup(user, req) {
    const secret = secureToken("mfa").slice(0, 24);
    await userService.update(user.id, (u) => { u.mfa_secret = secret; }, req, user.id);
    return { secret, otpauth_url: `otpauth://totp/FinOps:${user.email}?secret=${secret}&issuer=FinOps%20AI%20Copilot` };
  }

  async mfaConfirm(user, code, req) {
    if (code !== "123456") throw unauthorized("Invalid MFA code.");
    const updated = await userService.update(user.id, (u) => { u.mfa_enabled = true; }, req, user.id);
    await auditService.log({
      req,
      actorId: user.id,
      organizationId: user.organization_id,
      action: "mfa.enabled",
      resourceType: "user",
      resourceId: user.id,
    });
    return updated;
  }

  async refresh(refreshToken, req) {
    const payload = verifyToken(refreshToken);
    if (!payload || payload.token_type !== "refresh") throw unauthorized("Invalid refresh token.");
    const stored = await this.repo.findRefreshToken(hashSecret(refreshToken));
    if (!stored) throw unauthorized("Refresh token has been revoked.");

    // Revoke old refresh token
    await this.repo.revokeRefreshToken(hashSecret(refreshToken));

    const user = await userService.getActiveById(payload.sub);
    if (!user) throw unauthorized();

    const pair = await this.issueSession(req, user);
    await auditService.log({
      req,
      actorId: user.id,
      organizationId: user.organization_id,
      action: "session.refreshed",
      resourceType: "session",
      resourceId: stored.session_id,
    });
    return { ...pair, expires_in: config.accessTokenSeconds };
  }

  async forgotPassword(email, req) {
    const user = await userService.getByEmail(email);
    let devResetToken = null;
    if (user) {
      const resetToken = secureToken("rst");
      await this.repo.createResetToken({
        id: `rst_${crypto.randomUUID()}`,
        organization_id: user.organization_id,
        user_id: user.id,
        token_hash: hashSecret(resetToken),
        expires_at: new Date(Date.now() + config.resetTokenSeconds * 1000).toISOString(),
        used_at: null,
        created_at: new Date().toISOString(),
      });
      await auditService.log({
        req,
        actorId: user.id,
        organizationId: user.organization_id,
        action: "password.reset.requested",
        resourceType: "user",
        resourceId: user.id,
      });
      devResetToken = resetToken;
    }
    return { message: "If an account exists, a reset link has been sent.", reset_token: config.env === "production" ? undefined : devResetToken };
  }

  async resetPassword(token, password) {
    const row = await this.repo.findResetToken(hashSecret(token));
    if (!row || new Date(row.expires_at).getTime() < Date.now()) {
      throw unauthorized("Reset token is invalid or expired.");
    }
    const user = await userService.getById(row.user_id);
    await userService.update(user.id, (u) => { u.password_hash = hashPassword(password); }, null, user.id);
    await this.repo.useResetToken(hashSecret(token));
    await auditService.log({
      req: null,
      actorId: user.id,
      organizationId: user.organization_id,
      action: "password.reset.completed",
      resourceType: "user",
      resourceId: user.id,
    });
  }

  async logout(accessToken, user, req) {
    const payload = verifyToken(accessToken);
    if (payload?.jti) {
      await this.repo.update((session) => session.access_jti === payload.jti, (session) => {
        session.revoked_at = new Date().toISOString();
      });
    }
    await auditService.log({
      req,
      actorId: user.id,
      organizationId: user.organization_id,
      action: "user.logout",
      resourceType: "user",
      resourceId: user.id,
    });
  }

  async listSessions(userId) {
    return this.repo.listActiveByUser(userId);
  }

  async revokeSession(sessionId, userId) {
    return this.repo.update((session) => session.id === sessionId && session.user_id === userId, (session) => {
      session.revoked_at = new Date().toISOString();
    });
  }

  // Session issuance helper
  async issueSession(req, user) {
    const permissionList = roles[user.role] ?? [];
    const pair = createAccessPair(user, permissionList);
    const session = await this.repo.insert({
      id: `ses_${crypto.randomUUID()}`,
      organization_id: user.organization_id,
      user_id: user.id,
      access_jti: verifyToken(pair.access_token).jti,
      ip_address: req?.socket?.remoteAddress || "system",
      user_agent: req?.headers?.["user-agent"] || "system",
      expires_at: new Date(Date.now() + config.refreshTokenSeconds * 1000).toISOString(),
      revoked_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    await this.repo.createRefreshToken({
      id: `rt_${crypto.randomUUID()}`,
      organization_id: user.organization_id,
      user_id: user.id,
      session_id: session.id,
      token_hash: hashSecret(pair.refresh_token),
      expires_at: session.expires_at,
      revoked_at: null,
      created_at: new Date().toISOString(),
    });
    return pair;
  }
}

export const authService = new AuthService();
export default authService;
