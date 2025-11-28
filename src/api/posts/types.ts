export type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export type PostDTO = {
  userId: number;
  id: number;
  title: string;
  body: string;
  reactions?: number;
  tags?: string[];
};

export type PostsResponse = {
  posts: PostDTO[];
  total: number;
  skip: number;
  limit: number;
};

export type CreatePostRequest = {
  title: string;
  body: string;
  userId: number;
};

export type UpdatePostRequest = Partial<CreatePostRequest>;
