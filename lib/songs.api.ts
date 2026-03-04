import { Song, SongUpdateInput } from "@/lib/songs.types";

type ApiErrorBody = {
  error?: string;
};

async function parseApiError(
  response: Response,
  fallbackMessage: string,
): Promise<Error> {
  try {
    const result = (await response.json()) as ApiErrorBody;
    return new Error(result.error ?? fallbackMessage);
  } catch {
    return new Error(fallbackMessage);
  }
}

export async function fetchSongs() {
  const response = await fetch("/api/songs");
  if (!response.ok) {
    throw await parseApiError(response, "Could not load songs");
  }

  const result = (await response.json()) as { songs: Song[] };
  return result.songs;
}

export async function createSong(title: string) {
  const response = await fetch("/api/songs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Could not create song");
  }

  const result = (await response.json()) as { song: Song };
  return result.song;
}

export async function updateSong(songId: string, data: SongUpdateInput) {
  const response = await fetch(`/api/songs/${songId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Could not update song");
  }

  const result = (await response.json()) as { song: Song };
  return result.song;
}

export async function markSongPlayed(songId: string) {
  const response = await fetch(`/api/songs/${songId}/played`, {
    method: "POST",
  });

  if (!response.ok) {
    throw await parseApiError(response, "Could not mark song as played");
  }

  const result = (await response.json()) as { song: Song };
  return result.song;
}

export async function deleteSong(songId: string) {
  const response = await fetch(`/api/songs/${songId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw await parseApiError(response, "Could not delete song");
  }
}
