'use client';

import { Check, Pencil } from 'lucide-react';
import { SONG_TITLE_MAX_LENGTH } from '@/lib/song.constants';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

type Song = {
  id: string;
  title: string;
  hands: 1 | 2;
  lastPlayedAt: string | null;
  createdAt: string;
};

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [songTitle, setSongTitle] = useState('');
  const [drawnSong, setDrawnSong] = useState<Song | null>(null);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [savingSongId, setSavingSongId] = useState<string | null>(null);
  const [savingHandsSongId, setSavingHandsSongId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const activeEditContainerRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    const loadSongs = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/songs');
        if (!response.ok) {
          throw new Error('Could not load songs');
        }
        const result = (await response.json()) as { songs: Song[] };
        setSongs(result.songs);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Could not load songs',
        );
      } finally {
        setLoading(false);
      }
    };

    void loadSongs();
  }, []);

  async function createSong(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = songTitle.trim();
    if (!nextTitle) {
      return;
    }

    if (nextTitle.length > SONG_TITLE_MAX_LENGTH) {
      setError(
        `Song title must be ${SONG_TITLE_MAX_LENGTH} characters or fewer`,
      );
      return;
    }

    setError('');
    const response = await fetch('/api/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: nextTitle }),
    });

    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setError(result.error ?? 'Could not create song');
      return;
    }

    const result = (await response.json()) as { song: Song };
    setSongTitle('');
    setSongs((current) => [result.song, ...current]);
  }

  function pickRandomSong(excludeSongId?: string) {
    const candidates = excludeSongId
      ? songs.filter((song) => song.id !== excludeSongId)
      : songs;

    if (candidates.length === 0) {
      return songs.length > 0 ? songs[0] : null;
    }

    const index = Math.floor(Math.random() * candidates.length);
    return candidates[index];
  }

  function drawRandomSong(excludeSongId?: string) {
    setError('');
    setDrawnSong(pickRandomSong(excludeSongId));
  }

  function skipDrawnSong() {
    if (!drawnSong) {
      return;
    }

    drawRandomSong(drawnSong.id);
  }

  async function markDrawnSongPlayed() {
    if (!drawnSong) {
      return;
    }

    const songId = drawnSong.id;
    const previousDrawnSong = drawnSong;

    setError('');

    drawRandomSong(songId);

    try {
      const response = await fetch(`/api/songs/${songId}/played`, {
        method: 'POST',
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error ?? 'Could not mark song as played');
      }

      const result = (await response.json()) as { song: Song };
      setSongs((current) =>
        current.map((song) => (song.id === songId ? result.song : song)),
      );
      setDrawnSong((current) =>
        current && current.id === songId ? result.song : current,
      );
    } catch (markError) {
      setDrawnSong(previousDrawnSong);
      setError(
        markError instanceof Error
          ? markError.message
          : 'Could not mark song as played',
      );
    }
  }

  function startEditingSong(song: Song) {
    setEditingSongId(song.id);
    setEditingTitle(song.title);
  }

  async function toggleSongHands(songId: string) {
    if (savingHandsSongId === songId) {
      return;
    }

    const targetSong = songs.find((song) => song.id === songId);
    if (!targetSong) {
      return;
    }

    const nextHands: 1 | 2 = targetSong.hands === 1 ? 2 : 1;
    const previousSongs = songs;
    const previousDrawnSong = drawnSong;

    setSavingHandsSongId(songId);
    setError('');

    setSongs((current) =>
      current.map((song) =>
        song.id === songId ? { ...song, hands: nextHands } : song,
      ),
    );
    setDrawnSong((current) =>
      current && current.id === songId
        ? { ...current, hands: nextHands }
        : current,
    );

    try {
      const response = await fetch(`/api/songs/${songId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hands: nextHands }),
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error ?? 'Could not update hand mode');
      }

      const result = (await response.json()) as { song: Song };
      setSongs((current) =>
        current.map((song) => (song.id === songId ? result.song : song)),
      );
      setDrawnSong((current) =>
        current && current.id === songId ? result.song : current,
      );
    } catch (toggleError) {
      setSongs(previousSongs);
      setDrawnSong(previousDrawnSong);
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : 'Could not update hand mode',
      );
    } finally {
      setSavingHandsSongId(null);
    }
  }

  const saveSongTitle = useCallback(
    async (songId: string) => {
      const nextTitle = editingTitle.trim();
      const currentSong = songs.find((song) => song.id === songId);

      if (
        !nextTitle ||
        nextTitle.length > SONG_TITLE_MAX_LENGTH ||
        !currentSong ||
        currentSong.title === nextTitle
      ) {
        setEditingSongId(null);
        setEditingTitle('');
        return;
      }

      const previousSongs = songs;
      const previousDrawnSong = drawnSong;

      setSavingSongId(songId);
      setError('');

      setSongs((current) =>
        current.map((song) =>
          song.id === songId ? { ...song, title: nextTitle } : song,
        ),
      );
      setDrawnSong((current) =>
        current && current.id === songId
          ? { ...current, title: nextTitle }
          : current,
      );
      setEditingSongId(null);
      setEditingTitle('');

      try {
        const response = await fetch(`/api/songs/${songId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: nextTitle }),
        });

        if (!response.ok) {
          const result = (await response.json()) as { error?: string };
          throw new Error(result.error ?? 'Could not update song');
        }

        const result = (await response.json()) as { song: Song };

        setSongs((current) =>
          current.map((song) => (song.id === songId ? result.song : song)),
        );
        setDrawnSong((current) =>
          current && current.id === songId ? result.song : current,
        );
      } catch (saveError) {
        setSongs(previousSongs);
        setDrawnSong(previousDrawnSong);
        setError(
          saveError instanceof Error
            ? saveError.message
            : 'Could not update song',
        );
      } finally {
        setSavingSongId(null);
      }
    },
    [drawnSong, editingTitle, songs],
  );

  useEffect(() => {
    if (!editingSongId) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (savingSongId === editingSongId) {
        return;
      }

      const target = event.target as Node | null;
      if (!target) {
        return;
      }

      if (activeEditContainerRef.current?.contains(target)) {
        return;
      }

      void saveSongTitle(editingSongId);
    };

    document.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [editingSongId, saveSongTitle, savingSongId]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-4 px-4 py-6 sm:px-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Piano Song Jar</h1>
        <p className="text-sm text-zinc-500">
          Save songs you know and draw one at random.
        </p>
      </header>

      <section className="rounded-lg border border-zinc-200 p-4">
        <h2 className="mb-3 text-sm font-medium">Add song</h2>
        <form onSubmit={createSong} className="flex gap-2">
          <input
            value={songTitle}
            onChange={(event) => setSongTitle(event.target.value)}
            placeholder="Song title"
            maxLength={SONG_TITLE_MAX_LENGTH}
            className="h-10 flex-1 rounded-md border border-zinc-300 px-3 text-sm"
          />
          <button
            type="submit"
            className="h-10 rounded-md bg-foreground px-4 text-sm font-medium text-background"
          >
            Add
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-200 p-4">
        <h2 className="mb-3 text-sm font-medium">Draw random song</h2>
        {!drawnSong ? (
          <button
            type="button"
            onClick={() => drawRandomSong()}
            disabled={songs.length === 0}
            className="h-24 w-full rounded-md bg-foreground px-4 text-base font-semibold text-background disabled:opacity-50"
          >
            Draw Song
          </button>
        ) : (
          <div className="mt-3 rounded-md border border-zinc-200 p-3">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={skipDrawnSong}
                className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 px-3 text-sm font-medium"
              >
                Skip
              </button>

              <div className="min-w-0 flex-1 px-2 text-center">
                <p className="text-base font-medium wrap-break-word">
                  {drawnSong.title}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {drawnSong.hands === 2 ? '🙌 2 hands' : '✋ 1 hand'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void markDrawnSongPlayed()}
                className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 px-3 text-sm font-medium"
              >
                Played
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 p-4">
        <h2 className="mb-3 text-sm font-medium">Songs ({songs.length})</h2>
        {loading ? (
          <p className="text-sm text-zinc-500">Loading songs...</p>
        ) : songs.length === 0 ? (
          <p className="text-sm text-zinc-500">No songs yet.</p>
        ) : (
          <ul className="space-y-2">
            {songs.map((song) => (
              <li
                key={song.id}
                ref={editingSongId === song.id ? activeEditContainerRef : null}
                className="rounded-md border border-zinc-200 p-3 text-sm"
              >
                <div className="flex items-center gap-2 justify-between">
                  {editingSongId === song.id ? (
                    <input
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      maxLength={SONG_TITLE_MAX_LENGTH}
                      className="h-10 flex-1 rounded-md border border-zinc-300 px-3 text-sm"
                      placeholder="Song title"
                      disabled={savingSongId === song.id}
                    />
                  ) : (
                    <p className="min-w-0 flex-1 wrap-break-word font-medium">
                      {song.title}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => void toggleSongHands(song.id)}
                    className="flex h-10 min-w-10 shrink-0 items-center justify-center gap-0.5 rounded-md border border-zinc-300 px-2"
                    aria-label={
                      song.hands === 1 ? 'Set to two hands' : 'Set to one hand'
                    }
                    title={song.hands === 1 ? 'One hand' : 'Two hands'}
                  >
                    <span>{song.hands === 2 ? '🙌' : '✋'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (editingSongId === song.id) {
                        void saveSongTitle(song.id);
                        return;
                      }
                      startEditingSong(song);
                    }}
                    disabled={
                      savingSongId === song.id ||
                      (editingSongId === song.id && !editingTitle.trim())
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-zinc-300 disabled:opacity-50"
                    aria-label={
                      editingSongId === song.id
                        ? 'Save song name'
                        : 'Edit song name'
                    }
                    title={editingSongId === song.id ? 'Save' : 'Edit'}
                  >
                    {editingSongId === song.id ? (
                      <Check size={16} />
                    ) : (
                      <Pencil size={16} />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </main>
  );
}
