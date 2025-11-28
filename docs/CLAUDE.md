# CLAUDE.md

Guidance for Claude Code when working with **FetchIt** - a React Native app for email sync and order tracking from multiple platforms.

## 🚨 Critical Rules

1. **USE UI wrappers** - `<Button>`, `<Input>`, `<Text>`, `<Card>`, `<Modal>` over raw React Native components
2. **FOLLOW pattern** - Screen → Hook → Repository → Backend (never skip layers)
3. **NEVER hardcode colors** - Use Tailwind classes (`bg-primary-600`, `text-danger-500`) or token imports for JS props
4. **NEVER use StyleSheet.create()** - NativeWind classes only; inline styles ONLY for shadows/platform-specific
5. **Responsive design** - Use responsive classes (`sm:`, `md:`, `lg:`); avoid hardcoded heights except touch targets (40px min)
6. **Check docs BEFORE coding** - Consult NativeWind, React Native, Expo docs for platform differences

## Stack & Config

**Framework**: Expo ~53.0, React Native 0.79.4, React 19.0.0
**Routing**: Expo Router 5.1 (file-based, typed routes)
**Styling**: NativeWind 4.1 (Tailwind for RN)
**State Management**: Zustand 5.0 (global), @tanstack/react-query 5.52 (server state)

**Platform**:

- Bundle ID: `com.fetchit.{environment}` (development/staging/production)
- Scheme: `fetchit`
- iOS & Android support
- Multi-environment builds (development, staging, production)

## Architecture

**Routes**: `(app)` - main nav (feed, style, settings); `feed/` - feed details/add post; `login` - auth; `onboarding` - first launch

**Root Layout**: `src/app/_layout.tsx` - Sets up global providers (API, Theme, GestureHandler, Keyboard, BottomSheet)

**Features** (`src/api/`): Each feature has: `repository.ts`, `types.ts`, `hooks/` (@tanstack/react-query)

- **posts** - Feed/posts feature (list, detail, create)
- **common** - Shared API utilities (client, http, errors)

**Global Stores** (`src/store/`): Zustand for app-level state

- **auth** - Authentication state, token management, sign-in/out

**State Strategy**:

- Zustand (`.tsx`) for global app state
- @tanstack/react-query for all server data
- React Hook Form + Zod for form state

**Shared**:

- `src/components/ui/` - Design system (core, extended, layout, icons, tokens)
- `src/lib/` - Utilities (hooks, i18n, storage, animations, haptics, toast, logger)
- `src/types/` - Global TypeScript types

**Path Alias**: `@/*` → `./src/*`

## Styling

**NativeWind First** (primary): Use `className` for ALL styling. Use `twMerge()` for conditional classes.

**Inline styles ONLY for**:

- Shadows (iOS/Android differences)
- Platform-specific behaviors (Platform.select)

**Examples**:

```tsx
// ✅ Correct - Layout with NativeWind
<View className="flex-1 p-4 bg-white dark:bg-charcoal-900 rounded-2xl border border-neutral-300" />

// ✅ Correct - Responsive design
<View className="p-4 sm:p-6 md:p-8 w-full md:w-1/2 lg:w-1/3" />

// ✅ Correct - Conditional classes with twMerge
<View className={twMerge('p-4 bg-white', isActive && 'bg-primary-50', className)} />

// ✅ Correct - Shadows (inline styles required)
<View
  className="rounded-lg bg-white p-4"
  style={{
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }}
/>

// ❌ Wrong - StyleSheet.create
const styles = StyleSheet.create({ container: { padding: 16 } }); // NEVER DO THIS

// ❌ Wrong - Hardcoded colors
<View style={{ backgroundColor: '#197dfd' }} /> // NEVER DO THIS
```

**Color System** (Design Tokens):

**Tailwind Classes** (use in `className`):

```tsx
// Brand/Primary colors
bg-primary-50 to bg-primary-900     // Blue brand colors
text-primary-600, border-primary-600

// Semantic colors
bg-success-500, text-success-600    // Green success states
bg-warning-500, text-warning-600    // Yellow/orange warnings
bg-danger-500, text-danger-600      // Red errors/destructive actions
bg-neutral-100 to bg-neutral-900    // Gray neutrals
bg-charcoal-50 to bg-charcoal-950   // Dark grays (dark mode)

// Special
bg-white, bg-black, text-white, text-black
```

**JS Props** (when className not available):

```tsx
import colors from '@/components/ui/tokens/colors';

// Usage
<Icon color={colors.primary[600]} />
<ActivityIndicator color={colors.primary[600]} />
<LinearGradient colors={[colors.primary[500], colors.primary[700]]} />
```

**Color Usage Guidelines**:

- **Primary (blue)**: Brand actions, CTAs, links, active states
- **Success (green)**: Success messages, confirmations, positive actions
- **Warning (yellow)**: Warnings, cautions, pending states
- **Danger (red)**: Errors, destructive actions, critical alerts
- **Neutral/Charcoal**: Text, borders, backgrounds, disabled states

**Dark Mode**:

```tsx
// Use dark: prefix for dark mode variants
<View className="bg-white dark:bg-charcoal-900 text-black dark:text-white" />
<Text className="text-neutral-900 dark:text-neutral-50">Content</Text>
```

**Responsive Design**:

**Breakpoints** (Mobile-first approach):

- `xs:` - 360px+ (small phones)
- `sm:` - 414px+ (regular phones)
- `md:` - 768px+ (tablets)
- `lg:` - 1024px+ (large tablets)
- `xl:` - 1280px+ (foldables, desktop)

**Best Practices**:

```tsx
// ✅ Responsive spacing
<View className="p-4 sm:p-6 md:p-8" />

// ✅ Responsive layout
<View className="flex-col sm:flex-row gap-4 sm:gap-6" />

// ✅ Responsive widths (avoid hardcoded)
<View className="w-full md:w-1/2 lg:w-1/3" />

// ❌ Wrong - Hardcoded heights
<View style={{ height: 300 }} />

// ✅ Correct - Use flex or responsive values
<View className="flex-1 min-h-[300px] sm:min-h-[400px]" />
```

