"use client"

import { DrawSection } from "./_components/home/DrawSection"
import { SongListSection } from "./_components/home/SongListSection"
import { Text } from "./_components/ui/Text"

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-4 px-4 py-6 sm:px-6">
      <header className="space-y-1">
        <Text as="h1" variant="h2">
          Piano Song Jar
        </Text>
        <Text tone="muted">Save songs you know and draw one at random.</Text>
      </header>

      <DrawSection />

      <SongListSection />
    </main>
  )
}
