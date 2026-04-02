/**
 * MIDDLEWARE
 * ==========
 * Rate limiting and CORS for API routes.
 * Security headers are handled in next.config.js.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from './lib/ratelimit';

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    '127.0.0.1'
  );
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const pathname = request.nextUrl.pathname;

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
      response.headers.set('Access-Control-Max-Age', '86400');
    }
    return response;
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const clientIp = getClientIp(request);
    let maxRequests = 100;
    let windowSeconds = 60;

    if (pathname.includes('/auth/')) {
      maxRequests = 5;
      windowSeconds = 60;
    } else if (pathname.includes('/tasks')) {
      maxRequests = 50;
      windowSeconds = 60;
    } else if (pathname.includes('/tools')) {
      maxRequests = 30;
      windowSeconds = 60;
    }

    const result = checkRateLimit(clientIp, {
      maxRequests,
      windowSeconds,
      label: pathname,
    });

    if (!result.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' },
        {
          status: 429,
          headers: {
            'Retry-After': result.retryAfterSeconds.toString(),
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetAt.toString(),
          },
        }
      );
    }
  }

  // Continue
  const response = NextResponse.next();

  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
