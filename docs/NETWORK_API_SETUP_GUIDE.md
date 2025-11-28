# Network & API Setup Guide with TanStack Query

This guide explains the complete network and API setup architecture used in this project. You can use this pattern in any React Native or React project.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [HTTP Client Setup](#http-client-setup)
3. [Error Handling](#error-handling)
4. [TanStack Query Configuration](#tanstack-query-configuration)
5. [Repository Pattern](#repository-pattern)
6. [React Query Hooks](#react-query-hooks)
7. [Usage Examples](#usage-examples)
8. [Best Practices](#best-practices)

---

## Architecture Overview

### Data Flow Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                     │
│                 React Components (Screens)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Uses hooks
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                    │
│              React Query Hooks (useTodos, etc.)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Calls repository methods
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                      │
│           Repository (TodoRepository.list(), etc.)          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Uses HTTP helpers
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                     HTTP CLIENT LAYER                       │
│           Axios Instance (apiGet, apiPost, etc.)            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Makes requests
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND API                         │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Type Safety**: Strict TypeScript throughout the entire flow
3. **Error Handling**: Custom error classes for different failure scenarios
4. **Caching**: TanStack Query handles caching and revalidation
5. **Optimistic Updates**: UI updates immediately, syncs with server later

---

## HTTP Client Setup

### 1. Installation

```bash
npm install axios @tanstack/react-query
npm install @react-native-async-storage/async-storage  # For token storage
```

### 2. Custom Error Classes

**File: `src/lib/errors.ts`**

```typescript
/**
 * Custom HTTP Error Classes
 * These provide detailed error information for debugging and user feedback
 */

export class HttpError extends Error {
  public readonly url: string;
  public readonly method: string;
  public readonly timestamp: Date;
  public readonly duration?: number;

  constructor(message: string, url: string, method: string, duration?: number) {
    super(message);
    this.name = 'HttpError';
    this.url = url;
    this.method = method;
    this.timestamp = new Date();
    this.duration = duration;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      url: this.url,
      method: this.method,
      timestamp: this.timestamp.toISOString(),
      duration: this.duration,
    };
  }
}

export class HttpTimeoutError extends HttpError {
  public readonly timeout: number;

  constructor(url: string, method: string, timeout: number, duration?: number) {
    super(`Request timeout after ${timeout}ms`, url, method, duration);
    this.name = 'HttpTimeoutError';
    this.timeout = timeout;
  }
}

export class HttpNetworkError extends HttpError {
  constructor(
    url: string,
    method: string,
    originalError: any,
    duration?: number
  ) {
    super(
      `Network error: ${originalError?.message || 'Unknown network error'}`,
      url,
      method,
      duration
    );
    this.name = 'HttpNetworkError';
  }
}

export class HttpResponseError extends HttpError {
  public readonly status: number;
  public readonly statusText: string;
  public readonly data: any;

  constructor(
    url: string,
    method: string,
    status: number,
    statusText: string,
    data: any,
    duration?: number
  ) {
    super(`HTTP ${status}: ${statusText}`, url, method, duration);
    this.name = 'HttpResponseError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

export class HttpUnknownError extends HttpError {
  public readonly originalError: any;

  constructor(
    url: string,
    method: string,
    originalError: any,
    duration?: number
  ) {
    super(
      `Unknown error: ${originalError?.message || 'An unexpected error occurred'}`,
      url,
      method,
      duration
    );
    this.name = 'HttpUnknownError';
    this.originalError = originalError;
  }
}
```

### 3. HTTP Client with Axios

**File: `src/lib/http.ts`**

```typescript
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth.store';
import {
  HttpTimeoutError,
  HttpNetworkError,
  HttpResponseError,
  HttpUnknownError,
} from './errors';

/**
 * HTTP Client Configuration
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || '';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Create Axios Instance
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
});

/**
 * Request Interceptor - Add Auth Token
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Get auth token from Zustand store
    const accessToken = useAuthStore.getState().getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Log request (optional, remove in production)
    console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.url}`);

    return config;
  },
  (error) => {
    console.error('[HTTP] Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Handle Errors
 */
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[HTTP] Response ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[HTTP] Response Error:', error);

    // Optional: Handle 401 Unauthorized globally
    if (error.response?.status === 401) {
      // Logout user
      useAuthStore.getState().logout();
      // Navigate to login (if using navigation)
      // router.replace('/login');
    }

    return Promise.reject(error);
  }
);

/**
 * HTTP Helper Functions
 */

export async function apiGet<T>(
  path: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const startTime = Date.now();
  const url = path;
  const method = 'GET';

  try {
    const response = await axiosInstance.get<T>(path, config);
    const duration = Date.now() - startTime;
    console.log(`[HTTP] GET ${url} completed in ${duration}ms`);
    return response.data;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    throw handleHttpError(error, url, method, duration);
  }
}

export async function apiPost<T>(
  path: string,
  body?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  const startTime = Date.now();
  const url = path;
  const method = 'POST';

  try {
    const response = await axiosInstance.post<T>(path, body, config);
    const duration = Date.now() - startTime;
    console.log(`[HTTP] POST ${url} completed in ${duration}ms`);
    return response.data;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    throw handleHttpError(error, url, method, duration);
  }
}

export async function apiPut<T>(
  path: string,
  body?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  const startTime = Date.now();
  const url = path;
  const method = 'PUT';

  try {
    const response = await axiosInstance.put<T>(path, body, config);
    const duration = Date.now() - startTime;
    console.log(`[HTTP] PUT ${url} completed in ${duration}ms`);
    return response.data;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    throw handleHttpError(error, url, method, duration);
  }
}

export async function apiPatch<T>(
  path: string,
  body?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  const startTime = Date.now();
  const url = path;
  const method = 'PATCH';

  try {
    const response = await axiosInstance.patch<T>(path, body, config);
    const duration = Date.now() - startTime;
    console.log(`[HTTP] PATCH ${url} completed in ${duration}ms`);
    return response.data;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    throw handleHttpError(error, url, method, duration);
  }
}

export async function apiDelete<T>(
  path: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const startTime = Date.now();
  const url = path;
  const method = 'DELETE';

  try {
    const response = await axiosInstance.delete<T>(path, config);
    const duration = Date.now() - startTime;
    console.log(`[HTTP] DELETE ${url} completed in ${duration}ms`);
    return response.data;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    throw handleHttpError(error, url, method, duration);
  }
}

/**
 * Error Handler - Converts axios errors to custom error types
 */
function handleHttpError(
  error: any,
  url: string,
  method: string,
  duration: number
): Error {
  // Timeout error
  if (error.code === 'ECONNABORTED') {
    return new HttpTimeoutError(url, method, DEFAULT_TIMEOUT, duration);
  }

  // Network error (no response from server)
  if (!error.response) {
    return new HttpNetworkError(url, method, error, duration);
  }

  // HTTP error response (4xx, 5xx)
  if (error.response) {
    return new HttpResponseError(
      url,
      method,
      error.response.status,
      error.response.statusText,
      error.response.data,
      duration
    );
  }

  // Unknown error
  return new HttpUnknownError(url, method, error, duration);
}

// Export axios instance for advanced usage
export { axiosInstance };
```

### 4. Environment Variables

**File: `.env`**

```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
EXPO_PUBLIC_API_KEY=your-api-key-here
```

---

## TanStack Query Configuration

### 1. Query Client Setup

**File: `src/lib/queryClient.ts`**

```typescript
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 20, // 20 minutes - data considered fresh
      gcTime: 1000 * 60 * 60, // 60 minutes - cache garbage collection time
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch on window focus (mobile)
      refetchOnReconnect: true, // Refetch when network reconnects
    },
    mutations: {
      retry: 0, // Don't retry mutations (create, update, delete)
    },
  },

  // Global error handler for queries
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error('[React Query] Query Error:', {
        queryKey: query.queryKey,
        error,
      });

      // Optional: Show global error toast
      // toast.error('Failed to fetch data');
    },
  }),

  // Global error handler for mutations
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      console.error('[React Query] Mutation Error:', {
        mutationKey: mutation.options.mutationKey,
        error,
      });

      // Optional: Show global error toast
      // toast.error('Operation failed');
    },
  }),
});
```

### 2. Query Provider Setup

**File: `src/providers/QueryProvider.tsx`**

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { type ReactNode } from 'react';

type QueryProviderProps = {
  children: ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 3. Wrap Your App

**File: `src/app/_layout.tsx` (Expo Router) or `App.tsx`**

```typescript
import { QueryProvider } from '@/providers/QueryProvider';

