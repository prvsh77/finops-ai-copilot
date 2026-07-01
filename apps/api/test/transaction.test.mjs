import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("transaction CRUD, search, categorize, and import flow", async () => {
  process.env.API_DATA_FILE = join(await mkdtemp(join(tmpdir(), "finops-txn-")), "data.json");
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

    // 2. Create manual transaction
    const create = await fetch(`${base}/transactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 15000.5,
        currency: "INR",
        description: "Office Supplies",
        reference: "REF-101",
      }),
    });
    assert.equal(create.status, 201);
    const txn = await create.json();
    assert.equal(txn.data.amount, 15000.5);
    assert.equal(txn.data.description, "Office Supplies");

    // 3. Get transactions list with filters
    const listGet = await fetch(`${base}/transactions?search=supplies`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(listGet.status, 200);
    const list = await listGet.json();
    assert.equal(list.data.length, 1);
    assert.equal(list.meta.total, 1);

    // 4. Categorize transaction
    const cat = await fetch(`${base}/transactions/${txn.data.id}/categorize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ category_id: "cat_999", confidence: 0.95 }),
    });
    assert.equal(cat.status, 200);
    const catRes = await cat.json();
    assert.equal(catRes.data.category_id, "cat_999");
    assert.equal(catRes.data.category_confidence, 0.95);

    // 5. Flag transaction
    const flag = await fetch(`${base}/transactions/${txn.data.id}/flag`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ flag_status: "flagged", reason: "Potential duplicate" }),
    });
    assert.equal(flag.status, 200);
    const flagRes = await flag.json();
    assert.equal(flagRes.data.flag_status, "flagged");

    // 6. Delete transaction
    const del = await fetch(`${base}/transactions/${txn.data.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(del.status, 204);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
