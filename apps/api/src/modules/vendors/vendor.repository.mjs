import { BaseRepository } from "../../core/repository.mjs";

export class VendorRepository extends BaseRepository {
  constructor() {
    super("vendors");
  }

  async listByOrganization(organizationId) {
    return this.list((v) => v.organization_id === organizationId && !v.deleted_at);
  }
}

export const vendorRepository = new VendorRepository();
