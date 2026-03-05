import { ChevronDownIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useGetSongsQuery } from "@/app/_hooks/songs"
import { SongCreateForm } from "./SongCreateForm"
import { SongListItem } from "./SongListItem"

export function SongListSection() {
  const { songs, isPending, errorMessage: queryError } = useGetSongsQuery()

  const [songsExpanded, setSongsExpanded] = useState(false)

  return (
    <section className="rounded-lg border border-zinc-200 p-4">
      <SongCreateForm className="mb-4" />

      <button
        type="button"
        onClick={() => setSongsExpanded(!songsExpanded)}
        aria-expanded={songsExpanded}
        aria-label={songsExpanded ? "Collapse songs list" : "Expand songs list"}
        title={songsExpanded ? "Collapse" : "Expand"}
        className="-m-4 flex h-auto w-[calc(100%+2rem)] items-center justify-between rounded-lg p-4 text-left text-inherit"
      >
        <h2 className="text-sm font-medium">All songs ({songs.length})</h2>
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="mt-3 overflow-hidden"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
