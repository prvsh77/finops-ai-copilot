import { BaseRepository } from "../../core/repository.mjs";

export class ApiKeyRepository extends BaseRepository {
  constructor() {
    super("api_keys");
  }

  async findActiveByHash(hash) {
    return this.find((key) => key.key_hash === hash && key.status === "active");
  }

  async listByOrganization(organizationId) {
    return this.list((key) => key.organization_id === organizationId);
  }
}

export const apiKeyRepository = new ApiKeyRepository();
