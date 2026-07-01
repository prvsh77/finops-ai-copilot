# UI Screen Bible — Enterprise UX Specification

## FinOps AI Copilot — Enterprise AI Financial Intelligence Platform

---

## Document Control

| Field | Value |
|---|---|
| **Document ID** | UX-FINCOPS-023 |
| **Document Title** | UI Screen Bible — Enterprise UX Specification |
| **Version** | 1.0 |
| **Status** | Final |
| **Author** | UX Architecture & Design System Team |
| **Date** | 2026-06-30 |
| **Classification** | Internal — Confidential |
| **Approval Required** | VP Design, VP Engineering, VP Product |

---

## Table of Contents

1. [Design System Overview](#1-design-system-overview)
2. [Global UX Components & Patterns](#2-global-ux-components--patterns)
3. [Screen Specifications](#3-screen-specifications)
   - 3.1 [Authentication Screens](#31-authentication-screens)
   - 3.2 [Dashboard & Overview](#32-dashboard--overview)
   - 3.3 [Transactions](#33-transactions)
   - 3.4 [Invoices](#34-invoices)
   - 3.5 [Payments](#35-payments)
   - 3.6 [Bank Accounts](#36-bank-accounts)
   - 3.7 [Treasury](#37-treasury)
   - 3.8 [Cash Flow](#38-cash-flow)
   - 3.9 [Forecasting](#39-forecasting)
   - 3.10 [Budget Planning](#310-budget-planning)
   - 3.11 [Financial Analytics](#311-financial-analytics)
   - 3.12 [Financial Statements](#312-financial-statements)
   - 3.13 [Journal Entries](#313-journal-entries)
   - 3.14 [General Ledger](#314-general-ledger)
   - 3.15 [Chart of Accounts](#315-chart-of-accounts)
   - 3.16 [Fixed Assets](#316-fixed-assets)
   - 3.17 [Accounts Payable](#317-accounts-payable)
   - 3.18 [Accounts Receivable](#318-accounts-receivable)
   - 3.19 [Vendors](#319-vendors)
   - 3.20 [Customers](#320-customers)
   - 3.21 [Procurement](#321-procurement)
   - 3.22 [Purchase Orders](#322-purchase-orders)
   - 3.23 [Fraud Center](#323-fraud-center)
   - 3.24 [Compliance Center](#324-compliance-center)
   - 3.25 [Audit Center](#325-audit-center)
   - 3.26 [Workflow Builder](#326-workflow-builder)
   - 3.27 [Rule Engine](#327-rule-engine)
   - 3.28 [Notifications](#328-notifications)
   - 3.29 [Reports](#329-reports)
   - 3.30 [Document Center](#330-document-center)
   - 3.31 [AI Copilot](#331-ai-copilot)
   - 3.32 [Organization & Users](#332-organization--users)
   - 3.33 [Billing & Subscription](#333-billing--subscription)
   - 3.34 [Developer Portal](#334-developer-portal)
   - 3.35 [Integrations](#335-integrations)
   - 3.36 [Settings](#336-settings)
   - 3.37 [System Health & Monitoring](#337-system-health--monitoring)
   - 3.38 [Admin Console](#338-admin-console)
   - 3.39 [Global UI Surfaces](#339-global-ui-surfaces)
   - 3.40 [Error & Status Pages](#340-error--status-pages)
4. [Interaction Patterns](#4-interaction-patterns)
5. [Navigation Map](#5-navigation-map)
6. [Keyboard Shortcuts Reference](#6-keyboard-shortcuts-reference)
7. [Accessibility Compliance Matrix](#7-accessibility-compliance-matrix)

---

## 1. Design System Overview

### 1.1 Design Tokens

| Token Category | Values |
|---|---|
| **Spacing Scale** | 4px / 8px / 12px / 16px / 20px / 24px / 32px / 40px / 48px / 64px / 80px / 96px |
| **Border Radius** | 4px (micro), 6px (small), 8px (medium), 12px (large), 16px (xlarge), 999px (pill) |
| **Shadow** | 0 (none), sm (1dp), md (2dp), lg (4dp), xl (8dp), drawer (16dp), modal (24dp) |
| **Opacity** | 0 (hidden), 24 (disabled), 48 (subtle), 64 (medium), 80 (hover), 100 (default) |

### 1.2 Color Palette

| Token | Usage | Hex |
|---|---|---|
| **--neutral-50** | Page background | #F8F9FA |
| **--neutral-100** | Card background | #F1F3F5 |
| **--neutral-200** | Hover state | #E9ECEF |
| **--neutral-300** | Border | #DEE2E6 |
| **--neutral-400** | Disabled text | #ADB5BD |
| **--neutral-500** | Secondary text | #868E96 |
| **--neutral-600** | Body text | #495057 |
| **--neutral-700** | Heading text | #343A40 |
| **--neutral-800** | Primary text | #212529 |
| **--neutral-900** | Max contrast | #0F1114 |
| **--brand-500** | Primary brand | #3B82F6 |
| **--brand-600** | Brand hover | #2563EB |
| **--brand-700** | Brand active | #1D4ED8 |
| **--success-500** | Positive | #10B981 |
| **--warning-500** | Warning | #F59E0B |
| **--danger-500** | Error/Danger | #EF4444 |
| **--info-500** | Information | #3B82F6 |
| **--risk-high** | High risk | #DC2626 |
| **--risk-medium** | Medium risk | #F97316 |
| **--risk-low** | Low risk | #EAB308 |

### 1.3 Typography

| Element | Font | Size | Weight | Line Height |
|---|---|---|---|---|
| Page Title | Inter | 24px | 600 (Semibold) | 32px |
| Section Title | Inter | 18px | 600 (Semibold) | 24px |
| Card Title | Inter | 14px | 600 (Semibold) | 20px |
| Body | Inter | 14px | 400 (Regular) | 20px |
| Body Small | Inter | 12px | 400 (Regular) | 16px |
| Table Header | Inter | 12px | 600 (Semibold) | 16px |
| Table Cell | Inter | 13px | 400 (Regular) | 18px |
| KPI Value | Inter | 28px | 700 (Bold) | 36px |
| KPI Label | Inter | 12px | 500 (Medium) | 16px |
| Monospace | JetBrains Mono | 13px | 400 (Regular) | 18px |
| Button Label | Inter | 14px | 500 (Medium) | 20px |
| Badge | Inter | 11px | 600 (Semibold) | 14px |
| Caption | Inter | 11px | 400 (Regular) | 14px |

### 1.4 Icon System

| Property | Specification |
|---|---|
| **Library** | Lucide Icons (consistent, MIT-licensed) |
| **Size** | 16px (default), 20px (medium), 24px (large), 32px (xlarge) |
| **Stroke** | 2px (default), 1.5px (dense views) |
| **Color** | Inherits text color via `currentColor` |
| **Accessibility** | All icons have `aria-hidden="true"` with text labels |
| **Status Icons** | CheckCircle (success), AlertTriangle (warning), XCircle (error), Info (info) |

### 1.5 Component Hierarchy

```text
Level 1: Atoms
  Button, Input, Select, Checkbox, Radio, Switch, Badge, Avatar, Tooltip, Icon

Level 2: Molecules
  SearchBar, FilterGroup, Table, Card, KPI Card, Chart, Tabs, Breadcrumbs, Pagination

Level 3: Organisms
  Page Header, Data Table, Filter Panel, Detail Panel, AI Panel, Notification Feed

Level 4: Templates
  List Page, Detail Page, Create/Edit Page, Dashboard, Wizard, Modal

Level 5: Pages
  Every route in the application
```

### 1.6 Responsive Breakpoints

| Breakpoint | Width | Target |
|---|---|---|
| **xs** | < 640px | Mobile phones |
| **sm** | 640px - 767px | Large phones |
| **md** | 768px - 1023px | Tablets |
| **lg** | 1024px - 1279px | Small laptops |
| **xl** | 1280px - 1535px | Standard desktops |
| **2xl** | ≥ 1536px | Large desktops |

---

## 2. Global UX Components & Patterns

### 2.1 Application Shell

```text
┌─────────────────────────────────────────────────────┐
│ Global Top Bar                                      │
│ [Logo] [Search ⌘K] [Command Palette] [AI] [User]   │
├──────────┬──────────────────────────────────────────┤
│ Sidebar  │ Content Area                             │
│ (collaps-│                                           │
│ ible)    │  Breadcrumbs > Path > Here                │
│          │                                           │
│ Nav      │  ┌──────────────────────────────────┐     │
│ Items    │  │ Page Header                       │     │
│          │  │ [Title] [Actions] [AI Button]     │     │
│ Dashboard│  └──────────────────────────────────┘     │
│ Finance  │                                           │
│ Treasury │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │
│ Compliance│  │KPI 1│ │KPI 2│ │KPI 3│ │KPI 4│        │
│ Settings │  └─────┘ └─────┘ └─────┘ └─────┘        │
│          │                                           │
│          │  ┌──────────────────────────────────┐     │
│          │  │ Filters / Search / Tabs          │     │
│          │  └──────────────────────────────────┘     │
│          │                                           │
│          │  ┌──────────────────────────────────┐     │
│          │  │ Data Table                        │     │
│          │  │ [Col 1] [Col 2] [Col 3] [Col 4]  │     │
│          │  │ ──────────────────────────────────│     │
│          │  │ Row data...                       │     │
│          │  │ ...                               │     │
│          │  │ Pagination                        │     │
│          │  └──────────────────────────────────┘     │
│          │                                           │
│          │  ┌──────────────────────────────────┐     │
│          │  │ AI Insight Panel (collapsible)   │     │
│          │  │ "Revenue up 12% this quarter..." │     │
│          │  └──────────────────────────────────┘     │
├──────────┴──────────────────────────────────────────┤
│ Footer: Status | Version | Support | Privacy         │
└─────────────────────────────────────────────────────┘
```

### 2.2 Global Top Bar (App Header)

| Element | Description |
|---|---|
| **Logo** | Clickable → Dashboard. 32px height. Includes product name "FinOps AI Copilot" |
| **Global Search** | Cmd+K to focus. Full-text search across transactions, invoices, vendors, documents. Dropdown with categories. Recent searches. Keyboard navigable. |
| **Command Palette** | Cmd+Shift+K to open. Quick actions: "Create invoice", "Run report", "Go to settings", "Ask AI..." |
| **AI Quick Access** | Microphone + AI icon. Opens AI Copilot panel. Shows recent AI interactions. |
| **Notifications** | Bell icon with badge count. Dropdown of recent notifications. Mark as read. "View all" link to Notification Center. |
| **User Menu** | Avatar + name dropdown. Profile, Preferences, Theme toggle, Help Center, Keyboard Shortcuts, Sign out. |
| **Environment Badge** | Shown in non-production: "LOCAL" (purple), "STAGING" (orange), "TESTING" (blue) |

### 2.3 Sidebar Navigation

| Section | Items |
|---|---|
| **Overview** | Dashboard, Financial Overview |
| **Finance** | Transactions, Invoices, Payments, Bank Accounts |
| **Treasury** | Cash Flow, Treasury, Forecasting |
| **Planning** | Budgets, Analytics, Reports |
| **Accounting** | Financial Statements, Journal Entries, General Ledger, Chart of Accounts, Fixed Assets |
| **AP/AR** | Accounts Payable, Accounts Receivable, Vendors, Customers |
| **Procurement** | Purchase Orders, Procurement |
| **Risk & Compliance** | Fraud Center, Compliance Center, Audit Center |
| **Automation** | Workflow Builder, Rule Engine |
| **AI** | AI Copilot, AI Prompt Library, AI Templates, AI Agent Monitor |
| **Organization** | Users, Roles, Settings, Billing |
| **Developer** | API Keys, Integrations, Webhooks |
| **System** | System Health, Logs, Feature Flags |

**Behaviors:**
- Collapsible: Icon-only mode (64px) when collapsed
- Active state: Brand color left border + background tint
- Section headers: Uppercase, 11px, neutral-500, tracking-wider
- Badge counts on items (e.g., pending approvals)
- Collapse/expand chevron at bottom

### 2.4 Page Header Pattern

Every list/detail page follows this pattern:

```text
┌─────────────────────────────────────────────────────────┐
│ Breadcrumbs: Finance > Transactions                     │
│                                                         │
│ [Page Title]                    [AI Action] [Create] [Export] │
│ [Subtitle / description]                                 │
│                                                         │
│ [Tab 1] [Tab 2] [Tab 3] [Filter] [Date Range] [Search] │
└─────────────────────────────────────────────────────────┘
```

### 2.5 Data Table Pattern

| Property | Specification |
|---|---|
| **Header** | Sticky top. Sortable columns (click to sort ASC/DESC). Column resize handles. |
| **Rows** | Striped (even rows subtle tint). Hover highlight. Click row → detail view. |
| **Checkbox column** | First column for multi-select. Select all checkbox in header. |
| **Row actions** | Three-dot menu on hover or at end of row. Dropdown: View, Edit, Delete, Duplicate, Approve. |
| **Pagination** | "Showing 1-20 of 1,234" — Previous / Page numbers / Next. Page size selector (20, 50, 100). |
| **Empty state** | Illustration + "No data yet" + CTA button. |
| **Loading** | Skeleton rows (pulsing gray bars matching column widths). |
| **Column types** | Text, Number (right-aligned), Currency (right-aligned), Date, Status badge, User avatar, Actions menu. |
| **Virtual scrolling** | For 10K+ rows. Fixed header, scrollable body. Row height fixed at 48px. |

### 2.6 Filter Panel Pattern

```text
┌────────────────────────────────────────────┐
│ Filters                          [Clear All] │
│                                              │
│ Date Range: [From] ── [To]                  │
│ Status: [✓ Active] [✓ Pending] [✗ Closed]   │
│ Amount: [$0] ── [$100,000+]                 │
│ Category: [Dropdown ▼]                      │
│ Vendor: [Search + Multi-select]             │
│                                              │
│ [Apply Filters] [Save View]                 │
└────────────────────────────────────────────┘
```

### 2.7 AI Action Surface Pattern

Every page includes an AI surface (bottom-right collapsible panel or inline section):

| Element | Description |
|---|---|
| **Trigger** | "Ask AI" FAB button (bottom-right), or inline "AI Insight" bar |
| **Panel** | Slide-in from right, 400px wide. Header: "AI Analysis", Close button. |
| **Content** | Context-aware insights based on current page data. Generated text with confidence score. |
| **Sources** | Collapsible "View Sources" — cites specific transaction IDs, report names, document references. |
| **Actions** | "Copy", "Regenerate", "Export as note", "Provide feedback" (thumbs up/down). |
| **Loading** | Streaming text with cursor animation. "Analyzing your data..." |

### 2.8 Confirmation Dialog Pattern

| Element | Specification |
|---|---|
| **Size** | 480px max-width, centered |
| **Icon** | Warning triangle for destructive, info for informational, check for success |
| **Title** | "Confirm [Action]" — e.g., "Delete Transaction" |
| **Message** | "Are you sure? This action cannot be undone." + specific details |
| **Actions** | Secondary button: "Cancel". Primary button: "Confirm" (danger color for destructive). |
| **Danger zone** | Red border. Requires typing "DELETE" to confirm for irreversible actions. |
| **Loading** | Button shows spinner during async operation. Disabled to prevent double-click. |

### 2.9 Toast Notification Pattern

| Type | Icon | Duration | Action |
|---|---|---|---|
| **Success** | CheckCircle | 4 seconds | Optional undo |
| **Error** | XCircle | 8 seconds | "View details" link |
| **Warning** | AlertTriangle | 6 seconds | "Dismiss" |
| **Info** | Info | 4 seconds | None |
| **Progress** | Spinner | Until complete | "Cancel" |

Position: Top-right. Stack up to 5. Auto-dismiss. Pause on hover.

### 2.10 Drawer Pattern (Side Panel)

| Property | Specification |
|---|---|
| **Width** | 480px (default), 640px (wide), 100% (full-screen on mobile) |
| **Animation** | Slide in from right, 300ms ease |
| **Backdrop** | Semi-transparent black @ 50% opacity, click to close |
| **Header** | Title + Close button (X) + optional "Save" button |
| **Body** | Scrollable content, padding 24px |
| **Footer** | Fixed bottom with primary/secondary actions |
| **Mobile** | Full screen, slide up from bottom, handle bar for drag-to-dismiss |

---

## 3. Screen Specifications

---

### 3.1 Authentication Screens

#### 3.1.1 Login Screen

**Page Information**
| Field | Value |
|---|---|
| Page Name | Login |
| Route | `/auth/login` |
| Purpose | Authenticate users with email/password or SSO |
| Primary Roles | All unauthenticated users |
| Access | Public |
| Entry Points | Direct URL, session expiry redirect |
| Related Pages | Register, Forgot Password, MFA Verify, SSO Callback |

**Layout**
```text
┌──────────────────────────────────────────────────────┐
│                                                       │
│     ┌─────────────────────────────┐                   │
│     │                             │                   │
│     │   [Logo: FinOps AI Copilot] │                   │
│     │                             │                   │
│     │   Welcome back              │                   │
│     │   Sign in to your account   │                   │
│     │                             │                   │
│     │   Email: [_______________]  │                   │
│     │   Password: [______________]│                   │
│     │                             │                   │
│     │   [ ] Remember me           │                   │
│     │                             │                   │
│     │   [Sign In ──────────────]  │                   │
│     │                             │                   │
│     │   ───── or continue with ───│                   │
│     │                             │                   │
│     │   [SSO] [Google] [Microsoft]│                   │
│     │                             │                   │
│     │   Forgot password?          │                   │
│     │   Don't have an account?    │                   │
│     │                             │                   │
│     └─────────────────────────────┘                   │
│                                                       │
│     © 2026 FinOps AI Copilot. All rights reserved.   │
│                                                       │
└──────────────────────────────────────────────────────┘
```

**Layout Details:**
- Full-screen centered card layout
- Background: Subtle gradient or pattern (neutral-50 to neutral-100)
- Card: 440px max-width, md shadow, 24px padding
- Logo at top: 40px height
- Vertical spacing: 32px between sections
- SSO buttons: Outline style, equal width
- Links: 14px, brand-500, right-aligned for "Forgot password"

**Components:**
| Component | Specification |
|---|---|
| Text Input | Email: type="email", autoComplete="email", placeholder="you@company.com" |
| Text Input | Password: type="password", autoComplete="current-password", show/hide toggle |
| Checkbox | "Remember me" — default unchecked |
| Primary Button | Full width, 48px height, "Sign In", loading state with spinner |
| Divider | "or continue with" — line + text, neutral-300 |
| SSO Buttons | Outline buttons with icon + text "Continue with [Provider]" |
| Link | "Forgot password?" — navigation to /auth/forgot-password |
| Link | "Don't have an account? Sign up" — navigation to /auth/register |
| Alert | Error state: red banner above form with error message |

**States:**
| State | Behavior |
|---|---|
| **Loading** | Button shows spinner, inputs disabled, "Signing in..." |
| **Error** | Red alert: "Invalid email or password" — inline above form |
| **MFA Required** | Navigate to MFA verify screen |
| **SSO Redirect** | Show "Redirecting to [Provider]..." with spinner |
| **Account Locked** | "Account temporarily locked. Try again in 15 minutes." |
| **Network Error** | "Unable to connect. Check your internet connection." |

**Responsive:**
| Breakpoint | Behavior |
|---|---|
| Desktop (xl+) | Centered card with 440px width |
| Tablet (md-lg) | Centered card, slightly smaller padding |
| Mobile (< md) | Full-width card, no shadows, stacked layout |

**Keyboard Shortcuts:**
| Key | Action |
|---|---|
| Enter | Submit form |
| Tab | Focus next field |
| Shift+Tab | Focus previous field |

**Accessibility:**
- All inputs have associated labels (visually hidden or visible)
- Error messages linked via `aria-describedby`
- Form has `novalidate` with custom validation
- SSO buttons have descriptive `aria-label`
- Focus trap within modal if applicable

**Analytics Events:**
| Event | Payload |
|---|---|
| `login_attempt` | method: email/sso/google/microsoft |
| `login_success` | method, user_id |
| `login_failure` | method, reason |
| `login_mfa_required` | method |

**Acceptance Criteria:**
| ID | Criterion |
|---|---|
| AUTH-LOGIN-01 | Valid credentials redirect to dashboard |
| AUTH-LOGIN-02 | Invalid credentials show error message |
| AUTH-LOGIN-03 | Empty fields show validation errors |
| AUTH-LOGIN-04 | SSO button redirects to IdP |
| AUTH-LOGIN-05 | Account lockout shows appropriate message |
| AUTH-LOGIN-06 | Remember me persists session across browser close |
| AUTH-LOGIN-07 | MFA-enabled user is redirected to MFA screen |
| AUTH-LOGIN-08 | Loading state disables all inputs |

---

#### 3.1.2 Register Screen

**Page Information**
| Field | Value |
|---|---|
| Page Name | Register |
| Route | `/auth/register` |
| Purpose | Create a new organization account |
| Primary Roles | New users (unauthenticated) |
| Access | Public |
| Entry Points | "Sign up" link from login, direct URL |
| Related Pages | Login, Organization Setup, Onboarding |

**Layout:**
Similar to Login but with registration-specific fields. Card layout, 480px max-width.

**Fields:**
- Full Name (required)
- Work Email (required, validated)
- Company Name (required)
- Password (required, with strength meter)
- Confirm Password (required, must match)
- Terms checkbox (required)

**Password Strength Meter:**
- Visual bar: Empty (gray) → Weak (red) → Fair (orange) → Strong (yellow) → Very Strong (green)
- Requirements checklist: 8+ chars, uppercase, lowercase, number, special char

**States:**
| State | Behavior |
|---|---|
| Loading | Button spinner, inputs disabled |
| Error | Inline validation per field + banner for server errors |
| Success | Redirect to organization setup / onboarding |
| Email Taken | "An account with this email already exists. Sign in instead." |
| Weak Password | Block form submission, show requirements |

**Acceptance Criteria:**
| ID | Criterion |
|---|---|
| AUTH-REG-01 | Registration creates account and organization |
| AUTH-REG-02 | Password strength meter updates in real-time |
| AUTH-REG-03 | Weak password blocks submission |
| AUTH-REG-04 | Mismatched passwords show error |
| AUTH-REG-05 | Duplicate email shows appropriate message |
| AUTH-REG-06 | Terms acceptance required |
| AUTH-REG-07 | Verification email sent to registered email |

---

#### 3.1.3 Forgot Password Screen

**Page Information**
| Field | Value |
|---|---|
| Page Name | Forgot Password |
| Route | `/auth/forgot-password` |
| Purpose | Initiate password reset flow |
| Primary Roles | All users |
| Access | Public |
| Entry Points | Link from login page, direct URL |
| Related Pages | Login, Reset Password |

**Layout:**
Simple card with single email field. 420px max-width.

**Flow:**
1. Enter email → Submit
2. "Check your email" confirmation screen with link back to login
3. Email contains reset link → /auth/reset-password?token=xxx

**States:**
| State | Behavior |
|---|---|
| Loading | Button spinner |
| Success | Confirmation screen: "If an account exists, we've sent a reset link" (don't reveal if email exists) |
| Error | Generic error message |

---

#### 3.1.4 MFA Verification Screen

**Page Information**
| Field | Value |
|---|---|
| Page Name | MFA Verification |
| Route | `/auth/mfa/verify` |
| Purpose | Verify MFA code during login |
| Primary Roles | All users with MFA enabled |
| Access | Post-login (requires valid session token) |
| Entry Points | Redirect after login if MFA required |
| Related Pages | Login, MFA Setup (in Settings), Recovery Codes |

**Layout:**
```text
┌──────────────────────────────────────┐
│                                      │
│   [Lock icon]                        │
│   Two-Factor Authentication          │
│   Enter the code from your           │
│   authenticator app                  │
│                                      │
│   [ _ ][ _ ][ _ ][ _ ][ _ ][ _ ]    │
│   (6 digit code input)               │
│                                      │
│   [Verify ──────────────────────]    │
│                                      │
│   Use recovery code instead          │
│   Trust this device for 30 days [ ]  │
│                                      │
└──────────────────────────────────────┘
```

**Input:**
- 6 individual digit inputs, auto-advance
- Or single masked input field
- Paste support for TOTP codes

**States:**
| State | Behavior |
|---|---|
| Loading | Button spinner, inputs disabled |
| Error | "Invalid code. Please try again." — remaining attempts counter |
| Lockout | "Too many attempts. Try again later." |
| Recovery | Alternate flow with recovery code input |

---

#### 3.1.5 SSO Login Screen

**Page Information**
| Field | Value |
|---|---|
| Page Name | SSO Login |
| Route | `/auth/sso` |
| Purpose | Organization-specific SSO login |
| Primary Roles | Users with SSO-configured organizations |
| Access | Public |
| Entry Points | SSO button from login, "/auth/sso?domain=company.com" |
| Related Pages | Login, SSO Callback |

**Layout:**
- Company domain/email input → "Continue with SSO"
- Redirects to IdP (Okta, Azure AD, OneLogin)
- Callback redirects to dashboard

---

### 3.2 Dashboard & Overview

#### 3.2.1 Dashboard (Home)

**Page Information**
| Field | Value |
|---|---|
| Page Name | Dashboard |
| Route | `/dashboard` |
| Purpose | Financial command center — KPIs, charts, alerts, approvals |
| Primary Roles | All users (role-aware content) |
| Access | Authenticated users |
| Entry Points | Login redirect, logo click, sidebar, `/` redirect |
| Related Pages | Financial Overview, Approval Center, Reports |

**Layout:**
```text
┌───────────────────────────────────────────────────────────────┐
│ Dashboard                                                     │
│ [Period: Current Month ▼] [Entity: All ▼] [Saved Views ▼]    │
│                                                    [AI Summary]│
├───────────────┬───────────────┬───────────────┬───────────────┤
│ Cash Balance  │ Revenue MTD   │ Expenses MTD  │ Runway        │
│ $12,450,000   │ $3,200,000    │ $2,100,000    │ 14 months     │
│ ▲ 5.2% vs LM  │ ▲ 12.3% vs LM │ ▼ 3.1% vs LM  │ ▲ 2 months    │
│ [Sparkline]   │ [Sparkline]   │ [Sparkline]   │ [Sparkline]   │
├───────────────┴───────────────┴───────────────┴───────────────┤
│ Revenue vs Expense                                    [Full View]│
│ [Area Chart — 12 months, interactive, drill-down]              │
├───────────────┬───────────────────────────────────────────────┤
│ Cash Runway   │ Pending Approvals                     [View All]│
│ [Bar chart]   │ • Invoice INV-2024-0892 — $12,400 — 2h SLA   │
│               │ • Payment BATCH-042 — $89,000 — 4h SLA       │
│               │ • Expense EXP-382 — $340 — 1d SLA             │
├───────────────┴───────────────────────────────────────────────┤
│ Active Alerts                                        [View All]│
│ 🔴 Fraud Alert: Duplicate payment detected — $50,000         │
│ 🟡 Compliance: SOC 2 control failed — Remediation needed      │
│ 🟡 Sync Failure: QuickBooks sync failed — 2h ago              │
│ 🟢 All clear: Bank sync completed — 10 min ago                │
├───────────────────────────────────────────────────────────────┤
│ AI Executive Summary                                           │
│ "This week revenue increased 12% driven by enterprise sales.  │
│ Cash position remains strong at $12.4M with 14 months runway. │
│ Top risk: 2 high-severity fraud alerts requiring review."     │
│ [Regenerate] [View Sources] [Provide Feedback]                │
└───────────────────────────────────────────────────────────────┘
```

**Components:**
| Component | Count | Specification |
|---|---|---|
| KPI Card | 4 | 280px width, white bg, md shadow, border. KPI value (28px bold), label (12px medium), trend arrow + percentage, sparkline (80px) |
| Area Chart | 1 | 12-month revenue vs expense. Interactive tooltip. Legend. Drill-down click. |
| Bar Chart | 1 | Cash runway by month. Current runway highlighted. Depletion line. |
| Approval Queue | 1 | List of top 5 pending approvals. Priority indicator. SLA timer. Click → approval drawer. |
| Alert Panel | 1 | Severity icon + message + timestamp. Click → relevant module. |
| AI Summary Card | 1 | Generated text with streaming animation. Confidence badge. Action buttons. |
| Period Selector | 1 | Dropdown: Current Month, Current Quarter, Current Year, Custom Range |
| Entity Selector | 1 | Dropdown: All Entities, specific entities |
| Saved Views | 1 | Dropdown: Default, My View, CFO View, [Saved Views] |

**AI Features:**
| Feature | Description |
|---|---|
| Executive Summary | Daily/weekly AI-generated narrative with key metrics, changes, risks |
| Anomaly Highlight | AI highlights unusual KPI movements |
| Forecast Preview | AI-predicted KPI values for next period |
| Chat Access | "Ask AI about this dashboard" FAB |

**States:**
| State | Behavior |
|---|---|
| Loading | KPI skeleton cards (pulsing rectangles). Chart skeleton (gray gradient bar). Alert skeleton. |
| Empty | KPI cards show "--" with label "No data this period". Empty state with CTA "Import transactions". |
| Stale Data | Warning banner: "Data shown as of [timestamp]. Last sync: [time] ago." |
| Error | Error state card: "Unable to load dashboard data. [Retry]" |
| Permission Restricted | Restricted KPIs hidden. "You don't have access to this metric." |

**Responsive:**
| Breakpoint | Behavior |
|---|---|
| Desktop (xl+) | 4-column KPI grid. Full chart widths. |
| Laptop (lg) | 2-column KPI grid. Slightly reduced chart sizes. |
| Tablet (md) | 2-column KPI grid. Stacked layout for charts. |
| Mobile (< md) | 1-column KPI grid. All sections stacked vertically. Sidebar collapsed. |

**Keyboard Shortcuts:**
| Key | Action |
|---|---|
| G then D | Go to Dashboard |
| / | Focus search |
| Cmd+K | Open command palette |
| R | Refresh data |

**Acceptance Criteria:**
| ID | Criterion |
|---|---|
| DASH-01 | All 4 KPI cards display correct values with sparklines |
| DASH-02 | Revenue chart renders interactive 12-month view |
| DASH-03 | Approval queue shows real-time pending tasks |
| DASH-04 | AI summary is generated and displayed |
| DASH-05 | Saved views switch dashboard configuration |
| DASH-06 | Period selector updates all KPI values |
| DASH-07 | Dashboard loads within 2 seconds |
| DASH-08 | All alerts are clickable and navigate correctly |

---

#### 3.2.2 Financial Overview

**Page Information**
| Field | Value |
|---|---|
| Page Name | Financial Overview |
| Route | `/financial-overview` |
| Purpose | High-level P&L and entity performance summary |
| Primary Roles | CFO, VP Finance, Controller |
| Access | Finance roles + Executive Viewer |
| Entry Points | Sidebar: Overview > Financial Overview |
| Related Pages | Dashboard, Analytics, Financial Statements |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Financial Overview                                       │
│ [Period] [Entity] [Currency: USD]                        │
├─────────────┬─────────────┬─────────────┬───────────────┤
│ Revenue     │ Gross Margin│ Net Income  │ EBITDA        │
│ $3.2M       │ 68%         │ $890K       │ $1.2M          │
│ ▲ 12.3%     │ ▲ 2.1%      │ ▲ 8.4%      │ ▲ 10.2%        │
├─────────────┴─────────────┴─────────────┴───────────────┤
│ Revenue Breakdown                        [AI Explain]   │
│ [Donut chart: Product A 45%, Product B 30%...]           │
├──────────────────────────────────────────────────────────┤
│ Entity Performance                              [View All]│
│ [Table: Entity, Revenue, Expenses, Net Income, Margin]   │
│ ──────────────────────────────────────────────────────── │
│ US Corp     $1.8M    $600K    $1.2M    67%              │
│ EU GmbH     $890K    $320K    $570K    64%              │
│ APAC Pte    $510K    $180K    $330K    65%              │
├──────────────────────────────────────────────────────────┤
│ AI Insight                                                │
│ "Revenue grew 12.3% driven by 18% growth in Product A.  │
│ Gross margin improved 2.1% due to lower COGS from..."    │
└──────────────────────────────────────────────────────────┘
```

**AI Features:**
- "Explain this variance" — AI analyzes period-over-period changes
- "Generate executive summary" — one-click report draft
- "What's driving our margins?" — root cause analysis

---

### 3.3 Transactions

#### 3.3.1 Transaction List

**Page Information**
| Field | Value |
|---|---|
| Page Name | Transactions |
| Route | `/transactions` |
| Purpose | View, search, filter, and manage all financial transactions |
| Primary Roles | Accountant, Controller, AP team |
| Access | Accountant+ roles |
| Entry Points | Sidebar: Finance > Transactions |
| Related Pages | Transaction Detail, Reconciliation, Invoices, Bank Accounts |

**Layout:**
```text
┌──────────────────────────────────────────────────────────────┐
│ Transactions                                    [Import] [AI]│
│                                                              │
│ [All] [Uncategorized] [Unreconciled] [Flagged] [Exports]    │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐    │
│ │ Filters: [Date Range] [Account] [Category] [Amount]  │    │
│ │ Search: [Search by description, vendor...        🔍] │    │
│ │ Saved Views: [Default ▼]                    [Save]  │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐    │
│ │ ☐ │ Date │ Description  │ Category │ Amount  │ Status │ │
│ │───────────────────────────────────────────────────────│    │
│ │ ☐ │ 06/30│ Invoice 8923 │ AP       │ $12,400 │ ● Rec.│ │
│ │ ☐ │ 06/29│ Wire: Vendor │ Payments │ $89,000 │ ● Pen.│ │
│ │ ☐ │ 06/28│ Expense Rep. │ Travel   │ $340    │ ● Unc.│ │
│ │ ...                                                  │    │
│ │───────────────────────────────────────────────────────│    │
│ │ [< Prev] 1 2 3 ... 50 [Next >]  Showing 1-20 of 1,234│    │
│ └──────────────────────────────────────────────────────┘    │
│                                                              │
│ [AI Insight: 23 transactions uncategorized. Auto-categorize?]│
└──────────────────────────────────────────────────────────────┘
```

**Table Columns:**
| Column | Width | Type | Sortable | Notes |
|---|---|---|---|---|
| Checkbox | 40px | checkbox | No | Multi-select |
| Date | 100px | date | Yes | Posted date |
| Description | 30% | text | Yes | Truncated with tooltip on overflow |
| Category | 120px | badge | Yes | Color-coded category badge |
| Amount | 120px | currency | Yes | Right-aligned, formatted |
| Account | 100px | text | Yes | Last 4 digits + bank name |
| Status | 100px | status badge | Yes | Reconciled/Pending/Flagged |
| Actions | 60px | menu | No | Three-dot dropdown |

**Bulk Actions:**
| Action | Behavior |
|---|---|
| Bulk Categorize | Select transactions → "Categorize" → select category → confirm |
| Bulk Flag | Select transactions → "Flag" → select reason → confirm |
| Bulk Approve | Select transactions → "Approve" (if eligible) |
| Bulk Export | Select transactions → "Export" → CSV/XLSX |

**States:**
| State | Behavior |
|---|---|
| Loading | Skeleton table with 10 rows of pulsing bars |
| Empty | "No transactions found" illustration + "Import your first transaction" CTA |
| Filtered Empty | "No transactions match your filters" + "Clear filters" link |
| Error | "Unable to load transactions" + "Retry" button |
| Offline | "You're offline. Showing cached data." banner |

**AI Features:**
- "Auto-categorize uncategorized" — one-click AI categorization
- "Detect anomalies" — flags unusual transactions
- "Summarize this view" — AI generates narrative summary of visible transactions
- "What's unusual this month?" — anomaly detection

**Keyboard Shortcuts:**
| Key | Action |
|---|---|
| / | Focus search |
| N | New transaction (if applicable) |
| E | Export current view |
| I | Open import dialog |

---

#### 3.3.2 Transaction Detail Drawer

**Page Information**
| Field | Value |
|---|---|
| Page Name | Transaction Detail |
| Route | `/transactions/{id}` |
| Purpose | View full details of a single transaction |
| Primary Roles | Accountant, Controller |
| Access | Accountant+ roles |
| Entry Points | Click transaction row in list |
| Related Pages | Transaction List |

**Drawer Layout:**
```text
┌──────────────────────────────────────┐
│ Transaction Details              [X] │
│──────────────────────────────────────│
│ Status: ● Reconciled                 │
│──────────────────────────────────────│
│ Amount:          $12,400.00          │
│ Posted Date:     Jun 30, 2026       │
│ Description:     Payment to ABC Corp │
│ Category:        Accounts Payable    │
│ Account:         Chase Business ●●●●│
│ Vendor:          ABC Corp           │
│ Reference:       INV-2024-0892      │
│──────────────────────────────────────│
│ Attachments:                         │
│ [invoice_8923.pdf] [receipt.jpg]     │
│──────────────────────────────────────│
│ Split Details:                       │
│ - AP: $10,000                         │
│ - Tax: $2,400                         │
│──────────────────────────────────────│
│ Audit Trail:                         │
│ • Created: Jun 28, 2026 by John D.  │
│ • Categorized: Jun 28, 2026 by AI   │
│ • Reconciled: Jun 30, 2026 by Sarah │
│──────────────────────────────────────│
│ [Edit] [Reconcile] [Flag] [AI Explain]│
└──────────────────────────────────────┘
```

---

### 3.4 Invoices

#### 3.4.1 Invoice List

**Page Information**
| Field | Value |
|---|---|
| Page Name | Invoices |
| Route | `/invoices` |
| Purpose | Manage AP invoice lifecycle |
| Primary Roles | AP Clerk, AP Manager, Controller |
| Access | AP+ roles |
| Entry Points | Sidebar: Finance > Invoices |
| Related Pages | Invoice Detail, Payments, Vendors |

**Table Columns:**
| Column | Type | Notes |
|---|---|---|
| Checkbox | checkbox | Multi-select |
| Invoice # | text | Link to detail |
| Vendor | text | Link to vendor profile |
| Amount | currency | Right-aligned |
| Due Date | date | Colored if overdue (red) or due soon (yellow) |
| Status | status badge | Draft, Pending Approval, Approved, Paid, Rejected, On Hold |
| Approval | status | Approval progress (1/2 approved) |
| AI Score | badge | OCR confidence, duplicate risk |
| Actions | menu | View, Edit, Approve, Reject, Hold |

**Filters:**
- Date Range (invoice date, due date)
- Status (multi-select)
- Vendor (search + multi-select)
- Amount Range
- Approval Status
- OCR Confidence (below 80% only)

**States:**
| State | Behavior |
|---|---|
| Loading | Skeleton table |
| Empty | "No invoices yet" + "Upload your first invoice" CTA |
| Upload Drop Zone | Dashed border area for drag-drop. Multiple files. Progress per file. |

**AI Features:**
- "Process pending invoices" — batch OCR + categorization
- "Flag duplicate invoices" — AI duplicate detection
- "Predict payment timing" — AI suggests payment schedule based on cash position

---

#### 3.4.2 Invoice Upload

**Layout:**
```text
┌──────────────────────────────────────────────┐
│ Upload Invoices                          [X] │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │                                          │ │
│ │  Drop files here or click to browse      │ │
│ │  Supported: PDF, PNG, JPG, TIFF         │ │
│ │  Max: 50MB per file                     │ │
│ │                                          │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ Upload Queue:                                │
│ [invoice_01.pdf] ─── ████████░░ 80%          │
│ [invoice_02.pdf] ─── ██████░░░░ 60%          │
│ [invoice_03.pdf] ─── Pending...              │
│                                              │
│ [Upload] [Cancel]                            │
└──────────────────────────────────────────────┘
```

---

### 3.5 Payments

#### 3.5.1 Payment Batches

**Page Information**
| Field | Value |
|---|---|
| Page Name | Payment Batches |
| Route | `/payments` |
| Purpose | Create, approve, and execute payment batches |
| Primary Roles | Treasurer, AP Manager, Controller |
| Access | Treasurer+, AP approver roles |
| Entry Points | Sidebar: Finance > Payments |
| Related Pages | Payment Detail, Invoices, Bank Accounts |

**Layout:**
```text
┌──────────────────────────────────────────────────────────────┐
│ Payments                                        [Create Batch]│
│                                                              │
│ [All Batches] [Pending Approval] [Approved] [Held] [History] │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐    │
│ │ Filters: [Date] [Status] [Rail] [Amount]             │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐    │
│ │ Batch ID │ Date │ Rail │ Amount │ Status │ Approvals│    │
│ │──────────│──────│──────│────────│────────│──────────│    │
│ │ B-042    │06/30 │ ACH  │$89,000 │ ● Pending │ 1/2   │    │
│ │ B-041    │06/29 │ Wire │$250,000│ ● Approved│ 2/2   │    │
│ │ B-040    │06/28 │ Check│ $12,400│ ● Released│ 2/2   │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                              │
│ AI Insight: "2 batches pending approval. 1 batch exceeds    │
│ $100K threshold requiring dual control."                     │
└──────────────────────────────────────────────────────────────┘
```

---

### 3.6 Bank Accounts

#### 3.6.1 Bank Accounts List

**Page Information**
| Field | Value |
|---|---|
| Page Name | Bank Accounts |
| Route | `/bank-accounts` |
| Purpose | View and manage connected bank accounts |
| Primary Roles | Treasurer, Admin |
| Access | Treasury+, Admin |
| Entry Points | Sidebar: Finance > Bank Accounts |
| Related Pages | Account Detail, Treasury, Transactions |

**Layout:**
```text
┌──────────────────────────────────────────────────────────────┐
│ Bank Accounts                                  [Connect Bank]│
│                                                              │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                        │
│ │ Chase   │ │ BofA    │ │ Wells   │                        │
│ │ $2.1M   │ │ $890K   │ │ $450K   │                        │
│ │ ● Synced│ │ ● Synced│ │ ⚠ 2h ago│                        │
│ │ 10 min  │ │ 1h ago  │ │         │                        │
│ └─────────┘ └─────────┘ └─────────┘                        │
│                                                              │
│ Account Details Table:                                       │
│ [Account] [Type] [Balance] [Currency] [Status] [Last Sync]  │
│ ───────────────────────────────────────────────────────────  │
│ Chase ●●●●1234  Checking  $2,100,000  USD   ● Online  10m  │
│ BofA ●●●●5678   Savings   $890,000    USD   ● Online  1h   │
│ Wells ●●●●9012   Checking  $450,000    USD   ⚠ Offline 2h  │
└──────────────────────────────────────────────────────────────┘
```

---

### 3.7 Treasury

#### 3.7.1 Treasury Dashboard

**Page Information**
| Field | Value |
|---|---|
| Page Name | Treasury |
| Route | `/treasury` |
| Purpose | Liquidity management, cash positioning, FX exposure |
| Primary Roles | Treasurer, CFO |
| Access | Treasury+, CFO |
| Entry Points | Sidebar: Treasury > Treasury |
| Related Pages | Cash Flow, Bank Accounts, Forecasting |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Treasury                                                 │
├──────────────┬──────────────┬──────────────┬─────────────┤
│ Total Cash   │ FX Exposure  │ Credit Lines │ Investments │
│ $3.45M       │ $1.2M (EUR) │ $5M (undrawn)│ $2M (T-bills)│
├──────────────┴──────────────┴──────────────┴─────────────┤
│ Cash Position by Entity                                   │
│ [Stacked bar chart: US $2.1M, EU $890K, APAC $450K]     │
├──────────────────────────────────────────────────────────┤
│ FX Exposure Summary                                       │
│ [Table: Currency, Position, Spot Rate, 30d Change]       │
├──────────────────────────────────────────────────────────┤
│ AI Liquidity Recommendation                               │
│ "Consider transferring $500K from checking to high-yield  │
│ savings to earn ~3.2% APY. Confidence: High"             │
└──────────────────────────────────────────────────────────┘
```

---

### 3.8 Cash Flow

#### 3.8.1 Cash Flow Dashboard

**Page Information**
| Field | Value |
|---|---|
| Page Name | Cash Flow |
| Route | `/cash-flow` |
| Purpose | Daily cash visibility, runway, scenario analysis |
| Primary Roles | Treasurer, CFO, VP Finance |
| Access | Treasury+, Finance+ |
| Entry Points | Sidebar: Treasury > Cash Flow |
| Related Pages | Treasury, Forecasting, Bank Accounts |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Cash Flow                                                │
├──────────────┬──────────────┬──────────────┬─────────────┤
│ Cash Today   │ 7-day Change │ 30-day Forecast│ Runway    │
│ $3.45M       │ +$120K      │ $3.2M-$3.6M  │ 14 months   │
├──────────────┴──────────────┴──────────────┴─────────────┤
│ Cash Inflow vs Outflow                                    │
│ [Waterfall chart: beginning balance + inflows - outflows] │
├──────────────────────────────────────────────────────────┤
│ 13-Week Cash Forecast                                     │
│ [Area chart with confidence band: forecast +/- 10%]      │
├──────────────────────────────────────────────────────────┤
│ Scenario Analysis                                         │
│ [Base] [Optimistic] [Pessimistic] — toggle comparison     │
├──────────────────────────────────────────────────────────┤
│ AI Cash Narrative                                         │
│ "Cash position increased $120K this week driven by..."    │
└──────────────────────────────────────────────────────────┘
```

---

### 3.9 Forecasting

#### 3.9.1 Forecasting Dashboard

**Page Information**
| Field | Value |
|---|---|
| Page Name | Forecasting |
| Route | `/forecasting` |
| Purpose | ML-based financial forecasting with scenario comparison |
| Primary Roles | VP Finance, FP&A, CFO |
| Access | Finance+ roles |
| Entry Points | Sidebar: Treasury > Forecasting |
| Related Pages | Cash Flow, Budgets, Analytics |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Forecasting                                    [Run Model]│
│ [Model: Prophet ▼] [Horizon: 12 months ▼]               │
├──────────────┬──────────────┬──────────────┬─────────────┤
│ Revenue      │ Expenses     │ Net Income   │ Cash        │
│ Forecast     │ Forecast     │ Forecast     │ Forecast    │
│ $42.5M       │ $28.1M       │ $14.4M       │ $4.2M       │
│ ±5% conf     │ ±4% conf     │ ±8% conf     │ ±12% conf   │
├──────────────┴──────────────┴──────────────┴─────────────┤
│ Forecast vs Actual                          [Comparison] │
│ [Line chart: Historical + Forecast with confidence band] │
├──────────────────────────────────────────────────────────┤
│ Scenario Comparison                          [Add Scenario]│
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│ │ Base     │ │ Upside   │ │ Downside │                  │
│ │ $42.5M   │ │ $48.2M   │ │ $36.1M   │                  │
│ │ Revenue  │ │ Revenue  │ │ Revenue  │                  │
│ └──────────┘ └──────────┘ └──────────┘                  │
├──────────────────────────────────────────────────────────┤
│ AI Forecast Explanation                                  │
│ "Revenue forecast driven by 15% expected growth in..."   │
└──────────────────────────────────────────────────────────┘
```

---

### 3.10 Budget Planning

#### 3.10.1 Budget List

**Page Information**
| Field | Value |
|---|---|
| Page Name | Budget Planning |
| Route | `/budgets` |
| Purpose | Create, manage, and track department budgets |
| Primary Roles | FP&A, Budget Manager, VP Finance |
| Access | Finance+ roles |
| Entry Points | Sidebar: Planning > Budgets |
| Related Pages | Budget Detail, Analytics, Forecasting |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Budgets                                      [Create Budget]│
│ [Period: FY 2026 ▼] [Entity: All ▼]                      │
├──────────────────────────────────────────────────────────┤
│ Budget vs Actual Summary                                  │
│ ┌──────────┬──────────┬──────────┬──────────┐            │
│ │ Total    │ Revenue  │ COGS     │ OpEx     │            │
│ │ Budget   │ Budget   │ Budget   │ Budget   │            │
│ │ $15.2M   │ $42.5M   │ $12.8M   │ $15.3M   │            │
│ │ Actual   │ Actual   │ Actual   │ Actual   │            │
│ │ $14.8M   │ $44.1M   │ $12.2M   │ $16.1M   │            │
│ │ -2.6%    │ +3.8%    │ -4.7%    │ +5.2%    │            │
│ └──────────┴──────────┴──────────┴──────────┘            │
├──────────────────────────────────────────────────────────┤
│ Department Budgets                                        │
│ [Table: Department, Budget, Actual, Variance, Status]    │
│ ──────────────────────────────────────────────────────── │
│ Engineering  $5.2M  $5.4M   +3.8%    ⚠ Over budget      │
│ Marketing    $3.1M  $2.9M   -6.5%    ✓ On track         │
│ Sales        $2.8M  $2.7M   -3.6%    ✓ On track         │
│ Operations   $2.1M  $2.0M   -4.8%    ✓ On track         │
└──────────────────────────────────────────────────────────┘
```

---

### 3.11 Financial Analytics

#### 3.11.1 Analytics Dashboard

**Page Information**
| Field | Value |
|---|---|
| Page Name | Financial Analytics |
| Route | `/analytics` |
| Purpose | Deep financial analysis, driver analysis, cohort analysis |
| Primary Roles | VP Finance, FP&A, CFO |
| Access | Finance+ roles |
| Entry Points | Sidebar: Planning > Analytics |
| Related Pages | Dashboard, Reports, Financial Statements |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Financial Analytics                          [Save View]  │
│ [Period] [Entity] [Comparison: vs Last Year]             │
├──────────────────────────────────────────────────────────┤
│ P&L Driver Analysis                         [AI Explain]  │
│ [Waterfall chart: Revenue drivers variance breakdown]    │
├───────────────┬──────────────────────────────────────────┤
│ Gross Margin  │ EBITDA Analysis                          │
│ [Line chart]  │ [Bridge chart: Revenue to EBITDA]        │
│ 68% (+2.1%)   │ $1.2M (+10.2%)                           │
├───────────────┴──────────────────────────────────────────┤
│ Cohort Analysis                                           │
│ [Cohort retention table: quarter cohorts, retention %]  │
├──────────────────────────────────────────────────────────┤
│ Spend Analytics                                           │
│ [Treemap: spend by category, size = amount, color = Δ]   │
└──────────────────────────────────────────────────────────┘
```

---

### 3.12 Financial Statements

#### 3.12.1 Financial Statements Dashboard

**Page Information**
| Field | Value |
|---|---|
| Page Name | Financial Statements |
| Route | `/financial-statements` |
| Purpose | View P&L, Balance Sheet, Cash Flow Statement |
| Primary Roles | Controller, CFO, VP Finance |
| Access | Controller+ roles |
| Entry Points | Sidebar: Accounting > Financial Statements |
| Related Pages | General Ledger, Journal Entries |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Financial Statements                        [Export] [AI] │
│ [Period: Q2 2026 ▼] [Entity: Consolidated ▼]             │
├──────────────────────────────────────────────────────────┤
│ [P&L] [Balance Sheet] [Cash Flow] [Trial Balance]        │
├──────────────────────────────────────────────────────────┤
│ Profit & Loss Statement                                   │
│ ┌────────────────────────────────────────────────────┐   │
│ │ Revenue                            $12,400,000     │   │
│ │   Product A                        $5,800,000      │   │
│ │   Product B                        $4,200,000      │   │
│ │   Services                         $2,400,000      │   │
│ │ Cost of Revenue                    ($4,200,000)     │   │
│ │ Gross Profit                       $8,200,000       │   │
│ │ Operating Expenses                 ($5,800,000)     │   │
│ │   R&D                              ($2,400,000)     │   │
│ │   Sales & Marketing                ($1,800,000)     │   │
│ │   G&A                              ($1,600,000)     │   │
│ │ Operating Income                   $2,400,000       │   │
│ │ Other Income/(Expense)             ($200,000)       │   │
│ │ Net Income                         $2,200,000       │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│ Period Comparison: [Current] [vs Last Quarter] [vs Last Year]│
│                                                          │
│ AI Footnote Draft: "Revenue increased 12% driven by..."  │
└──────────────────────────────────────────────────────────┘
```

---

### 3.13 Journal Entries

#### 3.13.1 Journal Entry List

**Page Information**
| Field | Value |
|---|---|
| Page Name | Journal Entries |
| Route | `/journal-entries` |
| Purpose | View, create, approve, and post journal entries |
| Primary Roles | Accountant, Controller |
| Access | Accountant+ roles |
| Entry Points | Sidebar: Accounting > Journal Entries |
| Related Pages | Journal Entry Detail, General Ledger |

**Table Columns:**
| Column | Type |
|---|---|
| JE Number | link |
| Date | date |
| Description | text |
| Total Debits | currency |
| Total Credits | currency |
| Status | status badge (Draft, Pending Approval, Posted, Reversed) |
| Created By | user avatar |
| Actions | menu |

**Create Journal Entry Drawer:**
```text
┌──────────────────────────────────────────────┐
│ New Journal Entry                    [X] [Save]│
│──────────────────────────────────────────────│
│ Date: [06/30/2026]                           │
│ Description: [___________________________]   │
│ Entity: [US Corp ▼]                          │
│──────────────────────────────────────────────│
│ Lines:                                       │
│ ┌────────────────────────────────────────┐   │
│ │ Account │ Debit │ Credit │ Description│   │
│ │────────────────────────────────────────│   │
│ │ 4010    │ $10K  │ —      │ Revenue    │   │
│ │ 5010    │ —     │ $10K   │ Deferred   │   │
│ │ [Add line]                            │   │
│ └────────────────────────────────────────┘   │
│ Total: $10,000        $10,000               │
│ ✅ Balanced                                  │
│──────────────────────────────────────────────│
│ Attachments: [Drop files or browse]          │
│──────────────────────────────────────────────│
│ AI Validation: ✓ Entry is balanced           │
│               ✓ Account types are correct    │
│               ⚠ Amount is > 95th percentile  │
│──────────────────────────────────────────────│
│ [Save as Draft] [Submit for Approval]        │
└──────────────────────────────────────────────┘
```

---

### 3.14 General Ledger

#### 3.14.1 General Ledger Dashboard

**Page Information**
| Field | Value |
|---|---|
| Page Name | General Ledger |
| Route | `/gl` |
| Purpose | View ledger accounts, period management, account balances |
| Primary Roles | Controller, Accountant |
| Access | Controller+ roles |
| Entry Points | Sidebar: Accounting > General Ledger |
| Related Pages | Chart of Accounts, Journal Entries, Financial Statements |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ General Ledger                                           │
│ [Period: Jun 2026 ▼] [Entity: All ▼]                     │
├──────────────────────────────────────────────────────────┤
│ Period Status: ● Open  |  Close Date: Jul 15, 2026       │
│ Close Progress: ████████░░ 80%  [View Checklist]         │
├──────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐   │
│ │ Search accounts by code, name...              🔍   │   │
│ │                                                    │   │
│ │ Account Hierarchy:                                 │   │
│ │ 📁 Assets (1000-1999)                  $15.2M      │   │
│ │   📁 Current Assets                    $8.1M       │   │
│ │     💰 Cash & Equivalents              $3.45M      │   │
│ │     💰 Accounts Receivable             $2.8M       │   │
│ │     💰 Inventory                       $1.85M      │   │
│ │   📁 Fixed Assets                      $7.1M       │   │
│ │ 📁 Liabilities (2000-2999)             $8.4M       │   │
│ │ 📁 Equity (3000-3999)                  $6.8M       │   │
│ │ 📁 Revenue (4000-4999)                 $12.4M      │   │
│ │ 📁 Expenses (5000-5999)                $10.2M      │   │
│ └────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────┤
│ Account Detail (on click):                               │
│ Account: 1100 — Cash & Equivalents                       │
│ ┌───────┬────────┬────────┬─────────┬────────┐          │
│ │ Date  │ Source │ Debit  │ Credit  │ Balance│          │
│ │───────│────────│────────│─────────│────────│          │
│ │06/30  │ JE-892 │ —      │ $50,000 │ $3.45M │          │
│ │06/29  │TXN-4821│$120,000│ —       │ $3.50M │          │
│ └───────┴────────┴────────┴─────────┴────────┘          │
└──────────────────────────────────────────────────────────┘
```

---

### 3.15 Chart of Accounts

#### 3.15.1 Chart of Accounts

**Page Information**
| Field | Value |
|---|---|
| Page Name | Chart of Accounts |
| Route | `/gl/chart-of-accounts` |
| Purpose | Define and manage account hierarchy and mappings |
| Primary Roles | Controller, Admin |
| Access | Controller+, Admin |
| Entry Points | Sidebar: Accounting > Chart of Accounts |
| Related Pages | General Ledger, Settings |

**Layout:**
Tree view (expandable/collapsible) + table. Accounts grouped by category. Inline editing for codes and names. Drag-drop for hierarchy reorganization.

---

### 3.16 Fixed Assets

#### 3.16.1 Fixed Asset Register

**Page Information**
| Field | Value |
|---|---|
| Page Name | Fixed Assets |
| Route | `/fixed-assets` |
| Purpose | Manage asset register, depreciation, disposals |
| Primary Roles | Accountant, Controller |
| Access | Accountant+ roles |
| Entry Points | Sidebar: Accounting > Fixed Assets |
| Related Pages | Asset Detail, General Ledger |

**Table Columns:**
| Asset ID | Name | Category | Cost | NBV | Depreciation Method | In-Service Date | Status |
|---|---|---|---|---|---|---|---|
| link | text | badge | currency | currency | text | date | status badge |

**AI Features:**
- "Check depreciation" — AI flags missing or unusual depreciation
- "Suggest asset disposal" — identifies fully depreciated assets

---

### 3.17 Accounts Payable

#### 3.17.1 AP Dashboard

**Page Information**
| Field | Value |
|---|---|
| Page Name | Accounts Payable |
| Route | `/ap` |
| Purpose | Central AP operations hub |
| Primary Roles | AP Clerk, AP Manager |
| Access | AP+ roles |
| Entry Points | Sidebar: AP/AR > Accounts Payable |
| Related Pages | Invoices, Payments, Vendors |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Accounts Payable                                         │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│ Total AP │ Due <30 │Due 30-60│Due 60-90│ Due >90       │
│ $2.8M    │ $1.2M   │ $890K   │ $450K   │ $260K         │
├──────────┴──────────┴──────────┴──────────┴──────────────┤
│ AP Aging [Bar chart: aging buckets]                       │
├──────────────────────────────────────────────────────────┤
│ Pending Invoices by Vendor                                │
│ [Table: Vendor, Count, Total Amount, Days Outstanding]   │
├──────────────────────────────────────────────────────────┤
│ AI Insight: "3 invoices eligible for early payment       │
│ discount. Potential savings: $4,200."                    │
└──────────────────────────────────────────────────────────┘
```

---

### 3.18 Accounts Receivable

#### 3.18.1 AR Dashboard

**Page Information**
| Field | Value |
|---|---|
| Page Name | Accounts Receivable |
| Route | `/ar` |
| Purpose | Central AR operations hub |
| Primary Roles | AR Clerk, AR Manager |
| Access | AR+ roles |
| Entry Points | Sidebar: AP/AR > Accounts Receivable |
| Related Pages | Customers, Invoices (AR), Collections |

**Layout:**
Similar to AP but with AR-specific KPIs: Total AR, DSO, Aging buckets, Collection effectiveness.

---

### 3.19 Vendors

#### 3.19.1 Vendor Directory

**Page Information**
| Field | Value |
|---|---|
| Page Name | Vendors |
| Route | `/vendors` |
| Purpose | Manage vendor profiles, risk, contracts |
| Primary Roles | Procurement, AP, Compliance |
| Access | Procurement+, AP+ |
| Entry Points | Sidebar: AP/AR > Vendors |
| Related Pages | Vendor Detail, Invoices, Payments |

**Table Columns:**
| Vendor Name | Category | Status | Risk Level | Total Spend | Payment Terms | Last Invoice | Actions |
|---|---|---|---|---|---|---|---|
| link + avatar | badge | status badge | risk badge (high/medium/low) | currency | text | date | menu |

**Vendor Detail Drawer:**
```text
┌──────────────────────────────────────────────┐
│ ABC Corp                                 [X] │
│──────────────────────────────────────────────│
│ Status: ● Active   Risk: 🔴 High             │
│──────────────────────────────────────────────│
│ Tax ID: XX-XXXXXXX                           │
│ Category: Technology Services                 │
│ Payment Terms: Net 30                        │
│ Total Spend YTD: $1,200,000                   │
│──────────────────────────────────────────────│
│ Bank Accounts:                               │
│ • Chase ●●●●1234 (Verified)                  │
│──────────────────────────────────────────────│
│ Contracts:                                   │
│ • Master Agreement (Dec 2026)                │
│ • SOW-2024-089 (Active)                      │
│──────────────────────────────────────────────│
│ Risk Factors:                                │
│ • Sanctions check: ✓ Passed                  │
│ • Payment history: ✓ On time                 │
│ • Concentration: ⚠ 15% of total spend        │
│──────────────────────────────────────────────│
│ Recent Invoices:                             │
│ • INV-2024-0892 — $12,400 — Paid             │
│ • INV-2024-0891 — $8,900 — Pending           │
│──────────────────────────────────────────────│
│ AI Risk Memo: "ABC Corp shows elevated risk  │
│ due to 15% spend concentration..."           │
│──────────────────────────────────────────────│
│ [Edit] [Add Contract] [View All Invoices]   │
└──────────────────────────────────────────────┘
```

---

### 3.20 Customers

#### 3.20.1 Customer Directory

Similar layout to Vendors but with AR-specific fields: credit limit, ARR, health score, DSO, churn risk.

---

### 3.21 Procurement

#### 3.21.1 Procurement Dashboard

**Page Information**
| Field | Value |
|---|---|
| Page Name | Procurement |
| Route | `/procurement` |
| Purpose | Manage requisitions, RFQs, vendor selection |
| Primary Roles | Procurement Lead, Buyer |
| Access | Procurement+ roles |
| Entry Points | Sidebar: Procurement > Procurement |
| Related Pages | Purchase Orders, Vendors |

---

### 3.22 Purchase Orders

#### 3.22.1 Purchase Order List

**Page Information**
| Field | Value |
|---|---|
| Page Name | Purchase Orders |
| Route | `/procurement/purchase-orders` |
| Purpose | Create, approve, and track POs |
| Primary Roles | Procurement, Budget Manager |
| Access | Procurement+ roles |
| Entry Points | Sidebar: Procurement > Purchase Orders |
| Related Pages | Procurement, Vendors, Invoices |

---

### 3.23 Fraud Center

#### 3.23.1 Fraud Alert Dashboard

**Page Information**
| Field | Value |
|---|---|
| Page Name | Fraud Center |
| Route | `/fraud-center` |
| Purpose | Detect, investigate, and resolve fraud alerts |
| Primary Roles | Fraud Analyst, Controller, Treasurer |
| Access | Fraud+, Controller+, Treasurer |
| Entry Points | Sidebar: Risk & Compliance > Fraud Center |
| Related Pages | Fraud Case Detail, Payments, Vendors |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Fraud Center                                  [AI Detect] │
├──────────┬──────────┬──────────┬──────────────────────────┤
│ Critical │ High     │ Medium   │ Low                     │
│ 3        │ 8        │ 12       │ 25                      │
│ ▲ 2 new  │ ─        │ ▼ 3     │ ─                       │
├──────────┴──────────┴──────────┴──────────────────────────┤
│ Alerts by Type [Donut chart]                              │
│ Duplicate: 45% | Anomaly: 30% | Pattern: 15% | Other: 10%│
├──────────────────────────────────────────────────────────┤
│ Active Alerts (sorted by severity)                        │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 🔴 CRITICAL │ Duplicate Payment │ $50,000 │ 10m ago │ │
│ │    Vendor: ABC Corp │ Invoice: INV-2024-0892        │ │
│ │    [Investigate] [Dismiss] [AI Explain]              │ │
│ ├──────────────────────────────────────────────────────┤ │
│ │ 🟡 HIGH │ Payment Pattern │ $12,400 │ 1h ago       │ │
│ │    New vendor + rush payment + amount >$10K          │ │
│ │    [Investigate] [Dismiss] [AI Explain]              │ │
│ ├──────────────────────────────────────────────────────┤ │
│ │ 🟡 MEDIUM │ Amount Anomaly │ $89,000 │ 3h ago      │ │
│ │    Unusual amount for this vendor category            │ │
│ │    [Investigate] [Dismiss] [AI Explain]              │ │
│ └──────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│ AI Insight: "3 critical alerts require investigation.    │
│ Duplicate payment detection prevented $50K loss."        │
└──────────────────────────────────────────────────────────┘
```

**Fraud Case Investigation Drawer:**
```text
┌──────────────────────────────────────────────┐
│ Case: FC-2024-0892                      [X]  │
│──────────────────────────────────────────────│
│ Severity: 🔴 CRITICAL                       │
│ Status: ● Under Investigation               │
│──────────────────────────────────────────────│
│ Timeline:                                    │
│ ┌────────────────────────────────────────┐   │
│ │ 🚩 Alert Created — 10m ago            │   │
│ │ 📋 Case Opened — 8m ago               │   │
│ │ 🔍 Investigation — In progress         │   │
│ └────────────────────────────────────────┘   │
│──────────────────────────────────────────────│
│ Related Transactions:                        │
│ • TXN-4821 — $50,000 — Jun 30              │
│ • TXN-4820 — $50,000 — Jun 29 (duplicate?) │
│──────────────────────────────────────────────│
│ Vendor: ABC Corp                            │
│ • Bank changed Jun 28                       │
│ • 3 payments in 7 days (avg 1/month)        │
│──────────────────────────────────────────────│
│ AI Analysis:                                 │
│ "High confidence duplicate (92%). Both      │
│ payments have same vendor, amount, and...   │
│ [View Full Analysis]                        │
│──────────────────────────────────────────────│
│ [Mark as True Positive] [False Positive]    │
│ [Hold Payment] [Escalate]                   │
└──────────────────────────────────────────────┘
```

---

### 3.24 Compliance Center

#### 3.24.1 Compliance Dashboard

**Page Information**
| Field | Value |
|---|---|
| Page Name | Compliance Center |
| Route | `/compliance-center` |
| Purpose | Manage controls, issues, evidence, certifications |
| Primary Roles | Compliance Officer, Auditor, Controller |
| Access | Compliance+, Auditor, Controller+ |
| Entry Points | Sidebar: Risk & Compliance > Compliance Center |
| Related Pages | Audit Center, Evidence Rooms |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Compliance Center                                        │
├──────────────┬──────────────┬──────────────┬─────────────┤
│ Controls     │ Passing      │ Issues       │ Certifications│
│ 245          │ 92%          │ 18           │ 3             │
│ ▲ 5 this qtr │ ▲ 2%         │ ▼ 4          │ 2 active      │
├──────────────┴──────────────┴──────────────┴─────────────┤
│ Control Pass Rate by Framework                            │
│ [Horizontal bar chart: SOC2 94%, ISO 27001 89%, SOX 96%] │
├──────────────────────────────────────────────────────────┤
│ Open Issues by Severity                                   │
│ 🔴 Critical: 2  🟡 High: 5  🟠 Medium: 8  🟢 Low: 3    │
├──────────────────────────────────────────────────────────┤
│ Recent Issues                                             │
│ [Table: Issue, Control, Severity, Owner, Due, Status]    │
├──────────────────────────────────────────────────────────┤
│ AI Recommendation: "2 controls have >90% failure rate.   │
│ Recommend remediation plan within 7 days."               │
└──────────────────────────────────────────────────────────┘
```

---

### 3.25 Audit Center

#### 3.25.1 Audit Center

**Page Information**
| Field | Value |
|---|---|
| Page Name | Audit Center |
| Route | `/audit-center` |
| Purpose | View audit logs, evidence, export audit reports |
| Primary Roles | Auditor, Admin |
| Access | Auditor, Admin roles |
| Entry Points | Sidebar: Risk & Compliance > Audit Center |
| Related Pages | Compliance Center, Evidence Rooms |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Audit Center                                  [Export Logs]│
│                                                          │
│ [Actor] [Action] [Resource] [Date Range] [Search...]     │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Timestamp    │ Actor  │ Action │ Resource  │ Details │ │
│ │──────────────│────────│────────│───────────│─────────│ │
│ │ Jun 30 10:23 │ John D │ UPDATE │ INV-0892  │ Changed │ │
│ │ Jun 30 09:15 │ Sarah  │ CREATE │ PAY-042   │ New     │ │
│ │ Jun 30 08:00 │ System │ SYNC   │ Plaid     │ 1,234   │ │
│ │ Jun 29 23:00 │ AI     │ ANALYZE│ FCST-042  │ Model   │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ [< Prev] 1 2 3 ... 500 [Next >]  Showing 1-20 of 9,847 │
└──────────────────────────────────────────────────────────┘
```

---

### 3.26 Workflow Builder

#### 3.26.1 Workflow Builder

**Page Information**
| Field | Value |
|---|---|
| Page Name | Workflow Builder |
| Route | `/workflow-builder` |
| Purpose | Create and manage no-code workflows |
| Primary Roles | Admin, Ops, Controller |
| Access | Admin, Workflow Admin roles |
| Entry Points | Sidebar: Automation > Workflow Builder |
| Related Pages | Workflow Execution, Rule Engine |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Workflow Builder      [Publish] [Test] [Versions ▼]      │
├──────────────────────────────────────────────────────────┤
│ ┌────────────┐  ┌────────────────────────────────────┐  │
│ │ Triggers   │  │ Canvas                              │  │
│ │────────────│  │                                     │  │
│ │ 📋 Invoice │  │  [Invoice Uploaded]                │  │
│ │   Uploaded │  │         │                          │  │
│ │ 💰 Payment │  │    [Amount > $10K?]                │  │
│ │   Created  │  │    /          \                    │  │
│ │ 📅 Schedule│  │  Yes          No                   │  │
│ │   Daily    │  │   │            │                    │  │
│ │ 📊 Vendor  │  │ [Route to VP] [Auto-Approve]       │  │
│ │   Risk Chg │  │   │            │                    │  │
│ └────────────┘  │   │       [Notify AP Team]         │  │
│                 │   │            │                    │  │
│ ┌────────────┐  │ [VP Approves?] ── No ── [Notify Creator]│
│ │ Actions    │  │   │ Yes                              │  │
│ │────────────│  │ [Schedule Payment]                   │  │
│ │ ✅ Approve │  └────────────────────────────────────┘  │
│ │ ❌ Reject  │                                          │
│ │ 🔔 Notify  │                                          │
│ │ ⏸ Hold     │                                          │
│ │ 📋 Task    │                                          │
│ └────────────┘                                          │
├──────────────────────────────────────────────────────────┤
│ Properties Panel (on node click)                         │
│ Condition: Amount > $10,000                              │
│ [Edit Condition] [Delete Node]                           │
└──────────────────────────────────────────────────────────┘
```

**Canvas Components:**
| Component | Description |
|---|---|
| Trigger Node | Green circle. Event source. Configurable parameters. |
| Condition Node | Diamond shape. AND/OR logic. Nested conditions. |
| Action Node | Blue rectangle. Approve, Notify, Hold, Task, Webhook. |
| Human Approval Node | Orange rectangle. Assignee, SLA, escalation path. |
| AI Node | Purple rectangle. AI summarize, classify, recommend. |
| Connector Lines | Arrows with direction. Click to configure. |

---

### 3.27 Rule Engine

#### 3.27.1 Rule Engine Dashboard

**Page Information**
| Field | Value |
|---|---|
| Page Name | Rule Engine |
| Route | `/rule-engine` |
| Purpose | Create and manage finance policy rules |
| Primary Roles | Controller, Admin, Compliance |
| Access | Controller+, Admin |
| Entry Points | Sidebar: Automation > Rule Engine |
| Related Pages | Workflow Builder, Fraud Rules |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Rule Engine                                   [Create Rule]│
│                                                          │
│ [Active] [Inactive] [Draft] [All]                        │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Rule Name │ Scope   │ Status │ Hits │ Override │ Last │ │
│ │───────────│─────────│────────│──────│──────────│──────│ │
│ │ HighValue │ Global  │ ● Active│1,234│ 2.3%     │ Jun30│ │
│ │ NewVendor │ AP      │ ● Active│ 89  │ 15.1%    │ Jun29│ │
│ │ Duplicate │ Payments│ ● Active│ 456 │ 0.5%     │ Jun30│ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ Rule Detail (on click):                                  │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ IF invoice.amount > 1,000,000                         │ │
│ │ AND vendor.risk_level IN ["High", "Critical"]         │ │
│ │ THEN require_approval(role = "CFO")                   │ │
│ │ AND hold_payment()                                    │ │
│ │ AND notify(channel = "Slack", group = "Finance Risk") │ │
│ │                                                      │ │
│ │ [Edit] [Disable] [Test] [View Analytics]             │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

### 3.28 Notifications

#### 3.28.1 Notification Center

**Page Information**
| Field | Value |
|---|---|
| Page Name | Notifications |
| Route | `/notifications` |
| Purpose | View and manage all notifications |
| Primary Roles | All users |
| Access | All authenticated users |
| Entry Points | Bell icon in top bar → "View all" |
| Related Pages | Settings (Notification Preferences) |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Notifications                              [Mark All Read]│
│ [All] [Unread] [@Mentions] [Alerts] [Approvals]          │
├──────────────────────────────────────────────────────────┤
│ Today                                                     │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 🔴 Approval Required │ INV-0892 needs your approval │ │
│ │ 10:23 AM            │ [View] [Approve] [Reject]     │ │
│ ├──────────────────────────────────────────────────────┤ │
│ │ 🟡 Fraud Alert │ Duplicate payment detected         │ │
│ │ 09:15 AM        │ [View Alert] [Dismiss]            │ │
│ ├──────────────────────────────────────────────────────┤ │
│ │ 🔵 Sync Complete │ Bank sync completed — 1,234 txns │ │
│ │ 08:00 AM        │ [View Details]                    │ │
│ └──────────────────────────────────────────────────────┘ │
│ Yesterday                                                 │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ ✅ Approved │ Payment batch B-041 approved by Sarah  │ │
│ │ 3:45 PM     │ [View Batch]                          │ │
│ └──────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│ [Load More]                                               │
└──────────────────────────────────────────────────────────┘
```

---

### 3.29 Reports

#### 3.29.1 Report Library

**Page Information**
| Field | Value |
|---|---|
| Page Name | Reports |
| Route | `/reports` |
| Purpose | Browse, create, schedule, and share reports |
| Primary Roles | All finance roles |
| Access | Finance+ roles |
| Entry Points | Sidebar: Planning > Reports |
| Related Pages | Report Builder, Report Viewer, Dashboard |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Reports                                     [New Report]  │
│                                                          │
│ [All Reports] [Saved] [Scheduled] [Favorites] [Templates]│
│                                                          │
│ Search: [Search reports...                         🔍]  │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 📊 P&L Statement — Q2 2026          ● Scheduled     │ │
│ │   Generated: Jun 30, 2026 | Format: PDF             │ │
│ │   [View] [Download] [Schedule] [Share] [⋮]          │ │
│ ├──────────────────────────────────────────────────────┤ │
│ │ 📊 AR Aging Report — June 2026       ● Favorite      │ │
│ │   Generated: Jun 30, 2026 | Format: XLSX            │ │
│ │   [View] [Download] [Schedule] [Share] [⋮]          │ │
│ ├──────────────────────────────────────────────────────┤ │
│ │ 📊 Board Pack — Q2 2026           ● Recent          │ │
│ │   Generated: Jun 29, 2026 | Format: PDF             │ │
│ │   [View] [Download] [Schedule] [Share] [⋮]          │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ AI: "Generate a CFO pack for Q2 2026" [Ask AI]          │
└──────────────────────────────────────────────────────────┘
```

---

### 3.30 Document Center

#### 3.30.1 Document Center

**Page Information**
| Field | Value |
|---|---|
| Page Name | Documents |
| Route | `/documents` |
| Purpose | Upload, search, and manage financial documents |
| Primary Roles | All roles (scoped access) |
| Access | Authenticated users |
| Entry Points | Sidebar: Workspace > Documents |
| Related Pages | Document Viewer, Evidence Rooms, Settings |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Document Center                           [Upload] [AI OCR]│
│                                                          │
│ [All] [Invoices] [Contracts] [Statements] [Reports]      │
│                                                          │
│ Grid View | List View                                    │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐             │
│ │📄      │ │📄      │ │📄      │ │📄      │             │
│ │Invoice │ │Contract│ │Statement│ │Report  │             │
│ │8923    │ │ABC Corp│ │Chase Jun│ │Q2 Pack │             │
│ │Jun 30  │ │Dec 2026│ │30 pages│ │24 pages│             │
│ │PDF 2MB │ │PDF 1MB │ │PDF 5MB │ │PDF 8MB │             │
│ └────────┘ └────────┘ └────────┘ └────────┘             │
│                                                          │
│ AI: "Ask a question about your documents" [Ask AI]       │
└──────────────────────────────────────────────────────────┘
```

---

### 3.31 AI Copilot

#### 3.31.1 AI Copilot Chat

**Page Information**
| Field | Value |
|---|---|
| Page Name | AI Copilot |
| Route | `/ai-copilot` |
| Purpose | Conversational AI assistant for all financial data |
| Primary Roles | All users (role-scoped data access) |
| Access | All authenticated users (with AI credits) |
| Entry Points | Sidebar: AI > AI Copilot, FAB on every page |
| Related Pages | AI Prompt Library, AI Templates, AI Agent Monitor |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ AI Copilot                         [New Chat] [History ▼]│
├──────────────────────────────┬───────────────────────────┤
│ Conversations                 │ Chat Window               │
│ ────────────────────────────  │                            │
│ 📝 CFO Summary — Jun 30      │ ┌──────────────────────┐  │
│ 📝 Variance Analysis — Jun 29│ │ Welcome! I'm your    │  │
│ 📝 Fraud Investigation —...  │ │ FinOps AI Copilot.   │  │
│ 📝 Cash Forecast — Jun 28    │ │ How can I help you   │  │
│                              │ │ today?               │  │
│ [New Chat]                   │ └──────────────────────┘  │
│                              │                            │
│ Suggested Prompts:            │ ┌──────────────────────┐  │
│ ┌─────────────────────────┐   │ │ User: Show me this   │  │
│ │ "Summarize this month's │   │ │ month's P&L variance │  │
│ │ financial performance"  │   │ └──────────────────────┘  │
│ └─────────────────────────┘   │                            │
│ ┌─────────────────────────┐   │ ┌──────────────────────┐  │
│ │ "Any suspicious         │   │ │ AI: Here's your P&L  │  │
│ │ payments this month?"   │   │ │ variance analysis... │  │
│ └─────────────────────────┘   │ │ Revenue: +12% vs     │  │
│ ┌─────────────────────────┐   │ │ budget, driven by... │  │
│ │ "Create CFO board pack  │   │ │                     │  │
│ │ for Q2"                 │   │ │ Sources: GL-2024...  │  │
│ └─────────────────────────┘   │ │ Confidence: High     │  │
│                               │ │ [👍] [👎] [Copy]    │  │
│ Agent Status (bottom):        │ └──────────────────────┘  │
│ ● Supervisor ● Finance ● Fraud│                            │
│                               │ ┌──────────────────────┐  │
│                               │ │ [Type a message...]  │  │
│                               │ │ [Send] [🎤] [📎]    │  │
│                               │ └──────────────────────┘  │
└──────────────────────────────┴───────────────────────────┘
```

---

### 3.32 Organization & Users

#### 3.32.1 User Management

**Page Information**
| Field | Value |
|---|---|
| Page Name | Users |
| Route | `/organization/users` |
| Purpose | Manage team members, roles, access |
| Primary Roles | Admin |
| Access | Admin role |
| Entry Points | Sidebar: Organization > Users |
| Related Pages | Roles, Settings, Billing |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Users                                       [Invite User] │
│                                                          │
│ [Active] [Pending] [Suspended] [All]                    │
│                                                          │
│ Search: [Search by name or email...                🔍]  │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ User          │ Email           │ Role     │ Status  │ │
│ │───────────────│─────────────────│──────────│─────────│ │
│ │ 👤 John Doe  │ john@co.com     │ Admin    │ ● Active│ │
│ │ 👤 Sarah     │ sarah@co.com    │ CFO      │ ● Active│ │
│ │ 👤 Mike      │ mike@co.com     │ Controllr│ 🟡Pending│ │
│ │ 👤 Jane      │ jane@co.com     │ Acct.    │ ○ Invited│ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ AI: "2 users haven't logged in for 30+ days"             │
└──────────────────────────────────────────────────────────┘
```

**Invite User Dialog:**
```text
┌──────────────────────────────────────┐
│ Invite Users                     [X] │
│──────────────────────────────────────│
│ Email addresses (comma separated):   │
│ [_____________________________]      │
│                                      │
│ Role: [Select Role ▼]                │
│                                      │
│ Message (optional):                  │
│ [_____________________________]      │
│                                      │
│ [Send Invitations] [Cancel]          │
└──────────────────────────────────────┘
```

---

### 3.33 Billing & Subscription

#### 3.33.1 Billing Overview

**Page Information**
| Field | Value |
|---|---|
| Page Name | Billing |
| Route | `/billing` |
| Purpose | View plan, usage, invoices, manage subscription |
| Primary Roles | Admin, Billing Admin |
| Access | Admin, Billing roles |
| Entry Points | Sidebar: Organization > Billing |
| Related Pages | Usage, Invoices, Settings |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Billing & Subscription                  [Manage Plan ▼]   │
├──────────┬──────────┬──────────┬──────────────────────────┤
│ Plan     │ Users    │ AI Credits│ Next Invoice            │
│ Enterprise│42/50    │ 45,892/   │ Jul 1, 2026 — $4,999   │
│          │ seats    │ 100K     │                          │
├──────────┴──────────┴──────────┴──────────────────────────┤
│ Current Plan: Enterprise                                   │
│ Features:                                                  │
│ ✓ 50 users included (42 active)                           │
│ ✓ 100K AI credits/month                                   │
│ ✓ Unlimited transactions                                   │
│ ✓ SSO + MFA                                                │
│ ✓ 7-year audit retention                                  │
│ ✓ Slack + Phone support                                    │
├──────────────────────────────────────────────────────────┤
│ Usage This Month                                           │
│ Users: ████████████████████████░░░░ 42/50 (84%)          │
│ AI Credits: ██████████████████░░░░░░░░ 45,892/100K (46%)│
│ Transactions: 142,389 (Unlimited)                         │
│ Integrations: 12/Unlimited                                │
├──────────────────────────────────────────────────────────┤
│ Recent Invoices                                            │
│ [Table: Date, Amount, Status, Download]                   │
├──────────────────────────────────────────────────────────┤
│ AI Spend Forecast: "Estimated next bill: $5,247"         │
└──────────────────────────────────────────────────────────┘
```

---

### 3.34 Developer Portal

#### 3.34.1 Developer Center

**Page Information**
| Field | Value |
|---|---|
| Page Name | Developer Center |
| Route | `/developer` |
| Purpose | Manage API keys, webhooks, view API docs |
| Primary Roles | Developer, Admin |
| Access | Developer, Admin roles |
| Entry Points | Sidebar: Developer > API Keys |
| Related Pages | Webhooks, API Explorer, Logs |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Developer Center                          [Create API Key]│
│                                                          │
│ [API Keys] [Webhooks] [API Docs] [Logs] [Rate Limits]   │
│                                                          │
│ API Keys:                                                 │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Name      │ Key          │ Created   │ Last Used│Actions│
│ │───────────│──────────────│───────────│──────────│──────│
│ │ Production│ sk_prod_...  │ Jun 1     │ 2 min ago│ [⋮] │
│ │ Staging   │ sk_stag_...  │ Jun 1     │ 1h ago   │ [⋮] │
│ │ Testing   │ sk_test_...  │ Jun 15    │ Never    │ [⋮] │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ Rate Limits:                                              │
│ Current: 1,234 / 10,000 requests per hour                │
│ ████████████░░░░░░░░░░ 12%                               │
└──────────────────────────────────────────────────────────┘
```

---

### 3.35 Integrations

#### 3.35.1 Integration Marketplace

**Page Information**
| Field | Value |
|---|---|
| Page Name | Integrations |
| Route | `/integrations` |
| Purpose | Browse, install, and manage connectors |
| Primary Roles | Admin, Developer |
| Access | Admin, Developer roles |
| Entry Points | Sidebar: Developer > Integrations |
| Related Pages | Developer Center, Settings |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Integrations                             [Browse Marketplace]│
│                                                          │
│ [Installed] [Available] [Updates] [Health]               │
│                                                          │
│ Search: [Search connectors...                      🔍]  │
│                                                          │
│ Categories:                                              │
│ [All] [ERP] [Banking] [Accounting] [Payments] [Storage]  │
│                                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ │ QuickBooks│ │   Plaid  │ │  Stripe  │ │   Slack  │     │
│ │ ● Connected│ │ ● Connected│ │ ● Connected│ │ ○ Available│
│ │ Last sync:│ │Last sync:│ │Last sync:│ │          │     │
│ │ 10 min ago│ │ 5 min ago│ │ 1h ago   │ │          │     │
│ │ [Configure]│ │[Configure]│ │[Configure]│ │ [Install]│     │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                          │
│ Sync Health Dashboard:                                   │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Connector    │ Status │ Records │ Errors │ Last Sync │ │
│ │──────────────│────────│─────────│────────│───────────│ │
│ │ QuickBooks   │ ● Sync │ 1,234   │ 0      │ 10m ago   │ │
│ │ Plaid        │ ● Sync │ 5,678   │ 2      │ 5m ago    │ │
│ │ Stripe       │ ⚠ Error│ —       │ 1      │ 1h ago    │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

### 3.36 Settings

#### 3.36.1 Settings

**Page Information**
| Field | Value |
|---|---|
| Page Name | Settings |
| Route | `/settings` |
| Purpose | Configure organization preferences, security, branding |
| Primary Roles | Admin |
| Access | Admin role |
| Entry Points | Sidebar: Organization > Settings, User menu |
| Related Pages | Users, Billing, Notifications |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Settings                                                 │
├──────────────────────────────────────────────────────────┤
│ [General] [Security] [Notifications] [Branding] [Data]   │
│ [AI Settings] [API] [Localization]                       │
├──────────────────────────────────────────────────────────┤
│ General:                                                  │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Organization Name: [FinOps AI Corp            ]      │ │
│ │ Timezone: [America/New_York ▼]                      │ │
│ │ Base Currency: [USD ▼]                              │ │
│ │ Fiscal Year Start: [January 1 ▼]                    │ │
│ │ Logo: [Upload Image] [Remove]                       │ │
│ │                                                      │ │
│ │ [Save Changes]                                       │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ Security:                                                 │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Password Policy:                                      │ │
│ │   Min Length: [12]                                   │ │
│ │   Require MFA: [All Users ▼]                         │ │
│ │   Session Timeout: [60 minutes ▼]                    │ │
│ │                                                      │ │
│ │ IP Allowlist: [192.168.1.0/24] [Add IP]             │ │
│ │                                                      │ │
│ │ [Save Changes]                                       │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

### 3.37 System Health & Monitoring

#### 3.37.1 System Health Dashboard

**Page Information**
| Field | Value |
|---|---|
| Page Name | System Health |
| Route | `/system-health` |
| Purpose | Monitor system status, jobs, queues, API health |
| Primary Roles | Admin |
| Access | Admin role |
| Entry Points | Sidebar: System > System Health |
| Related Pages | Logs, Feature Flags, Admin Console |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ System Health                                            │
├────────┬──────────┬──────────┬──────────┬────────────────┤
│ API    │ Database │ Queue    │ Workers  │ Integrations   │
│ ● 200ms│ ● 5ms    │ ● 0      │ ● 12/12 │ ⚠ 1 degraded  │
├────────┴──────────┴──────────┴──────────┴────────────────┤
│ Active Jobs                                              │
│ [Table: Job ID, Type, Status, Progress, Started, Actions]│
├──────────────────────────────────────────────────────────┤
│ Recent Incidents                                         │
│ [Timeline: incidents with status, duration, resolution]  │
├──────────────────────────────────────────────────────────┤
│ AI Usage Monitoring                                      │
│ [Chart: tokens used, requests, cost per day]             │
└──────────────────────────────────────────────────────────┘
```

---

### 3.38 Admin Console

#### 3.38.1 Admin Portal

**Page Information**
| Field | Value |
|---|---|
| Page Name | Admin Console |
| Route | `/admin` |
| Purpose | Super-admin tenant management, support tools |
| Primary Roles | Super Admin |
| Access | Super Admin role only |
| Entry Points | Sidebar: System > Admin Console |
| Related Pages | System Health, All modules (impersonation) |

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│ Admin Console                                            │
├──────────────────────────────────────────────────────────┤
│ [Tenants] [Users] [Support] [Configuration] [Audit]     │
├──────────────────────────────────────────────────────────┤
│ Tenant Management:                                       │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Tenant       │ Plan       │ Users │ Status │ Actions │ │
│ │──────────────│────────────│───────│────────│─────────│ │
│ │ Acme Corp    │ Enterprise │ 42    │ ● Active│ [⋮]    │ │
│ │ Beta Inc    │ Growth     │ 18    │ ● Active│ [⋮]    │ │
│ │ Gamma LLC   │ Starter    │ 3     │ ⚠ Susp. │ [⋮]    │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ [Impersonate Tenant] [Broadcast Message]                 │
└──────────────────────────────────────────────────────────┘
```

---

### 3.39 Global UI Surfaces

#### 3.39.1 Command Palette

| Property | Specification |
|---|---|
| **Trigger** | Cmd+K (Mac) / Ctrl+K (Windows) |
| **Overlay** | Semi-transparent backdrop, centered modal |
| **Width** | 640px max-width |
| **Search** | Auto-focused. Match on page names, actions, recent items. |
| **Sections** | Pages, Actions, Recent, AI Suggestions |
| **Navigation** | Arrow keys to select, Enter to execute, Escape to close |
| **Results** | Icon + Title + Description + Keyboard shortcut hint |

**Example Commands:**
- "Create invoice" → Opens upload dialog
- "Run report" → Opens report builder
- "Go to dashboard" → Navigates to /dashboard
- "Ask AI about cash position" → Opens AI Copilot with context
- "Export transactions" → Triggers export of current view

#### 3.39.2 Global Search

| Property | Specification |
|---|---|
| **Trigger** | Cmd+Shift+F or "/" in top bar |
| **Scope** | Full-text across transactions, invoices, vendors, customers, documents, reports |
| **Results** | Categories with "View all" links. Top 5 results per category. |
| **Recent** | Last 10 searches stored locally |
| **Keyboard** | Arrow keys + Enter to select |
| **AI Integration** | "Ask AI about [search term]" at bottom of results |

#### 3.39.3 AI Action FAB (Floating Action Button)

| Property | Specification |
|---|---|
| **Position** | Bottom-right corner, 24px from edge |
| **Icon** | Sparkles or AI brain icon |
| **Size** | 56px circle, lg shadow |
| **Color** | Brand-500 with white icon |
| **Hover** | Expands to "Ask AI" label |
| **Click** | Opens AI Copilot panel (slide-in drawer, 480px) |
| **Visibility** | Hidden on mobile, shown on tablet+ |

#### 3.39.4 Notification Bell

| Property | Specification |
|---|---|
| **Position** | Top-right of app header |
| **Badge** | Red circle with count. Shows unread count. Max "99+" |
| **Dropdown** | 400px width, max 450px height, scrollable |
| **Sections** | Today, Yesterday, Earlier |
| **Actions** | Mark as read (hover), "Mark all read" at top |
| **Empty** | "No new notifications" with bell illustration |
| **Click** | Single notification → relevant page. "View all" → /notifications |

---

### 3.40 Error & Status Pages

#### 3.40.1 404 — Not Found

**Layout:**
- Centered, 480px max-width
- Illustration or icon (file search)
- Title: "Page not found"
- Body: "The page you're looking for doesn't exist or has been moved."
- Action: "Go to Dashboard" button
- Secondary: "Search" or "Contact support"

#### 3.40.2 403 — Forbidden

**Layout:**
- Centered, 480px max-width
- Icon: Lock / Shield
- Title: "Access denied"
- Body: "You don't have permission to access this page."
- Action: "Request access" button (notifies admin)
- Alternative: "Go to Dashboard"

#### 3.40.3 500 — Server Error

**Layout:**
- Centered, 480px max-width
- Icon: Alert triangle
- Title: "Something went wrong"
- Body: "Our team has been notified. Please try again."
- Action: "Try again" button (retries last request)
- Secondary: "Contact support" with error reference ID

#### 3.40.4 Offline Page

**Layout:**
- Icon: Wifi-off
- Title: "You're offline"
- Body: "Some features may be unavailable until you reconnect."
- Shows cached data where available
- Auto-reconnects when back online

#### 3.40.5 Maintenance Page

**Layout:**
- Full-page overlay
- Icon: Wrench/tool
- Title: "Scheduled maintenance"
- Body: "We're performing scheduled maintenance. Expected duration: [time]"
- Progress bar or countdown timer
- No navigation available

#### 3.40.6 Onboarding Wizard

**Page Information**
| Field | Value |
|---|---|
| Page Name | Onboarding |
| Route | `/onboarding` |
| Purpose | Guide new users through initial setup |
| Primary Roles | New users (first login) |
| Access | First-time authenticated users |
| Entry Points | Redirect after first login |
| Related Pages | Dashboard, Organization Setup |

**Steps:**
1. **Welcome** — Product overview video/gif + "Get started" CTA
2. **Organization Setup** — Company name, currency, timezone, fiscal year
3. **Connect Bank** — Plaid or manual bank connection
4. **Import Data** — CSV upload or connector setup
5. **Invite Team** — Add team members (optional, can skip)
6. **First Look** — Dashboard tour with tooltips highlighting key areas
7. **AI Setup** — Configure AI preferences, credit budget, model selection (Enterprise)

**Progress Indicator:**
- Stepper at top: 6 steps, numbered circles, completed steps have checkmarks
- "Skip" link available on non-essential steps

---

## 4. Interaction Patterns

### 4.1 Navigation Flows

```text
Dashboard
  ├── Click KPI → Relevant module with period context
  ├── Click approval → Approval drawer
  ├── Click alert → Alert detail / Fraud case
  └── Click chart → Analytics with context

Transaction List
  ├── Click row → Transaction detail drawer
  ├── Click vendor → Vendor profile
  ├── Click category → Filter by category
  └── Click reconcile → Reconciliation drawer

Invoice List
  ├── Click row → Invoice detail drawer
  ├── Click vendor → Vendor profile
  ├── Click approve → Approval dialog
  └── Click upload → Upload dialog

Payment Batches
  ├── Click batch → Batch detail drawer
  ├── Click approve → Approval dialog (dual control)
  └── Click release → Release confirmation
```

### 4.2 Approval Flow

```text
1. User triggers action requiring approval
2. Item enters "Pending Approval" status
3. Approver receives notification (in-app + email/Slack)
4. Approver opens approval drawer
5. Approver sees: item details, context, AI recommendation
6. Approver: Approve / Reject / Request Changes
7. Action logged to audit trail
8. If multi-level: next approver notified
9. If rejected: creator notified with reason
10. If SLA breached: escalation triggered
```

### 4.3 Dual Control Flow (High-Value Payments)

```text
1. Creator submits payment batch > $100K
2. Batch enters "Pending Level 1" status
3. Approver 1 reviews and approves
4. Batch enters "Pending Level 2" status
5. Approver 2 (different person) reviews and approves
6. Batch released for execution
7. If either rejects: batch returned to creator with reason
```

---

## 5. Navigation Map

```text
App Shell
├── /dashboard
├── /financial-overview
├── Finance
│   ├── /transactions
│   │   └── /transactions/{id}
│   ├── /invoices
│   │   ├── /invoices/{id}
│   │   └── /invoices/upload
│   ├── /payments
│   │   └── /payments/{id}
│   └── /bank-accounts
│       └── /bank-accounts/{id}
├── Treasury
│   ├── /treasury
│   ├── /cash-flow
│   └── /forecasting
├── Planning
│   ├── /budgets
│   │   └── /budgets/{id}
│   ├── /analytics
│   └── /reports
│       ├── /reports/{id}
│       └── /reports/new
├── Accounting
│   ├── /financial-statements
│   │   ├── /financial-statements/pnl
│   │   ├── /financial-statements/balance-sheet
│   │   └── /financial-statements/cash-flow
│   ├── /journal-entries
│   │   └── /journal-entries/{id}
│   ├── /gl
│   │   └── /gl/accounts/{id}
│   ├── /gl/chart-of-accounts
│   └── /fixed-assets
│       └── /fixed-assets/{id}
├── AP/AR
│   ├── /ap
│   ├── /ar
│   ├── /vendors
│   │   └── /vendors/{id}
│   └── /customers
│       └── /customers/{id}
├── Procurement
│   ├── /procurement
│   └── /procurement/purchase-orders
│       └── /procurement/purchase-orders/{id}
├── Risk & Compliance
│   ├── /fraud-center
│   │   └── /fraud-center/cases/{id}
│   ├── /compliance-center
│   │   ├── /compliance-center/controls
│   │   ├── /compliance-center/issues
│   │   └── /compliance-center/evidence
│   └── /audit-center
├── Automation
│   ├── /workflow-builder
│   │   └── /workflow-builder/{id}
│   └── /rule-engine
│       └── /rule-engine/{id}
├── AI
│   ├── /ai-copilot
│   ├── /ai-prompt-library
│   ├── /ai-templates
│   └── /ai-agent-monitor
├── Organization
│   ├── /organization/users
│   ├── /organization/roles
│   ├── /settings
│   └── /billing
├── Developer
│   ├── /developer
│   ├── /developer/api-keys
│   ├── /developer/webhooks
│   ├── /developer/logs
│   └── /integrations
├── System
│   ├── /system-health
│   ├── /logs
│   └── /feature-flags
├── /admin
├── /notifications
├── /documents
│   └── /documents/{id}
├── /profile
└── Auth
    ├── /auth/login
    ├── /auth/register
    ├── /auth/forgot-password
    ├── /auth/reset-password
    ├── /auth/mfa/verify
    └── /auth/sso
```

---

## 6. Keyboard Shortcuts Reference

### 6.1 Global Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd+K` | Open Command Palette |
| `Cmd+Shift+K` | Open AI Copilot |
| `Cmd+/` | Show keyboard shortcuts help |
| `Cmd+Shift+F` | Focus Global Search |
| `Esc` | Close modal/drawer/dropdown |
| `Cmd+1-9` | Navigate to first 9 sidebar items |
| `Cmd+B` | Toggle sidebar |
| `R` | Refresh current page data |
| `Cmd+Shift+E` | Export current view |

### 6.2 Page-Specific Shortcuts

| Page | Shortcut | Action |
|---|---|---|
| **Dashboard** | `G D` | Go to Dashboard |
| **Transactions** | `G T` | Go to Transactions |
| | `N` | New transaction |
| | `I` | Import |
| **Invoices** | `G I` | Go to Invoices |
| | `U` | Upload invoice |
| **Payments** | `G P` | Go to Payments |
| **Reports** | `G R` | Go to Reports |
| **Search** | `/` | Focus page search |
| **Table Navigation** | `↑ ↓` | Navigate rows |
| | `Space` | Select/deselect row |
| | `Enter` | Open row detail |
| | `E` | Edit selected item |
| | `Del` | Delete selected item (with confirmation) |

---

## 7. Accessibility Compliance Matrix

| WCAG Criterion | Level | Implementation |
|---|---|---|
| **1.1.1 Non-text Content** | A | All icons have `aria-hidden="true"` + text labels. Images have `alt` text. |
| **1.3.1 Info and Relationships** | A | Semantic HTML (`<nav>`, `<main>`, `<header>`, `<table>`). ARIA landmarks. |
| **1.4.1 Use of Color** | A | Status indicators use icon + color + text. Charts have patterns + labels. |
| **1.4.3 Contrast (Minimum)** | AA | Text: 4.5:1 minimum. Large text: 3:1 minimum. |
| **1.4.4 Resize Text** | AA | All text resizable up to 200% without loss of content or functionality. |
| **1.4.10 Reflow** | AA | Content reflows without horizontal scroll at 320px width. |
| **1.4.11 Non-text Contrast** | AA | UI components (inputs, buttons) have 3:1 minimum contrast against adjacent colors. |
| **1.4.12 Text Spacing** | AA | No loss of content when text spacing is adjusted. |
| **2.1.1 Keyboard** | A | All functionality operable through keyboard interface. |
| **2.1.2 No Keyboard Trap** | A | Focus can be moved away from any component using keyboard. |
| **2.4.1 Bypass Blocks** | A | Skip to main content link available. |
| **2.4.2 Page Titled** | A | Every page has a descriptive `<title>`. |
| **2.4.3 Focus Order** | A | Logical tab order matches visual order. |
| **2.4.6 Headings and Labels** | AA | Descriptive headings and labels. |
| **2.4.7 Focus Visible** | AA | Visible focus indicator (2px brand-500 outline). |
| **2.5.3 Label in Name** | A | Accessible name matches visible label text. |
| **3.2.1 On Focus** | A | No automatic context changes when component receives focus. |
| **3.3.1 Error Identification** | A | Error messages clearly identify and describe the error. |
| **3.3.2 Labels or Instructions** | A | Labels or instructions provided when input requires user input. |
| **3.3.3 Error Suggestion** | AA | Suggestions for fixing errors (e.g., "Password must be at least 8 characters"). |
| **4.1.2 Name, Role, Value** | A | All custom components have proper ARIA roles, states, and properties. |
| **4.1.3 Status Messages** | AA | Status messages use `aria-live` regions. |

**Color Blind Support:**
- Status indicators use shape + text in addition to color
- Charts offer pattern fills as alternative to color-only legends
- All interactive states (hover, focus, active) have non-color indicators (underline, border, shadow)
- Color palette selected for deuteranopia/protanopia/tritanopia compatibility

**Reduced Motion:**
- `prefers-reduced-motion` respected
- Animations reduced to fade transitions (no slide, scale, or complex animations)
- Loading states: static skeleton instead of animated pulse
- Toast notifications: static appearance, no slide-in animation

---

## Appendix A: Screen Inventory Checklist

| # | Screen | Status |
|---|---|---|
| 1 | Login | ✅ Specified |
| 2 | Register | ✅ Specified |
| 3 | Forgot Password | ✅ Specified |
| 4 | MFA Verification | ✅ Specified |
| 5 | SSO Login | ✅ Specified |
| 6 | Dashboard | ✅ Specified |
| 7 | Financial Overview | ✅ Specified |
| 8 | Transaction List | ✅ Specified |
| 9 | Transaction Detail | ✅ Specified |
| 10 | Invoice List | ✅ Specified |
| 11 | Invoice Upload | ✅ Specified |
| 12 | Payment Batches | ✅ Specified |
| 13 | Bank Accounts | ✅ Specified |
| 14 | Treasury Dashboard | ✅ Specified |
| 15 | Cash Flow | ✅ Specified |
| 16 | Forecasting | ✅ Specified |
| 17 | Budget Planning | ✅ Specified |
| 18 | Financial Analytics | ✅ Specified |
| 19 | Financial Statements | ✅ Specified |
| 20 | Journal Entry List | ✅ Specified |
| 21 | Journal Entry Create | ✅ Specified |
| 22 | General Ledger | ✅ Specified |
| 23 | Chart of Accounts | ✅ Specified |
| 24 | Fixed Assets | ✅ Specified |
| 25 | AP Dashboard | ✅ Specified |
| 26 | AR Dashboard | ✅ Specified |
| 27 | Vendor Directory | ✅ Specified |
| 28 | Customer Directory | ✅ Specified |
| 29 | Procurement Dashboard | ✅ Specified |
| 30 | Purchase Orders | ✅ Specified |
| 31 | Fraud Center | ✅ Specified |
| 32 | Compliance Center | ✅ Specified |
| 33 | Audit Center | ✅ Specified |
| 34 | Workflow Builder | ✅ Specified |
| 35 | Rule Engine | ✅ Specified |
| 36 | Notification Center | ✅ Specified |
| 37 | Report Library | ✅ Specified |
| 38 | Document Center | ✅ Specified |
| 39 | AI Copilot Chat | ✅ Specified |
| 40 | User Management | ✅ Specified |
| 41 | Billing Overview | ✅ Specified |
| 42 | Developer Center | ✅ Specified |
| 43 | Integration Marketplace | ✅ Specified |
| 44 | Settings | ✅ Specified |
| 45 | System Health | ✅ Specified |
| 46 | Admin Console | ✅ Specified |
| 47 | Command Palette | ✅ Specified |
| 48 | Global Search | ✅ Specified |
| 49 | AI Action FAB | ✅ Specified |
| 50 | Notifications Bell | ✅ Specified |
| 51 | Onboarding Wizard | ✅ Specified |
| 52 | 404 Page | ✅ Specified |
| 53 | 403 Page | ✅ Specified |
| 54 | 500 Page | ✅ Specified |
| 55 | Offline Page | ✅ Specified |
| 56 | Maintenance Page | ✅ Specified |

---

## Appendix B: Design System Component Reuse Map

Every screen in this document reuses the following global components:

| Component | Used By (All Screens) |
|---|---|
| App Shell (Top Bar + Sidebar + Content) | All authenticated screens |
| Page Header (Breadcrumbs + Title + Actions) | All list/detail screens |
| Data Table | Transactions, Invoices, Payments, Vendors, Customers, Journal Entries, Users, Audit Logs, Reports |
| KPI Card Row | Dashboard, Financial Overview, Treasury, Cash Flow, AP, AR, Fraud, Compliance |
| Filter Panel | All list screens with data tables |
| Pagination | All list screens with data tables |
| Search Bar | All list screens |
| AI Action Surface | All screens |
| Confirmation Dialog | All screens with destructive actions |
| Toast Notifications | All screens with async operations |
| Drawer (Side Panel) | Detail views, Create/Edit forms |
| Modal | Create/Edit flows, Import, Export |
| Badge (Status + Severity) | All screens with status indicators |
| Avatar | User lists, comments, audit trails |
| Loading Skeleton | All data-dependent screens |
| Empty State | All list screens |
| Error State | All data-dependent screens |

---

*End of Document — UX-FINCOPS-023 v1.0*