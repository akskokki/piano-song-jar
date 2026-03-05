import { prisma } from "@/lib/prisma"
import { SongResponse, ErrorResponse } from "@/lib/songs.types"
import { toSong } from "@/lib/songs.serializer"
import { NextResponse } from "next/server"
import { updateSongActivitySchema } from "@/lib/songs.schemas"
import { getActivityTimestampsBySongIds } from "@/lib/songs.activity"

type Params = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params
  const json = await request.json()
  const parsed = updateSongActivitySchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json<ErrorResponse>(
      { error: "Invalid song activity payload" },
      { status: 400 },
    )
  }

  const existingSong = await prisma.song.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!existingSong) {
    return NextResponse.json<ErrorResponse>(
      { error: "Song not found" },
      { status: 404 },
    )
  }

  await prisma.songActivity.create({
    data: {
      songId: id,
      type: parsed.data.type,
    },
  })

  const song = await prisma.song.findUniqueOrThrow({ where: { id } })
  const activityBySongId = await getActivityTimestampsBySongIds([song.id])

  return NextResponse.json<SongResponse>({
    song: toSong(song, activityBySongId[song.id]),
  })
}
