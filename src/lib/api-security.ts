/**
 * API SECURITY UTILITIES
 * ======================
 * CORS, security headers, request validation, error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { env } from './env';

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    '127.0.0.1'
  );
}

export function getAllowedOrigins(): string[] {
  if (env.ALLOWED_ORIGINS.trim() === '') {
    // Development: allow localhost
    if (env.NODE_ENV !== 'production') {
      return [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
      ];
    }
    return [];
  }
  return env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
}

export function isOriginAllowed(origin: string): boolean {
  const allowed = getAllowedOrigins();
  if (allowed.length === 0 && env.NODE_ENV !== 'production') {
    return true; // Allow all in dev
  }
  return allowed.includes(origin);
}

export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    'X-Content-Type-Options',
    'nosniff'
  );
  response.headers.set(
    'X-Frame-Options',
    'DENY'
  );
  response.headers.set(
    'X-XSS-Protection',
    '1; mode=block'
  );
  response.headers.set(
    'Referrer-Policy',
    'strict-origin-when-cross-origin'
  );

  if (env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  return response;
}

export function addCorsHeaders(
  response: NextResponse,
  origin?: string
): NextResponse {
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set(
      'Access-Control-Allow-Credentials',
      'true'
    );
  }

  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-CSRF-Token'
  );
  response.headers.set(
    'Access-Control-Max-Age',
    '86400'
  );

  return response;
}

export function createErrorResponse(
  statusCode: number,
  message: string,
  code?: string
): NextResponse {
  const response = NextResponse.json(
    {
      error: message,
      code: code || 'ERROR',
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );

  return addSecurityHeaders(response);
}

export function createSuccessResponse(
  data: any,
  statusCode: number = 200
): NextResponse {
  const response = NextResponse.json(data, {
    status: statusCode,
  });

  return addSecurityHeaders(response);
}

export function validateContentType(
  contentType: string | null,
  expected: string[]
): boolean {
  if (!contentType) return false;
  return expected.some((type) => contentType.includes(type));
}

export function validateRequestSize(
  size: number,
  maxSize: number = env.MAX_BODY_SIZE
): boolean {
  return size <= maxSize;
}

export async function safeParseJson(
  request: NextRequest
): Promise<any> {
  try {
    const contentType = request.headers.get(
      'content-type'
    );

    if (!validateContentType(contentType, ['application/json'])) {
      throw new Error('Invalid content-type');
    }

    const body = await request.json();
    return body;
  } catch (error) {
    throw new Error('Invalid JSON');
  }
}
