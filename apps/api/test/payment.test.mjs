import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("payment processing, hold, and release flow", async () => {
  process.env.API_DATA_FILE = join(await mkdtemp(join(tmpdir(), "finops-pay-")), "data.json");
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

  // 2. Create Payment
  const create = await fetch(`${base}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: 450000,
      currency: "INR",
      rail: "wire",
      beneficiary_name: "Tech Solutions Ltd",
      beneficiary_account_number: "9988776655",
    }),
  });
  assert.equal(create.status, 201);
  const pay = await create.json();
  assert.equal(pay.data.amount, 450000);
  assert.equal(pay.data.status, "pending");

  // 3. Hold Payment
  const hold = await fetch(`${base}/payments/${pay.data.id}/hold`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason: "Unverified vendor credentials" }),
  });
  assert.equal(hold.status, 200);
  const held = await hold.json();
  assert.equal(held.data.status, "held");

  // 4. Release Payment
  const release = await fetch(`${base}/payments/${pay.data.id}/release`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(release.status, 200);
  const released = await release.json();
  assert.equal(released.data.status, "released");

  await new Promise((resolve) => server.close(resolve));
});
