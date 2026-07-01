import { transactionRepository } from "../transactions/transaction.repository.mjs";
import { invoiceRepository } from "../invoices/invoice.repository.mjs";
import { paymentRepository } from "../payments/payment.repository.mjs";

class ExportService {
  constructor(
    txnRepo = transactionRepository,
    invRepo = invoiceRepository,
    payRepo = paymentRepository
  ) {
    this.txnRepo = txnRepo;
    this.invRepo = invRepo;
    this.payRepo = payRepo;
  }

  async exportData(organizationId, resource, format) {
    let rawList = [];

    if (resource === "transactions") {
      rawList = await this.txnRepo.list((t) => t.organization_id === organizationId && !t.deleted_at);
    } else if (resource === "invoices") {
      rawList = await this.invRepo.list((i) => i.organization_id === organizationId && !i.deleted_at);
    } else if (resource === "payments") {
      rawList = await this.payRepo.list((p) => p.organization_id === organizationId && !p.deleted_at);
    }

    if (format === "json") {
      return {
        contentType: "application/json",
        body: JSON.stringify(rawList, null, 2),
      };
    }

    // Default to CSV
    if (!rawList.length) {
      return {
        contentType: "text/csv",
        body: "id,message\n,No data matches found.",
      };
    }

    const headers = Object.keys(rawList[0]);
    const csvContent = [
      headers.join(","),
      ...rawList.map((row) =>
        headers
          .map((h) => {
            const val = row[h];
            return typeof val === "object" ? `"${JSON.stringify(val).replace(/"/g, '""')}"` : `"${String(val ?? "").replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    return {
      contentType: format === "excel" ? "application/vnd.ms-excel" : "text/csv",
      body: csvContent,
    };
  }
}

export const exportService = new ExportService();
export default exportService;
