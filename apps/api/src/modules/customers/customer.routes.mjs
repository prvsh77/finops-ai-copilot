import { customerService } from "./customer.service.mjs";
import { ok, noContent } from "../../http.mjs";
import { notFound, validationError, unauthorized } from "../../errors.mjs";
import { assertRequired } from "../../../../../packages/shared/src/contracts.mjs";

export async function handleCustomerRoutes(req, res, method, path) {
  const isCustomerPath = path.startsWith("/customers");
  if (!isCustomerPath) return false;

  if (!req.user) throw unauthorized();

  // GET /customers
  if (method === "GET" && path === "/customers") {
    const list = await customerService.list(req.user.organization_id);
    ok(req, res, list, 200, { page: 1, per_page: list.length, total: list.length });
    return true;
  }

  // POST /customers
  if (method === "POST" && path === "/customers") {
    const details = assertRequired(req.body, ["customer", "segment"]);
    if (details.length) throw validationError(details);
    const result = await customerService.create(req.user.organization_id, req.body);
    ok(req, res, result, 201);
    return true;
  }

  // GET /customers/:id
  const idMatch = path.match(/^\/customers\/([^/]+)$/);
  if (idMatch && method === "GET") {
    const item = await customerService.getById(idMatch[1], req.user.organization_id);
    ok(req, res, item);
    return true;
  }

  // PATCH /customers/:id
  if (idMatch && method === "PATCH") {
    const item = await customerService.update(idMatch[1], req.user.organization_id, req.body);
    ok(req, res, item);
    return true;
  }

  // DELETE /customers/:id
  if (idMatch && method === "DELETE") {
    await customerService.delete(idMatch[1], req.user.organization_id);
    noContent(res);
    return true;
  }

  return false;
}
