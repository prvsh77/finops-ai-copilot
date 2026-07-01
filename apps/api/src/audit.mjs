import { randomUUID } from "node:crypto";
import { store } from "./store.mjs";

export function audit({ req, actorId = null, organizationId = null, action, resourceType, resourceId = null, oldValues = null, newValues = null }) {
  const entry = {
    id: `aud_${randomUUID()}`,
    organization_id: organizationId,
    actor_id: actorId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    old_values: oldValues,
    new_values: newValues,
    ip_address: req?.socket?.remoteAddress ?? "local",
    user_agent: req?.headers?.["user-agent"] ?? "unknown",
    correlation_id: req?.correlationId ?? req?.requestId ?? randomUUID(),
    created_at: new Date().toISOString(),
  };
  store.insert("audit_logs", entry);
  return entry;
}
