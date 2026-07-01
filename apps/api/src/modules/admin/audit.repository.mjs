import { BaseRepository } from "../../core/repository.mjs";

export class AuditRepository extends BaseRepository {
  constructor() {
    super("audit_logs");
  }

  async listByOrganization(organizationId) {
    return this.list((log) => log.organization_id === organizationId);
  }
}

export const auditRepository = new AuditRepository();
