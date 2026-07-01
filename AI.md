# AI Architecture & Capabilities

FinOps AI Copilot implements an Enterprise AI Gateway routing framework, orchestrating custom Specialist Agent Personas to safeguard corporate assets.

---

## 🤖 Model Routing & Gateway
The system implements a pluggable `BaseAiProvider` pattern. Select providers dynamically using environment variables:

```bash
# Available options: mock, openai, gemini, ollama
AI_PROVIDER=mock
OPENAI_API_KEY=sk-xxxx
GEMINI_API_KEY=AIzaSyxxxx
```

Cost tracking and token usage are monitored by the gateway:
* **Cost Factor (OpenAI)**: $0.0015 per 1K input tokens, $0.002 per 1K output tokens.
* **Cost Factor (Gemini)**: $0.00015 per 1K input tokens, $0.0006 per 1K output tokens.
* **Cost Factor (Ollama / Mock)**: $0.0000 (Local running compute).

---

## 👥 Specialist Agent Personas
The `AgentRegistry` configures specific personas with focused prompts:
1. **Supervisor Agent**: Parses user intent, reads search guidelines, resolves context, and routes work.
2. **Fraud Agent**: Checks duplicate transaction records, anomalous weekend activity, and new vendor payment velocities.
3. **Treasury Agent**: Coordinates bank balance transfers, matches sweeps, and preserves liquidity targets.
4. **Financial Analyst**: Evaluates EBITDA trends, operating burn rates, and margin variances.
5. **Forecast Agent**: Models cash runway projections.
6. **Compliance Agent**: Scans audit logs against SOX Section 404 guidelines.

---

## 🔍 Retrieval Augmented Generation (RAG)
The system leverages a hybrid vector-like text match strategy for standard operating documents (SOPs):
* **Chunking**: Ingests procedures, splitting them into readable line arrays.
* **Hybrid Search**: Ranks documents using keyword frequency matched with TF-IDF indexing.
* **Citations**: Returns matching reference points (e.g. `[Enterprise Architecture Checklist L53]`) alongside response streams.
