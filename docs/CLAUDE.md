# CLAUDE.md

Guidance for Claude Code when working with this React Native e-commerce app (Expo, catalog, cart, orders, Paytm payments).

## 🚨 Critical Rules

1. **USE UI wrappers** - `<Card>`, `<Button>`, `<Text>` over raw React Native components
2. **FOLLOW pattern** - Screen → Hook → Repository → Backend (never skip)
3. **NEVER hardcode colors** - Use `Colors` from `@/theme/tokens` (JS) or NativeWind classes (JSX); prefer `anmasa-*`
4. **NEVER use StyleSheet.create()** - NativeWind classes + inline styles for platform-specific only
5. **Responsive design** - Use vh/vw for containers, avoid hardcoded heights except touch targets (36px min)
6. **Check docs BEFORE coding** - Consult NativeWind, React Native, Expo docs, `docs/ARCHITECTURE.md`

## Stack & Config

**Framework**: Expo ~54.0, React Native 0.81.4, React 19.1.0
**Routing**: Expo Router 6.0 (file-based, typed routes)
**Styling**: NativeWind 4.2 (Tailwind for RN)
**Experimental**: React Compiler, New Architecture enabled

**Platform**:

- Bundle ID: `com.anonymous.anmasaappv2`
- Scheme: `anmasaappv2`
- iOS: Tablet support
- Android: Edge-to-edge, predictive back disabled

## Architecture

**Routes**: `(tabs)` - main nav; `(auth)` - plp/pdp; `(onboarding)` - onboarding. Root: `src/app/_layout.tsx`

**Features** (`src/features/`): catalog, order, auth, customer, address, paytm, location. Each has: `repository/`, `hooks/`, `components/`, `store.ts`, `validation/`

**Global Stores** (`src/store/`): `location.store.tsx` (Context), `cart/theme/auth.store.ts` (Zustand-future)

**State Strategy**: React Context (`.tsx`) for simple/app-level state; Zustand (`.ts`) for complex/cross-feature

**Shared**: `src/lib/` (utils), `src/providers/` (QueryProvider, ThemeProvider), `src/components/ui/` (reusables), `src/components/layout/`, `src/theme/`

**Path**: `@/*` → `./src/*`

## Styling

**NativeWind First** (primary): Use `className` for layout, colors, spacing. Use `cn()` from `src/lib/cn.ts` for conditional classes.

**Inline styles ONLY** for: Shadows (iOS/Android), platform-specific behaviors

**Examples**:

```tsx
// Layout with NativeWind
<View className="p-4 bg-surface-subtle rounded-2xl border border-border" />

// Shadows require inline styles
<View className="rounded-full bg-white px-4 py-3"
  style={{ shadowColor: Colors.anmasa.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 }} />

// JS props use Colors tokens
<Icon color={Colors.text.body} />
<LinearGradient colors={[Colors.anmasa.success, Colors.anmasa.green]} />
```

**Color Rules**:

- JSX/className → NativeWind (`bg-brand-500`, `text-anmasa-green`, `border-border`)
- JS props → `Colors.anmasa.*` (`Colors.anmasa.green`, `Colors.text.body`)
- Prefer `anmasa-*` for brand, `text-*` for semantic
- Available tokens: `text.*`, `anmasa.*`, `surface.*`, `border.*`, `category.*`

**Responsive Design**:

- Containers: Use vh/vw (`h-[17vh]`, `w-full`)
- Positioning: Bottom-relative (`bottom-4`), not fixed top values
- DO hardcode: Touch targets (36px min), standard UI (search 48px)
- DON'T hardcode: Container heights, widths (use `flex-1`, `left-X right-X`)

**Docs**: `docs/DESIGN_TOKENS_GUIDE.md` (reference), `docs/design-tokens-usage.md` (enforcement)

## State Management

**Context** (`.tsx`): Simple, app-level, rare changes

