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

    const url = new URL(request.url);
    const startStr = url.searchParams.get('start');
    const endStr = url.searchParams.get('end');

    if (!startStr || !endStr) {
      return NextResponse.json(
        { error: 'start and end query parameters are required (ISO dates)' },
        { status: 400 }
      );
    }

    const start = new Date(startStr);
    const end = new Date(endStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        dueDate: {
          gte: start,
          lte: end,
        },
      },
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' },
      ],
    });

    // Group by date
    const tasksByDate: Record<string, typeof tasks> = {};
    for (const task of tasks) {
      if (task.dueDate) {
        const dateStr = task.dueDate.toISOString().split('T')[0];
        if (!tasksByDate[dateStr]) {
          tasksByDate[dateStr] = [];
        }
        tasksByDate[dateStr].push(task);
      }
    }

    return NextResponse.json({ tasksByDate });
  } catch (error) {
    console.error('Failed to fetch calendar tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
  }
}
