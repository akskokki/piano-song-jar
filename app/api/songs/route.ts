import { prisma } from "@/lib/prisma"
import { SongResponse, SongsResponse, ErrorResponse } from "@/lib/songs.types"
import { toSong, toSongs } from "@/lib/songs.serializer"
import { NextResponse } from "next/server"
import { createSongSchema } from "@/lib/songs.schemas"

export async function GET() {
  const songs = await prisma.song.findMany({
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json<SongsResponse>({ songs: toSongs(songs) })
}

export async function POST(request: Request) {
  const json = await request.json()
  const parsed = createSongSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json<ErrorResponse>(
      { error: "Invalid song payload" },
      { status: 400 },
    )
  }

  const song = await prisma.song.create({
    data: {
      title: parsed.data.title,
      hands: parsed.data.hands ?? 2,
    },
  })

  return NextResponse.json<SongResponse>(
    { song: toSong(song) },
    { status: 201 },
  )
}