**Touch Targets**: Minimum 40px (h-10) for all interactive elements

## State Management

**Zustand** (Global App State):

**File**: `src/store/[feature]/index.tsx`
**Use**: Auth, global UI state, user preferences

**Pattern**:

```tsx
// Define store
import { create } from 'zustand';

type State = {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
};

export const useUserStore = create<State>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

// Use in component
const { user, setUser } = useUserStore();
```

**Zustand Best Practices**:

- Use selectors for granular subscriptions: `useAuthStore((state) => state.token)`
- Persist sensitive data (tokens) to MMKV storage
- Hydrate on app startup (`_layout.tsx`)
- Use middleware for logging/persistence

**@tanstack/react-query** (Server State):

**Always use with Repository pattern**: Screen → Hook → Repository → Backend

**File**: `src/api/[feature]/hooks/use-[action].ts`

**Query Pattern** (no variables):

```tsx
import type { AxiosError } from 'axios';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

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

// Usage in component
const { data, isPending, isError, refetch } = usePosts();
```

**Query Pattern** (with variables):

```tsx
import type { AxiosError } from 'axios';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

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

// Usage in component
const { data, isPending, isError } = usePost(Number(id));
```

**Mutation Pattern**:

```tsx
import type { AxiosError } from 'axios';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

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

// Usage in component
import { useQueryClient } from '@tanstack/react-query';

const { mutate: addPost, isPending } = useAddPost();
const queryClient = useQueryClient();

addPost(
  { title: 'Post', body: 'Content', userId: 1 },
  {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usePosts.queryKey });
      toast.success('Post added');
    },
    onError: (error) => toast.fromHttpError(error),
  }
);
```

**@tanstack/react-query Config** (`src/api/common/client.tsx`):

```tsx
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
  queries: {
    staleTime: 1000 * 60 * 20,      // 20 minutes
    gcTime: 1000 * 60 * 60,         // 60 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  mutations: {
    retry: 0,
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error('[React Query] Query Error:', { queryKey: query.queryKey, error });
      toast.fromHttpError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      console.error('[React Query] Mutation Error:', { mutationKey: mutation.options.mutationKey, error });
      toast.fromHttpError(error);
    },
  }),
});
```

**Local State**:

- `useState` / `useReducer` for component-local state
- React Hook Form for form state with Zod validation

## Repository Pattern (Critical!)

**NEVER skip layers**: Screen → Hook → Repository → Backend

**File Structure**:

```
src/api/
├── common/
│   ├── client.tsx      # React Query client
│   ├── http.ts         # Axios instance + helpers
│   ├── errors.ts       # Custom error classes
│   └── error-utils.ts  # Error handling utilities
└── [feature]/
    ├── repository.ts   # Data access layer
    ├── types.ts        # TypeScript types
    └── hooks/          # React Query hooks
        ├── use-[feature]s.ts    # List query
        ├── use-[feature].ts     # Single item query
        └── use-add-[feature].ts # Create mutation
```

**Repository Template**:

```tsx
// src/api/posts/repository.ts
import { apiGet, apiPost, apiPut, apiDelete } from '@/api/common/http';
import type { Post, PostDTO, CreatePostRequest } from './types';

export const PostsRepository = {
  async list(): Promise<Post[]> {
    const data = await apiGet<PostDTO[]>('/posts');
    return data.map(this.mapDTOToPost);
  },

  async getById(id: number): Promise<Post> {
    const data = await apiGet<PostDTO>(`/posts/${id}`);
    return this.mapDTOToPost(data);
  },

  async create(request: CreatePostRequest): Promise<Post> {
    const data = await apiPost<PostDTO>('/posts/add', request);
    return this.mapDTOToPost(data);
  },

  async update(id: number, request: Partial<CreatePostRequest>): Promise<Post> {
    const data = await apiPut<PostDTO>(`/posts/${id}`, request);
    return this.mapDTOToPost(data);
  },

  async delete(id: number): Promise<void> {
    await apiDelete(`/posts/${id}`);
  },

  // DTO mapper - separates API shape from domain model
  mapDTOToPost(dto: PostDTO): Post {
    return {
      id: dto.id,
      userId: dto.userId,
      title: dto.title,
      body: dto.body,
      // Transform API fields to app fields
    };
  },
};
```

**HTTP Client** (`src/api/common/http.ts`):

**Configuration**:

```tsx
const axiosInstance = axios.create({
  baseURL: Env.EXPO_PUBLIC_API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
  },
});
```

**Request Interceptor**: Automatically adds Bearer token from auth store

**Response Interceptor**: Global 401 handling (auto sign-out)

**Helper Functions**:

```tsx
apiGet<T>(path: string, config?: AxiosRequestConfig): Promise<T>
apiPost<T>(path: string, body?: any, config?: AxiosRequestConfig): Promise<T>
apiPut<T>(path: string, body?: any, config?: AxiosRequestConfig): Promise<T>
apiPatch<T>(path: string, body?: any, config?: AxiosRequestConfig): Promise<T>
apiDelete<T>(path: string, config?: AxiosRequestConfig): Promise<T>
```

**Error Handling**:

**Custom Error Classes** (`src/api/common/errors.ts`):

```tsx
HttpTimeoutError; // Request timeout
HttpNetworkError; // No internet/network issue
HttpResponseError; // 4xx/5xx responses (includes status, data)
HttpUnknownError; // Unexpected errors
```

**Global Error Handler** (`src/api/common/client.tsx`):

