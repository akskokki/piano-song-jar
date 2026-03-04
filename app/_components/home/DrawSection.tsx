import { CheckIcon, PencilIcon, XIcon } from 'lucide-react';
import {
  getSongsErrorMessage,
  useGetSongsQuery,
  useMarkSongActivityMutation,
} from '@/app/_hooks/songs';
import { useMemo, useState } from 'react';
import { Button } from '@/app/_components/ui/Button';
import { LastPlayedLabel } from './LastPlayedLabel';
import { SongEditModal } from './SongEditModal';

export function DrawSection() {
  const { songs } = useGetSongsQuery();
  const markSongActivityMutation = useMarkSongActivityMutation();
  const [drawnSongId, setDrawnSongId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const drawnSong = useMemo(
    () => songs.find((song) => song.id === drawnSongId) ?? null,
    [drawnSongId, songs],
  );

  function pickRandomSongId(excludeSongId?: string) {
    const candidates = excludeSongId
      ? songs.filter((song) => song.id !== excludeSongId)
      : songs;

    if (candidates.length === 0) {
      return songs.length > 0 ? songs[0].id : null;
    }

    const index = Math.floor(Math.random() * candidates.length);
    return candidates[index].id;
  }

  function drawRandomSong(excludeSongId?: string) {
    markSongActivityMutation.reset();
    setDrawnSongId(pickRandomSongId(excludeSongId));
  }

  async function skipDrawnSong() {
    if (!drawnSong) {
      return;
    }

    const songId = drawnSong.id;
    const previousDrawnSongId = drawnSongId;

    drawRandomSong(songId);

    try {
      await markSongActivityMutation.mutateAsync({ songId, type: 'skipped' });
    } catch {
      setDrawnSongId(previousDrawnSongId);
    }
  }

  async function markDrawnSongPlayed() {
    if (!drawnSong) {
      return;
    }

    const songId = drawnSong.id;
    const previousDrawnSongId = drawnSongId;

    drawRandomSong(songId);

    try {
      await markSongActivityMutation.mutateAsync({ songId, type: 'played' });
    } catch {
      setDrawnSongId(previousDrawnSongId);
    }
  }

  return (
    <section className="rounded-lg border border-zinc-200 p-4">
      <h2 className="mb-3 text-sm font-medium">Draw random song</h2>
      {!drawnSong ? (
        <Button
          onClick={() => drawRandomSong()}
          disabled={songs.length === 0}
          variant="solid"
          className="h-24 w-full text-base font-semibold"
        >
          Draw Song
        </Button>
      ) : (
        <div className="mt-3 rounded-md border border-zinc-200 p-3">
          <div className="flex items-center justify-between gap-2">
            <Button
              onClick={skipDrawnSong}
              aria-label="Skip song"
              title="Skip"
              size="icon"
              icon={<XIcon size={16} />}
            ></Button>

            <div className="min-w-0 flex-1 px-2 text-center">
              <p className="text-base font-medium wrap-break-word">
                {drawnSong.title}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {drawnSong.hands === 2 ? '🙌 2 hands' : '✋ 1 hand'}
              </p>
              <LastPlayedLabel lastPlayedAt={drawnSong.lastPlayedAt} />
              <Button
                onClick={() => setIsEditModalOpen(true)}
                variant="ghost"
                size="sm"
                className="mt-2 h-auto text-xs"
                hitSlop={8}
                icon={<PencilIcon size={12} />}
              >
                Edit
              </Button>
            </div>

            <Button
              onClick={() => void markDrawnSongPlayed()}
              aria-label="Mark song as played"
              title="Played"
              size="icon"
              icon={<CheckIcon size={16} />}
            ></Button>
          </div>
        </div>
      )}

      {drawnSong && isEditModalOpen && (
        <SongEditModal
          song={drawnSong}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {markSongActivityMutation.error && (
        <p className="mt-3 text-sm text-red-600">
          {getSongsErrorMessage(
            markSongActivityMutation.error,
            'Could not update song activity',
          )}
        </p>
      )}
    </section>
  );
}
