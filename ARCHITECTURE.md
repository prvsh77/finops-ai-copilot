# System Architecture

FinOps AI Copilot utilizes a clean separation of concerns, decoupling business services from data persistence and AI APIs.

```text
┌─────────────────────────────────────────────────────────┐
│                 React / TypeScript SPA                  │
│  (Custom Views, SSE Readers, Observability Telemetry)  │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼ REST / Server-Sent Events
┌─────────────────────────────────────────────────────────┐
│                   HTTP Router Layer                     │
│  (Session Validations, JWT Decoding, Request Dispatch)  │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼ Service Injections
┌─────────────────────────────────────────────────────────┐
│                   Business Services                     │
│    (Fraud Analysis, Forecasting, Memory, AI Gateway)    │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼ Repository Interfaces
┌─────────────────────────────────────────────────────────┐
│                    Repository Layer                     │
│   (BaseRepository wrapping Multi-Tenant memory store)   │
└─────────────────────────────────────────────────────────┘
```

## Key Architectural Pillars

### 1. Repository Pattern
To enable future database migrations (e.g. migration to PostgreSQL), all service components interact exclusively with repositories extending `BaseRepository`. Direct file-system store read/writes are strictly prohibited.
- **Base Class**: `BaseRepository` provides `find()`, `list()`, `insert()`, `update()`, and `delete()`.
- **Implementations**: Dedicated classes (e.g., `TransactionRepository`, `FraudAlertRepository`, `InvoiceRepository`) encapsulate custom query filters.

### 2. Event-Driven Communication
Core business actions publish events to a shared memory `EventBus`. This decouples secondary triggers (such as logging or alert triggers) from request-response lifecycles.
- **Example**: `fraudService` publishes `"fraud.alert.created"` to register warnings without blocking invoice approvals.

### 3. Pluggable AI Router & Agent Registry
- **BaseAiProvider**: Base class defining non-streaming chat completions and stream execution interfaces.
- **Orchestrator**: Supervisors use specialized personas configured with tool registry functions. Database transactions are only exposed to the AI model through safe, sandboxed tool definitions.