export default function RootLayout() {
  return (
    <QueryProvider>
      {/* Your app content */}
    </QueryProvider>
  );
}
```

---

## Repository Pattern

The repository pattern separates data fetching logic from UI components.

### 1. Define Types

**File: `src/features/todo/types/todo.types.ts`**

```typescript
/**
 * Domain Model - What your app uses internally
 */
export type Todo = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * DTO (Data Transfer Object) - What the API returns
 */
export type TodoDTO = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string; // API uses snake_case
  created_at: string;
  updated_at: string;
};

/**
 * Request Types
 */
export type CreateTodoRequest = {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
};

export type UpdateTodoRequest = Partial<CreateTodoRequest> & {
  completed?: boolean;
};
```

### 2. Create Repository

**File: `src/features/todo/repository/todo.repository.ts`**

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/http';
import type {
  Todo,
  TodoDTO,
  CreateTodoRequest,
  UpdateTodoRequest,
} from '../types/todo.types';

/**
 * Todo Repository
 * Handles all API calls related to todos
 * Converts between API DTOs and domain models
 */

const TODOS_BASE_URL = '/todos';

export const TodoRepository = {
  /**
   * Get all todos
   */
  async list(): Promise<Todo[]> {
    const data = await apiGet<TodoDTO[]>(TODOS_BASE_URL);
    return data.map(this.mapDTOToTodo);
  },

  /**
   * Get a single todo by ID
   */
  async getById(id: string): Promise<Todo> {
    const data = await apiGet<TodoDTO>(`${TODOS_BASE_URL}/${id}`);
    return this.mapDTOToTodo(data);
  },

  /**
   * Create a new todo
   */
  async create(request: CreateTodoRequest): Promise<Todo> {
    const data = await apiPost<TodoDTO>(TODOS_BASE_URL, request);
    return this.mapDTOToTodo(data);
  },

  /**
   * Update an existing todo
   */
  async update(id: string, request: UpdateTodoRequest): Promise<Todo> {
    const data = await apiPut<TodoDTO>(`${TODOS_BASE_URL}/${id}`, request);
    return this.mapDTOToTodo(data);
  },

  /**
   * Delete a todo
   */
  async delete(id: string): Promise<void> {
    await apiDelete(`${TODOS_BASE_URL}/${id}`);
  },

  /**
   * Toggle todo completion status
   */
  async toggleComplete(id: string, completed: boolean): Promise<Todo> {
    const data = await apiPut<TodoDTO>(`${TODOS_BASE_URL}/${id}`, {
      completed,
    });
    return this.mapDTOToTodo(data);
  },

  /**
   * Map DTO to Domain Model
   * This isolates the UI from backend API changes
   */
  mapDTOToTodo(dto: TodoDTO): Todo {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      completed: dto.completed,
      priority: dto.priority || 'medium',
      dueDate: dto.due_date ? new Date(dto.due_date) : undefined,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
    };
  },
};
```

