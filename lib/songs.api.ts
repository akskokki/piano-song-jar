import axios, { AxiosError } from "axios"
import {
  SongActivityType,
  UpdateSongInput,
  SongResponse,
  SongsResponse,
} from "@/lib/songs.types"

const apiClient = axios.create({
  headers: { "Content-Type": "application/json" },
})

function parseApiError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof AxiosError) {
    const errorMessage = error.response?.data?.error

    if (typeof errorMessage === "string" && errorMessage.length > 0) {
      return new Error(errorMessage)
    }
  }

  return new Error(fallbackMessage)
}

export async function fetchSongs() {
  try {
    const { data } = await apiClient.get<SongsResponse>("/api/songs")
    return data.songs
  } catch (error) {
    throw parseApiError(error, "Could not load songs")
  }
}

export async function createSong(title: string, hands?: 1 | 2) {
  try {
    const { data } = await apiClient.post<SongResponse>("/api/songs", {
      title,
      hands,
    })

    return data.song
  } catch (error) {
    throw parseApiError(error, "Could not create song")
  }
}

export async function updateSong(songId: string, data: UpdateSongInput) {
  try {
    const { data: responseData } = await apiClient.patch<SongResponse>(
      `/api/songs/${songId}`,
      data,
    )

    return responseData.song
  } catch (error) {
    throw parseApiError(error, "Could not update song")
  }
}

export async function markSongActivity(songId: string, type: SongActivityType) {
  try {
    const { data } = await apiClient.post<SongResponse>(
      `/api/songs/${songId}/activity`,
      { type },
    )

    return data.song
  } catch (error) {
    throw parseApiError(error, "Could not update song activity")
  }
}

export async function deleteSong(songId: string) {
  try {
    await apiClient.delete(`/api/songs/${songId}`)
  } catch (error) {
    throw parseApiError(error, "Could not delete song")
  }
}
