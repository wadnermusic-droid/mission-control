import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-security';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignee = searchParams.get('assignee');
    const search = searchParams.get('search');

    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignee) where.assignee = assignee;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });

    const formatted = tasks.map((task) => ({
      ...task,
      tags: JSON.parse(task.tags),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || body.title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || '',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        priority: body.priority || 'medium',
        status: body.status || 'inbox',
        tags: JSON.stringify(body.tags || []),
        assignee: body.assignee?.trim() || '',
      },
    });

    return NextResponse.json(
      {
        ...task,
        tags: JSON.parse(task.tags),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
