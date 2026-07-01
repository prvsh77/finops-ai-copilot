import { transactionService } from "../../modules/transactions/transaction.service.mjs";
import { invoiceService } from "../../modules/invoices/invoice.service.mjs";
import { treasuryService } from "../../modules/payments/treasury.service.mjs";

class ToolRegistry {
  constructor() {
    this.tools = {};
    this.registerDefaults();
  }

  register(name, description, executeFn) {
    this.tools[name] = { name, description, execute: executeFn };
  }

  registerDefaults() {
    this.register("list_transactions", "Retrieve recent ledger transactions", async (orgId) => {
      const list = await transactionService.list(orgId, { per_page: 5 });
      return list.data;
    });

    this.register("get_cash_positions", "Retrieve current cash positioning snapshot across bank accounts", async (orgId) => {
      return treasuryService.getCashPositions(orgId);
    });

    this.register("list_invoices", "Retrieve open AP invoices with status and stage details", async (orgId) => {
      const list = await invoiceService.list(orgId, { status: "pending_approval" });
      return list.data;
    });
  }

  async executeTool(name, orgId, args = {}) {
    const tool = this.tools[name];
    if (!tool) throw new Error(`Tool ${name} not found.`);
    return tool.execute(orgId, args);
  }

  getSchema() {
    return Object.values(this.tools).map((t) => ({
      name: t.name,
      description: t.description,
    }));
  }
}

export const toolRegistry = new ToolRegistry();
export default toolRegistry;
