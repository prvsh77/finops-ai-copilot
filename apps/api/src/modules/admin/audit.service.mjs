import { auditRepository } from "./audit.repository.mjs";
import { eventBus } from "../../core/event-bus.mjs";

class AuditService {
  constructor(repo = auditRepository) {
    this.repo = repo;
  }

  async log({ req, actorId, organizationId, action, resourceType, resourceId, oldValues = null, newValues = null }) {
    const record = {
      id: `aud_${crypto.randomUUID()}`,
      organization_id: organizationId,
      actor_id: actorId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: req?.socket?.remoteAddress || "system",
      user_agent: req?.headers?.["user-agent"] || "system",
      created_at: new Date().toISOString(),
    };
    await this.repo.insert(record);

    // Publish event for decoupled processing (e.g. notifications or external syncs)
    eventBus.publish("audit.logged", record);
    return record;
  }

  async list(organizationId) {
    return this.repo.listByOrganization(organizationId);
  }
}

export const auditService = new AuditService();
export default auditService;
