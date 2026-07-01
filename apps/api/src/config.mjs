import { randomBytes } from "node:crypto";
import { resolve } from "node:path";

export const config = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.API_PORT ?? process.env.PORT ?? 8080),
  dataFile: process.env.API_DATA_FILE ?? resolve("apps/api/storage/dev-data.json"),
  jwtSecret: process.env.JWT_SECRET ?? "dev-only-change-me-finops-ai-copilot",
  accessTokenSeconds: Number(process.env.ACCESS_TOKEN_SECONDS ?? 3600),
  refreshTokenSeconds: Number(process.env.REFRESH_TOKEN_SECONDS ?? 60 * 60 * 24 * 30),
  resetTokenSeconds: Number(process.env.RESET_TOKEN_SECONDS ?? 60 * 30),
  mfaTokenSeconds: Number(process.env.MFA_TOKEN_SECONDS ?? 60 * 5),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  systemUserId: "system",
  instanceId: randomBytes(6).toString("hex"),
};
