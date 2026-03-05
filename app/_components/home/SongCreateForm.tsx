import { FormEvent, useState } from "react"
import { SONG_TITLE_MAX_LENGTH } from "@/lib/song.constants"
import { getSongsErrorMessage, useCreateSongMutation } from "@/app/_hooks/songs"
import { Button } from "@/app/_components/ui/Button"
import { Text } from "@/app/_components/ui/Text"

export function SongCreateForm({ className }: { className?: string }) {
  const createSongMutation = useCreateSongMutation()
  const [songTitle, setSongTitle] = useState("")
  const [hands, setHands] = useState<1 | 2>(2)

  async function handleCreateSong(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextTitle = songTitle.trim()
    if (!nextTitle) {
      return
    }

    try {
      await createSongMutation.mutateAsync({ title: nextTitle, hands })
      setSongTitle("")
    } catch {
      return
    }
  }

  function toggleHands() {
    setHands(hands === 1 ? 2 : 1)
  }

  return (
    <div className={className}>
      <Text as="h2" variant="label" className="mb-3">
        Add new song
      </Text>

      <form onSubmit={handleCreateSong} className="flex gap-2">
        <input
          value={songTitle}
          onChange={(event) => setSongTitle(event.target.value)}
          placeholder="Song title"
          maxLength={SONG_TITLE_MAX_LENGTH}
          className="h-10 flex-1 rounded-md border border-zinc-300 px-3 text-sm"
        />
        <Button
          onClick={toggleHands}
          title={hands === 1 ? "1 hand" : "2 hands"}
          variant="outline"
        >
          {hands === 1 ? "✋" : "🙌"}
        </Button>
        <Button type="submit" variant="solid">
          Add
        </Button>
      </form>

      {createSongMutation.error && (
        <Text tone="danger" className="mb-3">
          {getSongsErrorMessage(
            createSongMutation.error,
            "Could not create song",
          )}
        </Text>
      )}
    </div>
  )
}
