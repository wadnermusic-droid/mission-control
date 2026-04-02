/**
 * RATE LIMITER
 * ============
 * Token-bucket algorithm with Map-based store.
 * Edge-runtime compatible (no Node.js dependencies).
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
  label: string;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, TokenBucket>();
const MAX_ENTRIES = 10000;

function evictOldEntries() {
  if (store.size <= MAX_ENTRIES) return;
  const now = Date.now();
  store.forEach((bucket, key) => {
    if (now - bucket.lastRefill > 3600000) {
      store.delete(key);
    }
  });
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${config.label}:${identifier}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let bucket = store.get(key);

  if (!bucket) {
    evictOldEntries();
    bucket = {
      tokens: config.maxRequests,
      lastRefill: now,
    };
    store.set(key, bucket);
    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetAt: now + windowMs,
      retryAfterSeconds: 0,
    };
  }

  const elapsedMs = now - bucket.lastRefill;
  const tokensToAdd =
    (elapsedMs / windowMs) * config.maxRequests;
  bucket.tokens = Math.min(
    config.maxRequests,
    bucket.tokens + tokensToAdd
  );
  bucket.lastRefill = now;

  const allowed = bucket.tokens >= 1;
  if (allowed) {
    bucket.tokens -= 1;
  }

  const resetAt = bucket.lastRefill + windowMs;
  const retryAfterSeconds = allowed
    ? 0
    : Math.ceil(
        (1 - bucket.tokens) /
          (config.maxRequests / windowMs)
      );

  store.set(key, bucket);

  return {
    allowed,
    limit: config.maxRequests,
    remaining: Math.floor(bucket.tokens),
    resetAt,
    retryAfterSeconds,
  };
}

export function multiRateLimit(
  identifier: string,
  configs: RateLimitConfig[]
): RateLimitResult {
  for (const config of configs) {
    const result = checkRateLimit(identifier, config);
    if (!result.allowed) {
      return result;
    }
  }
  return checkRateLimit(
    identifier,
    configs[configs.length - 1]
  );
}
