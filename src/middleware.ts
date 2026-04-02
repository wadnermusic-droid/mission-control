/**
 * MIDDLEWARE
 * ==========
 * Rate limiting, security headers, CORS, logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from './lib/ratelimit';
import {
  getClientIp,
  addSecurityHeaders,
  addCorsHeaders,
  createErrorResponse,
} from './lib/api-security';
import { env } from './lib/env';

const PROTECTED_ROUTES = ['/api/tasks', '/api/tools', '/api/auth'];

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const pathname = request.nextUrl.pathname;
  const clientIp = getClientIp(request);

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    let response = new NextResponse(null, { status: 204 });
    response = addSecurityHeaders(response);
    if (origin) {
      response = addCorsHeaders(response, origin);
    }
    return response;
  }

  // Rate limiting for API routes
  if (env.ENABLE_RATE_LIMITING && pathname.startsWith('/api/')) {
    // Determine rate limit config based on route
    let maxRequests = env.RATE_LIMIT_GLOBAL_MAX;
    let windowSeconds = env.RATE_LIMIT_GLOBAL_WINDOW_SECONDS;

    if (pathname.includes('/auth/')) {
      maxRequests = env.RATE_LIMIT_AUTH_MAX;
      windowSeconds = env.RATE_LIMIT_AUTH_WINDOW_SECONDS;
    } else if (pathname.includes('/tasks')) {
      maxRequests = env.RATE_LIMIT_TASKS_MAX;
      windowSeconds = env.RATE_LIMIT_TASKS_WINDOW_SECONDS;
    } else if (pathname.includes('/tools')) {
      maxRequests = env.RATE_LIMIT_TOOLS_MAX;
      windowSeconds = env.RATE_LIMIT_TOOLS_WINDOW_SECONDS;
    }

    const result = checkRateLimit(clientIp, {
      maxRequests,
      windowSeconds,
      label: pathname,
    });

    if (!result.allowed) {
      let response = createErrorResponse(
        429,
        'Too many requests. Please try again later.',
        'RATE_LIMITED'
      );

      response.headers.set(
        'Retry-After',
        result.retryAfterSeconds.toString()
      );
      response.headers.set(
        'X-RateLimit-Limit',
        result.limit.toString()
      );
      response.headers.set(
        'X-RateLimit-Remaining',
        '0'
      );
      response.headers.set(
        'X-RateLimit-Reset',
        result.resetAt.toString()
      );

      if (origin) {
        response = addCorsHeaders(response, origin);
      }

      return response;
    }
  }

  // Continue to next middleware/route
  let response = NextResponse.next();
  response = addSecurityHeaders(response);

  if (origin) {
    response = addCorsHeaders(response, origin);
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
