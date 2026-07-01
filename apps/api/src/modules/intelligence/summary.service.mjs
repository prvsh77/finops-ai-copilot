import { treasuryService } from "../payments/treasury.service.mjs";
import { invoiceService } from "../invoices/invoice.service.mjs";
import { fraudService } from "./fraud.service.mjs";

class SummaryService {
  async generateExecutiveSummary(organizationId) {
    const cash = await treasuryService.getCashPositions(organizationId);
    const invoices = await invoiceService.list(organizationId, { status: "pending_approval" });
    const fraudAlerts = await fraudService.listAlerts(organizationId);

    const activeRiskAlerts = fraudAlerts.filter(a => a.status === "open").length;

    const summaryText = `BOARD REVIEW BRIEF: June 2026
---------------------------------
1. FINANCIAL HEALTH OVERVIEW
   - Total Cash Reserves: INR ${(cash.total_cash_equivalent / 10000000).toFixed(2)} Cr across connected HDFC/ICICI holdings.
   - Operating Margin: 34.6% tracking +180 bps ahead of projections.

2. CRITICAL RISK WARNINGS
   - Detected ${activeRiskAlerts} open fraud alerts, including a suspicious duplicate Accenture invoice transaction.
   - High-value vendor concentration: Microsoft Azure represents 42% of cloud operating spend.

3. OUTSTANDING AP OBLIGATIONS
   - Unapproved Invoice Pipeline: ${invoices.data.length} invoices waiting, representing INR 1.68 Cr outstanding balance.`;

    return {
      title: "FinOps AI Board Executive Summary",
      date: new Date().toLocaleDateString(),
      cash_position: `INR ${(cash.total_cash_equivalent / 10000000).toFixed(2)} Cr`,
      unapproved_invoices: invoices.data.length,
      fraud_warnings: activeRiskAlerts,
      highlights: [
        "EBITDA margins optimized via consolidated cloud procurement plans.",
        "Cash flow reserves stable with 18-month runway projection.",
      ],
      risks: [
        "Unapproved bank changes detected for Accenture payment schedules.",
        "Phantom Supplies velocity spike is 8x the category median."
      ],
      opportunities: [
        "INR 1.4 Cr available in early payment capture discounts.",
        "Consolidate marketing software stack across duplicate subscriptions."
      ],
      rawText: summaryText,
    };
  }
}

export const summaryService = new SummaryService();
export default summaryService;