```tsx
queryCache: new QueryCache({
  onError: (error, query) => {
    console.error('[React Query] Query Error:', { queryKey: query.queryKey, error });
    toast.fromHttpError(error); // Show toast to user
  },
}),
mutationCache: new MutationCache({
  onError: (error, _variables, _context, mutation) => {
    console.error('[React Query] Mutation Error:', { mutationKey: mutation.options.mutationKey, error });
    toast.fromHttpError(error);
  },
}),
```

**Toast Error Handler** (`src/lib/toast.ts`):

```tsx
toast.fromHttpError(error: unknown): void
  - Displays user-friendly error messages
  - Maps error types to appropriate toast messages
  - Extracts server error messages when available
```

**Why Repository Pattern?**

- **Testability**: Mock repositories instead of HTTP calls
- **Flexibility**: Change API/backend without touching UI
- **Type Safety**: DTO → Domain model transformation
- **Reusability**: Share data access logic across hooks
- **Single Source of Truth**: One place for API endpoints

## Component Patterns

**BEFORE coding**: Check NativeWind, React Native, Expo docs. Understand platform differences, responsive utilities, performance considerations.

### UI Component Library

**Core Components** (`src/components/ui/core/`):

**Button** (`button.tsx`):

```tsx
<Button
  label="Submit"
  variant="default" // default | secondary | outline | destructive | ghost | link
  size="default"    // default | lg | sm | icon
  loading={isPending}
  disabled={false}
  fullWidth={true}
  onPress={handleSubmit}
  className="mt-4"
  testID="submit-button"
/>

// Button with children (custom content)
<Button variant="secondary" size="lg">
  <Icon name="arrow-right" size={20} color={colors.white} />
  <Text className="ml-2 text-white">Next</Text>
</Button>
```

**Variants**:

- `default` - Black (dark theme: white) - Primary actions
- `secondary` - Primary-600 blue - Secondary actions
- `outline` - Border with primary-600 - Tertiary actions
- `destructive` - Danger-500 red - Delete/destructive actions
- `ghost` - Transparent - Inline actions
- `link` - Transparent with text - Text links

**Input** (`input.tsx`):

```tsx
// Uncontrolled
<Input
  label="Email"
  placeholder="Enter email"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
  className="mb-4"
  testID="email-input"
/>

// Controlled (with React Hook Form)
<ControlledInput<FormType>
  name="email"
  control={control}
  label="Email"
  rules={{ required: 'Email is required' }}
/>
```

**Text** (`text.tsx`):

```tsx
<Text className="text-base text-neutral-900 dark:text-neutral-50">
  Simple text
</Text>

// With i18n
<Text tx="common.welcome" className="text-lg font-inter-bold" />
```

**Select** (`select.tsx`):

```tsx
const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
];

<Select
  label="Choose option"
  options={options}
  value={selectedValue}
  onSelect={setSelectedValue}
  placeholder="Select an option"
  error={errors.option}
/>

// Controlled (with React Hook Form)
<ControlledSelect<FormType>
  name="option"
  control={control}
  label="Choose option"
  options={options}
/>
```

**Checkbox/Radio/Switch** (`checkbox.tsx`):

```tsx
// Checkbox
<Checkbox.Root checked={checked} onChange={setChecked}>
  <Checkbox.Icon checked={checked} />
  <Checkbox.Label>Accept terms</Checkbox.Label>
</Checkbox.Root>

// Radio
<Radio.Root checked={selected === 'option1'} onChange={() => setSelected('option1')}>
  <Radio.Icon checked={selected === 'option1'} />
  <Radio.Label>Option 1</Radio.Label>
</Radio.Root>

// Switch
<Switch.Root checked={enabled} onChange={setEnabled}>
  <Switch.Icon checked={enabled} />
  <Switch.Label>Enable notifications</Switch.Label>
</Switch.Root>
```

**Image** (`image.tsx`):

```tsx
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  className="h-56 w-full rounded-xl"
  contentFit="cover"
  placeholder={blurhash}
  transition={300}
/>
```

**Divider** (`divider.tsx`):

```tsx
<Divider className="my-4" />
<Divider horizontal={false} className="mx-4" /> {/* Vertical */}
```

**ProgressBar** (`progress-bar.tsx`):

```tsx
<ProgressBar progress={0.65} className="mb-4" color={colors.primary[600]} />
```

**Extended Components** (`src/components/ui/extended/`):

**Modal** (`modal.tsx`):

```tsx
// Hook-based usage
const { ref, present, dismiss } = useModal();

<Modal
  ref={ref}
  title="Modal Title"
  snapPoints={['60%', '90%']}
  detached={false}
>
  <View className="p-4">
    <Text>Modal content</Text>
    <Button label="Close" onPress={dismiss} />
  </View>
</Modal>

// Trigger
<Button label="Open Modal" onPress={present} />
```

**Features**:

- Built on @gorhom/bottom-sheet
- Auto backdrop with tap-to-dismiss
- Dark mode support
- Custom snap points
- Detached mode (floating)

**Accordion** (`accordion.tsx`):

```tsx
// Single item
<Accordion.Item
  title="Accordion Title"
  open={isOpen}
  onPress={() => setIsOpen(!isOpen)}
>
  <Text>Accordion content</Text>
</Accordion.Item>

// Group (single or multiple expansion)
<Accordion.Group type="single" defaultValue="item1">
  <Accordion.Item value="item1" title="Item 1">
    <Text>Content 1</Text>
  </Accordion.Item>
  <Accordion.Item value="item2" title="Item 2">
    <Text>Content 2</Text>
  </Accordion.Item>
</Accordion.Group>
```

**Badge** (`badge.tsx`):

```tsx
<Badge
  label="New"
  type="default" // default | dot | icon
  variant="primary" // primary | success | warning | danger | neutral
  size="sm" // sm | md | lg
/>

// Badge with number
<Badge label="5" type="number" variant="danger" />

// Badge with icon
<Badge type="icon" variant="success" icon={<Icon name="check" />} />
```

