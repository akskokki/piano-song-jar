import { PencilIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/app/_components/ui/Button"
import { Text } from "@/app/_components/ui/Text"
import { SongEditModal } from "./SongEditModal"
import { LastPlayedLabel } from "./LastPlayedLabel"
import { Song } from "./types"

type SongListItemProps = {
  song: Song
}

export function SongListItem({ song }: SongListItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  return (
    <li className="rounded-md border border-zinc-200 p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Text as="h2" variant="label">
            {song.title}
          </Text>
          <Text variant="caption" tone="muted" className="mt-1">
            {song.hands === 2 ? "🙌 2 hands" : "✋ 1 hand"}
          </Text>
          <LastPlayedLabel lastPlayedAt={song.lastPlayedAt} />
        </div>

        <Button
          onClick={() => setIsEditModalOpen(true)}
          size="icon"
          className="shrink-0"
          icon={<PencilIcon size={16} />}
          aria-label="Edit song"
          title="Edit"
        />
      </div>

      {isEditModalOpen && (
        <SongEditModal song={song} onClose={() => setIsEditModalOpen(false)} />
      )}
    </li>
  )
}
