import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { config } from "./config.mjs";

const initialData = {
  organizations: [],
  organization_settings: [],
  users: [],
  sessions: [],
  refresh_tokens: [],
  password_reset_tokens: [],
  mfa_tokens: [],
  invitations: [],
  api_keys: [],
  audit_logs: [],
  oauth_connections: [],
  rate_limit_events: [],
  notifications: [],
  notification_preferences: [],
  transactions: [],
  invoices: [],
  payments: [],
  bank_accounts: [],
  budgets: [],
  forecasts: [],
  vendors: [],
  customers: [],
  workflows: [],
  rules: [],
  compliance_controls: [],
  compliance_issues: [],
  evidence_files: [],
  reports: [],
  documents: [],
  ai_conversations: [],
  ai_messages: [],
  ai_agent_runs: [],
};

export class Store {
  constructor(file = config.dataFile) {
    this.file = file;
    this.data = structuredClone(initialData);
  }

  async load() {
    await mkdir(dirname(this.file), { recursive: true });
    try {
      this.data = { ...structuredClone(initialData), ...JSON.parse(await readFile(this.file, "utf8")) };
    } catch {
      await this.save();
    }
  }

  async save() {
    await mkdir(dirname(this.file), { recursive: true });
    await writeFile(this.file, JSON.stringify(this.data, null, 2));
  }

  list(collection) {
    return this.data[collection] ?? [];
  }

  insert(collection, record) {
    this.data[collection].push(record);
    return record;
  }

  update(collection, predicate, updater) {
    const item = this.data[collection].find(predicate);
    if (!item) return null;
    updater(item);
    item.updated_at = new Date().toISOString();
    return item;
  }

  find(collection, predicate) {
    return this.data[collection].find(predicate) ?? null;
  }
}

export const store = new Store();