- File: `src/store/[name].store.tsx`
- Use: Location, theme preferences
- Pattern: `createContext` → `Provider` → custom hook

**Zustand** (`.ts`): Complex, cross-feature, frequent updates

- File: `src/store/[name].store.ts` or `src/features/[feature]/store.ts`
- Use: Cart, auth, complex state with middleware
- Pattern: `create()` with actions and selectors

**React Query**: Server state (fetching, caching, syncing)

- Use: API data, background updates
- Always pair with Repository pattern

## Repository Pattern (Critical!)

**NEVER skip layers**: Screen → Hook → Repository → Backend

```tsx
// Screen
const { products } = useProducts();

// Hook
function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => productRepo.getProducts(),
  });
}

// Repository
const productRepo = {
  async getProducts(): Promise<Product[]> {
    const res = await axios.get<ProductDTO[]>('/api/products');
    return res.data.map(this.mapToProduct);
  },
};
```

Why: Testability, flexibility, type safety, reusability. Full details: `docs/ARCHITECTURE.md`

## Component Patterns

**BEFORE coding**: Check NativeWind, React Native, Expo docs (use context7 MCP tool). Understand platform differences, responsive utilities, performance considerations.

**Layout pattern** (`src/components/layout/`):

```tsx
<View className="relative h-[17vh]">
  <LinearGradient
    colors={[Colors.anmasa.success, Colors.anmasa.green]}
    className="absolute inset-x-0 top-0 h-full rounded-b-xl"
  />
  <StatusBar style="light" /> {/* dark bg → light text */}
  <Pressable
    className="absolute bottom-4 left-4 right-4"
    style={{ shadowColor: Colors.anmasa.black, elevation: 3 }}
  >
    <Icon name="icon-name" color={Colors.text.body} />
  </Pressable>
</View>
```

**Key patterns**: vh for containers, absolute positioning, `StatusBar` style, `LinearGradient` with tokens, inline shadows

## Text Components (`src/components/ui/Text.tsx`)

**Semantic components** (all accept `weight` prop):

| Component      | Size        | Default Weight  | Use For                  |
| -------------- | ----------- | --------------- | ------------------------ |
| `Heading1Text` | 32px (5xl)  | bold            | Page titles              |
| `Heading2Text` | 24px (3xl)  | bold            | Section titles           |
| `Heading3Text` | 18px (xl)   | semibold        | Subsection titles        |
| `TitleText`    | 16px (lg)   | bold, uppercase | Titles, emphasized       |
| `BodyText`     | 14px (base) | regular         | Main content             |
| `SubtitleText` | 14px (base) | regular         | Secondary info           |
| `CaptionText`  | 12px (sm)   | regular         | Helper text, metadata    |
| `LabelText`    | 10px (xs)   | regular         | Form labels, tags        |
| `SmallText`    | 8px (2xs)   | regular         | Micro labels, time units |
| `MutedText`    | 12px (sm)   | light           | Placeholders, disabled   |
| `ErrorText`    | 12px (sm)   | regular         | Errors, validation       |
| `NegativeText` | 14px (base) | regular         | Dark backgrounds         |

**Colors**: Prefer `anmasa-*` (brand) or `text-*` (semantic). Font sizes use numbered naming (`text-2xs`), not `xxs`.

**Example**: `<CaptionText weight="semibold" className="text-anmasa-grey">{category}</CaptionText>`

## UI Wrappers (`src/components/ui/`)

**Prefer wrappers** over raw RN components: `<Card>`, `<Button>`, `<Modal>`, `<Text>`, `<Icon>`, `<Divider>`, `<Badge>`, `<Price>`, `<IconButton>`, `<AppImage>`, `<Input>`, `<Screen>`

Why: Consistency, single source of truth, token integration, type safety. All accept `className` for customization.

## Component Reference

### Card

Default: `bg-surface`, `rounded-2xl`, `border border-border`, `p-4`, `shadow-sm`

