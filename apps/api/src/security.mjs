import {
  createHmac,
  randomBytes,
  randomUUID,
  pbkdf2Sync,
  timingSafeEqual,
} from "node:crypto";
import { config } from "./config.mjs";

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function sign(input, secret = config.jwtSecret) {
  return createHmac("sha256", secret).update(input).digest("base64url");
}

export function createToken(payload, expiresInSeconds) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const body = base64url(JSON.stringify({ ...payload, iat: now, exp: now + expiresInSeconds, jti: randomUUID() }));
  return `${header}.${body}.${sign(`${header}.${body}`)}`;
}

export function verifyToken(token) {
  try {
    const [header, body, signature] = String(token ?? "").split(".");
    if (!header || !body || !signature) return null;
    const expected = sign(`${header}.${body}`);
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const hash = pbkdf2Sync(password, salt, 210000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored ?? "").split(":");
  if (!salt || !hash) return false;
  const candidate = hashPassword(password, salt).split(":")[1];
  return timingSafeEqual(Buffer.from(candidate), Buffer.from(hash));
}

export function secureToken(prefix) {
  return `${prefix}_${randomBytes(32).toString("base64url")}`;
}

export function hashSecret(secret) {
  return createHmac("sha256", config.jwtSecret).update(secret).digest("hex");
}

export function createApiKey() {
  const raw = secureToken("fk_live");
  return { raw, hash: hashSecret(raw), prefix: raw.slice(0, 16) };
}

export function createAccessPair(user, permissions) {
  const access_token = createToken({
    sub: user.id,
    org_id: user.organization_id,
    role: user.role,
    permissions,
    email: user.email,
    token_type: "access",
  }, config.accessTokenSeconds);
  const refresh_token = createToken({ sub: user.id, org_id: user.organization_id, token_type: "refresh" }, config.refreshTokenSeconds);
  return { access_token, refresh_token };
}
