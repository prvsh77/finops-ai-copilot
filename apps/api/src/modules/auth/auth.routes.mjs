import { authService } from "./auth.service.mjs";
import { ok, noContent } from "../../http.mjs";
import { rateLimit } from "../../rate-limit.mjs";
import { validationError, unauthorized } from "../../errors.mjs";
import { assertRequired, normalizeEmail } from "../../../../../packages/shared/src/contracts.mjs";
import { config } from "../../config.mjs";
import { verifyToken } from "../../security.mjs";

export async function handleAuthRoutes(req, res, method, path) {
  console.log("[AUTH]", method, path);
  if (method === "POST" && path === "/auth/register") {
    console.log("REGISTER ROUTE HIT");
    rateLimit(req, `register:${req.socket.remoteAddress}`, 3, 60 * 60 * 1000);
    const body = req.body;
    const details = assertRequired(body, ["email", "password", "first_name", "last_name", "company_name", "accept_terms"]);
    if (body.accept_terms !== true) {
      details.push({ field: "accept_terms", code: "MUST_ACCEPT", message: "Terms must be accepted" });
    }
    if (String(body.password ?? "").length < 12) {
      details.push({ field: "password", code: "MIN_LENGTH", message: "Password must be at least 12 characters" });
    }
    if (details.length) throw validationError(details);

    const result = await authService.register(body, req);
    result.user.password_hash = undefined;
    ok(req, res, result, 201);
    return true;
  }

  if (method === "POST" && path === "/auth/login") {
    rateLimit(req, `login:${req.socket.remoteAddress}`, 10, 60 * 1000);
    const body = req.body;
    const details = assertRequired(body, ["email", "password"]);
    if (details.length) throw validationError(details);

    const result = await authService.login(body, req);
    if (result.user) result.user.password_hash = undefined;
    ok(req, res, result);
    return true;
  }

  if (method === "POST" && path === "/auth/refresh") {
    const token = req.body.refresh_token;
    if (!token) throw validationError([{ field: "refresh_token", code: "REQUIRED", message: "refresh_token is required" }]);
    const result = await authService.refresh(token, req);
    ok(req, res, result);
    return true;
  }

  if (method === "POST" && path === "/auth/forgot-password") {
    rateLimit(req, `forgot:${normalizeEmail(req.body.email)}`, 3, 60 * 60 * 1000);
    const result = await authService.forgotPassword(req.body.email, req);
    ok(req, res, result);
    return true;
  }

  if (method === "POST" && path === "/auth/reset-password") {
    const details = assertRequired(req.body, ["token", "password"]);
    if (String(req.body.password ?? "").length < 12) {
      details.push({ field: "password", code: "MIN_LENGTH", message: "Password must be at least 12 characters" });
    }
    if (details.length) throw validationError(details);

    await authService.resetPassword(req.body.token, req.body.password);
    ok(req, res, { message: "Password has been reset." });
    return true;
  }

  if (method === "POST" && path === "/auth/mfa/verify") {
    const details = assertRequired(req.body, ["mfa_token", "code"]);
    if (details.length) throw validationError(details);

    const result = await authService.mfaVerify(req.body, req);
    result.user.password_hash = undefined;
    ok(req, res, result);
    return true;
  }

  if (method === "GET" && path.startsWith("/auth/oauth/")) {
    const provider = path.split("/").at(-1);
    ok(req, res, { provider, authorization_url: `/api/v1/auth/oauth/${provider}/callback`, state: crypto.randomUUID() });
    return true;
  }

  // Protected auth routes below
  if (path.startsWith("/auth") || path.startsWith("/sessions")) {
    if (!req.user) throw unauthorized();

    if (method === "POST" && path === "/auth/logout") {
      const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
      await authService.logout(token, req.user, req);
      noContent(res);
      return true;
    }

    if (method === "POST" && path === "/auth/mfa/setup") {
      const result = await authService.mfaSetup(req.user, req);
      ok(req, res, result);
      return true;
    }

    if (method === "POST" && path === "/auth/mfa/confirm") {
      const details = assertRequired(req.body, ["code"]);
      if (details.length) throw validationError(details);

      const user = await authService.mfaConfirm(req.user, req.body.code, req);
      user.password_hash = undefined;
      ok(req, res, { message: "MFA has been enabled successfully.", user });
      return true;
    }

    if (method === "GET" && path === "/sessions") {
      const sessions = await authService.listSessions(req.user.id);
      ok(req, res, sessions);
      return true;
    }

    const sessionMatch = path.match(/^\/sessions\/([^/]+)$/);
    if (sessionMatch && method === "DELETE") {
      const updated = await authService.revokeSession(sessionMatch[1], req.user.id);
      if (!updated) return false;
      noContent(res);
      return true;
    }
  }

  return false;
}
