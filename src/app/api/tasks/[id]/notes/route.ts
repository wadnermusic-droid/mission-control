import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const notes = await prisma.note.findMany({
      where: { taskId: params.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(notes);
  } catch (error) {
    console.error(`GET /api/tasks/${params.id}/notes error:`, error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    if (!body.content || body.content.trim() === '') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        taskId: params.id,
        userId: user.id,
        content: body.content.trim(),
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error(`POST /api/tasks/${params.id}/notes error:`, error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
