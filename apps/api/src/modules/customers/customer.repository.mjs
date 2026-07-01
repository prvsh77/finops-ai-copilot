import { BaseRepository } from "../../core/repository.mjs";

export class CustomerRepository extends BaseRepository {
  constructor() {
    super("customers");
  }

  async listByOrganization(organizationId) {
    return this.list((c) => c.organization_id === organizationId && !c.deleted_at);
  }
}

export const customerRepository = new CustomerRepository();
