import { paymentService } from "./payment.service.mjs";
import { treasuryService } from "./treasury.service.mjs";
import { ok, noContent } from "../../http.mjs";
import { notFound, validationError, unauthorized } from "../../errors.mjs";
import { assertRequired } from "../../../../../packages/shared/src/contracts.mjs";

export async function handlePaymentRoutes(req, res, method, path) {
  const isPaymentPath = path.startsWith("/payments") || path.startsWith("/bank-accounts") || path.startsWith("/treasury");
  if (!isPaymentPath) return false;

  if (!req.user) throw unauthorized();

  const url = new URL(req.url, "http://localhost");

  // BANK ACCOUNTS ROUTING
  if (method === "GET" && path === "/bank-accounts") {
    const list = await treasuryService.listAccounts(req.user.organization_id);
    ok(req, res, list);
    return true;
  }

  if (method === "POST" && path === "/bank-accounts/connect") {
    const details = assertRequired(req.body, ["institution_name", "account_number", "balance_current", "currency"]);
    if (details.length) throw validationError(details);
    const result = await treasuryService.connectAccount(req.user.organization_id, req.body);
    ok(req, res, result, 201);
    return true;
  }

  // TREASURY ROUTING
  if (method === "GET" && path === "/treasury/cash-positions") {
    const result = await treasuryService.getCashPositions(req.user.organization_id);
    ok(req, res, result);
    return true;
  }

  if (method === "POST" && path === "/treasury/transfers") {
    const details = assertRequired(req.body, ["source_account_id", "destination_account_id", "amount", "currency"]);
    if (details.length) throw validationError(details);
    const result = await treasuryService.transfer(
      req.user.organization_id,
      req.body.source_account_id,
      req.body.destination_account_id,
      Number(req.body.amount),
      req.body.currency,
      req.user.id
    );
    ok(req, res, result, 201);
    return true;
  }

  // PAYMENTS ROUTING
  if (method === "GET" && path === "/payments") {
    const filters = {
      page: Number(url.searchParams.get("page") || 1),
      per_page: Number(url.searchParams.get("per_page") || 15),
      search: url.searchParams.get("search"),
      status: url.searchParams.get("status"),
      vendor_id: url.searchParams.get("vendor_id"),
      rail: url.searchParams.get("rail"),
      sort_by: url.searchParams.get("sort_by") || "created_at",
      sort_order: url.searchParams.get("sort_order") || "desc",
    };
    const result = await paymentService.list(req.user.organization_id, filters);
    ok(req, res, result.data, 200, result.pagination);
    return true;
  }

  if (method === "POST" && path === "/payments") {
    const details = assertRequired(req.body, ["amount", "rail", "beneficiary_name", "beneficiary_account_number"]);
    if (details.length) throw validationError(details);
    const result = await paymentService.create(req.user.organization_id, req.body);
    ok(req, res, result, 201);
    return true;
  }

  const idMatch = path.match(/^\/payments\/([^/]+)$/);
  if (idMatch && method === "GET") {
    const pay = await paymentService.getById(idMatch[1], req.user.organization_id);
    ok(req, res, pay);
    return true;
  }

  const holdMatch = path.match(/^\/payments\/([^/]+)\/hold$/);
  if (holdMatch && method === "POST") {
    const details = assertRequired(req.body, ["reason"]);
    if (details.length) throw validationError(details);
    const pay = await paymentService.hold(holdMatch[1], req.user.organization_id, req.body.reason, req.user.id);
    ok(req, res, pay);
    return true;
  }

  const releaseMatch = path.match(/^\/payments\/([^/]+)\/release$/);
  if (releaseMatch && method === "POST") {
    const pay = await paymentService.release(releaseMatch[1], req.user.organization_id, req.user.id);
    ok(req, res, pay);
    return true;
  }

  const cancelMatch = path.match(/^\/payments\/([^/]+)\/cancel$/);
  if (cancelMatch && method === "POST") {
    const pay = await paymentService.cancel(cancelMatch[1], req.user.organization_id, req.user.id);
    ok(req, res, pay);
    return true;
  }

  return false;
}
