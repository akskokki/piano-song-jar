import type { Song as PrismaSong } from "@prisma/client"
import type { Song } from "@/lib/songs.types"

export type SongActivityTimestamps = {
  lastPlayedAt: Date | null
  lastSkippedAt: Date | null
}

export type SongActivitySummary = SongActivityTimestamps & {
  playedCount: number
}

function normalizeHands(hands: number): 1 | 2 {
  if (hands === 1 || hands === 2) {
    return hands
  }

  throw new Error(`Invalid song hands value: ${hands}`)
}

export function toSong(
  song: PrismaSong,
  activity?: SongActivitySummary,
): Song {
  const lastPlayedAt = activity?.lastPlayedAt ?? null
  const lastSkippedAt = activity?.lastSkippedAt ?? null
  const playedCount = activity?.playedCount ?? 0

  return {
    id: song.id,
    title: song.title,
    hands: normalizeHands(song.hands),
    lastPlayedAt: lastPlayedAt?.toISOString() ?? null,
    lastSkippedAt: lastSkippedAt?.toISOString() ?? null,
    playedCount,
    createdAt: song.createdAt.toISOString(),
  }
}

export function toSongs(
  songs: PrismaSong[],
  activityBySongId: Record<string, SongActivitySummary> = {},
): Song[] {
  return songs.map((song) => toSong(song, activityBySongId[song.id]))
}
