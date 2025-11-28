import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { PostsRepository } from '../repository';
import type { Post } from '../types';

type Response = Post[];

const QUERY_KEY = ['posts'] as const;

export const usePosts = (): UseQueryResult<Response, AxiosError> => {
  return useQuery<Response, AxiosError>({
    queryKey: QUERY_KEY,
    queryFn: () => PostsRepository.list(),
  });
};

// Export query key for invalidation
usePosts.queryKey = QUERY_KEY;
