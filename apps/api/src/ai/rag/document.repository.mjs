import { BaseRepository } from "../../core/repository.mjs";

export class DocumentRepository extends BaseRepository {
  constructor() {
    super("documents");
  }

  async listByOrg(organizationId) {
    return this.list((d) => d.organization_id === organizationId && !d.deleted_at);
  }
}

export const documentRepository = new DocumentRepository();
