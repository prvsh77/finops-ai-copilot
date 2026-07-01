import { treasuryService } from "../payments/treasury.service.mjs";
import { invoiceService } from "../invoices/invoice.service.mjs";
import { fraudService } from "./fraud.service.mjs";

class HealthService {
  async getFinancialHealth(organizationId) {
    const cash = await treasuryService.getCashPositions(organizationId);
    const invoices = await invoiceService.list(organizationId, { status: "pending_approval" });
    const alerts = await fraudService.listAlerts(organizationId);

    let score = 85; // baseline

    // Adjustments based on cash position
    if (cash.total_cash_equivalent > 10000000) {
      score += 10;
    } else if (cash.total_cash_equivalent < 1000000) {
      score -= 15;
    }

    // Adjustments based on fraud alerts
    const criticalAlerts = alerts.filter((a) => a.severity === "Critical").length;
    const highAlerts = alerts.filter((a) => a.severity === "High").length;
    score -= (criticalAlerts * 15) + (highAlerts * 5);

    // Adjustments based on open invoices pipeline
    score -= (invoices.data.length * 2);

    // Bound score [0, 100]
    score = Math.max(0, Math.min(100, score));

    let rating = "Average";
    if (score >= 85) rating = "Excellent";
    else if (score >= 70) rating = "Good";
    else if (score >= 50) rating = "Average";
    else rating = "Poor";

    // Build dynamic recommendation cards
    const recommendations = [];
    if (criticalAlerts > 0) {
      recommendations.push({
        id: "rec_1",
        area: "Fraud Control",
        recommendation: "Review suspicious vendors and held payments",
        impact: "Critical risk mitigation",
        severity: "High",
        actionable: true,
      });
    }
    if (invoices.data.length > 3) {
      recommendations.push({
        id: "rec_2",
        area: "Cash Flow",
        recommendation: "Delay low-priority vendor payments",
        impact: "Preserve short-term liquidity reserves",
        severity: "Medium",
        actionable: true,
      });
    }
    if (cash.total_cash_equivalent > 5000000) {
      recommendations.push({
        id: "rec_3",
        area: "Treasury",
        recommendation: "Pay invoices early for early-payment discount capture",
        impact: "Capture early discounts up to 2.5%",
        severity: "Low",
        actionable: true,
      });
    }

    recommendations.push({
      id: "rec_4",
      area: "Procurement",
      recommendation: "Reduce cloud infrastructure vendor concentration",
      impact: "Minimize vendor lock-in risks",
      severity: "Low",
      actionable: false,
    });

    return {
      healthScore: score,
      rating,
      recommendations,
      explanation: `Your financial health score is ${score} (${rating}). This rating reflects solid cash liquidity buffer offsets, despite pending AP approvals and duplicate payment security alerts in verification.`,
    };
  }
}

export const healthService = new HealthService();
export default healthService;