```tsx
<Card className="gap-2">
  <AppImage source={{ uri: product.image }} className="h-40 w-full" />
  <Text weight="semibold">{product.name}</Text>
  <Price value={product.price} />
</Card>
```

### Button

**Variants**: `brand` (green primary), `outline`, `ghost`, `danger`
**Sizes**: `sm` (36px), `md` (44px), `lg` (48px)
**Props**: `loading`, `fullWidth`, `variant`, `size`, `accessibilityLabel`

```tsx
<Button variant="brand" size="lg" fullWidth onPress={handleSubmit}>Submit</Button>
<Button variant="outline" loading>Processing...</Button>
<Button variant="danger">Delete</Button>
```

✅ Use for: Forms, CTAs, destructive actions
❌ Don't use for: Navigation, cards, icon-only (use `<IconButton>`)

### Input

**Props**: `label`, `helpText`, `error`, `className`, `inputClassName`
**Defaults**: `h-12`, `px-4`, `rounded-2xl`, `border` (red on error), `bg-surface`

```tsx
<Input label="Email" error={errors.email} value={email} onChange={setEmail} />
```

### Screen

**Props**: `scroll` (default true), `safeArea` (default true), `edges`, `padding` (none/sm/md/lg/xl), `header`, `statusBarStyle`, `keyboardAware`, `scrollViewProps`

```tsx
<Screen header={<AppHeader title="Products" />} padding="md">
  <FlatList data={products} renderItem={ProductCard} />
</Screen>

<Screen keyboardAware padding="lg">
  <Input label="Email" />
  <Button variant="brand">Login</Button>
</Screen>
```

### Modal

**Simple bottom sheet with slide-up animation and keyboard handling**

**Props**: `isVisible`, `onClose`, `height` ("90%" | 600), `disableClose`, `className`, `style`, `backdropClassName`, `backdropStyle`

**Features**:

- Smooth slide-up animation (spring)
- Built-in KeyboardAvoidingView (platform-aware)
- Flexible height control (% or px)
- Safe area aware with automatic padding
- Backdrop with tap-to-dismiss
- Fully customizable via className/style

**Philosophy**: Composition over configuration - consumers control their own headers/content layout

**Height Control**:

- `height="90%"` - Percentage of screen (most common)
- `height={600}` - Fixed pixels (auto-scaled with rs())

```tsx
// Login/OTP Form Modal with Close Button
<Modal
  isVisible={isVisible}
  onClose={onClose}
  height="90%"
  disableClose={isLoading}
  className="bg-white">
  {/* Close Button */}
  <View className="flex-row justify-end px-4 pt-4">
    <Pressable onPress={onClose} disabled={isLoading} className="p-2 bg-surface-subtle rounded-full">
      <Icon name="chevron-down" size={20} color={Colors.text.body} />
    </Pressable>
  </View>

  {/* Content */}
  <PhoneNumberInput onSubmit={handleSubmit} />
</Modal>

// Address Selection with Scrolling
<Modal isVisible={isVisible} onClose={onClose} height={500}>
  <ScrollView keyboardShouldPersistTaps="handled">
    <AddressList addresses={addresses} />
  </ScrollView>
</Modal>

// Custom Layout (No Scrolling)
<Modal isVisible={isVisible} onClose={onClose} height={520} className="bg-white">
  <View className="px-6 pt-4 flex-1">
    {/* Your custom layout with headers, close buttons, etc. */}
  </View>
</Modal>
```

✅ Use for: Bottom sheets, forms with keyboard input, overlays
❌ Don't use for: Complex custom animations (create custom component)

**Note**: Modal automatically handles keyboard avoidance. Add ScrollView as children if you need scrolling. Consumers control all layout, headers, and close buttons for maximum flexibility.

### Badge, Divider, Price, IconButton, AppImage

