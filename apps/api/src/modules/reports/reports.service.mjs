import { reportRepository } from "./reports.repository.mjs";
import { notFound } from "../../errors.mjs";

class ReportsService {
  constructor(repo = reportRepository) {
    this.repo = repo;
  }

  async list(organizationId) {
    return this.repo.listByOrg(organizationId);
  }

  async getById(id, organizationId) {
    const report = await this.repo.find((r) => r.id === id && r.organization_id === organizationId && !r.deleted_at);
    if (!report) throw notFound("Report not found.");
    return report;
  }

  async generate(organizationId, type, userId) {
    let title = "Executive P&L Summary";
    let summaryText = "AI Consolidated executive summary brief.";

    if (type === "fraud") {
      title = "AI Fraud Scan Audit Log";
      summaryText = "Security audit overview: duplicate transaction checks resolved clean. 1 blocked vendor payment currently held.";
    } else if (type === "forecast") {
      title = "AI 6-Month Cash Projection";
      summaryText = "Projections review: revenue growth projected at +18% based on new mid-market contract sign-offs.";
    } else if (type === "expense") {
      title = "AP Expense Breakdown Pack";
      summaryText = "AP concentration: Cloud hosting operations represent 42% of total June operating costs.";
    } else if (type === "budget") {
      title = "Department Budget Variance Statement";
      summaryText = "Variance highlights: engineering operations are currently tracking 6.2% under baseline budgets.";
    }

    const record = {
      id: `rep_${crypto.randomUUID()}`,
      organization_id: organizationId,
      type,
      report: title,
      owner: "AI Agent",
      period: new Date().toLocaleDateString([], { month: "short", year: "numeric" }),
      status: "Ready",
      updated: "Just now",
      content: summaryText,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    return this.repo.insert(record);
  }
}

export const reportsService = new ReportsService();
export default reportsService;
