import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;

  const existingSong = await prisma.song.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingSong) {
    return NextResponse.json({ error: 'Song not found' }, { status: 404 });
  }

  const song = await prisma.song.update({
    where: { id },
    data: {
      lastPlayedAt: new Date(),
    },
  });

  return NextResponse.json({ song });
}
