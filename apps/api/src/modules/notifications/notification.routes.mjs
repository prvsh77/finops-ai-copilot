import { notificationService } from "./notification.service.mjs";
import { ok, noContent } from "../../http.mjs";
import { notFound, validationError, unauthorized } from "../../errors.mjs";
import { assertRequired } from "../../../../../packages/shared/src/contracts.mjs";

export async function handleNotificationRoutes(req, res, method, path) {
  const isNotificationPath = path.startsWith("/notifications") || path.startsWith("/notification-preferences");
  if (!isNotificationPath) return false;

  if (!req.user) throw unauthorized();

  if (method === "GET" && path === "/notifications") {
    const list = await notificationService.list(req.user.id, req.user.organization_id);
    ok(req, res, list, 200, { page: 1, per_page: list.length, total: list.length });
    return true;
  }

  const readMatch = path.match(/^\/notifications\/([^/]+)\/read$/);
  if (readMatch && method === "POST") {
    const updated = await notificationService.markAsRead(readMatch[1], req.user.id, req.user.organization_id);
    if (!updated) throw notFound("Notification not found.");
    ok(req, res, updated);
    return true;
  }

  if (method === "GET" && path === "/notification-preferences") {
    const pref = await notificationService.getPreference(req.user.id, req.user.organization_id);
    ok(req, res, pref);
    return true;
  }

  if (method === "PATCH" && path === "/notification-preferences") {
    const pref = await notificationService.updatePreference(req.user.id, req.user.organization_id, req.body);
    ok(req, res, pref);
    return true;
  }

  return false;
}