**Card** (`card.tsx`):

```tsx
<Card className="p-4 mb-4">
  <Text className="text-lg font-inter-bold">Card Title</Text>
  <Text className="text-neutral-600">Card content</Text>
</Card>
```

**List** (`list.tsx`):

```tsx
// FlashList wrapper
<List
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  keyExtractor={(item) => item.id}
  estimatedItemSize={100}
/>

// Empty state
<EmptyList
  isLoading={isPending}
  title="No items found"
  description="Try adjusting your filters"
/>
```

**AlertDialog** (`alert-dialog.tsx`):

```tsx
<AlertDialog
  visible={showDialog}
  title="Delete Item"
  description="Are you sure you want to delete this item? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  onConfirm={handleDelete}
  onCancel={() => setShowDialog(false)}
  variant="danger"
/>
```

**Price** (`price.tsx`):

```tsx
<Price
  value={99.99}
  currency="USD"
  className="text-lg font-inter-bold text-primary-600"
/>
```

**ChipSelection** (`chip-selection.tsx`):

```tsx
const options = ['Option 1', 'Option 2', 'Option 3'];

<ChipSelection
  options={options}
  selected={selectedOption}
  onSelect={setSelectedOption}
  multiple={false}
/>;
```

**QuantityStepper** (`quantity-stepper.tsx`):

```tsx
<QuantityStepper
  value={quantity}
  onChange={setQuantity}
  min={1}
  max={10}
  step={1}
/>
```

**SearchInput** (`search-input.tsx`):

```tsx
<SearchInput
  value={searchQuery}
  onChangeText={setSearchQuery}
  placeholder="Search items..."
  onClear={() => setSearchQuery('')}
/>
```

**Layout Components** (`src/components/ui/layout/`):

**Screen** (`screen.tsx`):

```tsx
<Screen
  scroll={true}
  safeArea={true}
  edges={['top', 'bottom']}
  padding="md" // none | sm | md | lg | xl
  header={<HomeHeader title="Feed" />}
  statusBarStyle="dark" // dark | light | auto
  keyboardAware={false}
  className="bg-white"
>
  <View className="flex-1">{/* Screen content */}</View>
</Screen>
```

**Features**:

- Auto SafeAreaView
- Keyboard handling (KeyboardAvoidingView)
- StatusBar integration
- Flexible padding presets
- Optional header slot
- ScrollView or static View

**HomeHeader** (`home-header.tsx`):

```tsx
<HomeHeader
  title="Feed"
  showBack={false}
  rightAction={
    <Pressable onPress={handleSearch}>
      <Icon name="search" size={24} color={colors.neutral[900]} />
    </Pressable>
  }
/>
```

**AppHeader** (`app-header.tsx`):

```tsx
<AppHeader
  title="Post Details"
  showBack={true}
  onBack={() => router.back()}
  rightAction={<Icon name="share" />}
/>
```

**BottomActionSection** (`bottom-action-section.tsx`):

```tsx
<BottomActionSection>
  <Button label="Save" variant="secondary" onPress={handleSave} />
  <Button label="Cancel" variant="outline" onPress={handleCancel} />
</BottomActionSection>
```

**Icons** (`src/components/ui/icons/`):

Available icons (18+ custom SVG components):

- ArrowLeft, ArrowRight, Avatar, CaretDown
- Feed, GitHub, Home, Language
- PlaceholderImage, PlaceholderVideo
- Rate, Search, Settings, Share, Style, Support, Website

**Usage**:

```tsx
import { Search } from '@/components/ui/icons';

<Search className="text-neutral-900" />;
```

### Component Styling with tailwind-variants

**Pattern** (for custom components):

```tsx
import { tv } from 'tailwind-variants';
import type { VariantProps } from 'tailwind-variants';

const component = tv({
  slots: {
    container: 'flex-row items-center rounded-lg',
    label: 'text-base font-inter-medium',
    icon: 'size-6',
  },
  variants: {
    variant: {
      default: {
        container: 'bg-white border border-neutral-300',
        label: 'text-neutral-900',
      },
      primary: {
        container: 'bg-primary-600',
        label: 'text-white',
      },
    },
    size: {
      sm: { container: 'h-8 px-3', label: 'text-sm' },
      md: { container: 'h-10 px-4', label: 'text-base' },
    },
    disabled: {
      true: {
        container: 'bg-neutral-100',
        label: 'text-neutral-400',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

type ComponentVariants = VariantProps<typeof component>;

interface Props extends ComponentVariants {
  label: string;
  className?: string;
}

export function Component({
  label,
  variant,
  size,
  disabled,
  className,
}: Props) {
  const styles = component({ variant, size, disabled });

  return (
    <View className={styles.container({ className })}>
      <Text className={styles.label()}>{label}</Text>
    </View>
  );
}
```

## Common Patterns

### Navigation Pattern

```tsx
import { useRouter, Link } from 'expo-router';

// Programmatic navigation
const router = useRouter();

router.push('/feed/add-post'); // Navigate to route
router.push(`/feed/${postId}`); // Dynamic route
router.back(); // Go back
router.replace('/login'); // Replace (no back)

// Link component
<Link href="/feed/add-post" asChild>
  <Pressable className="p-4 bg-primary-600 rounded-lg">
    <Text className="text-white">Create Post</Text>
  </Pressable>
</Link>;

// Get route params
const { id } = useLocalSearchParams<{ id: string }>();
```

### Feed/List Pattern

```tsx
import { FlashList } from '@shopify/flash-list';

export default function Feed() {
  const { data, isPending, isError, refetch } = usePosts();

  const renderItem = React.useCallback(
    ({ item }: { item: Post }) => <PostCard post={item} />,
    []
  );

  if (isError) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-danger-600 text-lg mb-4">
            Error loading posts
          </Text>
          <Button label="Retry" variant="outline" onPress={() => refetch()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeArea={false} header={<HomeHeader title="Feed" />}>
      <FlashList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<EmptyList isLoading={isPending} />}
        estimatedItemSize={300}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}
```

