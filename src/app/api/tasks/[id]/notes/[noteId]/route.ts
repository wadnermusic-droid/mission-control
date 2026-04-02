import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    await prisma.note.delete({
      where: { id: params.noteId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE note ${params.noteId} error:`, error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
