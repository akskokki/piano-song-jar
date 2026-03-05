import { CheckIcon, PencilIcon, SkipForwardIcon, Undo2Icon } from "lucide-react"
import {
  getSongsErrorMessage,
  useGetSongsQuery,
  useMarkSongActivityMutation,
} from "@/app/_hooks/songs"
import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/app/_components/ui/Button"
import { Text } from "@/app/_components/ui/Text"
import { LastPlayedLabel } from "./LastPlayedLabel"
import { SongEditModal } from "./SongEditModal"

type DrawTransitionIntent = "default" | "played" | "skipped"

const CARD_X_START = "calc(-100% - 32px)"
const CARD_X_END = "calc(100% + 32px)"
const CARD_EASE: [number, number, number, number] = [0.3, 0.5, 0.6, 1]

const cardSlideVariants = {
  initial: { x: CARD_X_START },
  animate: {
    x: "0%",
    transition: {
      type: "tween" as const,
      duration: 0.9,
      ease: CARD_EASE,
    },
  },
  exit: (intent: DrawTransitionIntent) => ({
    x: intent === "skipped" ? CARD_X_START : CARD_X_END,
    transition: {
      type: "tween" as const,
      duration: 0.9,
      ease: CARD_EASE,
    },
  }),
}

export function DrawSection() {
  const { songs } = useGetSongsQuery()
  const markSongActivityMutation = useMarkSongActivityMutation()
  const [drawnSongId, setDrawnSongId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [previousSongId, setPreviousSongId] = useState<string | null>(null)
  const [transitionIntent, setTransitionIntent] =
    useState<DrawTransitionIntent>("default")

  const drawnSong = useMemo(
    () => songs.find((song) => song.id === drawnSongId) ?? null,
    [drawnSongId, songs],
  )

  function pickRandomSongId(excludeSongId?: string) {
    const candidates = excludeSongId
      ? songs.filter((song) => song.id !== excludeSongId)
      : songs

    if (candidates.length === 0) {
      return songs.length > 0 ? songs[0].id : null
    }

    const index = Math.floor(Math.random() * candidates.length)
    return candidates[index].id
  }

  function drawRandomSong(
    excludeSongId?: string,
    intent: DrawTransitionIntent = "default",
  ) {
    setPreviousSongId(drawnSongId)
    setTransitionIntent(intent)
    markSongActivityMutation.reset()
    setDrawnSongId(pickRandomSongId(excludeSongId))
  }

  async function skipDrawnSong() {
    if (!drawnSong) {
      return
    }

    const songId = drawnSong.id
    const previousDrawnSongId = drawnSongId

    drawRandomSong(songId, "skipped")

    try {
      await markSongActivityMutation.mutateAsync({ songId, type: "skipped" })
    } catch {
      setTransitionIntent("default")
      setDrawnSongId(previousDrawnSongId)
    }
  }

  async function markDrawnSongPlayed() {
    if (!drawnSong) {
      return
    }

    const songId = drawnSong.id
    const previousDrawnSongId = drawnSongId

    drawRandomSong(songId, "played")

    try {
      await markSongActivityMutation.mutateAsync({ songId, type: "played" })
    } catch {
      setTransitionIntent("default")
      setDrawnSongId(previousDrawnSongId)
    }
  }

  const isSkipTransition = transitionIntent === "skipped"
  const presenceMode = isSkipTransition ? "wait" : "sync"

  return (
    <section className="flex h-64 flex-col overflow-hidden rounded-lg border border-zinc-200 p-4">
      <Text as="h2" variant="label" className="mb-2">
        Draw random song
      </Text>

      {!drawnSong ? (
        <Button
          onClick={() => drawRandomSong()}
          disabled={songs.length === 0}
          variant="solid"
          className="w-full flex-1 text-base font-semibold"
        >
          Draw Song
        </Button>
      ) : (
        <div className="relative flex flex-1">
          <AnimatePresence
            mode={presenceMode}
            initial={false}
            custom={transitionIntent}
          >
            <motion.div
              key={drawnSongId}
              variants={cardSlideVariants}
              custom={transitionIntent}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ willChange: "transform" }}
              className="absolute inset-0 flex rounded-md border border-zinc-200 p-3"
            >
              <div className="flex w-full items-center justify-between gap-2">
                <Button
                  onClick={skipDrawnSong}
                  aria-label="Skip song"
                  title="Skip"
                  size="icon"
                  icon={<Undo2Icon size={16} />}
                />

                <div className="min-w-0 flex-1 px-2 text-center">
                  <Text className="font-medium wrap-break-word">
                    {drawnSong.title}
                  </Text>

                  <Text variant="caption" tone="muted" className="mt-3">
                    {drawnSong.hands === 2 ? "🙌 2 hands" : "✋ 1 hand"}
                  </Text>

                  <LastPlayedLabel lastPlayedAt={drawnSong.lastPlayedAt} />

                  <Button
                    onClick={() => setIsEditModalOpen(true)}
                    variant="ghost"
                    size="sm"
                    className="mt-4 h-auto text-xs"
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
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {drawnSong && isEditModalOpen && (
        <SongEditModal
          song={drawnSong}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {markSongActivityMutation.error && (
        <Text tone="danger" className="mt-3">
          {getSongsErrorMessage(
            markSongActivityMutation.error,
            "Could not update song activity",
          )}
        </Text>
      )}
    </section>
  )
}
