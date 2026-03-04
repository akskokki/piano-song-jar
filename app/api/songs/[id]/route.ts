import { prisma } from '@/lib/prisma';
import { SONG_TITLE_MAX_LENGTH } from '@/lib/song.constants';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateSongSchema = z
  .object({
    title: z.string().trim().min(1).max(SONG_TITLE_MAX_LENGTH).optional(),
    hands: z.union([z.literal(1), z.literal(2)]).optional(),
  })
  .refine((data) => data.title !== undefined || data.hands !== undefined, {
    message: 'No update fields provided',
  });

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const json = await request.json();
  const parsed = updateSongSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid song payload' },
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
    data: parsed.data,
  });

  return NextResponse.json({ song });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  const existingSong = await prisma.song.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingSong) {
    return NextResponse.json({ error: 'Song not found' }, { status: 404 });
  }

  await prisma.song.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