---

## React Query Hooks

### 1. Query Hook (Fetch Data)

**File: `src/features/todo/hooks/useTodos.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import { TodoRepository } from '../repository/todo.repository';

/**
 * Hook to fetch all todos
 *
 * Features:
 * - Automatic caching
 * - Background refetching
 * - Loading and error states
 */
export function useTodos() {
  return useQuery({
    queryKey: ['todos'], // Unique key for this query
    queryFn: () => TodoRepository.list(), // Function to fetch data
    staleTime: 5 * 60 * 1000, // 5 minutes - override default
  });
}

// Usage in component:
// const { data: todos, isLoading, error } = useTodos();
```

### 2. Mutation Hook (Create)

**File: `src/features/todo/hooks/useCreateTodo.ts`**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TodoRepository } from '../repository/todo.repository';
import { toast } from 'sonner-native'; // Or your toast library
import type { CreateTodoRequest } from '../types/todo.types';

/**
 * Hook to create a new todo
 *
 * Features:
 * - Invalidates query cache on success
 * - Shows success/error feedback
 * - Automatic error handling
 */
export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateTodoRequest) => TodoRepository.create(request),

    onSuccess: (newTodo) => {
      // Invalidate todos list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['todos'] });

      // Also set query data directly (optional, for instant update)
      queryClient.setQueryData(['todo', newTodo.id], newTodo);

      // Show success feedback
      toast.success('Todo created successfully');
    },

    onError: (error: any) => {
      // Show error feedback
      toast.error(error.message || 'Failed to create todo');
    },
  });
}

