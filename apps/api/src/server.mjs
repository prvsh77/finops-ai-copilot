import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { normalizeEmail } from "../../../packages/shared/src/contracts.mjs";
import { config } from "./config.mjs";
import { handleError, readJson } from "./http.mjs";
import { route } from "./routes.mjs";
import { hashSecret, verifyToken } from "./security.mjs";
import { store } from "./store.mjs";
import { unauthorized } from "./errors.mjs";

async function authenticate(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return;

  const jwtPayload = verifyToken(token);
  if (jwtPayload?.token_type === "access") {
    const user = store.find("users", (candidate) => candidate.id === jwtPayload.sub && candidate.status === "active" && !candidate.deleted_at);
    if (!user) throw unauthorized();
    req.user = {
      id: user.id,
      email: normalizeEmail(user.email),
      organization_id: user.organization_id,
      role: user.role,
      permissions: jwtPayload.permissions ?? [],
    };
    return;
  }

  const apiKey = store.find("api_keys", (candidate) => candidate.key_hash === hashSecret(token) && candidate.status === "active");
  if (apiKey) {
    const serviceUser = store.find("users", (candidate) => candidate.organization_id === apiKey.organization_id && candidate.role === "admin" && candidate.status === "active");
    req.user = {
      id: serviceUser?.id ?? "api_key",
      email: "api-key@finops.local",
      organization_id: apiKey.organization_id,
      role: "developer",
      permissions: apiKey.scopes,
      api_key_id: apiKey.id,
    };
    apiKey.last_used_at = new Date().toISOString();
  }
}

export async function createAppServer() {
  await store.load();
  return createServer(async (req, res) => {
    req.requestId = randomUUID();
    req.correlationId = req.headers["x-correlation-id"] ?? req.requestId;
    try {
      req.body = await readJson(req);
      await authenticate(req);
      await route(req, res);
    } catch (error) {
      handleError(req, res, error);
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const server = await createAppServer();
  server.listen(config.port, () => {
    console.log(`FinOps AI Copilot API listening on http://localhost:${config.port}/api/v1`);
  });
}
