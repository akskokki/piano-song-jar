import { CheckIcon, PencilIcon } from 'lucide-react';
import { Ref } from 'react';
import { SONG_TITLE_MAX_LENGTH } from '@/lib/song.constants';
import { Song } from './types';

type SongListItemProps = {
  song: Song;
  isEditing: boolean;
  editingTitle: string;
  savingSongId: string | null;
  savingHandsSongId: string | null;
  containerRef: Ref<HTMLLIElement> | null;
  onEditingTitleChange: (value: string, textarea: HTMLTextAreaElement) => void;
  onToggleHands: (songId: string) => void;
  onSave: (songId: string) => void;
  onStartEdit: (song: Song) => void;
};

export function SongListItem({
  song,
  isEditing,
  editingTitle,
  savingSongId,
  savingHandsSongId,
  containerRef,
  onEditingTitleChange,
  onToggleHands,
  onSave,
  onStartEdit,
}: SongListItemProps) {
  return (
    <li
      ref={containerRef}
      className="rounded-md border border-zinc-200 p-3 text-sm"
    >
      <div className="flex items-center gap-2 justify-between">
        {isEditing ? (
          <textarea
            value={editingTitle}
            onChange={(event) =>
              onEditingTitleChange(event.target.value, event.currentTarget)
            }
            rows={1}
            maxLength={SONG_TITLE_MAX_LENGTH}
            className="min-h-10 flex-1 resize-none overflow-hidden rounded-md border border-zinc-300 px-3 py-2 text-sm"
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
          onClick={() => onToggleHands(song.id)}
          disabled={!isEditing || savingHandsSongId === song.id}
          className={`flex h-10 min-w-10 shrink-0 items-center justify-center gap-0.5 rounded-md px-2 ${
            isEditing ? 'border border-zinc-300' : 'border border-transparent'
          } disabled:cursor-default`}
          aria-label={song.hands === 1 ? 'Set to two hands' : 'Set to one hand'}
          title={song.hands === 1 ? 'One hand' : 'Two hands'}
        >
          <span>{song.hands === 2 ? '🙌' : '✋'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (isEditing) {
              onSave(song.id);
              return;
            }
            onStartEdit(song);
          }}
          disabled={
            savingSongId === song.id || (isEditing && !editingTitle.trim())
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-zinc-300 disabled:opacity-50"
          aria-label={isEditing ? 'Save song name' : 'Edit song name'}
          title={isEditing ? 'Save' : 'Edit'}
        >
          {isEditing ? <CheckIcon size={16} /> : <PencilIcon size={16} />}
        </button>
      </div>
    </li>
  );
}
