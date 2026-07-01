import { transactionRepository } from "./transaction.repository.mjs";
import { notFound } from "../../errors.mjs";
import { eventBus } from "../../core/event-bus.mjs";

class TransactionService {
  constructor(repo = transactionRepository) {
    this.repo = repo;
  }

  async list(organizationId, filters) {
    return this.repo.listPaginated(organizationId, filters);
  }

  async getById(id, organizationId) {
    const txn = await this.repo.find((t) => t.id === id && t.organization_id === organizationId && !t.deleted_at);
    if (!txn) throw notFound("Transaction not found.");
    return txn;
  }

  async create(organizationId, data) {
    const record = {
      id: `txn_${crypto.randomUUID()}`,
      organization_id: organizationId,
      entity_id: data.entity_id || null,
      bank_account_id: data.bank_account_id || null,
      external_id: data.external_id || null,
      amount: Number(data.amount),
      currency: data.currency || "INR",
      base_currency_amount: Number(data.base_currency_amount ?? data.amount),
      exchange_rate: Number(data.exchange_rate ?? 1),
      posted_date: data.posted_date || new Date().toISOString().split("T")[0],
      effective_date: data.effective_date || new Date().toISOString().split("T")[0],
      description: data.description,
      reference: data.reference || null,
      category_id: data.category_id || null,
      category_confidence: data.category_confidence || null,
      vendor_id: data.vendor_id || null,
      customer_id: data.customer_id || null,
      invoice_id: data.invoice_id || null,
      reconciliation_status: data.reconciliation_status || "unreconciled",
      flag_status: data.flag_status || "none",
      flag_reason: data.flag_reason || null,
      risk_score: Number(data.risk_score ?? 0),
      status: data.status || "posted",
      source: data.source || "manual",
      is_split: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const inserted = await this.repo.insert(record);
    eventBus.publish("transaction.created", inserted);
    return inserted;
  }

  async update(id, organizationId, data) {
    const updated = await this.repo.update(
      (t) => t.id === id && t.organization_id === organizationId,
      (t) => {
        Object.assign(t, data, { updated_at: new Date().toISOString() });
      }
    );
    if (!updated) throw notFound("Transaction not found.");
    eventBus.publish("transaction.updated", updated);
    return updated;
  }

  async delete(id, organizationId) {
    const ok = await this.repo.delete((t) => t.id === id && t.organization_id === organizationId);
    if (!ok) throw notFound("Transaction not found.");
    eventBus.publish("transaction.deleted", { id, organizationId });
    return ok;
  }

  async categorize(id, organizationId, categoryId, confidence = 1.0) {
    return this.update(id, organizationId, {
      category_id: categoryId,
      category_confidence: confidence,
    });
  }

  async flag(id, organizationId, flagStatus, reason) {
    return this.update(id, organizationId, {
      flag_status: flagStatus,
      flag_reason: reason,
    });
  }

  async reconcile(id, organizationId, invoiceId) {
    const updated = await this.update(id, organizationId, {
      invoice_id: invoiceId,
      reconciliation_status: "reconciled",
    });
    eventBus.publish("transaction.reconciled", updated);
    return updated;
  }

  async importTransactions(organizationId, list) {
    const imported = [];
    for (const item of list) {
      const txn = await this.create(organizationId, {
        ...item,
        source: "import",
      });
      imported.push(txn);
    }
    eventBus.publish("transaction.imported", { organizationId, count: imported.length });
    return imported;
  }
}

export const transactionService = new TransactionService();
export default transactionService;
