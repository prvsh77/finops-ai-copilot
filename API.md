# REST API Specification

All API endpoints require a bearer authentication header: `Authorization: Bearer <access_token>`.

---

## 1. Authentication

### `POST /auth/register`
Creates a new tenant organization and owner user.
- **Request Body**:
  ```json
  {
    "email": "cfo@company.com",
    "password": "SecurePassword123!",
    "first_name": "Asha",
    "last_name": "Menon",
    "company_name": "Acme APAC",
    "accept_terms": true
  }
  ```
- **Response**: `201 Created` with `access_token` and `refresh_token`.

### `POST /auth/login`
Authenticates a user session.
- **Response**: `200 OK` with user profile and session token.

---

## 2. AI & Agent Gateways

### `POST /ai/stream` (SSE Stream)
Initiates a Server-Sent Events stream containing token text.
- **Request Body**:
  ```json
  {
    "query": "Verify duplicate payments",
    "conversation_id": "optional-uuid"
  }
  ```
- **Response**: Chunked lines prefixed with `data:`. Terminates with `data: [DONE]`.

### `POST /ai/evaluate`
Retrieves telemetry token counts and gateway performance.
- **Response**:
  ```json
  {
    "totalRequests": 12,
    "totalTokens": 45180,
    "totalCost": 0.0904,
    "averageLatencyMs": 340
  }
  ```

---

## 3. Financial Intelligence

### `GET /intelligence/fraud-alerts`
Returns duplicate payment matched details, high-value transfer alerts, and anomalies.

### `GET /intelligence/forecasts`
Returns 6-month revenues, expenditures, and cash balances trends.

### `GET /intelligence/financial-health`
Returns rating (`Excellent`/`Good`/`Average`/`Poor`), health score, and recommendations.

### `GET /search?q=<query>`
Unified search matching query keywords against transactions, invoices, vendors, and reports.

### `GET /export?resource=<type>&format=<format>`
Data file download engine.
- **Resources**: `transactions`, `invoices`, `payments`.
- **Formats**: `csv`, `json`, `excel`.
