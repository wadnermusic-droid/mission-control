import { NextRequest } from 'next/server';
import { SignupSchema, signupUser } from '@/lib/auth';
import { getClientIp, createSuccessResponse, createErrorResponse } from '@/lib/api-security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = SignupSchema.parse(body);

    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || '';

    const result = await signupUser(
      validated.email,
      validated.password,
      validated.name,
      ipAddress,
      userAgent
    );

    if (!result) {
      return createErrorResponse(409, 'Email already exists', 'EMAIL_EXISTS');
    }

    const response = createSuccessResponse(result, 201);

    // Set HTTP-only cookies
    response.cookies.set('mc_access_token', result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60,
    });

    response.cookies.set('mc_refresh_token', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return createErrorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
    }
    return createErrorResponse(500, 'Internal server error', 'SERVER_ERROR');
  }
}