### Post Card Pattern

```tsx
export const PostCard = ({ post }: { post: Post }) => {
  return (
    <Link href={`/feed/${post.id}`} asChild>
      <Pressable>
        <Card className="m-2 overflow-hidden">
          <Image
            source={{ uri: post.imageUrl }}
            className="h-56 w-full rounded-t-xl"
            contentFit="cover"
          />
          <View className="p-4">
            <Text className="text-xl font-inter-bold mb-2">{post.title}</Text>
            <Text numberOfLines={3} className="text-neutral-600 leading-snug">
              {post.body}
            </Text>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
};
```

### Form Pattern (with Zod validation)

```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useAddPost, usePosts } from '@/api';
import { Button, ControlledInput, View } from '@/components/ui';
import { toast } from '@/lib/toast';

// 1. Define schema
const schema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  body: z.string().min(120, 'Body must be at least 120 characters'),
});

type FormType = z.infer<typeof schema>;

// 2. Component
export default function AddPost() {
  const { control, handleSubmit } = useForm<FormType>({
    resolver: zodResolver(schema),
  });

  const { mutate: addPost, isPending } = useAddPost();
  const queryClient = useQueryClient();
  const router = useRouter();

  const onSubmit = (data: FormType) => {
    addPost(
      { ...data, userId: 1 },
      {
        onSuccess: () => {
          // Use exported queryKey from hook
          queryClient.invalidateQueries({ queryKey: usePosts.queryKey });
          toast.success('Post added successfully');
          router.back();
        },
        onError: (error) => {
          toast.fromHttpError(error);
        },
      }
    );
  };

  return (
    <View className="flex-1 p-4">
      <ControlledInput<FormType>
        name="title"
        control={control}
        label="Title"
        placeholder="Enter post title"
      />

      <ControlledInput<FormType>
        name="body"
        control={control}
        label="Body"
        placeholder="Enter post body"
        multiline
        numberOfLines={6}
        className="h-32"
      />

      <Button
        label="Add Post"
        loading={isPending}
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
}
```

### Detail Screen Pattern

```tsx
export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isPending, isError } = usePost({
    variables: { id: Number(id) },
  });

  if (isPending) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text className="mt-4 text-neutral-600">Loading post...</Text>
        </View>
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-danger-600 text-lg">Post not found</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen header={<AppHeader title="Post" showBack />} padding="md">
      <Text className="text-2xl font-inter-bold mb-4">{data.title}</Text>
      <Text className="text-neutral-700 leading-relaxed">{data.body}</Text>
    </Screen>
  );
}
```

### Bottom Sheet Modal Pattern

```tsx
export default function Component() {
  const { ref, present, dismiss } = useModal();

  return (
    <View>
      <Button label="Open Options" onPress={present} />

      <Modal ref={ref} title="Options" snapPoints={['40%', '60%']}>
        <View className="p-4 gap-4">
          <Button
            label="Option 1"
            variant="outline"
            onPress={() => {
              handleOption1();
              dismiss();
            }}
          />
          <Button
            label="Option 2"
            variant="outline"
            onPress={() => {
              handleOption2();
              dismiss();
            }}
          />
        </View>
      </Modal>
    </View>
  );
}
```

### Loading State Pattern

```tsx
{
  isPending && (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color={colors.primary[600]} />
      <Text className="mt-4 text-neutral-600">Loading...</Text>
    </View>
  );
}
```

### Empty State Pattern

```tsx
{
  !isPending && data?.length === 0 && (
    <View className="flex-1 items-center justify-center p-8">
      <View className="items-center">
        <View className="size-20 bg-neutral-100 rounded-full items-center justify-center mb-4">
          <Icon name="feed" size={40} color={colors.neutral[400]} />
        </View>
        <Text className="text-xl font-inter-bold mb-2">No Posts Found</Text>
        <Text className="text-neutral-600 text-center mb-6">
          Start by creating your first post
        </Text>
        <Button
          label="Create Post"
          variant="secondary"
          onPress={() => router.push('/feed/add-post')}
        />
      </View>
    </View>
  );
}
```

### Error State Pattern

```tsx
{
  isError && (
    <View className="m-4 p-4 bg-danger-50 rounded-xl border border-danger-200">
      <Text className="text-danger-700 font-inter-bold mb-2">Error</Text>
      <Text className="text-danger-600 mb-4">{error.message}</Text>
      <Button
        label="Retry"
        variant="outline"
        size="sm"
        onPress={() => refetch()}
      />
    </View>
  );
}
```

### Conditional Rendering Pattern

```tsx
<Screen>
  {isPending ? (
    <LoadingView />
  ) : isError ? (
    <ErrorView error={error} onRetry={refetch} />
  ) : data?.length === 0 ? (
    <EmptyView />
  ) : (
    <FlashList data={data} renderItem={renderItem} />
  )}
</Screen>
```

### Animation Pattern (with Moti)

```tsx
import { MotiView } from 'moti';

// Fade in
<MotiView
  from={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ type: 'timing', duration: 300 }}
>
  <Content />
</MotiView>

// Slide up
<MotiView
  from={{ opacity: 0, translateY: 50 }}
  animate={{ opacity: 1, translateY: 0 }}
  transition={{ type: 'spring', damping: 15 }}
>
  <Content />
</MotiView>

// Scale bounce
<MotiView
  from={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: 'spring', damping: 10 }}
>
  <Content />
</MotiView>
```

### Haptic Feedback Pattern

```tsx
import * as Haptics from 'expo-haptics';

// Light tap
<Pressable
  onPress={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handlePress();
  }}
>
  <Text>Button</Text>
</Pressable>;

// Success feedback
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Error feedback
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

// Selection change
Haptics.selectionAsync();
```

