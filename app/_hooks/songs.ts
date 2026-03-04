import {
  QueryClient,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { SONG_TITLE_MAX_LENGTH } from '@/lib/song.constants';
import {
  createSong as createSongApi,
  deleteSong,
  fetchSongs,
  markSongActivity,
  updateSong,
} from '@/lib/songs.api';
import { songsQueryKeys } from '@/lib/songs.query-keys';
import { Song, SongActivityType, SongUpdateInput } from '@/lib/songs.types';

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage;
}

type SongsRollbackContext = {
  previousSongs?: Song[];
};

type UpdateSongVariables = {
  songId: string;
} & SongUpdateInput;

function setSongsCache(
  queryClient: QueryClient,
  updater: (songs: Song[]) => Song[],
) {
  queryClient.setQueryData<Song[]>(songsQueryKeys.list(), (current = []) =>
    updater(current),
  );
}

function replaceSongInSongsCache(queryClient: QueryClient, nextSong: Song) {
  setSongsCache(queryClient, (songs) =>
    songs.map((song) => (song.id === nextSong.id ? nextSong : song)),
  );
}

function patchSongInSongsCache(
  queryClient: QueryClient,
  songId: string,
  patch: SongUpdateInput,
) {
  setSongsCache(queryClient, (songs) =>
    songs.map((song) =>
      song.id === songId
        ? {
            ...song,
            ...(typeof patch.title === 'string' ? { title: patch.title } : {}),
            ...(typeof patch.hands === 'number' ? { hands: patch.hands } : {}),
          }
        : song,
    ),
  );
}

export const songsListQueryOptions = queryOptions({
  queryKey: songsQueryKeys.list(),
  queryFn: fetchSongs,
});

export function useGetSongsQuery() {
  const songsQuery = useQuery(songsListQueryOptions);

  return {
    ...songsQuery,
    songs: songsQuery.data ?? [],
    errorMessage: getErrorMessage(songsQuery.error, ''),
  };
}

export function useCreateSongMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) => {
      if (title.length > SONG_TITLE_MAX_LENGTH) {
        throw new Error(
          `Song title must be ${SONG_TITLE_MAX_LENGTH} characters or fewer`,
        );
      }

      return createSongApi(title);
    },
    onSuccess: (createdSong) => {
      setSongsCache(queryClient, (songs) => [createdSong, ...songs]);
    },
  });
}

export function useUpdateSongMutation() {
  const queryClient = useQueryClient();

  return useMutation<Song, Error, UpdateSongVariables, SongsRollbackContext>({
    mutationFn: ({ songId, title, hands }) =>
      updateSong(songId, { title, hands }),
    onMutate: async ({ songId, title, hands }) => {
      await queryClient.cancelQueries({ queryKey: songsQueryKeys.list() });

      const previousSongs = queryClient.getQueryData<Song[]>(
        songsQueryKeys.list(),
      );

      patchSongInSongsCache(queryClient, songId, { title, hands });

      return { previousSongs };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousSongs) {
        queryClient.setQueryData(songsQueryKeys.list(), context.previousSongs);
      }
    },
    onSuccess: (updatedSong) => {
      replaceSongInSongsCache(queryClient, updatedSong);
    },
  });
}

type MarkSongActivityVariables = {
  songId: string;
  type: SongActivityType;
};

export function useMarkSongActivityMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    Song,
    Error,
    MarkSongActivityVariables,
    SongsRollbackContext
  >({
    mutationFn: ({ songId, type }) => markSongActivity(songId, type),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: songsQueryKeys.list() });
      const previousSongs = queryClient.getQueryData<Song[]>(
        songsQueryKeys.list(),
      );

      return { previousSongs };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousSongs) {
        queryClient.setQueryData(songsQueryKeys.list(), context.previousSongs);
      }
    },
    onSuccess: (updatedSong) => {
      replaceSongInSongsCache(queryClient, updatedSong);
    },
  });
}

export function useDeleteSongMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { songId: string }, SongsRollbackContext>({
    mutationFn: ({ songId }) => deleteSong(songId),
    onMutate: async ({ songId }) => {
      await queryClient.cancelQueries({ queryKey: songsQueryKeys.list() });
      const previousSongs = queryClient.getQueryData<Song[]>(
        songsQueryKeys.list(),
      );

      setSongsCache(queryClient, (songs) =>
        songs.filter((song) => song.id !== songId),
      );

      return { previousSongs };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousSongs) {
        queryClient.setQueryData(songsQueryKeys.list(), context.previousSongs);
      }
    },
  });
}

export function getSongsErrorMessage(error: unknown, fallbackMessage: string) {
  return getErrorMessage(error, fallbackMessage);
}
