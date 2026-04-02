import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const body = await request.json();
    const updateData: any = {};

    if (body.enabled !== undefined) updateData.enabled = body.enabled;
    if (body.config !== undefined) updateData.config = JSON.stringify(body.config);
    if (body.order !== undefined) updateData.order = body.order;

    const tool = await prisma.toolRegistration.update({
      where: { name: params.name },
      data: updateData,
    });

    return NextResponse.json(tool);
  } catch (error) {
    console.error(`PATCH /api/tools/${params.name} error:`, error);
    return NextResponse.json({ error: 'Failed to update tool' }, { status: 500 });
  }
}
