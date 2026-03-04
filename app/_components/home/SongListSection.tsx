import { ChevronDownIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SONG_TITLE_MAX_LENGTH } from '@/lib/song.constants';
import {
  getSongsErrorMessage,
  useGetSongsQuery,
  useUpdateSongMutation,
} from '@/app/_hooks/songs';
import { SongCreateForm } from './SongCreateForm';
import { SongListItem } from './SongListItem';
import { Song } from './types';

export function SongListSection() {
  const { songs, isPending, errorMessage: queryError } = useGetSongsQuery();
  const updateSongMutation = useUpdateSongMutation();

  const [songsExpanded, setSongsExpanded] = useState(false);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [savingSongId, setSavingSongId] = useState<string | null>(null);
  const [savingHandsSongId, setSavingHandsSongId] = useState<string | null>(
    null,
  );
  const activeEditContainerRef = useRef<HTMLLIElement | null>(null);

  function autoResizeTextarea(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  const handleSaveSongTitle = useCallback(
    async (songId: string) => {
      if (savingSongId === songId) {
        return;
      }

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

      setSavingSongId(songId);
      setEditingSongId(null);
      setEditingTitle('');

      try {
        await updateSongMutation.mutateAsync({ songId, title: nextTitle });
      } finally {
        setSavingSongId(null);
      }
    },
    [editingTitle, savingSongId, songs, updateSongMutation],
  );

  async function handleToggleSongHands(songId: string) {
    if (savingHandsSongId === songId) {
      return;
    }

    setSavingHandsSongId(songId);

    try {
      const targetSong = songs.find((song) => song.id === songId);
      if (!targetSong) {
        return;
      }

      const nextHands: 1 | 2 = targetSong.hands === 1 ? 2 : 1;
      await updateSongMutation.mutateAsync({ songId, hands: nextHands });
    } finally {
      setSavingHandsSongId(null);
    }
  }

  function startEditingSong(song: Song) {
    setEditingSongId(song.id);
    setEditingTitle(song.title);
  }

  useEffect(() => {
    if (!editingSongId) {
      return;
    }

    const textarea = activeEditContainerRef.current?.querySelector('textarea');
    if (textarea) {
      autoResizeTextarea(textarea);
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

      void handleSaveSongTitle(editingSongId);
    };

    document.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [editingSongId, handleSaveSongTitle, savingSongId]);

  return (
    <section className="rounded-lg border border-zinc-200 p-4">
      {songsExpanded ? (
        <button
          type="button"
          onClick={() => setSongsExpanded(false)}
          aria-expanded={songsExpanded}
          aria-label="Collapse songs list"
          title="Collapse"
          className="-m-4 mb-0 flex w-[calc(100%+2rem)] items-center justify-between rounded-lg p-4 text-left"
        >
          <h2 className="text-sm font-medium">Songs ({songs.length})</h2>
          <ChevronDownIcon size={20} className="rotate-180" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setSongsExpanded(true)}
          aria-expanded={songsExpanded}
          aria-label="Expand songs list"
          title="Expand"
          className="-m-4 flex w-[calc(100%+2rem)] items-center justify-between rounded-lg p-4 text-left"
        >
          <h2 className="text-sm font-medium">Songs ({songs.length})</h2>
          <ChevronDownIcon size={20} />
        </button>
      )}

      {songsExpanded && (
        <>
          <SongCreateForm />

          {isPending ? (
            <p className="text-sm text-zinc-500">Loading songs...</p>
          ) : songs.length === 0 ? (
            <p className="text-sm text-zinc-500">No songs yet.</p>
          ) : (
            <ul className="space-y-2">
              {songs.map((song) => (
                <SongListItem
                  key={song.id}
                  song={song}
                  isEditing={editingSongId === song.id}
                  editingTitle={editingTitle}
                  savingSongId={savingSongId}
                  savingHandsSongId={savingHandsSongId}
                  containerRef={
                    editingSongId === song.id ? activeEditContainerRef : null
                  }
                  onEditingTitleChange={(value, textarea) => {
                    setEditingTitle(value);
                    autoResizeTextarea(textarea);
                  }}
                  onToggleHands={(songId) => {
                    void handleToggleSongHands(songId);
                  }}
                  onSave={(songId) => {
                    void handleSaveSongTitle(songId);
                  }}
                  onStartEdit={startEditingSong}
                />
              ))}
            </ul>
          )}

          {(updateSongMutation.error || queryError) && (
            <p className="mt-3 text-sm text-red-600">
              {getSongsErrorMessage(updateSongMutation.error, queryError) ||
                queryError}
            </p>
          )}
        </>
      )}
    </section>
  );
}
