import { fraudService } from "./fraud.service.mjs";
import { forecastingService } from "./forecasting.service.mjs";
import { summaryService } from "./summary.service.mjs";
import { healthService } from "./health.service.mjs";
import { ok } from "../../http.mjs";
import { unauthorized } from "../../errors.mjs";

export async function handleIntelligenceRoutes(req, res, method, path) {
  const isIntelligencePath = path.startsWith("/intelligence");
  if (!isIntelligencePath) return false;

  if (!req.user) throw unauthorized();

  // GET /intelligence/fraud-alerts
  if (method === "GET" && path === "/intelligence/fraud-alerts") {
    const list = await fraudService.listAlerts(req.user.organization_id);
    ok(req, res, list);
    return true;
  }

  // POST /intelligence/fraud-alerts/scan
  if (method === "POST" && path === "/intelligence/fraud-alerts/scan") {
    const list = await fraudService.runAnalysis(req.user.organization_id);
    ok(req, res, list);
    return true;
  }

  // GET /intelligence/forecasts
  if (method === "GET" && path === "/intelligence/forecasts") {
    const data = await forecastingService.getForecasts(req.user.organization_id);
    ok(req, res, data);
    return true;
  }

  // GET /intelligence/executive-summary
  if (method === "GET" && path === "/intelligence/executive-summary") {
    const summary = await summaryService.generateExecutiveSummary(req.user.organization_id);
    ok(req, res, summary);
    return true;
  }

  // GET /intelligence/financial-health
  if (method === "GET" && path === "/intelligence/financial-health") {
    const health = await healthService.getFinancialHealth(req.user.organization_id);
    ok(req, res, health);
    return true;
  }

  return false;
}
