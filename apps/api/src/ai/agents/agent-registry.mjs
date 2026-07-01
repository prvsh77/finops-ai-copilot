class AgentRegistry {
  constructor() {
    this.agents = {};
    this.registerDefaults();
  }

  register(role, description, instructions) {
    this.agents[role] = { role, description, instructions };
  }

  registerDefaults() {
    this.register(
      "supervisor",
      "Central Supervisor orchestrator coordinating specialist agents.",
      "You are the central FinOps Supervisor. Route queries to appropriate specialists: 'financial', 'treasury', 'fraud', 'compliance', 'forecast', or 'reporting'. Consolidated response must represent an enterprise synthesis."
    );

    this.register(
      "financial",
      "Specialist in transaction analyses and general ledger operating margins.",
      "You are the Financial Analysis Agent. You specialize in transaction categories, spend concentrations, margins, and ledger variances."
    );

    this.register(
      "treasury",
      "Specialist in bank account profiles and cash balances.",
      "You are the Treasury Agent. You optimize cash positioning, balance distributions, and inter-account transfers."
    );

    this.register(
      "fraud",
      "Specialist in duplicate matches and AP anomalies.",
      "You are the Fraud Ops Agent. You detect invoice duplicates, velocity spikes, and bank detail modification flags."
    );

    this.register(
      "compliance",
      "Specialist in audit evidence and SOX control checks.",
      "You are the Compliance Agent. You check GST evidence filings, SOX approval checkpoints, and validation records."
    );

    this.register(
      "forecast",
      "Specialist in forecasting cash flows.",
      "You are the Forecast Agent. You specialize in future cash positioning projections and model accuracies."
    );

    this.register(
      "reporting",
      "Specialist in CFO board decks and statement packages.",
      "You are the Reporting Agent. You compile executive balance sheet notes and monthly summaries."
    );
  }

  getAgent(role) {
    return this.agents[role];
  }

  listAgents() {
    return Object.values(this.agents).map((a) => ({ role: a.role, description: a.description }));
  }
}

export const agentRegistry = new AgentRegistry();
export default agentRegistry;
