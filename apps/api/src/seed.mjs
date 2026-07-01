import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { audit } from "./audit.mjs";
import { hashPassword } from "./security.mjs";
import { store } from "./store.mjs";

const now = () => new Date().toISOString();

export async function seedDemo() {
  await store.load();
  if (store.list("organizations").length) return;
  const organization = store.insert("organizations", {
    id: "org_demo",
    name: "Tech Synapse Pro Ltd",
    slug: "tech-synapse-pro",
    status: "active",
    plan: "enterprise",
    base_currency: "INR",
    timezone: "Asia/Kolkata",
    fiscal_year_start_month: 4,
    onboarding_completed: true,
    mfa_enforced: false,
    deleted_at: null,
    created_at: now(),
    updated_at: now(),
  });
  store.insert("organization_settings", {
    id: "set_demo",
    organization_id: organization.id,
    security: { require_mfa: false, session_timeout_minutes: 60, password_min_length: 12 },
    created_at: now(),
    updated_at: now(),
  });
  const users = [
    ["usr_admin", "arjun@techsynapse.example", "Arjun", "Mehra", "admin"],
    ["usr_controller", "meera@techsynapse.example", "Meera", "Iyer", "auditor"],
    ["usr_accountant", "priya@techsynapse.example", "Priya", "Nair", "accountant"],
  ];
  for (const [id, email, first, last, role] of users) {
    store.insert("users", {
      id,
      organization_id: organization.id,
      email,
      password_hash: hashPassword("SecurePass123!"),
      first_name: first,
      last_name: last,
      role,
      status: "active",
      failed_login_attempts: 0,
      locked_until: null,
      mfa_enabled: false,
      mfa_secret: null,
      deleted_at: null,
      created_at: now(),
      updated_at: now(),
    });
  }
  const notifications = [
    {
      id: "not_1",
      organization_id: organization.id,
      user_id: "usr_admin",
      type: "Approval",
      message: "Accenture invoice requires CFO approval",
      priority: "High",
      status: "Unread",
      created_at: now(),
    },
    {
      id: "not_2",
      organization_id: organization.id,
      user_id: "usr_admin",
      type: "Fraud",
      message: "Duplicate payment model detected risk",
      priority: "Critical",
      status: "Unread",
      created_at: now(),
    },
    {
      id: "not_3",
      organization_id: organization.id,
      user_id: "usr_admin",
      type: "Report",
      message: "Monthly CFO Pack is ready",
      priority: "Medium",
      status: "Read",
      created_at: now(),
    },
    {
      id: "not_4",
      organization_id: organization.id,
      user_id: "usr_admin",
      type: "Compliance",
      message: "GST evidence requested",
      priority: "High",
      status: "Unread",
      created_at: now(),
    }
  ];
  for (const n of notifications) {
    store.insert("notifications", n);
  }

  // Seed Vendors
  const vendorsList = [
    { id: "vnd_1", organization_id: organization.id, vendor: "Microsoft Azure", category: "Cloud", spend: 4140000, risk: "Low", score: 92, status: "Preferred" },
    { id: "vnd_2", organization_id: organization.id, vendor: "Accenture Services", category: "Consulting", spend: 8120000, risk: "Medium", score: 78, status: "Active" },
    { id: "vnd_3", organization_id: organization.id, vendor: "Phantom Supplies Ltd", category: "Procurement", spend: 1240000, risk: "Critical", score: 31, status: "Blocked" },
    { id: "vnd_4", organization_id: organization.id, vendor: "Salesforce CRM", category: "SaaS", spend: 2352000, risk: "Low", score: 88, status: "Active" },
    { id: "vnd_5", organization_id: organization.id, vendor: "Deloitte India", category: "Audit", spend: 3760000, risk: "Low", score: 84, status: "Active" }
  ];
  for (const v of vendorsList) {
    store.insert("vendors", v);
  }

  // Seed Customers
  const customersList = [
    { id: "cust_1", organization_id: organization.id, customer: "Nexus Retail Group", segment: "Enterprise", arr: 67200000, health: "Excellent", invoices: 18, owner: "Asha Menon" },
    { id: "cust_2", organization_id: organization.id, customer: "Orion Manufacturing", segment: "Enterprise", arr: 43800000, health: "Good", invoices: 11, owner: "Vikram Bose" },
    { id: "cust_3", organization_id: organization.id, customer: "Zenith Health", segment: "Mid Market", arr: 21600000, health: "Watch", invoices: 9, owner: "Neha Kapoor" },
    { id: "cust_4", organization_id: organization.id, customer: "Metro Logistics", segment: "Enterprise", arr: 51200000, health: "Excellent", invoices: 14, owner: "Aman Gupta" },
    { id: "cust_5", organization_id: organization.id, customer: "Aster Foods", segment: "Mid Market", arr: 14400000, health: "Good", invoices: 7, owner: "Ira Thomas" }
  ];
  for (const c of customersList) {
    store.insert("customers", c);
  }

  // Seed Bank Accounts
  const accountsList = [
    { id: "acc_1", organization_id: organization.id, institution_name: "HDFC Operating", account_type: "checking", account_number: "98765432101", account_number_hash: "hash_hdfc", masked_number: "●●●●2101", routing_number: "HDFC0000001", currency: "INR", balance_current: 24500000, balance_available: 24500000, balance_as_of: now(), status: "active", sync_status: "connected", sync_provider: "plaid", is_connection_active: true },
    { id: "acc_2", organization_id: organization.id, institution_name: "ICICI Payroll", account_type: "checking", account_number: "98765432102", account_number_hash: "hash_icici", masked_number: "●●●●2102", routing_number: "ICIC0000002", currency: "INR", balance_current: 5600000, balance_available: 5600000, balance_as_of: now(), status: "active", sync_status: "connected", sync_provider: "plaid", is_connection_active: true },
    { id: "acc_3", organization_id: organization.id, institution_name: "Axis AP", account_type: "checking", account_number: "98765432103", account_number_hash: "hash_axis", masked_number: "●●●●2103", routing_number: "UTIB0000003", currency: "INR", balance_current: 8200000, balance_available: 8200000, balance_as_of: now(), status: "active", sync_status: "connected", sync_provider: "plaid", is_connection_active: true },
    { id: "acc_4", organization_id: organization.id, institution_name: "SBI Collections", account_type: "checking", account_number: "98765432104", account_number_hash: "hash_sbi", masked_number: "●●●●2104", routing_number: "SBIN0000004", currency: "INR", balance_current: 12500000, balance_available: 12500000, balance_as_of: now(), status: "active", sync_status: "connected", sync_provider: "plaid", is_connection_active: true }
  ];
  for (const a of accountsList) {
    store.insert("bank_accounts", a);
  }

  // Seed Invoices
  const invoicesList = [
    { id: "INV-2026-0892", organization_id: organization.id, vendor_id: "vnd_2", type: "ap", invoice_number: "INV-2026-0892", po_number: "PO-1002", invoice_date: now().split("T")[0], due_date: "2026-07-04", received_date: now().split("T")[0], amount: 845200, tax_amount: 152136, currency: "INR", base_currency_amount: 845200, status: "pending_approval", approval_status: "pending", payment_status: "unpaid", ocr_confidence: 0.96, po_match_status: "matched", po_match_confidence: 0.98, tax_validation_status: "passed", duplicate_check_status: "clean" },
    { id: "INV-2026-0891", organization_id: organization.id, vendor_id: "vnd_1", type: "ap", invoice_number: "INV-2026-0891", po_number: "PO-1002", invoice_date: now().split("T")[0], due_date: "2026-07-07", received_date: now().split("T")[0], amount: 345000, tax_amount: 62100, currency: "INR", base_currency_amount: 345000, status: "pending_approval", approval_status: "pending", payment_status: "unpaid", ocr_confidence: 0.94, po_match_status: "matched", po_match_confidence: 0.95, tax_validation_status: "passed", duplicate_check_status: "clean" },
    { id: "INV-2026-0890", organization_id: organization.id, vendor_id: "vnd_3", type: "ap", invoice_number: "INV-2026-0890", po_number: "PO-Mismatch", invoice_date: now().split("T")[0], due_date: "2026-07-08", received_date: now().split("T")[0], amount: 296000, tax_amount: 53280, currency: "INR", base_currency_amount: 296000, status: "pending_approval", approval_status: "pending", payment_status: "unpaid", ocr_confidence: 0.88, po_match_status: "partial_mismatch", po_match_confidence: 0.45, tax_validation_status: "passed", duplicate_check_status: "clean" },
    { id: "INV-2026-0889", organization_id: organization.id, vendor_id: "vnd_4", type: "ap", invoice_number: "INV-2026-0889", po_number: "PO-1002", invoice_date: now().split("T")[0], due_date: "2026-07-12", received_date: now().split("T")[0], amount: 196000, tax_amount: 35280, currency: "INR", base_currency_amount: 196000, status: "approved", approval_status: "approved", payment_status: "unpaid", ocr_confidence: 0.95, po_match_status: "matched", po_match_confidence: 0.97, tax_validation_status: "passed", duplicate_check_status: "clean" }
  ];
  for (const i of invoicesList) {
    store.insert("invoices", i);
  }

  // Seed Transactions
  const transactionsList = [
    { id: "txn_1", organization_id: organization.id, bank_account_id: "acc_1", external_id: "ext_1", amount: -345000, currency: "INR", base_currency_amount: -345000, exchange_rate: 1, posted_date: "2026-06-28", effective_date: "2026-06-28", description: "Payment to Microsoft Azure", reference: "TXN-92481", category_id: "cat_1", category_confidence: 0.98, vendor_id: "vnd_1", customer_id: null, invoice_id: null, reconciliation_status: "unreconciled", flag_status: "none", flag_reason: null, risk_score: 0.01, status: "posted", source: "bank_sync" },
    { id: "txn_2", organization_id: organization.id, bank_account_id: "acc_2", external_id: "ext_2", amount: -18240000, currency: "INR", base_currency_amount: -18240000, exchange_rate: 1, posted_date: "2026-06-28", effective_date: "2026-06-28", description: "Employee Payroll Batch", reference: "TXN-92480", category_id: "cat_2", category_confidence: 1.0, vendor_id: null, customer_id: null, invoice_id: null, reconciliation_status: "unreconciled", flag_status: "none", flag_reason: null, risk_score: 0.0, status: "posted", source: "bank_sync" },
    { id: "txn_3", organization_id: organization.id, bank_account_id: "acc_3", external_id: "ext_3", amount: -1240000, currency: "INR", base_currency_amount: -1240000, exchange_rate: 1, posted_date: "2026-06-27", effective_date: "2026-06-27", description: "Phantom Supplies Ltd AP", reference: "TXN-92479", category_id: "cat_3", category_confidence: 0.44, vendor_id: "vnd_3", customer_id: null, invoice_id: null, reconciliation_status: "unreconciled", flag_status: "flagged", flag_reason: "High velocity anomaly", risk_score: 0.89, status: "posted", source: "bank_sync" },
    { id: "txn_4", organization_id: organization.id, bank_account_id: "acc_1", external_id: "ext_4", amount: -196000, currency: "INR", base_currency_amount: -196000, exchange_rate: 1, posted_date: "2026-06-26", effective_date: "2026-06-26", description: "Salesforce India", reference: "TXN-92478", category_id: "cat_4", category_confidence: 0.95, vendor_id: "vnd_4", customer_id: null, invoice_id: null, reconciliation_status: "unreconciled", flag_status: "none", flag_reason: null, risk_score: 0.05, status: "posted", source: "bank_sync" },
    { id: "txn_5", organization_id: organization.id, bank_account_id: "acc_4", external_id: "ext_5", amount: 5600000, currency: "INR", base_currency_amount: 5600000, exchange_rate: 1, posted_date: "2026-06-25", effective_date: "2026-06-25", description: "Nexus Retail Group collections", reference: "TXN-92477", category_id: "cat_5", category_confidence: 0.99, vendor_id: null, customer_id: "cust_1", invoice_id: null, reconciliation_status: "unreconciled", flag_status: "none", flag_reason: null, risk_score: 0.0, status: "posted", source: "bank_sync" },
    { id: "txn_6", organization_id: organization.id, bank_account_id: "acc_3", external_id: "ext_6", amount: -845200, currency: "INR", base_currency_amount: -845200, exchange_rate: 1, posted_date: "2026-06-24", effective_date: "2026-06-24", description: "Accenture Services consulting", reference: "TXN-92476", category_id: "cat_6", category_confidence: 0.88, vendor_id: "vnd_2", customer_id: null, invoice_id: null, reconciliation_status: "unreconciled", flag_status: "none", flag_reason: null, risk_score: 0.12, status: "posted", source: "bank_sync" }
  ];
  for (const t of transactionsList) {
    store.insert("transactions", t);
  }

  // Seed Payments
  const paymentsList = [
    { id: "pay_1", organization_id: organization.id, vendor_id: "vnd_2", invoice_id: "INV-2026-0892", amount: 845200, currency: "INR", rail: "wire", beneficiary_name: "Accenture Services", beneficiary_account_number: "●●●●9876", status: "pending", created_at: now() },
    { id: "pay_2", organization_id: organization.id, vendor_id: "vnd_3", invoice_id: "INV-2026-0890", amount: 1240000, currency: "INR", rail: "ach", beneficiary_name: "Phantom Supplies Ltd", beneficiary_account_number: "●●●●1122", status: "held", hold_reason: "High risk score verification pending", created_at: now() }
  ];
  for (const p of paymentsList) {
    store.insert("payments", p);
  }

  // Seed Documents for RAG
  const documentsList = [
    {
      id: "doc_1",
      organization_id: organization.id,
      title: "SOX Compliance for Accounts Payable",
      content: "All payments exceeding INR 50L require dual CFO and Controller approvals. Split invoicing to bypass approval limits is strictly audited and flagged. Vendor bank details modifications must be verified through out-of-band communication prior to payment release. Late-night invoice approvals (after 10 PM) are automatically flagged for control review.",
      source_url: "https://compliance.acme.corp/sox-404",
      chunks: [
        {
          id: "0",
          text: "All payments exceeding INR 50L require dual CFO and Controller approvals. Split invoicing to bypass approval limits is strictly audited and flagged."
        },
        {
          id: "1",
          text: "Vendor bank details modifications must be verified through out-of-band communication prior to payment release. Late-night invoice approvals (after 10 PM) are automatically flagged for control review."
        }
      ],
      created_at: now(),
      updated_at: now(),
      deleted_at: null
    },
    {
      id: "doc_2",
      organization_id: organization.id,
      title: "FinOps Cash Runway and Treasury Management Guidelines",
      content: "Corporate treasury target is to maintain a minimum of 12 months cash runway. Standard operating procedure requires rolling 20% of surplus working capital into short-term liquid yields (e.g. 30-day term deposits). HDFC Operating is designated as the primary accounts payable account, while Axis AP handles payroll batches.",
      source_url: "https://treasury.acme.corp/runway-policy",
      chunks: [
        {
          id: "0",
          text: "Corporate treasury target is to maintain a minimum of 12 months cash runway. Standard operating procedure requires rolling 20% of surplus working capital into short-term liquid yields (e.g. 30-day term deposits)."
        },
        {
          id: "1",
          text: "HDFC Operating is designated as the primary accounts payable account, while Axis AP handles payroll batches."
        }
      ],
      created_at: now(),
      updated_at: now(),
      deleted_at: null
    }
  ];
  for (const d of documentsList) {
    store.insert("documents", d);
  }

  audit({ actorId: "system", organizationId: organization.id, action: "seed.demo.created", resourceType: "organization", resourceId: organization.id });
  await store.save();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await seedDemo();
  console.log("Seed data installed.");
}
