import { apiDelete, apiGet, apiPost, apiPut } from '@/api/common/http';

import type {
  CreatePostRequest,
  Post,
  PostDTO,
  PostsResponse,
  UpdatePostRequest,
} from './types';

const POSTS_BASE_URL = '/posts';

export const PostsRepository = {
  async list(): Promise<Post[]> {
    const data = await apiGet<PostsResponse>(POSTS_BASE_URL);
    return data.posts.map(this.mapDTOToPost);
  },

  async getById(id: number): Promise<Post> {
    const data = await apiGet<PostDTO>(`${POSTS_BASE_URL}/${id}`);
    return this.mapDTOToPost(data);
  },

  async create(request: CreatePostRequest): Promise<Post> {
    const data = await apiPost<PostDTO>(`${POSTS_BASE_URL}/add`, request);
    return this.mapDTOToPost(data);
  },

  async update(id: number, request: UpdatePostRequest): Promise<Post> {
    const data = await apiPut<PostDTO>(`${POSTS_BASE_URL}/${id}`, request);
    return this.mapDTOToPost(data);
  },

  async delete(id: number): Promise<void> {
    await apiDelete(`${POSTS_BASE_URL}/${id}`);
  },

  mapDTOToPost(dto: PostDTO): Post {
    return {
      id: dto.id,
      userId: dto.userId,
      title: dto.title,
      body: dto.body,
    };
  },
};
