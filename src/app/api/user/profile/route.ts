import { NextRequest } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-security';
import { z } from 'zod';
import prisma from '@/lib/db';

const UpdateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email').optional(),
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
    const { name, email } = UpdateProfileSchema.parse(body);

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return createSuccessResponse(
      {
        message: 'Profile updated',
        user: {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          role: updated.role,
        },
      },
      200
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return createErrorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
    }
    if (error.code === 'P2002') {
      return createErrorResponse(409, 'Email already in use', 'EMAIL_EXISTS');
    }
    return createErrorResponse(500, 'Internal server error', 'SERVER_ERROR');
  }
}
