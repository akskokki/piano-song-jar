import type { Song as PrismaSong } from "@prisma/client"
import type { Song } from "@/lib/songs.types"

function normalizeHands(hands: number): 1 | 2 {
  if (hands === 1 || hands === 2) {
    return hands
  }

  throw new Error(`Invalid song hands value: ${hands}`)
}

export function toSong(song: PrismaSong): Song {
  return {
    id: song.id,
    title: song.title,
    hands: normalizeHands(song.hands),
    lastPlayedAt: song.lastPlayedAt?.toISOString() ?? null,
    lastSkippedAt: song.lastSkippedAt?.toISOString() ?? null,
    createdAt: song.createdAt.toISOString(),
  }
}

export function toSongs(songs: PrismaSong[]): Song[] {
  return songs.map(toSong)
}
