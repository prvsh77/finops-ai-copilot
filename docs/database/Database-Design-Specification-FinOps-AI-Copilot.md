# Enterprise Database Design Specification

## FinOps AI Copilot — Enterprise AI Financial Intelligence Platform

---

## Document Control

| Field | Value |
|---|---|
| **Document ID** | DB-FINCOPS-005 |
| **Document Title** | Enterprise Database Design Specification |
| **Version** | 1.0 |
| **Status** | Final |
| **Author** | Database Architecture & Data Engineering Team |
| **Date** | 2026-06-30 |
| **Classification** | Internal — Confidential |
| **Approval Required** | VP Engineering, Lead Architect, CTO |

---

## Table of Contents

1. [Database Philosophy](#1-database-philosophy)
2. [High-Level Database Architecture](#2-high-level-database-architecture)
3. [Database Domains & Bounded Contexts](#3-database-domains--bounded-contexts)
4. [Complete Entity Catalog](#4-complete-entity-catalog)
5. [Complete Table Specification](#5-complete-table-specification)
6. [Relationships & ER Design](#6-relationships--er-design)
7. [Multi-Tenant Strategy](#7-multi-tenant-strategy)
8. [Financial Data Model](#8-financial-data-model)
9. [AI Data Model](#9-ai-data-model)
10. [Workflow Data Model](#10-workflow-data-model)
11. [Rule Engine Data Model](#11-rule-engine-data-model)
12. [Audit Model](#12-audit-model)
13. [Analytics Model](#13-analytics-model)
14. [Performance Strategy](#14-performance-strategy)
15. [Security](#15-security)
16. [Event Model](#16-event-model)
17. [Data Lifecycle](#17-data-lifecycle)
18. [Backup & Disaster Recovery Strategy](#18-backup--disaster-recovery-strategy)
19. [Data Dictionary](#19-data-dictionary)
20. [Database Folder Structure](#20-database-folder-structure)

---

## 1. Database Philosophy

### 1.1 Why PostgreSQL

PostgreSQL is the chosen primary relational database for the following architectural reasons:

| Factor | Rationale |
|---|---|
| **ACID Compliance** | Full ACID compliance (Atomicity, Consistency, Isolation, Durability) is non-negotiable for financial data. PostgreSQL provides SERIALIZABLE isolation for critical financial transactions. |
| **Financial Integrity** | Built-in support for NUMERIC(38,8) precision, CHECK constraints, deferrable constraints, and exclusion constraints ensure financial data never silently corrupts. |
| **Multi-Tenancy** | Row-Level Security (RLS), tenant-scoped indexes, and schema-level isolation provide flexible multi-tenant architecture. |
| **Extensibility** | Extensions for full-text search (pg_trgm), partitioning (pg_partman), vector search (pgvector), auditing (pgaudit), and statistical aggregations. |
| **Performance** | Parallel query execution, BRIN indexes for time-series, covering indexes, expression indexes, and materialized views. |
| **Data Integrity** | Foreign keys with ON RESTRICT, ON CASCADE policies, check constraints, unique constraints, and exclusion constraints. |
| **Community & Enterprise** | 30+ years of maturity, strong enterprise tooling (Patroni, pgBackRest, PgBouncer), and widespread PostgreSQL expertise. |

### 1.2 Transaction Strategy

| Transaction Type | Isolation Level | Retry Strategy | Notes |
|---|---|---|---|
| **Financial Posting** | SERIALIZABLE | Max 3 retries with exponential backoff | Journal entries, payments, reconciliations |
| **CRUD Operations** | READ COMMITTED | Optimistic locking (row version) | Standard create/read/update/delete |
| **Reporting & Analytics** | READ ONLY, SNAPSHOT ISOLATION | N/A | Long-running queries, materialized view refreshes |
| **Bulk Imports** | READ COMMITTED, batch-sized commits | Idempotency keys prevent duplicates | Transaction imports, invoice batches |
| **AI Operations** | READ COMMITTED | N/A | Read-heavy, write-later pattern |

### 1.3 ACID Requirements

| Property | Implementation |
|---|---|
| **Atomicity** | All financial mutations wrapped in BEGIN/COMMIT/ROLLBACK. Idempotency keys prevent duplicate processing. Two-phase commit for distributed transactions when performing cross-service operations. |
| **Consistency** | CHECK constraints on all financial columns (amount > 0, balanced journal entries). DEFERRABLE constraints for circular references (e.g., account hierarchies). Trigger-based validation for complex business rules. |
| **Isolation** | SERIALIZABLE for payment and journal posting. Explicit table-level locks for period close operations. SKIP LOCKED for worker queues to prevent contention. |
| **Durability** | synchronous_commit = on for financial transactions. WAL archiving to S3. Multi-AZ replication with synchronous standby for Regulated Enterprise. |

### 1.4 Financial Data Integrity Guarantees

| Guarantee | Mechanism |
|---|---|
| **No silent data loss** | CHECK constraints, NOT NULL constraints, foreign keys |
| **No unbalanced entries** | Trigger-enforced debits = credits on journal entries |
| **No orphaned financial records** | CASCADE/RESTRICT foreign keys on all financial tables |
| **No duplicate payments** | Unique composite indexes + application-level idempotency keys |
| **No transaction modification after posting** | Status-based immutability (posted = immutable) |
| **No period crossing** | Period validation triggers on posting |
| **Audit trail completeness** | Trigger-based audit logging on all financial mutations |

### 1.5 Multi-Tenancy Strategy

| Tenancy Model | Description | Target |
|---|---|---|
| **Shared Table + RLS** | All tenants share same table. `organization_id` column + Row-Level Security policy. | Starter, Growth plans |
| **Schema per Tenant** | Each tenant gets a dedicated schema within shared database. | Enterprise plan |
| **Database per Tenant** | Each tenant gets a dedicated database on shared cluster. | Regulated Enterprise plan |
| **Dedicated Cluster** | Tenant gets isolated database cluster. | Highest compliance customers |

### 1.6 Data Ownership Principles

- **Organization owns all its data.** Every record belongs to exactly one organization.
- **Users are per-organization.** A user may exist in multiple organizations (separate records).
- **Entities are per-organization.** Legal entities, subsidiaries, departments.
- **System data is global.** Feature flags, connector definitions, prompt templates.
- **No cross-tenant references.** Foreign keys never cross organization boundaries.
- **Soft deletes preserve ownership.** Deleted records retain organization_id for audit.

### 1.7 Event Sourcing Considerations

| Decision | Rationale |
|---|---|
| **Not full event sourcing** | Event sourcing adds significant complexity for financial systems. Current balance computation would require replaying all events on every read. |
| **Domain events + current state** | Domain events (via LISTEN/NOTIFY or outbox pattern) for cross-service communication. Current state stored in normalized tables. |
| **Audit events as append-only log** | Separate `audit_logs` table for immutable trail. Not used for state reconstruction. |
| **Future CQRS readiness** | Domain events can feed into read-model materialized views and analytics warehouse. |

### 1.8 CQRS Readiness

| Component | Current State | CQRS Future |
|---|---|---|
| **Commands** | Direct writes to normalized tables | Retained as-is |
| **Queries** | Direct reads from normalized tables | Migrate to read-optimized views/warehouse |
| **Materialized Views** | Refresh on schedule or on demand | Event-driven refresh |
| **Reporting** | Direct PostgreSQL queries | Migrate to warehouse |
| **Analytics** | Direct PostgreSQL queries | Migrate to OLAP cube |
| **AI Retrieval** | Hybrid search over PostgreSQL + Vector DB | Dedicated search service |

### 1.9 Scalability Strategy

| Dimension | Strategy |
|---|---|
| **Read Scaling** | Read replicas (1-3 per primary). Application routes read queries to replicas. |
| **Write Scaling** | Vertical scaling first (larger instances). Horizontal sharding if needed (by organization_id hash). |
| **Data Volume** | Table partitioning by month for transactions, audit logs, AI messages. Archival to cold storage after retention period. |
| **Connection Scaling** | PgBouncer connection pooler. Application-side connection limits (max 20 per service instance). |
| **Query Scaling** | Materialized views for dashboard KPIs. Caching layer (Redis) for hot data. |
| **Index Scaling** | Regular index maintenance (REINDEX, VACUUM). Monitoring for unused/bloated indexes. |

---

## 2. High-Level Database Architecture

### 2.1 Storage Architecture Diagram

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                              APPLICATION LAYER                                │
│                                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ API      │ │ Worker   │ │ AI       │ │ Scheduler│ │ Integration      │  │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │ │ Service          │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────┬──────────┘  │
│       │            │            │            │              │              │
└───────┼────────────┼────────────┼────────────┼──────────────┼──────────────┘
        │            │            │            │              │
        ▼            ▼            ▼            ▼              ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           DATA ACCESS LAYER                                   │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ PgBouncer    │  │ Redis Cache  │  │ Connection   │  │ Message Queue    │ │
│  │ (Connection  │  │ (Session,    │  │ Pool (App    │  │ (RabbitMQ/       │ │
│  │  Pooling)    │  │  Cache,      │  │  Side)       │  │  Temporal)       │ │
│  │              │  │  Rate Limit) │  │              │  │                  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘ │
└─────────┼─────────────────┼─────────────────┼────────────────────┼──────────┘
          │                 │                 │                    │
          ▼                 ▼                 │                    │
┌─────────────────────────────────────────────┴────────────────────┴──────────┐
│                            PRIMARY STORAGE LAYER                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     PostgreSQL Primary                               │    │
│  │  ┌──────────────────────────────────────────────┐                  │    │
│  │  │  Operational Data                             │                  │    │
│  │  │  ┌─────────┐ ┌──────────┐ ┌───────────────┐ │                  │    │
│  │  │  │ Finance │ │ Identity │ │ Compliance    │ │                  │    │
│  │  │  │ Core    │ │ & Org    │ │ & Audit      │ │                  │    │
│  │  │  └─────────┘ └──────────┘ └───────────────┘ │                  │    │
│  │  ├──────────────────────────────────────────────┤                  │    │
│  │  │  AI & Workflow Data                          │                  │    │
│  │  │  ┌─────────┐ ┌──────────┐ ┌───────────────┐ │                  │    │
│  │  │  │ AI      │ │ Workflow │ │ Rule Engine   │ │                  │    │
│  │  │  │ Service │ │ Engine   │ │               │ │                  │    │
│  │  │  └─────────┘ └──────────┘ └───────────────┘ │                  │    │
│  │  └──────────────────────────────────────────────┘                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────┐  ┌───────────────────────┐ │
│  │  PostgreSQL Read Replicas (1-3)             │  │  Redis               │ │
│  │  - Reporting queries                        │  │  - Session store     │ │
│  │  - Analytics queries                        │  │  - Rate limits       │ │
│  │  - Materialized view refreshes              │  │  - Cache (KPI data)  │ │
│  │  - Export jobs                              │  │  - Queue (BullMQ)    │ │
│  └─────────────────────────────────────────────┘  │  - WebSocket pub/sub │ │
│                                                    └───────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           SPECIALIZED STORAGE                                 │
│                                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────────────┐  │
│  │ Vector Database │  │ Object Storage  │  │    Data Warehouse            │  │
│  │ (Qdrant/Pinecone)│  │ (S3/Blob/GCS)  │  │    (Snowflake/BigQuery)     │  │
│  │                 │  │                 │  │                              │  │
│  │ - Embeddings    │  │ - Documents    │  │ - Executive analytics        │  │
│  │ - Document      │  │ - Reports      │  │ - Historical trends          │  │
│  │   chunks        │  │ - Statements   │  │ - ML feature generation      │  │
│  │ - Semantic      │  │ - Invoices     │  │ - BI tool queries            │  │
│  │   search        │  │ - Backups      │  │                              │  │
│  │ - AI context    │  │ - Audit exports│  │ - CDC from PostgreSQL        │  │
│  └────────────────┘  └────────────────┘  └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Architecture

```text
Write Path:
  Client ──► API ──► Validation ──► Idempotency Check ──► PostgreSQL Primary
                │                                              │
                └──► Domain Event ──► Queue ──► Workers ───────┘
                                                      │
                                                      ├──► Redis Cache Invalidation
                                                      ├──► Notification Dispatch
                                                      ├──► Vector DB Update
                                                      └──► Audit Log Write

Read Path (Operational):
  Client ──► API ──► Permission Check ──► Cache (Redis hit?) ──► PostgreSQL (miss)
                                                        │
                                                        └──► Response + Cache Set

Read Path (Analytics):
  Client ──► API ──► Permission Check ──► Read Replica ──► Response

Batch Path:
  Scheduler ──► Worker ──► PostgreSQL (read) ──► Transform ──► Warehouse
                                                         │
                                                         ├──► Report Generation
                                                         └──► Object Storage
```

### 2.3 Storage Layer Responsibilities

| Layer | Technology | Purpose | Data Volume Estimate |
|---|---|---|---|
| **Operational Database** | PostgreSQL | All transactional data, user data, financial records | 10-100 TB per tenant cluster |
| **Read Replicas** | PostgreSQL | Reporting queries, dashboard data, exports | Same as primary, stale-tolerant |
| **Cache Layer** | Redis | Session data, rate limits, hot KPI data, queues | 10-100 GB |
| **Vector Database** | Qdrant / Pinecone | Document embeddings, semantic search, AI context | 1-10 TB |
| **Object Storage** | S3-compatible | Documents, reports, invoices, backups, audit exports | 100 TB+ |
| **Data Warehouse** | Snowflake / BigQuery | Executive analytics, historical trends, ML features | 500 TB+ |
| **Search Index** | OpenSearch / Meilisearch | Full-text search across transactions, invoices, vendors | 1-10 TB |

---

## 3. Database Domains & Bounded Contexts

### 3.1 Domain Map

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FINOPS AI COPILOT DOMAIN MAP                        │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │   Identity    │  │ Organization │  │   Finance    │  │    Accounting    │ │
│  │   & Auth     │  │  & Config    │  │    Core     │  │                  │ │
│  │              │  │              │  │              │  │                  │ │
│  │ users        │  │ organizations│  │ transactions │  │ journal_entries  │ │
│  │ roles        │  │ entities     │  │ invoices     │  │ journal_lines    │ │
│  │ permissions  │  │ departments  │  │ payments     │  │ accounts         │ │
│  │ mfa_tokens   │  │ settings     │  │ bank_accts   │  │ fiscal_periods   │ │
│  │ sessions     │  │ feature_flags│  │ vendors      │  │ fixed_assets     │ │
│  │ api_keys     │  │ audit_config │  │ customers    │  │ tax_records      │ │
│  └──────────────┘  └──────────────┘  │ budgets      │  └──────────────────┘ │
│                                       │ forecasts    │                       │
│  ┌──────────────┐  ┌──────────────┐  └──────────────┘  ┌──────────────────┐ │
│  │  Treasury    │  │   AP/AR     │  ┌──────────────┐  │   Procurement    │ │
│  │              │  │             │  │   Fraud      │  │                  │ │
│  │ cash_positions│  │ ap_invoices │  │  & Risk     │  │ purchase_orders  │ │
│  │ cash_forecast│  │ ar_invoices │  │             │  │ requisitions     │ │
│  │ investments  │  │ payments    │  │ fraud_alerts │  │ rfqs             │ │
│  │ loans        │  │ collections │  │ fraud_cases  │  │ contracts        │ │
│  │ fx_positions │  │ aging       │  │ risk_scores  │  │ vendor_bids      │ │
│  └──────────────┘  └─────────────┘  │ compliance   │  └──────────────────┘ │
│                                       │ controls     │                       │
│  ┌──────────────┐  ┌──────────────┐  └──────────────┘  ┌──────────────────┐ │
│  │    Workflow  │  │  Rule       │  ┌──────────────┐  │   AI Service     │ │
│  │    Engine    │  │  Engine     │  │ Notification │  │                  │ │
│  │              │  │             │  │              │  │ ai_conversations  │ │
│  │ workflows    │  │ rules       │  │ notifications│  │ ai_messages      │ │
│  │ workflow_runs│  │ conditions  │  │ templates    │  │ embeddings       │ │
│  │ workflow_steps│  │ rule_hits  │  │ preferences  │  │ prompts          │ │
│  │ approvals    │  │ simulations │  │ channels     │  │ agent_runs       │ │
│  └──────────────┘  └─────────────┘  └──────────────┘  │ evaluations      │ │
│                                                         └──────────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────────────┐ │
│  │   Billing    │  │   Developer  │  │         System / Platform           │ │
│  │              │  │              │  │                                    │ │
│  │ subscriptions│  │ webhooks     │  │ audit_logs   │ events             │ │
│  │ usage_records│  │ api_logs     │  │ health_checks│ migrations         │ │
│  │ invoices     │  │ connectors   │  │ system_config│ feature_flags      │ │
│  │ credits      │  │ integration_ │  │ incidents    │ maintenance_windows│ │
│  │ coupons      │  │   maps       │  └────────────────────────────────────┘ │
│  └──────────────┘  └──────────────┘                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Domain Ownership Matrix

| Domain | Owner Team | Primary Tables | Data Sensitivity |
|---|---|---|---|
| **Identity & Auth** | Platform | users, roles, permissions, mfa_tokens, sessions, api_keys | CRITICAL |
| **Organization & Config** | Platform | organizations, entities, departments, settings, feature_flags | HIGH |
| **Finance Core** | Finance | transactions, invoices, payments, bank_accounts | CRITICAL |
| **Accounting** | Finance | journal_entries, accounts, fiscal_periods, fixed_assets | CRITICAL |
| **Treasury** | Treasury | cash_positions, investments, loans, fx_positions | CRITICAL |
| **AP/AR** | Finance | ap_invoices, ar_invoices, collections, aging | HIGH |
| **Fraud & Risk** | Risk | fraud_alerts, fraud_cases, risk_scores, compliance_controls | CRITICAL |
| **Procurement** | Procurement | purchase_orders, requisitions, rfqs, contracts | HIGH |
| **Workflow Engine** | Platform | workflows, workflow_runs, workflow_steps, approvals | MEDIUM |
| **Rule Engine** | Platform | rules, conditions, rule_hits, simulations | MEDIUM |
| **Notification** | Platform | notifications, templates, preferences, channels | LOW |
| **AI Service** | AI | ai_conversations, ai_messages, embeddings, prompts, agent_runs | MEDIUM |
| **Billing** | Platform | subscriptions, usage_records, invoices, credits | HIGH |
| **Developer** | Platform | webhooks, api_logs, connectors, integration_maps | MEDIUM |
| **System/Platform** | Platform | audit_logs, events, health_checks, system_config | HIGH |

### 3.3 Cross-Domain Data Flow

```text
Identity ──► Organization ──► Finance Core ──► Accounting ──► Reports
   │              │               │               │              │
   │              ▼               ▼               │              │
   │         Procurement ──► AP/AR ───────────────┘              │
   │              │               │                              │
   │              ▼               ▼                              │
   │           Inventory ──► Treasury ──► Forecasting            │
   │                            │              │                 │
   │                            ▼              ▼                 │
   │                        Fraud/Risk ──► Compliance            │
   │                                              │              │
   ▼                                              ▼              ▼
Audit Log ◄──────────────────────────────────────────────────── Data Warehouse
```

---

## 4. Complete Entity Catalog

### 4.1 Entity Catalog Overview

| # | Entity | Domain | Description |
|---|---|---|---|
| 1 | organizations | Organization | Tenant organization root entity |
| 2 | entities | Organization | Legal entities/subsidiaries within an organization |
| 3 | departments | Organization | Cost centers and departments |
| 4 | users | Identity | User accounts (per organization) |
| 5 | roles | Identity | Named role templates |
| 6 | permissions | Identity | Granular permission definitions |
| 7 | role_permissions | Identity | Bridge: roles ↔ permissions |
| 8 | user_roles | Identity | Bridge: users ↔ roles |
| 9 | mfa_tokens | Identity | MFA device registrations |
| 10 | sessions | Identity | User session records |
| 11 | api_keys | Identity | API authentication keys |
| 12 | password_resets | Identity | Password reset tokens |
| 13 | login_attempts | Identity | Failed login tracking |
| 14 | organization_settings | Organization | Tenant configuration |
| 15 | feature_flags | Organization | Controlled feature rollouts |
| 16 | audit_config | Organization | Audit retention configuration |
| 17 | notification_preferences | Organization | Global notification defaults |
| 18 | bank_accounts | Finance Core | Connected bank accounts |
| 19 | bank_statements | Finance Core | Imported bank statements |
| 20 | bank_statement_lines | Finance Core | Individual statement lines |
| 21 | transactions | Finance Core | Financial transactions |
| 22 | transaction_lines | Finance Core | Transaction split lines |
| 23 | transaction_categories | Finance Core | Category taxonomy |
| 24 | transaction_rules | Finance Core | Auto-categorization rules |
| 25 | reconciliation_matches | Finance Core | Matched transactions |
| 26 | chart_of_accounts | Accounting | Account hierarchy |
| 27 | fiscal_periods | Accounting | Accounting periods |
| 28 | journal_entries | Accounting | Journal entry headers |
| 29 | journal_lines | Accounting | Journal entry lines (debits/credits) |
| 30 | account_balances | Accounting | Period-end account balances |
| 31 | period_close_tasks | Accounting | Close checklist items |
| 32 | period_close_logs | Accounting | Period closure audit trail |
| 33 | invoices | AP/AR | Vendor invoices (AP) |
| 34 | invoice_lines | AP/AR | Invoice line items |
| 35 | invoice_payments | AP/AR | Invoice-payment links |
| 36 | credit_notes | AP/AR | Credit and debit notes |
| 37 | payments | Finance Core | Payment records |
| 38 | payment_batches | Finance Core | Grouped payment executions |
| 39 | payment_batch_items | Finance Core | Payments within batches |
| 40 | payment_rails | Finance Core | Payment method configurations |
| 41 | vendors | Procurement | Vendor/supplier profiles |
| 42 | vendor_bank_accounts | Procurement | Vendor bank accounts |
| 43 | vendor_contracts | Procurement | Vendor agreements |
| 44 | vendor_risk_scores | Procurement | Risk assessment results |
| 45 | sanctions_screening | Procurement | Sanctions check records |
| 46 | customers | AP/AR | Customer profiles |
| 47 | customer_invoices | AP/AR | Customer-facing invoices (AR) |
| 48 | collections | AP/AR | Collection activities |
| 49 | dunning_schedules | AP/AR | Automated dunning configurations |
| 50 | budgets | Finance Core | Budget headers |
| 51 | budget_lines | Finance Core | Budget line items |
| 52 | budget_versions | Finance Core | Budget version history |
| 53 | budget_approvals | Finance Core | Budget approval records |
| 54 | forecasts | Finance Core | Forecast model outputs |
| 55 | forecast_scenarios | Finance Core | Scenario definitions |
| 56 | forecast_accuracy | Finance Core | Model accuracy metrics |
| 57 | cash_positions | Treasury | Daily cash snapshots |
| 58 | cash_flow_entries | Treasury | Individual cash flow line items |
| 59 | cash_forecasts | Treasury | Cash forecast projections |
| 60 | treasury_transfers | Treasury | Inter-account transfers |
| 61 | investments | Treasury | Investment records |
| 62 | loans | Treasury | Borrowing/credit lines |
| 63 | fx_positions | Treasury | Foreign exchange exposures |
| 64 | fixed_assets | Accounting | Fixed asset register |
| 65 | asset_depreciation | Accounting | Depreciation schedules |
| 66 | asset_disposals | Accounting | Asset disposal records |
| 67 | tax_records | Accounting | Tax calculation results |
| 68 | tax_filings | Accounting | Tax filing records |
| 69 | tax_rates | Accounting | Tax rate configurations |
| 70 | purchase_orders | Procurement | Purchase order headers |
| 71 | po_lines | Procurement | Purchase order line items |
| 72 | goods_receipts | Procurement | Receiving records |
| 73 | requisitions | Procurement | Purchase requisitions |
| 74 | rfqs | Procurement | Requests for quotation |
| 75 | expenses | Finance Core | Employee expense records |
| 76 | expense_reports | Finance Core | Grouped expense reports |
| 77 | mileage_records | Finance Core | Mileage tracking |
| 78 | corporate_cards | Finance Core | Corporate card records |
| 79 | fraud_alerts | Fraud & Risk | Automated fraud detection alerts |
| 80 | fraud_cases | Fraud & Risk | Fraud investigation cases |
| 81 | fraud_case_evidence | Fraud & Risk | Evidence items linked to cases |
| 82 | fraud_rules | Fraud & Risk | Fraud detection rule configurations |
| 83 | compliance_controls | Fraud & Risk | Control definitions |
| 84 | compliance_control_tests | Fraud & Risk | Control test results |
| 85 | compliance_issues | Fraud & Risk | Compliance issue tracking |
| 86 | compliance_evidence | Fraud & Risk | Evidence records |
| 87 | compliance_frameworks | Fraud & Risk | Framework definitions (SOC2, ISO) |
| 88 | compliance_certifications | Fraud & Risk | Certification records |
| 89 | risk_registry | Fraud & Risk | Enterprise risk register |
| 90 | risk_assessments | Fraud & Risk | Risk assessment records |
| 91 | policies | Fraud & Risk | Policy documents and versions |
| 92 | policy_attestations | Fraud & Risk | User policy sign-offs |
| 93 | documents | Document Mgmt | Document metadata |
| 94 | document_versions | Document Mgmt | Document version history |
| 95 | document_embeddings | AI Service | Vector embeddings for documents |
| 96 | document_chunks | AI Service | Text chunks for RAG |
| 97 | ocr_results | AI Service | OCR extraction outputs |
| 98 | reports | Reporting | Report metadata |
| 99 | report_schedules | Reporting | Scheduled report configurations |
| 100 | report_distributions | Reporting | Report delivery records |
| 101 | workflows | Workflow Engine | Workflow definition headers |
| 102 | workflow_versions | Workflow Engine | Immutable workflow versions |
| 103 | workflow_runs | Workflow Engine | Workflow execution instances |
| 104 | workflow_steps | Workflow Engine | Individual step executions |
| 105 | workflow_approvals | Workflow Engine | Human approval records |
| 106 | workflow_escalations | Workflow Engine | Escalation events |
| 107 | rules | Rule Engine | Rule header definitions |
| 108 | rule_versions | Rule Engine | Versioned rule snapshots |
| 109 | rule_conditions | Rule Engine | Individual conditions |
| 110 | rule_actions | Rule Engine | Individual actions |
| 111 | rule_executions | Rule Engine | Rule execution log |
| 112 | rule_simulations | Rule Engine | Rule simulation results |
| 113 | ai_conversations | AI Service | Chat conversation headers |
| 114 | ai_messages | AI Service | Individual chat messages |
| 115 | ai_message_sources | AI Service | Source citations per message |
| 116 | ai_agent_runs | AI Service | Agent execution traces |
| 117 | ai_agent_steps | AI Service | Individual agent tool calls |
| 118 | ai_prompts | AI Service | Prompt library entries |
| 119 | ai_prompt_versions | AI Service | Versioned prompts |
| 120 | ai_templates | AI Service | Report/analysis templates |
| 121 | ai_memory | AI Service | Persistent AI user memory |
| 122 | ai_evaluations | AI Service | Quality evaluation results |
| 123 | ai_feedback | AI Service | User feedback on AI outputs |
| 124 | ai_model_usage | AI Service | Token usage and cost tracking |
| 125 | ai_cost_budget | AI Service | Tenant AI budget configuration |
| 126 | subscriptions | Billing | Customer subscription records |
| 127 | subscription_plans | Billing | Plan/tier definitions |
| 128 | usage_records | Billing | Metered usage entries |
| 129 | billing_invoices | Billing | Generated invoices |
| 130 | billing_credits | Billing | AI credit pools |
| 131 | credit_transactions | Billing | Credit usage log |
| 132 | coupons | Billing | Discount coupon definitions |
| 133 | notifications | Notification | Notification records |
| 134 | notification_templates | Notification | Template definitions |
| 135 | notification_channels | Notification | Channel configurations |
| 136 | notification_digests | Notification | Digested notification groups |
| 137 | webhooks | Developer | Webhook endpoint configurations |
| 138 | webhook_deliveries | Developer | Webhook delivery logs |
| 139 | webhook_events | Developer | Queued webhook events |
| 140 | api_logs | Developer | API request/response logs |
| 141 | integration_connectors | Developer | Installed connector instances |
| 142 | connector_definitions | Developer | Connector catalog entries |
| 143 | sync_runs | Developer | Integration sync execution logs |
| 144 | sync_logs | Developer | Individual sync record logs |
| 145 | field_mappings | Developer | Field mapping configurations |
| 146 | audit_logs | System | Immutable audit trail |
| 147 | system_events | System | Internal system events |
| 148 | health_checks | System | Service health check records |
| 149 | incidents | System | Incident tracking |
| 150 | maintenance_windows | System | Scheduled maintenance records |
| 151 | background_jobs | System | Job queue records |
| 152 | dead_letter_queue | System | Failed job records |
| 153 | data_retention_policies | System | Retention rule definitions |
| 154 | schema_migrations | System | Database migration tracking |
| 155 | exchange_rates | Finance Core | Currency exchange rate history |

---

## 5. Complete Table Specification

### 5.1 Identity & Auth Domain

#### `organizations`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Organization legal name |
| slug | VARCHAR(100) | NOT NULL, UNIQUE | URL-friendly identifier |
| plan_id | VARCHAR(50) | NOT NULL, DEFAULT 'starter' | Subscription plan tier |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | active, suspended, cancelled, trialing |
| base_currency | VARCHAR(3) | NOT NULL, DEFAULT 'USD' | ISO 4217 currency code |
| timezone | VARCHAR(50) | NOT NULL, DEFAULT 'UTC' | IANA timezone identifier |
| fiscal_year_start | DATE | NOT NULL | First day of fiscal year |
| locale | VARCHAR(10) | NOT NULL, DEFAULT 'en-US' | Language/region |
| domain | VARCHAR(255) | NULL | SSO auto-provisioning domain |
| logo_url | TEXT | NULL | Organization logo |
| tenant_encryption_key_id | VARCHAR(100) | NULL | BYOK key reference (Enterprise) |
| data_residency_region | VARCHAR(50) | NULL | Required region for data |
| mfa_enforced | BOOLEAN | NOT NULL, DEFAULT false | Global MFA requirement |
| session_timeout_minutes | INTEGER | NOT NULL, DEFAULT 60 | Idle session timeout |
| max_users | INTEGER | NOT NULL, DEFAULT 5 | Plan-based user limit |
| max_transactions_monthly | INTEGER | NOT NULL, DEFAULT 500 | Plan-based transaction limit |
| ai_credit_limit_monthly | INTEGER | NOT NULL, DEFAULT 1000 | AI credit cap |
| retention_days_audit_logs | INTEGER | NOT NULL, DEFAULT 90 | Audit log retention |
| retention_days_documents | INTEGER | NOT NULL, DEFAULT 365 | Document retention |
| metadata | JSONB | DEFAULT '{}' | Flexible metadata |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete timestamp |

**Indexes:**
- `idx_organizations_slug` UNIQUE on (slug)
- `idx_organizations_domain` on (domain) WHERE domain IS NOT NULL
- `idx_organizations_plan_id` on (plan_id)
- `idx_organizations_status` on (status)
- `idx_organizations_created_at` on (created_at)

**Partitioning:** None (small table, <100K rows expected)
**Estimated Growth:** 100-1,000 rows (tenant count)
**Archival:** No archival (core tenant data kept forever)

---

#### `entities`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Unique identifier |
| organization_id | UUID | FK → organizations.id, NOT NULL | Parent organization |
| parent_entity_id | UUID | FK → entities.id, NULL | Parent entity (hierarchy) |
| code | VARCHAR(50) | NOT NULL | Entity short code |
| name | VARCHAR(255) | NOT NULL | Legal entity name |
| country | VARCHAR(2) | NOT NULL | ISO 3166-1 alpha-2 |
| currency | VARCHAR(3) | NOT NULL | ISO 4217 |
| fiscal_calendar_id | UUID | FK → fiscal_periods.id, NULL | Custom fiscal calendar |
| tax_id | VARCHAR(100) | NULL | Tax registration number |
| registration_number | VARCHAR(100) | NULL | Business registration |
| address_line1 | VARCHAR(255) | NULL | Street address |
| address_line2 | VARCHAR(255) | NULL | Suite/floor |
| city | VARCHAR(100) | NULL | City |
| state | VARCHAR(100) | NULL | State/province |
| postal_code | VARCHAR(20) | NULL | Postal/ZIP code |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | active, inactive, closed |
| type | VARCHAR(50) | NOT NULL | legal_entity, subsidiary, branch, department |
| metadata | JSONB | DEFAULT '{}' | Flexible metadata |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| deleted_at | TIMESTAMPTZ | NULL | |

**Indexes:**
- `idx_entities_org_code` UNIQUE on (organization_id, code)
- `idx_entities_org_parent` on (organization_id, parent_entity_id)
- `idx_entities_status` on (organization_id, status)

**Relationships:**
- organizations 1:N entities (organization owns entities)
- entities 1:N entities (self-referential parent hierarchy)

---

#### `users`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Unique identifier |
| organization_id | UUID | FK → organizations.id, NOT NULL | Tenant |
| email | VARCHAR(255) | NOT NULL | Login email |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt/argon2 hash |
| first_name | VARCHAR(100) | NOT NULL | Given name |
| last_name | VARCHAR(100) | NOT NULL | Family name |
| title | VARCHAR(200) | NULL | Job title |
| phone | VARCHAR(50) | NULL | Contact number |
| avatar_url | TEXT | NULL | Profile image |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | active, invited, suspended, deactivated |
| mfa_enabled | BOOLEAN | NOT NULL, DEFAULT false | MFA enrolled |
| mfa_method | VARCHAR(20) | NULL | totp, sms, email, webauthn |
| last_login_at | TIMESTAMPTZ | NULL | Last successful login |
| last_login_ip | INET | NULL | Last login IP address |
| password_changed_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Password last changed |
| failed_login_attempts | INTEGER | NOT NULL, DEFAULT 0 | Consecutive failures |
| locked_until | TIMESTAMPTZ | NULL | Account lock expiry |
| metadata | JSONB | DEFAULT '{}' | Flexible metadata |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| deleted_at | TIMESTAMPTZ | NULL | |

**Indexes:**
- `idx_users_org_email` UNIQUE on (organization_id, email) WHERE deleted_at IS NULL
- `idx_users_status` on (organization_id, status)
- `idx_users_last_login` on (organization_id, last_login_at)
- `idx_users_email` on (email) — for login across organizations

**Estimated Growth:** 10-10,000 per tenant
**Partitioning:** By organization_id hash (if >1M total users)

---

#### `roles`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| name | VARCHAR(100) | NOT NULL | Role display name |
| slug | VARCHAR(100) | NOT NULL | Role identifier |
| description | TEXT | NULL | |
| is_system | BOOLEAN | NOT NULL, DEFAULT false | Pre-defined by platform |
| is_deprecated | BOOLEAN | NOT NULL, DEFAULT false | |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| deleted_at | TIMESTAMPTZ | NULL | |

**Indexes:**
- `idx_roles_org_slug` UNIQUE on (organization_id, slug)

---

#### `permissions`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| code | VARCHAR(100) | NOT NULL | Permission code (e.g., 'transaction:write') |
| name | VARCHAR(255) | NOT NULL | Display name |
| description | TEXT | NULL | |
| module | VARCHAR(50) | NOT NULL | Module grouping |
| is_system | BOOLEAN | NOT NULL, DEFAULT false | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_permissions_code` UNIQUE on (code)

---

#### `role_permissions`

| Column | Type | Constraints | Description |
|---|---|---|---|
| role_id | UUID | FK → roles.id, NOT NULL | |
| permission_id | UUID | FK → permissions.id, NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_role_permissions` UNIQUE on (role_id, permission_id)
- `idx_role_permissions_role` on (role_id)
- `idx_role_permissions_perm` on (permission_id)

---

#### `user_roles`

| Column | Type | Constraints | Description |
|---|---|---|---|
| user_id | UUID | FK → users.id, NOT NULL | |
| role_id | UUID | FK → roles.id, NOT NULL | |
| assigned_by | UUID | FK → users.id, NULL | |
| assigned_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| expires_at | TIMESTAMPTZ | NULL | Temporary role expiry |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_user_roles` UNIQUE on (user_id, role_id)
- `idx_user_roles_user` on (user_id)
- `idx_user_roles_role` on (role_id)

---

#### `sessions`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| token_hash | VARCHAR(255) | NOT NULL, UNIQUE | Hashed session token |
| refresh_token_hash | VARCHAR(255) | NULL | Hashed refresh token |
| ip_address | INET | NOT NULL | |
| user_agent | TEXT | NULL | |
| device_fingerprint | VARCHAR(255) | NULL | |
| is_mfa_verified | BOOLEAN | NOT NULL, DEFAULT false | |
| is_trusted_device | BOOLEAN | NOT NULL, DEFAULT false | |
| mfa_verified_at | TIMESTAMPTZ | NULL | |
| last_activity_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| expires_at | TIMESTAMPTZ | NOT NULL | Absolute expiry |
| idle_timeout_minutes | INTEGER | NOT NULL, DEFAULT 60 | |
| revoked_at | TIMESTAMPTZ | NULL | Admin revocation |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_sessions_token_hash` UNIQUE on (token_hash)
- `idx_sessions_user` on (user_id, expires_at)
- `idx_sessions_expires` on (expires_at) WHERE revoked_at IS NULL

**Partitioning:** By month on created_at
**Retention:** Purge expired sessions older than 90 days

---

#### `api_keys`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| user_id | UUID | FK → users.id, NULL | Creator |
| name | VARCHAR(255) | NOT NULL | |
| key_hash | VARCHAR(255) | NOT NULL, UNIQUE | SHA-256 of API key |
| key_prefix | VARCHAR(8) | NOT NULL | First 8 chars for identification |
| scopes | JSONB | NOT NULL, DEFAULT '[]' | Array of permission codes |
| allowed_ips | INET[] | NULL | IP restriction |
| rate_limit_per_hour | INTEGER | NOT NULL, DEFAULT 1000 | |
| expires_at | TIMESTAMPTZ | NULL | |
| last_used_at | TIMESTAMPTZ | NULL | |
| revoked_at | TIMESTAMPTZ | NULL | |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_api_keys_hash` UNIQUE on (key_hash)
- `idx_api_keys_org` on (organization_id)
- `idx_api_keys_expires` on (expires_at) WHERE revoked_at IS NULL

---

### 5.2 Finance Core Domain

#### `transactions`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| entity_id | UUID | FK → entities.id, NULL | |
| bank_account_id | UUID | FK → bank_accounts.id, NULL | |
| external_id | VARCHAR(255) | NULL | Source system ID (Plaid, etc.) |
| amount | NUMERIC(19,4) | NOT NULL | Transaction amount |
| currency | VARCHAR(3) | NOT NULL | ISO 4217 |
| base_currency_amount | NUMERIC(19,4) | NOT NULL | Converted to org currency |
| exchange_rate | NUMERIC(19,8) | NULL, DEFAULT 1 | Rate used for conversion |
| posted_date | DATE | NOT NULL | Bank posted date |
| effective_date | DATE | NOT NULL | Accounting date |
| description | TEXT | NOT NULL | Transaction memo/description |
| reference | VARCHAR(255) | NULL | Check number, reference, etc. |
| category_id | UUID | FK → transaction_categories.id, NULL | |
| category_confidence | NUMERIC(5,4) | NULL | AI categorization confidence |
| vendor_id | UUID | FK → vendors.id, NULL | Matched vendor |
| customer_id | UUID | FK → customers.id, NULL | Matched customer |
| invoice_id | UUID | FK → invoices.id, NULL | |
| reconciliation_status | VARCHAR(20) | NOT NULL, DEFAULT 'unreconciled' | unreconciled, matched, reconciled |
| reconciliation_id | UUID | FK → reconciliation_matches.id, NULL | |
| flag_status | VARCHAR(20) | NOT NULL, DEFAULT 'none' | none, flagged, duplicate, anomaly |
| flag_reason | TEXT | NULL | |
| risk_score | NUMERIC(5,4) | NULL, DEFAULT 0 | 0-1 fraud/risk score |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'posted' | pending, posted, voided |
| source | VARCHAR(50) | NOT NULL | bank_sync, import, api, manual |
| import_batch_id | UUID | NULL | |
| is_split | BOOLEAN | NOT NULL, DEFAULT false | Has split lines |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| deleted_at | TIMESTAMPTZ | NULL | |

**Indexes:**
- `idx_transactions_org_bank_ext` UNIQUE on (organization_id, bank_account_id, external_id, posted_date) WHERE deleted_at IS NULL AND external_id IS NOT NULL
- `idx_transactions_org_posted` on (organization_id, posted_date DESC)
- `idx_transactions_org_status` on (organization_id, status)
- `idx_transactions_org_category` on (organization_id, category_id)
- `idx_transactions_org_vendor` on (organization_id, vendor_id)
- `idx_transactions_org_recon_status` on (organization_id, reconciliation_status)
- `idx_transactions_org_flag` on (organization_id, flag_status) WHERE flag_status != 'none'
- `idx_transactions_org_amount` on (organization_id, amount)
- `idx_transactions_org_description_gin` GIN on (to_tsvector('english', description))
- `idx_transactions_org_created` on (organization_id, created_at DESC)

**Partitioning:** BY RANGE (posted_date) — monthly partitions
**Estimated Growth:** 100K-10M rows per tenant per year
**Archival Strategy:** Partition detach + move to cold storage after retention period (7+ years)

---

#### `transaction_lines` (Splits)

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| transaction_id | UUID | FK → transactions.id, NOT NULL, ON DELETE CASCADE | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| amount | NUMERIC(19,4) | NOT NULL | Split amount |
| category_id | UUID | FK → transaction_categories.id, NULL | |
| department_id | UUID | FK → departments.id, NULL | |
| project_id | VARCHAR(100) | NULL | |
| description | VARCHAR(255) | NULL | |
| sequence | INTEGER | NOT NULL | Line order |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_txn_lines_txn` on (transaction_id)
- `idx_txn_lines_org_cat` on (organization_id, category_id)

**Constraint:** Sum of transaction_lines.amount = transactions.amount (application-enforced)

---

#### `invoices`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| entity_id | UUID | FK → entities.id, NULL | |
| vendor_id | UUID | FK → vendors.id, NULL | AP vendor |
| customer_id | UUID | FK → customers.id, NULL | AR customer |
| type | VARCHAR(10) | NOT NULL | 'ap' (payable) or 'ar' (receivable) |
| invoice_number | VARCHAR(100) | NOT NULL | |
| po_number | VARCHAR(100) | NULL | Purchase order reference |
| invoice_date | DATE | NOT NULL | |
| due_date | DATE | NOT NULL | |
| received_date | DATE | NOT NULL | |
| amount | NUMERIC(19,4) | NOT NULL | Total invoice amount |
| tax_amount | NUMERIC(19,4) | NOT NULL, DEFAULT 0 | |
| tax_rate | NUMERIC(5,4) | NULL | |
| currency | VARCHAR(3) | NOT NULL | |
| base_currency_amount | NUMERIC(19,4) | NOT NULL | |
| exchange_rate | NUMERIC(19,8) | NULL, DEFAULT 1 | |
| description | TEXT | NULL | |
| status | VARCHAR(30) | NOT NULL, DEFAULT 'draft' | draft, pending_approval, approved, paid, rejected, on_hold, cancelled |
| approval_status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | pending, partial, approved, rejected |
| payment_status | VARCHAR(20) | NOT NULL, DEFAULT 'unpaid' | unpaid, partial, paid, failed |
| ocr_confidence | NUMERIC(5,4) | NULL | Overall OCR confidence |
| ocr_raw_data | JSONB | NULL | Full OCR extraction output |
| po_match_status | VARCHAR(20) | NULL | matched, partial_mismatch, no_po |
| po_match_confidence | NUMERIC(5,4) | NULL | |
| tax_validation_status | VARCHAR(20) | NULL | passed, failed, not_checked |
| duplicate_check_status | VARCHAR(20) | NULL | clean, suspected, confirmed |
| payment_terms | VARCHAR(50) | NULL | Net 30, Net 60, etc. |
| early_payment_discount | NUMERIC(5,4) | NULL | Discount percentage |
| early_payment_due_date | DATE | NULL | Discount window end |
| notes | TEXT | NULL | |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| deleted_at | TIMESTAMPTZ | NULL | |

**Indexes:**
- `idx_invoices_org_vendor_num` UNIQUE on (organization_id, vendor_id, invoice_number) WHERE deleted_at IS NULL AND type = 'ap'
- `idx_invoices_org_status` on (organization_id, status)
- `idx_invoices_org_due` on (organization_id, due_date)
- `idx_invoices_org_vendor` on (organization_id, vendor_id)
- `idx_invoices_org_created` on (organization_id, created_at DESC)

**Partitioning:** BY RANGE (invoice_date) — quarterly partitions
**Estimated Growth:** 10K-500K per tenant per year

---

#### `payments`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| entity_id | UUID | FK → entities.id, NULL | |
| batch_id | UUID | FK → payment_batches.id, NULL | |
| vendor_id | UUID | FK → vendors.id, NULL | |
| invoice_id | UUID | FK → invoices.id, NULL | |
| customer_id | UUID | FK → customers.id, NULL | Refund scenario |
| amount | NUMERIC(19,4) | NOT NULL | |
| currency | VARCHAR(3) | NOT NULL | |
| base_currency_amount | NUMERIC(19,4) | NOT NULL | |
| exchange_rate | NUMERIC(19,8) | NULL | |
| rail | VARCHAR(20) | NOT NULL | ach, wire, check, rtp, sepa, swift |
| beneficiary_name | VARCHAR(255) | NOT NULL | |
| beneficiary_account_number | VARCHAR(100) | NOT NULL | Encrypted |
| beneficiary_routing_number | VARCHAR(100) | NULL | Encrypted |
| beneficiary_bank_name | VARCHAR(255) | NULL | |
| remittance_advice | TEXT | NULL | |
| memo | TEXT | NULL | |
| status | VARCHAR(30) | NOT NULL, DEFAULT 'pending' | pending, approved, held, released, failed, cancelled, returned |
| dual_control_status | VARCHAR(20) | NULL | not_required, pending_level1, pending_level2, approved |
| hold_reason | TEXT | NULL | |
| hold_released_by | UUID | FK → users.id, NULL | |
| hold_released_at | TIMESTAMPTZ | NULL | |
| error_message | TEXT | NULL | Payment failure reason |
| retry_count | INTEGER | NOT NULL, DEFAULT 0 | |
| max_retries | INTEGER | NOT NULL, DEFAULT 3 | |
| external_payment_id | VARCHAR(255) | NULL | Payment processor reference |
| scheduled_date | DATE | NULL | |
| released_at | TIMESTAMPTZ | NULL | |
| settled_at | TIMESTAMPTZ | NULL | |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| deleted_at | TIMESTAMPTZ | NULL | |

**Indexes:**
- `idx_payments_org_batch` on (organization_id, batch_id)
- `idx_payments_org_status` on (organization_id, status)
- `idx_payments_org_vendor` on (organization_id, vendor_id)
- `idx_payments_org_invoice` on (organization_id, invoice_id)
- `idx_payments_org_released` on (organization_id, released_at)

**Partitioning:** BY RANGE (created_at) — monthly partitions

---

#### `payment_batches`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| batch_number | VARCHAR(50) | NOT NULL | Human-readable ID (B-YYYYMM-NNNN) |
| entity_id | UUID | FK → entities.id, NULL | |
| rail | VARCHAR(20) | NOT NULL | |
| total_amount | NUMERIC(19,4) | NOT NULL | |
| currency | VARCHAR(3) | NOT NULL | |
| payment_count | INTEGER | NOT NULL, DEFAULT 0 | |
| status | VARCHAR(30) | NOT NULL, DEFAULT 'draft' | draft, pending_level1, pending_level2, approved, released, partially_released, failed |
| approval_level_1_by | UUID | FK → users.id, NULL | |
| approval_level_1_at | TIMESTAMPTZ | NULL | |
| approval_level_2_by | UUID | FK → users.id, NULL | |
| approval_level_2_at | TIMESTAMPTZ | NULL | |
| released_at | TIMESTAMPTZ | NULL | |
| released_by | UUID | FK → users.id, NULL | |
| notes | TEXT | NULL | |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_payment_batches_org_num` UNIQUE on (organization_id, batch_number)
- `idx_payment_batches_org_status` on (organization_id, status)
- `idx_payment_batches_org_created` on (organization_id, created_at DESC)

---

#### `bank_accounts`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| entity_id | UUID | FK → entities.id, NULL | |
| institution_name | VARCHAR(255) | NOT NULL | |
| account_type | VARCHAR(30) | NOT NULL | checking, savings, credit_card, investment, loan |
| account_number | TEXT | NOT NULL | AES-256 encrypted |
| account_number_hash | VARCHAR(64) | NOT NULL | SHA-256 for dedup |
| masked_number | VARCHAR(20) | NOT NULL | Show last 4: ●●●●1234 |
| routing_number | TEXT | NULL | Encrypted |
| currency | VARCHAR(3) | NOT NULL | |
| balance_current | NUMERIC(19,4) | NOT NULL, DEFAULT 0 | |
| balance_available | NUMERIC(19,4) | NOT NULL, DEFAULT 0 | |
| balance_as_of | TIMESTAMPTZ | NULL | |
| credit_limit | NUMERIC(19,4) | NULL | For credit accounts |
| interest_rate | NUMERIC(7,4) | NULL | |
| open_date | DATE | NULL | |
| close_date | DATE | NULL | |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | active, inactive, closed, pending |
| sync_status | VARCHAR(20) | NOT NULL, DEFAULT 'not_connected' | not_connected, connected, syncing, error |
| sync_provider | VARCHAR(50) | NULL | plaid, manual, sftp, api |
| sync_external_id | VARCHAR(255) | NULL | Provider-specific ID |
| last_sync_at | TIMESTAMPTZ | NULL | |
| last_sync_error | TEXT | NULL | |
| is_connection_active | BOOLEAN | NOT NULL, DEFAULT true | |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| deleted_at | TIMESTAMPTZ | NULL | |

**Indexes:**
- `idx_bank_accounts_org` on (organization_id)
- `idx_bank_accounts_org_status` on (organization_id, status)
- `idx_bank_accounts_hash` on (account_number_hash)
- `idx_bank_accounts_sync` on (organization_id, sync_status)

---

### 5.3 Accounting Domain

#### `chart_of_accounts`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| entity_id | UUID | FK → entities.id, NULL | Entity-specific override |
| parent_id | UUID | FK → chart_of_accounts.id, NULL | Parent account |
| code | VARCHAR(50) | NOT NULL | Account code |
| name | VARCHAR(255) | NOT NULL | Account name |
| description | TEXT | NULL | |
| type | VARCHAR(30) | NOT NULL | asset, liability, equity, revenue, expense |
| normal_balance | VARCHAR(5) | NOT NULL | debit or credit |
| category | VARCHAR(100) | NULL | Current Asset, Fixed Asset, etc. |
| level | INTEGER | NOT NULL, DEFAULT 0 | Hierarchy depth |
| is_header | BOOLEAN | NOT NULL, DEFAULT false | Summary/parent (no postings) |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | |
| is_system | BOOLEAN | NOT NULL, DEFAULT false | Required by system |
| tax_category | VARCHAR(50) | NULL | Tax mapping |
| currency | VARCHAR(3) | NULL | Multi-currency support |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| deleted_at | TIMESTAMPTZ | NULL | |

**Indexes:**
- `idx_coa_org_code` UNIQUE on (organization_id, entity_id, code) WHERE deleted_at IS NULL
- `idx_coa_org_parent` on (organization_id, parent_id)
- `idx_coa_org_type` on (organization_id, type)
- `idx_coa_org_active` on (organization_id, is_active) WHERE is_active = true

---

#### `fiscal_periods`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| entity_id | UUID | FK → entities.id, NULL | |
| fiscal_year | INTEGER | NOT NULL | |
| period_number | INTEGER | NOT NULL | 1-12 (or 1-13 for 4-4-5 calendar) |
| start_date | DATE | NOT NULL | |
| end_date | DATE | NOT NULL | |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'open' | open, closing, closed, locked |
| close_date | TIMESTAMPTZ | NULL | When closed |
| closed_by | UUID | FK → users.id, NULL | |
| is_adjustment_period | BOOLEAN | NOT NULL, DEFAULT false | |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_fiscal_periods_org` UNIQUE on (organization_id, entity_id, fiscal_year, period_number)

---

#### `journal_entries`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| entity_id | UUID | FK → entities.id, NOT NULL | |
| period_id | UUID | FK → fiscal_periods.id, NOT NULL | |
| journal_number | VARCHAR(50) | NOT NULL | Human-readable (JE-YYYYMM-NNNN) |
| entry_type | VARCHAR(30) | NOT NULL | standard, recurring, adjusting, closing, reversal, accrual |
| description | TEXT | NOT NULL | |
| source | VARCHAR(50) | NOT NULL | manual, system, import, auto_recurring, auto_reversal |
| source_id | UUID | NULL | Reference to source record |
| total_debits | NUMERIC(19,4) | NOT NULL, DEFAULT 0 | |
| total_credits | NUMERIC(19,4) | NOT NULL, DEFAULT 0 | |
| status | VARCHAR(30) | NOT NULL, DEFAULT 'draft' | draft, pending_approval, posted, reversed, rejected |
| approval_status | VARCHAR(20) | NOT NULL, DEFAULT 'not_required' | not_required, pending, approved, rejected |
| posted_at | TIMESTAMPTZ | NULL | |
| posted_by | UUID | FK → users.id, NULL | |
| reversal_entry_id | UUID | FK → journal_entries.id, NULL | Link to reversal |
| is_reversal | BOOLEAN | NOT NULL, DEFAULT false | |
| auto_reverse_date | DATE | NULL | Auto-reversal trigger date |
| attachment_count | INTEGER | NOT NULL, DEFAULT 0 | |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| deleted_at | TIMESTAMPTZ | NULL | |

**Indexes:**
- `idx_je_org_number` UNIQUE on (organization_id, journal_number)
- `idx_je_org_period` on (organization_id, period_id)
- `idx_je_org_status` on (organization_id, status)
- `idx_je_org_posted` on (organization_id, posted_at DESC) WHERE posted_at IS NOT NULL
- `idx_je_org_type` on (organization_id, entry_type)
- `idx_je_org_created` on (organization_id, created_at DESC)

**Constraints:**
- CHECK (total_debits = total_credits) — must balance
- CHECK (status IN ('draft','pending_approval','posted','reversed','rejected'))

**Partitioning:** BY RANGE (created_at) — quarterly partitions

---

#### `journal_lines`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| journal_entry_id | UUID | FK → journal_entries.id, NOT NULL, ON DELETE CASCADE | |
| account_id | UUID | FK → chart_of_accounts.id, NOT NULL | |
| debit | NUMERIC(19,4) | NOT NULL, DEFAULT 0 | |
| credit | NUMERIC(19,4) | NOT NULL, DEFAULT 0 | |
| description | TEXT | NULL | |
| department_id | UUID | FK → departments.id, NULL | |
| cost_center_id | VARCHAR(100) | NULL | |
| project_id | VARCHAR(100) | NULL | |
| customer_id | UUID | FK → customers.id, NULL | |
| vendor_id | UUID | FK → vendors.id, NULL | |
| line_order | INTEGER | NOT NULL | |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_jl_entry` on (journal_entry_id)
- `idx_jl_account` on (account_id)
- `idx_jl_org_dept` on (department_id)
- `idx_jl_org_customer` on (customer_id)

**Constraints:**
- CHECK (debit >= 0 AND credit >= 0)
- CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0)) — each line is either debit or credit, not both

---

#### `account_balances`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| account_id | UUID | FK → chart_of_accounts.id, NOT NULL | |
| period_id | UUID | FK → fiscal_periods.id, NOT NULL | |
| entity_id | UUID | FK → entities.id, NULL | |
| opening_balance | NUMERIC(19,4) | NOT NULL, DEFAULT 0 | |
| period_debits | NUMERIC(19,4) | NOT NULL, DEFAULT 0 | |
| period_credits | NUMERIC(19,4) | NOT NULL, DEFAULT 0 | |
| closing_balance | NUMERIC(19,4) | NOT NULL, DEFAULT 0 | |
| is_calculated | BOOLEAN | NOT NULL, DEFAULT false | Auto-calculated vs manual |
| calculated_at | TIMESTAMPTZ | NULL | Last balance calc |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_acct_balances` UNIQUE on (organization_id, account_id, period_id, entity_id)
- `idx_acct_balances_acct` on (account_id)
- `idx_acct_balances_period` on (period_id)

**Partitioning:** BY RANGE (period_id via fiscal_periods.end_date)

---

### 5.4 Treasury Domain

#### `cash_positions` (Snapshot Table)

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| entity_id | UUID | FK → entities.id, NULL | |
| snapshot_date | DATE | NOT NULL | |
| total_cash | NUMERIC(19,4) | NOT NULL | |
| total_cash_base_currency | NUMERIC(19,4) | NOT NULL | |
| cash_by_account | JSONB | NOT NULL | Aggregated per account |
| cash_by_currency | JSONB | NOT NULL | Aggregated per currency |
| pending_transfers | NUMERIC(19,4) | NOT NULL, DEFAULT 0 | |
| available_credit | NUMERIC(19,4) | NOT NULL, DEFAULT 0 | |
| is_calculated | BOOLEAN | NOT NULL, DEFAULT true | |
| calculated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_cash_positions_date` UNIQUE on (organization_id, entity_id, snapshot_date)
- `idx_cash_positions_org` on (organization_id, snapshot_date DESC)

**Partitioning:** BY RANGE (snapshot_date) — monthly

---

#### `cash_flow_entries`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| entity_id | UUID | FK → entities.id, NULL | |
| entry_date | DATE | NOT NULL | |
| type | VARCHAR(20) | NOT NULL | inflow, outflow |
| category | VARCHAR(50) | NOT NULL | operations, investing, financing |
| subcategory | VARCHAR(100) | NULL | |
| amount | NUMERIC(19,4) | NOT NULL | |
| currency | VARCHAR(3) | NOT NULL | |
| base_currency_amount | NUMERIC(19,4) | NOT NULL | |
| description | TEXT | NOT NULL | |
| source_type | VARCHAR(50) | NULL | invoice, payment, journal, manual |
| source_id | UUID | NULL | |
| is_recurring | BOOLEAN | NOT NULL, DEFAULT false | |
| is_forecast | BOOLEAN | NOT NULL, DEFAULT false | |
| forecast_scenario_id | UUID | NULL | |
| confidence | NUMERIC(5,4) | NULL | Forecast confidence |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_cf_entries_org_date` on (organization_id, entry_date DESC)
- `idx_cf_entries_org_type` on (organization_id, type)
- `idx_cf_entries_org_cat` on (organization_id, category)
- `idx_cf_entries_forecast` on (organization_id, is_forecast, forecast_scenario_id)

---

### 5.5 Fraud & Risk Domain

#### `fraud_alerts`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| severity | VARCHAR(10) | NOT NULL | critical, high, medium, low |
| alert_type | VARCHAR(50) | NOT NULL | duplicate_payment, anomaly, pattern, collusion, sanctions, new_vendor_rush |
| resource_type | VARCHAR(50) | NOT NULL | payment, invoice, transaction, vendor |
| resource_id | UUID | NOT NULL | |
| amount | NUMERIC(19,4) | NULL | |
| currency | VARCHAR(3) | NULL | |
| description | TEXT | NOT NULL | |
| explanation | TEXT | NULL | AI-generated explanation |
| confidence | NUMERIC(5,4) | NOT NULL | AI confidence score |
| risk_factors | JSONB | NOT NULL, DEFAULT '[]' | Contributing risk factors |
| rule_id | UUID | FK → rules.id, NULL | Triggering rule |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'open' | open, investigating, resolved, dismissed |
| assigned_to | UUID | FK → users.id, NULL | |
| case_id | UUID | FK → fraud_cases.id, NULL | |
| resolved_by | UUID | FK → users.id, NULL | |
| resolved_at | TIMESTAMPTZ | NULL | |
| resolution | VARCHAR(50) | NULL | true_positive, false_positive, inconclusive |
| reviewed_at | TIMESTAMPTZ | NULL | |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_fraud_alerts_org_severity` on (organization_id, severity, status)
- `idx_fraud_alerts_org_status` on (organization_id, status)
- `idx_fraud_alerts_org_type` on (organization_id, alert_type)
- `idx_fraud_alerts_org_created` on (organization_id, created_at DESC)
- `idx_fraud_alerts_resource` on (resource_type, resource_id)
- `idx_fraud_alerts_case` on (case_id)

**Partitioning:** BY RANGE (created_at) — monthly

---

#### `fraud_cases`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| case_number | VARCHAR(50) | NOT NULL | FC-YYYYMM-NNNN |
| title | VARCHAR(255) | NOT NULL | |
| severity | VARCHAR(10) | NOT NULL | |
| root_cause | TEXT | NULL | |
| modus_operandi | TEXT | NULL | |
| total_amount_at_risk | NUMERIC(19,4) | NULL | |
| amount_recovered | NUMERIC(19,4) | NULL | |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'open' | open, investigating, resolved, closed |
| assigned_to | UUID | FK → users.id, NULL | |
| approved_by | UUID | FK → users.id, NULL | 2-person review |
| approved_at | TIMESTAMPTZ | NULL | |
| resolution | VARCHAR(50) | NULL | |
| resolution_notes | TEXT | NULL | |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_fraud_cases_org_num` UNIQUE on (organization_id, case_number)
- `idx_fraud_cases_org_status` on (organization_id, status)

---

### 5.6 AI Service Domain

#### `ai_conversations`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| user_id | UUID | FK → users.id, NOT NULL | |
| title | VARCHAR(255) | NULL | |
| visibility | VARCHAR(20) | NOT NULL, DEFAULT 'private' | private, org_visible |
| context | JSONB | DEFAULT '{}' | Page context, filters, etc. |
| message_count | INTEGER | NOT NULL, DEFAULT 0 | |
| total_tokens | INTEGER | NOT NULL, DEFAULT 0 | |
| agent_ids | UUID[] | NULL | Agents involved |
| is_pinned | BOOLEAN | NOT NULL, DEFAULT false | |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| deleted_at | TIMESTAMPTZ | NULL | |

**Indexes:**
- `idx_ai_convs_org_user` on (organization_id, user_id, updated_at DESC)
- `idx_ai_convs_org_created` on (organization_id, created_at DESC)

**Partitioning:** BY RANGE (created_at) — monthly

---

#### `ai_messages`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| conversation_id | UUID | FK → ai_conversations.id, NOT NULL, ON DELETE CASCADE | |
| role | VARCHAR(20) | NOT NULL | user, assistant, system, tool |
| content | TEXT | NOT NULL | |
| content_redacted | TEXT | NULL | PII-redacted version |
| model | VARCHAR(100) | NULL | GPT-4o, Claude-3.5, etc. |
| prompt_tokens | INTEGER | NOT NULL, DEFAULT 0 | |
| completion_tokens | INTEGER | NOT NULL, DEFAULT 0 | |
| total_tokens | INTEGER | NOT NULL, DEFAULT 0 | |
| latency_ms | INTEGER | NULL | |
| cost_usd | NUMERIC(10,6) | NOT NULL, DEFAULT 0 | |
| confidence | NUMERIC(5,4) | NULL | AI confidence score |
| agent_id | VARCHAR(100) | NULL | Which agent responded |
| tool_calls | JSONB | NULL | Tool call details |
| tool_results | JSONB | NULL | Tool call results |
| sources | JSONB | NULL | Cited sources array |
| citation_count | INTEGER | NOT NULL, DEFAULT 0 | |
| parent_message_id | UUID | NULL | For branching |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_ai_msgs_conversation` on (conversation_id, created_at)
- `idx_ai_msgs_org_created` on (created_at) — for admin monitoring
- `idx_ai_msgs_model` on (model) — for cost analysis

**Partitioning:** BY RANGE (created_at) — monthly

---

#### `ai_agent_runs`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| conversation_id | UUID | FK → ai_conversations.id, NULL | |
| user_id | UUID | FK → users.id, NOT NULL | |
| agent_name | VARCHAR(100) | NOT NULL | supervisor, finance_analysis, fraud_detection, etc. |
| input | TEXT | NOT NULL | |
| output | TEXT | NULL | |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'running' | running, completed, failed, escalated |
| confidence | NUMERIC(5,4) | NULL | |
| tool_calls_count | INTEGER | NOT NULL, DEFAULT 0 | |
| total_tokens | INTEGER | NOT NULL, DEFAULT 0 | |
| cost_usd | NUMERIC(10,6) | NOT NULL, DEFAULT 0 | |
| latency_ms | INTEGER | NOT NULL | |
| error_message | TEXT | NULL | |
| trace_data | JSONB | NULL | Full execution trace |
| metadata | JSONB | DEFAULT '{}' | |
| started_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| completed_at | TIMESTAMPTZ | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_ai_agent_runs_org` on (organization_id, created_at DESC)
- `idx_ai_agent_runs_status` on (organization_id, status)
- `idx_ai_agent_runs_agent` on (organization_id, agent_name)
- `idx_ai_agent_runs_cost` on (organization_id, cost_usd)

**Partitioning:** BY RANGE (created_at) — monthly

---

#### `ai_prompts`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | (NULL for global prompts) |
| name | VARCHAR(255) | NOT NULL | |
| slug | VARCHAR(255) | NOT NULL | |
| description | TEXT | NULL | |
| system_prompt | TEXT | NOT NULL | |
| user_prompt_template | TEXT | NULL | |
| model | VARCHAR(100) | NULL | |
| temperature | NUMERIC(3,2) | NOT NULL, DEFAULT 0.7 | |
| max_tokens | INTEGER | NOT NULL, DEFAULT 4096 | |
| role_scope | VARCHAR(50) | NULL | Role restriction |
| module | VARCHAR(50) | NULL | Module context |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | |
| version | INTEGER | NOT NULL, DEFAULT 1 | |
| approval_status | VARCHAR(20) | NOT NULL, DEFAULT 'approved' | draft, pending_approval, approved, deprecated |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| deleted_at | TIMESTAMPTZ | NULL | |

**Indexes:**
- `idx_ai_prompts_slug` UNIQUE on (organization_id, slug, version)

---

#### `document_embeddings`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| document_id | UUID | FK → documents.id, NOT NULL | |
| chunk_index | INTEGER | NOT NULL | Chunk sequence |
| chunk_text | TEXT | NOT NULL | |
| chunk_text_hash | VARCHAR(64) | NOT NULL | SHA-256 for dedup |
| token_count | INTEGER | NOT NULL | |
| embedding | vector(1536) | NOT NULL | pgvector embedding |
| model | VARCHAR(100) | NOT NULL | Embedding model used |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_doc_embeddings_doc` on (document_id, chunk_index)
- `idx_doc_embeddings_org` on (organization_id)
- `idx_doc_embeddings_vector` IVFFLAT on (embedding) WITH (lists = 100)

**Partitioning:** BY organization_id hash (for vector index performance)

---

### 5.7 Workflow Engine Domain

#### `workflows`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| name | VARCHAR(255) | NOT NULL | |
| description | TEXT | NULL | |
| trigger_type | VARCHAR(50) | NOT NULL | event, schedule, webhook |
| trigger_config | JSONB | NOT NULL | Trigger configuration |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'draft' | draft, active, paused, archived |
| version | INTEGER | NOT NULL, DEFAULT 1 | |
| run_count | INTEGER | NOT NULL, DEFAULT 0 | |
| last_run_at | TIMESTAMPTZ | NULL | |
| created_by | UUID | FK → users.id, NOT NULL | |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| deleted_at | TIMESTAMPTZ | NULL | |

**Indexes:**
- `idx_workflows_org` on (organization_id)
- `idx_workflows_org_status` on (organization_id, status)
- `idx_workflows_org_trigger` on (organization_id, trigger_type)

---

#### `workflow_versions`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| workflow_id | UUID | FK → workflows.id, NOT NULL | |
| version | INTEGER | NOT NULL | |
| definition | JSONB | NOT NULL | Full workflow DAG definition |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'draft' | draft, active, superseded, archived |
| published_by | UUID | FK → users.id, NULL | |
| published_at | TIMESTAMPTZ | NULL | |
| change_log | TEXT | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_wf_versions_wf` UNIQUE on (workflow_id, version)

---

#### `workflow_runs`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| workflow_id | UUID | FK → workflows.id, NOT NULL | |
| workflow_version | INTEGER | NOT NULL | |
| trigger_event_id | UUID | NULL | |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'running' | running, completed, failed, escalated, timed_out |
| current_step | VARCHAR(100) | NULL | |
| input | JSONB | NULL | Trigger payload |
| output | JSONB | NULL | Final output |
| error_message | TEXT | NULL | |
| started_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| completed_at | TIMESTAMPTZ | NULL | |
| duration_ms | INTEGER | NULL | |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_wf_runs_org` on (organization_id, created_at DESC)
- `idx_wf_runs_wf` on (workflow_id, created_at DESC)
- `idx_wf_runs_status` on (organization_id, status)

**Partitioning:** BY RANGE (created_at) — monthly

---

### 5.8 Audit Domain

#### `audit_logs`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| actor_id | UUID | FK → users.id, NULL | Who performed the action |
| actor_email | VARCHAR(255) | NULL | Denormalized for audit |
| actor_role | VARCHAR(100) | NULL | Role at time of action |
| action | VARCHAR(50) | NOT NULL | create, update, delete, approve, reject, login, export, view |
| resource_type | VARCHAR(50) | NOT NULL | transaction, invoice, payment, user, etc. |
| resource_id | UUID | NOT NULL | |
| resource_identifier | VARCHAR(255) | NULL | Human-readable ID (invoice #, etc.) |
| previous_values | JSONB | NULL | State before change |
| new_values | JSONB | NULL | State after change |
| changes_summary | TEXT | NULL | Human-readable change description |
| reason | TEXT | NULL | User-provided reason |
| ip_address | INET | NOT NULL | |
| user_agent | TEXT | NULL | |
| session_id | UUID | NULL | |
| correlation_id | UUID | NOT NULL | Request tracing |
| trace_id | VARCHAR(100) | NULL | Distributed tracing |
| source | VARCHAR(50) | NOT NULL | web, api, worker, system, ai |
| severity | VARCHAR(10) | NOT NULL, DEFAULT 'info' | info, warning, critical |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_audit_logs_org_created` on (organization_id, created_at DESC)
- `idx_audit_logs_org_actor` on (organization_id, actor_id)
- `idx_audit_logs_org_action` on (organization_id, action)
- `idx_audit_logs_org_resource` on (organization_id, resource_type, resource_id)
- `idx_audit_logs_org_severity` on (organization_id, severity)
- `idx_audit_logs_correlation` on (correlation_id)
- `idx_audit_logs_org_reason_gin` GIN on (to_tsvector('english', COALESCE(reason, '')))

**Constraints:**
- Table is APPEND-ONLY — no UPDATE or DELETE allowed
- IMMUTABLE: `created_at` cannot be modified
- WORM storage: Write Once, Read Many

**Partitioning:** BY RANGE (created_at) — monthly partitions
**Retention:** 7-10 years per plan. Partition detach + cold storage after retention.
**Estimated Growth:** 1M-10M rows per tenant per month

---

### 5.9 Billing Domain

#### `subscriptions`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| plan_id | VARCHAR(50) | NOT NULL | |
| status | VARCHAR(20) | NOT NULL | active, trialing, past_due, canceled, expired |
| billing_cycle | VARCHAR(10) | NOT NULL, DEFAULT 'monthly' | monthly, annual |
| current_period_start | TIMESTAMPTZ | NOT NULL | |
| current_period_end | TIMESTAMPTZ | NOT NULL | |
| canceled_at | TIMESTAMPTZ | NULL | |
| trial_end | TIMESTAMPTZ | NULL | |
| stripe_subscription_id | VARCHAR(100) | NULL | External billing ref |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_subscriptions_org` UNIQUE on (organization_id)

---

#### `usage_records`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| usage_type | VARCHAR(50) | NOT NULL | ai_credits, transactions, users, integrations, workflows |
| quantity | INTEGER | NOT NULL | |
| unit | VARCHAR(50) | NOT NULL | count, tokens, credits |
| recorded_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| billing_period_start | DATE | NOT NULL | |
| billing_period_end | DATE | NOT NULL | |

**Indexes:**
- `idx_usage_org_period` on (organization_id, usage_type, billing_period_start)
- `idx_usage_org_recorded` on (organization_id, recorded_at)

**Partitioning:** BY RANGE (recorded_at) — monthly

---

### 5.10 Developer Domain

#### `webhooks`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| name | VARCHAR(255) | NOT NULL | |
| url | TEXT | NOT NULL | |
| secret | TEXT | NOT NULL | HMAC signing secret (encrypted) |
| events | VARCHAR(50)[] | NOT NULL | Subscribed event types |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | active, paused, disabled |
| retry_count | INTEGER | NOT NULL, DEFAULT 3 | |
| timeout_ms | INTEGER | NOT NULL, DEFAULT 5000 | |
| last_delivery_at | TIMESTAMPTZ | NULL | |
| last_delivery_status | VARCHAR(20) | NULL | |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_webhooks_org` on (organization_id)

---

### 5.11 System Domain

#### `background_jobs`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NULL | System-wide or tenant |
| type | VARCHAR(100) | NOT NULL | |
| queue | VARCHAR(50) | NOT NULL, DEFAULT 'default' | |
| payload | JSONB | NOT NULL | |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'queued' | queued, running, completed, failed, retrying |
| priority | INTEGER | NOT NULL, DEFAULT 0 | |
| retry_count | INTEGER | NOT NULL, DEFAULT 0 | |
| max_retries | INTEGER | NOT NULL, DEFAULT 3 | |
| last_error | TEXT | NULL | |
| scheduled_at | TIMESTAMPTZ | NULL | |
| started_at | TIMESTAMPTZ | NULL | |
| completed_at | TIMESTAMPTZ | NULL | |
| duration_ms | INTEGER | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_bg_jobs_queue_status` on (queue, status, priority DESC, created_at)
- `idx_bg_jobs_org` on (organization_id)
- `idx_bg_jobs_scheduled` on (scheduled_at) WHERE scheduled_at IS NOT NULL AND status = 'queued'

**Partitioning:** BY RANGE (created_at) — monthly. Dead letter entries retained longer.

---

## 6. Relationships & ER Design

### 6.1 Core Entity Relationship Diagram (Textual)

```text
ORGANIZATIONS
│
├── 1:N ── ENTITIES
│           │
│           ├── 1:N ── BANK_ACCOUNTS
│           ├── 1:N ── CHART_OF_ACCOUNTS
│           ├── 1:N ── FISCAL_PERIODS
│           ├── 1:N ── TRANSACTIONS
│           └── 1:N ── CASH_POSITIONS
│
├── 1:N ── USERS
│           │
│           ├── N:M ── ROLES (via USER_ROLES)
│           ├── 1:N ── SESSIONS
│           ├── 1:N ── API_KEYS
│           └── 1:N ── AI_CONVERSATIONS
│
├── 1:N ── ROLES
│           └── N:M ── PERMISSIONS (via ROLE_PERMISSIONS)
│
├── 1:N ── VENDORS
│           ├── 1:N ── VENDOR_BANK_ACCOUNTS
│           ├── 1:N ── VENDOR_CONTRACTS
│           ├── 1:N ── VENDOR_RISK_SCORES
│           └── 1:N ── INVOICES
│
├── 1:N ── CUSTOMERS
│           ├── 1:N ── CUSTOMER_INVOICES
│           └── 1:N ── COLLECTIONS
│
├── 1:N ── TRANSACTIONS
│           ├── 1:N ── TRANSACTION_LINES
│           └── N:1 ── RECONCILIATION_MATCHES
│
├── 1:N ── INVOICES
│           ├── 1:N ── INVOICE_LINES
│           ├── 1:N ── INVOICE_PAYMENTS
│           └── 1:N ── CREDIT_NOTES
│
├── 1:N ── PAYMENTS
│           └── N:1 ── PAYMENT_BATCHES
│
├── 1:N ── JOURNAL_ENTRIES
│           ├── 1:N ── JOURNAL_LINES
│           └── N:1 ── FISCAL_PERIODS
│
├── 1:N ── BUDGETS
│           ├── 1:N ── BUDGET_LINES
│           └── 1:N ── BUDGET_VERSIONS
│
├── 1:N ── FORECASTS
│           └── 1:N ── FORECAST_SCENARIOS
│
├── 1:N ── FRAUD_ALERTS
│           └── N:1 ── FRAUD_CASES
│
├── 1:N ── COMPLIANCE_CONTROLS
│           ├── 1:N ── COMPLIANCE_CONTROL_TESTS
│           └── 1:N ── COMPLIANCE_ISSUES
│
├── 1:N ── WORKFLOWS
│           ├── 1:N ── WORKFLOW_VERSIONS
│           └── 1:N ── WORKFLOW_RUNS
│
├── 1:N ── RULES
│           ├── 1:N ── RULE_VERSIONS
│           └── 1:N ── RULE_EXECUTIONS
│
├── 1:N ── AI_CONVERSATIONS
│           └── 1:N ── AI_MESSAGES
│
├── 1:N ── DOCUMENTS
│           ├── 1:N ── DOCUMENT_VERSIONS
│           ├── 1:N ── DOCUMENT_EMBEDDINGS
│           └── 1:N ── DOCUMENT_CHUNKS
│
├── 1:N ── SUBSCRIPTIONS
│           └── 1:N ── USAGE_RECORDS
│
├── 1:N ── AUDIT_LOGS
├── 1:N ── NOTIFICATIONS
├── 1:N ── WEBHOOKS
├── 1:N ── API_KEYS
└── 1:N ── INTEGRATION_CONNECTORS
```

### 6.2 Financial Core ER Diagram

```text
ORGANIZATIONS
  │
  ├── ENTITIES
  │     ├── BANK_ACCOUNTS ── 1:N ── TRANSACTIONS
  │     │                                    │
  │     │                                    ├── 1:N ── TRANSACTION_LINES ── N:1 ── TRANSACTION_CATEGORIES
  │     │                                    │
  │     │                                    └── N:1 ── RECONCILIATION_MATCHES
  │     │                                                │
  │     │                                                └── N:1 ── BANK_STATEMENT_LINES ── N:1 ── BANK_STATEMENTS
  │     │
  │     ├── CHART_OF_ACCOUNTS
  │     │     └── N:1 (self-referencing parent hierarchy)
  │     │
  │     ├── FISCAL_PERIODS
  │     │     └── 1:N ── JOURNAL_ENTRIES
  │     │                       │
  │     │                       ├── 1:N ── JOURNAL_LINES ── N:1 ── CHART_OF_ACCOUNTS
  │     │                       │
  │     │                       └── account_balances (derived from journal_lines)
  │     │
  │     └── 1:N ── INVOICES
  │                  │
  │                  ├── 1:N ── INVOICE_LINES
  │                  ├── 1:N ── INVOICE_PAYMENTS ── N:1 ── PAYMENTS
  │                  └── 1:N ── CREDIT_NOTES
  │
  ├── VENDORS ── 1:N ── INVOICES (AP side)
  ├── CUSTOMERS ── 1:N ── CUSTOMER_INVOICES (AR side)
  │
  └── PAYMENT_BATCHES
        └── 1:N ── PAYMENTS
```

### 6.3 AI Service ER Diagram

```text
AI_CONVERSATIONS
  │
  ├── 1:N ── AI_MESSAGES
  │             │
  │             ├── 1:N ── AI_MESSAGE_SOURCES (citations)
  │             └── N:1 ── AI_AGENT_RUNS
  │
  └── AI_MEMORY (user/organization context)

AI_AGENT_RUNS
  └── 1:N ── AI_AGENT_STEPS (individual tool calls)

AI_PROMPTS              AI_PROMPT_VERSIONS
  └── AI_TEMPLATES

DOCUMENTS ── 1:N ── DOCUMENT_EMBEDDINGS
  │                 (vector storage)
  └── 1:N ── DOCUMENT_CHUNKS (text chunks)

AI_EVALUATIONS          AI_FEEDBACK
  └── AI_MODEL_USAGE
```

### 6.4 Multi-Tenant Relationships

```text
ORGANIZATIONS (root)
  │
  ├── All tenant-owned tables have `organization_id` FK
  ├── RLS policy: `organization_id = current_setting('app.organization_id')`
  │
  ├── System-owned tables (no org_id):
  │     ├── permissions (global)
  │     ├── connector_definitions (global)
  │     ├── subscription_plans (global)
  │     └── notification_templates (global)
  │
  └── Cross-tenant prevention:
        - All JOINs include organization_id filter
        - RLS enforced at database level
        - Application layer double-checks
```

---

## 7. Multi-Tenant Strategy

### 7.1 Tenancy Architecture

| Isolation Level | Method | Targets | Data Separation |
|---|---|---|---|
| **Level 1 (Default)** | Shared tables + organization_id column + RLS | Starter, Growth | Logical |
| **Level 2** | Schema per tenant (same database) | Enterprise | Namespace |
| **Level 3** | Database per tenant (same cluster) | Regulated Enterprise | Physical |
| **Level 4** | Dedicated cluster per tenant | Highest compliance | Full isolation |

### 7.2 Row-Level Security (RLS) Implementation

```text
-- Enable RLS on all tenant-owned tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
-- ... (all 100+ tenant tables)

-- Create tenant isolation policy
CREATE POLICY tenant_isolation ON transactions
  FOR ALL
  USING (organization_id = current_setting('app.organization_id')::UUID);

-- Create admin override policy
CREATE POLICY admin_access ON transactions
  FOR SELECT
  USING (current_setting('app.user_role') IN ('super_admin', 'support'));
```

### 7.3 Tenant Context Propagation

```text
Application ──► Set session variable ──► RLS enforcement
                    │
                    ├── SET app.organization_id = '...'
                    ├── SET app.user_id = '...'
                    ├── SET app.user_role = '...'
                    └── SET app.user_permissions = '...'
```

### 7.4 Cross-Tenant Prevention Rules

| Scenario | Prevention |
|---|---|
| API query without org context | Reject at application layer (400 Bad Request) |
| Direct SQL with wrong org_id | RLS blocks (403 insufficient permission) |
| Foreign key across tenants | Impossible — org_id FK constraint |
| Admin viewing tenant data | Explicit impersonation flow with audit |
| Data export containing multiple tenants | RLS ensures single-tenant export |
| AI context leakage | Tenant-isolated vector DB collections |

### 7.5 Super Admin Access Model

| Operation | Method | Audit |
|---|---|---|
| Read tenant data | Impersonation (time-limited session) | SUPER_AUDIT log entry |
| Write tenant data | Support tool with explicit reason | SUPER_AUDIT + tenant audit |
| Export tenant data | Compliance request workflow | Full audit trail |
| Delete tenant data | GDPR deletion request | Signed off by 2 admins |

---

## 8. Financial Data Model

### 8.1 Chart of Accounts Design

```text
Account Hierarchy:
  Level 1: Category (Asset, Liability, Equity, Revenue, Expense)
  Level 2: Class (Current Asset, Fixed Asset, etc.)
  Level 3: Group (Cash, Receivables, Inventory, etc.)
  Level 4: Account (Petty Cash, Checking Account, etc.)
  Level 5: Sub-Account (optional, entity-specific)

Code Structure:
  XXXX-YYYY
  │        │
  │        └── Specific account (1000-9999)
  │
  └── Category prefix:
      1 = Asset
      2 = Liability
      3 = Equity
      4 = Revenue
      5 = Expense
```

### 8.2 Double-Entry Accounting Rules

| Rule | Implementation |
|---|---|
| **Every journal entry must balance** | CHECK (total_debits = total_credits) |
| **Each line is either debit OR credit** | CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0)) |
| **Posted entries are immutable** | Status = 'posted' prevents UPDATE. Reversal creates new entry. |
| **Accounts have normal balance** | debit accounts: debit increases, credit decreases. credit accounts: opposite. |
| **Periods are sequential** | Period N+1 cannot be closed before Period N. |
| **Posting requires open period** | Trigger validates period.status = 'open' before posting. |

### 8.3 Journal Posting Flow

```text
Draft ──► Pending Approval ──► Approved ──► Posted ──► (Immutable)
  │                             │              │
  └── Edit                      └── Reject     └── Reversal
                                (back to Draft)    │
                                                   └── New reversing JE
                                                       (linked via reversal_entry_id)
```

### 8.4 Fiscal Period Lifecycle

```text
Period Created (status: future)
  │
  │ [Period start date reached]
  ▼
Period Open (status: open)
  │
  │ [Journal entries can be posted]
  │ [Month-end close initiated]
  ▼
Period Closing (status: closing)
  │
  │ [Close checklist items executed]
  │ [Reconciliations completed]
  │ [Adjusting entries posted]
  ▼
Period Closed (status: closed)
  │
  │ [No further postings allowed]
  │ [Statements generated]
  ▼
Period Locked (status: locked)
  │
  │ [Immutable. Override requires Controller+ approval]
  ▼
[Post-close adjustment entry in next period if needed]
```

### 8.5 Multi-Currency Handling

| Concept | Implementation |
|---|---|
| **Original Amount** | Stored in `currency` column with original value in `amount` |
| **Base Currency Amount** | Always stored in `base_currency_amount` using exchange rate at transaction date |
| **Exchange Rate** | Captured in `exchange_rate` column. Sourced from daily rates table (`exchange_rates`). |
| **Reporting Conversion** | For consolidated reporting, period-end rates applied to non-base-currency balances |
| **FX Gain/Loss** | Calculated at period-end via revaluation journal entry |
| **Rate Source** | `exchange_rates` table with date, from_currency, to_currency, rate, source |

### 8.6 Account Balance Calculation

```text
Account Balance Calculation (end of period):
  closing_balance = opening_balance
                  + SUM(debits WHERE account_id = X AND period_id = P)
                  - SUM(credits WHERE account_id = X AND period_id = P)

Where:
  For debit-normal accounts (Asset, Expense):
    closing_balance = opening_balance + period_debits - period_credits

  For credit-normal accounts (Liability, Equity, Revenue):
    closing_balance = opening_balance + period_credits - period_debits
```

---

## 9. AI Data Model

### 9.1 RAG Architecture Storage

```text
Document Upload
  │
  ├──► Documents table (metadata: org_id, type, status, size)
  │
  ├──► OCR Processing
  │     └──► ocr_results table (raw_text, confidence, fields)
  │
  ├──► Text Chunking
  │     └──► document_chunks table (chunk_text, chunk_index, token_count, document_id)
  │
  └──► Embedding Generation
        └──► document_embeddings table (embedding vector, chunk_text_hash, model)
              │
              └──► Vector Database (Qdrant/Pinecone) for semantic search
```

### 9.2 Conversation Memory

```text
ai_memory table:
  user_id       │ UUID          │ FK
  organization_id│ UUID          │ FK
  memory_type   │ VARCHAR(50)   │ preference, fact, context, style
  key           │ VARCHAR(255)  │ memory key
  value         │ TEXT          │ memory value
  confidence    │ NUMERIC(5,4)  │ confidence in this memory
  expires_at    │ TIMESTAMPTZ   │ optional expiry
  created_at    │ TIMESTAMPTZ   │

  UNIQUE on (user_id, organization_id, memory_type, key)
```

### 9.3 AI Cost Tracking

```text
ai_model_usage table:
  organization_id   │ UUID          │ FK
  model             │ VARCHAR(100)  │ gpt-4o, claude-3.5, etc.
  prompt_tokens     │ INTEGER       │
  completion_tokens │ INTEGER       │
  total_tokens      │ INTEGER       │
  cost_usd          │ NUMERIC(10,6) │ computed cost
  request_type      │ VARCHAR(50)   │ chat, embedding, analysis, etc.
  user_id           │ UUID          │ FK
  conversation_id   │ UUID          │ FK
  latency_ms        │ INTEGER       │
  recorded_at       │ TIMESTAMPTZ   │

  PARTITION BY RANGE (recorded_at) — daily
```

### 9.4 Agent Execution Trace

```text
ai_agent_steps table:
  agent_run_id  │ UUID          │ FK → ai_agent_runs.id
  step_order    │ INTEGER       │ execution sequence
  tool_name     │ VARCHAR(100)  │ tool called
  input         │ JSONB         │ tool input
  output        │ JSONB         │ tool output
  duration_ms   │ INTEGER       │ step latency
  status        │ VARCHAR(20)   │ success, error
  error_message │ TEXT          │ if failed
  tokens_used   │ INTEGER       │ for LLM steps
  created_at    │ TIMESTAMPTZ   │
```

---

## 10. Workflow Data Model

### 10.1 Workflow Definition Structure

```text
workflows table (header)
  │
  ├── workflow_versions (immutable snapshot)
  │     └── definition JSONB structure:
  │           {
  │             "nodes": [
  │               { "id": "trigger_1", "type": "trigger", "config": {...} },
  │               { "id": "condition_1", "type": "condition", "config": {...} },
  │               { "id": "action_1", "type": "action", "config": {...} },
  │               { "id": "approval_1", "type": "human_approval", "config": {...} },
  │               { "id": "ai_1", "type": "ai_step", "config": {...} }
  │             ],
  │             "edges": [
  │               { "from": "trigger_1", "to": "condition_1" },
  │               { "from": "condition_1", "to": "action_1", "label": "YES" },
  │               { "from": "condition_1", "to": "action_2", "label": "NO" }
  │             ]
  │           }
  │
  └── workflow_runs (execution instances)
        └── workflow_steps (individual step execution records)
```

### 10.2 Workflow Execution State Machine

```text
Workflow Run States:
  QUEUED ──► RUNNING ──► COMPLETED
                │
                ├──► FAILED ──► RETRYING ──► RUNNING
                │                │
                │                └──► DEAD_LETTER
                │
                └──► ESCALATED ──► COMPLETED
                                │
                                └──► FAILED

Step States:
  PENDING ──► SKIPPED
     │
     └──► RUNNING ──► COMPLETED
                │
                ├──► FAILED ──► RETRYING ──► RUNNING
                │
                └──► AWAITING_APPROVAL ──► APPROVED ──► COMPLETED
                                      │
                                      └──► REJECTED ──► FAILED
```

---

## 11. Rule Engine Data Model

### 11.1 Rule Structure

```text
rules table (header)
  │
  ├── rule_versions (immutable snapshots)
  │     ├── rule_conditions (individual conditions)
  │     │     ├── condition_type: amount, vendor_risk, category, entity, etc.
  │     │     ├── operator: >, >=, =, <, <=, IN, CONTAINS, MATCHES
  │     │     ├── value: JSONB (flexible value storage)
  │     │     └── logic_group: AND/OR grouping
  │     │
  │     └── rule_actions (individual actions)
  │           ├── action_type: flag, hold, approve, reject, notify, route
  │           ├── config: JSONB (action-specific parameters)
  │           └── execution_order: integer
  │
  ├── rule_executions (execution log)
  │
  └── rule_simulations (test results)
```

### 11.2 Rule Evaluation Flow

```text
Event Triggered
  │
  ▼
Load Active Rules (ordered by priority)
  │
  ▼
For each rule:
  │
  ├── Evaluate conditions (left-to-right, short-circuit)
  │     │
  │     ├── All conditions met? ──► Execute actions
  │     │                              │
  │     │                              ├── Log execution
  │     │                              ├── Apply actions
  │     │                              └── Short-circuit (if configured)
  │     │
  │     └── Conditions not met? ──► Skip rule, check next
  │
  └── Log evaluation (regardless of match)
```

---

## 12. Audit Model

### 12.1 Audit Philosophy

| Principle | Implementation |
|---|---|
| **Immutable** | `audit_logs` is APPEND-ONLY. No UPDATE, no DELETE. TRUNCATE requires super-user. |
| **Complete** | Every state-changing action is logged. Read actions logged for sensitive resources (PII, financial data). |
| **Traceable** | Every log has `correlation_id` linking to the original request. Distributed `trace_id` for cross-service tracing. |
| **Tamper-evident** | Optional: SHA-256 hash chain linking each log entry to previous entry's hash (for highest compliance). |
| **Retained** | 7-10 years per plan. Partitioned by month for efficient archival. |

### 12.2 Audit Events Coverage

| Action Type | Examples | Always Logged? |
|---|---|---|
| **CREATE** | Invoice created, User invited, Budget created | ✅ Always |
| **UPDATE** | Invoice approved, Payment held, Role changed | ✅ Always |
| **DELETE** | Invoice deleted, User deactivated | ✅ Always |
| **READ (sensitive)** | View PII, Export audit logs, Access reports | ✅ Always |
| **READ (standard)** | View transaction list, Search vendors | ❌ Not logged |
| **AUTH** | Login, Logout, MFA verify, Password reset | ✅ Always |
| **AI** | AI chat, Report generation, AI recommendation | ✅ Always |
| **SYSTEM** | Sync completed, Job failed, Integration error | ✅ Always |
| **ADMIN** | Impersonation, Feature flag change, Settings change | ✅ Always |

### 12.3 Audit Log Detail Level

```text
Standard Audit Entry:
  actor_id: UUID            │ Who?
  action: 'update'          │ What?
  resource_type: 'invoice'  │ On what?
  resource_id: UUID         │ Which record?
  changes_summary:          │ Human readable
    'Status changed from "draft" to "pending_approval"'
  ip_address: INET          │ From where?
  correlation_id: UUID      │ Request tracking
  created_at: TIMESTAMPTZ   │ When?

Full Audit Entry (financial mutations):
  + previous_values: JSONB   │ Before state
  + new_values: JSONB        │ After state
  + reason: TEXT             │ Why? (user provided)
  + trace_id: VARCHAR(100)   │ Distributed trace
```

---

## 13. Analytics Model

### 13.1 Analytics Architecture

```text
Operational PostgreSQL ──► CDC Pipeline ──► Data Warehouse
       │                          │                │
       │                    [Debezium/Kafka]   [Snowflake/BigQuery]
       │                          │                │
       ▼                          ▼                ▼
  Current data              CDC events        Historical + Aggregated
  (normalized)               (stream)         (denormalized OLAP)

Materialized Views (in PostgreSQL):
  ┌─────────────────────────────────────────────────────┐
  │ mv_dashboard_kpis                                   │
  │   - Real-time aggregated KPIs for dashboard         │
  │   - Refreshed every 5 minutes                       │
  │                                                     │
  │ mv_daily_financial_summary                          │
  │   - Daily revenue, expenses, cash position          │
  │   - Refreshed daily                                 │
  │                                                     │
  │ mv_account_balances_monthly                         │
  │   - Pre-computed account balances per period        │
  │   - Refreshed on period close                       │
  │                                                     │
  │ mv_fraud_metrics_daily                              │
  │   - Daily fraud alert counts, amounts prevented     │
  │   - Refreshed hourly                                │
  └─────────────────────────────────────────────────────┘
```

### 13.2 Materialized View Specifications

#### `mv_dashboard_kpis`

| Column | Type | Source |
|---|---|---|
| organization_id | UUID | |
| entity_id | UUID | |
| period_start | DATE | |
| period_end | DATE | |
| total_cash | NUMERIC(19,4) | SUM(bank_accounts.balance_current) |
| revenue_mtd | NUMERIC(19,4) | SUM(journal_lines.credit WHERE account IN revenue) |
| expenses_mtd | NUMERIC(19,4) | SUM(journal_lines.debit WHERE account IN expense) |
| net_income_mtd | NUMERIC(19,4) | revenue_mtd - expenses_mtd |
| ar_aging_total | NUMERIC(19,4) | SUM(customer_invoices.amount WHERE unpaid) |
| ap_aging_total | NUMERIC(19,4) | SUM(invoices.amount WHERE unpaid) |
| runway_days | INTEGER | total_cash / avg_daily_burn |
| pending_approvals | INTEGER | COUNT(workflow_approvals WHERE pending) |
| active_alerts | INTEGER | COUNT(fraud_alerts WHERE open) |
| refreshed_at | TIMESTAMPTZ | |

**Refresh Strategy:** Every 5 minutes via pg_cron
**Index:** UNIQUE on (organization_id, entity_id, period_start)

#### `mv_account_balances_monthly`

| Column | Type | Source |
|---|---|---|
| organization_id | UUID | |
| account_id | UUID | |
| fiscal_year | INTEGER | |
| fiscal_month | INTEGER | |
| opening_balance | NUMERIC(19,4) | Prior month closing |
| period_debits | NUMERIC(19,4) | SUM(debits) |
| period_credits | NUMERIC(19,4) | SUM(credits) |
| closing_balance | NUMERIC(19,4) | Computed |
| transaction_count | INTEGER | COUNT(*) |

**Refresh Strategy:** On period close + on-demand
**Index:** UNIQUE on (organization_id, account_id, fiscal_year, fiscal_month)

---

## 14. Performance Strategy

### 14.1 Index Strategy

| Index Type | When to Use | Examples |
|---|---|---|
| **B-Tree** | Primary keys, unique constraints, equality lookups | `org_id`, `status`, `email` |
| **Composite B-Tree** | Multi-column queries with specific filter patterns | `(org_id, status, created_at DESC)` |
| **Partial Index** | Queries filtering on a subset of rows | `WHERE status = 'active'`, `WHERE deleted_at IS NULL` |
| **Covering Index** | Query that only needs indexed columns | `(org_id, status) INCLUDE (amount, currency)` |
| **GIN** | Full-text search, JSONB queries, arrays | `to_tsvector('english', description)` |
| **BRIN** | Large time-series tables with natural ordering | `(created_at)` on audit_logs, transactions |
| **IVFFLAT** | Vector similarity search (pgvector) | `(embedding)` for document chunks |
| **GiST** | Exclusion constraints, geometric data | Rarely needed, kept for future |

### 14.2 Composite Index Recommendations

```text
-- Financial tables (high-write, high-read)
transactions:        (organization_id, posted_date DESC) WHERE deleted_at IS NULL
transactions:        (organization_id, status, posted_date DESC)
journal_entries:     (organization_id, period_id, status)
journal_lines:       (journal_entry_id) INCLUDE (account_id, debit, credit)

-- Time-series tables (high-write)
audit_logs:          (organization_id, created_at DESC) — BRIN preferred
ai_messages:         (conversation_id, created_at) — BRIN preferred
fraud_alerts:        (organization_id, created_at DESC) — BRIN preferred

-- Lookup tables (low-write, high-read)
users:               (organization_id, email) WHERE deleted_at IS NULL
api_keys:            (key_hash)
roles:               (organization_id, slug)
permissions:         (code)

-- Search tables
vendors:             GIN on to_tsvector('english', name || ' ' || description)
transactions:        GIN on to_tsvector('english', description)
documents:           GIN on to_tsvector('english', COALESCE(filename, '') || ' ' || COALESCE(description, ''))
```

### 14.3 Partitioning Strategy

| Table | Partition Key | Interval | Retention |
|---|---|---|---|
| transactions | posted_date | Monthly | 7+ years |
| audit_logs | created_at | Monthly | 7-10 years |
| ai_messages | created_at | Monthly | 1 year |
| ai_agent_runs | created_at | Monthly | 1 year |
| journal_entries | created_at | Quarterly | 7+ years |
| payments | created_at | Monthly | 7+ years |
| invoices | invoice_date | Quarterly | 7+ years |
| fraud_alerts | created_at | Monthly | 3 years |
| workflow_runs | created_at | Monthly | 1 year |
| usage_records | recorded_at | Monthly | 2 years |
| notifications | created_at | Monthly | 90 days |
| sessions | created_at | Monthly | 90 days |
| api_logs | created_at | Daily | 90 days |
| webhook_deliveries | created_at | Monthly | 90 days |

### 14.4 Partition Management Strategy

```text
-- Automated partition management via pg_partman
-- Creates new partitions automatically
-- Detaches old partitions for archival

Configuration:
  - Create partitions 3 months in advance
  - Detach + archive partitions past retention
  - Keep detached partitions available for 30 days (grace period)
  - Move to cold storage (S3 Glacier) after grace period

-- Example: Monthly partition for transactions
transactions_2026_01
transactions_2026_02
...
transactions_2033_12
```

### 14.5 Query Optimization Guidelines

| Pattern | Recommendation |
|---|---|
| **Dashboard queries** | Materialized views, 5-minute cache |
| **List pages** | LIMIT + pagination, composite index on sort column |
| **Search** | GIN index on tsvector, pg_trgm for fuzzy matching |
| **Aggregations** | Materialized views or pre-aggregated tables |
| **AI queries** | Read replicas for chat history, Redis for session context |
| **Export queries** | Read replicas, streaming cursor, chunked results |
| **Reconciliation** | Composite index on (org_id, bank_account_id, external_id) |
| **Period close** | Sequential processing, table locks on account_balances |

### 14.6 Caching Strategy

| Data | Cache | TTL | Invalidation |
|---|---|---|---|
| Session data | Redis | Session lifetime | On logout |
| KPI dashboard data | Redis | 5 minutes | On new transaction/post |
| Rate limits | Redis | Window duration | Time-based expiry |
| User permissions | Redis | 15 minutes | On role change |
| Integration tokens | Redis | Until expiry | On refresh |
| Exchange rates | Redis | 1 hour | On rate update |
| Feature flags | Redis | 5 minutes | On flag change |
| Page-level cache (HTML) | CDN | 1 minute | On content change |

### 14.7 Connection Pooling

```text
PgBouncer Configuration:
  - Pool Mode: transaction
  - Default Pool Size: 200
  - Max DB Connections: 400 (primary)
  - Reserve Pool: 20
  - Reserve Pool Timeout: 5s
  - Max Client Connections: 1000
  - Timeout: 30s
  - Idle Transaction Timeout: 60s

Application-Side:
  - Max connections per service instance: 20
  - Connection timeout: 5s
  - Statement timeout: 30s (standard), 5min (reports)
  - Idle in transaction timeout: 30s
```

### 14.8 Vacuum Strategy

| Table | Vacuum Strategy | Frequency |
|---|---|---|
| **High-write tables** (transactions, audit_logs, ai_messages) | autovacuum = aggressive, scale_factor = 0.01 | Continuous |
| **Medium-write tables** (invoices, payments, journal_entries) | autovacuum = standard, scale_factor = 0.05 | Continuous |
| **Low-write tables** (users, roles, chart_of_accounts) | autovacuum = relaxed, scale_factor = 0.1 | Continuous |
| **Materialized views** | Manual VACUUM after refresh | After each refresh |
| **Partitioned tables** | autovacuum on parent + individual partitions | Continuous |

**Additional:**
- `VACUUM FREEZE` during low-traffic windows (weekly)
- `REINDEX` for bloated indexes (monthly, monitored)
- Track bloat via `pg_stat_user_tables.n_dead_tup` alerting

---

## 15. Security

### 15.1 Encryption Strategy

| Layer | Method | Key Management |
|---|---|---|
| **At Rest (Database)** | AES-256 (TDE or filesystem-level) | AWS KMS / Azure Key Vault / HashiCorp Vault |
| **At Rest (Columns)** | pgcrypto AES-256 | Application-level, key per organization (Enterprise) |
| **In Transit** | TLS 1.3 | Auto-rotation via cert-manager |
| **Backups** | AES-256 with separate backup key | Vault, rotated annually |
| **Object Storage** | Server-side encryption (S3 SSE-S3 or SSE-KMS) | Cloud KMS |
| **Vector DB** | TLS + encryption at rest | Provider-managed |

### 15.2 Column-Level Encryption

**Encrypted Columns:**
| Table | Columns | Encryption | Access |
|---|---|---|---|
| bank_accounts | account_number, routing_number | pgcrypto | Treasury+ |
| vendor_bank_accounts | account_number, routing_number | pgcrypto | Procurement+ |
| payments | beneficiary_account_number | pgcrypto | Treasurer+ |
| users | password_hash | bcrypt (not pgcrypto) | Never read |
| api_keys | key_hash | SHA-256 | Never read |
| webhooks | secret | pgcrypto | Admin only |
| integration_connectors | credentials (JSONB) | pgcrypto | Admin only |

### 15.3 Data Masking Rules

| Data Type | Role | Display |
|---|---|---|
| Bank account number | Non-Treasury | ●●●●1234 |
| Bank account number | Treasury+ | Full |
| Vendor bank account | Non-Procurement | ●●●●5678 |
| Vendor bank account | Procurement+ | Full |
| User email | Non-Admin | j***@co.com |
| User email | Admin | Full |
| SSN/Tax ID | Non-Controller | ●●●-●●-1234 |
| SSN/Tax ID | Controller+ | Full |
| Payment beneficiary | Non-Treasury | J*** D** |
| Payment beneficiary | Treasury+ | Full |

### 15.4 PII Data Management

| Requirement | Implementation |
|---|---|
| **Identify PII** | All PII columns tagged in `data_dictionary` |
| **Right to Erasure** | GDPR deletion workflow: anonymize user data, retain financial records |
| **Data Portability** | Generate tenant data export (JSON) within 30 days |
| **Data Residency** | Enterprise: regional PostgreSQL deployment |
| **Retention Limits** | Configurable per data type, enforced by archival jobs |

### 15.5 GDPR / Right to Erasure Workflow

```text
1. User submits erasure request
2. Admin verifies identity
3. System flags user as 'deletion_pending'
4. Retention check: financial records (must keep 7 years)
5. Anonymize user record:
     - Clear personal fields (email → deleted@redacted, name → REDACTED)
     - Remove from auth providers
     - Store anonymized audit trail
6. Financial records: dissociate from user (nullify actor_id for non-critical)
7. Document deletion: remove if within retention, else flag
8. Confirmation report generated
9. Retention lock: ensure no re-association
```

### 15.6 Backup Security

| Requirement | Implementation |
|---|---|
| **Encryption** | AES-256, separate key from primary |
| **Access Control** | Backup access requires MFA + separate role |
| **Testing** | Monthly restore test in isolated environment |
| **Audit** | Every backup/restore operation logged |
| **Cross-Region** | Backups replicated to secondary region |

---

## 16. Event Model

### 16.1 Domain Event Catalog

| Event | Publisher | Subscribers | Payload |
|---|---|---|---|
| **TransactionImported** | Transactions Service | AI Service, Rules Engine, Notifications | transaction_id, organization_id, amount |
| **TransactionCategorized** | AI Service | Transactions Service, Analytics | transaction_id, category_id, confidence |
| **InvoiceCreated** | Invoices Service | Workflow Engine, Notifications | invoice_id, organization_id, amount, vendor_id |
| **InvoiceApproved** | Workflow Engine | Payments Service, Notifications | invoice_id, payment_id (if scheduled) |
| **InvoicePaid** | Payments Service | Invoices Service, Notifications | invoice_id, payment_id, amount |
| **PaymentBatchCreated** | Payments Service | Notifications, Approval Center | batch_id, amount, rail |
| **PaymentBatchReleased** | Payments Service | Notifications, Audit | batch_id, released_by |
| **PaymentFailed** | Payments Service | Notifications, Fraud Service | payment_id, error, retry_count |
| **VendorCreated** | Vendors Service | Fraud Service, Compliance | vendor_id, risk_score |
| **VendorRiskChanged** | Fraud Service | Workflow Engine, Notifications | vendor_id, old_risk, new_risk |
| **FraudAlertCreated** | Fraud Service | Notifications, Audit | alert_id, severity, amount |
| **FraudCaseOpened** | Fraud Service | Notifications | case_id, severity |
| **BudgetExceeded** | Budgets Service | Notifications | budget_id, variance, department |
| **PeriodCloseInitiated** | GL Service | Workflow Engine | period_id, organization_id |
| **PeriodClosed** | GL Service | Reports, Analytics | period_id, closed_by |
| **ReportGenerated** | Reports Service | Notifications | report_id, format, download_url |
| **AIChatCompleted** | AI Service | Billing (usage), Monitoring | conversation_id, tokens, cost |
| **AIRecommendationGenerated** | AI Service | Notifications | recommendation_id, type, confidence |
| **WorkflowCompleted** | Workflow Engine | Notifications | workflow_run_id, status |
| **UserInvited** | Users Service | Notifications | user_id, email, invited_by |
| **UserRoleChanged** | Users Service | Audit, Cache (invalidate) | user_id, old_role, new_role |
| **IntegrationSyncCompleted** | Integration Service | Notifications, Monitoring | connector_id, records_synced, errors |

### 16.2 Event Structure

```json
{
  "id": "evt_abc123",
  "type": "InvoiceApproved",
  "version": 1,
  "timestamp": "2026-06-30T10:23:00Z",
  "publisher": "workflow-engine",
  "correlation_id": "cor_xyz789",
  "trace_id": "trace_def456",
  "organization_id": "org_001",
  "actor_id": "user_042",
  "payload": {
    "invoice_id": "inv_2024_0892",
    "approval_level": 2,
    "approved_by": "user_042"
  },
  "metadata": {
    "request_ip": "203.0.113.42",
    "source": "approval_center"
  }
}
```

### 16.3 Event Delivery Guarantees

| Property | Guarantee |
|---|---|
| **At-least-once delivery** | Events persisted to outbox table before publishing |
| **Ordering** | Per-partition ordering for related events (same organization) |
| **Idempotency** | Events carry idempotency key; consumers deduplicate |
| **Retry** | Exponential backoff: 1s, 5s, 30s, 5min, 30min, max 5 retries |
| **Dead letter** | After max retries, event moved to dead-letter queue |
| **TTL** | Events expire after 7 days in queue |

### 16.4 Outbox Pattern Implementation

```text
┌──────────────┐     ┌──────────────────┐     ┌─────────────┐
│ Application  │ ──► │ event_outbox     │ ──► │ Message     │
│ Service      │     │ (PostgreSQL)     │     │ Broker      │
│              │     │                  │     │ (RabbitMQ/  │
│ Write data + │     │ id, type,        │     │  Temporal)  │
│ event in     │     │ payload,         │     │             │
│ same TX      │     │ status,          │     │ Subscribe   │
│              │     │ created_at       │     │ & deliver   │
└──────────────┘     └──────────────────┘     └─────────────┘
                           │                          │
                     Poll for unsent            Deliver to
                     events (every 1s)          subscribers
```

---

## 17. Data Lifecycle

### 17.1 Data Lifecycle Stages

```text
┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
│ CREATE │──► │ ACTIVE │──► │ SOFT   │──► │ ARCHIVE│──► │ PURGE  │
│        │    │        │    │ DELETE │    │        │    │        │
└────────┘    └────────┘    └────────┘    └────────┘    └────────┘
                   │              │              │
              Normal ops     Deleted by      Retention
                              user/auto      policy met
```

### 17.2 Soft Delete Policy

| Entity Type | Soft Delete Column | Cascading | Restorable |
|---|---|---|---|
| organizations | deleted_at | Yes | Yes (admin only) |
| users | deleted_at | No (orphan records OK) | Yes |
| entities | deleted_at | Block if active records exist | Yes |
| transactions | deleted_at | No | Yes (audit trail) |
| invoices | deleted_at | No | Yes |
| vendors | deleted_at | Block if active AP/PO | Yes |
| customers | deleted_at | Block if active AR | Yes |
| chart_of_accounts | deleted_at | Block if journal activity | No (deactivate only) |
| workflows | deleted_at | No | Yes |
| ai_conversations | deleted_at | No | Yes (30 days) |
| documents | deleted_at | No | Yes (retention pending) |

### 17.3 Archival Strategy

| Data | Active Retention | Archive Trigger | Archive Method |
|---|---|---|---|
| Transactions | 3 years | Partition older than 3 years | Detach partition → S3 Glacier |
| Audit Logs | 2 years | Partition older than 2 years | Detach partition → S3 Glacier |
| AI Messages | 90 days | Partition older than 90 days | Delete (no archive — redacted) |
| AI Agent Runs | 90 days | Partition older than 90 days | Delete (keep cost summary) |
| Notifications | 30 days | Partition older than 30 days | Delete |
| Sessions | 90 days | Partition older than 90 days | Delete |
| API Logs | 90 days | Partition older than 90 days | Delete |
| Webhook Deliveries | 30 days | Partition older than 30 days | Delete |
| Dead Letter Queue | 30 days | Record older than 30 days | Review → Delete |
| Documents | Per policy (1-7 yrs) | Policy-driven | Object storage lifecycle |

### 17.4 Data Retention Matrix

| Data Category | Regulatory Requirement | Platform Default | Enterprise Default | Regulated Enterprise |
|---|---|---|---|---|
| Financial records (GL, JE) | 7 years (varies) | 7 years | 7 years | 10 years |
| Audit logs | 3-7 years | 90 days | 7 years | 10 years |
| Tax records | 7-8 years | 7 years | 7 years | 10 years |
| Invoices/Receipts | 7 years | 1 year | 7 years | 10 years |
| Contracts | 6 years after expiry | Duration + 3 years | Duration + 7 years | Duration + 10 years |
| Bank statements | 5-7 years | 1 year | 7 years | 10 years |
| AI conversations | N/A (best practice) | 90 days | 1 year | Configurable |
| AI usage logs | N/A | 1 year | 1 year | 3 years |
| Session data | N/A | 90 days | 90 days | 90 days |
| API logs | N/A | 90 days | 90 days | 1 year |

---

## 18. Backup & Disaster Recovery Strategy

### 18.1 Backup Schedule

| Backup Type | Frequency | Retention | Storage | Point-in-Time Recovery |
|---|---|---|---|---|
| **WAL archival** | Continuous (every 5 min) | 30-90 days | S3 Standard | Yes — to any point |
| **Full backup** | Daily | 30 days | S3 Standard | N/A |
| **Weekly backup** | Weekly (Sunday) | 12 weeks | S3 Standard | N/A |
| **Monthly backup** | Monthly (1st) | 12 months | S3 Glacier | N/A |
| **Yearly backup** | Yearly | 7 years | S3 Glacier Deep Archive | N/A |

### 18.2 Recovery Point Objectives (RPO)

| Plan Tier | RPO | Method |
|---|---|---|
| Starter | 1 hour | WAL archival |
| Growth | 15 minutes | WAL archival |
| Enterprise | 5 minutes | Synchronous standby + WAL |
| Regulated Enterprise | 1 minute | Synchronous standby + WAL + multi-AZ |

### 18.3 Recovery Time Objectives (RTO)

| Scenario | RTO | Method |
|---|---|---|
| Minor data corruption | 15 minutes | PITR from last clean state |
| Database crash | 30 minutes | Promote standby |
| AZ failure | 1 hour | Cross-AZ failover |
| Region failure | 4 hours | Cross-region recovery |
| Accidental table drop | 15 minutes | PITR to just before drop |

### 18.4 Disaster Recovery Plan

```text
DR Hierarchy:
  1. Read Replicas (for reporting during recovery)
  2. Synchronous Standby (for immediate failover)
  3. WAL Archive (for PITR)
  4. Full Backups (for complete rebuild)
  5. Cross-Region Backups (for region failure)

Failover Procedure:
  1. Detect primary failure (monitoring alert + health check)
  2. Verify standby is caught up (WAL lag < threshold)
  3. Promote standby to primary
  4. Repoint application connections
  5. Launch new standby
  6. Verify data consistency
  7. Update DNS/routing
  8. Notify stakeholders
```

### 18.5 Backup Testing

| Test | Frequency | Success Criteria |
|---|---|---|
| Restore to staging | Weekly | All tables accessible, row counts match |
| PITR test | Monthly | Restore to specific timestamp, verify journal entries |
| Full DR drill | Quarterly | Complete failover + recovery in under RTO |
| Cross-region restore | Semi-annually | Data integrity verified in DR region |

---

## 19. Data Dictionary

### 19.1 Critical Field Definitions

| Field | Tables | Meaning | Validation | Business Rules |
|---|---|---|---|---|
| `organization_id` | All tenant tables | Tenant ownership | UUID, FK → organizations.id | Every record belongs to exactly one org |
| `status` | Most tables | Current state of record | Enum | Must transition through valid states (see state machines) |
| `amount` | Financial tables | Monetary value | NUMERIC(19,4) ≥ 0 | Stored in minor units? No, decimal. |
| `currency` | Financial tables | ISO 4217 code | VARCHAR(3) | Must be valid ISO currency code |
| `base_currency_amount` | Financial tables | Converted amount | NUMERIC(19,4) | Amount converted at transaction exchange rate |
| `exchange_rate` | Financial tables | FX rate | NUMERIC(19,8) | Rate at transaction date from exchange_rates table |
| `deleted_at` | All soft-delete tables | Soft delete timestamp | TIMESTAMPTZ | NULL = active, NOT NULL = deleted |
| `created_at` | All tables | Record creation time | TIMESTAMPTZ, DEFAULT NOW() | Immutable after creation |
| `updated_at` | All tables | Last modification | TIMESTAMPTZ, DEFAULT NOW() | Updated on every state change |
| `metadata` | Most tables | Flexible JSON payload | JSONB, DEFAULT '{}' | No business logic depends on metadata fields |
| `confidence` | AI/ML tables | Confidence score | NUMERIC(5,4) [0-1] | Values < 0.5 should be flagged for review |
| `severity` | Alert/Issue tables | Importance level | ENUM | Critical → High → Medium → Low |
| `correlation_id` | Audit/Event tables | Request tracing | UUID | Same for all events in a single request |
| `idempotency_key` | Payment/Journal tables | Duplicate prevention | VARCHAR(255), UNIQUE | One-time use, reject duplicate submission |

### 19.2 Status Enumerations

#### Transaction Status

```text
posted    → Transaction completed and posted to account
pending   → Transaction imported but not yet posted
voided    → Transaction voided with audit trail
```

#### Invoice Status

```text
draft                → Invoice created but not submitted
pending_approval     → Invoice submitted for approval
approved             → All approvals obtained
paid                 → Payment completed
rejected             → Invoice rejected during approval
on_hold              → Invoice held for investigation
cancelled            → Invoice cancelled (not payable)
```

#### Payment Status

```text
pending         → Payment created, not yet submitted
pending_level1  → Awaiting first approval (dual control)
pending_level2  → Awaiting second approval (dual control)
approved        → All approvals obtained
held            → Payment manually held
released        → Payment sent to bank/financial institution
failed          → Payment rejected by bank or system
cancelled       → Payment cancelled before release
returned        → Payment returned by bank
```

#### Journal Entry Status

```text
draft              → Entry being created
pending_approval   → Submitted for review
posted             → Posted to GL (immutable)
reversed           → Reversed by a reversing entry
rejected           → Rejected during approval
```

#### Workflow Status

```text
draft       → Being designed, not yet active
active      → Running and listening for triggers
paused      → Temporarily stopped
archived    → Deactivated, kept for history
```

#### Rule Status

```text
draft       → Being configured
active      → Enforcing policy
inactive    → Disabled but kept
archived    → Old version, not in use
```

---

## 20. Database Folder Structure

### 20.1 Repository Structure

```text
database/
├── migrations/
│   ├── 00001_initial_schema.sql
│   ├── 00002_add_audit_logs.sql
│   ├── 00003_add_rls_policies.sql
│   ├── ... (sequential, never modified)
│   └── templates/
│       ├── partition_template.sql
│       └── audit_trigger_template.sql
│
├── seeds/
│   ├── 001_permissions.sql
│   ├── 002_default_roles.sql
│   ├── 003_default_coa.sql
│   ├── 004_default_connectors.sql
│   ├── 005_default_prompts.sql
│   ├── 006_plan_definitions.sql
│   └── demo/
│       ├── demo_company.sql
│       ├── demo_transactions.sql
│       └── demo_vendors.sql
│
├── functions/
│   ├── audit/
│   │   ├── fn_audit_trigger.sql
│   │   ├── fn_set_audit_context.sql
│   │   └── fn_gdpr_anonymize_user.sql
│   ├── finance/
│   │   ├── fn_calculate_balance.sql
│   │   ├── fn_generate_journal_number.sql
│   │   ├── fn_validate_balanced_entry.sql
│   │   └── fn_period_close.sql
│   ├── ai/
│   │   ├── fn_search_documents.sql
│   │   ├── fn_search_similar_transactions.sql
│   │   └── fn_cosine_similarity.sql
│   ├── billing/
│   │   ├── fn_calculate_usage.sql
│   │   └── fn_check_credit_limit.sql
│   └── system/
│       ├── fn_generate_batch_number.sql
│       ├── fn_generate_invoice_number.sql
│       └── fn_update_updated_at.sql
│
├── views/
│   ├── vw_account_balances.sql
│   ├── vw_ar_aging_summary.sql
│   ├── vw_ap_aging_summary.sql
│   ├── vw_cash_position.sql
│   ├── vw_fraud_metrics.sql
│   └── vw_audit_log_export.sql
│
├── materialized_views/
│   ├── mv_dashboard_kpis.sql
│   ├── mv_daily_financial_summary.sql
│   ├── mv_account_balances_monthly.sql
│   ├── mv_fraud_metrics_daily.sql
│   ├── mv_spend_by_category.sql
│   └── refresh_jobs.sql
│
├── policies/
│   ├── rls_tenant_isolation.sql
│   ├── rls_admin_access.sql
│   └── rls_audit_log_access.sql
│
├── indexes/
│   ├── idx_finance_tables.sql
│   ├── idx_search_indexes.sql
│   ├── idx_partition_indexes.sql
│   └── idx_concurrent_creation.sql
│
├── partitions/
│   ├── setup_partitions.sql
│   ├── maintenance/
│   │   ├── create_future_partitions.sql
│   │   ├── detach_old_partitions.sql
│   │   └── archive_detached_partitions.sql
│   └── config/
│       └── partition_config.sql
│
├── triggers/
│   ├── trg_audit_log.sql
│   ├── trg_update_timestamps.sql
│   ├── trg_validate_period.sql
│   ├── trg_post_journal.sql
│   └── trg_enforce_balance.sql
│
├── types/
│   ├── status_enums.sql
│   ├── custom_domains.sql
│   └── composite_types.sql
│
├── extensions/
│   ├── enable_extensions.sql
│   └── extension_config.sql
│
├── monitoring/
│   ├── pg_stat_statements_config.sql
│   ├── monitoring_views.sql
│   ├── bloat_monitoring.sql
│   ├── query_performance.sql
│   └── alert_thresholds.sql
│
├── scripts/
│   ├── backup/
│   │   ├── full_backup.sh
│   │   ├── wal_archive.sh
│   │   └── restore_test.sh
│   ├── maintenance/
│   │   ├── vacuum_analyze.sql
│   │   ├── reindex_bloated.sql
│   │   └── refresh_views.sql
│   ├── emergency/
│   │   ├── failover.sh
│   │   ├── pitr_recovery.sh
│   │   └── data_integrity_check.sql
│   └── utils/
│       ├── generate_schema_docs.sql
│       ├── estimate_table_sizes.sql
│       └── find_unused_indexes.sql
│
├── backups/
│   └── (runtime generated — not in repo)
│
├── README.md
├── DATABASE_SCHEMA.md
├── ER_DIAGRAM.md
└── DATA_DICTIONARY.md
```

### 20.2 Migration Guidelines

| Rule | Detail |
|---|---|
| **Naming** | `{NNNNN}_{description}.sql` (e.g., `00042_add_vendor_risk_score.sql`) |
| **Irreversible** | All migrations must have a down migration (rollback script) |
| **Idempotent** | Use `IF NOT EXISTS` / `IF EXISTS` for all DDL |
| **Transactional** | Wrap in BEGIN/COMMIT. One migration = one transaction. |
| **Review** | Every migration requires: + DB architect review + team review |
| **Testing** | Every migration tested on staging with production-like data volume |
| **Zero-downtime** | Add columns as NULLABLE, backfill, then add NOT NULL |
| **Index creation** | Use `CREATE INDEX CONCURRENTLY` for production |
| **Partition changes** | Use pg_partman for automated partition management |

---

*End of Document — DB-FINCOPS-005 v1.0*