# Installation Guide

Follow these steps to set up the FinOps AI Copilot project locally on your machine.

## Prerequisites
* **Node.js**: Version 18.x or 20.x or higher
* **npm**: Version 9.x or higher
* **Docker / Docker Compose**: (Optional, for containerized deployments)

---

## 1. Setup Configuration
Clone the repository and copy the environment variables template:

```bash
# Clone the repository
git clone https://github.com/your-org/finops-ai-copilot.git
cd finops-ai-copilot

# Copy the server configuration template
cp apps/api/.env.example apps/api/.env
```

Ensure the configuration variables inside `apps/api/.env` are populated:
* `PORT=8080`
* `AI_PROVIDER=mock` (Switch to `openai` or `gemini` if API keys are available)

---

## 2. Install Dependencies
Run the installation script at the monorepo root to link packages and modules:

```bash
npm install
```

---

## 3. Run Development Workspace
To start both the Node.js API server and the Vite React application:

```bash
npm run dev
```

* **Vite React App**: [http://localhost:5173](http://localhost:5173)
* **REST API Gateway**: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)

---

## 4. Run Test Suites
Verify setup correctness by executing the integrated Node.js test runner:

```bash
npm test
```
