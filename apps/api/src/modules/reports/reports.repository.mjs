import { BaseRepository } from "../../core/repository.mjs";

export class ReportRepository extends BaseRepository {
  constructor() {
    super("reports");
  }

  async listByOrg(organizationId) {
    return this.list((r) => r.organization_id === organizationId && !r.deleted_at);
  }
}

export const reportRepository = new ReportRepository();
