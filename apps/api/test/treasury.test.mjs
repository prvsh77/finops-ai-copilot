import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("treasury bank account sync and transfers flow", async () => {
  process.env.API_DATA_FILE = join(await mkdtemp(join(tmpdir(), "finops-tres-")), "data.json");
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

    // 2. Connect Bank Account 1 (Source)
    const connect1 = await fetch(`${base}/bank-accounts/connect`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        institution_name: "HDFC Bank",
        account_number: "1234567890",
        balance_current: 10000000,
        currency: "INR",
      }),
    });
    assert.equal(connect1.status, 201);
    const acc1 = await connect1.json();

    // 3. Connect Bank Account 2 (Dest)
    const connect2 = await fetch(`${base}/bank-accounts/connect`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        institution_name: "ICICI Bank",
        account_number: "0987654321",
        balance_current: 5000000,
        currency: "INR",
      }),
    });
    assert.equal(connect2.status, 201);
    const acc2 = await connect2.json();

    // 4. Perform Transfer
    const transfer = await fetch(`${base}/treasury/transfers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_account_id: acc1.data.id,
        destination_account_id: acc2.data.id,
        amount: 2000000,
        currency: "INR",
      }),
    });
    assert.equal(transfer.status, 201);

    // 5. Get cash positions
    const pos = await fetch(`${base}/treasury/cash-positions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(pos.status, 200);
    const cash = await pos.json();
    assert.equal(cash.data.total_cash_equivalent, 15000000);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
