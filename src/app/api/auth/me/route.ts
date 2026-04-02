import { NextRequest } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-security';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('mc_access_token')?.value;

    if (!token) {
      return createErrorResponse(401, 'Not authenticated', 'UNAUTHORIZED');
    }

    const user = await getUserFromToken(token);

    if (!user) {
      return createErrorResponse(401, 'Invalid token', 'UNAUTHORIZED');
    }

    return createSuccessResponse({ user }, 200);
  } catch (error) {
    return createErrorResponse(500, 'Internal server error', 'SERVER_ERROR');
  }
}