- **Badge**: Tones: `success`, `danger`, `warning`, `default`. `<Badge tone="success">In Stock</Badge>`
- **Divider**: `<Divider />` or `<Divider vertical />`
- **Price**: `<Price value={99.99} />` (₹ formatted)
- **IconButton**: `<IconButton name="heart" onPress={onFavorite} />` (haptic, 22px)
- **AppImage**: Enhanced image with caching, transitions, fallback. `<AppImage source={{ uri }} className="h-40" />`

## File Naming Conventions

### Screens & Pages

- `src/app/(tabs)/index.tsx` - Tab screen (home)
- `src/app/product/[id].tsx` - Dynamic route (product details)
- `src/app/_layout.tsx` - Root layout
- Use lowercase with dashes for routes: `product-list.tsx`

### Components

- **UI Components**: `src/components/ui/ComponentName.tsx` (PascalCase)
- **Layout Components**: `src/components/layout/AppHeader.tsx` (PascalCase)
- **Feature Components**: `src/features/catalog/components/ProductCard.tsx` (PascalCase)

### Hooks, Repositories, Stores

- **Hooks**: `src/features/catalog/hooks/useProducts.ts` (camelCase with `use` prefix)
- **Repository**: `src/features/catalog/repository/product.repository.ts` (kebab-case)
- **Store**: `src/store/location.store.tsx` (kebab-case, `.tsx` for Context, `.ts` for Zustand)

### Types & Validation

- **Types**: `src/features/catalog/types/product.types.ts` (kebab-case)
- **Validation**: `src/features/address/validation/address.schema.ts` (kebab-case)

### Utils & Config

- **Utils**: `src/lib/cn.ts`, `src/lib/axios.ts` (kebab-case)
- **Config**: `src/theme/tokens.ts` (kebab-case)

## Adding UI Wrappers

**Process**: Identify pattern → Extract → Test → Document → Migrate

**Template** (`src/components/ui/NewComponent.tsx`):

```tsx
import { View, ViewProps } from 'react-native';
import { cn } from '../../lib/cn';

type Props = ViewProps & {
  className?: string;
  variant?: 'default' | 'alt';
};

export function NewComponent({
  className,
  variant = 'default',
  ...props
}: Props) {
  return (
    <View
      {...props}
      className={cn(
        'bg-surface rounded-2xl p-4', // Base styles
        variant === 'alt' && 'bg-surface-soft', // Variants
        className // Custom overrides
      )}
    />
  );
}
```

## Icon Management

1. Add `icon-name.svg` (24x24px viewBox, clean paths) to `src/assets/icons/`
2. Import in `Icon.tsx`: `import NewIcon from "../../assets/icons/new-icon.svg";`
3. Add to MAP: `const MAP = { ..., 'new-icon': NewIcon } as const;`
4. Use with type safety: `<Icon name="new-icon" size={24} color={Colors.text.body} />`

## Common Patterns

### Navigation Pattern

```tsx
import { useRouter } from 'expo-router';

const router = useRouter();

// Navigate to route
router.push('/products');
router.push(`/product/${productId}`); // Dynamic route
router.back(); // Go back

// Replace (no back)
router.replace('/login');

// Header with back button
<Pressable onPress={router.back} className="p-2">
  <Icon name="arrow-left" size={24} color={Colors.text.body} />
</Pressable>;
```

### Product Card Pattern

```tsx
<Pressable onPress={() => router.push(`/product/${product.id}`)}>
  <Card className="gap-2">
    <AppImage
      source={{ uri: product.imageUrl }}
      className="h-40 w-full rounded-xl"
    />
    <View className="gap-1">
      <Text weight="semibold" numberOfLines={2}>
        {product.name}
      </Text>
      <Price value={product.price} />
      <CaptionText className="text-anmasa-grey">{product.category}</CaptionText>
    </View>
    <Button
      variant="brand"
      size="sm"
      onPress={(e) => {
        e.stopPropagation();
        addToCart();
      }}
    >
      Add to Cart
    </Button>
  </Card>
</Pressable>
```

### Form Pattern

