import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("register, login, refresh, protected organization, api key and audit flow", async () => {
  process.env.API_DATA_FILE = join(await mkdtemp(join(tmpdir(), "finops-api-")), "data.json");
  const { createAppServer } = await import("../src/server.mjs");
  const server = await createAppServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;

  const register = await fetch(`${base}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "owner@example.com",
      password: "SecurePass123!",
      first_name: "Asha",
      last_name: "Menon",
      company_name: "Acme Finance",
      accept_terms: true,
    }),
  });
  assert.equal(register.status, 201);
  const registered = await register.json();
  assert.ok(registered.data.access_token);

  const login = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "owner@example.com", password: "SecurePass123!" }),
  });
  assert.equal(login.status, 200);
  const loggedIn = await login.json();

  const org = await fetch(`${base}/organization`, {
    headers: { Authorization: `Bearer ${loggedIn.data.access_token}` },
  });
  assert.equal(org.status, 200);
  assert.equal((await org.json()).data.name, "Acme Finance");

  const key = await fetch(`${base}/api-keys`, {
    method: "POST",
    headers: { Authorization: `Bearer ${loggedIn.data.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "CI Key", scopes: ["dashboard:read"] }),
  });
  assert.equal(key.status, 201);
  assert.match((await key.json()).data.api_key, /^fk_live_/);

  const audit = await fetch(`${base}/audit-logs`, {
    headers: { Authorization: `Bearer ${loggedIn.data.access_token}` },
  });
  assert.equal(audit.status, 200);
  assert.ok((await audit.json()).data.length >= 2);

  const refresh = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: loggedIn.data.refresh_token }),
  });
  assert.equal(refresh.status, 200);

  await new Promise((resolve) => server.close(resolve));
});
