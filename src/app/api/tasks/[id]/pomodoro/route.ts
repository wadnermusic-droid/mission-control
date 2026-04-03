'use server';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('mc_access_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const authResult = await getUserFromToken(token);
    if (!authResult) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = authResult.id;

    const { id: taskId } = await params;

    // Verify task exists and belongs to user
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== userId) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const sessions = await prisma.pomodoroSession.findMany({
      where: { taskId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { startedAt: 'desc' },
    });

    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const completedCount = sessions.filter(s => s.completed).length;

    return NextResponse.json({ 
      sessions, 
      totalDuration,
      completedCount,
    });
  } catch (error) {
    console.error('Failed to fetch pomodoro sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('mc_access_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const authResult = await getUserFromToken(token);
    if (!authResult) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = authResult.id;

    const { id: taskId } = await params;
    const body = await request.json();
    const { duration, type, completed } = body;

    if (!duration || typeof duration !== 'number') {
      return NextResponse.json({ error: 'Duration is required' }, { status: 400 });
    }

    // Verify task exists and belongs to user
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== userId) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const session = await prisma.pomodoroSession.create({
      data: {
        taskId,
        userId,
        duration,
        type: type || 'work',
        completed: completed || false,
      },
      include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Failed to create pomodoro session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