// Usage in component:
// const createTodo = useCreateTodo();
// createTodo.mutate({ title: 'New todo' });
```

### 3. Mutation Hook (Update)

**File: `src/features/todo/hooks/useUpdateTodo.ts`**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TodoRepository } from '../repository/todo.repository';
import { toast } from 'sonner-native';
import type { UpdateTodoRequest } from '../types/todo.types';

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) =>
      TodoRepository.update(id, data),

    onSuccess: (updatedTodo) => {
      // Invalidate specific todo and list
      queryClient.invalidateQueries({ queryKey: ['todo', updatedTodo.id] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });

      toast.success('Todo updated successfully');
    },

    onError: (error: any) => {
      toast.error(error.message || 'Failed to update todo');
    },
  });
}

// Usage:
// const updateTodo = useUpdateTodo();
// updateTodo.mutate({ id: '123', data: { title: 'Updated' } });
```

### 4. Mutation Hook (Delete)

**File: `src/features/todo/hooks/useDeleteTodo.ts`**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TodoRepository } from '../repository/todo.repository';
import { toast } from 'sonner-native';

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TodoRepository.delete(id),

    onSuccess: () => {
      // Invalidate list to refetch
      queryClient.invalidateQueries({ queryKey: ['todos'] });

      toast.success('Todo deleted successfully');
    },

    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete todo');
    },
  });
}
```

### 5. Optimistic Updates

**File: `src/features/todo/hooks/useToggleTodo.ts`**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TodoRepository } from '../repository/todo.repository';
import type { Todo } from '../types/todo.types';

/**
 * Hook to toggle todo completion status
 * Uses optimistic updates for instant UI feedback
 */
export function useToggleTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      TodoRepository.toggleComplete(id, completed),

    // OPTIMISTIC UPDATE - Update UI immediately
    onMutate: async ({ id, completed }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // Snapshot current data for rollback
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

      // Optimistically update the cache
      queryClient.setQueryData<Todo[]>(['todos'], (old) =>
        old?.map((todo) => (todo.id === id ? { ...todo, completed } : todo))
      );

      // Return context with snapshot
      return { previousTodos };
    },

    // ROLLBACK - If mutation fails, restore previous data
    onError: (error, variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
      toast.error('Failed to update todo');
    },

    // FINAL SYNC - Always refetch after mutation settles
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
```

---

## Usage Examples

### Example 1: Simple List Screen

