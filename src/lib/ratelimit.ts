/**
 * RATE LIMITER
 * ============
 * Token-bucket algorithm with LRU cache backing store.
 * Prevents brute force and DoS attacks.
 */

import { LRUCache } from 'lru-cache';

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

// In-memory store using LRU cache
const store = new LRUCache<string, TokenBucket>({
  max: 10000, // Max 10k distinct identifiers
  maxSize: 5000000, // ~5MB max
  sizeCalculation: () => 1,
  ttl: 1000 * 60 * 60, // 1 hour TTL
});

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${config.label}:${identifier}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let bucket = store.get(key);

  // Initialize new bucket
  if (!bucket) {
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

  // Refill tokens based on elapsed time
  const elapsedMs = now - bucket.lastRefill;
  const tokensToAdd =
    (elapsedMs / windowMs) * config.maxRequests;
  bucket.tokens = Math.min(
    config.maxRequests,
    bucket.tokens + tokensToAdd
  );
  bucket.lastRefill = now;

  // Check if request is allowed
  const allowed = bucket.tokens >= 1;
  if (allowed) {
    bucket.tokens -= 1;
  }

  const resetAt =
    bucket.lastRefill + windowMs;
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
  // All passed — return last result
  return checkRateLimit(
    identifier,
    configs[configs.length - 1]
  );
}
