import { BaseRepository } from "../../core/repository.mjs";

export class BankAccountRepository extends BaseRepository {
  constructor() {
    super("bank_accounts");
  }

  async listByOrganization(organizationId) {
    return this.list((acc) => acc.organization_id === organizationId && !acc.deleted_at);
  }
}

export const bankAccountRepository = new BankAccountRepository();
