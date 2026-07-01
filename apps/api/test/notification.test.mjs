import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("notification API retrieval, read, and preferences flow", async () => {
  process.env.API_DATA_FILE = join(await mkdtemp(join(tmpdir(), "finops-notif-")), "data.json");
  const { createAppServer } = await import("../src/server.mjs");
  const server = await createAppServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;

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

  // 2. Fetch notifications (should be empty for new organization, but let's test route returns 200)
  const listResponse = await fetch(`${base}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(listResponse.status, 200);
  const list = await listResponse.json();
  assert.equal(list.data.length, 0);

  // 3. Get notification preferences
  const prefGet = await fetch(`${base}/notification-preferences`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(prefGet.status, 200);
  const pref = await prefGet.json();
  assert.equal(pref.data.email, true);
  assert.equal(pref.data.in_app, true);

  // 4. Update notification preferences
  const prefUpdate = await fetch(`${base}/notification-preferences`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: false, slack: true }),
  });
  assert.equal(prefUpdate.status, 200);
  const prefUpdated = await prefUpdate.json();
  assert.equal(prefUpdated.data.email, false);
  assert.equal(prefUpdated.data.slack, true);

  await new Promise((resolve) => server.close(resolve));
});
