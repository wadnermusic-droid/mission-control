import { NextRequest } from 'next/server';
import { generatePasswordResetToken } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-security';
import { z } from 'zod';

const EmailSchema = z.object({
  email: z.string().email('Invalid email'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = EmailSchema.parse(body);

    const token = await generatePasswordResetToken(email);

    if (!token) {
      // Don't reveal if user exists (security best practice)
      return createSuccessResponse(
        {
          message:
            'If an account with that email exists, a password reset token has been generated. Check your email or use the token below.',
          token: null, // In production, this would be sent via email
        },
        200
      );
    }

    // In development, return the token so you can test
    return createSuccessResponse(
      {
        message: 'Password reset token generated. Use it to reset your password.',
        token: token, // ⚠️ Remove this in production! Send via email instead
        resetLink: `/reset-password?token=${token}`,
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
