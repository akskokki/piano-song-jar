import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateSongActivitySchema = z.object({
  type: z.union([z.literal('played'), z.literal('skipped')]),
});

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const json = await request.json();
  const parsed = updateSongActivitySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid song activity payload' },
      { status: 400 },
    );
  }

  const existingSong = await prisma.song.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingSong) {
    return NextResponse.json({ error: 'Song not found' }, { status: 404 });
  }

  const song = await prisma.song.update({
    where: { id },
    data:
      parsed.data.type === 'played'
        ? { lastPlayedAt: new Date() }
        : { lastSkippedAt: new Date() },
  });

  return NextResponse.json({ song });
}
