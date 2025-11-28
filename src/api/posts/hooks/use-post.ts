import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { PostsRepository } from '../repository';
import type { Post } from '../types';

type Response = Post;

export const usePost = (id: number): UseQueryResult<Response, AxiosError> => {
  return useQuery<Response, AxiosError>({
    queryKey: ['post', id] as const,
    queryFn: () => PostsRepository.getById(id),
  });
};

// Export query key factory for invalidation
usePost.queryKey = (id: number) => ['post', id] as const;