## Adding New Features

### When to Create a Store

**Create Zustand Store When**:

- State is shared across multiple screens/features
- State needs to persist across app restarts (with MMKV)
- Complex state logic with multiple actions
- Global UI state (theme, language, etc.)

**Example: Orders Feature with Store**

```tsx
// src/store/orders/index.tsx
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';

type OrderFilters = {
  status?: 'pending' | 'delivered' | 'cancelled';
  dateRange?: { start: Date; end: Date };
};

type OrdersState = {
  filters: OrderFilters;
  setFilters: (filters: OrderFilters) => void;
  clearFilters: () => void;

  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
};

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      filters: {},
      setFilters: (filters) => set({ filters }),
      clearFilters: () => set({ filters: {} }),

      selectedOrderId: null,
      setSelectedOrderId: (id) => set({ selectedOrderId: id }),
    }),
    {
      name: 'orders-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
```

**Don't Create Store When**:

- State is only used in one screen/component → Use useState
- Server data that needs caching → Use React Query
- Form state → Use React Hook Form
- Derived state → Use useMemo

### Feature Implementation Checklist

When adding a new feature (e.g., Orders, Email Sync):

**1. API Layer** (`src/api/[feature]/`):

```
└── orders/
    ├── repository.ts       # Data access methods
    ├── types.ts           # TypeScript types (DTOs, domain models)
    └── hooks/
        ├── use-orders.ts           # List query
        ├── use-order.ts            # Single item query
        ├── use-create-order.ts     # Create mutation
        └── use-update-order.ts     # Update mutation
```

**2. Store** (if needed) (`src/store/[feature]/`):

```
└── orders/
    └── index.tsx          # Zustand store for global state
```

**3. Components** (`src/components/[feature]/`):

```
└── orders/
    ├── order-card.tsx     # List item component
    ├── order-filters.tsx  # Filter component
    └── order-status.tsx   # Status badge
```

**4. Screens** (`src/app/orders/`):

```
└── orders/
    ├── index.tsx          # Orders list
    ├── [id].tsx           # Order detail
    └── create.tsx         # Create order
```

**5. Update Root Layout** (if adding to main nav):

```tsx
// src/app/(app)/_layout.tsx
<Tabs.Screen
  name="orders"
  options={{
    title: 'Orders',
    tabBarIcon: ({ color }) => <OrdersIcon color={color} />,
  }}
/>
```

**Example: Email Sync Feature**

```tsx
// 1. src/api/email/types.ts
export type Email = {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: Date;
  isOrder: boolean;
  orderDetails?: OrderExtract;
};

export type SyncStatus = {
  lastSyncAt: Date;
  totalEmails: number;
  newOrders: number;
};

// 2. src/api/email/repository.ts
export const EmailRepository = {
  async sync(): Promise<SyncStatus> {
    const data = await apiPost<SyncStatusDTO>('/email/sync');
    return this.mapDTOToSyncStatus(data);
  },

  async list(filters?: EmailFilters): Promise<Email[]> {
    const data = await apiGet<EmailDTO[]>('/emails', { params: filters });
    return data.map(this.mapDTOToEmail);
  },

  mapDTOToEmail(dto: EmailDTO): Email {
    /* ... */
  },
  mapDTOToSyncStatus(dto: SyncStatusDTO): SyncStatus {
    /* ... */
  },
};

// 3. src/api/email/hooks/use-sync-emails.ts
export const useSyncEmails = createMutation<SyncStatus, void, AxiosError>({
  mutationFn: () => EmailRepository.sync(),
});

// 4. src/store/email/index.tsx
export const useEmailStore = create<EmailState>((set) => ({
  lastSyncAt: null,
  setLastSyncAt: (date) => set({ lastSyncAt: date }),

  filters: {},
  setFilters: (filters) => set({ filters }),
}));

// 5. src/app/emails/index.tsx
export default function EmailsScreen() {
  const { data, isPending } = useEmails();
  const { mutate: syncEmails, isPending: isSyncing } = useSyncEmails();
  const { setLastSyncAt } = useEmailStore();

  const handleSync = () => {
    syncEmails(undefined, {
      onSuccess: (data) => {
        setLastSyncAt(data.lastSyncAt);
        toast.success(`Synced ${data.newOrders} new orders`);
      },
    });
  };

  return (
    <Screen header={<HomeHeader title="Emails" />}>
      <View className="p-4 bg-primary-50 rounded-xl mb-4">
        <Button label="Sync Emails" loading={isSyncing} onPress={handleSync} />
      </View>
      <FlashList
        data={data}
        renderItem={({ item }) => <EmailCard email={item} />}
        estimatedItemSize={100}
      />
    </Screen>
  );
}
```

## File Naming Conventions

**Screens/Pages**:

- `src/app/(app)/index.tsx` - Tab screen
- `src/app/[feature]/[id].tsx` - Dynamic route
- `src/app/[feature]/add-[item].tsx` - Create screen

**Components**:

- **UI Components**: `ComponentName.tsx` (PascalCase)
- **Feature Components**: `feature-component.tsx` (kebab-case)

**Hooks**:

- `use-[action].ts` (kebab-case with `use-` prefix)
- Examples: `use-posts.ts`, `use-add-post.ts`

**Repositories**:

- `[feature].repository.ts` (kebab-case)
- Examples: `posts.repository.ts`, `orders.repository.ts`

**Stores**:

- `src/store/[feature]/index.tsx` (kebab-case directory)

**Types**:

- `types.ts` or `[feature].types.ts` (kebab-case)

**Utils**:

- `[name].ts` (kebab-case)
- Examples: `toast.ts`, `logger.ts`, `animations.ts`

**Exports**:

- Named exports preferred
- Default exports for screens/pages only

## Environment Configuration

**Multi-Environment Setup**:

**Environments**: development, staging, production

**Files**:

