'use server';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Total tasks
    const totalTasks = await prisma.task.count({
      where: { userId },
    });

    // By status
    const byStatus = await prisma.task.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
    });

    const statusMap: Record<string, number> = {};
    byStatus.forEach(group => {
      statusMap[group.status] = group._count;
    });

    // By priority
    const byPriority = await prisma.task.groupBy({
      by: ['priority'],
      where: { userId },
      _count: true,
    });

    const priorityMap: Record<string, number> = {};
    byPriority.forEach(group => {
      priorityMap[group.priority] = group._count;
    });

    // Overdue tasks
    const overdueTasks = await prisma.task.count({
      where: {
        userId,
        dueDate: { lt: new Date() },
        status: { not: 'done' },
      },
    });

    // Total time tracked
    const timeResult = await prisma.timeEntry.aggregate({
      where: { userId },
      _sum: { duration: true },
    });
    const totalTimeTracked = timeResult._sum.duration || 0;

    // Total pomodoro sessions
    const totalPomodoroSessions = await prisma.pomodoroSession.count({
      where: { userId, completed: true },
    });

    const pomodoroResult = await prisma.pomodoroSession.aggregate({
      where: { userId, type: 'work', completed: true },
      _sum: { duration: true },
    });
    const totalPomodoroFocusTime = pomodoroResult._sum.duration || 0;

    // Tasks completed this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const completedThisWeek = await prisma.task.count({
      where: {
        userId,
        status: 'done',
        updatedAt: { gte: weekAgo },
      },
    });

    const averageTimePerTask = totalTasks > 0 ? Math.round(totalTimeTracked / totalTasks) : 0;

    return NextResponse.json({
      totalTasks,
      overdueTasks,
      byStatus: statusMap,
      byPriority: priorityMap,
      totalTimeTracked,
      totalPomodoroSessions,
      totalPomodoroFocusTime,
      completedThisWeek,
      averageTimePerTask,
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
