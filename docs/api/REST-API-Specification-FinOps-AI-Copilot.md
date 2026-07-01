# Enterprise REST API Specification — OpenAPI Design Document

## FinOps AI Copilot — Enterprise AI Financial Intelligence Platform

---

## Document Control

| Field | Value |
|---|---|
| **Document ID** | API-FINCOPS-007 |
| **Document Title** | Enterprise REST API Specification |
| **Version** | 1.0 |
| **Status** | Final |
| **Author** | API Architecture & Platform Engineering Team |
| **Date** | 2026-06-30 |
| **Classification** | Internal — Confidential |
| **Approval Required** | VP Engineering, Lead Architect, API Consumers |

---

## Table of Contents

1. [API Standards & Conventions](#1-api-standards--conventions)
2. [Global API Components](#2-global-api-components)
3. [Authentication & Identity APIs](#3-authentication--identity-apis)
4. [Organization APIs](#4-organization-apis)
5. [User Management APIs](#5-user-management-apis)
6. [Dashboard APIs](#6-dashboard-apis)
7. [Transaction APIs](#7-transaction-apis)
8. [Invoice APIs](#8-invoice-apis)
9. [Payment APIs](#9-payment-apis)
10. [Bank Account APIs](#10-bank-account-apis)
11. [Treasury APIs](#11-treasury-apis)
12. [Cash Flow APIs](#12-cash-flow-apis)
13. [Forecasting APIs](#13-forecasting-apis)
14. [Budget APIs](#14-budget-apis)
15. [Financial Analytics APIs](#15-financial-analytics-apis)
16. [Financial Statement APIs](#16-financial-statement-apis)
17. [Journal Entry APIs](#17-journal-entry-apis)
18. [General Ledger APIs](#18-general-ledger-apis)
19. [Chart of Accounts APIs](#19-chart-of-accounts-apis)
20. [Fixed Asset APIs](#20-fixed-asset-apis)
21. [Vendor APIs](#21-vendor-apis)
22. [Customer APIs](#22-customer-apis)
23. [Procurement APIs](#23-procurement-apis)
24. [Fraud & Risk APIs](#24-fraud--risk-apis)
25. [Compliance APIs](#25-compliance-apis)
26. [Audit APIs](#26-audit-apis)
27. [Workflow Engine APIs](#27-workflow-engine-apis)
28. [Rule Engine APIs](#28-rule-engine-apis)
29. [AI Copilot APIs](#29-ai-copilot-apis)
30. [Report APIs](#30-report-apis)
31. [Document APIs](#31-document-apis)
32. [Notification APIs](#32-notification-apis)
33. [Billing APIs](#33-billing-apis)
34. [Integration APIs](#34-integration-apis)
35. [Developer APIs](#35-developer-apis)
36. [Webhook APIs](#36-webhook-apis)
37. [Search APIs](#37-search-apis)
38. [Monitoring & Health APIs](#38-monitoring--health-apis)
39. [Admin APIs](#39-admin-apis)
40. [Streaming APIs](#40-streaming-apis)
41. [File Upload/Download APIs](#41-file-uploaddownload-apis)
42. [Webhook Events Catalog](#42-webhook-events-catalog)
43. [Error Handling Reference](#43-error-handling-reference)
44. [API Security Reference](#44-api-security-reference)
45. [SDK & Client Considerations](#45-sdk--client-considerations)

---

## 1. API Standards & Conventions

### 1.1 Base URL

| Environment | Base URL |
|---|---|
| **Production** | `https://api.finopsaicopilot.com/api/v1` |
| **Staging** | `https://api.staging.finopsaicopilot.com/api/v1` |
| **Development** | `https://api.dev.finopsaicopilot.com/api/v1` |
| **Local** | `http://localhost:8080/api/v1` |

### 1.2 API Versioning

| Strategy | Detail |
|---|---|
| **Version Format** | URL path prefix: `/api/v1/`, `/api/v2/` |
| **Current Version** | `v1` |
| **Deprecation Header** | `Sunset: Sat, 31 Dec 2027 23:59:59 GMT` |
| **Migration Header** | `Deprecation: true` |
| **Version Lifetime** | Minimum 12 months from deprecation announcement |
| **Breaking Changes** | New version required. Additive changes allowed within version. |

### 1.3 HTTP Methods

| Method | Semantics | Idempotent | Safe |
|---|---|---|---|
| `GET` | Retrieve resource(s) | ✅ Yes | ✅ Yes |
| `POST` | Create resource or trigger action | ❌ No | ❌ No |
| `PUT` | Full replacement of resource | ✅ Yes | ❌ No |
| `PATCH` | Partial update of resource | ❌ No | ❌ No |
| `DELETE` | Remove resource | ✅ Yes | ❌ No |
| `HEAD` | Retrieve metadata only | ✅ Yes | ✅ Yes |
| `OPTIONS` | Retrieve allowed methods | ✅ Yes | ✅ Yes |

### 1.4 Request Headers

| Header | Required | Description |
|---|---|---|
| `Authorization` | Yes (except public endpoints) | `Bearer {jwt}` or `Bearer {api_key}` |
| `Content-Type` | For requests with body | `application/json` |
| `Accept` | No | `application/json` (default) |
| `Idempotency-Key` | For mutation endpoints | UUID v4. Prevents duplicate processing. |
| `X-Correlation-Id` | Recommended | UUID v4. For request tracing. |
| `X-Organization-Id` | For API key auth | Organization context for API key authentication |
| `If-Match` | For optimistic concurrency | ETag value |
| `If-None-Match` | For conditional GET | ETag value |
| `Accept-Language` | No | `en-US`, `fr-FR`, etc. |

### 1.5 Response Headers

| Header | Description |
|---|---|
| `X-Request-Id` | Unique request identifier |
| `X-Correlation-Id` | Echoed from request |
| `X-RateLimit-Limit` | Rate limit ceiling |
| `X-RateLimit-Remaining` | Requests remaining in window |
| `X-RateLimit-Reset` | Unix timestamp of rate limit reset |
| `ETag` | Resource version for caching |
| `Location` | Created resource URL (201 responses) |
| `Retry-After` | Seconds to wait before retry (429 responses) |
| `Sunset` | API version deprecation date |
| `Deprecation` | `true` if endpoint is deprecated |

### 1.6 Standard Response Envelope

```json
{
  "data": { ... },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-06-30T10:23:00Z",
    "version": "1.0"
  }
}
```

**Error Response Envelope:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request was invalid.",
    "details": [
      {
        "field": "amount",
        "code": "REQUIRED",
        "message": "Amount is required"
      }
    ],
    "request_id": "req_abc123",
    "documentation_url": "https://docs.finopsaicopilot.com/api/errors#VALIDATION_ERROR"
  }
}
```

### 1.7 Pagination

#### Offset Pagination (Default)

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number (1-indexed) |
| `per_page` | integer | 20 | Items per page (max 100) |

**Response:**

```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 1234,
    "total_pages": 62,
    "has_next": true,
    "has_prev": false
  }
}
```

#### Cursor Pagination (For real-time lists)

| Parameter | Type | Default | Description |
|---|---|---|---|
| `cursor` | string | null | Opaque cursor from previous response |
| `limit` | integer | 20 | Items per page (max 100) |

**Response:**

```json
{
  "data": [ ... ],
  "meta": {
    "next_cursor": "cursor_abc123",
    "has_more": true,
    "limit": 20
  }
}
```

### 1.8 Filtering

| Convention | Example | Description |
|---|---|---|
| Exact match | `?status=active` | Field equals value |
| Multiple values | `?status=active,pending` | Comma-separated OR |
| Range | `?amount[gte]=1000&amount[lte]=5000` | Greater-than-or-equal, less-than-or-equal |
| Date range | `?created_at[gte]=2026-01-01&created_at[lte]=2026-06-30` | ISO 8601 dates |
| Negation | `?status[ne]=cancelled` | Not equal |
| Exists | `?vendor_id[exists]=true` | Field is not null |
| Search | `?q=search+term` | Full-text search on relevant fields |

**Supported Operators:**
| Operator | Meaning |
|---|---|
| `eq` | Equal (default) |
| `ne` | Not equal |
| `gt` | Greater than |
| `gte` | Greater than or equal |
| `lt` | Less than |
| `lte` | Less than or equal |
| `in` | In array |
| `nin` | Not in array |
| `exists` | Field exists (not null) |
| `like` | Pattern match (SQL LIKE) |

### 1.9 Sorting

| Parameter | Example | Description |
|---|---|---|
| `sort` | `?sort=created_at` | Sort by field (ascending) |
| `sort` | `?sort=-created_at` | Sort by field descending |
| `sort` | `?sort=status,-amount` | Multi-field sort |

### 1.10 Searching

| Parameter | Example | Description |
|---|---|---|
| `q` | `?q=invoice+ABC` | Full-text search across relevant fields |
| `search_fields` | `?q=ABC&search_fields=name,description` | Restrict search to specific fields |

### 1.11 Sparse Fieldsets

| Parameter | Example | Description |
|---|---|---|
| `fields` | `?fields=id,name,amount,status` | Return only specified fields |

### 1.12 Including Related Resources

| Parameter | Example | Description |
|---|---|---|
| `include` | `?include=vendor,lines` | Include related resources in response |

### 1.13 Idempotency

| Property | Specification |
|---|---|
| **Header** | `Idempotency-Key: {uuid_v4}` |
| **Required For** | All POST, PUT, PATCH, DELETE mutations |
| **Key Scope** | Unique per API key + endpoint + key combination |
| **Response Cache** | 24 hours. Returns original response on repeat key. |
| **Key Rejection** | 400 if key is not UUID v4 format |
| **Concurrent Requests** | First request processed. Subsequent with same key return 409 Conflict until first completes. |

### 1.14 Rate Limiting

| Tier | Requests per Hour | Burst | Scope |
|---|---|---|---|
| **Starter** | 1,000 | 100 | Per API key |
| **Growth** | 10,000 | 500 | Per API key |
| **Enterprise** | 100,000 | 2,000 | Per API key |
| **Regulated Enterprise** | Custom | Custom | Per API key |
| **Unauthenticated** | 100 | 10 | Per IP address |

**Rate Limit Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### 1.15 Compression

| Property | Specification |
|---|---|
| **Algorithm** | gzip, brotli |
| **Request Header** | `Accept-Encoding: gzip, br` |
| **Response Header** | `Content-Encoding: gzip` |
| **Minimum Size** | Responses > 1KB are compressed |

### 1.16 Correlation & Tracing

| Property | Specification |
|---|---|
| **Request Header** | `X-Correlation-Id: {uuid_v4}` |
| **Response Header** | `X-Correlation-Id: {uuid_v4}` (echoed or generated) |
| **Trace ID** | `X-Trace-Id` — internal distributed tracing ID |
| **Logging** | All logs include correlation_id and trace_id |

### 1.17 API Authentication Methods

| Method | Header | Use Case |
|---|---|---|
| **JWT Bearer Token** | `Authorization: Bearer {jwt}` | Interactive user sessions |
| **API Key** | `Authorization: Bearer {api_key}` | Server-to-server, automated |
| **OAuth 2.0** | `Authorization: Bearer {access_token}` | Third-party integrations |

---

## 2. Global API Components

### 2.1 Reusable Schemas

#### `ApiError`

```json
{
  "type": "object",
  "properties": {
    "code": { "type": "string", "example": "VALIDATION_ERROR" },
    "message": { "type": "string", "example": "The request was invalid." },
    "details": {
      "type": "array",
      "items": { "$ref": "#/components/schemas/ErrorDetail" }
    },
    "request_id": { "type": "string", "example": "req_abc123" },
    "documentation_url": { "type": "string", "format": "uri" }
  }
}
```

#### `ErrorDetail`

```json
{
  "type": "object",
  "properties": {
    "field": { "type": "string", "example": "email" },
    "code": { "type": "string", "example": "INVALID_FORMAT" },
    "message": { "type": "string", "example": "Email must be a valid email address" }
  }
}
```

#### `PaginationMeta`

```json
{
  "type": "object",
  "properties": {
    "page": { "type": "integer", "example": 1 },
    "per_page": { "type": "integer", "example": 20 },
    "total": { "type": "integer", "example": 1234 },
    "total_pages": { "type": "integer", "example": 62 },
    "has_next": { "type": "boolean" },
    "has_prev": { "type": "boolean" }
  }
}
```

#### `CursorPaginationMeta`

```json
{
  "type": "object",
  "properties": {
    "next_cursor": { "type": "string", "example": "cursor_abc123" },
    "has_more": { "type": "boolean" },
    "limit": { "type": "integer", "example": 20 }
  }
}
```

#### `Money`

```json
{
  "type": "object",
  "properties": {
    "amount": { "type": "string", "example": "1234.5600" },
    "currency": { "type": "string", "example": "USD" }
  }
}
```

#### `AuditInfo`

```json
{
  "type": "object",
  "properties": {
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "created_by": { "$ref": "#/components/schemas/UserReference" },
    "updated_by": { "$ref": "#/components/schemas/UserReference" }
  }
}
```

#### `UserReference`

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "email": { "type": "string", "format": "email" },
    "name": { "type": "string" }
  }
}
```

### 2.2 Common Query Parameters

| Parameter | Type | Applies To | Description |
|---|---|---|---|
| `page` | integer | List endpoints | Page number (default: 1) |
| `per_page` | integer | List endpoints | Items per page (default: 20, max: 100) |
| `sort` | string | List endpoints | Sort field(s). Prefix `-` for descending. |
| `q` | string | List endpoints | Search query |
| `fields` | string | All endpoints | Comma-separated field whitelist |
| `include` | string | Detail endpoints | Comma-separated related resources |
| `status` | string | List endpoints | Filter by status |
| `created_at[gte]` | string (date) | List endpoints | Created after |
| `created_at[lte]` | string (date) | List endpoints | Created before |

### 2.3 Standard Status Codes

| Code | Description | Usage |
|---|---|---|
| `200 OK` | Successful GET, PUT, PATCH | Resource retrieved or updated |
| `201 Created` | Successful POST | Resource created |
| `202 Accepted` | Async operation accepted | Job queued, import started |
| `204 No Content` | Successful DELETE | Resource deleted |
| `301 Moved Permanently` | Resource moved | URL redirect |
| `400 Bad Request` | Invalid request | Validation errors, malformed syntax |
| `401 Unauthorized` | Authentication required | Missing/invalid credentials |
| `403 Forbidden` | Insufficient permissions | Authenticated but not authorized |
| `404 Not Found` | Resource not found | Invalid ID or path |
| `409 Conflict` | Resource conflict | Duplicate, version conflict, state conflict |
| `410 Gone` | Resource permanently deleted | |
| `415 Unsupported Media Type` | Wrong Content-Type | |
| `422 Unprocessable Entity` | Business rule violation | Valid JSON but business logic fails |
| `429 Too Many Requests` | Rate limit exceeded | Retry after header |
| `500 Internal Server Error` | Server error | Unexpected failure |
| `502 Bad Gateway` | Upstream error | Integration failure |
| `503 Service Unavailable` | Service temporarily down | Maintenance, overload |
| `504 Gateway Timeout` | Upstream timeout | Integration timeout |

### 2.4 Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `AUTHENTICATION_REQUIRED` | 401 | No valid authentication provided |
| `INVALID_TOKEN` | 401 | Token expired or invalid |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource does not exist |
| `RESOURCE_CONFLICT` | 409 | Resource state conflict |
| `DUPLICATE_RESOURCE` | 409 | Resource already exists |
| `VERSION_CONFLICT` | 409 | ETag mismatch |
| `BUSINESS_RULE_VIOLATION` | 422 | Request violates business rules |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |
| `INTEGRATION_ERROR` | 502 | External integration failed |
| `IDEMPOTENCY_KEY_MISSING` | 400 | Idempotency-Key header required |
| `IDEMPOTENCY_KEY_REUSED` | 422 | Key used with different request parameters |

---

## 3. Authentication & Identity APIs

### 3.1 Login

**POST** `/api/v1/auth/login`

**Purpose:** Authenticate user with email and password. Returns JWT tokens.

**Authentication:** None (public)

**Rate Limit:** 10 requests per minute per IP

**Request:**
```json
{
  "email": "user@company.com",
  "password": "securePassword123!",
  "remember_me": false
}
```

**Validation Rules:**
| Field | Rule |
|---|---|
| email | Required, valid email format, max 255 chars |
| password | Required, min 8 chars |
| remember_me | Optional boolean, default false |

**Business Rules:**
- After 5 failed attempts, account locked for 15 minutes
- If MFA enabled, response includes `mfa_required: true` and `mfa_token`
- If SSO domain, redirect to SSO provider

**Success Response (200):**
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "refresh_expires_in": 2592000,
    "user": {
      "id": "usr_abc123",
      "email": "user@company.com",
      "name": "John Doe",
      "role": "admin",
      "organization_id": "org_xyz789",
      "mfa_enabled": false
    }
  }
}
```

**MFA Required Response (200):**
```json
{
  "data": {
    "mfa_required": true,
    "mfa_token": "mfa_temp_token_abc",
    "mfa_methods": ["totp", "sms"]
  }
}
```

**Error Responses:**
| Status | Code | Description |
|---|---|---|
| 401 | `INVALID_CREDENTIALS` | Email or password incorrect |
| 401 | `ACCOUNT_LOCKED` | Account temporarily locked |
| 401 | `ACCOUNT_SUSPENDED` | Account suspended by admin |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many login attempts |

**Audit Event:** `user.login`

---

### 3.2 Register

**POST** `/api/v1/auth/register`

**Purpose:** Create a new organization account.

**Authentication:** None (public)

**Rate Limit:** 3 requests per hour per IP

**Request:**
```json
{
  "email": "user@company.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "company_name": "Acme Corp",
  "accept_terms": true
}
```

**Validation Rules:**
| Field | Rule |
|---|---|
| email | Required, valid email, unique, max 255 |
| password | Required, min 12, must contain uppercase, lowercase, number, special char |
| first_name | Required, max 100 |
| last_name | Required, max 100 |
| company_name | Required, max 255 |
| accept_terms | Required, must be true |

**Success Response (201):**
```json
{
  "data": {
    "user": { "id": "usr_abc", "email": "user@company.com" },
    "organization": { "id": "org_xyz", "name": "Acme Corp" },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Audit Event:** `user.registered`

---

### 3.3 Logout

**POST** `/api/v1/auth/logout`

**Purpose:** Invalidate current session/token.

**Authentication:** Bearer token

**Request:** (empty body)

**Success Response (204):** No content

**Audit Event:** `user.logout`

---

### 3.4 Refresh Token

**POST** `/api/v1/auth/refresh`

**Purpose:** Obtain new access token using refresh token.

**Authentication:** None (uses refresh token)

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200):**
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600
  }
}
```

---

### 3.5 Forgot Password

**POST** `/api/v1/auth/forgot-password`

**Purpose:** Send password reset email.

**Authentication:** None (public)

**Rate Limit:** 3 requests per hour per email

**Request:**
```json
{
  "email": "user@company.com"
}
```

**Success Response (200):**
```json
{
  "data": {
    "message": "If an account exists, a reset link has been sent."
  }
}
```

**Note:** Always returns success to prevent email enumeration.

---

### 3.6 Reset Password

**POST** `/api/v1/auth/reset-password`

**Purpose:** Reset password using token from email.

**Authentication:** None (uses reset token)

**Request:**
```json
{
  "token": "reset_token_abc123",
  "password": "NewSecurePass123!",
  "password_confirmation": "NewSecurePass123!"
}
```

**Success Response (200):**
```json
{
  "data": {
    "message": "Password has been reset successfully."
  }
}
```

---

### 3.7 MFA Verify

**POST** `/api/v1/auth/mfa/verify`

**Purpose:** Verify MFA code during login flow.

**Authentication:** MFA temp token (from login)

**Request:**
```json
{
  "mfa_token": "mfa_temp_token_abc",
  "code": "123456"
}
```

**Success Response (200):**
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 3.8 MFA Setup

**POST** `/api/v1/auth/mfa/setup`

**Purpose:** Enable MFA for current user.

**Authentication:** Bearer token

**Request:**
```json
{
  "method": "totp"
}
```

**Success Response (200):**
```json
{
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qr_code_url": "otpauth://totp/...",
    "recovery_codes": ["abc123", "def456", "ghi789", "jkl012", "mno345"]
  }
}
```

---

### 3.9 MFA Confirm

**POST** `/api/v1/auth/mfa/confirm`

**Purpose:** Confirm MFA setup by verifying first code.

**Authentication:** Bearer token

**Request:**
```json
{
  "code": "123456"
}
```

**Success Response (200):**
```json
{
  "data": {
    "message": "MFA has been enabled successfully."
  }
}
```

---

### 3.10 SSO Login

**POST** `/api/v1/auth/sso`

**Purpose:** Initiate SSO login flow.

**Authentication:** None (public)

**Request:**
```json
{
  "domain": "company.com"
}
```

**Success Response (200):**
```json
{
  "data": {
    "redirect_url": "https://company.okta.com/saml/...",
    "sso_session_id": "sso_sess_abc"
  }
}
```

---

### 3.11 SSO Callback

**POST** `/api/v1/auth/sso/callback`

**Purpose:** Complete SSO authentication after IdP redirect.

**Authentication:** None (uses SAML response)

**Request:**
```json
{
  "saml_response": "<samlp:Response>...</samlp:Response>",
  "sso_session_id": "sso_sess_abc"
}
```

**Success Response (200):**
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "usr_abc", "email": "user@company.com" }
  }
}
```

---

### 3.12 API Key Management

#### List API Keys

**GET** `/api/v1/api-keys`

**Purpose:** List all API keys for the authenticated user/organization.

**Authentication:** Bearer token

**Query Parameters:** Standard pagination + filtering

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "ak_abc123",
      "name": "Production",
      "key_prefix": "sk_prod",
      "scopes": ["transactions:read", "transactions:write"],
      "expires_at": "2027-06-30T00:00:00Z",
      "last_used_at": "2026-06-29T15:30:00Z",
      "created_at": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 3 }
}
```

#### Create API Key

**POST** `/api/v1/api-keys`

**Purpose:** Generate a new API key.

**Authentication:** Bearer token

**Request:**
```json
{
  "name": "Production API Key",
  "scopes": ["transactions:read", "invoices:read", "invoices:write"],
  "expires_at": "2027-06-30T00:00:00Z",
  "allowed_ips": ["203.0.113.0/24"]
}
```

**Success Response (201):**
```json
{
  "data": {
    "id": "ak_abc123",
    "name": "Production API Key",
    "key": "sk_prod_abc123def456...",
    "key_prefix": "sk_prod",
    "scopes": ["transactions:read", "invoices:read", "invoices:write"],
    "expires_at": "2027-06-30T00:00:00Z"
  }
}
```

**Note:** Full key is only shown once at creation.

#### Delete API Key

**DELETE** `/api/v1/api-keys/{id}`

**Purpose:** Revoke an API key.

**Authentication:** Bearer token

**Success Response (204):** No content

---

### 3.13 Session Management

#### List Sessions

**GET** `/api/v1/auth/sessions`

**Purpose:** List all active sessions for the current user.

**Authentication:** Bearer token

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "sess_abc",
      "ip_address": "203.0.113.42",
      "user_agent": "Mozilla/5.0...",
      "is_current": true,
      "created_at": "2026-06-30T08:00:00Z",
      "last_activity_at": "2026-06-30T10:23:00Z",
      "expires_at": "2026-06-30T20:00:00Z"
    }
  ]
}
```

#### Revoke Session

**DELETE** `/api/v1/auth/sessions/{id}`

**Purpose:** Revoke a specific session.

**Authentication:** Bearer token

**Success Response (204):** No content

#### Revoke All Sessions

**DELETE** `/api/v1/auth/sessions`

**Purpose:** Revoke all sessions except current.

**Authentication:** Bearer token

**Success Response (204):** No content

---

## 4. Organization APIs

### 4.1 Get Current Organization

**GET** `/api/v1/organizations/current`

**Purpose:** Retrieve current organization details.

**Authentication:** Bearer token

**Success Response (200):**
```json
{
  "data": {
    "id": "org_xyz789",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "plan_id": "enterprise",
    "status": "active",
    "base_currency": "USD",
    "timezone": "America/New_York",
    "fiscal_year_start": "2026-01-01",
    "locale": "en-US",
    "logo_url": "https://cdn.finopsaicopilot.com/logos/acme.png",
    "mfa_enforced": true,
    "session_timeout_minutes": 60,
    "created_at": "2026-01-15T10:00:00Z"
  }
}
```

### 4.2 Update Organization

**PATCH** `/api/v1/organizations/current`

**Purpose:** Update organization settings.

**Authentication:** Bearer token (Admin role)

**Request:**
```json
{
  "name": "Acme Corp Inc.",
  "timezone": "America/Chicago",
  "locale": "en-US",
  "logo_url": "https://cdn.finopsaicopilot.com/logos/acme-new.png"
}
```

**Success Response (200):** Returns updated organization

---

### 4.3 List Entities

**GET** `/api/v1/entities`

**Purpose:** List all legal entities/subsidiaries.

**Authentication:** Bearer token

**Query Parameters:** Standard pagination + `?status=active`

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "ent_abc",
      "code": "US-CORP",
      "name": "Acme Corp US",
      "country": "US",
      "currency": "USD",
      "status": "active",
      "type": "legal_entity",
      "parent_entity_id": null
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 5 }
}
```

### 4.4 Create Entity

**POST** `/api/v1/entities`

**Purpose:** Create a new legal entity.

**Authentication:** Bearer token (Admin role)

**Request:**
```json
{
  "code": "EU-GMBH",
  "name": "Acme GmbH",
  "country": "DE",
  "currency": "EUR",
  "tax_id": "DE123456789",
  "parent_entity_id": "ent_abc"
}
```

**Success Response (201):** Returns created entity

---

## 5. User Management APIs

### 5.1 List Users

**GET** `/api/v1/users`

**Purpose:** List all users in the organization.

**Authentication:** Bearer token (Admin role)

**Query Parameters:** `?status=active&role=admin&q=john`

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "usr_abc123",
      "email": "john@acme.com",
      "first_name": "John",
      "last_name": "Doe",
      "title": "CFO",
      "status": "active",
      "roles": [
        { "id": "role_admin", "name": "Admin" },
        { "id": "role_cfo", "name": "CFO" }
      ],
      "mfa_enabled": true,
      "last_login_at": "2026-06-30T08:00:00Z",
      "created_at": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 42 }
}
```

### 5.2 Invite User

**POST** `/api/v1/users/invite`

**Purpose:** Invite a new user to the organization.

**Authentication:** Bearer token (Admin role)

**Request:**
```json
{
  "email": "newuser@acme.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "role_ids": ["role_accountant"],
  "message": "Welcome to the finance team!"
}
```

**Success Response (201):**
```json
{
  "data": {
    "id": "usr_def456",
    "email": "newuser@acme.com",
    "status": "invited",
    "invitation_url": "https://app.finopsaicopilot.com/invite/accept?token=inv_abc"
  }
}
```

**Audit Event:** `user.invited`

### 5.3 Update User

**PATCH** `/api/v1/users/{id}`

**Purpose:** Update user details or role assignments.

**Authentication:** Bearer token (Admin role)

**Request:**
```json
{
  "first_name": "Jonathan",
  "role_ids": ["role_admin", "role_cfo"],
  "title": "VP Finance"
}
```

**Success Response (200):** Returns updated user

### 5.4 Suspend User

**POST** `/api/v1/users/{id}/suspend`

**Purpose:** Suspend a user's access.

**Authentication:** Bearer token (Admin role)

**Request:**
```json
{
  "reason": "Employee offboarded"
}
```

**Success Response (200):** Returns user with status `suspended`

**Audit Event:** `user.suspended`

### 5.5 Activate User

**POST** `/api/v1/users/{id}/activate`

**Purpose:** Reactivate a suspended user.

**Authentication:** Bearer token (Admin role)

**Success Response (200):** Returns user with status `active`

### 5.6 Delete User

**DELETE** `/api/v1/users/{id}`

**Purpose:** Soft-delete a user (GDPR: anonymize).

**Authentication:** Bearer token (Admin role)

**Success Response (204):** No content

**Audit Event:** `user.deleted`

---

### 5.7 Roles & Permissions

#### List Roles

**GET** `/api/v1/roles`

**Purpose:** List all roles in the organization.

**Authentication:** Bearer token (Admin role)

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "role_admin",
      "name": "Admin",
      "slug": "admin",
      "description": "Full system access",
      "is_system": true,
      "permissions": ["*"]
    },
    {
      "id": "role_accountant",
      "name": "Accountant",
      "slug": "accountant",
      "description": "AP/AR operations",
      "is_system": false,
      "permissions": ["transactions:read", "transactions:write", "invoices:read", "invoices:write"]
    }
  ]
}
```

#### Create Role

**POST** `/api/v1/roles`

**Purpose:** Create a custom role.

**Authentication:** Bearer token (Admin role)

**Request:**
```json
{
  "name": "AP Manager",
  "slug": "ap-manager",
  "description": "Manages accounts payable",
  "permission_ids": ["perm_txn_read", "perm_txn_write", "perm_inv_read", "perm_inv_approve"]
}
```

**Success Response (201):** Returns created role

#### List Permissions

**GET** `/api/v1/permissions`

**Purpose:** List all available permissions.

**Authentication:** Bearer token

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "perm_txn_read",
      "code": "transactions:read",
      "name": "Read Transactions",
      "module": "transactions",
      "description": "View transaction list and details"
    }
  ]
}
```

---

## 6. Dashboard APIs

### 6.1 Get Dashboard KPIs

**GET** `/api/v1/dashboard/kpis`

**Purpose:** Retrieve KPI data for the dashboard.

**Authentication:** Bearer token

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `period` | string | `current_month`, `current_quarter`, `current_year`, `custom` |
| `start_date` | date | Required if period=custom |
| `end_date` | date | Required if period=custom |
| `entity_id` | uuid | Filter by entity |
| `comparison` | string | `previous_period`, `year_ago`, `budget` |

**Success Response (200):**
```json
{
  "data": {
    "kpis": [
      {
        "key": "cash_balance",
        "label": "Cash Balance",
        "value": "12450000.0000",
        "currency": "USD",
        "change": 5.2,
        "change_direction": "up",
        "sparkline": [12000000, 12100000, 12250000, 12300000, 12450000],
        "period": "current_month"
      },
      {
        "key": "revenue_mtd",
        "label": "Revenue MTD",
        "value": "3200000.0000",
        "currency": "USD",
        "change": 12.3,
        "change_direction": "up",
        "sparkline": [2800000, 2950000, 3100000, 3200000]
      },
      {
        "key": "expenses_mtd",
        "label": "Expenses MTD",
        "value": "2100000.0000",
        "currency": "USD",
        "change": -3.1,
        "change_direction": "down",
        "sparkline": [2200000, 2150000, 2120000, 2100000]
      },
      {
        "key": "runway_days",
        "label": "Runway",
        "value": "14",
        "unit": "months",
        "change": 2,
        "change_direction": "up"
      }
    ],
    "period": { "start": "2026-06-01", "end": "2026-06-30" }
  }
}
```

### 6.2 Get Revenue vs Expense Chart

**GET** `/api/v1/dashboard/charts/revenue-expense`

**Purpose:** Get time-series data for revenue vs expense chart.

**Authentication:** Bearer token

**Query Parameters:** `?period=12_months&entity_id=ent_abc`

**Success Response (200):**
```json
{
  "data": {
    "series": [
      {
        "name": "Revenue",
        "data": [
          { "date": "2026-01", "value": 2800000 },
          { "date": "2026-02", "value": 2950000 }
        ]
      },
      {
        "name": "Expenses",
        "data": [
          { "date": "2026-01", "value": 2100000 },
          { "date": "2026-02", "value": 2150000 }
        ]
      }
    ]
  }
}
```

### 6.3 Get AI Executive Summary

**GET** `/api/v1/dashboard/ai-summary`

**Purpose:** Get AI-generated executive summary.

**Authentication:** Bearer token

**Query Parameters:** `?regenerate=true` (force regeneration)

**Success Response (200):**
```json
{
  "data": {
    "summary": "This week revenue increased 12% driven by enterprise sales. Cash position remains strong at $12.4M with 14 months runway. Top risk: 2 high-severity fraud alerts requiring review.",
    "confidence": 0.92,
    "generated_at": "2026-06-30T06:00:00Z",
    "sources": [
      { "type": "kpi", "key": "revenue_mtd", "label": "Revenue MTD" },
      { "type": "kpi", "key": "cash_balance", "label": "Cash Balance" }
    ],
    "is_stale": false
  }
}
```

### 6.4 Get Pending Approvals

**GET** `/api/v1/dashboard/pending-approvals`

**Purpose:** Get pending approval tasks for the current user.

**Authentication:** Bearer token

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "aprv_abc",
      "type": "invoice",
      "resource_id": "inv_8923",
      "title": "Invoice INV-2024-0892",
      "amount": "12400.00",
      "currency": "USD",
      "priority": "high",
      "sla_remaining_minutes": 120,
      "created_at": "2026-06-30T08:00:00Z"
    }
  ],
  "meta": { "total": 5 }
}
```

### 6.5 Get Active Alerts

**GET** `/api/v1/dashboard/alerts`

**Purpose:** Get active alerts for the organization.

**Authentication:** Bearer token

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "alert_abc",
      "severity": "critical",
      "type": "fraud",
      "title": "Duplicate payment detected",
      "description": "Potential duplicate payment of $50,000 to ABC Corp",
      "resource_type": "fraud_alert",
      "resource_id": "fa_xyz",
      "created_at": "2026-06-30T10:00:00Z"
    }
  ],
  "meta": { "total": 3 }
}
```

---

## 7. Transaction APIs

### 7.1 List Transactions

**GET** `/api/v1/transactions`

**Purpose:** List financial transactions with filtering, sorting, and pagination.

**Authentication:** Bearer token

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `status` | string | `posted`, `pending`, `voided` |
| `reconciliation_status` | string | `unreconciled`, `matched`, `reconciled` |
| `flag_status` | string | `none`, `flagged`, `duplicate`, `anomaly` |
| `category_id` | uuid | Filter by category |
| `vendor_id` | uuid | Filter by vendor |
| `bank_account_id` | uuid | Filter by bank account |
| `amount[gte]` | number | Minimum amount |
| `amount[lte]` | number | Maximum amount |
| `posted_date[gte]` | date | Start date |
| `posted_date[lte]` | date | End date |
| `q` | string | Search in description |
| `sort` | string | `-posted_date`, `amount`, `-amount` |
| `include` | string | `vendor,category,bank_account` |

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "txn_abc123",
      "amount": "12400.00",
      "currency": "USD",
      "base_currency_amount": "12400.00",
      "posted_date": "2026-06-30",
      "description": "Payment to ABC Corp - Invoice 8923",
      "category": {
        "id": "cat_001",
        "name": "Accounts Payable"
      },
      "vendor": {
        "id": "ven_001",
        "name": "ABC Corp"
      },
      "bank_account": {
        "id": "ba_001",
        "masked_number": "●●●●1234",
        "institution_name": "Chase"
      },
      "reconciliation_status": "reconciled",
      "flag_status": "none",
      "status": "posted",
      "created_at": "2026-06-30T10:23:00Z"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 1234 }
}
```

### 7.2 Get Transaction

**GET** `/api/v1/transactions/{id}`

**Purpose:** Get detailed transaction information.

**Authentication:** Bearer token

**Query Parameters:** `?include=vendor,category,lines,attachments`

**Success Response (200):**
```json
{
  "data": {
    "id": "txn_abc123",
    "organization_id": "org_xyz",
    "entity_id": "ent_abc",
    "bank_account_id": "ba_001",
    "external_id": "plaid_txn_abc",
    "amount": "12400.00",
    "currency": "USD",
    "base_currency_amount": "12400.00",
    "exchange_rate": "1.00000000",
    "posted_date": "2026-06-30",
    "effective_date": "2026-06-30",
    "description": "Payment to ABC Corp - Invoice 8923",
    "reference": "INV-2024-0892",
    "category": { "id": "cat_001", "name": "Accounts Payable" },
    "category_confidence": 0.98,
    "vendor": { "id": "ven_001", "name": "ABC Corp" },
    "reconciliation_status": "reconciled",
    "flag_status": "none",
    "risk_score": 0.02,
    "status": "posted",
    "source": "bank_sync",
    "is_split": false,
    "lines": [],
    "attachments": [
      { "id": "doc_001", "filename": "invoice_8923.pdf", "url": "https://cdn.finopsaicopilot.com/docs/..." }
    ],
    "audit": {
      "created_at": "2026-06-30T10:23:00Z",
      "created_by": { "id": "usr_001", "name": "System" }
    }
  }
}
```

### 7.3 Update Transaction

**PATCH** `/api/v1/transactions/{id}`

**Purpose:** Update transaction fields (category, description, etc.).

**Authentication:** Bearer token

**Request:**
```json
{
  "category_id": "cat_002",
  "description": "Updated description",
  "vendor_id": "ven_002"
}
```

**Business Rules:**
- Cannot modify reconciled transactions (must unreconcile first)
- Cannot modify posted transactions older than current period - 1 (Controller+ override)
- Category change logged to audit trail

**Success Response (200):** Returns updated transaction

### 7.4 Categorize Transaction

**POST** `/api/v1/transactions/{id}/categorize`

**Purpose:** Set or update transaction category with AI assistance.

**Authentication:** Bearer token

**Request:**
```json
{
  "category_id": "cat_003",
  "confidence": 0.95
}
```

**Success Response (200):** Returns updated transaction

### 7.5 Bulk Categorize

**POST** `/api/v1/transactions/bulk/categorize`

**Purpose:** Categorize multiple transactions at once.

**Authentication:** Bearer token

**Request:**
```json
{
  "transaction_ids": ["txn_001", "txn_002", "txn_003"],
  "category_id": "cat_003"
}
```

**Success Response (200):**
```json
{
  "data": {
    "updated": 3,
    "failed": 0,
    "errors": []
  }
}
```

### 7.6 Flag Transaction

**POST** `/api/v1/transactions/{id}/flag`

**Purpose:** Flag a transaction for review.

**Authentication:** Bearer token

**Request:**
```json
{
  "reason": "Suspicious amount for this vendor"
}
```

**Success Response (200):** Returns transaction with flag_status = 'flagged'

### 7.7 Unflag Transaction

**POST** `/api/v1/transactions/{id}/unflag`

**Purpose:** Remove flag from transaction.

**Authentication:** Bearer token

**Success Response (200):** Returns transaction with flag_status = 'none'

### 7.8 Split Transaction

**POST** `/api/v1/transactions/{id}/split`

**Purpose:** Split a transaction into multiple lines.

**Authentication:** Bearer token

**Request:**
```json
{
  "lines": [
    { "amount": "10000.00", "category_id": "cat_001", "description": "Services" },
    { "amount": "2400.00", "category_id": "cat_tax", "description": "Tax" }
  ]
}
```

**Business Rules:**
- Sum of lines must equal original transaction amount
- Cannot split reconciled transactions

**Success Response (200):** Returns transaction with is_split = true

### 7.9 Import Transactions

**POST** `/api/v1/transactions/import`

**Purpose:** Import transactions from CSV, OFX, QFX, or MT940 file.

**Authentication:** Bearer token

**Request:** Multipart form data
| Field | Type | Description |
|---|---|---|
| `file` | file | CSV, OFX, QFX, or MT940 file |
| `bank_account_id` | uuid | Target bank account |
| `column_mapping` | json | Optional column mapping for CSV |

**Success Response (202):**
```json
{
  "data": {
    "import_id": "imp_abc123",
    "status": "processing",
    "total_rows": 1234,
    "estimated_duration_seconds": 30
  }
}
```

**Webhook Event:** `transaction.import.completed`

### 7.10 Get Import Status

**GET** `/api/v1/transactions/imports/{import_id}/status`

**Purpose:** Check the status of an import job.

**Authentication:** Bearer token

**Success Response (200):**
```json
{
  "data": {
    "import_id": "imp_abc123",
    "status": "completed",
    "total_rows": 1234,
    "processed": 1234,
    "errors": 2,
    "error_details": [
      { "row": 45, "message": "Invalid date format" },
      { "row": 67, "message": "Duplicate transaction" }
    ],
    "completed_at": "2026-06-30T10:30:00Z"
  }
}
```

### 7.11 Export Transactions

**POST** `/api/v1/transactions/export`

**Purpose:** Export filtered transactions to CSV, XLSX, or PDF.

**Authentication:** Bearer token

**Request:**
```json
{
  "format": "csv",
  "filters": {
    "posted_date[gte]": "2026-01-01",
    "posted_date[lte]": "2026-06-30",
    "status": "posted"
  },
  "columns": ["date", "description", "amount", "category", "status"]
}
```

**Success Response (202):**
```json
{
  "data": {
    "export_id": "exp_abc123",
    "status": "processing",
    "download_url": null,
    "estimated_duration_seconds": 15
  }
}
```

### 7.12 Reconcile Transaction

**POST** `/api/v1/transactions/{id}/reconcile`

**Purpose:** Mark a transaction as reconciled.

**Authentication:** Bearer token

**Request:**
```json
{
  "invoice_id": "inv_8923",
  "notes": "Matched to invoice"
}
```

**Success Response (200):** Returns transaction with reconciliation_status = 'reconciled'

### 7.13 AI Categorize

**POST** `/api/v1/transactions/ai/categorize`

**Purpose:** Use AI to suggest categories for uncategorized transactions.

**Authentication:** Bearer token

**Request:**
```json
{
  "transaction_ids": ["txn_001", "txn_002"],
  "auto_apply": false
}
```

**Success Response (200):**
```json
{
  "data": [
    {
      "transaction_id": "txn_001",
      "suggested_category_id": "cat_001",
      "suggested_category_name": "Accounts Payable",
      "confidence": 0.95,
      "reasoning": "Matched vendor ABC Corp to existing AP category"
    }
  ]
}
```

### 7.14 AI Detect Duplicates

**POST** `/api/v1/transactions/ai/detect-duplicates`

**Purpose:** Use AI to detect duplicate transactions.

**Authentication:** Bearer token

**Success Response (200):**
```json
{
  "data": [
    {
      "transaction_id": "txn_001",
      "duplicate_of_id": "txn_002",
      "confidence": 0.92,
      "reason": "Same vendor, amount, and date within 7 days"
    }
  ]
}
```

---

## 8. Invoice APIs

### 8.1 List Invoices

**GET** `/api/v1/invoices`

**Purpose:** List invoices with filtering and pagination.

**Authentication:** Bearer token

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `type` | string | `ap` (payable) or `ar` (receivable) |
| `status` | string | `draft`, `pending_approval`, `approved`, `paid`, `rejected`, `on_hold` |
| `vendor_id` | uuid | Filter by vendor |
| `due_date[gte]` | date | Due after |
| `due_date[lte]` | date | Due before |
| `amount[gte]` | number | Minimum amount |
| `q` | string | Search invoice number, vendor name |

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "inv_8923",
      "type": "ap",
      "invoice_number": "INV-2024-0892",
      "vendor": { "id": "ven_001", "name": "ABC Corp" },
      "amount": "12400.00",
      "currency": "USD",
      "due_date": "2026-07-30",
      "status": "pending_approval",
      "approval_status": "pending",
      "payment_status": "unpaid",
      "ocr_confidence": 0.95,
      "created_at": "2026-06-28T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 156 }
}
```

### 8.2 Get Invoice

**GET** `/api/v1/invoices/{id}`

**Purpose:** Get detailed invoice information.

**Authentication:** Bearer token

**Query Parameters:** `?include=vendor,lines,payments,attachments`

**Success Response (200):**
```json
{
  "data": {
    "id": "inv_8923",
    "type": "ap",
    "invoice_number": "INV-2024-0892",
    "vendor": { "id": "ven_001", "name": "ABC Corp" },
    "amount": "12400.00",
    "tax_amount": "0.00",
    "currency": "USD",
    "base_currency_amount": "12400.00",
    "invoice_date": "2026-06-28",
    "due_date": "2026-07-30",
    "received_date": "2026-06-28",
    "status": "pending_approval",
    "approval_status": "pending",
    "payment_status": "unpaid",
    "po_number": "PO-2024-042",
    "po_match_status": "matched",
    "tax_validation_status": "passed",
    "duplicate_check_status": "clean",
    "ocr_confidence": 0.95,
    "payment_terms": "Net 30",
    "early_payment_discount": 0.02,
    "early_payment_due_date": "2026-07-10",
    "lines": [
      { "description": "Consulting services", "quantity": 1, "unit_price": "12400.00", "amount": "12400.00" }
    ],
    "payments": [],
    "attachments": [
      { "id": "doc_001", "filename": "invoice_8923.pdf", "url": "..." }
    ],
    "audit": { "created_at": "2026-06-28T10:00:00Z", "created_by": { "id": "usr_001", "name": "System" } }
  }
}
```

### 8.3 Upload Invoice

**POST** `/api/v1/invoices/upload`

**Purpose:** Upload invoice document(s) for OCR processing.

**Authentication:** Bearer token

**Request:** Multipart form data
| Field | Type | Description |
|---|---|---|
| `files` | file[] | PDF, PNG, JPG, TIFF (max 50MB each) |
| `vendor_id` | uuid | Optional pre-select vendor |

**Success Response (202):**
```json
{
  "data": {
    "uploads": [
      {
        "file_id": "file_001",
        "filename": "invoice_8923.pdf",
        "status": "processing",
        "ocr_job_id": "ocr_abc"
      }
    ]
  }
}
```

### 8.4 Create Invoice (Manual)

**POST** `/api/v1/invoices`

**Purpose:** Create an invoice manually (without OCR).

**Authentication:** Bearer token

**Request:**
```json
{
  "type": "ap",
  "vendor_id": "ven_001",
  "invoice_number": "INV-2024-0893",
  "amount": "5000.00",
  "currency": "USD",
  "invoice_date": "2026-06-30",
  "due_date": "2026-07-30",
  "description": "Marketing services",
  "lines": [
    { "description": "Social media campaign", "quantity": 1, "unit_price": "5000.00", "amount": "5000.00" }
  ]
}
```

**Success Response (201):** Returns created invoice

### 8.5 Approve Invoice

**POST** `/api/v1/invoices/{id}/approve`

**Purpose:** Approve an invoice.

**Authentication:** Bearer token (Approver role)

**Request:**
```json
{
  "comment": "Approved. Budget available."
}
```

**Business Rules:**
- Requires `invoices:approve` permission
- If multi-level approval required, status becomes `partial` until all levels approve
- If rejected, invoice returns to `pending_approval` or `rejected` based on configuration

**Success Response (200):** Returns updated invoice

**Audit Event:** `invoice.approved`

### 8.6 Reject Invoice

**POST** `/api/v1/invoices/{id}/reject`

**Purpose:** Reject an invoice.

**Authentication:** Bearer token (Approver role)

**Request:**
```json
{
  "reason": "PO number mismatch. Please correct and resubmit."
}
```

**Success Response (200):** Returns invoice with status `rejected`

### 8.7 Hold Invoice

**POST** `/api/v1/invoices/{id}/hold`

**Purpose:** Place an invoice on hold.

**Authentication:** Bearer token

**Request:**
```json
{
  "reason": "Awaiting vendor verification"
}
```

**Success Response (200):** Returns invoice with status `on_hold`

### 8.8 Release Hold

**POST** `/api/v1/invoices/{id}/release-hold`

**Purpose:** Release an invoice from hold.

**Authentication:** Bearer token

**Success Response (200):** Returns invoice with previous status

### 8.9 Schedule Payment

**POST** `/api/v1/invoices/{id}/schedule-payment`

**Purpose:** Schedule payment for an approved invoice.

**Authentication:** Bearer token

**Request:**
```json
{
  "scheduled_date": "2026-07-15",
  "payment_method": "ach"
}
```

**Success Response (200):** Returns invoice with payment scheduled

### 8.10 AI Extract Invoice

**POST** `/api/v1/invoices/ai/extract`

**Purpose:** Use AI to extract data from an invoice image/PDF.

**Authentication:** Bearer token

**Request:**
```json
{
  "file_id": "file_001"
}
```

**Success Response (200):**
```json
{
  "data": {
    "extracted_fields": {
      "vendor_name": "ABC Corp",
      "invoice_number": "INV-2024-0892",
      "date": "2026-06-28",
      "amount": "12400.00",
      "tax_amount": "0.00",
      "line_items": [
        { "description": "Consulting", "quantity": 1, "unit_price": "12400.00", "amount": "12400.00" }
      ]
    },
    "confidence": 0.95,
    "suggested_vendor_id": "ven_001"
  }
}
```

---

## 9. Payment APIs

### 9.1 List Payment Batches

**GET** `/api/v1/payments/batches`

**Purpose:** List payment batches.

**Authentication:** Bearer token

**Query Parameters:** `?status=pending_approval&rail=ach`

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "batch_042",
      "batch_number": "B-202606-0042",
      "rail": "ach",
      "total_amount": "89000.00",
      "currency": "USD",
      "payment_count": 12,
      "status": "pending_level1",
      "approval_level_1_by": null,
      "approval_level_2_by": null,
      "created_at": "2026-06-30T08:00:00Z"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 8 }
}
```

### 9.2 Create Payment Batch

**POST** `/api/v1/payments/batches`

**Purpose:** Create a payment batch from approved invoices.

**Authentication:** Bearer token

**Request:**
```json
{
  "rail": "ach",
  "scheduled_date": "2026-07-01",
  "invoice_ids": ["inv_001", "inv_002", "inv_003"],
  "memo": "Monthly vendor payments - July 2026"
}
```

**Business Rules:**
- All invoices must be in `approved` status
- All invoices must be for the same currency (or FX conversion applied)
- Batch total must not exceed available balance

**Success Response (201):** Returns created batch

### 9.3 Get Payment Batch

**GET** `/api/v1/payments/batches/{id}`

**Purpose:** Get payment batch details with included payments.

**Authentication:** Bearer token

**Query Parameters:** `?include=payments,invoices`

### 9.4 Approve Payment Batch (Level 1)

**POST** `/api/v1/payments/batches/{id}/approve-level-1`

**Purpose:** First-level approval for payment batch.

**Authentication:** Bearer token (Approver role)

**Business Rules:**
- Approver must be different from batch creator
- If batch total > $500K, Level 2 approval also required

### 9.5 Approve Payment Batch (Level 2)

**POST** `/api/v1/payments/batches/{id}/approve-level-2`

**Purpose:** Second-level approval (dual control).

**Authentication:** Bearer token (Approver role)

**Business Rules:**
- Approver must be different from Level 1 approver
- Approver must be different from batch creator

### 9.6 Release Payment Batch

**POST** `/api/v1/payments/batches/{id}/release`

**Purpose:** Execute/release approved payment batch.

**Authentication:** Bearer token (Treasurer role)

**Success Response (200):** Batch status becomes `released`

**Webhook Event:** `payment.batch.released`

### 9.7 Hold Payment

**POST** `/api/v1/payments/{id}/hold`

**Purpose:** Place an individual payment on hold.

**Authentication:** Bearer token

**Request:**
```json
{
  "reason": "Vendor bank account verification pending"
}
```

### 9.8 Release Payment Hold

**POST** `/api/v1/payments/{id}/release-hold`

**Purpose:** Release a held payment.

**Authentication:** Bearer token

### 9.9 Retry Payment

**POST** `/api/v1/payments/{id}/retry`

**Purpose:** Retry a failed payment.

**Authentication:** Bearer token

**Business Rules:**
- Max 3 retries
- After max retries, payment moves to dead-letter state

### 9.10 List Payments

**GET** `/api/v1/payments`

**Purpose:** List individual payments.

**Authentication:** Bearer token

**Query Parameters:** `?status=released&rail=ach&vendor_id=ven_001`

---

## 10. Bank Account APIs

### 10.1 List Bank Accounts

**GET** `/api/v1/bank-accounts`

**Purpose:** List all connected bank accounts.

**Authentication:** Bearer token

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "ba_001",
      "institution_name": "Chase",
      "account_type": "checking",
      "masked_number": "●●●●1234",
      "currency": "USD",
      "balance_current": "2100000.00",
      "balance_available": "2100000.00",
      "status": "active",
      "sync_status": "connected",
      "last_sync_at": "2026-06-30T10:13:00Z"
    }
  ]
}
```

### 10.2 Connect Bank Account

**POST** `/api/v1/bank-accounts/connect`

**Purpose:** Connect a bank account via Plaid or manual entry.

**Authentication:** Bearer token

**Request (Plaid):**
```json
{
  "provider": "plaid",
  "public_token": "plaid_public_token_abc",
  "entity_id": "ent_abc"
}
```

**Request (Manual):**
```json
{
  "provider": "manual",
  "institution_name": "Chase",
  "account_type": "checking",
  "account_number": "1234567890",
  "routing_number": "021000021",
  "currency": "USD",
  "entity_id": "ent_abc"
}
```

**Success Response (201):** Returns created bank account

### 10.3 Sync Bank Account

**POST** `/api/v1/bank-accounts/{id}/sync`

**Purpose:** Trigger manual sync for a bank account.

**Authentication:** Bearer token

**Success Response (202):**
```json
{
  "data": {
    "sync_id": "sync_abc",
    "status": "in_progress"
  }
}
```

### 10.4 Get Bank Statements

**GET** `/api/v1/bank-accounts/{id}/statements`

**Purpose:** List bank statements for an account.

**Authentication:** Bearer token

**Query Parameters:** `?period=2026-06`

---

## 11. Treasury APIs

### 11.1 Get Cash Position

**GET** `/api/v1/treasury/cash-position`

**Purpose:** Get consolidated cash position.

**Authentication:** Bearer token

**Query Parameters:** `?entity_id=ent_abc&date=2026-06-30`

**Success Response (200):**
```json
{
  "data": {
    "snapshot_date": "2026-06-30",
    "total_cash": "3450000.00",
    "total_cash_base_currency": "3450000.00",
    "cash_by_account": [
      { "account_id": "ba_001", "institution": "Chase", "balance": "2100000.00", "currency": "USD" },
      { "account_id": "ba_002", "institution": "BofA", "balance": "890000.00", "currency": "USD" },
      { "account_id": "ba_003", "institution": "Wells Fargo", "balance": "450000.00", "currency": "USD" }
    ],
    "cash_by_currency": [
      { "currency": "USD", "amount": "3450000.00" }
    ],
    "pending_transfers": "0.00",
    "available_credit": "5000000.00"
  }
}
```

### 11.2 Get FX Exposure

**GET** `/api/v1/treasury/fx-exposure`

**Purpose:** Get foreign exchange exposure summary.

**Authentication:** Bearer token

**Success Response (200):**
```json
{
  "data": [
    {
      "currency_pair": "EUR/USD",
      "net_position": "1200000.00",
      "spot_rate": "1.0825",
      "30d_change_pct": 1.2,
      "hedge_recommended": true
    }
  ]
}
```

### 11.3 Create Treasury Transfer

**POST** `/api/v1/treasury/transfers`

**Purpose:** Create an inter-account transfer.

**Authentication:** Bearer token

**Request:**
```json
{
  "from_account_id": "ba_001",
  "to_account_id": "ba_002",
  "amount": "500000.00",
  "currency": "USD",
  "reason": "Concentration to high-yield account"
}
```

**Business Rules:**
- Transfer > $500K requires dual approval
- Source account must have sufficient balance

---

## 12. Cash Flow APIs

### 12.1 Get Cash Flow

**GET** `/api/v1/cash-flow`

**Purpose:** Get cash flow data for the dashboard.

**Authentication:** Bearer token

**Query Parameters:** `?period=13_weeks&entity_id=ent_abc`

**Success Response (200):**
```json
{
  "data": {
    "entries": [
      { "date": "2026-06-30", "inflow": "500000.00", "outflow": "380000.00", "net": "120000.00", "balance": "3450000.00" }
    ],
    "summary": {
      "starting_balance": "3330000.00",
      "total_inflow": "500000.00",
      "total_outflow": "380000.00",
      "ending_balance": "3450000.00",
      "runway_months": 14
    }
  }
}
```

### 12.2 Get Cash Forecast

**GET** `/api/v1/cash-flow/forecast`

**Purpose:** Get cash flow forecast with confidence bands.

**Authentication:** Bearer token

**Query Parameters:** `?horizon=13_weeks&scenario=base`

**Success Response (200):**
```json
{
  "data": {
    "forecast": [
      { "date": "2026-07-07", "projected": "3500000.00", "lower_bound": "3300000.00", "upper_bound": "3700000.00", "confidence": 0.85 }
    ],
    "scenario": "base",
    "confidence_score": 0.82
  }
}
```

### 12.3 Create Scenario

**POST** `/api/v1/cash-flow/scenarios`

**Purpose:** Create a what-if cash flow scenario.

**Authentication:** Bearer token

**Request:**
```json
{
  "name": "Revenue Decline 20%",
  "parameters": {
    "revenue_change": -0.2,
    "expense_change": 0.0,
    "delayed_receivables_days": 15
  }
}
```

---

## 13. Forecasting APIs

### 13.1 List Forecasts

**GET** `/api/v1/forecasts`

**Purpose:** List available forecast models and scenarios.

**Authentication:** Bearer token

### 13.2 Run Forecast

**POST** `/api/v1/forecasts/run`

**Purpose:** Run a forecast model.

**Authentication:** Bearer token

**Request:**
```json
{
  "model_type": "prophet",
  "horizon_months": 12,
  "entity_id": "ent_abc",
  "include_scenarios": ["base", "optimistic", "pessimistic"]
}
```

**Success Response (202):**
```json
{
  "data": {
    "forecast_id": "fcst_abc",
    "status": "running",
    "estimated_duration_seconds": 120
  }
}
```

### 13.3 Get Forecast

**GET** `/api/v1/forecasts/{id}`

**Purpose:** Get forecast results.

**Authentication:** Bearer token

**Success Response (200):**
```json
{
  "data": {
    "id": "fcst_abc",
    "model_type": "prophet",
    "horizon_months": 12,
    "status": "completed",
    "scenarios": [
      {
        "name": "base",
        "data": [
          { "date": "2026-07", "value": "42500000.00", "lower_bound": "40375000.00", "upper_bound": "44625000.00" }
        ],
        "confidence": 0.85
      }
    ],
    "accuracy_metrics": {
      "mape": 4.2,
      "rmse": 1200000,
      "bias": 0.02
    },
    "completed_at": "2026-06-30T10:30:00Z"
  }
}
```

---

## 14. Budget APIs

### 14.1 List Budgets

**GET** `/api/v1/budgets`

**Purpose:** List budgets for the organization.

**Authentication:** Bearer token

**Query Parameters:** `?period=fy_2026&department_id=dept_eng`

### 14.2 Create Budget

**POST** `/api/v1/budgets`

**Purpose:** Create a new budget.

**Authentication:** Bearer token

**Request:**
```json
{
  "name": "Engineering FY 2026",
  "fiscal_year": 2026,
  "department_id": "dept_eng",
  "entity_id": "ent_abc",
  "lines": [
    { "account_id": "acct_5000", "amount": "2400000.00", "description": "Salaries" },
    { "account_id": "acct_5100", "amount": "500000.00", "description": "Software" },
    { "account_id": "acct_5200", "amount": "300000.00", "description": "Cloud Infrastructure" }
  ]
}
```

### 14.3 Submit Budget for Approval

**POST** `/api/v1/budgets/{id}/submit`

**Purpose:** Submit budget for approval workflow.

**Authentication:** Bearer token

### 14.4 Approve Budget

**POST** `/api/v1/budgets/{id}/approve`

**Purpose:** Approve a budget version.

**Authentication:** Bearer token (Approver role)

### 14.5 Get Budget Variance

**GET** `/api/v1/budgets/{id}/variance`

**Purpose:** Get actual vs budget variance analysis.

**Authentication:** Bearer token

**Query Parameters:** `?period=q2_2026`

**Success Response (200):**
```json
{
  "data": {
    "budget_id": "budg_001",
    "period": "q2_2026",
    "total_budget": "3200000.00",
    "total_actual": "3400000.00",
    "variance": "200000.00",
    "variance_pct": 6.25,
    "lines": [
      {
        "account": { "code": "5000", "name": "Salaries" },
        "budget": "600000.00",
        "actual": "620000.00",
        "variance": "20000.00",
        "variance_pct": 3.33
      }
    ]
  }
}
```

---

## 15. Financial Analytics APIs

### 15.1 Get P&L Driver Analysis

**GET** `/api/v1/analytics/pnl-drivers`

**Purpose:** Get P&L driver breakdown with variance explanation.

**Authentication:** Bearer token

**Query Parameters:** `?period=q2_2026&comparison=q2_2025&entity_id=ent_abc`

**Success Response (200):**
```json
{
  "data": {
    "current_period": { "revenue": "12400000.00", "expenses": "10200000.00", "net_income": "2200000.00" },
    "comparison_period": { "revenue": "11000000.00", "expenses": "9800000.00", "net_income": "1200000.00" },
    "drivers": [
      { "name": "Product A Revenue", "contribution": 0.45, "change": 0.18, "impact": 0.08 },
      { "name": "Product B Revenue", "contribution": 0.35, "change": 0.05, "impact": 0.02 }
    ],
    "ai_explanation": "Revenue grew 12.7% driven by 18% growth in Product A..."
  }
}
```

### 15.2 Get Cohort Analysis

**GET** `/api/v1/analytics/cohorts`

**Purpose:** Get customer cohort retention analysis.

**Authentication:** Bearer token

---

## 16. Financial Statement APIs

### 16.1 Get P&L Statement

**GET** `/api/v1/financial-statements/pnl`

**Purpose:** Get Profit & Loss statement.

**Authentication:** Bearer token

**Query Parameters:** `?period=q2_2026&entity_id=consolidated&comparison=q2_2025`

**Success Response (200):**
```json
{
  "data": {
    "period": { "start": "2026-04-01", "end": "2026-06-30" },
    "entity": { "id": "ent_consolidated", "name": "Consolidated" },
    "sections": [
      {
        "name": "Revenue",
        "lines": [
          { "account_code": "4000", "account_name": "Product A Revenue", "amount": "5800000.00" },
          { "account_code": "4100", "account_name": "Product B Revenue", "amount": "4200000.00" },
          { "account_code": "4200", "account_name": "Services Revenue", "amount": "2400000.00" }
        ],
        "total": "12400000.00"
      },
      {
        "name": "Cost of Revenue",
        "lines": [
          { "account_code": "5000", "account_name": "COGS", "amount": "-4200000.00" }
        ],
        "total": "-4200000.00"
      },
      {
        "name": "Gross Profit",
        "total": "8200000.00"
      }
    ],
    "net_income": "2200000.00",
    "comparison": { "net_income": "1200000.00", "change_pct": 83.3 }
  }
}
```

### 16.2 Get Balance Sheet

**GET** `/api/v1/financial-statements/balance-sheet`

**Purpose:** Get Balance Sheet.

**Authentication:** Bearer token

### 16.3 Get Cash Flow Statement

**GET** `/api/v1/financial-statements/cash-flow`

**Purpose:** Get Cash Flow Statement.

**Authentication:** Bearer token

### 16.4 Get Trial Balance

**GET** `/api/v1/financial-statements/trial-balance`

**Purpose:** Get Trial Balance for a period.

**Authentication:** Bearer token

---

## 17. Journal Entry APIs

### 17.1 List Journal Entries

**GET** `/api/v1/journal-entries`

**Purpose:** List journal entries.

**Authentication:** Bearer token

**Query Parameters:** `?status=posted&period_id=per_abc&entry_type=standard`

### 17.2 Create Journal Entry

**POST** `/api/v1/journal-entries`

**Purpose:** Create a new journal entry.

**Authentication:** Bearer token

**Request:**
```json
{
  "entity_id": "ent_abc",
  "period_id": "per_2026_06",
  "entry_type": "standard",
  "description": "Monthly revenue recognition",
  "lines": [
    { "account_id": "acct_4010", "debit": "10000.00", "credit": "0.00", "description": "Revenue" },
    { "account_id": "acct_2010", "debit": "0.00", "credit": "10000.00", "description": "Deferred Revenue" }
  ],
  "attachments": []
}
```

**Business Rules:**
- Total debits must equal total credits
- Each line must be either debit or credit (not both)
- Period must be in `open` status
- Account must be active and not a header account

**Success Response (201):**
```json
{
  "data": {
    "id": "je_abc123",
    "journal_number": "JE-202606-0042",
    "status": "draft",
    "total_debits": "10000.00",
    "total_credits": "10000.00",
    "is_balanced": true,
    "ai_validation": {
      "is_balanced": true,
      "account_types_correct": true,
      "amount_reasonable": true,
      "warnings": []
    }
  }
}
```

### 17.3 Submit for Approval

**POST** `/api/v1/journal-entries/{id}/submit`

**Purpose:** Submit journal entry for approval.

**Authentication:** Bearer token

### 17.4 Approve Journal Entry

**POST** `/api/v1/journal-entries/{id}/approve`

**Purpose:** Approve a journal entry.

**Authentication:** Bearer token (Approver role)

### 17.5 Post Journal Entry

**POST** `/api/v1/journal-entries/{id}/post`

**Purpose:** Post journal entry to General Ledger.

**Authentication:** Bearer token

**Business Rules:**
- Entry must be approved (if approval required)
- Period must be open
- Posted entries are immutable

### 17.6 Reverse Journal Entry

**POST** `/api/v1/journal-entries/{id}/reverse`

**Purpose:** Create a reversing journal entry.

**Authentication:** Bearer token

**Request:**
```json
{
  "reason": "Correction of accrual",
  "reverse_date": "2026-07-01"
}
```

---

## 18. General Ledger APIs

### 18.1 Get Account Balances

**GET** `/api/v1/gl/balances`

**Purpose:** Get account balances for a period.

**Authentication:** Bearer token

**Query Parameters:** `?period_id=per_2026_06&entity_id=ent_abc&account_type=revenue`

**Success Response (200):**
```json
{
  "data": [
    {
      "account": { "id": "acct_4000", "code": "4000", "name": "Revenue" },
      "opening_balance": "0.00",
      "period_debits": "0.00",
      "period_credits": "12400000.00",
      "closing_balance": "12400000.00",
      "type": "revenue",
      "normal_balance": "credit"
    }
  ]
}
```

### 18.2 Get Account Activity

**GET** `/api/v1/gl/accounts/{id}/activity`

**Purpose:** Get detailed activity for a specific account.

**Authentication:** Bearer token

**Query Parameters:** `?period_id=per_2026_06&page=1&per_page=50`

**Success Response (200):**
```json
{
  "data": [
    {
      "date": "2026-06-30",
      "source": "journal_entry",
      "source_id": "je_abc",
      "source_number": "JE-202606-0042",
      "description": "Monthly revenue",
      "debit": "0.00",
      "credit": "500000.00",
      "running_balance": "12400000.00"
    }
  ]
}
```

### 18.3 Get Period Status

**GET** `/api/v1/gl/periods`

**Purpose:** List fiscal periods and their status.

**Authentication:** Bearer token

### 18.4 Close Period

**POST** `/api/v1/gl/periods/{id}/close`

**Purpose:** Initiate period close process.

**Authentication:** Bearer token (Controller role)

**Business Rules:**
- All close checklist items must be complete
- Prior period must be closed
- Period status transitions: open → closing → closed → locked

---

## 19. Chart of Accounts APIs

### 19.1 Get Chart of Accounts

**GET** `/api/v1/chart-of-accounts`

**Purpose:** Get the full chart of accounts hierarchy.

**Authentication:** Bearer token

**Query Parameters:** `?entity_id=ent_abc&include_balances=true&period_id=per_2026_06`

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "acct_1000",
      "code": "1000",
      "name": "Assets",
      "type": "asset",
      "normal_balance": "debit",
      "is_header": true,
      "level": 1,
      "children": [
        {
          "id": "acct_1100",
          "code": "1100",
          "name": "Cash & Equivalents",
          "type": "asset",
          "normal_balance": "debit",
          "is_header": false,
          "level": 2,
          "balance": "3450000.00"
        }
      ]
    }
  ]
}
```

### 19.2 Create Account

**POST** `/api/v1/chart-of-accounts`

**Purpose:** Create a new account.

**Authentication:** Bearer token (Controller/Admin role)

**Request:**
```json
{
  "code": "1150",
  "name": "Petty Cash",
  "type": "asset",
  "normal_balance": "debit",
  "parent_id": "acct_1100",
  "description": "Petty cash fund"
}
```

---

## 20. Fixed Asset APIs

### 20.1 List Fixed Assets

**GET** `/api/v1/fixed-assets`

**Purpose:** List fixed asset register.

**Authentication:** Bearer token

### 20.2 Create Fixed Asset

**POST** `/api/v1/fixed-assets`

**Purpose:** Register a new fixed asset.

**Authentication:** Bearer token

**Request:**
```json
{
  "name": "Server Rack - Data Center A",
  "category": "equipment",
  "cost": "50000.00",
  "currency": "USD",
  "useful_life_years": 5,
  "depreciation_method": "straight_line",
  "in_service_date": "2026-06-15",
  "location": "Data Center A, Row 3"
}
```

---

## 21. Vendor APIs

### 21.1 List Vendors

**GET** `/api/v1/vendors`

**Purpose:** List vendors with search and filtering.

**Authentication:** Bearer token

**Query Parameters:** `?q=ABC&status=active&risk_level=high&category=technology`

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "ven_001",
      "name": "ABC Corp",
      "category": "Technology Services",
      "status": "active",
      "risk_level": "high",
      "total_spend_ytd": "1200000.00",
      "payment_terms": "Net 30",
      "contract_count": 2,
      "last_invoice_date": "2026-06-28"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 234 }
}
```

### 21.2 Create Vendor

**POST** `/api/v1/vendors`

**Purpose:** Create a new vendor.

**Authentication:** Bearer token

**Request:**
```json
{
  "name": "ABC Corp",
  "tax_id": "XX-XXXXXXX",
  "category": "Technology Services",
  "payment_terms": "Net 30",
  "address_line1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "US",
  "bank_accounts": [
    { "account_number": "1234567890", "routing_number": "021000021", "currency": "USD" }
  ]
}
```

### 21.3 Get Vendor Risk

**GET** `/api/v1/vendors/{id}/risk`

**Purpose:** Get vendor risk assessment.

**Authentication:** Bearer token

**Success Response (200):**
```json
{
  "data": {
    "vendor_id": "ven_001",
    "overall_risk_score": 0.72,
    "risk_level": "high",
    "factors": [
      { "name": "Concentration", "score": 0.85, "description": "15% of total spend" },
      { "name": "Payment History", "score": 0.20, "description": "On-time payments" },
      { "name": "Sanctions", "score": 0.00, "description": "No matches" },
      { "name": "Financial Health", "score": 0.65, "description": "Stable" }
    ],
    "last_assessed_at": "2026-06-30T06:00:00Z"
  }
}
```

### 21.4 Screen Sanctions

**POST** `/api/v1/vendors/{id}/screen-sanctions`

**Purpose:** Screen vendor against sanctions lists.

**Authentication:** Bearer token

**Success Response (200):**
```json
{
  "data": {
    "vendor_id": "ven_001",
    "status": "passed",
    "lists_checked": ["OFAC", "UN", "EU", "UK"],
    "matches": [],
    "screened_at": "2026-06-30T10:30:00Z"
  }
}
```

---

## 22. Customer APIs

### 22.1 List Customers

**GET** `/api/v1/customers`

**Purpose:** List customers.

**Authentication:** Bearer token

### 22.2 Get AR Aging

**GET** `/api/v1/customers/ar-aging`

**Purpose:** Get accounts receivable aging summary.

**Authentication:** Bearer token

**Success Response (200):**
```json
{
  "data": {
    "aging_buckets": {
      "current": "1200000.00",
      "days_1_30": "800000.00",
      "days_31_60": "450000.00",
      "days_61_90": "260000.00",
      "days_90_plus": "150000.00"
    },
    "total_ar": "2860000.00",
    "dso": 42
  }
}
```

---

## 23. Procurement APIs

### 23.1 List Purchase Orders

**GET** `/api/v1/procurement/purchase-orders`

**Purpose:** List purchase orders.

**Authentication:** Bearer token

### 23.2 Create Purchase Order

**POST** `/api/v1/procurement/purchase-orders`

**Purpose:** Create a purchase order.

**Authentication:** Bearer token

**Request:**
```json
{
  "vendor_id": "ven_001",
  "entity_id": "ent_abc",
  "department_id": "dept_eng",
  "lines": [
    { "description": "Server Hardware", "quantity": 5, "unit_price": "10000.00", "amount": "50000.00" }
  ],
  "delivery_date": "2026-07-15",
  "payment_terms": "Net 30"
}
```

---

## 24. Fraud & Risk APIs

### 24.1 List Fraud Alerts

**GET** `/api/v1/fraud/alerts`

**Purpose:** List fraud alerts with severity sorting.

**Authentication:** Bearer token

**Query Parameters:** `?severity=critical,high&status=open&sort=-created_at`

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "fa_001",
      "severity": "critical",
      "alert_type": "duplicate_payment",
      "description": "Potential duplicate payment of $50,000 to ABC Corp",
      "amount": "50000.00",
      "currency": "USD",
      "confidence": 0.92,
      "status": "open",
      "resource_type": "payment",
      "resource_id": "pay_001",
      "created_at": "2026-06-30T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 48 }
}
```

### 24.2 Get Fraud Alert

**GET** `/api/v1/fraud/alerts/{id}`

**Purpose:** Get fraud alert details with AI explanation.

**Authentication:** Bearer token

**Success Response (200):**
```json
{
  "data": {
    "id": "fa_001",
    "severity": "critical",
    "alert_type": "duplicate_payment",
    "description": "Potential duplicate payment of $50,000 to ABC Corp",
    "amount": "50000.00",
    "currency": "USD",
    "confidence": 0.92,
    "status": "open",
    "explanation": "Two payments of $50,000 were made to ABC Corp within 7 days. The vendor's bank account was changed on Jun 28, which is a common fraud indicator.",
    "risk_factors": [
      { "name": "Same amount", "weight": "high" },
      { "name": "Bank account change", "weight": "high" },
      { "name": "Rush processing", "weight": "medium" }
    ],
    "related_transactions": [
      { "id": "txn_001", "amount": "50000.00", "date": "2026-06-30" },
      { "id": "txn_002", "amount": "50000.00", "date": "2026-06-29" }
    ],
    "vendor": { "id": "ven_001", "name": "ABC Corp" },
    "created_at": "2026-06-30T10:00:00Z"
  }
}
```

### 24.3 Create Fraud Case

**POST** `/api/v1/fraud/cases`

**Purpose:** Create a fraud investigation case from alert(s).

**Authentication:** Bearer token

**Request:**
```json
{
  "alert_ids": ["fa_001", "fa_002"],
  "title": "Duplicate payment investigation - ABC Corp",
  "assigned_to": "usr_042"
}
```

### 24.4 Resolve Alert

**POST** `/api/v1/fraud/alerts/{id}/resolve`

**Purpose:** Resolve a fraud alert.

**Authentication:** Bearer token

**Request:**
```json
{
  "resolution": "true_positive",
  "notes": "Confirmed duplicate. Payment recalled."
}
```

### 24.5 AI Detect Fraud

**POST** `/api/v1/fraud/ai/detect`

**Purpose:** Trigger AI fraud detection scan.

**Authentication:** Bearer token

**Request:**
```json
{
  "scope": "recent_payments",
  "days_lookback": 30
}
```

**Success Response (202):**
```json
{
  "data": {
    "scan_id": "scan_abc",
    "status": "running",
    "estimated_duration_seconds": 60
  }
}
```

---

## 25. Compliance APIs

### 25.1 List Controls

**GET** `/api/v1/compliance/controls`

**Purpose:** List compliance controls by framework.

**Authentication:** Bearer token

**Query Parameters:** `?framework=soc2&status=active`

### 25.2 List Issues

**GET** `/api/v1/compliance/issues`

**Purpose:** List compliance issues.

**Authentication:** Bearer token

**Query Parameters:** `?severity=critical,high&status=open`

### 25.3 Upload Evidence

**POST** `/api/v1/compliance/evidence`

**Purpose:** Upload evidence for a control.

**Authentication:** Bearer token

**Request:** Multipart form data
| Field | Type | Description |
|---|---|---|
| `control_id` | uuid | Target control |
| `file` | file | Evidence document |
| `description` | string | Evidence description |

---

## 26. Audit APIs

### 26.1 List Audit Logs

**GET** `/api/v1/audit-logs`

**Purpose:** Search and export audit logs.

**Authentication:** Bearer token (Auditor/Admin role)

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `actor_id` | uuid | Filter by user |
| `action` | string | `create`, `update`, `delete`, `approve` |
| `resource_type` | string | `transaction`, `invoice`, `payment` |
| `resource_id` | uuid | Specific resource |
| `created_at[gte]` | date | Start date |
| `created_at[lte]` | date | End date |
| `severity` | string | `info`, `warning`, `critical` |
| `q` | string | Search in changes_summary |

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "audit_001",
      "actor": { "id": "usr_001", "email": "john@acme.com", "name": "John Doe" },
      "action": "update",
      "resource_type": "invoice",
      "resource_id": "inv_8923",
      "resource_identifier": "INV-2024-0892",
      "changes_summary": "Status changed from 'draft' to 'pending_approval'",
      "ip_address": "203.0.113.42",
      "correlation_id": "cor_abc",
      "severity": "info",
      "created_at": "2026-06-30T10:23:00Z"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 9847 }
}
```

### 26.2 Export Audit Logs

**POST** `/api/v1/audit-logs/export`

**Purpose:** Export audit logs to CSV or XLSX.

**Authentication:** Bearer token (Auditor/Admin role)

**Request:**
```json
{
  "format": "csv",
  "filters": {
    "created_at[gte]": "2026-01-01",
    "created_at[lte]": "2026-06-30"
  }
}
```

---

## 27. Workflow Engine APIs

### 27.1 List Workflows

**GET** `/api/v1/workflows`

**Purpose:** List workflow definitions.

**Authentication:** Bearer token

### 27.2 Create Workflow

**POST** `/api/v1/workflows`

**Purpose:** Create a new workflow definition.

**Authentication:** Bearer token (Admin/Workflow Admin role)

**Request:**
```json
{
  "name": "Invoice Approval - High Value",
  "description": "Routes invoices > $10K to VP Finance for approval",
  "trigger_type": "event",
  "trigger_config": {
    "event": "invoice.created",
    "conditions": {
      "field": "amount",
      "operator": "gt",
      "value": "10000"
    }
  },
  "definition": {
    "nodes": [
      { "id": "trigger_1", "type": "trigger", "config": { "event": "invoice.created" } },
      { "id": "condition_1", "type": "condition", "config": { "field": "amount", "operator": "gt", "value": "10000" } },
      { "id": "approval_1", "type": "human_approval", "config": { "assignee_role": "vp_finance", "sla_hours": 48 } },
      { "id": "action_1", "type": "action", "config": { "action_type": "notify", "channel": "slack", "message": "Invoice approved" } }
    ],
    "edges": [
      { "from": "trigger_1", "to": "condition_1" },
      { "from": "condition_1", "to": "approval_1", "label": "YES" },
      { "from": "approval_1", "to": "action_1", "label": "APPROVED" }
    ]
  }
}
```

### 27.3 Publish Workflow

**POST** `/api/v1/workflows/{id}/publish`

**Purpose:** Publish a workflow version (makes it active).

**Authentication:** Bearer token

### 27.4 List Workflow Runs

**GET** `/api/v1/workflows/{id}/runs`

**Purpose:** List execution history for a workflow.

**Authentication:** Bearer token

### 27.5 Get Workflow Run

**GET** `/api/v1/workflow-runs/{id}`

**Purpose:** Get workflow run details with step-by-step trace.

**Authentication:** Bearer token

**Success Response (200):**
```json
{
  "data": {
    "id": "wfr_001",
    "workflow_id": "wf_001",
    "workflow_version": 2,
    "status": "completed",
    "trigger_event": { "type": "invoice.created", "resource_id": "inv_8923" },
    "steps": [
      { "node_id": "trigger_1", "status": "completed", "started_at": "...", "duration_ms": 5 },
      { "node_id": "condition_1", "status": "completed", "result": true, "duration_ms": 10 },
      { "node_id": "approval_1", "status": "completed", "result": "approved", "approved_by": "usr_042", "duration_ms": 120000 },
      { "node_id": "action_1", "status": "completed", "duration_ms": 50 }
    ],
    "started_at": "2026-06-30T10:00:00Z",
    "completed_at": "2026-06-30T12:02:05Z",
    "duration_ms": 7325000
  }
}
```

---

## 28. Rule Engine APIs

### 28.1 List Rules

**GET** `/api/v1/rules`

**Purpose:** List rules with hit metrics.

**Authentication:** Bearer token

### 28.2 Create Rule

**POST** `/api/v1/rules`

**Purpose:** Create a new rule.

**Authentication:** Bearer token (Controller/Admin role)

**Request:**
```json
{
  "name": "High Value Payment Approval",
  "description": "Requires CFO approval for payments over $1M",
  "scope": "global",
  "priority": 100,
  "conditions": [
    { "field": "payment.amount", "operator": "gt", "value": "1000000", "logic_group": "AND" },
    { "field": "vendor.risk_level", "operator": "in", "value": ["High", "Critical"], "logic_group": "AND" }
  ],
  "actions": [
    { "action_type": "require_approval", "config": { "role": "cfo" }, "execution_order": 1 },
    { "action_type": "hold_payment", "config": {}, "execution_order": 2 },
    { "action_type": "notify", "config": { "channel": "slack", "group": "Finance Risk" }, "execution_order": 3 }
  ]
}
```

### 28.3 Test Rule

**POST** `/api/v1/rules/{id}/test`

**Purpose:** Test a rule against historical data (simulation).

**Authentication:** Bearer token

**Request:**
```json
{
  "sample_size": 1000,
  "date_range": { "start": "2026-01-01", "end": "2026-06-30" }
}
```

**Success Response (200):**
```json
{
  "data": {
    "total_evaluated": 1000,
    "matched": 45,
    "match_rate_pct": 4.5,
    "false_positive_estimate": 2,
    "estimated_impact": { "payments_held": 45, "total_amount": "45000000.00" }
  }
}
```

---

## 29. AI Copilot APIs

### 29.1 Chat Completion

**POST** `/api/v1/ai/chat`

**Purpose:** Send a message to the AI Copilot and get a response.

**Authentication:** Bearer token

**Request:**
```json
{
  "conversation_id": "conv_abc123",
  "message": "Show me this month's P&L variance",
  "context": {
    "page": "dashboard",
    "filters": { "period": "current_month" }
  },
  "stream": false
}
```

**Success Response (200):**
```json
{
  "data": {
    "conversation_id": "conv_abc123",
    "message_id": "msg_001",
    "role": "assistant",
    "content": "Here's your P&L variance analysis for June 2026:\n\n**Revenue:** $3.2M vs budget $3.0M — **+6.7%** ✅\n- Product A: $1.8M (+12.5% vs budget)\n- Product B: $1.4M (+1.4% vs budget)\n\n**Expenses:** $2.1M vs budget $2.0M — **-5.0%** ⚠️\n- R&D: $0.9M (on budget)\n- Sales & Marketing: $0.7M (+16.7% vs budget)\n\n**Net Income:** $1.1M vs budget $1.0M — **+10.0%** ✅",
    "confidence": 0.92,
    "sources": [
      { "type": "report", "id": "rpt_pnl_062026", "name": "P&L Statement - June 2026" },
      { "type": "budget", "id": "budg_fy2026", "name": "FY 2026 Budget" }
    ],
    "tokens_used": 1240,
    "agent": "financial_analysis"
  }
}
```

### 29.2 Streaming Chat

**GET** `/api/v1/ai/chat/stream?conversation_id=conv_abc&message=Show+me+P%26L`

**Purpose:** Stream AI response via Server-Sent Events.

**Authentication:** Bearer token

**Response (SSE):**
```
event: token
data: {"token": "Here's", "message_id": "msg_001"}

event: token
data: {"token": " your", "message_id": "msg_001"}

event: token
data: {"token": " P&L", "message_id": "msg_001"}

event: done
data: {"message_id": "msg_001", "full_content": "Here's your P&L...", "tokens_used": 1240, "sources": [...]}
```

### 29.3 List Conversations

**GET** `/api/v1/ai/conversations`

**Purpose:** List user's AI conversations.

**Authentication:** Bearer token

### 29.4 Get Conversation

**GET** `/api/v1/ai/conversations/{id}`

**Purpose:** Get full conversation history.

**Authentication:** Bearer token

### 29.5 Delete Conversation

**DELETE** `/api/v1/ai/conversations/{id}`

**Purpose:** Delete a conversation.

**Authentication:** Bearer token

### 29.6 Generate Report

**POST** `/api/v1/ai/generate-report`

**Purpose:** Generate a financial report using AI.

**Authentication:** Bearer token

**Request:**
```json
{
  "template_id": "tpl_cfo_pack",
  "parameters": {
    "period": "q2_2026",
    "entity_id": "ent_consolidated",
    "include_comparison": true
  }
}
```

**Success Response (202):**
```json
{
  "data": {
    "report_id": "rpt_ai_001",
    "status": "generating",
    "estimated_duration_seconds": 45
  }
}
```

### 29.7 Get AI Agent Status

**GET** `/api/v1/ai/agents/status`

**Purpose:** Get status of all AI agents.

**Authentication:** Bearer token

**Success Response (200):**
```json
{
  "data": {
    "agents": [
      { "name": "supervisor", "status": "ready", "runs_today": 42, "avg_latency_ms": 1200 },
      { "name": "financial_analysis", "status": "ready", "runs_today": 156, "avg_latency_ms": 3400 },
      { "name": "fraud_detection", "status": "ready", "runs_today": 89, "avg_latency_ms": 2800 }
    ],
    "total_tokens_today": 450000,
    "total_cost_today": "2.34"
  }
}
```

### 29.8 Get AI Usage

**GET** `/api/v1/ai/usage`

**Purpose:** Get AI token usage and cost metrics.

**Authentication:** Bearer token

**Query Parameters:** `?period=current_month&group_by=day`

### 29.9 Provide Feedback

**POST** `/api/v1/ai/feedback`

**Purpose:** Provide feedback on an AI response.

**Authentication:** Bearer token

**Request:**
```json
{
  "message_id": "msg_001",
  "rating": "positive",
  "comment": "Very accurate and helpful"
}
```

---

## 30. Report APIs

### 30.1 List Reports

**GET** `/api/v1/reports`

**Purpose:** List available reports.

**Authentication:** Bearer token

**Query Parameters:** `?type=financial&status=scheduled&q=board+pack`

### 30.2 Generate Report

**POST** `/api/v1/reports/generate`

**Purpose:** Generate a report.

**Authentication:** Bearer token

**Request:**
```json
{
  "template_id": "tpl_pnl",
  "format": "pdf",
  "parameters": {
    "period": "q2_2026",
    "entity_id": "ent_consolidated",
    "comparison": "q2_2025"
  }
}
```

**Success Response (202):**
```json
{
  "data": {
    "report_id": "rpt_001",
    "status": "generating",
    "estimated_duration_seconds": 30
  }
}
```

### 30.3 Get Report

**GET** `/api/v1/reports/{id}`

**Purpose:** Get report metadata and download URL.

**Authentication:** Bearer token

**Success Response (200):**
```json
{
  "data": {
    "id": "rpt_001",
    "name": "P&L Statement - Q2 2026",
    "format": "pdf",
    "status": "completed",
    "download_url": "https://cdn.finopsaicopilot.com/reports/rpt_001.pdf?exp=...",
    "expires_at": "2026-07-01T10:30:00Z",
    "size_bytes": 245000,
    "generated_at": "2026-06-30T10:30:00Z"
  }
}
```

### 30.4 Schedule Report

**POST** `/api/v1/reports/schedules`

**Purpose:** Schedule recurring report generation.

**Authentication:** Bearer token

**Request:**
```json
{
  "template_id": "tpl_board_pack",
  "format": "pdf",
  "schedule": "0 8 1 * *",
  "parameters": { "entity_id": "ent_consolidated" },
  "recipients": ["cfo@acme.com", "board@acme.com"]
}
```

---

## 31. Document APIs

### 31.1 List Documents

**GET** `/api/v1/documents`

**Purpose:** List documents with search and filtering.

**Authentication:** Bearer token

**Query Parameters:** `?type=invoice&q=ABC+Corp&classification=invoice`

### 31.2 Upload Document

**POST** `/api/v1/documents/upload`

**Purpose:** Upload a document.

**Authentication:** Bearer token

**Request:** Multipart form data
| Field | Type | Description |
|---|---|---|
| `file` | file | Document file (max 50MB) |
| `type` | string | `invoice`, `contract`, `statement`, `receipt`, `report` |
| `tags` | string[] | Optional tags |
| `retention_days` | integer | Override default retention |

**Success Response (201):**
```json
{
  "data": {
    "id": "doc_001",
    "filename": "invoice_8923.pdf",
    "size_bytes": 2048000,
    "mime_type": "application/pdf",
    "classification": "invoice",
    "classification_confidence": 0.95,
    "status": "processing",
    "upload_url": "https://cdn.finopsaicopilot.com/upload/..."
  }
}
```

### 31.3 Get Document

**GET** `/api/v1/documents/{id}`

**Purpose:** Get document metadata and download URL.

**Authentication:** Bearer token

### 31.4 Search Documents

**GET** `/api/v1/documents/search?q=contract+ABC+Corp`

**Purpose:** Full-text search across documents.

**Authentication:** Bearer token

### 31.5 AI Document Q&A

**POST** `/api/v1/documents/ai/ask`

**Purpose:** Ask a question about document content.

**Authentication:** Bearer token

**Request:**
```json
{
  "document_id": "doc_001",
  "question": "What is the payment due date?"
}
```

**Success Response (200):**
```json
{
  "data": {
    "answer": "The payment due date is July 30, 2026 (Net 30 from invoice date June 28, 2026).",
    "confidence": 0.95,
    "sources": [
      { "chunk_index": 3, "text": "Payment Terms: Net 30. Due Date: July 30, 2026" }
    ]
  }
}
```

---

## 32. Notification APIs

### 32.1 List Notifications

**GET** `/api/v1/notifications`

**Purpose:** List notifications for the current user.

**Authentication:** Bearer token

**Query Parameters:** `?status=unread&category=approval&limit=50`

### 32.2 Mark as Read

**POST** `/api/v1/notifications/{id}/read`

**Purpose:** Mark a notification as read.

**Authentication:** Bearer token

### 32.3 Mark All as Read

**POST** `/api/v1/notifications/mark-all-read`

**Purpose:** Mark all notifications as read.

**Authentication:** Bearer token

### 32.4 Get Preferences

**GET** `/api/v1/notification-preferences`

**Purpose:** Get notification preferences.

**Authentication:** Bearer token

### 32.5 Update Preferences

**PATCH** `/api/v1/notification-preferences`

**Purpose:** Update notification preferences.

**Authentication:** Bearer token

**Request:**
```json
{
  "channels": {
    "email": true,
    "slack": true,
    "in_app": true
  },
  "categories": {
    "approval": { "email": true, "slack": true },
    "fraud_alert": { "email": true, "slack": true, "sms": true },
    "report_ready": { "email": true }
  },
  "quiet_hours": { "enabled": true, "start": "22:00", "end": "07:00", "timezone": "America/New_York" }
}
```

---

## 33. Billing APIs

### 33.1 Get Current Subscription

**GET** `/api/v1/billing/subscription`

**Purpose:** Get current plan and subscription details.

**Authentication:** Bearer token (Admin role)

### 33.2 Get Usage

**GET** `/api/v1/billing/usage`

**Purpose:** Get current billing period usage.

**Authentication:** Bearer token (Admin role)

**Success Response (200):**
```json
{
  "data": {
    "period": { "start": "2026-06-01", "end": "2026-06-30" },
    "usage": [
      { "type": "users", "used": 42, "limit": 50, "unit": "seats" },
      { "type": "ai_credits", "used": 45892, "limit": 100000, "unit": "credits" },
      { "type": "transactions", "used": 142389, "limit": null, "unit": "count" },
      { "type": "integrations", "used": 12, "limit": null, "unit": "connectors" }
    ]
  }
}
```

### 33.3 List Invoices

**GET** `/api/v1/billing/invoices`

**Purpose:** List billing invoices.

**Authentication:** Bearer token (Admin role)

### 33.4 Change Plan

**POST** `/api/v1/billing/change-plan`

**Purpose:** Upgrade or downgrade subscription plan.

**Authentication:** Bearer token (Admin role)

**Request:**
```json
{
  "plan_id": "enterprise",
  "billing_cycle": "annual"
}
```

---

## 34. Integration APIs

### 34.1 List Connectors

**GET** `/api/v1/integrations`

**Purpose:** List installed connectors.

**Authentication:** Bearer token

### 34.2 Install Connector

**POST** `/api/v1/integrations/install`

**Purpose:** Install a new connector.

**Authentication:** Bearer token (Admin role)

**Request:**
```json
{
  "connector_id": "quickbooks",
  "credentials": {
    "client_id": "qb_client_abc",
    "client_secret": "qb_secret_xyz",
    "redirect_uri": "https://app.finopsaicopilot.com/integrations/quickbooks/callback"
  },
  "config": {
    "sync_frequency": "daily",
    "entities": ["ent_abc"]
  }
}
```

### 34.3 Sync Connector

**POST** `/api/v1/integrations/{id}/sync`

**Purpose:** Trigger manual sync for a connector.

**Authentication:** Bearer token

### 34.4 Get Sync Logs

**GET** `/api/v1/integrations/{id}/sync-logs`

**Purpose:** Get sync history for a connector.

**Authentication:** Bearer token

---

## 35. Developer APIs

### 35.1 List Webhooks

**GET** `/api/v1/webhooks`

**Purpose:** List configured webhook endpoints.

**Authentication:** Bearer token (Developer/Admin role)

### 35.2 Create Webhook

**POST** `/api/v1/webhooks`

**Purpose:** Create a webhook endpoint.

**Authentication:** Bearer token (Developer/Admin role)

**Request:**
```json
{
  "name": "Payment Notifications",
  "url": "https://api.acme.com/webhooks/finops",
  "events": ["payment.batch.released", "payment.failed", "invoice.approved"],
  "retry_count": 5,
  "timeout_ms": 5000
}
```

**Success Response (201):**
```json
{
  "data": {
    "id": "wh_001",
    "name": "Payment Notifications",
    "url": "https://api.acme.com/webhooks/finops",
    "secret": "whsec_abc123def456...",
    "events": ["payment.batch.released", "payment.failed", "invoice.approved"],
    "status": "active"
  }
}
```

### 35.3 Get Webhook Deliveries

**GET** `/api/v1/webhooks/{id}/deliveries`

**Purpose:** List webhook delivery attempts.

**Authentication:** Bearer token

### 35.4 Replay Webhook

**POST** `/api/v1/webhooks/{id}/replay`

**Purpose:** Replay a failed webhook delivery.

**Authentication:** Bearer token

---

## 36. Webhook APIs

### 36.1 Webhook Event Payload Structure

```json
{
  "id": "evt_abc123",
  "type": "payment.batch.released",
  "version": 1,
  "created": "2026-06-30T10:23:00Z",
  "organization_id": "org_xyz",
  "data": {
    "batch_id": "batch_042",
    "batch_number": "B-202606-0042",
    "total_amount": "89000.00",
    "currency": "USD",
    "payment_count": 12,
    "released_by": "usr_042",
    "released_at": "2026-06-30T10:23:00Z"
  }
}
```

### 36.2 Webhook Signature Verification

| Property | Specification |
|---|---|
| **Header** | `X-Webhook-Signature` |
| **Algorithm** | HMAC-SHA256 |
| **Payload** | Raw request body (JSON) |
| **Secret** | `whsec_...` (shown once at creation) |
| **Verification** | `signature = HMAC-SHA256(secret, body)` |
| **Timestamp** | Included in signature to prevent replay |

**Verification Example:**
```text
Expected: HMAC-SHA256(whsec_abc, '{"id":"evt_001"...}')
Compare: X-Webhook-Signature header value
```

---

## 37. Search APIs

### 37.1 Global Search

**GET** `/api/v1/search?q=ABC+Corp`

**Purpose:** Full-text search across all resources.

**Authentication:** Bearer token

**Query Parameters:** `?q=search+term&types=transactions,invoices,vendors&limit=5`

**Success Response (200):**
```json
{
  "data": {
    "results": {
      "transactions": [
        { "id": "txn_001", "title": "Payment to ABC Corp", "description": "Invoice 8923", "amount": "12400.00", "url": "/transactions/txn_001" }
      ],
      "invoices": [
        { "id": "inv_001", "title": "INV-2024-0892", "description": "ABC Corp - $12,400", "url": "/invoices/inv_001" }
      ],
      "vendors": [
        { "id": "ven_001", "title": "ABC Corp", "description": "Technology Services", "url": "/vendors/ven_001" }
      ],
      "documents": [
        { "id": "doc_001", "title": "invoice_8923.pdf", "description": "ABC Corp invoice", "url": "/documents/doc_001" }
      ]
    },
    "total_results": 12
  }
}
```

### 37.2 Autocomplete

**GET** `/api/v1/search/suggestions?q=ABC`

**Purpose:** Get search suggestions for autocomplete.

**Authentication:** Bearer token

---

## 38. Monitoring & Health APIs

### 38.1 Health Check

**GET** `/api/v1/health`

**Purpose:** Basic health check (no authentication required).

**Success Response (200):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime_seconds": 86400,
  "checks": {
    "database": { "status": "healthy", "latency_ms": 2 },
    "redis": { "status": "healthy", "latency_ms": 1 },
    "queue": { "status": "healthy", "depth": 0 }
  }
}
```

### 38.2 Get System Metrics

**GET** `/api/v1/system/metrics`

**Purpose:** Get system performance metrics.

**Authentication:** Bearer token (Admin role)

**Success Response (200):**
```json
{
  "data": {
    "api": { "requests_per_minute": 1200, "avg_latency_ms": 45, "error_rate_pct": 0.02 },
    "database": { "connections_active": 42, "connections_idle": 58, "replication_lag_bytes": 0 },
    "queue": { "jobs_pending": 5, "jobs_processing": 3, "jobs_failed_last_hour": 0 },
    "workers": { "total": 12, "active": 12, "idle": 0 },
    "ai": { "tokens_used_today": 450000, "cost_today": "2.34", "avg_latency_ms": 2800 }
  }
}
```

### 38.3 List Background Jobs

**GET** `/api/v1/system/jobs`

**Purpose:** List background jobs and their status.

**Authentication:** Bearer token (Admin role)

**Query Parameters:** `?status=running,failed&queue=default&type=import`

---

## 39. Admin APIs

### 39.1 List Tenants

**GET** `/api/v1/admin/tenants`

**Purpose:** List all tenants (super admin).

**Authentication:** Bearer token (Super Admin role)

### 39.2 Get Tenant

**GET** `/api/v1/admin/tenants/{id}`

**Purpose:** Get tenant details.

**Authentication:** Bearer token (Super Admin role)

### 39.3 Impersonate Tenant

**POST** `/api/v1/admin/impersonate`

**Purpose:** Generate impersonation token for support.

**Authentication:** Bearer token (Super Admin role)

**Request:**
```json
{
  "organization_id": "org_xyz",
  "reason": "Investigating billing issue",
  "duration_minutes": 60
}
```

**Success Response (200):**
```json
{
  "data": {
    "impersonation_token": "imp_abc123",
    "expires_at": "2026-06-30T11:30:00Z",
    "audit_logged": true
  }
}
```

### 39.4 List Feature Flags

**GET** `/api/v1/admin/feature-flags`

**Purpose:** List all feature flags.

**Authentication:** Bearer token (Super Admin role)

### 39.5 Update Feature Flag

**PATCH** `/api/v1/admin/feature-flags/{id}`

**Purpose:** Update a feature flag.

**Authentication:** Bearer token (Super Admin role)

**Request:**
```json
{
  "enabled": true,
  "tenant_ids": ["org_abc", "org_xyz"],
  "rollout_percentage": 50
}
```

### 39.6 Broadcast Message

**POST** `/api/v1/admin/broadcast`

**Purpose:** Send broadcast message to all tenants or specific tenants.

**Authentication:** Bearer token (Super Admin role)

**Request:**
```json
{
  "title": "Scheduled Maintenance",
  "message": "The platform will be unavailable on July 15 from 2-4 AM EST.",
  "severity": "maintenance",
  "target_tenants": ["all"],
  "scheduled_start": "2026-07-15T06:00:00Z",
  "scheduled_end": "2026-07-15T08:00:00Z"
}
```

---

## 40. Streaming APIs

### 40.1 Job Progress Stream

**GET** `/api/v1/stream/jobs/{job_id}`

**Purpose:** Stream job progress updates via SSE.

**Authentication:** Bearer token

**Response (SSE):**
```
event: progress
data: {"job_id": "imp_abc", "progress": 45, "total": 100, "status": "processing"}

event: progress
data: {"job_id": "imp_abc", "progress": 100, "total": 100, "status": "completed"}

event: complete
data: {"job_id": "imp_abc", "status": "completed", "result": {"imported": 100, "errors": 2}}
```

### 40.2 AI Chat Stream

**GET** `/api/v1/stream/ai/{conversation_id}`

**Purpose:** Stream AI chat responses via SSE.

**Authentication:** Bearer token

### 40.3 Notification Stream

**GET** `/api/v1/stream/notifications`

**Purpose:** Stream real-time notifications via SSE.

**Authentication:** Bearer token

**Response (SSE):**
```
event: notification
data: {"id": "notif_001", "type": "approval", "title": "Invoice INV-0892 needs approval", "priority": "high"}
```

---

## 41. File Upload/Download APIs

### 41.1 Get Signed Upload URL

**POST** `/api/v1/files/upload-url`

**Purpose:** Get a signed URL for direct-to-S3 upload.

**Authentication:** Bearer token

**Request:**
```json
{
  "filename": "invoice_8923.pdf",
  "content_type": "application/pdf",
  "size_bytes": 2048000
}
```

**Success Response (200):**
```json
{
  "data": {
    "upload_url": "https://cdn.finopsaicopilot.com/uploads/...?signature=...",
    "file_id": "file_001",
    "expires_at": "2026-06-30T10:33:00Z"
  }
}
```

### 41.2 Get Signed Download URL

**GET** `/api/v1/files/{file_id}/download-url`

**Purpose:** Get a signed URL for file download.

**Authentication:** Bearer token

**Query Parameters:** `?expires_in=3600`

**Success Response (200):**
```json
{
  "data": {
    "download_url": "https://cdn.finopsaicopilot.com/docs/...?signature=...",
    "expires_at": "2026-06-30T11:30:00Z"
  }
}
```

---

## 42. Webhook Events Catalog

### 42.1 Complete Event List

| Event | Description | Trigger | Payload Includes |
|---|---|---|---|
| `transaction.import.completed` | Transaction import finished | Import job completion | import_id, total, errors |
| `transaction.flagged` | Transaction flagged as suspicious | Flag action | transaction_id, reason, risk_score |
| `invoice.created` | New invoice created | Invoice creation | invoice_id, vendor_id, amount |
| `invoice.approved` | Invoice approved | Approval action | invoice_id, approved_by, approval_level |
| `invoice.rejected` | Invoice rejected | Rejection action | invoice_id, rejected_by, reason |
| `invoice.paid` | Invoice marked as paid | Payment completion | invoice_id, payment_id, amount |
| `payment.batch.created` | Payment batch created | Batch creation | batch_id, total_amount, payment_count |
| `payment.batch.approved` | Payment batch approved | Approval action | batch_id, approved_by, level |
| `payment.batch.released` | Payment batch released | Release action | batch_id, released_by, total_amount |
| `payment.failed` | Individual payment failed | Payment failure | payment_id, error, retry_count |
| `payment.held` | Payment placed on hold | Hold action | payment_id, reason |
| `vendor.created` | New vendor created | Vendor creation | vendor_id, name, risk_score |
| `vendor.risk.changed` | Vendor risk score changed | Risk recalculation | vendor_id, old_risk, new_risk |
| `fraud.alert.created` | New fraud alert generated | Alert creation | alert_id, severity, amount, alert_type |
| `fraud.case.opened` | Fraud investigation case opened | Case creation | case_id, severity, alert_count |
| `budget.exceeded` | Budget threshold exceeded | Budget check | budget_id, variance_pct, department |
| `period.close.initiated` | Period close process started | Close initiation | period_id, fiscal_year, period_number |
| `period.closed` | Period successfully closed | Close completion | period_id, closed_by |
| `report.generated` | Report generation completed | Report completion | report_id, format, download_url |
| `workflow.completed` | Workflow execution finished | Workflow completion | workflow_run_id, workflow_id, status |
| `workflow.escalated` | Workflow step escalated | Escalation trigger | workflow_run_id, step_id, reason |
| `ai.report.generated` | AI-generated report ready | AI completion | report_id, type, confidence |
| `ai.credit.low` | AI credit balance low | Threshold check | remaining_credits, threshold |
| `integration.sync.completed` | Integration sync finished | Sync completion | connector_id, records_synced, errors |
| `integration.disconnected` | Integration connection lost | Connection failure | connector_id, provider, error |
| `subscription.changed` | Subscription plan changed | Plan change | old_plan, new_plan, effective_date |
| `user.invited` | New user invited | Invitation | user_id, email, invited_by |
| `user.suspended` | User account suspended | Suspension | user_id, reason |

---

## 43. Error Handling Reference

### 43.1 Standard Error Responses

#### 400 Bad Request — Validation Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request was invalid.",
    "details": [
      { "field": "email", "code": "REQUIRED", "message": "Email is required" },
      { "field": "password", "code": "MIN_LENGTH", "message": "Password must be at least 8 characters" }
    ],
    "request_id": "req_abc123"
  }
}
```

#### 401 Unauthorized

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Authentication is required to access this resource.",
    "request_id": "req_abc123"
  }
}
```

#### 403 Forbidden

```json
{
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "You do not have permission to perform this action.",
    "details": [
      { "field": "permission", "code": "MISSING", "message": "Requires 'invoices:approve' permission" }
    ],
    "request_id": "req_abc123"
  }
}
```

#### 404 Not Found

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found.",
    "details": [
      { "field": "id", "code": "NOT_FOUND", "message": "Invoice with id 'inv_9999' not found" }
    ],
    "request_id": "req_abc123"
  }
}
```

#### 409 Conflict

```json
{
  "error": {
    "code": "RESOURCE_CONFLICT",
    "message": "The request conflicts with the current state of the resource.",
    "details": [
      { "field": "status", "code": "INVALID_STATE", "message": "Cannot approve an invoice that is already paid" }
    ],
    "request_id": "req_abc123"
  }
}
```

#### 422 Unprocessable Entity — Business Rule Violation

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "The request violates a business rule.",
    "details": [
      { "field": "lines", "code": "UNBALANCED", "message": "Journal entry debits ($12,000) must equal credits ($10,000)" }
    ],
    "request_id": "req_abc123"
  }
}
```

#### 429 Too Many Requests

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please wait before making additional requests.",
    "request_id": "req_abc123"
  }
}
```

#### 500 Internal Server Error

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Our team has been notified.",
    "request_id": "req_abc123"
  }
}
```

---

## 44. API Security Reference

### 44.1 Authentication Methods

| Method | Header | Token Source | Use Case |
|---|---|---|---|
| **JWT Bearer** | `Authorization: Bearer {jwt}` | Login endpoint | Interactive user sessions |
| **API Key** | `Authorization: Bearer {api_key}` | API Keys page | Server-to-server, CI/CD |
| **OAuth 2.0** | `Authorization: Bearer {access_token}` | OAuth provider | Third-party integrations |

### 44.2 JWT Token Structure

```json
{
  "sub": "usr_abc123",
  "org_id": "org_xyz789",
  "role": "admin",
  "permissions": ["*"],
  "iat": 1700000000,
  "exp": 1700003600,
  "jti": "unique_token_id"
}
```

### 44.3 Permission Scopes

| Scope Pattern | Example | Description |
|---|---|---|
| `{module}:read` | `transactions:read` | Read access to module |
| `{module}:write` | `transactions:write` | Write access to module |
| `{module}:admin` | `workflows:admin` | Administrative access |
| `{module}:approve` | `invoices:approve` | Approval capability |
| `*` | `*` | Super admin (all access) |

### 44.4 CORS Configuration

| Header | Value |
|---|---|
| `Access-Control-Allow-Origin` | `https://app.finopsaicopilot.com` (configurable) |
| `Access-Control-Allow-Methods` | `GET, POST, PUT, PATCH, DELETE, OPTIONS` |
| `Access-Control-Allow-Headers` | `Authorization, Content-Type, Idempotency-Key, X-Correlation-Id, If-Match` |
| `Access-Control-Expose-Headers` | `X-Request-Id, X-RateLimit-*, ETag` |
| `Access-Control-Max-Age` | `86400` |

### 44.5 CSRF Protection

| Measure | Implementation |
|---|---|
| **Token-based auth** | JWT/API Key in header (not cookies) — inherently CSRF-safe |
| **Idempotency keys** | Prevents replay attacks |
| **CORS** | Restricts to known origins |

---

## 45. SDK & Client Considerations

### 45.1 Client Library Recommendations

| Language | Library | Notes |
|---|---|---|
| **TypeScript/JavaScript** | `@finops/copilot-sdk` | Full type definitions, auto-pagination |
| **Python** | `finops-copilot` | Async support, type hints |
| **Go** | `go-finops` | Generated from OpenAPI spec |
| **Java** | `finops-copilot-client` | Spring Boot compatible |
| **Ruby** | `finops_copilot` | Gem package |
| **curl** | N/A | Examples in documentation |

### 45.2 SDK Features

| Feature | Description |
|---|---|
| **Automatic retry** | Exponential backoff for 429, 500, 503 |
| **Pagination helpers** | Auto-fetch all pages or iterate lazily |
| **Idempotency** | Automatic Idempotency-Key generation |
| **Error handling** | Typed exceptions for each error code |
| **Streaming** | SSE client for real-time events |
| **Rate limiting** | Client-side rate limit awareness |
| **Type definitions** | Full TypeScript/OpenAPI types |

### 45.3 API Client Best Practices

| Practice | Recommendation |
|---|---|
| **Retry** | Retry on 429, 500, 502, 503 with exponential backoff (1s, 2s, 4s, 8s, max 5 retries) |
| **Idempotency** | Always send `Idempotency-Key` for mutations |
| **Pagination** | Use cursor pagination for real-time lists, offset for static lists |
| **Caching** | Use `ETag` and `If-None-Match` for resources that change infrequently |
| **Compression** | Send `Accept-Encoding: gzip, br` |
| **Timeouts** | Set 30s timeout for standard requests, 5min for report generation |
| **Correlation** | Always send `X-Correlation-Id` for request tracing |

---

*End of Document — API-FINCOPS-007 v1.0*