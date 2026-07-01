import { paymentRepository } from "./payment.repository.mjs";
import { notFound } from "../../errors.mjs";
import { eventBus } from "../../core/event-bus.mjs";

class PaymentService {
  constructor(repo = paymentRepository) {
    this.repo = repo;
  }

  async list(organizationId, filters) {
    return this.repo.listPaginated(organizationId, filters);
  }

  async getById(id, organizationId) {
    const pay = await this.repo.find((p) => p.id === id && p.organization_id === organizationId && !p.deleted_at);
    if (!pay) throw notFound("Payment not found.");
    return pay;
  }

  async create(organizationId, data) {
    const record = {
      id: `pay_${crypto.randomUUID()}`,
      organization_id: organizationId,
      entity_id: data.entity_id || null,
      batch_id: data.batch_id || null,
      vendor_id: data.vendor_id || null,
      invoice_id: data.invoice_id || null,
      amount: Number(data.amount),
      currency: data.currency || "INR",
      base_currency_amount: Number(data.base_currency_amount ?? data.amount),
      exchange_rate: Number(data.exchange_rate ?? 1),
      rail: data.rail || "ach",
      beneficiary_name: data.beneficiary_name,
      beneficiary_account_number: data.beneficiary_account_number,
      beneficiary_routing_number: data.beneficiary_routing_number || null,
      beneficiary_bank_name: data.beneficiary_bank_name || null,
      remittance_advice: data.remittance_advice || null,
      memo: data.memo || null,
      status: data.status || "pending",
      dual_control_status: "not_required",
      hold_reason: null,
      hold_released_by: null,
      hold_released_at: null,
      error_message: null,
      retry_count: 0,
      max_retries: 3,
      external_payment_id: null,
      scheduled_date: data.scheduled_date || null,
      released_at: null,
      settled_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const inserted = await this.repo.insert(record);
    eventBus.publish("payment.created", inserted);
    return inserted;
  }

  async hold(id, organizationId, reason, userId) {
    const updated = await this.repo.update(
      (p) => p.id === id && p.organization_id === organizationId,
      (p) => {
        p.status = "held";
        p.hold_reason = reason;
        p.updated_at = new Date().toISOString();
      }
    );
    if (!updated) throw notFound("Payment not found.");
    eventBus.publish("payment.held", { id, organizationId, held_by: userId, reason });
    return updated;
  }

  async release(id, organizationId, userId) {
    const updated = await this.repo.update(
      (p) => p.id === id && p.organization_id === organizationId,
      (p) => {
        p.status = "released";
        p.hold_released_by = userId;
        p.hold_released_at = new Date().toISOString();
        p.released_at = new Date().toISOString();
        p.updated_at = new Date().toISOString();
      }
    );
    if (!updated) throw notFound("Payment not found.");
    eventBus.publish("payment.released", { id, organizationId, released_by: userId });
    return updated;
  }

  async cancel(id, organizationId, userId) {
    const updated = await this.repo.update(
      (p) => p.id === id && p.organization_id === organizationId,
      (p) => {
        p.status = "cancelled";
        p.updated_at = new Date().toISOString();
      }
    );
    if (!updated) throw notFound("Payment not found.");
    eventBus.publish("payment.cancelled", { id, organizationId, cancelled_by: userId });
    return updated;
  }
}

export const paymentService = new PaymentService();
export default paymentService;
