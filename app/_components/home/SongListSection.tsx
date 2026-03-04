import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { useGetSongsQuery } from '@/app/_hooks/songs';
import { Button } from '@/app/_components/ui/Button';
import { SongCreateForm } from './SongCreateForm';
import { SongListItem } from './SongListItem';

export function SongListSection() {
  const { songs, isPending, errorMessage: queryError } = useGetSongsQuery();

  const [songsExpanded, setSongsExpanded] = useState(false);

  return (
    <section className="rounded-lg border border-zinc-200 p-4">
      {songsExpanded ? (
        <Button
          onClick={() => setSongsExpanded(false)}
          aria-expanded={songsExpanded}
          aria-label="Collapse songs list"
          title="Collapse"
          variant="ghost"
          className="-m-4 mb-0 flex h-auto w-[calc(100%+2rem)] items-center justify-between rounded-lg p-4 text-left text-inherit"
        >
          <h2 className="text-sm font-medium">Songs ({songs.length})</h2>
          <ChevronDownIcon size={20} className="rotate-180" />
        </Button>
      ) : (
        <Button
          onClick={() => setSongsExpanded(true)}
          aria-expanded={songsExpanded}
          aria-label="Expand songs list"
          title="Expand"
          variant="ghost"
          className="-m-4 flex h-auto w-[calc(100%+2rem)] items-center justify-between rounded-lg p-4 text-left text-inherit"
        >
          <h2 className="text-sm font-medium">Songs ({songs.length})</h2>
          <ChevronDownIcon size={20} />
        </Button>
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
                <SongListItem key={song.id} song={song} />
              ))}
            </ul>
          )}

          {queryError && (
            <p className="mt-3 text-sm text-red-600">{queryError}</p>
          )}
        </>
      )}
    </section>
  );
}
