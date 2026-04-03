'use server';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

// Get deleted (archived) tasks
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('mc_access_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const trashedTasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        deletedAt: { not: null }, // Only deleted tasks
      },
      orderBy: { deletedAt: 'desc' },
    });

    const formatted = trashedTasks.map((task) => ({
      ...task,
      tags: JSON.parse(task.tags),
    }));

    return NextResponse.json({ tasks: formatted });
  } catch (error) {
    console.error('Failed to fetch trash:', error);
    return NextResponse.json({ error: 'Failed to fetch trash' }, { status: 500 });
  }
}

// Restore a task from trash
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('mc_access_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== user.id || !task.deletedAt) {
      return NextResponse.json({ error: 'Task not found in trash' }, { status: 404 });
    }

    // Restore: clear deletedAt timestamp
    const restored = await prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: null },
    });

    return NextResponse.json({
      success: true,
      task: {
        ...restored,
        tags: JSON.parse(restored.tags),
      },
    });
  } catch (error) {
    console.error('Failed to restore task:', error);
    return NextResponse.json({ error: 'Failed to restore task' }, { status: 500 });
  }
}

// Permanently delete a task (after 30 days or manual action)
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('mc_access_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== user.id || !task.deletedAt) {
      return NextResponse.json({ error: 'Task not found in trash' }, { status: 404 });
    }

    // Permanently delete all related data first
    await prisma.timeEntry.deleteMany({ where: { taskId } });
    await prisma.note.deleteMany({ where: { taskId } });
    await prisma.pomodoroSession.deleteMany({ where: { taskId } });
    await prisma.taskComment.deleteMany({ where: { taskId } });

    // Now hard delete the task
    await prisma.task.delete({ where: { id: taskId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to permanently delete task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
