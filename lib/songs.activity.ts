import { SongActivityType } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { SongActivitySummary } from "@/lib/songs.serializer"

export async function getActivityTimestampsBySongIds(
  songIds: string[],
): Promise<Record<string, SongActivitySummary>> {
  if (songIds.length === 0) {
    return {}
  }

  const groupedActivities = await prisma.songActivity.groupBy({
    by: ["songId", "type"],
    where: { songId: { in: songIds } },
    _max: { createdAt: true },
    _count: { _all: true },
  })

  const activityBySongId = Object.fromEntries(
    songIds.map((songId) => [
      songId,
      {
        lastPlayedAt: null,
        lastSkippedAt: null,
        playedCount: 0,
      },
    ]),
  ) as Record<string, SongActivitySummary>

  for (const activity of groupedActivities) {
    const songActivity = activityBySongId[activity.songId]

    if (!songActivity) {
      continue
    }

    if (activity.type === SongActivityType.played) {
      songActivity.lastPlayedAt = activity._max.createdAt
      songActivity.playedCount = activity._count._all
    } else if (activity.type === SongActivityType.skipped) {
      songActivity.lastSkippedAt = activity._max.createdAt
    }
  }

  return activityBySongId
}
