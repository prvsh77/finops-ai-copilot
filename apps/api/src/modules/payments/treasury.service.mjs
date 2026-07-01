import crypto from "node:crypto";
import { bankAccountRepository } from "./bankaccount.repository.mjs";
import { notFound, validationError } from "../../errors.mjs";
import { eventBus } from "../../core/event-bus.mjs";

class TreasuryService {
  constructor(repo = bankAccountRepository) {
    this.repo = repo;
  }

  async listAccounts(organizationId) {
    return this.repo.listByOrganization(organizationId);
  }

  async connectAccount(organizationId, data) {
    const record = {
      id: data.id || `acc_${crypto.randomUUID()}`,
      organization_id: organizationId,
      entity_id: data.entity_id || null,
      institution_name: data.institution_name,
      account_type: data.account_type || "checking",
      account_number: data.account_number,
      account_number_hash: crypto.createHash("sha256").update(data.account_number).digest("hex"),
      masked_number: `●●●●${data.account_number.slice(-4)}`,
      routing_number: data.routing_number || null,
      currency: data.currency || "INR",
      balance_current: Number(data.balance_current ?? 0),
      balance_available: Number(data.balance_available ?? data.balance_current ?? 0),
      balance_as_of: new Date().toISOString(),
      status: "active",
      sync_status: "connected",
      sync_provider: "manual",
      is_connection_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const inserted = await this.repo.insert(record);
    eventBus.publish("bank_account.connected", inserted);
    return inserted;
  }

  async transfer(organizationId, sourceId, destId, amount, currency, userId) {
    const source = await this.repo.find((a) => a.id === sourceId && a.organization_id === organizationId);
    const dest = await this.repo.find((a) => a.id === destId && a.organization_id === organizationId);

    if (!source || !dest) throw notFound("Source or destination account not found.");
    if (source.balance_available < amount) {
      throw validationError([{ field: "amount", code: "INSUFFICIENT_FUNDS", message: "Insufficient available balance for transfer." }]);
    }

    // Deduct from source
    await this.repo.update((a) => a.id === sourceId, (a) => {
      a.balance_current = Number(a.balance_current) - amount;
      a.balance_available = Number(a.balance_available) - amount;
      a.updated_at = new Date().toISOString();
    });

    // Add to destination
    await this.repo.update((a) => a.id === destId, (a) => {
      a.balance_current = Number(a.balance_current) + amount;
      a.balance_available = Number(a.balance_available) + amount;
      a.updated_at = new Date().toISOString();
    });

    const txRecord = {
      id: `trf_${crypto.randomUUID()}`,
      organization_id: organizationId,
      source_account_id: sourceId,
      destination_account_id: destId,
      amount,
      currency,
      status: "settled",
      created_by: userId,
      created_at: new Date().toISOString(),
    };

    eventBus.publish("treasury.transfer.completed", txRecord);
    return txRecord;
  }

  async getCashPositions(organizationId) {
    const accounts = await this.listAccounts(organizationId);
    const totalCash = accounts.reduce((acc, a) => acc + Number(a.balance_current), 0);

    return {
      total_cash_equivalent: totalCash,
      accounts: accounts.map((a) => ({
        id: a.id,
        institution_name: a.institution_name,
        masked_number: a.masked_number,
        currency: a.currency,
        balance: a.balance_current,
      })),
      timestamp: new Date().toISOString(),
    };
  }
}

export const treasuryService = new TreasuryService();
export default treasuryService;
