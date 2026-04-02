import { NextRequest } from 'next/server';
import { deleteSession } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-security';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('mc_access_token')?.value;

    if (token) {
      await deleteSession(token);
    }

    const response = createSuccessResponse(
      { message: 'Logged out successfully' },
      200
    );

    // Clear cookies
    response.cookies.delete('mc_access_token');
    response.cookies.delete('mc_refresh_token');

    return response;
  } catch (error) {
    return createErrorResponse(500, 'Logout failed', 'LOGOUT_ERROR');
  }
}
