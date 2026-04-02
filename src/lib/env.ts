/**
 * ENVIRONMENT VARIABLE MANAGEMENT
 * ================================
 * 
 * Single source of truth for every configuration value the app uses.
 * Validates all env vars at startup with Zod schema.
 */

import { z } from 'zod';

// ============================================================
// SCHEMA DEFINITIONS
// ============================================================

const serverSchema = z.object({
  // Runtime
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_TOKEN_EXPIRY: z.string().default('30m'),
  JWT_REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  
  // CORS
  ALLOWED_ORIGINS: z.string().default(''),
  
  // Rate Limiting
  RATE_LIMIT_GLOBAL_MAX: z.coerce.number().default(100),
  RATE_LIMIT_GLOBAL_WINDOW_SECONDS: z.coerce.number().default(60),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().default(5),
  RATE_LIMIT_AUTH_WINDOW_SECONDS: z.coerce.number().default(60),
  RATE_LIMIT_TASKS_MAX: z.coerce.number().default(50),
  RATE_LIMIT_TASKS_WINDOW_SECONDS: z.coerce.number().default(60),
  RATE_LIMIT_TOOLS_MAX: z.coerce.number().default(30),
  RATE_LIMIT_TOOLS_WINDOW_SECONDS: z.coerce.number().default(60),
  
  // Security
  ENABLE_RATE_LIMITING: z.coerce.boolean().default(true),
  ENABLE_CSRF_PROTECTION: z.coerce.boolean().default(true),
  ENABLE_REQUEST_LOGGING: z.coerce.boolean().default(true),
  MAX_BODY_SIZE: z.coerce.number().default(1048576),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_FORMAT: z.enum(['pretty', 'json']).default('pretty'),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default('Mission Control'),
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
});

// ============================================================
// VALIDATION
// ============================================================

function validateEnv() {
  const env = process.env;
  
  const serverParsed = serverSchema.safeParse(env);
  const clientParsed = clientSchema.safeParse(env);
  
  if (!serverParsed.success) {
    const errors = serverParsed.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ');
    throw new Error(`Invalid environment variables: ${errors}`);
  }
  
  if (!clientParsed.success) {
    const errors = clientParsed.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ');
    throw new Error(`Invalid public environment variables: ${errors}`);
  }
  
  return {
    ...serverParsed.data,
    ...clientParsed.data,
  };
}

// ============================================================
// EXPORTS
// ============================================================

export const env = validateEnv();

export const clientEnv = {
  NEXT_PUBLIC_APP_NAME: env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
};

export function printStartupDiagnostics() {
  console.log('🚀 Mission Control Starting...');
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Database: ${redactSecrets(env.DATABASE_URL)}`);
  console.log(`   Rate Limiting: ${env.ENABLE_RATE_LIMITING ? '✅ Enabled' : '⚠️ Disabled'}`);
  console.log(`   CSRF Protection: ${env.ENABLE_CSRF_PROTECTION ? '✅ Enabled' : '⚠️ Disabled'}`);
  console.log('');
}

function redactSecrets(value: string): string {
  if (value.length <= 10) return '***';
  return value.substring(0, 10) + '...' + value.substring(value.length - 4);
}
