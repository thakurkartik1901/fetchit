import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { PostsRepository } from '../repository';
import type { CreatePostRequest, Post } from '../types';

export const useAddPost = (): UseMutationResult<
  Post,
  AxiosError,
  CreatePostRequest
> => {
  return useMutation<Post, AxiosError, CreatePostRequest>({
    mutationFn: async (variables) => PostsRepository.create(variables),
  });
};
