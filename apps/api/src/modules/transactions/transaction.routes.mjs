import { transactionService } from "./transaction.service.mjs";
import { ok, noContent } from "../../http.mjs";
import { notFound, validationError, unauthorized } from "../../errors.mjs";
import { assertRequired } from "../../../../../packages/shared/src/contracts.mjs";

export async function handleTransactionRoutes(req, res, method, path) {
  const isTransactionPath = path.startsWith("/transactions");
  if (!isTransactionPath) return false;

  if (!req.user) throw unauthorized();

  const url = new URL(req.url, "http://localhost");

  // GET /transactions
  if (method === "GET" && path === "/transactions") {
    const filters = {
      page: Number(url.searchParams.get("page") || 1),
      per_page: Number(url.searchParams.get("per_page") || 15),
      search: url.searchParams.get("search"),
      reconciliation_status: url.searchParams.get("reconciliation_status"),
      flag_status: url.searchParams.get("flag_status"),
      category_id: url.searchParams.get("category_id"),
      vendor_id: url.searchParams.get("vendor_id"),
      start_date: url.searchParams.get("start_date"),
      end_date: url.searchParams.get("end_date"),
      sort_by: url.searchParams.get("sort_by") || "posted_date",
      sort_order: url.searchParams.get("sort_order") || "desc",
    };
    const result = await transactionService.list(req.user.organization_id, filters);
    ok(req, res, result.data, 200, result.pagination);
    return true;
  }

  // POST /transactions/import
  if (method === "POST" && path === "/transactions/import") {
    const details = assertRequired(req.body, ["transactions"]);
    if (details.length) throw validationError(details);
    const result = await transactionService.importTransactions(req.user.organization_id, req.body.transactions);
    ok(req, res, result, 201);
    return true;
  }

  // POST /transactions (manual creation)
  if (method === "POST" && path === "/transactions") {
    const details = assertRequired(req.body, ["amount", "description"]);
    if (details.length) throw validationError(details);
    const result = await transactionService.create(req.user.organization_id, req.body);
    ok(req, res, result, 201);
    return true;
  }

  // GET /transactions/:id
  const idMatch = path.match(/^\/transactions\/([^/]+)$/);
  if (idMatch && method === "GET") {
    const txn = await transactionService.getById(idMatch[1], req.user.organization_id);
    ok(req, res, txn);
    return true;
  }

  // PATCH /transactions/:id
  if (idMatch && method === "PATCH") {
    const txn = await transactionService.update(idMatch[1], req.user.organization_id, req.body);
    ok(req, res, txn);
    return true;
  }

  // DELETE /transactions/:id
  if (idMatch && method === "DELETE") {
    await transactionService.delete(idMatch[1], req.user.organization_id);
    noContent(res);
    return true;
  }

  // POST /transactions/:id/categorize
  const catMatch = path.match(/^\/transactions\/([^/]+)\/categorize$/);
  if (catMatch && method === "POST") {
    const details = assertRequired(req.body, ["category_id"]);
    if (details.length) throw validationError(details);
    const txn = await transactionService.categorize(catMatch[1], req.user.organization_id, req.body.category_id, req.body.confidence);
    ok(req, res, txn);
    return true;
  }

  // POST /transactions/:id/flag
  const flagMatch = path.match(/^\/transactions\/([^/]+)\/flag$/);
  if (flagMatch && method === "POST") {
    const details = assertRequired(req.body, ["flag_status", "reason"]);
    if (details.length) throw validationError(details);
    const txn = await transactionService.flag(flagMatch[1], req.user.organization_id, req.body.flag_status, req.body.reason);
    ok(req, res, txn);
    return true;
  }

  // POST /transactions/:id/unflag
  const unflagMatch = path.match(/^\/transactions\/([^/]+)\/unflag$/);
  if (unflagMatch && method === "POST") {
    const txn = await transactionService.flag(unflagMatch[1], req.user.organization_id, "none", null);
    ok(req, res, txn);
    return true;
  }

  // POST /transactions/:id/reconcile
  const reconMatch = path.match(/^\/transactions\/([^/]+)\/reconcile$/);
  if (reconMatch && method === "POST") {
    const details = assertRequired(req.body, ["invoice_id"]);
    if (details.length) throw validationError(details);
    const txn = await transactionService.reconcile(reconMatch[1], req.user.organization_id, req.body.invoice_id);
    ok(req, res, txn);
    return true;
  }

  return false;
}
