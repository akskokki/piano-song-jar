export const songsQueryKeys = {
  all: ['songs'] as const,
  lists: () => [...songsQueryKeys.all, 'list'] as const,
  list: () => [...songsQueryKeys.lists()] as const,
  details: () => [...songsQueryKeys.all, 'detail'] as const,
  detail: (songId: string) => [...songsQueryKeys.details(), songId] as const,
};