```tsx
<Screen keyboardAware padding="lg">
  <Heading2Text className="mb-4">Sign Up</Heading2Text>

  <Input
    label="Full Name"
    value={name}
    onChangeText={setName}
    error={errors.name}
  />

  <Input
    label="Email"
    value={email}
    onChangeText={setEmail}
    keyboardType="email-address"
    error={errors.email}
  />

  <Input
    label="Password"
    value={password}
    onChangeText={setPassword}
    secureTextEntry
    error={errors.password}
  />

  <Button
    variant="brand"
    size="lg"
    fullWidth
    onPress={handleSubmit}
    loading={isLoading}
  >
    Create Account
  </Button>
</Screen>
```

### List Pattern

```tsx
<Screen header={<AppHeader title="Products" showBack />}>
  <FlatList
    data={products}
    renderItem={({ item }) => <ProductCard product={item} />}
    keyExtractor={(item) => item.id}
    contentContainerClassName="gap-4 p-4"
    showsVerticalScrollIndicator={false}
  />
</Screen>
```

### Header with Gradient Pattern

```tsx
<View className="relative h-[17vh]">
  <LinearGradient
    colors={[Colors.anmasa.success, Colors.anmasa.green]}
    className="absolute inset-x-0 top-0 h-full rounded-b-xl"
  />
  <StatusBar style="light" />

  <Pressable className="absolute top-11 left-4 right-4" onPress={onSearch}>
    <Icon name="search" size={24} color={Colors.surface.subtle} />
    <NegativeText>Search products...</NegativeText>
  </Pressable>
</View>
```

### Category Badge Pattern

```tsx
<View className="flex-row gap-2 flex-wrap">
  <Badge tone="success">New</Badge>
  <Badge tone="warning">Limited Stock</Badge>
  <Badge>Organic</Badge>
</View>
```

### Loading State Pattern

```tsx
{
  isLoading && (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color={Colors.anmasa.green} />
      <BodyText className="mt-4 text-anmasa-grey">Loading products...</BodyText>
    </View>
  );
}
```

### Empty State Pattern

```tsx
{
  !isLoading && products.length === 0 && (
    <View className="flex-1 items-center justify-center p-8">
      <Icon name="empty-box" size={64} color={Colors.anmasa.disabled} />
      <Heading3Text className="mt-4 text-center">
        No Products Found
      </Heading3Text>
      <SubtitleText className="mt-2 text-center">
        Try adjusting your filters
      </SubtitleText>
      <Button variant="outline" className="mt-6" onPress={clearFilters}>
        Clear Filters
      </Button>
    </View>
  );
}
```

### Error State Pattern

```tsx
{
  error && (
    <View className="p-4 bg-red-50 rounded-xl border border-red-200">
      <ErrorText>{error.message}</ErrorText>
      <Button variant="outline" size="sm" className="mt-2" onPress={retry}>
        Retry
      </Button>
    </View>
  );
}
```

### Conditional Rendering Pattern

```tsx
<Screen>
  {isLoading ? (
    <Loader />
  ) : error ? (
    <ErrorState error={error} onRetry={refetch} />
  ) : products.length === 0 ? (
    <EmptyState />
  ) : (
    <FlatList data={products} renderItem={renderProduct} />
  )}
</Screen>
```

### API Integration Pattern

```tsx
// 1. Repository (src/features/catalog/repository/product.repository.ts)
export const productRepository = {
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    const response = await axiosInstance.get<ProductDTO[]>('/api/products', {
      params: filters,
    });
    return response.data.map(this.mapDTOToProduct);
  },

  mapDTOToProduct(dto: ProductDTO): Product {
    return {
      id: dto.id,
      name: dto.name,
      price: dto.price / 100, // Convert cents to rupees
      imageUrl: dto.image_url,
      category: dto.category_name,
    };
  },
};

// 2. Hook (src/features/catalog/hooks/useProducts.ts)
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productRepository.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// 3. Screen (src/app/(tabs)/products.tsx)
export default function ProductsScreen() {
  const { data: products, isLoading, error, refetch } = useProducts();

  if (isLoading) return <Loader />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <Screen>
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </Screen>
  );
}
```

