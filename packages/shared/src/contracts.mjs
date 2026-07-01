export const roles = {
  super_admin: ["*"],
  admin: [
    "organization:read",
    "organization:write",
    "users:read",
    "users:write",
    "users:invite",
    "api_keys:read",
    "api_keys:write",
    "audit:read",
    "dashboard:read",
  ],
  finance_manager: ["organization:read", "users:read", "dashboard:read", "audit:read"],
  accountant: ["organization:read", "dashboard:read"],
  auditor: ["organization:read", "audit:read", "dashboard:read"],
  developer: ["organization:read", "api_keys:read", "api_keys:write", "dashboard:read"],
  executive_viewer: ["organization:read", "dashboard:read"],
};

export const publicPaths = new Set([
  "GET /api/v1/health",
  "GET /api/v1/openapi.json",
  "POST /api/v1/auth/login",
  "POST /api/v1/auth/register",
  "POST /api/v1/auth/refresh",
  "POST /api/v1/auth/forgot-password",
  "POST /api/v1/auth/reset-password",
  "POST /api/v1/auth/mfa/verify",
  "GET /api/v1/auth/oauth/:provider",
]);

export const permissions = Object.freeze({
  readOrganization: "organization:read",
  writeOrganization: "organization:write",
  readUsers: "users:read",
  writeUsers: "users:write",
  inviteUsers: "users:invite",
  readApiKeys: "api_keys:read",
  writeApiKeys: "api_keys:write",
  readAudit: "audit:read",
  readDashboard: "dashboard:read",
});

export function hasPermission(role, permission) {
  const granted = roles[role] ?? [];
  return granted.includes("*") || granted.includes(permission);
}

export function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

export function assertRequired(payload, fields) {
  const details = [];
  for (const field of fields) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
      details.push({ field, code: "REQUIRED", message: `${field} is required` });
    }
  }
  return details;
}
