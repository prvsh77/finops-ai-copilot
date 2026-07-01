import { reportsService } from "./reports.service.mjs";
import { searchService } from "./search.service.mjs";
import { exportService } from "./export.service.mjs";
import { ok } from "../../http.mjs";
import { unauthorized, validationError } from "../../errors.mjs";
import { assertRequired } from "../../../../../packages/shared/src/contracts.mjs";

export async function handleReportsRoutes(req, res, method, path) {
  const isReportPath = path.startsWith("/reports") || path.startsWith("/search") || path.startsWith("/export");
  if (!isReportPath) return false;

  if (!req.user) throw unauthorized();

  const url = new URL(req.url, "http://localhost");

  // GET /search
  if (method === "GET" && path === "/search") {
    const q = url.searchParams.get("q") || "";
    const hits = await searchService.searchAll(req.user.organization_id, q);
    ok(req, res, hits);
    return true;
  }

  // GET /export
  if (method === "GET" && path === "/export") {
    const resource = url.searchParams.get("resource") || "transactions";
    const format = url.searchParams.get("format") || "csv";
    const exportResult = await exportService.exportData(req.user.organization_id, resource, format);

    res.writeHead(200, {
      "Content-Type": exportResult.contentType,
      "Content-Disposition": `attachment; filename="${resource}_export.${format === "excel" ? "xls" : format}"`,
    });
    res.end(exportResult.body);
    return true;
  }

  // GET /reports
  if (method === "GET" && path === "/reports") {
    const list = await reportsService.list(req.user.organization_id);
    ok(req, res, list);
    return true;
  }

  // POST /reports/generate
  if (method === "POST" && path === "/reports/generate") {
    const details = assertRequired(req.body, ["type"]);
    if (details.length) throw validationError(details);
    const result = await reportsService.generate(req.user.organization_id, req.body.type, req.user.id);
    ok(req, res, result, 201);
    return true;
  }

  // GET /reports/:id
  const idMatch = path.match(/^\/reports\/([^/]+)$/);
  if (idMatch && method === "GET") {
    const item = await reportsService.getById(idMatch[1], req.user.organization_id);
    ok(req, res, item);
    return true;
  }

  return false;
}
