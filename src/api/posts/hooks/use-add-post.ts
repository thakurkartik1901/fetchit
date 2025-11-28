import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { PostsRepository } from '../repository';
import type { CreatePostRequest, Post } from '../types';

type Variables = CreatePostRequest;
type Response = Post;

export const useAddPost = createMutation<Response, Variables, AxiosError>({
  mutationFn: async (variables) => PostsRepository.create(variables),
});
