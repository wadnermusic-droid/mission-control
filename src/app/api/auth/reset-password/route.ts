import { NextRequest } from 'next/server';
import { resetPassword } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-security';
import { z } from 'zod';

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = ResetPasswordSchema.parse(body);

    const result = await resetPassword(token, password);

    if (!result) {
      return createErrorResponse(
        400,
        'Invalid or expired reset token',
        'INVALID_TOKEN'
      );
    }

    return createSuccessResponse(
      {
        message: 'Password reset successful. You can now log in with your new password.',
        user: result.user,
      },
      200
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return createErrorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
    }
    return createErrorResponse(500, 'Internal server error', 'SERVER_ERROR');
  }
}