## Best Practices & Gotchas

### DO ✅

- **Always** use semantic Text components (`<Heading2Text>`, `<BodyText>`) over manual `<Text className="...">`
- **Always** use UI wrappers (`<Card>`, `<Button>`) over raw RN components
- **Always** follow Repository pattern: Screen → Hook → Repository → Backend
- **Always** use `Colors` tokens for JS props, NativeWind classes for JSX
- **Always** use `cn()` utility for conditional className merging
- **Always** check docs (NativeWind, RN, Expo) before implementing new patterns
- Use `numberOfLines` for text truncation
- Use `gap-*` classes for spacing between elements
- Use `flex-row`, `items-center`, `justify-between` for layouts
- Add `testID` for testing, `accessibilityLabel` for accessibility
- Use React Query for server state, always with Repository pattern

### DON'T ❌

- **NEVER** use `StyleSheet.create()` - completely removed
- **NEVER** hardcode colors (`#3C4F19`) - use tokens or NativeWind
- **NEVER** skip Repository layers - always Screen → Hook → Repository
- **NEVER** use `text-xxs` - use `text-2xs` (numbered naming)
- **NEVER** use `<Button>` for navigation - use `<Pressable>` with `<Icon>`
- **NEVER** hardcode container heights - use vh/vw (`h-[17vh]`)
- Don't use inline styles for layout - only for shadows/platform-specific
- Don't use `<Text>` directly - use semantic variants
- Don't create new components without checking existing UI wrappers
- Don't over-engineer - keep it simple

### Performance Tips

- Use `FlatList` for long lists, not `ScrollView` with `.map()`
- Use `AppImage` (expo-image) for caching, not regular `<Image>`
- Use `React.memo()` for expensive components (150+ lines)
- Extract repeated components (3+ uses) into separate files
- Use `keyExtractor` with stable IDs in FlatList
- Avoid anonymous functions in renderItem - define outside component

### Common Mistakes

```tsx
// ❌ Wrong
<View style={{ padding: 16 }}>
  <Text className="text-sm">Category</Text>
</View>

// ✅ Correct
<View className="p-4">
  <CaptionText>Category</CaptionText>
</View>

// ❌ Wrong - skipping Repository
const { data } = useQuery(['products'], () => axios.get('/products'));

// ✅ Correct - using Repository
const { products } = useProducts(); // Hook calls Repository

// ❌ Wrong - hardcoded color
<Icon color="#F9FAF7" />

// ✅ Correct - using token
<Icon color={Colors.surface.subtle} />
```

## Validation & Forms

### Zod Schema Pattern

```tsx
// src/features/address/validation/address.schema.ts
import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
});

export type AddressFormData = z.infer<typeof addressSchema>;

// Hook usage
export function useAddressForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (data: AddressFormData) => {
    try {
      addressSchema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.reduce(
          (acc, err) => ({
            ...acc,
            [err.path[0]]: err.message,
          }),
          {}
        );
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  return { validate, errors };
}
```

### Form with Validation

```tsx
export default function AddressForm() {
  const [formData, setFormData] = useState<AddressFormData>({
    street: '',
    city: '',
    pincode: '',
    phone: '',
  });
  const { validate, errors } = useAddressForm();

  const handleSubmit = () => {
    if (validate(formData)) {
      // Submit form
      saveAddress(formData);
    }
  };

  return (
    <Screen keyboardAware>
      <Input
        label="Street Address"
        value={formData.street}
        onChangeText={(street) => setFormData({ ...formData, street })}
        error={errors.street}
      />
      <Input
        label="City"
        value={formData.city}
        onChangeText={(city) => setFormData({ ...formData, city })}
        error={errors.city}
      />
      <Button variant="brand" onPress={handleSubmit}>
        Submit
      </Button>
    </Screen>
  );
}
```