```typescript
import { View, FlatList } from 'react-native';
import { useTodos } from '@/features/todo/hooks/useTodos';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

export default function TodosScreen() {
  const { data: todos, isLoading, error } = useTodos();

  if (isLoading) {
    return <LoadingState message="Loading todos..." />;
  }

  if (error) {
    return <EmptyState title="Error" description={error.message} />;
  }

  return (
    <FlatList
      data={todos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <TodoCard todo={item} />}
    />
  );
}
```

### Example 2: Create with Mutation

```typescript
import { useState } from 'react';
import { useCreateTodo } from '@/features/todo/hooks/useCreateTodo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function CreateTodoForm() {
  const [title, setTitle] = useState('');
  const createTodo = useCreateTodo();

  const handleSubmit = async () => {
    await createTodo.mutateAsync({ title });
    setTitle(''); // Clear form
  };

  return (
    <View>
      <Input
        value={title}
        onChangeText={setTitle}
        placeholder="Enter todo title"
      />
      <Button
        onPress={handleSubmit}
        loading={createTodo.isPending}
        disabled={!title.trim()}
      >
        Create Todo
      </Button>
    </View>
  );
}
```

### Example 3: Toggle with Optimistic Update

```typescript
import { Pressable } from 'react-native';
import { useToggleTodo } from '@/features/todo/hooks/useToggleTodo';
import { BodyText } from '@/components/ui/Text';
import type { Todo } from '@/features/todo/types/todo.types';

export function TodoCard({ todo }: { todo: Todo }) {
  const toggleTodo = useToggleTodo();

  const handleToggle = () => {
    toggleTodo.mutate({ id: todo.id, completed: !todo.completed });
  };

  return (
    <Pressable onPress={handleToggle}>
      <BodyText
        className={todo.completed ? 'line-through text-gray-400' : ''}
      >
        {todo.title}
      </BodyText>
    </Pressable>
  );
}
```

### Example 4: Manual Refetch

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';

export function RefreshButton() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    // Refetch all todos
    queryClient.invalidateQueries({ queryKey: ['todos'] });

    // Or refetch specific query
    queryClient.refetchQueries({ queryKey: ['todos'] });
  };

  return <Button onPress={handleRefresh}>Refresh</Button>;
}
```

---

## Best Practices

### 1. Query Key Conventions

```typescript
// ✅ GOOD - Hierarchical, descriptive
['todos'][('todo', id)][('todos', 'completed')][('todos', { filter: 'high' })][ // List all todos // Single todo // Filtered todos // Todos with filter params
  // ❌ BAD - Inconsistent, unclear
  'getAllTodos'
]['todo-123']['todosWithHighPriority'];
```

### 2. Error Handling

```typescript
// ✅ GOOD - Specific error handling
try {
  await createTodo.mutateAsync({ title });
} catch (error) {
  if (error instanceof HttpResponseError && error.status === 400) {
    toast.error('Invalid todo data');
  } else if (error instanceof HttpNetworkError) {
    toast.error('No internet connection');
  } else {
    toast.error('Something went wrong');
  }
}

// ❌ BAD - Generic error handling
try {
  await createTodo.mutateAsync({ title });
} catch (error) {
  console.log(error); // User sees nothing
}
```

### 3. Loading States

```typescript
// ✅ GOOD - Different states for different scenarios
const { data, isLoading, isFetching, error } = useTodos();

if (isLoading) return <LoadingState />; // Initial load
if (error) return <ErrorState />;

return (
  <View>
    {isFetching && <RefreshIndicator />} {/* Background refetch */}
    <TodoList todos={data} />
  </View>
);

// ❌ BAD - Only checking loading
if (isLoading) return <LoadingState />;
// User doesn't know when data is being refreshed
```

### 4. Type Safety

```typescript
// ✅ GOOD - Full type safety
export async function apiGet<T>(path: string): Promise<T> {
  const response = await axiosInstance.get<T>(path);
  return response.data;
}

const todos = await apiGet<TodoDTO[]>('/todos'); // Type-safe!

