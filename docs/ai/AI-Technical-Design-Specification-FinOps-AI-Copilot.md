# Enterprise AI Technical Design Specification

## FinOps AI Copilot — Enterprise AI Financial Intelligence Platform

---

## Document Control

| Field | Value |
|---|---|
| **Document ID** | AI-FINCOPS-008 |
| **Document Title** | Enterprise AI Technical Design Specification |
| **Version** | 1.0 |
| **Status** | Final |
| **Author** | AI Architecture & Machine Learning Engineering Team |
| **Date** | 2026-06-30 |
| **Classification** | Internal — Confidential |
| **Approval Required** | CTO, VP AI/ML, Lead AI Architect, VP Security |

---

## Table of Contents

1. [AI Platform Vision](#1-ai-platform-vision)
2. [AI Platform Architecture](#2-ai-platform-architecture)
3. [Multi-Agent System](#3-multi-agent-system)
4. [Agent Orchestration](#4-agent-orchestration)
5. [RAG Architecture](#5-rag-architecture)
6. [Memory Architecture](#6-memory-architecture)
7. [Tool Calling](#7-tool-calling)
8. [Prompt Engineering](#8-prompt-engineering)
9. [Model Routing](#9-model-routing)
10. [AI Guardrails](#10-ai-guardrails)
11. [AI Evaluation](#11-ai-evaluation)
12. [AI Observability](#12-ai-observability)
13. [Streaming Architecture](#13-streaming-architecture)
14. [Security](#14-security)
15. [AI APIs](#15-ai-apis)
16. [Future AI Capabilities](#16-future-ai-capabilities)

---

## 1. AI Platform Vision

### 1.1 Mission

Build an enterprise-grade AI financial intelligence platform that enables finance teams to make faster, more accurate, and more confident decisions through trusted, explainable, and auditable artificial intelligence.

### 1.2 Objectives

| Objective | Success Metric | Target |
|---|---|---|
| Universal AI access | % of pages with AI surface | 100% |
| Trustworthy responses | Citation rate | >95% |
| Low hallucination | Hallucination rate | <1% |
| Cost efficiency | Cost per AI interaction | <$0.05 (avg) |
| Low latency | Time to first token | <1.5s |
| High adoption | Weekly AI users | >60% of MAU |
| Financial accuracy | Numeric error rate | <0.1% |
| User satisfaction | AI feedback positive rate | >85% |

### 1.3 Guiding Principles

| # | Principle | Description |
|---|---|---|
| 1 | **AI-Native, Not AI-Bolted** | AI is embedded into every product surface, not siloed as a separate feature. Every page has an AI action surface. |
| 2 | **Trust Through Transparency** | Every AI response cites specific sources. Confidence scores are always shown. Uncited claims are flagged. |
| 3 | **Permission-Aware by Default** | AI can only access data the user has permission to see. No data leakage across roles or tenants. |
| 4 | **Human-in-the-Loop for Risk** | AI can analyze, recommend, and explain — but cannot execute financial actions without human approval. |
| 5 | **Cost-Aware Intelligence** | Model routing optimizes between capability and cost. Simple queries use cheaper models; complex analysis uses frontier models. |
| 6 | **Audit-First AI** | Every AI interaction is logged: input, output, tokens, cost, confidence, sources, feedback. Traceable for compliance. |
| 7 | **Continuous Improvement** | Every user feedback, every evaluation result, every failure is used to improve prompts, retrieval, and models. |
| 8 | **Tenant-Isolated Intelligence** | No cross-tenant context leakage. Vector collections, memory, and knowledge bases are tenant-scoped. |

### 1.4 Enterprise AI Philosophy

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    FINOPS AI PHILOSOPHY PYRAMID                       │
│                                                                       │
│                           ┌─────────┐                                 │
│                           │ TRUST   │                                 │
│                           └─────────┘                                 │
│                        ┌──────┴──────┐                                │
│                        │ CITATION    │                                │
│                        │ GROUNDING   │                                │
│                        └──────┬──────┘                                │
│                     ┌─────────┼─────────┐                              │
│                     │         │         │                              │
│                  ┌──┴──┐  ┌──┴──┐  ┌──┴──┐                           │
│                  │PERM │  │CONF │  │HUMAN│                           │
│                  │ISSION│  │IDENCE│  │LOOP │                           │
│                  └─────┘  └─────┘  └─────┘                           │
│                     │         │         │                              │
│           ┌─────────┼─────────┼─────────┼─────────┐                    │
│           │         │         │         │         │                    │
│        ┌──┴──┐  ┌──┴──┐  ┌──┴──┐  ┌──┴──┐  ┌──┴──┐                 │
│        │RAG  │  │TOOLS│  │MEM  │  │AGENTS│  │EVAL │                 │
│        │     │  │     │  │ORY  │  │     │  │     │                 │
│        └─────┘  └─────┘  └─────┘  └─────┘  └─────┘                 │
│                                                                       │
│           FOUNDATION: SECURITY, ISOLATION, AUDIT, COST                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. AI Platform Architecture

### 2.1 Overall Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERACTION LAYER                                   │
│                                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐  │
│  │ Web App  │  │ Mobile   │  │ API      │  │ Slack    │  │ Microsoft Teams       │  │
│  │ (React)  │  │ (React   │  │ Consumers│  │ Bot      │  │ Bot                   │  │
│  │          │  │  Native) │  │          │  │          │  │                       │  │
│  └─────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────────┬───────────┘  │
└────────┼────────────┼──────────────┼──────────────┼──────────────────┼──────────────┘
         │            │              │              │                  │
         ▼            ▼              ▼              ▼                  ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              AI API GATEWAY                                           │
│                                                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐   │
│  │  API PROXY: /api/v1/ai/*                                                        │   │
│  │  - Rate Limiting (per-tenant, per-user, per-model)                              │   │
│  │  - Authentication (JWT, API Key)                                                │   │
│  │  - Authorization (Permission checks)                                            │   │
│  │  - Request Logging (all inputs/outputs)                                          │   │
│  │  - Cost Metering (token counting, billing integration)                          │   │
│  └───────────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              LLM GATEWAY (Model Router)                               │
│                                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐   │
│  │ OpenAI       │  │ Anthropic    │  │ Gemini       │  │ Azure OpenAI          │   │
│  │ GPT-4o       │  │ Claude 3.5   │  │ Gemini 1.5  │  │ GPT-4o (EU region)    │   │
│  │ GPT-4o-mini  │  │ Claude 3     │  │ Gemini 1.5  │  │ GPT-4 (Compliance)    │   │
│  │ GPT-4        │  │ Haiku        │  │  Flash       │  │                       │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └───────────┬────────────┘   │
│         │                 │                 │                      │                 │
│         ▼                 ▼                 ▼                      ▼                 │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │  Model Router Logic:                                                         │   │
│  │  - Task complexity classification                                            │   │
│  │  - Cost optimization (cheapest adequate model)                               │   │
│  │  - Latency optimization (fastest adequate model)                              │   │
│  │  - Compliance routing (data residency, PII handling)                          │   │
│  │  - Fallback chain (primary → secondary → local)                              │   │
│  │  - Load balancing (distribute across providers)                              │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                           AGENT ORCHESTRATION LAYER                                  │
│                                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐   │
│  │ Supervisor   │  │ Planner      │  │ Router       │  │ Human-in-the-Loop     │   │
│  │ Agent        │  │ Agent        │  │ Agent        │  │ Manager               │   │
│  │              │  │              │  │              │  │                        │   │
│  │ Intent       │  │ Step         │  │ Route to     │  │ Escalation            │   │
│  │ Detection    │  │ Planning     │  │ Specialist   │  │ Approval              │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └───────────┬────────────┘   │
└─────────┼─────────────────┼──────────────────┼──────────────────────┼───────────────┘
          │                 │                  │                      │
          ▼                 ▼                  ▼                      ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              SPECIALIST AGENTS                                        │
│                                                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │Financial │ │Fraud     │ │Treasury  │ │Compliance│ │Reporting │ │ Document     │ │
│  │Analysis  │ │Detection │ │Agent     │ │Agent     │ │Agent     │ │ Intelligence │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │Forecast  │ │Budget    │ │Vendor    │ │Accounting│ │Workflow  │ │ Notification │ │
│  │Agent     │ │Agent     │ │Intell.   │ │Agent     │ │Agent     │ │ Agent        │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              TOOL & KNOWLEDGE LAYER                                   │
│                                                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │  TOOLS:                                                                       │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │   │
│  │  │Search  │ │Invoice │ │Vendor  │ │Analytics│ │Report  │ │Workflow│          │   │
│  │  │Txns    │ │Lookup  │ │Lookup  │ │API     │ │Gen     │ │Trigger │          │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘          │   │
│  │                                                                               │   │
│  │  KNOWLEDGE:                                                                    │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────────────┐     │   │
│  │  │Vector DB   │ │Search Index│ │Document    │ │Prompt Library          │     │   │
│  │  │(Qdrant/    │ │(OpenSearch)│ │Store (S3)  │ │(Versioned Templates)   │     │   │
│  │  │ Pinecone)  │ │            │ │            │ │                        │     │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────────────────┘     │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              MEMORY & STATE LAYER                                     │
│                                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐   │
│  │ Conversation │  │ User Memory  │  │ Organization │  │ Session               │   │
│  │ History      │  │ (Preferences,│  │ Memory       │  │ Context               │   │
│  │ (PostgreSQL) │  │  Facts)      │  │ (Policies,   │  │ (Current page,        │   │
│  │              │  │              │  │  Config)     │  │  filters)             │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              GUARDRAIL LAYER                                          │
│                                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Permission   │  │ Output       │  │ Hallucination │  │ PII          │            │
│  │ Check        │  │ Validation   │  │ Detection     │  │ Redaction    │            │
│  │              │  │              │  │               │  │              │            │
│  │ Pre-tool     │  │ Post-        │  │ Citation      │  │ Entity       │            │
│  │ Execution    │  │ Generation   │  │ Verification  │  │ Masking      │            │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘            │
└──────────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              EVALUATION & MONITORING LAYER                            │
│                                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐   │
│  │ Golden       │  │ Live         │  │ User         │  │ Observability          │   │
│  │ Dataset      │  │ Evaluation   │  │ Feedback     │  │ (Prometheus,           │   │
│  │ (Regression) │  │ (Online)     │  │ Collection   │  │  Grafana, Sentry)      │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 AI Request Lifecycle

```text
User Message
  │
  ▼
AI API Gateway ───► Rate Limit Check ───► Auth Check ───► Cost Meter Start
  │
  ▼
Guardrail: Input Validation ───► PII Detection ───► Permission Check
  │
  ▼
Conversation Manager ───► Load Context ───► Load User Memory ───► Load Org Memory
  │
  ▼
Intent Classifier ───► Supervisor Agent
  │                      │
  │                      ├──► Simple: Direct response (no tools needed)
  │                      ├──► Knowledge: Route to RAG pipeline
  │                      ├──► Analytical: Route to Specialist Agent
  │                      ├──► Action: Route to Tool + Approval check
  │                      └──► Complex: Route to Planner Agent
  │
  ▼
Agent Execution (if needed)
  │
  ├──► Plan steps
  ├──► For each step:
  │      ├──► Choose tool (if needed)
  │      ├──► Guardrail: Pre-tool permission check
  │      ├──► Execute tool
  │      ├──► Guardrail: Tool output validation
  │      └──► Aggregate results
  │
  ├──► If human approval needed:
  │      └──► Pause execution ───► Notify user ───► Wait for approval
  │
  └──► Generate final response
  │
  ▼
Guardrail: Output Validation ───► Citation Check ───► Hallucination Detection
  │
  ▼
Format Response ───► Add Sources ───► Add Confidence
  │
  ▼
Stream Response ───► Save to Conversation History
  │
  ▼
Post-Processing:
  ├──► Collect user feedback
  ├──► Update cost meters
  ├──► Log to audit
  ├──► Update evaluation metrics
  └──► Cache results (if applicable)
```

### 2.3 AI Platform Components

| Layer | Component | Technology | Purpose |
|---|---|---|---|
| **API Gateway** | AI API Proxy | NestJS/FastAPI | Route, auth, rate limit, log |
| **LLM Gateway** | Model Router | Python + LiteLLM | Multi-provider routing, fallback |
| **Agent Orchestration** | Agent Framework | Custom agents | Intent detection, planning, routing |
| **Specialist Agents** | Domain Agents | Custom agents | Financial analysis, fraud, compliance |
| **RAG Pipeline** | Vector Search | Qdrant/Pinecone | Semantic document retrieval |
| **RAG Pipeline** | Keyword Search | OpenSearch | Full-text document search |
| **RAG Pipeline** | Re-ranker | Cohere/BGE | Cross-encoder reranking |
| **Memory** | Conversation Store | PostgreSQL + Redis | Chat history, context |
| **Memory** | Vector Memory | Qdrant | User preferences, facts |
| **Guardrails** | Input/Output Guard | Custom + Presidio | PII, permissions, citations |
| **Evaluation** | LLM Evaluator | GPT-4 / Claude | Automated quality scoring |
| **Observability** | Tracing | OpenTelemetry + Langfuse | Trace agents, cost, latency |
| **Streaming** | SSE Server | NestJS | Real-time token streaming |
| **Knowledge Base** | Document Store | PostgreSQL + S3 | Financial documents, policies |

---

## 3. Multi-Agent System

### 3.1 Agent Overview

```text
                           ┌────────────────────────────┐
                           │      SUPERVISOR AGENT      │
                           │  Intent Detection & Routing │
                           └──────────┬─────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            │           │             │             │           │
            ▼           ▼             ▼             ▼           ▼
     ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
     │Financial │ │  Fraud   │ │ Treasury │ │Reporting │ │Compliance│
     │Analysis  │ │Detection │ │  Agent   │ │  Agent   │ │  Agent   │
     └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
     ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
     │Forecast  │ │  Budget  │ │  Vendor  │ │Accounting│ │ Document │
     │  Agent   │ │  Agent   │ │Intell.   │ │  Agent   │ │   Intel  │
     └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
     ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────────────┐
     │Workflow  │ │Notific. │ │Developer │ │  System Health      │
     │  Agent   │ │  Agent   │ │Assistant │ │  Agent              │
     └──────────┘ └──────────┘ └──────────┘ └─────────────────────┘
```

### 3.2 Supervisor Agent

| Property | Specification |
|---|---|
| **Purpose** | Central orchestration agent. Receives all user intents, routes to appropriate specialist agent(s), handles simple queries directly. |
| **Model** | GPT-4o / Claude 3.5 Sonnet (complex routing) |
| **Fallback Model** | GPT-4o-mini / Claude 3 Haiku (simple routing) |

**Responsibilities:**
1. Classify user intent into one of 15+ categories
2. Route to the correct specialist agent
3. Handle simple queries directly (no tool needed)
4. Determine if multi-agent collaboration is needed
5. Check confidence: if < 0.7, ask clarifying question
6. Manage conversation flow and handoffs

**Inputs:**
- User message (text)
- Conversation history (last 20 messages)
- User profile (role, permissions, organization)
- Current page context (URL, filters, selected data)

**Outputs:**
- Intent classification result
- Routed specialist agent ID
- Direct response (for simple queries)
- Clarifying questions (for ambiguous queries)

**Decision Logic:**
```text
IF message requires ONLY general knowledge or greeting:
  → Respond directly (no agent needed)

ELSE IF message requires factual data lookup:
  → Route to RAG pipeline (knowledge retrieval)

ELSE IF message requires financial analysis:
  → Route to Financial Analysis Agent

ELSE IF message requires transaction/invoice/vendor data:
  → Route to tool: Search Transactions / Lookup Invoice / Lookup Vendor

ELSE IF message requires fraud investigation:
  → Route to Fraud Detection Agent

ELSE IF message requires compliance/policy:
  → Route to Compliance Agent

ELSE IF message requires multi-step analysis:
  → Route to Planner Agent (which delegates)

ELSE IF message requires action (approve, create, modify):
  → Route to action + check human approval

ELSE:
  → Ask clarifying question with suggested options
```

**Memory:** Conversation context (last 20 messages), user preferences
**Tools:** `search_knowledge_base`, `route_to_agent`
**Fallback:** If intent confidence < 0.7, ask clarifying questions
**Escalation:** If unable to resolve after 3 attempts, escalate to human support
**KPIs:** Intent accuracy > 90%, Routing accuracy > 95%, Average routing latency < 500ms

---

### 3.3 Financial Analysis Agent

| Property | Specification |
|---|---|
| **Purpose** | Analyze financial data: P&L, variance, KPIs, trends, financial health |
| **Model** | GPT-4o (complex analysis), GPT-4o-mini (simple summaries) |

**Responsibilities:**
1. Answer questions about financial statements
2. Explain variances (actual vs budget, period-over-period)
3. Analyze KPIs and trends
4. Identify financial drivers
5. Generate financial summaries
6. Perform what-if analysis
7. Explain financial health metrics

**Inputs:**
- User query with context (period, entity, metrics)
- Financial data from tools (KPIs, P&L, balances)
- Comparison data (budget, prior periods)

**Outputs:**
- Natural language analysis with numbers
- Variance explanations with drivers
- Visual data (chart descriptions)
- Confidence scores per claim
- Cited sources (report IDs, account codes)

**Tools:**
| Tool | Description |
|---|---|
| `get_dashboard_kpis` | Retrieve KPI data for period |
| `get_pnl_statement` | Get P&L for period and entity |
| `get_balance_sheet` | Get balance sheet data |
| `get_cash_flow` | Get cash flow statement |
| `get_budget_variance` | Get actual vs budget analysis |
| `get_account_balances` | Get GL account balances |
| `get_analytics_drivers` | Get P&L driver analysis |
| `get_financial_ratios` | Calculate financial ratios |
| `search_financial_data` | Semantic search over financial reports |

**Decision Logic:**
```text
IF user asks "show me P&L" or "how is revenue":
  → Use get_pnl_statement
  → Compare with budget (get_budget_variance)
  → Generate variance explanation

IF user asks "what's driving margins":
  → Use get_analytics_drivers
  → Identify top 3 drivers
  → Explain contribution percentages

IF user asks "how is cash position":
  → Use get_cash_flow + get_dashboard_kpis
  → Summarize inflows, outflows, runway

IF user asks "explain this change":
  → Use period-over-period comparison
  → Identify largest contributors
  → Generate root-cause explanation
```

**Memory:** Recent financial analysis context, preferred metrics
**Fallback:** If data unavailable, clearly state "I cannot find data for [specific request]"
**Escalation:** For complex modeling, escalate to Forecasting Agent
**KPIs:** Numeric accuracy > 99%, Explanation helpfulness > 85%

---

### 3.4 Fraud Detection Agent

| Property | Specification |
|---|---|
| **Purpose** | Detect, explain, and recommend actions for financial fraud |
| **Model** | GPT-4o (critical analysis, requires low hallucination) |

**Responsibilities:**
1. Analyze fraud alerts and explain risk factors
2. Investigate suspicious transactions
3. Generate fraud risk memos
4. Recommend investigation actions
5. Identify patterns across alerts
6. Explain false positive vs true positive

**Inputs:**
- Fraud alert ID or transaction ID
- Related transactions, vendors, users
- Historical patterns (velocity, amount, timing)
- Risk scoring data

**Outputs:**
- Risk assessment with confidence score
- Explanation of suspicious factors
- Recommended actions (investigate, hold, dismiss)
- Related evidence (linked transactions, vendor changes)

**Tools:**
| Tool | Description |
|---|---|
| `get_fraud_alert` | Get alert details |
| `get_transaction` | Get transaction with full details |
| `get_vendor_risk` | Get vendor risk assessment |
| `get_vendor_history` | Get vendor payment history |
| `search_related_transactions` | Find related transactions |
| `get_user_activity` | Get user action history |
| `get_fraud_patterns` | Get known fraud patterns |
| `run_anomaly_detection` | Run ML anomaly detection |

**Memory:** Investigation context within case
**Fallback:** If insufficient data, flag low confidence and recommend manual review
**Escalation:** Critical severity alerts always require human review
**KPIs:** True positive identification > 90%, False positive reduction > 30%

---

### 3.5 Treasury Agent

| Property | Specification |
|---|---|
| **Purpose** | Manage liquidity, cash position, FX exposure, treasury operations |
| **Model** | GPT-4o (financial accuracy critical) |

**Responsibilities:**
1. Report cash position and liquidity
2. Forecast cash flow and runway
3. Analyze FX exposure and recommend hedges
4. Recommend investment and borrowing actions
5. Explain treasury metrics
6. Recommend inter-account transfers

**Tools:**
| Tool | Description |
|---|---|
| `get_cash_position` | Get consolidated cash |
| `get_cash_forecast` | Get cash forecast data |
| `get_fx_exposure` | Get FX positions |
| `get_investment_portfolio` | Get investment details |
| `get_credit_lines` | Get borrowing/credit data |
| `calculate_runway` | Calculate cash runway |
| `recommend_transfer` | AI liquidity recommendation |

**KPIs:** Recommendation acceptance rate > 70%, Forecast accuracy improvement > 15%

---

### 3.6 Compliance Agent

| Property | Specification |
|---|---|
| **Purpose** | Manage compliance controls, policies, evidence, certifications |
| **Model** | GPT-4o (precision critical for regulatory) |

**Responsibilities:**
1. Check control status and pass rates
2. Explain compliance requirements
3. Recommend remediation actions
4. Summarize evidence readiness
5. Track certification status
6. Explain policy requirements

**Tools:**
| Tool | Description |
|---|---|
| `get_compliance_controls` | List controls by framework |
| `get_compliance_issues` | Get open issues |
| `get_control_test_results` | Get test history |
| `search_policies` | Search policy documents |
| `get_certification_status` | Get certification status |
| `get_evidence_gaps` | Identify missing evidence |

**KPIs:** Policy search accuracy > 95%, Remediation recommendation helpfulness > 80%

---

### 3.7 Reporting Agent

| Property | Specification |
|---|---|
| **Purpose** | Generate, explain, and summarize financial reports |
| **Model** | GPT-4o (long-form generation) |

**Responsibilities:**
1. Generate financial reports from natural language
2. Summarize existing reports
3. Create executive summaries
4. Draft board pack narratives
5. Generate CFO summaries
6. Explain report contents

**Tools:**
| Tool | Description |
|---|---|
| `generate_report` | Generate report from template |
| `get_report` | Get existing report |
| `list_reports` | Search available reports |
| `get_report_templates` | Get available templates |
| `schedule_report` | Schedule recurring report |

**KPIs:** Report generation accuracy > 90%, Executive summary helpfulness > 85%

---

### 3.8 Forecasting Agent

| Property | Specification |
|---|---|
| **Purpose** | Run, explain, and compare financial forecasts |
| **Model** | GPT-4o (numerical reasoning) |

**Responsibilities:**
1. Run forecast models
2. Explain forecast drivers and assumptions
3. Compare forecast scenarios
4. Explain forecast confidence
5. Recommend scenario adjustments
6. Identify forecast risks

**Tools:**
| Tool | Description |
|---|---|
| `run_forecast` | Execute forecast model |
| `get_forecast` | Get forecast results |
| `compare_scenarios` | Compare scenarios |
| `get_forecast_accuracy` | Get historical accuracy |
| `get_model_list` | List available models |

**KPIs:** Forecast explanation completeness > 90%, Driver identification accuracy > 85%

---

### 3.9 Budget Agent

| Property | Specification |
|---|---|
| **Purpose** | Manage budgets, variance analysis, reforecasting |
| **Model** | GPT-4o-mini (sufficient for budget operations) |

**Responsibilities:**
1. Report budget status and variance
2. Explain budget variances
3. Recommend reforecast adjustments
4. Compare department budgets
5. Track approval status

**Tools:**
| Tool | Description |
|---|---|
| `get_budget` | Get budget details |
| `get_budget_variance` | Get variance analysis |
| `list_budgets` | List department budgets |
| `get_department_spend` | Get department spend |
| `recommend_reforecast` | AI reforecast suggestion |

---

### 3.10 Vendor Intelligence Agent

| Property | Specification |
|---|---|
| **Purpose** | Analyze vendor risk, performance, and relationships |
| **Model** | GPT-4o-mini |

**Responsibilities:**
1. Generate vendor risk memos
2. Analyze spend concentration
3. Recommend vendor actions
4. Track contract compliance
5. Identify savings opportunities

**Tools:**
| Tool | Description |
|---|---|
| `get_vendor_profile` | Get vendor details |
| `get_vendor_risk` | Get risk assessment |
| `get_vendor_spend` | Get spend analysis |
| `get_vendor_contracts` | Get contract details |
| `analyze_concentration` | Concentration analysis |

---

### 3.11 Accounting Agent

| Property | Specification |
|---|---|
| **Purpose** | Assist with journal entries, reconciliation, period close |
| **Model** | GPT-4o (precision required) |

**Responsibilities:**
1. Validate journal entries (balanced, correct accounts)
2. Explain account activity
3. Guide period close process
4. Answer GL questions
5. Suggest account mappings
6. Explain trial balance

**Tools:**
| Tool | Description |
|---|---|
| `validate_journal_entry` | Check JE for balance/accuracy |
| `get_account_activity` | Get account transactions |
| `get_trial_balance` | Get trial balance |
| `get_period_status` | Get period close status |
| `get_account_balance` | Get account balance |
| `suggest_account_mapping` | AI account suggestion |

**KPIs:** Journal entry validation accuracy > 99%, Period close guidance completeness > 90%

---

### 3.12 Document Intelligence Agent

| Property | Specification |
|---|---|
| **Purpose** | Extract, classify, and answer questions about documents |
| **Model** | GPT-4o (document understanding) |

**Responsibilities:**
1. Answer questions about document content
2. Extract structured data from documents
3. Classify document types
4. Summarize document contents
5. Compare document versions
6. Link documents to financial records

**Tools:**
| Tool | Description |
|---|---|
| `search_documents` | Full-text document search |
| `get_document` | Get document content |
| `extract_document_data` | AI field extraction |
| `classify_document` | AI document classification |
| `compare_documents` | Diff two documents |
| `ask_document` | Q&A over single document |

**KPIs:** Document Q&A accuracy > 90%, Field extraction accuracy > 85%

---

### 3.13 Workflow Agent

| Property | Specification |
|---|---|
| **Purpose** | Suggest and explain workflows and automations |
| **Model** | GPT-4o-mini |

**Responsibilities:**
1. Suggest workflow automations
2. Explain workflow execution status
3. Recommend workflow improvements
4. Troubleshoot workflow failures
5. Estimate automation impact

**Tools:**
| Tool | Description |
|---|---|
| `list_workflows` | Get workflow definitions |
| `get_workflow_run` | Get execution details |
| `suggest_workflow` | AI workflow suggestion |
| `get_workflow_analytics` | Get workflow metrics |

---

### 3.14 Notification Agent

| Property | Specification |
|---|---|
| **Purpose** | Generate notification content and digests |
| **Model** | GPT-4o-mini |

**Responsibilities:**
1. Generate daily/weekly AI digest content
2. Summarize notification groups
3. Prioritize notification importance
4. Draft notification messages
5. Summarize unread notifications

---

### 3.15 Developer Assistant Agent

| Property | Specification |
|---|---|
| **Purpose** | Help developers with API integration, webhooks, SDK usage |
| **Model** | GPT-4o-mini |

**Responsibilities:**
1. Answer API documentation questions
2. Generate API request examples
3. Troubleshoot integration issues
4. Explain webhook events
5. Generate SDK code snippets

**Tools:**
| Tool | Description |
|---|---|
| `search_api_docs` | Search API documentation |
| `get_api_usage` | Get API usage stats |
| `get_webhook_logs` | Get webhook delivery logs |
| `get_api_key_info` | Get API key details |

---

### 3.16 System Health Agent

| Property | Specification |
|---|---|
| **Purpose** | Monitor system health, diagnose issues, recommend actions |
| **Model** | GPT-4o-mini |

**Responsibilities:**
1. Summarize system status
2. Diagnose failed jobs
3. Explain queue status
4. Recommend actions for degraded services
5. Summarize incidents

**Tools:**
| Tool | Description |
|---|---|
| `get_system_health` | Get system status |
| `get_background_jobs` | Get job queue status |
| `get_recent_incidents` | Get incident history |
| `get_integration_health` | Get connector health |

---

## 4. Agent Orchestration

### 4.1 Intent Classification & Routing

```text
User Message
  │
  ▼
Intent Classifier
  │
  ├── 1. Query Type Classification:
  │     ├── "Show me..."       → DATA_RETRIEVAL
  │     ├── "Explain..."       → ANALYSIS
  │     ├── "Why did..."       → ROOT_CAUSE_ANALYSIS
  │     ├── "What if..."       → WHAT_IF_ANALYSIS
  │     ├── "Create..."        → ACTION_CREATE
  │     ├── "Approve..."       → ACTION_APPROVE
  │     ├── "Compare..."       → COMPARISON
  │     ├── "Summarize..."     → SUMMARIZATION
  │     ├── "Predict..."       → FORECAST
  │     ├── "Detect..."        → DETECTION
  │     └── "Help..."          → GUIDANCE
  │
  ├── 2. Domain Classification:
  │     ├── Contains "revenue|P&L|profit|margin"         → FINANCE
  │     ├── Contains "fraud|duplicate|suspicious|risk"    → FRAUD
  │     ├── Contains "cash|treasury|liquidity|runway"     → TREASURY
  │     ├── Contains "budget|variance|forecast"           → BUDGET
  │     ├── Contains "invoice|vendor|payment|pay"         → AP
  │     ├── Contains "compliance|control|audit|SOC"       → COMPLIANCE
  │     ├── Contains "document|contract|upload"           → DOCUMENTS
  │     ├── Contains "workflow|automation|rule"           → WORKFLOW
  │     ├── Contains "API|key|webhook|integration"        → DEVELOPER
  │     └── Contains "system|health|status|job"           → SYSTEM
  │
  ├── 3. Complexity Estimation:
  │     ├── Simple: Single tool call, no data transformation
  │     ├── Medium: Multiple tool calls, aggregation needed
  │     ├── Complex: Multi-step planning, multiple agents
  │     └── Critical: Involves financial action, human approval needed
  │
  └── 4. Routing Decision:
        ├── Simple + Finance       → Financial Analysis Agent
        ├── Medium + Fraud         → Fraud Detection Agent
        ├── Complex + Multi-domain → Planner Agent → Multiple Agents
        ├── Action + Critical      → Agent + Hold for Approval
        └── Simple General         → Supervisor direct response
```

### 4.2 Planning & Execution

```text
Complex Query (e.g., "Compare this quarter's revenue vs last quarter,
                   explain the biggest drivers, and forecast next quarter")

Planner Agent receives:
  ├── Decomposes into sub-tasks:
  │     ├── Task 1: Get this quarter's revenue data
  │     ├── Task 2: Get last quarter's revenue data
  │     ├── Task 3: Calculate variance and identify drivers
  │     ├── Task 4: Run forecast model for next quarter
  │     └── Task 5: Synthesize analysis
  │
  ├── Identifies dependencies:
  │     ├── Task 3 depends on Task 1 + Task 2
  │     └── Task 5 depends on Task 3 + Task 4
  │
  ├── Executes plan:
  │     ├── [Parallel] Task 1 → Financial Analysis Agent: get_q2_revenue
  │     ├── [Parallel] Task 2 → Financial Analysis Agent: get_q1_revenue
  │     ├── [Sequential] Task 3 → Financial Analysis Agent: calculate_variance
  │     ├── [Sequential] Task 4 → Forecasting Agent: run_forecast
  │     └── [Sequential] Task 5 → Reporting Agent: synthesize
  │
  └── Returns consolidated response
```

### 4.3 Multi-Agent Collaboration Patterns

| Pattern | Description | Example |
|---|---|---|
| **Sequential** | Agent A output → Agent B input | Financial Analysis → Reporting Agent |
| **Parallel** | Multiple agents run simultaneously | Fraud Agent + Vendor Agent (independent) |
| **Fan-out/Fan-in** | One agent delegates, results aggregated | Supervisor → all agents → supervisor aggregates |
| **Debate** | Two agents analyze same data, compare conclusions | Fraud Agent + Financial Agent analyze same transaction |
| **Hierarchical** | Supervisor → Specialist → Sub-specialist | Supervisor → Fraud Agent → Transaction Analysis |
| **Orchestrator** | Planner creates plan, workers execute | Planner → multiple tool calls → aggregator |

### 4.4 Conflict Resolution

```text
Scenario: Two agents disagree on a recommendation
(e.g., Fraud Agent flags payment as suspicious,
 Financial Agent says it's normal)

Conflict Resolution:
  1. Surface both analyses with confidence scores
  2. Identify specific points of disagreement
  3. Request additional data if needed
  4. If confidence gap > 0.2 → accept higher confidence
  5. If confidence similar → route to supervisor for judgment
  6. If human approval path → present both views to user
  7. Log disagreement for model improvement
```

### 4.5 Human Approval Flow

```text
Agent determines action requires approval
  │
  ├── Criteria for human approval:
  │     ├── Any financial action (payment, write-off, account change)
  │     ├── High-risk decisions (amount > threshold)
  │     ├── First-time action (new vendor payment)
  │     ├── Permission escalation (action outside user's scope)
  │     └── Low confidence (AI confidence < 0.7)
  │
  ├── Pause execution
  ├── Generate "approval request" with:
  │     ├── Action summary
  │     ├── AI recommendation + confidence
  │     ├── Supporting data/citations
  │     ├── Risk assessment
  │     └── Alternative options
  │
  ├── Notify user (in-app notification + email/Slack)
  ├── Wait for response (with configurable timeout)
  │
  ├── IF approved → Continue execution
  ├── IF rejected → Return explanation to user
  └── IF timeout → Escalate to next-level approver
```

---

## 5. RAG Architecture

### 5.1 Overall RAG Pipeline

```text
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              DOCUMENT INGESTION PIPELINE                               │
│                                                                                       │
│  Document Upload                                                                      │
│    │                                                                                  │
│    ├──► File Validation (size, type, malware scan)                                    │
│    │                                                                                  │
│    ├──► Document Classification (AI: invoice, contract, policy, statement, report)    │
│    │                                                                                  │
│    ├──► OCR Processing (if scanned/image PDF)                                         │
│    │     ├──► Text extraction (Tesseract / Azure OCR / AWS Textract)                 │
│    │     ├──► Table extraction (Camelot / Tabula)                                     │
│    │     ├──► Key-value extraction (LayoutLM / custom model)                         │
│    │     └──► Confidence scoring per field                                            │
│    │                                                                                  │
│    ├──► Document Enhancement                                                         │
│    │     ├──► Metadata extraction (date, amount, vendor, invoice #)                   │
│    │     ├──► Entity recognition (PII detection, financial entities)                  │
│    │     └──► Language detection                                                      │
│    │                                                                                  │
│    ├──► Text Chunking                                                                 │
│    │     ├──► Strategy: Section-aware + RecursiveCharacter split                     │
│    │     ├──► Chunk size: 512 tokens (default), 1024 (max)                           │
│    │     ├──► Chunk overlap: 64 tokens                                                │
│    │     ├──► Preserve document structure (headings, tables, lists)                   │
│    │     └──► Special handling: preserve financial tables intact                      │
│    │                                                                                  │
│    ├──► Embedding Generation                                                         │
│    │     ├──► Model: text-embedding-3-large (OpenAI) or voyage-finance-2              │
│    │     ├──► Dimensions: 1536 (default), 1024 (performance mode)                    │
│    │     ├──► Batch size: 100 chunks per batch                                        │
│    │     └──► Store: PostgreSQL pgvector (primary) + Vector DB (Qdrant/Pinecone)      │
│    │                                                                                  │
│    └──► Indexing                                                                      │
│          ├──► PostgreSQL: full-text search index (GIN on chunk_text)                  │
│          ├──► Vector DB: HNSW index on embedding                                     │
│          ├──► OpenSearch: Full-text + keyword index                                  │
│          └──► Metadata index: organization_id, document_type, date_range              │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Chunking Strategy

| Document Type | Chunk Strategy | Chunk Size | Overlap | Special Handling |
|---|---|---|---|---|
| **Invoice** | Section-aware | 256 tokens | 32 | Preserve header (vendor, date, amount) as metadata |
| **Contract** | Section-aware (by clause) | 512 tokens | 64 | Preserve clause numbering, effective dates |
| **Policy** | Section-aware (by policy section) | 512 tokens | 64 | Preserve version, effective date |
| **Bank Statement** | Table-aware | 1024 tokens | 0 (tables indivisible) | Keep table rows together |
| **Financial Report** | Section-aware | 512 tokens | 64 | Preserve charts/table references |
| **Email** | Document-level (short) | Full document | N/A | Preserve thread context |
| **Generic PDF** | RecursiveCharacter | 512 tokens | 64 | Preserve heading hierarchy |

### 5.3 Metadata Schema

```json
{
  "organization_id": "org_xyz",
  "document_id": "doc_001",
  "chunk_index": 3,
  "total_chunks": 12,
  "document_type": "invoice",
  "document_source": "upload",
  "classification": "invoice",
  "classification_confidence": 0.95,
  "language": "en",
  "created_at": "2026-06-30T10:00:00Z",
  "file_size_bytes": 2048000,
  "page_count": 3,
  "extracted_fields": {
    "vendor_name": "ABC Corp",
    "invoice_number": "INV-2024-0892",
    "date": "2026-06-28",
    "amount": "12400.00",
    "currency": "USD"
  },
  "entities": [
    { "type": "DATE", "value": "2026-06-28" },
    { "type": "MONEY", "value": "12400.00" },
    { "type": "ORG", "value": "ABC Corp" }
  ],
  "permissions": {
    "roles": ["accountant", "controller", "ap_manager"],
    "min_role_level": 3
  },
  "retention_policy": "standard_7_years",
  "content_hash": "sha256:abc123..."
}
```

### 5.4 Retrieval Pipeline

```text
User Query
  │
  ▼
Query Processing:
  ├── Query expansion (generate 3 alternative phrasings)
  │     ├── Original: "What are our payment terms with ABC Corp?"
  │     ├── Variant 1: "ABC Corp payment terms Net 30?"
  │     └── Variant 2: "When do we pay ABC Corp invoices?"
  │
  ├── Query classification:
  │     ├── Factual ("what is the due date?") → precision-focused
  │     ├── Exploratory ("what contracts are expiring?") → recall-focused
  │     └── Analytical ("how does our spend compare?") → aggregation
  │
  ├── Permission filter:
  │     └── Filter by organization_id + user role permissions
  │
  ├── Time filter (if applicable):
  │     └── current_period, last_quarter, custom range
  │
  ├── Hybrid Search (parallel):
  │     ├── Vector Search (Qdrant/Pinecone):
  │     │     ├── Query → embedding → top 50 results
  │     │     └── Filter: metadata filters (org_id, type, date)
  │     │
  │     └── Keyword Search (OpenSearch/PostgreSQL FTS):
  │           ├── Query → tokenize → full-text search → top 50 results
  │           └── Filter: same metadata filters
  │
  ├── Merge & Rerank:
  │     ├── Merge results (up to 100 candidates)
  │     ├── Remove duplicates (by content_hash)
  │     ├── Rerank with cross-encoder (Cohere Rerank / BGE Reranker)
  │     └── Keep top 10-15 chunks
  │
  ├── Context Assembly:
  │     ├── Order by relevance score
  │     ├── Add document metadata (source, date, confidence)
  │     ├── Truncate total context to fit model window (max 8K tokens)
  │     └── Format with citations for LLM
  │
  └── Generation:
        ├── LLM receives: [System Prompt + Retrieved Context + User Query]
        ├── Generate response with inline citations [1][2][3]
        ├── Each factual claim must map to ≥1 source
        └── LLM marks claims without sources as "speculative"
```

### 5.5 Citation Format

```markdown
Based on the contract [1] between ABC Corp and Acme Inc (signed Dec 15, 2025),
payment terms are **Net 30** [2].

The invoice [3] dated June 28, 2026 for $12,400.00 is due by **July 30, 2026**.

Sources:
[1] Master Service Agreement - ABC Corp (Dec 2025), Section 3.2
[2] Master Service Agreement - ABC Corp (Dec 2025), Section 4.1
[3] Invoice INV-2024-0892 from ABC Corp (Jun 2026)
```

### 5.6 Knowledge Freshness

| Strategy | Description | Frequency |
|---|---|---|
| **Real-time indexing** | Documents indexed immediately on upload | Instant |
| **Periodic re-indexing** | Re-embed documents weekly for model updates | Weekly |
| **Staleness detection** | Flag documents past retention policy | Daily |
| **Metadata updates** | Update permissions and classifications | On event |
| **Archive removal** | Remove expired documents from vector index | Based on retention |

---

## 6. Memory Architecture

### 6.1 Memory Types Overview

```text
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              MEMORY ARCHITECTURE                                      │
│                                                                                       │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────────────────┐   │
│  │  SHORT-TERM MEMORY       │  │  LONG-TERM MEMORY                                 │   │
│  │  (Within session)        │  │  (Persistent across sessions)                     │   │
│  │                          │  │                                                   │   │
│  │  ┌───────────────────┐   │  │  ┌───────────────────┐  ┌─────────────────────┐  │   │
│  │  │ Conversation      │   │  │  │ User Memory       │  │ Organization Memory │  │   │
│  │  │ History           │   │  │  │                   │  │                     │  │   │
│  │  │ (Last 20 msgs)    │   │  │  │ - Preferred       │  │ - Fiscal policies   │  │   │
│  │  └───────────────────┘   │  │  │   metrics/KPIs    │  │ - Accounting methods │  │   │
│  │  ┌───────────────────┐   │  │  │ - Reporting style │  │ - Currency prefs    │  │   │
│  │  │ Session Context   │   │  │  │ - Common queries  │  │ - Entity structure  │  │   │
│  │  │                   │   │  │  │ - Saved facts     │  │ - Approval rules    │  │   │
│  │  │ - Current page    │   │  │  │ - Recent activity │  │ - Integration map   │  │   │
│  │  │ - Active filters  │   │  │  └───────────────────┘  └─────────────────────┘  │   │
│  │  │ - Selected items  │   │  │                                                   │   │
│  │  │ - User role       │   │  │  ┌───────────────────┐  ┌─────────────────────┐  │   │
│  │  └───────────────────┘   │  │  │ Financial Period  │  │ Decision Memory     │  │   │
│  │                          │  │  │ Memory            │  │                     │  │   │
│  └─────────────────────────┘  │  │                   │  │ - Previous          │  │   │
│                               │  │ - Current period  │  │   analysis results  │  │   │
│  ┌─────────────────────────┐  │  │ - Recent periods  │  │ - Approved          │  │   │
│  │  VECTOR MEMORY           │  │  │ - Default         │  │   recommendations   │  │   │
│  │  (Semantic retrieval)    │  │  │   comparison      │  │ - User corrections  │  │   │
│  │                          │  │  └───────────────────┘  └─────────────────────┘  │   │
│  │  - User preference       │  │                                                   │   │
│  │    embeddings            │  └──────────────────────────────────────────────────┘   │
│  │  - Common intent         │                                                       │
│  │    patterns              │                                                       │
│  │  - Knowledge gaps        │                                                       │
│  └─────────────────────────┘                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Conversation Memory

| Property | Specification |
|---|---|
| **Storage** | PostgreSQL (`ai_messages` table) |
| **Retrieval** | Last 20 messages loaded with each request |
| **Context Window** | Max 8K tokens (summarize older if needed) |
| **Summarization** | When >20 messages, summarize older content |
| **Retention** | 90 days (configurable by plan) |
| **Scope** | Per conversation ID |

**Structure:**
```json
[
  { "role": "user", "content": "Show me this month's P&L", "timestamp": "..." },
  { "role": "assistant", "content": "...", "sources": [...], "timestamp": "..." },
  { "role": "user", "content": "Compare with last month", "timestamp": "..." }
]
```

### 6.3 Session Context

| Property | Specification |
|---|---|
| **Storage** | Redis (short-lived) |
| **TTL** | Session duration (max 8 hours) |
| **Content** | Current page URL, filters, selected items, user role |

**Structure:**
```json
{
  "page": "/transactions",
  "filters": { "status": "posted", "date_gte": "2026-06-01" },
  "selected_ids": ["txn_001", "txn_002"],
  "user_role": "accountant",
  "organization_id": "org_xyz"
}
```

### 6.4 User Memory

| Property | Specification |
|---|---|
| **Storage** | PostgreSQL (`ai_memory` table) |
| **Retrieval** | Loaded on conversation start, updated on user correction |
| **Scope** | Per user, per organization |

**Types:**
| Type | Key | Example Value |
|---|---|---|
| `preference` | `reporting_currency` | USD |
| `preference` | `default_period` | current_month |
| `preference` | `chart_type` | bar |
| `fact` | `company_fiscal_year` | Jan-Dec |
| `fact` | `preferred_metrics` | ["revenue", "gross_margin", "ebitda"] |
| `style` | `summary_verbosity` | concise |
| `context` | `last_analysis` | "Was reviewing Q2 revenue trends" |

### 6.5 Organization Memory

| Property | Specification |
|---|---|
| **Storage** | PostgreSQL + Redis cache |
| **Refresh** | On organization config change |

**Content:**
- Organization structure (entities, departments)
- Fiscal calendar and current period
- Base currency and accepted currencies
- Accounting standards (GAAP/IFRS)
- Default approval thresholds
- Connected integrations
- Feature flags

### 6.6 Financial Period Memory

| Property | Specification |
|---|---|
| **Storage** | PostgreSQL (cached in Redis) |
| **Refresh** | On period close or change |

**Content:**
- Current open period
- Recent closed periods (last 4)
- Default comparison period (prior year, prior quarter)
- Period status (open, closing, closed)

### 6.7 Decision Memory

| Property | Specification |
|---|---|
| **Storage** | PostgreSQL |
| **Retrieval** | On similar query pattern detection |

**Content:**
```json
{
  "query_pattern": "variance_explanation",
  "previous_analysis": {
    "period": "q1_2026",
    "key_drivers": ["product_a_revenue", "marketing_spend"],
    "user_correction": "Actually, the main driver was FX impact",
    "applied_at": "2026-04-15T10:00:00Z"
  }
}
```

### 6.8 Memory Compression Strategy

```text
When conversation exceeds 20 messages:
  ├── Generate concise summary of older messages
  │     ├── "User asked about Q2 revenue, compared to Q1,
  │      then asked about expense drivers. Main topics:
  │      revenue analysis, cost breakdown."
  │
  ├── Store summary as first message in context window
  ├── Remove oldest messages beyond limit
  └── Continue with recent messages + summary

When user memory exceeds 50 entries:
  ├── Consolidate similar preferences
  ├── Archive entries not accessed in 90 days
  └── Summarize preference categories
```

---

## 7. Tool Calling

### 7.1 Tool Architecture

```text
Agent
  │
  ├── Determines tool needed
  ├── Calls Tool Router
  │     │
  │     ├── Tool Registry ──── Contains all tool definitions
  │     │     ├── Name
  │     │     ├── Description
  │     │     ├── Parameters (JSON schema)
  │     │     ├── Required permissions
  │     │     ├── Required approval level
  │     │     ├── Timeout
  │     │     └── Retry policy
  │     │
  │     ├── Permission Check
  │     │     ├── Does user have permission for this tool?
  │     │     └── Does tool operate on data user can access?
  │     │
  │     ├── Approval Check
  │     │     ├── Does this tool require human approval?
  │     │     └── If yes, pause and request approval
  │     │
  │     ├── Tool Execution
  │     │     ├── Execute with validated parameters
  │     │     ├── Timeout: 10s (default), 30s (complex)
  │     │     ├── Retry: 3 attempts with exponential backoff
  │     │     └── Log: full input/output for audit
  │     │
  │     └── Result Processing
  │           ├── Format result for LLM consumption
  │           ├── If error, format error message
  │           └── Return to agent
```

### 7.2 Complete Tool Catalog

| # | Tool Name | Agent | Description | Permission | Approval | Timeout |
|---|---|---|---|---|---|---|
| 1 | `search_transactions` | Financial, Fraud | Search transactions with filters | transactions:read | None | 10s |
| 2 | `get_transaction` | Financial, Fraud | Get transaction details | transactions:read | None | 5s |
| 3 | `search_invoices` | Financial, Vendors | Search invoices | invoices:read | None | 10s |
| 4 | `get_invoice` | Financial, Vendors | Get invoice details | invoices:read | None | 5s |
| 5 | `search_vendors` | Vendors, Fraud | Search vendors | vendors:read | None | 10s |
| 6 | `get_vendor` | Vendors, Fraud | Get vendor details | vendors:read | None | 5s |
| 7 | `get_vendor_risk` | Vendors, Fraud | Get vendor risk assessment | vendors:read | None | 5s |
| 8 | `get_dashboard_kpis` | Financial | Get dashboard KPIs | dashboard:read | None | 5s |
| 9 | `get_pnl` | Financial, Accounting | Get P&L statement | financial_statements:read | None | 10s |
| 10 | `get_balance_sheet` | Financial, Accounting | Get balance sheet | financial_statements:read | None | 10s |
| 11 | `get_cash_flow_statement` | Financial, Treasury | Get cash flow statement | financial_statements:read | None | 10s |
| 12 | `get_trial_balance` | Accounting | Get trial balance | gl:read | None | 10s |
| 13 | `get_account_balances` | Accounting, Financial | Get GL account balances | gl:read | None | 10s |
| 14 | `get_account_activity` | Accounting | Get account transactions | gl:read | None | 10s |
| 15 | `get_budget` | Budget, Financial | Get budget details | budgets:read | None | 10s |
| 16 | `get_budget_variance` | Budget, Financial | Get budget vs actual | budgets:read | None | 10s |
| 17 | `get_cash_position` | Treasury | Get cash position | treasury:read | None | 5s |
| 18 | `get_cash_forecast` | Treasury, Forecasting | Get cash forecast | treasury:read | None | 10s |
| 19 | `get_fx_exposure` | Treasury | Get FX positions | treasury:read | None | 5s |
| 20 | `run_forecast` | Forecasting | Run forecast model | forecasting:write | None | 120s |
| 21 | `get_forecast` | Forecasting | Get forecast results | forecasting:read | None | 10s |
| 22 | `get_fraud_alert` | Fraud | Get fraud alert | fraud:read | None | 5s |
| 23 | `get_fraud_case` | Fraud | Get fraud case | fraud:read | None | 5s |
| 24 | `search_fraud_alerts` | Fraud | Search fraud alerts | fraud:read | None | 10s |
| 25 | `get_compliance_controls` | Compliance | List controls | compliance:read | None | 10s |
| 26 | `get_compliance_issues` | Compliance | List issues | compliance:read | None | 10s |
| 27 | `search_documents` | Document, All | Search documents | documents:read | None | 10s |
| 28 | `get_document` | Document | Get document content | documents:read | None | 10s |
| 29 | `ask_document` | Document | Q&A over document | documents:read | None | 15s |
| 30 | `generate_report` | Reporting | Generate report | reports:write | None | 60s |
| 31 | `get_report` | Reporting | Get report | reports:read | None | 5s |
| 32 | `list_reports` | Reporting | List reports | reports:read | None | 5s |
| 33 | `get_workflow_status` | Workflow | Get workflow status | workflows:read | None | 5s |
| 34 | `get_workflow_run` | Workflow | Get run details | workflows:read | None | 5s |
| 35 | `suggest_workflow` | Workflow | Suggest automation | workflows:read | None | 15s |
| 36 | `validate_journal_entry` | Accounting | Validate JE | journal_entries:read | None | 10s |
| 37 | `get_period_status` | Accounting, GL | Get period status | gl:read | None | 5s |
| 38 | `get_system_health` | System Health | Get system status | system:read | None | 5s |
| 39 | `get_background_jobs` | System Health | List jobs | system:read | None | 5s |
| 40 | `search_api_docs` | Developer | Search API docs | none | None | 10s |
| 41 | `calculate_financial_ratio` | Financial | Calculate ratios | analytics:read | None | 5s |
| 42 | `search_knowledge_base` | All | RAG search | varies | None | 10s |
| 43 | `schedule_report` | Reporting | Schedule report | reports:write | None | 10s |
| 44 | `create_notification_digest` | Notification | Create digest | notifications:write | None | 10s |
| 45 | `get_contract` | Vendors | Get contract details | vendors:read | None | 5s |

### 7.3 Tool Definition Format (Registry)

```json
{
  "name": "get_pnl",
  "description": "Get Profit & Loss statement for a period and entity",
  "category": "financial_analysis",
  "agent": "financial_analysis",
  "parameters": {
    "type": "object",
    "properties": {
      "period": {
        "type": "string",
        "description": "Period identifier (e.g., 'q2_2026', '2026-06', 'current_month')",
        "enum": ["current_month", "current_quarter", "current_year", "custom"]
      },
      "entity_id": {
        "type": "string",
        "format": "uuid",
        "description": "Entity ID (leave empty for consolidated)"
      },
      "comparison": {
        "type": "string",
        "description": "Comparison period",
        "enum": ["previous_period", "year_ago", "budget", "none"]
      }
    },
    "required": ["period"]
  },
  "required_permissions": ["financial_statements:read"],
  "required_approval": false,
  "timeout_ms": 10000,
  "retry_policy": {
    "max_retries": 3,
    "backoff_ms": 1000,
    "multiplier": 2
  },
  "audit_level": "standard"
}
```

### 7.4 Tool Execution & Error Handling

```text
Tool Call → Tool Router:
  ├── Validate parameters (JSON schema validation)
  ├── Check cache (if tool is idempotent and result cached)
  ├── [MISSING_PARAMETER] → Return error with required fields
  ├── [PERMISSION_DENIED] → Return "You don't have permission to access this data"
  ├── [NOT_FOUND] → Return "I couldn't find data matching your request"
  ├── [TIMEOUT] → Retry with backoff → If failed, return "Service temporarily unavailable"
  ├── [RATE_LIMIT] → Wait and retry → If failed, return "Too many requests, please try again"
  ├── [UPSTREAM_ERROR] → Retry (integration connector down) → Return degraded response
  └── [SUCCESS] → Return formatted result
```

---

## 8. Prompt Engineering

### 8.1 Prompt Architecture

```text
Every LLM call is constructed from:
  ┌──────────────────────────────────────────────────┐
  │  SYSTEM PROMPT (Versioned, pre-defined)          │
  │  ├── Role definition                             │
  │  ├── Behavior rules                              │
  │  ├── Output format specification                 │
  │  ├── Guardrails                                  │
  │  └── Constraints                                 │
  ├──────────────────────────────────────────────────┤
  │  CONTEXT (Dynamic, assembled per request)        │
  │  ├── Retrieved knowledge (RAG chunks)            │
  │  ├── Conversation history                        │
  │  ├── User memory/preferences                     │
  │  ├── Organization context                        │
  │  ├── Financial period context                    │
  │  └── Session context (page, filters)             │
  ├──────────────────────────────────────────────────┤
  │  FEW-SHOT EXAMPLES (Task-specific)               │
  │  ├── 2-3 examples of ideal Q&A pairs             │
  │  └── If applicable, examples of tool calls       │
  ├──────────────────────────────────────────────────┤
  │  TASK INSTRUCTION (Agent-specific)               │
  │  ├── Current task/goal description               │
  │  ├── Tool definitions (function schemas)         │
  │  └── Output constraints                          │
  ├──────────────────────────────────────────────────┤
  │  USER QUERY (Original user input)                │
  └──────────────────────────────────────────────────┘
```

### 8.2 System Prompt Template

```text
You are {agent_role} for FinOps AI Copilot, an enterprise AI financial
intelligence platform. You help {user_persona} with their financial tasks.

## Identity
- Role: {agent_name}
- Specialization: {agent_description}
- Personality: Professional, concise, accurate, data-driven

## Behavioral Rules
1. ALWAYS cite specific sources for every financial claim
2. If you don't know or can't find the answer, say so clearly
3. Do NOT make up financial figures, account codes, or transaction details
4. Show confidence scores for analyses (High: >0.85, Medium: 0.70-0.85, Low: <0.70)
5. For low-confidence responses, recommend manual verification
6. NEVER execute financial actions (payments, approvals, journal posting)
7. If the user asks you to perform an action, explain what's needed but route to the appropriate module
8. Format numbers with commas and 2 decimal places: $1,234.56
9. Use tables for comparisons and structured data
10. Use bullet points for lists and summaries

## Data Access
- You can only access data the user has permission to see
- Organization: {organization_name}
- User role: {user_role}
- Current period: {current_period}

## Response Format
- Start with a brief summary (1-2 sentences)
- Provide detailed analysis with specific numbers
- End with actionable insights or next steps
- Include sources in format [1], [2], etc.
- Include confidence score

## Restrictions
- DO NOT share raw SQL, API keys, or system configuration
- DO NOT access data from other users or organizations
- DO NOT provide investment advice
- DO NOT guarantee future financial outcomes
```

### 8.3 Specialist Agent Prompts

Each agent has a specialized system prompt that includes:

| Agent | Prompt Focus Areas |
|---|---|
| **Supervisor** | Intent classification rules, routing logic, when to ask clarifying questions |
| **Financial Analysis** | Accounting principles, financial statement structure, ratio formulas, variance analysis methodology |
| **Fraud Detection** | Fraud indicators, red flags, investigation methodology, risk assessment framework |
| **Treasury** | Liquidity metrics, FX concepts, cash management best practices |
| **Compliance** | SOC 2, ISO 27001, SOX, GDPR frameworks, control testing methodology |
| **Reporting** | Report structure, executive summary best practices, board pack standards |
| **Forecasting** | Forecast models, confidence intervals, trend analysis, seasonality concepts |
| **Budget** | Budgeting methodologies, variance analysis, reforecasting best practices |
| **Vendor Intelligence** | Vendor risk assessment, concentration analysis, contract analysis |
| **Accounting** | Double-entry accounting, GAAP/IFRS rules, period close procedures, reconciliation |
| **Document Intelligence** | Document extraction, classification, OCR confidence, structured data extraction |

### 8.4 Prompt Versioning

| Property | Specification |
|---|---|
| **Version Storage** | `ai_prompts` table in PostgreSQL |
| **Versioning** | Integer version per prompt slug |
| **Status** | draft, pending_approval, approved, deprecated |
| **A/B Testing** | Two active versions can be compared (champion/challenger) |
| **Rollback** | Instant rollback to previous approved version |
| **Audit** | All prompt changes logged with diff |

### 8.5 Prompt Injection Defense

| Defense | Implementation |
|---|---|
| **Input sanitization** | Strip prompt injection patterns: "Ignore previous instructions", "You are now..." |
| **System prompt delimiter** | Clear separation between system and user content |
| **Role enforcement** | User messages always in "user" role, never "system" |
| **Output filtering** | Check for injection in generated responses |
| **Rate limiting** | Limit attempts per user to detect systematic attacks |
| **PII scanning** | Check input for unauthorized PII queries |

---

## 9. Model Routing

### 9.1 Model Provider Strategy

| Provider | Models | Primary Use | Cost | Latency | Quality |
|---|---|---|---|---|---|
| **OpenAI** | GPT-4o, GPT-4o-mini, GPT-4, o1 | Primary provider | $$$ | Fast | Best |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Haiku | Fallback, compliance | $$$ | Fast | Best |
| **Google** | Gemini 1.5 Pro, Gemini 1.5 Flash | Secondary, specific regions | $$ | Fast | Excellent |
| **Azure OpenAI** | GPT-4o (EU) | EU data residency | $$$ | Fast | Best |
| **Ollama** | Llama 3, Mistral | Local dev, offline fallback | Free | Varies | Good |

### 9.2 Model Selection Rules

```text
Rule 1: Cost Optimization
  ├── Simple classification (intent detection) → GPT-4o-mini ($0.15/1M tokens)
  ├── Simple data retrieval (no analysis needed) → GPT-4o-mini
  ├── Summarization (short content) → GPT-4o-mini
  ├── Complex analysis (multi-step reasoning) → GPT-4o ($2.50/1M tokens)
  ├── Financial calculation (precision critical) → GPT-4o
  ├── Document analysis (long context) → GPT-4o / Claude 3.5
  └── Code generation → GPT-4o / Claude 3.5

Rule 2: Latency Optimization
  ├── User-facing chat → Fastest available (GPT-4o-mini: <500ms)
  ├── Streaming response → Low-TTFB model (GPT-4o: <1s first token)
  ├── Background analysis → Can use slower/cheaper model
  └── Real-time classification → GPT-4o-mini (<200ms)

Rule 3: Compliance Routing
  ├── EU data → Azure OpenAI (EU region)
  ├── PII-containing → Azure OpenAI (EU region) or Anthropic (no training)
  ├── Regulated Enterprise → Self-hosted / Azure OpenAI
  └── Standard → Any provider (no data used for training)

Rule 4: Fallback Chain
  ├── Primary: GPT-4o → Claude 3.5 Sonnet → Gemini 1.5 Pro
  ├── Budget: GPT-4o-mini → Claude 3 Haiku → Gemini 1.5 Flash
  ├── On provider outage → Next in chain (automatically)
  └── On rate limit → Next in chain (with backoff)
```

### 9.3 Model Routing Decision Tree

```text
User Request
  │
  ▼
Check Data Residency Requirements
  │
  ├── EU required → Azure OpenAI (EU deployment)
  ├── PII detected → Anthropic Claude (no training policy)
  └── Standard → Continue
        │
        ▼
  Check Request Complexity
        │
        ├── Simple (classification, retrieval, formatting)
        │     └── GPT-4o-mini (primary) → Claude Haiku (fallback)
        │
        ├── Medium (analysis, summarization, generation)
        │     └── GPT-4o (primary) → Claude Sonnet (fallback) → Gemini Pro (fallback)
        │
        ├── Complex (multi-step reasoning, calculation)
        │     └── GPT-4o (primary) → Claude Sonnet (fallback)
        │
        └── Critical (financial accuracy required)
              └── GPT-4o (primary, with chain-of-thought) → Claude Sonnet (fallback)
                    │
                    ▼
              Check: All numbers verified? → If no, re-run with stricter constraints
```

### 9.4 Embedding Model Strategy

| Use Case | Model | Dimensions | Provider |
|---|---|---|---|
| **Document embeddings** | text-embedding-3-large | 1,536 | OpenAI |
| **Query embeddings** | text-embedding-3-small | 512 | OpenAI |
| **Code search** | voyage-code-2 | 1,024 | Voyage AI |
| **Financial domain** | voyage-finance-2 | 1,024 | Voyage AI |
| **Self-hosted fallback** | BGE-large-en-v1.5 | 1,024 | Open source |

### 9.5 Cost Optimization Strategy

| Strategy | Expected Savings | Implementation |
|---|---|---|
| **Model tiering** | 40-60% | Use GPT-4o-mini for 70% of requests |
| **Caching** | 20-30% | Cache identical queries with TTL |
| **Prompt compression** | 10-20% | Remove redundant context, compress history |
| **Batching** | 5-10% | Batch non-urgent analysis requests |
| **Token budgeting** | 15-25% | Set max_tokens per request type |
| **Context window management** | 10-15% | Smart truncation of conversation history |

---

## 10. AI Guardrails

### 10.1 Guardrail Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              GUARDRAIL PIPELINE                                        │
│                                                                                       │
│  INPUT GUARDRAILS (Pre-processing)                                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Input           │  │ PII Detection   │  │ Prompt          │  │ Permission      │  │
│  │ Validation      │  │ & Redaction     │  │ Injection       │  │ Check           │  │
│  │                 │  │                 │  │ Detection       │  │                 │  │
│  │ - Max length    │  │ - SSN, Credit   │  │ - Known attack  │  │ - User role OK? │  │
│  │ - Allowed chars │  │   Card, Bank    │  │   patterns      │  │ - Data scope OK?│  │
│  │ - No binary     │  │ - Email, Phone  │  │ - Delimiter     │  │ - Org match?    │  │
│  │ - No URLs (unless│  │ - API Keys      │  │   injection     │  │                 │  │
│  │   allowed)      │  │ - Custom PII    │  │ - Role override │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                                       │
│  EXECUTION GUARDRAILS (During processing)                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Tool Permission │  │ Budget Check    │  │ Rate Limit      │  │ Human Approval  │  │
│  │ Check           │  │                 │  │ Check           │  │ Gate            │  │
│  │                 │  │                 │  │                 │  │                 │  │
│  │ - Can user call │  │ - AI credit     │  │ - Per-user      │  │ - Action        │  │
│  │   this tool?    │  │   remaining?    │  │ - Per-agent     │  │   requires      │  │
│  │ - Can user      │  │ - Cost          │  │ - Per-model     │  │   approval?     │  │
│  │   access this   │  │   threshold?    │  │                 │  │ - User can      │  │
│  │   data?         │  │                 │  │                 │  │   approve?      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                                       │
│  OUTPUT GUARDRAILS (Post-processing)                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Hallucination   │  │ Citation        │  │ Output          │  │ PII Leakage     │  │
│  │ Detection       │  │ Verification    │  │ Validation      │  │ Check           │  │
│  │                 │  │                 │  │                 │  │                 │  │
│  │ - Numeric       │  - Each claim has │  │ - Format        │  │ - No PII in     │  │
│  │   accuracy      │    ≥1 source?     │  │ - JSON validity  │  │   response      │  │
│  │ - Factual       │  - Source         │  │ - No executable  │  │ - No secrets    │  │
│  │   consistency   │    exists?        │  │   code          │  │ - No credentials │  │
│  │ - Internal      │  - Source matches │  │ - Safe HTML      │  │                 │  │
│  │   consistency   │    claim?         │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Hallucination Prevention

| Technique | Description | Effectiveness |
|---|---|---|
| **RAG + Citation** | Every claim must cite a retrieved source | High |
| **Confidence Scoring** | Model scores each claim's confidence | Medium |
| **Numeric Verification** | All numbers validated against source data | Very High |
| **Consistency Check** | Cross-check claims within response | Medium |
| **Second-Pass Validation** | Another LLM verifies first response | High |
| **Known Facts Database** | Pre-verified facts (e.g., fiscal year, org name) | High |
| **Uncertainty Expression** | Model trained to say "I'm not sure" | Medium |

### 10.3 Citation Verification

```text
After response generation:
  ├── Extract all [N] citations from response
  │
  ├── For each citation:
  │     ├── Does the source exist in retrieved context?
  │     ├── Does the claim match the source content?
  │     ├── Is the source within the user's permission scope?
  │     └── Is the source not stale (within retention)?
  │
  ├── IF all citations verified:
  │     └── Response marked as "verified"
  │
  ├── IF some citations fail:
  │     ├── Remove uncited claims
  │     ├── Flag remaining as "uncited speculation"
  │     └── Reduce confidence score
  │
  └── IF no citations:
        └── Response marked as "general knowledge" (low confidence)
```

### 10.4 Restricted Actions

| Action | Restriction | Override |
|---|---|---|
| Execute payment | Blocked entirely | N/A |
| Approve invoice | Cannot approve via AI | User must use approval UI |
| Modify journal entry | Blocked entirely | N/A |
| Delete transaction | Blocked entirely | N/A |
| Change user permissions | Blocked entirely | N/A |
| Export PII data | Blocked entirely | N/A |
| Access other tenant's data | Blocked by RLS | N/A |
| Post across closed periods | Blocked | Controller can override in UI |
| Generate financial report | Allowed (read-only) | Must review before distribution |

### 10.5 PII Protection

| PII Type | Detection | Action |
|---|---|---|
| **SSN / Tax ID** | Pattern: XXX-XX-XXXX | Mask: ●●●-●●-XXXX |
| **Credit Card** | Pattern: XXXX-XXXX-XXXX-XXXX | Mask: ●●●●-●●●●-●●●●-1234 |
| **Bank Account** | Pattern: \\d{8-17} | Mask: ●●●●1234 |
| **Email** | Pattern detection | Show only if user has permission |
| **Phone** | Pattern detection | Mask: XXX-XXX-1234 |
| **API Key** | Prefix pattern (sk_, whsec_) | Full redaction |
| **Password** | Context detection | Full redaction |

---

## 11. AI Evaluation

### 11.1 Evaluation Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              EVALUATION PIPELINE                                      │
│                                                                                       │
│  OFFLINE EVALUATION (Pre-release)                                                     │
│  ┌────────────────────────────────────────────────────────────────────────────┐       │
│  │  Golden Dataset (2,000+ test cases)                                         │       │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │       │
│  │  │ Factual QA  │ │ Analytical  │ │ Document    │ │ Tool Calling        │  │       │
│  │  │ (500 cases) │ │ Reasoning   │ │ Q&A         │ │ (300 cases)         │  │       │
│  │  │             │ │ (400 cases) │ │ (300 cases) │ │                     │  │       │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘  │       │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │       │
│  │  │ Safety &    │ │ Edge Cases  │ │ Multi-turn  │ │ Regression          │  │       │
│  │  │ Guardrails  │ │ (200 cases) │ │ (200 cases) │ │ (100 cases)         │  │       │
│  │  │ (300 cases) │ │             │ │             │ │                     │  │       │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘  │       │
│  └────────────────────────────────────────────────────────────────────────────┘       │
│         │                                                                              │
│         ▼                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────────┐       │
│  │  Automated Evaluation                                                        │       │
│  │  ├── LLM-as-Judge: Use GPT-4o to evaluate responses on:                      │       │
│  │  │     ├── Accuracy (1-5): Is the factual information correct?               │       │
│  │  │     ├── Faithfulness (1-5): Is the response grounded in sources?          │       │
│  │  │     ├── Completeness (1-5): Does it answer the user's question?           │       │
│  │  │     ├── Helpfulness (1-5): Is the response useful and actionable?         │       │
│  │  │     └── Safety (1-5): Does it avoid harmful content?                     │       │
│  │  │                                                                          │       │
│  │  ├── Automated Metrics:                                                     │       │
│  │  │     ├── BLEU / ROUGE-L (overlap with reference)                          │       │
│  │  │     ├── F1 Exact Match (for numeric answers)                             │       │
│  │  │     ├── Citation Rate (% of claims with sources)                         │       │
│  │  │     ├── Hallucination Rate (% of uncited/false claims)                   │       │
│  │  │     ├── Latency (p50, p95, p99)                                         │       │
│  │  │     └── Cost (tokens per request)                                       │       │
│  │  │                                                                          │       │
│  │  └── Results → Score Dashboard → Regression Alerting                        │       │
│  └────────────────────────────────────────────────────────────────────────────┘       │
│         │                                                                              │
│         ▼                                                                              │
│  ONLINE EVALUATION (Production)                                                        │
│  ┌────────────────────────────────────────────────────────────────────────────┐       │
│  │  Live Monitoring                                                           │       │
│  │  ├── Implicit Feedback:                                                     │       │
│  │  │     ├── Follow-up question rate (low = good)                            │       │
│  │  │     ├── Abandonment rate (user leaves after response)                   │       │
│  │  │     ├── Time to next interaction (longer = more satisfied)               │       │
│  │  │     └── Session length                                                   │       │
│  │  │                                                                          │       │
│  │  ├── Explicit Feedback:                                                    │       │
│  │  │     ├── Thumbs up/down (per response)                                   │       │
│  │  │     ├── Star rating (periodic prompt)                                   │       │
│  │  │     ├── Free-text comments                                              │       │
│  │  │     └── "This helped" / "Not what I wanted"                             │       │
│  │  │                                                                          │       │
│  │  └── Sampling: Log 10% of all conversations for manual review              │       │
│  └────────────────────────────────────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### 11.2 Evaluation Metrics

| Metric | Description | Target | Measurement |
|---|---|---|---|
| **Accuracy** | % of responses with correct factual information | > 95% | LLM-as-Judge + Golden Dataset |
| **Faithfulness** | % of claims grounded in provided sources | > 95% | Citation verification |
| **Completeness** | % of user questions fully answered | > 90% | LLM-as-Judge |
| **Helpfulness** | User rating of response usefulness | > 85% | User feedback (thumbs up) |
| **Hallucination Rate** | % of responses containing unsubstantiated claims | < 2% | Citation verification |
| **Citation Rate** | % of factual claims that cite sources | > 90% | Automated extraction |
| **Numeric Accuracy** | % of numeric values matching source data | > 99% | Automated comparison |
| **Tool Call Success** | % of tool calls that execute without error | > 95% | Tool execution log |
| **Latency (p50)** | Median time to full response | < 5s | APM |
| **Latency (p95)** | 95th percentile response time | < 15s | APM |
| **Time to First Token** | Time to first streaming token | < 1.5s | APM |
| **Cost per Request** | Average cost per AI interaction | < $0.05 | Cost tracking |
| **User Retention** | % of users returning for AI in 7 days | > 60% | Analytics |
| **Escalation Rate** | % of interactions escalated to human | < 10% | Agent logs |

### 11.3 Golden Dataset Structure

```json
{
  "test_cases": [
    {
      "id": "eval_001",
      "category": "financial_analysis",
      "query": "What was our revenue last quarter?",
      "context": { "period": "q1_2026", "entity": "consolidated" },
      "expected_behavior": {
        "must_cite": true,
        "must_contain_numbers": true,
        "must_not_hallucinate": true
      },
      "reference_answer": "Revenue for Q1 2026 was $12.4M, up 8.2% from Q4 2025.",
      "reference_sources": ["pnl_q1_2026"],
      "acceptable_models": ["gpt-4o", "claude-3.5-sonnet"],
      "weight": 1.0
    }
  ]
}
```

### 11.4 Regression Testing

```text
On every prompt change, model update, or agent logic change:
  ├── Run full golden dataset (2,000+ cases)
  ├── Compare results to baseline
  │     ├── Accuracy change: > -2% → Block deployment
  │     ├── Hallucination increase: > -1% → Block deployment
  │     ├── Latency increase: > -20% → Flag for review
  │     └── Cost increase: > -20% → Flag for review
  │
  ├── Run safety evaluation
  │     ├── All safety test cases must pass (100%)
  │     └── Prompt injection tests: > 95% blocked
  │
  └── Generate regression report:
        ├── Pass/fail by category
        ├── Metric changes from baseline
        ├── New failing cases (for human review)
        └── Recommendation: Approve / Block / Flag
```

---

## 12. AI Observability

### 12.1 Observability Stack

| Component | Tool | Purpose |
|---|---|---|
| **Tracing** | OpenTelemetry + Langfuse | Full agent trace, step-by-step |
| **Metrics** | Prometheus + Grafana | Token usage, latency, cost, errors |
| **Logging** | Structured JSON (ELK/Loki) | All AI interactions |
| **Alerting** | PagerDuty / OpsGenie | Anomaly detection, cost spikes |
| **Dashboard** | Grafana | Real-time AI health dashboard |
| **Evaluation** | Langfuse | Online evaluation scores |

### 12.2 Traced Events

Every AI interaction captures:

```json
{
  "trace_id": "trace_abc123",
  "conversation_id": "conv_xyz",
  "user_id": "usr_001",
  "organization_id": "org_abc",
  "agent": "financial_analysis",
  "model": "gpt-4o",
  "request": {
    "messages": ["system", "...", "user", "..."],
    "temperature": 0.3,
    "max_tokens": 2048
  },
  "response": {
    "content": "...",
    "finish_reason": "stop",
    "usage": {
      "prompt_tokens": 1240,
      "completion_tokens": 340,
      "total_tokens": 1580
    }
  },
  "tools": [
    {
      "name": "get_pnl",
      "input": { "period": "q2_2026" },
      "output": { "revenue": 12400000 },
      "duration_ms": 120,
      "status": "success"
    }
  ],
  "latency_ms": 3400,
  "cost_usd": 0.0023,
  "evaluation": {
    "accuracy": 5,
    "faithfulness": 5,
    "completeness": 5,
    "helpfulness": 4
  },
  "guardrails": {
    "input_passed": true,
    "output_validated": true,
    "citations_verified": 3,
    "hallucination_detected": false
  },
  "feedback": {
    "rating": null,
    "comment": null
  },
  "timestamp": "2026-06-30T10:23:00Z"
}
```

### 12.3 Key Metrics Dashboard

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  AI PLATFORM HEALTH                                                          │
├───────────────┬───────────────┬───────────────┬──────────────┬───────────────┤
│ Requests/min  │ Avg Latency   │ P95 Latency   │ Error Rate   │ Cost/hour    │
│ 1,234         │ 2.8s          │ 8.1s          │ 0.5%         │ $4.23        │
│ ▲ 5% WoW      │ ▼ 0.3s WoW   │ ▼ 1.2s WoW   │ ▼ 0.1% WoW  │ ▲ 3% WoW    │
├───────────────┼───────────────┼───────────────┼──────────────┼───────────────┤
│ Tokens/day    │ Model Usage   │ Agent Usage   │ Hallucination│ User Feedback │
│ 12.4M         │ GPT-4o: 30%   │ Supv: 45%     │ 1.2%         │ 87% positive  │
│               │ GP4-mini: 60% │ Fin: 25%      │ ▼ 0.3% WoW  │ ▲ 2% WoW     │
│               │ Claude: 10%   │ Fraud: 12%    │              │               │
├───────────────┴───────────────┴───────────────┴──────────────┴───────────────┤
│ Recent Errors                                        [View All]              │
│ ⚠ Tool timeout: search_vendors — timeout after 10s (1 min ago)              │
│ ⚠ Model rate limit: GPT-4o — exceeded tokens/min — fell back to Claude      │
│ ❌ Guardrail: Output rejected — hallucination detected (5 min ago)           │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 12.4 Alert Thresholds

| Metric | Warning | Critical | Action |
|---|---|---|---|
| Error Rate | > 2% | > 5% | Alert on-call engineer |
| Latency (p95) | > 10s | > 20s | Scale model capacity |
| Hallucination Rate | > 3% | > 5% | Block model, fallback |
| Cost Spikes | > 20% daily | > 50% daily | Investigate traffic patterns |
| Token Usage | > 80% quota | > 95% quota | Warn tenant, throttle |
| Model Availability | Provider returned errors | Provider completely down | Route to fallback |
| Tool Failure Rate | > 5% | > 10% | Alert integration team |

---

## 13. Streaming Architecture

### 13.1 SSE Streaming Architecture

```text
Client                          API Gateway                         AI Service
  │                                  │                                   │
  │  GET /api/v1/ai/chat/stream      │                                   │
  │  ?message=Show+P%26L            │                                   │
  │─────────────────────────────────►│                                   │
  │                                  │  Forward request                  │
  │                                  │──────────────────────────────────►│
  │                                  │                                   │
  │                                  │                                   ├──► Intent classification
  │                                  │                                   ├──► Agent routing
  │                                  │                                   ├──► Tool calls (async)
  │                                  │                                   │
  │                                  │  SSE: event: start                │
  │                                  │◄──────────────────────────────────│
  │◄─────────────────────────────────│    data: {"type":"start"}         │
  │                                  │                                   │
  │                                  │  SSE: event: search_result        │
  │                                  │◄──────────────────────────────────│
  │◄─────────────────────────────────│    data: {"type":"source","...}   │
  │                                  │                                   │
  │                                  │  SSE: event: token (streaming)    │
  │                                  │◄──────────────────────────────────│
  │◄─────────────────────────────────│    data: {"type":"token",         │
  │                                  │           "token":"Here's"}       │
  │  [Renders token "Here's"]        │                                   │
  │                                  │  SSE: event: token                │
  │                                  │◄──────────────────────────────────│
  │◄─────────────────────────────────│    data: {"type":"token",         │
  │                                  │           "token":" your"}        │
  │  [Renders token "your"]          │                                   │
  │                                  │  ...                              │
  │                                  │                                   │
  │                                  │  SSE: event: sources              │
  │                                  │◄──────────────────────────────────│
  │◄─────────────────────────────────│    data: {"type":"sources",       │
  │                                  │           "sources": [...]}       │
  │  [Renders source citations]      │                                   │
  │                                  │                                   │
  │                                  │  SSE: event: done                 │
  │                                  │◄──────────────────────────────────│
  │◄─────────────────────────────────│    data: {"type":"done",          │
  │                                  │           "tokens":1240,          │
  │                                  │           "cost":0.0023}          │
  │                                  │                                   │
  │  [Chat complete]                │                                   │
  │  User provides feedback          │                                   │
  │  POST /api/v1/ai/feedback       │                                   │
  │─────────────────────────────────►│                                   │
  │                                  │  Save feedback                    │
  │                                  │──────────────────────────────────►│
```

### 13.2 SSE Event Types

| Event | Description | Payload |
|---|---|---|
| `start` | Request accepted, processing begins | `{ "conversation_id", "message_id" }` |
| `search` | Retrieval phase in progress | `{ "type": "search", "status": "searching" }` |
| `source` | A source was found | `{ "type": "source", "id": "...", "title": "..." }` |
| `agent` | Agent switch | `{ "type": "agent", "name": "fraud_agent" }` |
| `token` | Generated text token | `{ "type": "token", "token": "..." }` |
| `tool_call` | AI is calling a tool | `{ "type": "tool_call", "tool": "get_pnl", "status": "running" }` |
| `tool_result` | Tool execution result | `{ "type": "tool_result", "tool": "get_pnl", "status": "success" }` |
| `error` | Error during processing | `{ "type": "error", "code": "...", "message": "..." }` |
| `sources` | All sources for the response | `{ "type": "sources", "sources": [...] }` |
| `done` | Response complete | `{ "type": "done", "tokens": 1240, "cost": 0.0023 }` |

### 13.3 Cancellation & Resume

| Feature | Implementation |
|---|---|
| **Cancel** | Client sends `POST /api/v1/ai/chat/{message_id}/cancel` |
| **Resume** | Send subsequent message in same conversation |
| **Heartbeat** | Server sends `event: heartbeat` every 15s during long processing |
| **Reconnection** | Client reconnects with `Last-Event-Id` header |
| **Timeout** | Server closes connection after 120s idle |

---

## 14. Security

### 14.1 Model Security

| Concern | Mitigation |
|---|---|
| **Data leakage** | No customer data used for model training. API agreement with providers. |
| **Prompt injection** | Input guardrails, system prompt hardening, delimiter separation |
| **Jailbreak attempts** | Pattern detection, rate limiting, conversation monitoring |
| **Model poisoning** | Use only trusted model providers (OpenAI, Anthropic, Azure) |
| **Supply chain** | Dependency scanning, container signing, verified model weights (self-hosted) |

### 14.2 Data Isolation

| Layer | Isolation Mechanism |
|---|---|
| **RAG Vector Store** | Tenant-scoped collections. Metadata filter on organization_id at query time. |
| **Conversation History** | organization_id + user_id scope. RLS on PostgreSQL. |
| **User Memory** | Strictly per-user. Never shared across users. |
| **Organization Memory** | Strictly per-organization. Never shared across tenants. |
| **Document Knowledge** | organization_id scope. Access controlled by user permissions. |
| **Prompts** | Global prompts shared. Tenant-specific prompts isolated. |
| **Feedback** | organization_id scope. Aggregate metrics only shared internally. |

### 14.3 Prompt Security

| Rule | Implementation |
|---|---|
| **No hardcoded secrets** | All API keys in Vault, injected at runtime |
| **No PII in prompts** | Redacted before sending to LLM provider |
| **No credentials in context** | Tool outputs filtered to remove sensitive fields |
| **Output sanitization** | Strip credentials, keys, secrets from model output |
| **Tenant context isolation** | organization_id injected, verified by guardrails |

### 14.4 Tenant Isolation in AI

| Access Pattern | Isolation |
|---|---|
| **User asks about their data** | RLS on all database queries via tools |
| **User asks about another tenant** | Blocked by permission guard. No data returned. |
| **AI model training** | No customer data used. |
| **Vector search** | Filtered by organization_id |
| **Conversation history** | organization_id scoped |
| **Memory** | organization_id + user_id scoped |
| **Cached responses** | organization_id scoped |

---

## 15. AI APIs

### 15.1 API Overview

All AI APIs are under `/api/v1/ai/` and follow the global API standards defined in the REST API Specification.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/ai/chat` | POST | Chat completion (non-streaming) |
| `/api/v1/ai/chat/stream` | GET | Streaming chat (SSE) |
| `/api/v1/ai/conversations` | GET | List conversations |
| `/api/v1/ai/conversations/{id}` | GET | Get conversation |
| `/api/v1/ai/conversations/{id}` | DELETE | Delete conversation |
| `/api/v1/ai/conversations/{id}/messages/{msg_id}/cancel` | POST | Cancel streaming generation |
| `/api/v1/ai/recommendations` | GET | Get proactive recommendations |
| `/api/v1/ai/generate-report` | POST | Generate AI report |
| `/api/v1/ai/summarize` | POST | Summarize data |
| `/api/v1/ai/explain` | POST | Explain something |
| `/api/v1/ai/detect` | POST | Run AI detection |
| `/api/v1/ai/agents/status` | GET | Get all agent statuses |
| `/api/v1/ai/memory` | GET | Get user memory |
| `/api/v1/ai/memory` | PATCH | Update user memory |
| `/api/v1/ai/memory` | DELETE | Clear user memory |
| `/api/v1/ai/feedback` | POST | Submit feedback |
| `/api/v1/ai/evaluate` | POST | Run evaluation (admin) |
| `/api/v1/ai/usage` | GET | Get AI usage metrics |
| `/api/v1/ai/prompts` | GET | List prompts (admin) |
| `/api/v1/ai/prompts` | POST | Create prompt version (admin) |
| `/api/v1/ai/embeddings` | POST | Generate embeddings |

### 15.2 Proactive Recommendations

The AI platform proactively generates recommendations based on:

| Trigger | Recommendation Type | Delivery |
|---|---|---|
| New transaction batch | "23 transactions uncategorized. Auto-categorize?" | Dashboard alert |
| Budget nearing limit | "Engineering budget at 85%. Consider reforecast." | Notification |
| Fraud pattern detected | "Unusual payment pattern detected. Investigate?" | Alert + Notification |
| Period close approaching | "Period close in 5 days. 3 tasks incomplete." | Notification |
| Cash runway changing | "Runway reduced to 12 months. Review forecast." | Dashboard alert |
| Invoice early payment eligible | "3 invoices eligible for early payment. Save $4,200." | Notification |

---

## 16. Future AI Capabilities

### 16.1 Voice Copilot

| Capability | Description | Timeline |
|---|---|---|
| **Voice input** | Speak to AI Copilot via browser/mobile | 6 months |
| **Voice output** | AI reads responses aloud | 6 months |
| **Real-time transcription** | Speech-to-text for meetings | 9 months |
| **Voice commands** | "Approve invoice 8923" via voice | 12 months |
| **Multi-language** | Support for 10+ languages | 12 months |

### 16.2 Autonomous Finance

| Capability | Description | Timeline |
|---|---|---|
| **Autonomous categorization** | AI categorizes 99%+ of transactions without review | 3 months |
| **Autonomous reconciliation** | AI matches transactions to invoices automatically | 6 months |
| **Autonomous close** | AI executes standard period close tasks | 12 months |
| **Autonomous reporting** | AI generates board pack without human input | 12 months |

### 16.3 Autonomous Treasury

| Capability | Description | Timeline |
|---|---|---|
| **Auto cash sweeping** | AI recommends and executes cash concentration | 12 months |
| **Auto FX hedging** | AI executes FX hedges within policy | 18 months |
| **Auto investment** | AI invests excess cash within policy | 18 months |

### 16.4 AI CFO

| Capability | Description | Timeline |
|---|---|---|
| **Strategic recommendations** | AI recommends capital allocation, pricing, investments | 18 months |
| **Scenario planning** | AI runs thousands of scenarios to identify optimal strategy | 18 months |
| **Board-ready materials** | Full board pack generation with narrative | 12 months |
| **Risk forecasting** | Predictive risk models for financial health | 18 months |

### 16.5 Knowledge Graph

| Capability | Description | Timeline |
|---|---|---|
| **Entity resolution** | Link transactions, invoices, vendors, customers into unified graph | 9 months |
| **Relationship discovery** | Automatically discover vendor/customer relationships | 12 months |
| **Graph traversal** | "Show me all transactions connected to ABC Corp" | 12 months |
| **Anomaly detection** | Graph-based fraud detection (shared addresses, phones) | 12 months |

### 16.6 Continuous Learning

| Capability | Description | Timeline |
|---|---|---|
| **Feedback loop** | User corrections improve model prompts | 3 months |
| **Drift detection** | Automatically detect when model performance degrades | 6 months |
| **Auto-prompt optimization** | A/B test prompts, deploy winners automatically | 9 months |
| **Fine-tuning** | Domain-specific fine-tuned models for finance tasks | 12 months |

---

*End of Document — AI-FINCOPS-008 v1.0*