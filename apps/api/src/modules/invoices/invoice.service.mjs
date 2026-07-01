import { invoiceRepository } from "./invoice.repository.mjs";
import { notFound } from "../../errors.mjs";
import { eventBus } from "../../core/event-bus.mjs";

class InvoiceService {
  constructor(repo = invoiceRepository) {
    this.repo = repo;
  }

  async list(organizationId, filters) {
    return this.repo.listPaginated(organizationId, filters);
  }

  async getById(id, organizationId) {
    const inv = await this.repo.find((i) => i.id === id && i.organization_id === organizationId && !i.deleted_at);
    if (!inv) throw notFound("Invoice not found.");
    return inv;
  }

  async uploadAndProcess(organizationId, body) {
    const ocrFields = this.simulateOcr(body.file_name, body.amount);
    const poMatch = this.evaluatePoMatch(ocrFields.po_number);

    const record = {
      id: `inv_${crypto.randomUUID()}`,
      organization_id: organizationId,
      entity_id: body.entity_id || null,
      vendor_id: body.vendor_id || "vnd_1",
      customer_id: null,
      type: "ap",
      invoice_number: ocrFields.invoice_number,
      po_number: ocrFields.po_number,
      invoice_date: ocrFields.invoice_date,
      due_date: ocrFields.due_date,
      received_date: new Date().toISOString().split("T")[0],
      amount: Number(ocrFields.amount),
      tax_amount: Number(ocrFields.amount) * 0.18,
      tax_rate: 0.18,
      currency: ocrFields.currency,
      base_currency_amount: Number(ocrFields.amount),
      exchange_rate: 1,
      description: `OCR processed invoice: ${ocrFields.invoice_number}`,
      status: "pending_approval",
      approval_status: "pending",
      payment_status: "unpaid",
      ocr_confidence: 0.94,
      ocr_raw_data: ocrFields,
      po_match_status: poMatch.status,
      po_match_confidence: poMatch.confidence,
      tax_validation_status: "passed",
      duplicate_check_status: "clean",
      payment_terms: "Net 30",
      early_payment_discount: 0.02,
      early_payment_due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const inserted = await this.repo.insert(record);
    eventBus.publish("invoice.created", inserted);
    return inserted;
  }

  async approve(id, organizationId, userId) {
    const updated = await this.repo.update(
      (i) => i.id === id && i.organization_id === organizationId,
      (i) => {
        i.status = "approved";
        i.approval_status = "approved";
        i.updated_at = new Date().toISOString();
      }
    );
    if (!updated) throw notFound("Invoice not found.");
    eventBus.publish("invoice.approved", { id, organizationId, approved_by: userId });
    return updated;
  }

  async reject(id, organizationId, userId, reason) {
    const updated = await this.repo.update(
      (i) => i.id === id && i.organization_id === organizationId,
      (i) => {
        i.status = "rejected";
        i.approval_status = "rejected";
        i.notes = reason;
        i.updated_at = new Date().toISOString();
      }
    );
    if (!updated) throw notFound("Invoice not found.");
    eventBus.publish("invoice.rejected", { id, organizationId, rejected_by: userId, reason });
    return updated;
  }

  simulateOcr(fileName, userProvidedAmount) {
    const num = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const amt = userProvidedAmount || 250000;
    const poNum = Math.random() > 0.3 ? `PO-1002` : null;

    return {
      invoice_number: num,
      po_number: poNum,
      invoice_date: new Date().toISOString().split("T")[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      amount: amt,
      currency: "INR",
      vendor_name: "Acme Vendor Ltd",
    };
  }

  evaluatePoMatch(poNumber) {
    if (!poNumber) {
      return { status: "no_po", confidence: 0 };
    }
    if (poNumber === "PO-Mismatch") {
      return { status: "partial_mismatch", confidence: 0.45 };
    }
    return { status: "matched", confidence: 0.98 };
  }
}

export const invoiceService = new InvoiceService();
export default invoiceService;
