import { z } from "zod"
import { SONG_TITLE_MAX_LENGTH } from "./song.constants"

// Shared Zod schemas for API validation and type inference
export const songActivityTypeSchema = z.union([
  z.literal("played"),
  z.literal("skipped"),
])

export const createSongSchema = z.object({
  title: z.string().trim().min(1).max(SONG_TITLE_MAX_LENGTH),
  hands: z.union([z.literal(1), z.literal(2)]).optional(),
})

export const updateSongSchema = z
  .object({
    title: z.string().trim().min(1).max(SONG_TITLE_MAX_LENGTH).optional(),
    hands: z.union([z.literal(1), z.literal(2)]).optional(),
  })
  .refine((data) => data.title !== undefined || data.hands !== undefined, {
    message: "No update fields provided",
  })

export const updateSongActivitySchema = z.object({
  type: songActivityTypeSchema,
})
