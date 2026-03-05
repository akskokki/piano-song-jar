import { ChevronDownIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useGetSongsQuery } from "@/app/_hooks/songs"
import { Text } from "@/app/_components/ui/Text"
import { SongCreateForm } from "./SongCreateForm"
import { SongListItem } from "./SongListItem"

export function SongListSection() {
  const { songs, isPending, errorMessage: queryError } = useGetSongsQuery()

  const [songsExpanded, setSongsExpanded] = useState(false)

  return (
    <section className="rounded-lg border border-zinc-200 p-4 pb-0!">
      <SongCreateForm className="mb-4" />

      <button
        type="button"
        onClick={() => setSongsExpanded(!songsExpanded)}
        aria-expanded={songsExpanded}
        aria-label={songsExpanded ? "Collapse songs list" : "Expand songs list"}
        title={songsExpanded ? "Collapse" : "Expand"}
        className="-m-4 mb-0! flex h-auto w-[calc(100%+2rem)] items-center justify-between rounded-lg p-4 text-left text-inherit"
      >
        <Text as="h2" variant="label">
          All songs ({songs.length})
        </Text>
        <motion.div
          animate={{ rotate: songsExpanded ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <ChevronDownIcon size={20} />
        </motion.div>
      </button>

      <AnimatePresence>
        {songsExpanded && (
          <motion.div
            initial={{ opacity: 1, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 1, height: 0 }}
            transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {isPending ? (
              <Text variant="bodySm" tone="muted">
                Loading songs...
              </Text>
            ) : songs.length === 0 ? (
              <Text variant="bodySm" tone="muted">
                No songs yet.
              </Text>
            ) : (
              <ul className="space-y-2">
                {songs.map((song) => (
                  <SongListItem key={song.id} song={song} />
                ))}
              </ul>
            )}

            {queryError && (
              <Text variant="bodySm" tone="danger" className="mt-3">
                {queryError}
              </Text>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
