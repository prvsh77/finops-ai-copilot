class PromptLibrary {
  constructor() {
    this.templates = {};
    this.registerDefaults();
  }

  register(name, template, version = "1.0.0") {
    if (!this.templates[name]) {
      this.templates[name] = [];
    }
    this.templates[name].push({ template, version, updated_at: new Date().toISOString() });
  }

  registerDefaults() {
    this.register(
      "executive_summary",
      "Draft a premium executive CFO brief summarizing month-end P&L, balance sheets, and overall operating margins for Board Review. Keep the tone strategic.",
      "1.0.0"
    );

    this.register(
      "spend_reconciliation",
      "Analyze the transaction list for potential double-billing, velocity anomalies, or unapproved counterparty names. Flag any critical concerns.",
      "1.0.0"
    );

    this.register(
      "compliance_checklist",
      "Review connected AP workflows against standard SOX controls and GST tax guidelines. Enumerate missing documentation requirements.",
      "1.0.0"
    );
  }

  getTemplate(name, version = null) {
    const list = this.templates[name];
    if (!list) return null;
    if (version) {
      return list.find((t) => t.version === version) || list[list.length - 1];
    }
    return list[list.length - 1];
  }

  listTemplates() {
    return Object.keys(this.templates).map((name) => {
      const versions = this.templates[name];
      return {
        name,
        latestVersion: versions[versions.length - 1].version,
        versionsCount: versions.length,
      };
    });
  }
}

export const promptLibrary = new PromptLibrary();
export default promptLibrary;
