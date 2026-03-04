import { prisma } from "@/lib/prisma";
import { SONG_TITLE_MAX_LENGTH } from "@/lib/song.constants";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSongSchema = z.object({
  title: z.string().trim().min(1).max(SONG_TITLE_MAX_LENGTH),
  hands: z.union([z.literal(1), z.literal(2)]).optional(),
});

export async function GET() {
  const songs = await prisma.song.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ songs });
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = createSongSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid song payload" },
      { status: 400 },
    );
  }

  const song = await prisma.song.create({
    data: {
      title: parsed.data.title,
      hands: parsed.data.hands ?? 2,
    },
  });

  return NextResponse.json({ song }, { status: 201 });
}
