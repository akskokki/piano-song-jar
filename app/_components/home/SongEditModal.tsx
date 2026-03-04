import {
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { SONG_TITLE_MAX_LENGTH } from "@/lib/song.constants";
import {
  useDeleteSongMutation,
  getSongsErrorMessage,
  useUpdateSongMutation,
} from "@/app/_hooks/songs";
import { Button } from "@/app/_components/ui/Button";
import { Song } from "./types";

type SongEditModalProps = {
  song: Song;
  onClose: () => void;
};

function autoResizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export function SongEditModal({ song, onClose }: SongEditModalProps) {
  const updateSongMutation = useUpdateSongMutation();
  const deleteSongMutation = useDeleteSongMutation();
  const titleId = useId();
  const [editingTitle, setEditingTitle] = useState(song.title);
  const [editingHands, setEditingHands] = useState<1 | 2>(song.hands);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      autoResizeTextarea(textarea);
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !updateSongMutation.isPending &&
        !deleteSongMutation.isPending
      ) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [deleteSongMutation.isPending, onClose, updateSongMutation.isPending]);

  const isPending =
    updateSongMutation.isPending || deleteSongMutation.isPending;

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") {
      return;
    }

    const container = dialogRef.current;
    if (!container) {
      return;
    }

    const focusableSelectors = [
      "button:not([disabled])",
      "textarea:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "a[href]",
      '[tabindex]:not([tabindex="-1"])',
    ];

    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelectors.join(",")),
    ).filter((element) => !element.hasAttribute("disabled"));

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (
        activeElement === firstElement ||
        !container.contains(activeElement)
      ) {
        event.preventDefault();
        lastElement.focus();
      }
      return;
    }

    if (activeElement === lastElement || !container.contains(activeElement)) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  const trimmedTitle = editingTitle.trim();
  const hasChanges = trimmedTitle !== song.title || editingHands !== song.hands;
  const isSaveDisabled =
    isPending ||
    !trimmedTitle ||
    trimmedTitle.length > SONG_TITLE_MAX_LENGTH ||
    !hasChanges;

  async function handleSave() {
    if (isSaveDisabled) {
      return;
    }

    try {
      await updateSongMutation.mutateAsync({
        songId: song.id,
        title: trimmedTitle !== song.title ? trimmedTitle : undefined,
        hands: editingHands !== song.hands ? editingHands : undefined,
      });

      onClose();
    } catch {
      return;
    }
  }

  async function handleDelete() {
    if (isPending) {
      return;
    }

    if (!isDeleteConfirming) {
      setIsDeleteConfirming(true);
      return;
    }

    try {
      await deleteSongMutation.mutateAsync({ songId: song.id });
      onClose();
    } catch {
      return;
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleDialogKeyDown}
        className="bg-background w-full max-w-md rounded-lg border border-zinc-200 p-4 shadow-sm"
      >
        <h3 id={titleId} className="mb-3 text-sm font-medium">
          Edit song
        </h3>

        <label
          htmlFor={`${titleId}-title`}
          className="mb-1 block text-xs text-zinc-600"
        >
          Title
        </label>
        <textarea
          id={`${titleId}-title`}
          ref={textareaRef}
          value={editingTitle}
          onChange={(event) => {
            setEditingTitle(event.target.value);
            autoResizeTextarea(event.currentTarget);
          }}
          rows={1}
          maxLength={SONG_TITLE_MAX_LENGTH}
          className="min-h-10 w-full resize-none overflow-hidden rounded-md border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Song title"
          disabled={isPending}
        />

        <div className="mt-3">
          <p className="mb-1 text-xs text-zinc-600">Hands</p>
          <Button
            onClick={() =>
              setEditingHands((current) => (current === 1 ? 2 : 1))
            }
            disabled={isPending}
            size="md"
            className="min-w-24 px-3"
            aria-label={
              editingHands === 1 ? "Set to two hands" : "Set to one hand"
            }
            icon={<span>{editingHands === 2 ? "🙌" : "✋"}</span>}
          >
            <span>{editingHands === 2 ? "2 hands" : "1 hand"}</span>
          </Button>
        </div>

        {(updateSongMutation.error || deleteSongMutation.error) && (
          <p className="mt-3 text-sm text-red-600">
            {getSongsErrorMessage(
              updateSongMutation.error ?? deleteSongMutation.error,
              updateSongMutation.error
                ? "Could not update song"
                : "Could not delete song",
            )}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button
            onClick={() => {
              void handleDelete();
            }}
            disabled={isPending}
            className="px-3 text-red-600"
          >
            {isDeleteConfirming ? "Confirm delete" : "Delete"}
          </Button>

          <div className="flex items-center justify-end gap-2">
            <Button
              onClick={() => {
                if (isDeleteConfirming) {
                  setIsDeleteConfirming(false);
                  return;
                }

                onClose();
              }}
              disabled={isPending}
              className="px-3"
            >
              {isDeleteConfirming ? "Keep song" : "Cancel"}
            </Button>
            <Button
              onClick={() => {
                void handleSave();
              }}
              disabled={isSaveDisabled}
              variant="solid"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
