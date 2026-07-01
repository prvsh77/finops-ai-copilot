import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("Reports generation, global search, and data exports flow", async () => {
  process.env.API_DATA_FILE = join(await mkdtemp(join(tmpdir(), "finops-rep-")), "data.json");
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

    // 2. Fetch reports list (empty initially)
    const repsGet = await fetch(`${base}/reports`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(repsGet.status, 200);
    const repsList = await repsGet.json();
    assert.equal(repsList.data.length, 0);

    // 3. Generate report
    const genPost = await fetch(`${base}/reports/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "fraud" }),
    });
    assert.equal(genPost.status, 201);
    const report = await genPost.json();
    assert.equal(report.data.type, "fraud");

    // 4. Global search
    const searchGet = await fetch(`${base}/search?q=fraud`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(searchGet.status, 200);
    const searchHits = await searchGet.json();
    assert.ok(Array.isArray(searchHits.data));

    // 5. Data export
    const exportGet = await fetch(`${base}/export?resource=transactions&format=csv`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(exportGet.status, 200);
    const csvContent = await exportGet.text();
    assert.ok(csvContent.includes("id"));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