```
.env.development    # Dev environment variables
.env.staging        # Staging environment variables
.env.production     # Production environment variables
```

**Environment Variables** (`env.js`):

```typescript
// Client variables (accessible at runtime)
export const ClientEnv = {
  APP_ENV: z.enum(['development', 'staging', 'production']),
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_API_KEY: z.string().optional(),
  // Add more client variables...
};

// Build-time variables (only during build)
export const BuildEnv = {
  SENTRY_DSN: z.string().optional(),
  GOOGLE_SERVICES_JSON: z.string().optional(),
  // Add more build variables...
};
```

**Usage**:

```tsx
import { Env } from '@env';

const apiUrl = Env.EXPO_PUBLIC_API_URL;
const apiKey = Env.EXPO_PUBLIC_API_KEY;
```

**Build Commands**:

```bash
# Development
pnpm start                          # Start dev
pnpm ios                           # Run iOS dev
pnpm android                       # Run Android dev
pnpm build:development:ios         # Build iOS dev

# Staging
pnpm start:staging
pnpm ios:staging
pnpm build:staging:ios

# Production
pnpm start:production
pnpm ios:production
pnpm build:production:ios
```

**Bundle IDs**:

- Development: `com.fetchit.development`
- Staging: `com.fetchit.staging`
- Production: `com.fetchit`

## Best Practices & Gotchas

### DO ✅

- **Always** use UI wrappers (`<Button>`, `<Input>`, `<Card>`) over raw RN components
- **Always** follow Repository pattern: Screen → Hook → Repository → Backend
- **Always** use Tailwind classes for styling; inline styles ONLY for shadows/platform-specific
- **Always** use `twMerge()` for conditional className merging
- **Always** check docs (NativeWind, RN, Expo) before implementing new patterns
- Use `FlashList` for long lists, not `ScrollView` with `.map()`
- Use `numberOfLines` for text truncation
- Use responsive classes (`sm:`, `md:`, `lg:`) for tablet/desktop support
- Add `testID` for testing, `accessibilityLabel` for accessibility
- Use @tanstack/react-query for ALL server state
- Export query keys from hooks for easy invalidation
- Use `useQuery` for queries, `useMutation` for mutations
- Always use `useQueryClient` for query client operations
- Validate forms with Zod schemas
- Persist sensitive data (tokens) to MMKV storage
- Use `useCallback` for `renderItem` in lists
- Extract repeated components (3+ uses) into separate files
- Use `React.memo()` for expensive components

### DON'T ❌

- **NEVER** use `StyleSheet.create()` - completely removed
- **NEVER** hardcode colors (`#197dfd`) - use Tailwind classes or token imports
- **NEVER** skip Repository layers - always Screen → Hook → Repository
- **NEVER** fetch data directly in components - use hooks + repositories
- **NEVER** use ScrollView for long lists - use FlashList
- Don't hardcode heights/widths - use flex, responsive values
- Don't use `<Button>` for navigation - use `<Pressable>` with `<Link>`
- Don't create new components without checking existing UI library
- Don't over-engineer - keep it simple
- Don't commit sensitive data (tokens, API keys) - use `.env` files
- Don't use anonymous functions in `renderItem` - define outside component

### Common Mistakes

```tsx
// ❌ Wrong - StyleSheet
const styles = StyleSheet.create({ container: { padding: 16 } });

// ✅ Correct - NativeWind
<View className="p-4" />

// ❌ Wrong - Hardcoded color
<View style={{ backgroundColor: '#197dfd' }} />

// ✅ Correct - Tailwind class
<View className="bg-primary-600" />

// ❌ Wrong - Skipping Repository
const { data } = useQuery(['posts'], () => axios.get('/posts'));

// ✅ Correct - Using Repository
const { data } = usePosts(); // Hook calls Repository

// ❌ Wrong - ScrollView for long list
<ScrollView>
  {posts.map(post => <PostCard key={post.id} post={post} />)}
</ScrollView>

// ✅ Correct - FlashList
<FlashList
  data={posts}
  renderItem={({ item }) => <PostCard post={item} />}
  estimatedItemSize={200}
/>

// ❌ Wrong - Anonymous function in renderItem
<FlashList
  data={posts}
  renderItem={({ item }) => <PostCard post={item} />}
/>

// ✅ Correct - Memoized function
const renderItem = React.useCallback(
  ({ item }: { item: Post }) => <PostCard post={item} />,
  []
);
<FlashList data={posts} renderItem={renderItem} />
```

## Performance Tips

### FlashList Best Practices

```tsx
// ✅ Correct - Memoized renderItem
const renderItem = React.useCallback(
  ({ item }: { item: Post }) => <PostCard post={item} />,
  []
);

// ✅ Correct - Stable keyExtractor
<FlashList
  data={posts}
  renderItem={renderItem}
  keyExtractor={(item) => item.id.toString()}
  estimatedItemSize={200} // Important for performance
  showsVerticalScrollIndicator={false}
/>;
```

### Image Optimization

```tsx
// ✅ Use expo-image for automatic caching
import { Image } from '@/components/ui';

<Image
  source={{ uri: imageUrl }}
  className="h-56 w-full"
  contentFit="cover"
  placeholder={blurhash} // Optional placeholder
  transition={300} // Smooth transition
  cachePolicy="memory-disk" // Cache strategy
/>;
```

### React.memo for Expensive Components

```tsx
// ✅ Memoize components that render frequently
export const PostCard = React.memo(({ post }: { post: Post }) => {
  return (
    <Card>
      <Text>{post.title}</Text>
      <Text>{post.body}</Text>
    </Card>
  );
});
```

### Optimistic Updates