## Mutations & Updates

### React Query Mutation Pattern

```tsx
// Hook (src/features/catalog/hooks/useAddToCart.ts)
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => cartRepository.addItem(productId),
    onSuccess: () => {
      // Invalidate cart queries to refetch
      queryClient.invalidateQueries({ queryKey: ['cart'] });

      // Show success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });
}

// Usage in component
export default function ProductDetails() {
  const { mutate: addToCart, isPending } = useAddToCart();

  return (
    <Button
      variant="brand"
      loading={isPending}
      onPress={() => addToCart(product.id)}
    >
      Add to Cart
    </Button>
  );
}
```

### Optimistic Updates Pattern

```tsx
export function useUpdateQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartRepository.updateQuantity(itemId, quantity),

    // Optimistically update UI before server responds
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });

      const previousCart = queryClient.getQueryData(['cart']);

      queryClient.setQueryData(['cart'], (old: Cart) => ({
        ...old,
        items: old.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        ),
      }));

      return { previousCart };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['cart'], context?.previousCart);
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
```

## Testing Patterns

### Component Testing

```tsx
// Use testID for testing
<Button testID="submit-button" onPress={handleSubmit}>Submit</Button>
<Input testID="email-input" label="Email" />

// Screen components
<Screen testID="products-screen">
  <FlatList testID="products-list" data={products} />
</Screen>
```

### Accessibility

```tsx
<Button accessibilityLabel="Add product to cart" accessibilityHint="Double tap to add">
  Add to Cart
</Button>

<Icon name="close" accessibilityLabel="Close modal" />

<AppImage source={{ uri }} accessibilityLabel={`Product image for ${product.name}`} />
```

## Quick Reference

### Spacing Scale

- `gap-1` = 4px, `gap-2` = 8px, `gap-4` = 16px, `gap-6` = 24px, `gap-8` = 32px
- `p-1` = 4px, `p-2` = 8px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px
- `m-1` = 4px, `m-2` = 8px, `m-4` = 16px, `m-6` = 24px, `m-8` = 32px

### Border Radius

- `rounded` = 8px, `rounded-lg` = 12px, `rounded-xl` = 16px, `rounded-2xl` = 24px, `rounded-full` = 9999px

### Font Sizes

- `text-2xs` = 8px, `text-xs` = 10px, `text-sm` = 12px, `text-base` = 14px
- `text-lg` = 16px, `text-xl` = 18px, `text-3xl` = 24px, `text-5xl` = 32px

### Common Color Classes

- Brand: `bg-brand-500`, `text-brand-500`, `border-brand-500`
- Surface: `bg-surface`, `bg-surface-subtle`, `bg-surface-soft`
- Text: `text-text-title`, `text-text-body`, `text-text-subtitle`, `text-text-caption`
- Anmasa: `text-anmasa-green`, `text-anmasa-grey`, `text-anmasa-white`, `text-anmasa-error`

### Layout Utilities

- Flex: `flex-row`, `flex-col`, `flex-1`, `flex-wrap`
- Alignment: `items-center`, `items-start`, `items-end`, `justify-between`, `justify-center`
- Positioning: `absolute`, `relative`, `top-4`, `bottom-4`, `left-4`, `right-4`, `inset-0`

## Documentation

**Design**: `docs/DESIGN_TOKENS_GUIDE.md` (tokens reference), `docs/design-tokens-usage.md` (enforcement rules)

**Architecture**: `docs/ARCHITECTURE.md` ⭐ PRIMARY - Repository pattern, state management, validation (Zod), performance (FlatList, images, React.memo), animation/haptics, file naming, component decomposition (150-line rule, 3-use rule). **Consult BEFORE catalog/cart features or major decisions.**

**Principles**: KISS, DRY, no over-engineering. Ask when in doubt.
