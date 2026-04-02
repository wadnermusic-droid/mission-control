import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const tools = await prisma.toolRegistration.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(tools);
  } catch (error) {
    console.error('GET /api/tools error:', error);
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.displayName) {
      return NextResponse.json(
        { error: 'name and displayName are required' },
        { status: 400 }
      );
    }

    const tool = await prisma.toolRegistration.create({
      data: {
        name: body.name,
        displayName: body.displayName,
        description: body.description || '',
        enabled: body.enabled ?? true,
        config: JSON.stringify(body.config || {}),
        order: body.order || 99,
      },
    });

    return NextResponse.json(tool, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Tool with this name already exists' },
        { status: 409 }
      );
    }
    console.error('POST /api/tools error:', error);
    return NextResponse.json({ error: 'Failed to register tool' }, { status: 500 });
  }
}
