"use client"

import { DrawSection } from "./_components/home/DrawSection"
import { SongListSection } from "./_components/home/SongListSection"

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-4 px-4 py-6 sm:px-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Piano Song Jar</h1>
        <p className="text-sm text-zinc-500">
          Save songs you know and draw one at random.
        </p>
      </header>

      <DrawSection />

      <SongListSection />
    </main>
  )
}
