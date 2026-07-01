import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("invoice upload, approve, and reject flow", async () => {
  process.env.API_DATA_FILE = join(await mkdtemp(join(tmpdir(), "finops-inv-")), "data.json");
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

  // 2. Upload Invoice (simulated OCR)
  const upload = await fetch(`${base}/invoices/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      file_name: "vendor-invoice.pdf",
      amount: 145000,
    }),
  });
  assert.equal(upload.status, 201);
  const inv = await upload.json();
  assert.equal(inv.data.amount, 145000);
  assert.equal(inv.data.status, "pending_approval");

  // 3. Approve Invoice
  const approve = await fetch(`${base}/invoices/${inv.data.id}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(approve.status, 200);
  const approved = await approve.json();
  assert.equal(approved.data.status, "approved");

  await new Promise((resolve) => server.close(resolve));
});
