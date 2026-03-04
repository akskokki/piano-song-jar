export type Song = {
  id: string
  title: string
  hands: 1 | 2
  lastPlayedAt: string | null
  lastSkippedAt: string | null
  createdAt: string
}

export type SongActivityType = "played" | "skipped"

export type SongUpdateInput = {
  title?: string
  hands?: 1 | 2
}

export type SongsResponse = {
  songs: Song[]
}

export type SongResponse = {
  song: Song
}

export type SuccessResponse = {
  success: true
}

export type ErrorResponse = {
  error: string
}
