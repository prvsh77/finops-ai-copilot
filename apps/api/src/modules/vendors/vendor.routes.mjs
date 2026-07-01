import { vendorService } from "./vendor.service.mjs";
import { ok, noContent } from "../../http.mjs";
import { notFound, validationError, unauthorized } from "../../errors.mjs";
import { assertRequired } from "../../../../../packages/shared/src/contracts.mjs";

export async function handleVendorRoutes(req, res, method, path) {
  const isVendorPath = path.startsWith("/vendors");
  if (!isVendorPath) return false;

  if (!req.user) throw unauthorized();

  // GET /vendors
  if (method === "GET" && path === "/vendors") {
    const list = await vendorService.list(req.user.organization_id);
    ok(req, res, list, 200, { page: 1, per_page: list.length, total: list.length });
    return true;
  }

  // POST /vendors
  if (method === "POST" && path === "/vendors") {
    const details = assertRequired(req.body, ["vendor", "category"]);
    if (details.length) throw validationError(details);
    const result = await vendorService.create(req.user.organization_id, req.body);
    ok(req, res, result, 201);
    return true;
  }

  // GET /vendors/:id
  const idMatch = path.match(/^\/vendors\/([^/]+)$/);
  if (idMatch && method === "GET") {
    const item = await vendorService.getById(idMatch[1], req.user.organization_id);
    ok(req, res, item);
    return true;
  }

  // PATCH /vendors/:id
  if (idMatch && method === "PATCH") {
    const item = await vendorService.update(idMatch[1], req.user.organization_id, req.body);
    ok(req, res, item);
    return true;
  }

  // DELETE /vendors/:id
  if (idMatch && method === "DELETE") {
    await vendorService.delete(idMatch[1], req.user.organization_id);
    noContent(res);
    return true;
  }

  return false;
}
