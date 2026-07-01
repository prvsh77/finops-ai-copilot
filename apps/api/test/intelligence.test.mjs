import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("AI Intelligence fraud scans, projections, health score and executive brief flow", async () => {
  process.env.API_DATA_FILE = join(await mkdtemp(join(tmpdir(), "finops-intel-")), "data.json");
  const { createAppServer } = await import("../src/server.mjs");
  const server = await createAppServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;

  try {
    // 1. Register owner user
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

    // 2. Fetch fraud alerts
    const alertsGet = await fetch(`${base}/intelligence/fraud-alerts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(alertsGet.status, 200);
    const alerts = await alertsGet.json();
    assert.ok(Array.isArray(alerts.data));

    // 3. Trigger manual scan
    const scanPost = await fetch(`${base}/intelligence/fraud-alerts/scan`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(scanPost.status, 200);

    // 4. Fetch Forecasts
    const forecastGet = await fetch(`${base}/intelligence/forecasts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(forecastGet.status, 200);
    const fc = await forecastGet.json();
    assert.ok(fc.data.forecasts.length > 0);
    assert.ok(fc.data.commentary);

    // 5. Fetch Executive Summary
    const execGet = await fetch(`${base}/intelligence/executive-summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(execGet.status, 200);
    const summary = await execGet.json();
    assert.ok(summary.data.rawText);

    // 6. Fetch Financial Health
    const healthGet = await fetch(`${base}/intelligence/financial-health`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(healthGet.status, 200);
    const health = await healthGet.json();
    assert.ok(health.data.healthScore >= 0 && health.data.healthScore <= 100);
    assert.ok(health.data.recommendations.length > 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
