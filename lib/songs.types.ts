export type Song = {
  id: string
  title: string
  hands: 1 | 2
  lastPlayedAt: string | null
  createdAt: string
}

export type SongUpdateInput = {
  title?: string
  hands?: 1 | 2
}
