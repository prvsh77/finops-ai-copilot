import { invoiceService } from "./invoice.service.mjs";
import { ok, noContent } from "../../http.mjs";
import { notFound, validationError, unauthorized } from "../../errors.mjs";
import { assertRequired } from "../../../../../packages/shared/src/contracts.mjs";

export async function handleInvoiceRoutes(req, res, method, path) {
  const isInvoicePath = path.startsWith("/invoices");
  if (!isInvoicePath) return false;

  if (!req.user) throw unauthorized();

  const url = new URL(req.url, "http://localhost");

  // GET /invoices
  if (method === "GET" && path === "/invoices") {
    const filters = {
      page: Number(url.searchParams.get("page") || 1),
      per_page: Number(url.searchParams.get("per_page") || 15),
      search: url.searchParams.get("search"),
      status: url.searchParams.get("status"),
      type: url.searchParams.get("type") || "ap",
      po_match_status: url.searchParams.get("po_match_status"),
      start_date: url.searchParams.get("start_date"),
      end_date: url.searchParams.get("end_date"),
      sort_by: url.searchParams.get("sort_by") || "due_date",
      sort_order: url.searchParams.get("sort_order") || "asc",
    };
    const result = await invoiceService.list(req.user.organization_id, filters);
    ok(req, res, result.data, 200, result.pagination);
    return true;
  }

  // POST /invoices/upload
  if (method === "POST" && path === "/invoices/upload") {
    const details = assertRequired(req.body, ["file_name", "amount"]);
    if (details.length) throw validationError(details);
    const result = await invoiceService.uploadAndProcess(req.user.organization_id, req.body);
    ok(req, res, result, 201);
    return true;
  }

  // GET /invoices/:id
  const idMatch = path.match(/^\/invoices\/([^/]+)$/);
  if (idMatch && method === "GET") {
    const inv = await invoiceService.getById(idMatch[1], req.user.organization_id);
    ok(req, res, inv);
    return true;
  }

  // POST /invoices/:id/approve
  const approveMatch = path.match(/^\/invoices\/([^/]+)\/approve$/);
  if (approveMatch && method === "POST") {
    const inv = await invoiceService.approve(approveMatch[1], req.user.organization_id, req.user.id);
    ok(req, res, inv);
    return true;
  }

  // POST /invoices/:id/reject
  const rejectMatch = path.match(/^\/invoices\/([^/]+)\/reject$/);
  if (rejectMatch && method === "POST") {
    const details = assertRequired(req.body, ["reason"]);
    if (details.length) throw validationError(details);
    const inv = await invoiceService.reject(rejectMatch[1], req.user.organization_id, req.user.id, req.body.reason);
    ok(req, res, inv);
    return true;
  }

  return false;
}
