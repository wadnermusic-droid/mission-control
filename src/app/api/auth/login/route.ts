import { NextRequest } from 'next/server';
import { LoginSchema, loginUser } from '@/lib/auth';
import { getClientIp, createSuccessResponse, createErrorResponse } from '@/lib/api-security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = LoginSchema.parse(body);

    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || '';

    const result = await loginUser(
      validated.email,
      validated.password,
      ipAddress,
      userAgent
    );

    if (!result) {
      return createErrorResponse(401, 'Invalid email or password', 'AUTH_FAILED');
    }

    const response = createSuccessResponse(result, 200);

    // Set HTTP-only cookies
    response.cookies.set('mc_access_token', result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60, // 30 minutes
    });

    response.cookies.set('mc_refresh_token', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return createErrorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
    }
    return createErrorResponse(500, 'Internal server error', 'SERVER_ERROR');
  }
}
