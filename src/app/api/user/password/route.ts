import { NextRequest } from 'next/server';
import { getUserFromToken, verifyPassword, hashPassword } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-security';
import { z } from 'zod';
import prisma from '@/lib/db';

const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('mc_access_token')?.value;

    if (!token) {
      return createErrorResponse(401, 'Not authenticated', 'UNAUTHORIZED');
    }

    const user = await getUserFromToken(token);

    if (!user) {
      return createErrorResponse(401, 'Invalid token', 'UNAUTHORIZED');
    }

    const body = await request.json();
    const { oldPassword, newPassword } = ChangePasswordSchema.parse(body);

    // Get user with password hash
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userWithPassword) {
      return createErrorResponse(404, 'User not found', 'USER_NOT_FOUND');
    }

    // Verify old password
    const passwordMatch = await verifyPassword(
      oldPassword,
      userWithPassword.passwordHash
    );

    if (!passwordMatch) {
      return createErrorResponse(
        401,
        'Current password is incorrect',
        'INVALID_PASSWORD'
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return createSuccessResponse(
      { message: 'Password changed successfully' },
      200
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return createErrorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
    }
    return createErrorResponse(500, 'Internal server error', 'SERVER_ERROR');
  }
}
