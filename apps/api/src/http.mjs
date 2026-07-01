import { randomUUID } from "node:crypto";
import { ApiError } from "./errors.mjs";
import { config } from "./config.mjs";

export function sendJson(res, status, payload, headers = {}) {
  const body = status === 204 ? "" : JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": config.corsOrigin,
    "Access-Control-Allow-Headers": "Authorization, Content-Type, Idempotency-Key, X-Correlation-Id, X-Organization-Id",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Expose-Headers": "X-Request-Id, X-Correlation-Id, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset",
    ...headers,
  });
  res.end(body);
}

export function ok(req, res, data, status = 200, meta = {}) {
  sendJson(res, status, {
    data,
    meta: {
      request_id: req.requestId,
      timestamp: new Date().toISOString(),
      version: "1.0",
      ...meta,
    },
  });
}

export function noContent(res) {
  sendJson(res, 204, null);
}

export function handleError(req, res, error) {
  console.error("API Error:", error);
  const err = error instanceof ApiError ? error : new ApiError(500, "INTERNAL_ERROR", "An unexpected error occurred.");
  sendJson(res, err.status, {
    error: {
      code: err.code,
      message: err.message,
      details: err.details ?? [],
      request_id: req.requestId ?? randomUUID(),
      documentation_url: `https://docs.finopsaicopilot.com/api/errors#${err.code}`,
    },
  });
}

export async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text.trim()) return {};
  return JSON.parse(text);
}
