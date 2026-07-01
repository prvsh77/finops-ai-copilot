import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("AI Platform chat, memory sessions, and evaluations flow", async () => {
  process.env.API_DATA_FILE = join(await mkdtemp(join(tmpdir(), "finops-ai-")), "data.json");
  process.env.AI_PROVIDER = "MOCK";
  const { createAppServer } = await import("../src/server.mjs");
  const server = await createAppServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;

  try {
    // 1. Register and login to obtain token
    const register = await fetch(`${base}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "asha@example.com",
        password: "SecurePass123!",
        first_name: "Asha",
        last_name: "Menon",
        company_name: "Acme Corp",
        accept_terms: true,
      }),
    });
    assert.equal(register.status, 201);
    const registered = await register.json();
    const token = registered.data.access_token;

    // 2. GET /ai/agents
    const agents = await fetch(`${base}/ai/agents`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(agents.status, 200);
    const agentsList = await agents.json();
    assert.ok(agentsList.data.length > 0);

    // 3. POST /ai/chat (Non-streaming completion)
    const chat1 = await fetch(`${base}/ai/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "Analyze duplicate payment risk for Accenture",
        stream: false,
      }),
    });
    assert.equal(chat1.status, 200);
    const res1 = await chat1.json();
    assert.ok(res1.data.text.includes("duplicate"));
    const convoId = res1.data.conversation_id;
    assert.ok(convoId);

    // 4. GET /ai/history
    const history = await fetch(`${base}/ai/history?conversation_id=${convoId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(history.status, 200);
    const historyList = await history.json();
    assert.equal(historyList.data.length, 2); // 1 user + 1 assistant

    // 5. POST /ai/evaluate
    const evalMetrics = await fetch(`${base}/ai/evaluate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(evalMetrics.status, 200);
    const metrics = await evalMetrics.json();
    assert.ok(metrics.data.totalRequests > 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
