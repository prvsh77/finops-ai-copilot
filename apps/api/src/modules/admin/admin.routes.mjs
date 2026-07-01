import { organizationService } from "./organization.service.mjs";
import { userService } from "./user.service.mjs";
import { apiKeyService } from "./apikey.service.mjs";
import { auditService } from "./audit.service.mjs";
import { ok, noContent } from "../../http.mjs";
import { notFound, validationError, unauthorized, forbidden } from "../../errors.mjs";
import { assertRequired, normalizeEmail, permissions } from "../../../../../packages/shared/src/contracts.mjs";
import { hasPermission } from "../../../../../packages/shared/src/contracts.mjs";

function requirePermission(req, permission) {
  if (!req.user) throw unauthorized();
  const roleGranted = req.user.permissions ?? [];
  const hasPerm = req.user.role === "super_admin" || req.user.role === "admin" || hasPermission(req.user.role, permission);
  if (!hasPerm) throw forbidden();
}

export async function handleAdminRoutes(req, res, method, path) {
  const isAdminPath = path.startsWith("/organization") || path.startsWith("/users") || path.startsWith("/api-keys") || path === "/audit-logs" || path === "/dashboard/summary";
  if (!isAdminPath) return false;

  if (!req.user) throw unauthorized();

  if (method === "GET" && path === "/organization") {
    requirePermission(req, permissions.readOrganization);
    const org = await organizationService.getById(req.user.organization_id);
    if (!org) throw notFound("Organization not found.");
    ok(req, res, org);
    return true;
  }

  if (method === "PATCH" && path === "/organization") {
    requirePermission(req, permissions.writeOrganization);
    const org = await organizationService.update(req.user.organization_id, req.body, req, req.user.id);
    ok(req, res, org);
    return true;
  }

  if (method === "POST" && path === "/organization/onboarding") {
    requirePermission(req, permissions.writeOrganization);
    const org = await organizationService.completeOnboarding(req.user.organization_id, req.body, req, req.user.id);
    ok(req, res, org);
    return true;
  }

  if (method === "GET" && path === "/users") {
    requirePermission(req, permissions.readUsers);
    const list = await userService.list(req.user.organization_id);
    const cleaned = list.map((u) => { u.password_hash = undefined; return u; });
    ok(req, res, cleaned, 200, { page: 1, per_page: cleaned.length, total: cleaned.length });
    return true;
  }

  const userMatch = path.match(/^\/users\/([^/]+)$/);
  if (userMatch && method === "PATCH") {
    requirePermission(req, permissions.writeUsers);
    const updated = await userService.update(userMatch[1], (u) => {
      if (req.body.role) u.role = req.body.role;
      if (req.body.status) u.status = req.body.status;
    }, req, req.user.id);
    if (!updated) throw notFound("User not found.");
    updated.password_hash = undefined;
    ok(req, res, updated);
    return true;
  }

  if (userMatch && method === "DELETE") {
    requirePermission(req, permissions.writeUsers);
    const okDelete = await userService.delete(userMatch[1], req, req.user.id);
    if (!okDelete) throw notFound("User not found.");
    noContent(res);
    return true;
  }

  if (method === "GET" && path === "/api-keys") {
    requirePermission(req, permissions.readApiKeys);
    const list = await apiKeyService.list(req.user.organization_id);
    ok(req, res, list);
    return true;
  }

  if (method === "POST" && path === "/api-keys") {
    requirePermission(req, permissions.writeApiKeys);
    const result = await apiKeyService.create(req.user.organization_id, req.body.name, req.body.scopes, req.user.id, req);
    ok(req, res, result, 201);
    return true;
  }

  const apiKeyMatch = path.match(/^\/api-keys\/([^/]+)$/);
  if (apiKeyMatch && method === "DELETE") {
    requirePermission(req, permissions.writeApiKeys);
    const updated = await apiKeyService.delete(apiKeyMatch[1], req.user.organization_id, req.user.id, req);
    if (!updated) throw notFound("API key not found.");
    noContent(res);
    return true;
  }

  if (method === "GET" && path === "/dashboard/summary") {
    requirePermission(req, permissions.readDashboard);
    ok(req, res, {
      kpis: [
        { label: "Revenue", value: "INR 24.56 Cr", change: "+12.5%" },
        { label: "Expenses", value: "INR 18.32 Cr", change: "+8.2%" },
        { label: "Profit", value: "INR 6.28 Cr", change: "+18.3%" },
        { label: "Risk Score", value: "62", change: "High risk" },
      ],
      ai_summary: "Revenue is ahead of plan, cash runway is healthy, and vendor risk requires review.",
    });
    return true;
  }

  if (method === "GET" && path === "/audit-logs") {
    requirePermission(req, permissions.readAudit);
    const logs = await auditService.list(req.user.organization_id);
    ok(req, res, logs, 200, { page: 1, per_page: logs.length, total: logs.length });
    return true;
  }

  return false;
}
