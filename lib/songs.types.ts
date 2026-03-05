export type Song = {
  id: string
  title: string
  hands: 1 | 2
  lastPlayedAt: string | null
  lastSkippedAt: string | null
  createdAt: string
}

import { z } from "zod"
import {
  songActivityTypeSchema,
  createSongSchema,
  updateSongSchema,
} from "./songs.schemas"

// Infer types from shared Zod schemas for perfect sync
export type SongActivityType = z.infer<typeof songActivityTypeSchema>

export type CreateSongInput = z.infer<typeof createSongSchema>

export type UpdateSongInput = z.infer<typeof updateSongSchema>

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
