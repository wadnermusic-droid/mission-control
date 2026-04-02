import { NextRequest } from 'next/server';
import { getUserFromToken, deleteSession } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-security';
import prisma from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('mc_access_token')?.value;

    if (!token) {
      return createErrorResponse(401, 'Not authenticated', 'UNAUTHORIZED');
    }

    const user = await getUserFromToken(token);

    if (!user) {
      return createErrorResponse(401, 'Invalid token', 'UNAUTHORIZED');
    }

    // Delete all user data in order of dependencies
    await prisma.timeEntry.deleteMany({
      where: { userId: user.id },
    });

    await prisma.note.deleteMany({
      where: { userId: user.id },
    });

    await prisma.task.deleteMany({
      where: { userId: user.id },
    });

    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    await prisma.user.delete({
      where: { id: user.id },
    });

    // Clear the session cookie
    const response = createSuccessResponse(
      { message: 'Account deleted successfully' },
      200
    );

    response.cookies.delete('mc_access_token');
    response.cookies.delete('mc_refresh_token');

    return response;
  } catch (error: any) {
    return createErrorResponse(500, 'Internal server error', 'SERVER_ERROR');
  }
}
