import { ApiError } from "./errors.mjs";

const windows = new Map();

export function rateLimit(req, key, limit, windowMs) {
  const now = Date.now();
  const bucketKey = `${key}:${Math.floor(now / windowMs)}`;
  const count = (windows.get(bucketKey) ?? 0) + 1;
  windows.set(bucketKey, count);
  req.rateLimit = {
    limit,
    remaining: Math.max(0, limit - count),
    reset: Math.ceil((Math.floor(now / windowMs) * windowMs + windowMs) / 1000),
  };
  if (count > limit) throw new ApiError(429, "RATE_LIMIT_EXCEEDED", "Rate limit exceeded. Please wait before making additional requests.");
}
