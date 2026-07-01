# Changelog

All notable changes to this project will be documented in this file.

---

## [1.0.0] - 2026-06-30

### Added
- **Core Modules**: Implemented Ledger Transactions, AP Invoices, Payouts, Treasury, and Bank Accounts.
- **Enterprise AI Platform**: Multi-provider support (OpenAI, Gemini, Ollama), supervisor router, and SSE streaming chat.
- **Financial Intelligence**: Dynamic health score calculations, Cash Flow forecasting, and P&L board brief generators.
- **Reports & Search**: Unified search match indexes and Excel/CSV data exporters.

### Fixed
- Logged API stack traces to server logs for test suite debugging.
- Corrected imports in `FraudService` to ensure `node:crypto` works consistently.