```tsx
const { mutate: updatePost } = useUpdatePost({
  onMutate: async (variables) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ['posts'] });

    // Snapshot previous value
    const previousPosts = queryClient.getQueryData(['posts']);

    // Optimistically update
    queryClient.setQueryData(['posts'], (old: Post[]) =>
      old.map((post) =>
        post.id === variables.id ? { ...post, ...variables } : post
      )
    );

    return { previousPosts };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['posts'], context?.previousPosts);
  },
  onSettled: () => {
    // Refetch after mutation
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  },
});
```

## Testing

### Component Testing

```tsx
// Add testID for testing
<Button testID="submit-button" label="Submit" onPress={handleSubmit} />
<Input testID="email-input" label="Email" />
<Screen testID="feed-screen">
  <FlashList testID="posts-list" data={posts} />
</Screen>
```

### Accessibility

```tsx
// Add accessibility props
<Button
  label="Add to Cart"
  accessibilityLabel="Add product to cart"
  accessibilityHint="Double tap to add this product to your cart"
  accessibilityRole="button"
/>

<Pressable
  onPress={handleClose}
  accessibilityLabel="Close modal"
  accessibilityRole="button"
  accessibilityHint="Closes the modal and returns to previous screen"
>
  <Icon name="close" />
</Pressable>

<Image
  source={{ uri: imageUrl }}
  accessibilityLabel={`Product image for ${product.name}`}
/>
```

## Quick Reference

### Spacing Scale

- `gap-1` = 4px, `gap-2` = 8px, `gap-4` = 16px, `gap-6` = 24px, `gap-8` = 32px
- `p-1` = 4px, `p-2` = 8px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px
- `m-1` = 4px, `m-2` = 8px, `m-4` = 16px, `m-6` = 24px, `m-8` = 32px

### Border Radius

- `rounded` = 8px, `rounded-lg` = 12px, `rounded-xl` = 16px, `rounded-2xl` = 24px, `rounded-full` = 9999px

### Font Sizes

- `text-xs` = 12px, `text-sm` = 14px, `text-base` = 16px, `text-lg` = 18px
- `text-xl` = 20px, `text-2xl` = 24px, `text-3xl` = 30px

### Common Color Classes

- **Primary**: `bg-primary-600`, `text-primary-600`, `border-primary-600`
- **Success**: `bg-success-500`, `text-success-600`, `border-success-500`
- **Warning**: `bg-warning-500`, `text-warning-600`, `border-warning-500`
- **Danger**: `bg-danger-500`, `text-danger-600`, `border-danger-500`
- **Neutral**: `bg-neutral-100`, `text-neutral-600`, `border-neutral-300`
- **Charcoal**: `bg-charcoal-900`, `text-charcoal-50`, `border-charcoal-700`

### Layout Utilities

- **Flex**: `flex-row`, `flex-col`, `flex-1`, `flex-wrap`
- **Alignment**: `items-center`, `items-start`, `items-end`, `justify-between`, `justify-center`
- **Positioning**: `absolute`, `relative`, `top-4`, `bottom-4`, `left-4`, `right-4`, `inset-0`
- **Sizing**: `w-full`, `h-full`, `w-1/2`, `h-screen`, `min-h-screen`

### Responsive Utilities

- `sm:p-6` - Apply on phones 414px+
- `md:flex-row` - Apply on tablets 768px+
- `lg:w-1/2` - Apply on large tablets 1024px+
- `xl:p-12` - Apply on desktop/foldables 1280px+

## Project-Specific Notes

### FetchIt App Context

**Purpose**: Email sync and order tracking from multiple e-commerce platforms

**Core Features**:

1. **Email Sync** - Connect Gmail, read emails, extract order information
2. **Order Tracking** - Track orders from Amazon, Flipkart, etc.
3. **Company Orders** - Track FetchIt-fulfilled orders (no email sync needed)
4. **Order History** - View past orders, delivery status
5. **Notifications** - Push notifications for order updates

**Future Feature Considerations**:

- When adding email sync: Consider OAuth flow, background sync, email parsing
- When adding order tracking: Consider status updates, delivery timelines, tracking URLs
- When adding notifications: Consider push notification setup, local notifications
- When adding multiple accounts: Consider account switching, data isolation

### Architecture for FetchIt

**Recommended Feature Structure**:

```
src/
├── api/
│   ├── email/           # Email sync feature
│   ├── orders/          # Order tracking feature
│   ├── tracking/        # Delivery tracking feature
│   └── notifications/   # Push notifications
├── components/
│   ├── email/           # Email-related components
│   ├── orders/          # Order-related components
│   └── tracking/        # Tracking-related components
├── store/
│   ├── email/           # Email sync state
│   └── orders/          # Order filters, selected order
└── app/
    ├── (app)/           # Main tabs: feed, orders, settings
    ├── orders/          # Order screens
    ├── email/           # Email sync screens
    └── tracking/        # Tracking screens
```

**When implementing email sync**:

- Use Repository pattern for Gmail API calls
- Store sync status in Zustand
- Use React Query for email list
- Background sync with Expo Background Fetch
- Parse emails server-side for order extraction

**When implementing order tracking**:

- Store selected order in Zustand
- Use React Query for order list/details
- WebSocket for real-time tracking updates
- Push notifications for status changes

## Documentation

**Check these files for detailed guidance**:

- `docs/ARCHITECTURE.md` - Deep dive into architecture patterns (if exists)
- `tailwind.config.js` - Complete Tailwind configuration
- `src/components/ui/tokens/` - Design token definitions
- `src/api/posts/` - Reference implementation for new features

**External Docs**:

- NativeWind v4: https://www.nativewind.dev/v4/overview
- Expo Router: https://docs.expo.dev/router/introduction/
- @tanstack/react-query: https://tanstack.com/query/latest
- @gorhom/bottom-sheet: https://gorhom.dev/react-native-bottom-sheet/

## Principles

**KISS** - Keep it simple, stupid
**DRY** - Don't repeat yourself
**YAGNI** - You aren't gonna need it

**When in doubt, ask!** It's better to clarify requirements than to build the wrong thing.
