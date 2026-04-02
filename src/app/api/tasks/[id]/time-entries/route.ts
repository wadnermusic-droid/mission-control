import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const entries = await prisma.timeEntry.findMany({
      where: { taskId: params.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error(`GET /api/tasks/${params.id}/time-entries error:`, error);
    return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    if (!body.duration || body.duration < 0) {
      return NextResponse.json({ error: 'Valid duration is required' }, { status: 400 });
    }

    const entry = await prisma.timeEntry.create({
      data: {
        taskId: params.id,
        duration: Math.round(body.duration),
        description: body.description || '',
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error(`POST /api/tasks/${params.id}/time-entries error:`, error);
    return NextResponse.json({ error: 'Failed to create time entry' }, { status: 500 });
  }
}
