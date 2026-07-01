import { config } from "./config.mjs";
import { notFound } from "./errors.mjs";
import { noContent, ok } from "./http.mjs";
import { openApi } from "./openapi.mjs";
import { handleAuthRoutes } from "./modules/auth/auth.routes.mjs";
import { handleAdminRoutes } from "./modules/admin/admin.routes.mjs";
import { handleNotificationRoutes } from "./modules/notifications/notification.routes.mjs";
import { handleTransactionRoutes } from "./modules/transactions/transaction.routes.mjs";
import { handleInvoiceRoutes } from "./modules/invoices/invoice.routes.mjs";
import { handlePaymentRoutes } from "./modules/payments/payment.routes.mjs";
import { handleVendorRoutes } from "./modules/vendors/vendor.routes.mjs";
import { handleCustomerRoutes } from "./modules/customers/customer.routes.mjs";
import { handleAiRoutes } from "./ai/routes/ai.routes.mjs";
import { handleIntelligenceRoutes } from "./modules/intelligence/intelligence.routes.mjs";
import { handleReportsRoutes } from "./modules/reports/reports.routes.mjs";

export async function route(req, res) {
  const { method } = req;
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname.replace(/^\/api\/v1/, "") || "/";

  if (method === "OPTIONS") return noContent(res);
  if (method === "GET" && path === "/health") {
    return ok(req, res, { status: "healthy", version: "1.0.0", instance_id: config.instanceId });
  }
  if (method === "GET" && path === "/openapi.json") {
    return ok(req, res, openApi);
  }

  // Delegate to feature routers
  console.log("[ROUTER]", method, path);
  if (await handleAuthRoutes(req, res, method, path)) return;
  if (await handleAdminRoutes(req, res, method, path)) return;
  if (await handleNotificationRoutes(req, res, method, path)) return;
  if (await handleTransactionRoutes(req, res, method, path)) return;
  if (await handleInvoiceRoutes(req, res, method, path)) return;
  if (await handlePaymentRoutes(req, res, method, path)) return;
  if (await handleVendorRoutes(req, res, method, path)) return;
  if (await handleCustomerRoutes(req, res, method, path)) return;
  if (await handleAiRoutes(req, res, method, path)) return;
  if (await handleIntelligenceRoutes(req, res, method, path)) return;
  if (await handleReportsRoutes(req, res, method, path)) return;

  throw notFound();
}