// ❌ BAD - Any types
export async function apiGet(path: string): Promise<any> {
  // ...
}
```

### 5. Cache Invalidation

```typescript
// ✅ GOOD - Invalidate related queries
onSuccess: (todo) => {
  queryClient.invalidateQueries({ queryKey: ['todos'] }); // List
  queryClient.invalidateQueries({ queryKey: ['todo', todo.id] }); // Detail
  queryClient.invalidateQueries({ queryKey: ['todos', 'completed'] }); // Filtered
};

// ❌ BAD - Forget to invalidate
onSuccess: (todo) => {
  // Nothing - stale data shown
};
```

---

## Advanced Patterns

### 1. Pagination

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

export function useTodosPaginated() {
  return useInfiniteQuery({
    queryKey: ['todos', 'paginated'],
    queryFn: ({ pageParam = 1 }) => TodoRepository.list({ page: pageParam }),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
}
```

### 2. Dependent Queries

```typescript
export function useTodoWithComments(todoId: string) {
  // First query - get todo
  const { data: todo } = useQuery({
    queryKey: ['todo', todoId],
    queryFn: () => TodoRepository.getById(todoId),
  });

  // Second query - only runs if we have a todo
  const { data: comments } = useQuery({
    queryKey: ['comments', todoId],
    queryFn: () => CommentsRepository.list(todoId),
    enabled: !!todo, // Only fetch if todo exists
  });

  return { todo, comments };
}
```

### 3. Prefetching

```typescript
import { useQueryClient } from '@tanstack/react-query';

export function TodoListItem({ todo }: { todo: Todo }) {
  const queryClient = useQueryClient();

  // Prefetch todo details on hover/press
  const handlePrefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ['todo', todo.id],
      queryFn: () => TodoRepository.getById(todo.id),
    });
  };

  return (
    <Pressable onPressIn={handlePrefetch}>
      <Text>{todo.title}</Text>
    </Pressable>
  );
}
```

---

## Common Issues & Solutions

### Issue 1: Stale Data After Mutation

**Problem**: List doesn't update after creating/updating item

**Solution**: Invalidate queries in `onSuccess`

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['todos'] });
};
```

### Issue 2: Too Many Refetches

**Problem**: Data refetches on every screen focus

**Solution**: Increase `staleTime`

```typescript
useQuery({
  queryKey: ['todos'],
  queryFn: getTodos,
  staleTime: 10 * 60 * 1000, // 10 minutes
});
```

### Issue 3: Auth Token Not Included

**Problem**: 401 errors on authenticated endpoints

**Solution**: Check request interceptor

```typescript
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Issue 4: Type Errors

**Problem**: TypeScript errors on response data

**Solution**: Define proper DTO types and map them

```typescript
// Define what API returns
type TodoDTO = {
  id: string;
  title: string;
  created_at: string; // API uses snake_case
};

// Map to domain model
type Todo = {
  id: string;
  title: string;
  createdAt: Date; // App uses camelCase
};

// Use mapper function
function mapTodo(dto: TodoDTO): Todo {
  return {
    id: dto.id,
    title: dto.title,
    createdAt: new Date(dto.created_at),
  };
}
```

---

## Summary Checklist

When setting up API calls in a new project:

- [ ] Install `axios` and `@tanstack/react-query`
- [ ] Create custom error classes (`src/lib/errors.ts`)
- [ ] Setup Axios instance with interceptors (`src/lib/http.ts`)
- [ ] Configure query client (`src/lib/queryClient.ts`)
- [ ] Wrap app with `QueryProvider`
- [ ] Define types (DTOs and domain models)
- [ ] Create repository with API calls
- [ ] Create React Query hooks (queries and mutations)
- [ ] Use hooks in components
- [ ] Handle loading, error, and empty states
- [ ] Add environment variables (`.env`)
- [ ] Test all CRUD operations

---

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)

---

**You're ready to implement this pattern in any project!** 🚀
