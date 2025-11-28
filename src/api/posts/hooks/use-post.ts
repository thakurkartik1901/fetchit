import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { PostsRepository } from '../repository';
import type { Post } from '../types';

type Variables = { id: number };
type Response = Post;

export const usePost = createQuery<Response, Variables, AxiosError>({
  queryKey: ['post'],
  fetcher: (variables) => PostsRepository.getById(variables.id),
});
