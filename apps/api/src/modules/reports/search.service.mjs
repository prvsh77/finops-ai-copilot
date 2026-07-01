import { transactionRepository } from "../transactions/transaction.repository.mjs";
import { invoiceRepository } from "../invoices/invoice.repository.mjs";
import { paymentRepository } from "../payments/payment.repository.mjs";
import { vendorRepository } from "../vendors/vendor.repository.mjs";
import { customerRepository } from "../customers/customer.repository.mjs";
import { reportRepository } from "./reports.repository.mjs";
import { fraudAlertRepository } from "../intelligence/intelligence.repository.mjs";

class SearchService {
  constructor(
    txnRepo = transactionRepository,
    invRepo = invoiceRepository,
    payRepo = paymentRepository,
    vndRepo = vendorRepository,
    custRepo = customerRepository,
    repRepo = reportRepository,
    fraudRepo = fraudAlertRepository
  ) {
    this.txnRepo = txnRepo;
    this.invRepo = invRepo;
    this.payRepo = payRepo;
    this.vndRepo = vndRepo;
    this.custRepo = custRepo;
    this.repRepo = repRepo;
    this.fraudRepo = fraudRepo;
  }

  async searchAll(organizationId, query) {
    if (!query) return [];
    const q = query.toLowerCase();

    // 1. Gather all collections
    const [txns, invoices, payments, vendors, customers, reports, alerts] = await Promise.all([
      this.txnRepo.list((t) => t.organization_id === organizationId && !t.deleted_at),
      this.invRepo.list((i) => i.organization_id === organizationId && !i.deleted_at),
      this.payRepo.list((p) => p.organization_id === organizationId && !p.deleted_at),
      this.vndRepo.list((v) => v.organization_id === organizationId && !v.deleted_at),
      this.custRepo.list((c) => c.organization_id === organizationId && !c.deleted_at),
      this.repRepo.list((r) => r.organization_id === organizationId && !r.deleted_at),
      this.fraudRepo.list((a) => a.organization_id === organizationId && !a.deleted_at),
    ]);

    const results = [];

    // Search Transactions
    for (const t of txns) {
      if (t.description?.toLowerCase().includes(q) || t.reference?.toLowerCase().includes(q)) {
        results.push({ type: "Transaction", title: t.description, subtitle: `Ref: ${t.reference} | Amount: INR ${t.amount}`, path: "/transactions" });
      }
    }

    // Search Invoices
    for (const i of invoices) {
      if (i.invoice_number?.toLowerCase().includes(q) || i.po_number?.toLowerCase().includes(q)) {
        results.push({ type: "Invoice", title: `Invoice ${i.invoice_number}`, subtitle: `PO Reference: ${i.po_number} | Stage: ${i.stage || i.status}`, path: "/invoices" });
      }
    }

    // Search Payments
    for (const p of payments) {
      if (p.beneficiary_name?.toLowerCase().includes(q) || p.hold_reason?.toLowerCase().includes(q)) {
        results.push({ type: "Payment", title: `Payout to ${p.beneficiary_name}`, subtitle: `Status: ${p.status} | Method: ${p.rail}`, path: "/invoices" }); // payments is tab under invoices
      }
    }

    // Search Vendors & Customers
    for (const v of vendors) {
      if (v.vendor?.toLowerCase().includes(q) || v.category?.toLowerCase().includes(q)) {
        results.push({ type: "Vendor", title: v.vendor, subtitle: `Category: ${v.category} | Spend concentration: preferred`, path: "/vendors" });
      }
    }
    for (const c of customers) {
      if (c.customer?.toLowerCase().includes(q) || c.owner?.toLowerCase().includes(q)) {
        results.push({ type: "Customer", title: c.customer, subtitle: `Segment: ${c.segment} | Owner: ${c.owner}`, path: "/customers" });
      }
    }

    // Search Reports
    for (const r of reports) {
      if (r.report?.toLowerCase().includes(q) || r.content?.toLowerCase().includes(q)) {
        results.push({ type: "Report", title: r.report, subtitle: `AI Statement Brief | Date: ${r.period}`, path: "/reports" });
      }
    }

    // Search Alerts
    for (const a of alerts) {
      if (a.title?.toLowerCase().includes(q) || a.reason?.toLowerCase().includes(q)) {
        results.push({ type: "Fraud Alert", title: a.title, subtitle: `Severity: ${a.severity} | Reason: ${a.reason}`, path: "/fraud-center" });
      }
    }

    return results.slice(0, 15);
  }
}

export const searchService = new SearchService();
export default searchService;
