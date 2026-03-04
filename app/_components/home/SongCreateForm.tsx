import { FormEvent, useState } from 'react';
import { SONG_TITLE_MAX_LENGTH } from '@/lib/song.constants';
import {
  getSongsErrorMessage,
  useCreateSongMutation,
} from '@/app/_hooks/songs';
import { Button } from '@/app/_components/ui/Button';

export function SongCreateForm() {
  const createSongMutation = useCreateSongMutation();
  const [songTitle, setSongTitle] = useState('');

  async function handleCreateSong(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = songTitle.trim();
    if (!nextTitle) {
      return;
    }

    try {
      await createSongMutation.mutateAsync(nextTitle);
      setSongTitle('');
    } catch {
      return;
    }
  }

  return (
    <>
      <form onSubmit={handleCreateSong} className="mb-3 flex gap-2">
        <input
          value={songTitle}
          onChange={(event) => setSongTitle(event.target.value)}
          placeholder="Song title"
          maxLength={SONG_TITLE_MAX_LENGTH}
          className="h-10 flex-1 rounded-md border border-zinc-300 px-3 text-sm"
        />
        <Button type="submit" variant="solid">
          Add
        </Button>
      </form>

      {createSongMutation.error && (
        <p className="mb-3 text-sm text-red-600">
          {getSongsErrorMessage(
            createSongMutation.error,
            'Could not create song',
          )}
        </p>
      )}
    </>
  );
}
