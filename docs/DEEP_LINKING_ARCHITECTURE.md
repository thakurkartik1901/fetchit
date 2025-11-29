# Deep Linking Architecture - FetchIt

## Overview

FetchIt uses a **centralized deep link router** pattern for handling all deep links in the application. This architecture provides better scalability, maintainability, and prevents common issues like race conditions and multiple listeners.

## Why Centralized?

### Problems with Hook-Based Deep Link Handling

**Before** (deep link handling in `useGoogleAuth` hook):
```typescript
// ❌ Problems:
// 1. Multiple hooks = multiple listeners
// 2. Race conditions when multiple features use deep links
// 3. Difficult to add new deep link types
// 4. Hook is tightly coupled to deep linking logic
// 5. Testing is harder (need to mock deep links in hook)

export function useGoogleAuth(onSuccess, onError) {
  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);
    // ... deep link handling logic
  }, []);
}
```

### Benefits of Centralized Router

**After** (centralized router in `_layout.tsx`):
```typescript
// ✅ Benefits:
// 1. Single listener for all deep links
// 2. Clear routing logic in one place
// 3. Easy to add new deep link types
// 4. Hooks are simpler and focused
// 5. Better testing (mock deep links at app level)

export default function RootLayout() {
  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      if (handleGmailAuthCallback(url)) return;
      if (handlePaymentCallback(url)) return;
      // ... route to other handlers
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    // ...
  }, []);
}
```

## Architecture

### 1. Deep Link Router (`src/app/_layout.tsx`)

**Responsibility**: Listen for deep links and route to appropriate handlers

**Location**: Root layout (runs once on app startup)

**Code**:
```typescript
React.useEffect(() => {
  const handleDeepLink = ({ url }: { url: string }) => {
    console.log('🔗 Deep link received:', url);

    // Route to handlers in priority order
    if (handleGmailAuthCallback(url)) return;
    if (handlePaymentCallback(url)) return;
    if (handleShareCallback(url)) return;

    // Unhandled deep link
    console.warn('⚠️ Unhandled deep link:', url);
  };

  // Listen for deep links while app is running
  const subscription = Linking.addEventListener('url', handleDeepLink);

  // Check if app was opened with a deep link (cold start)
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink({ url });
  });

  return () => subscription.remove();
}, []);
```

**Features**:
- Handles both warm starts (app running) and cold starts (app closed)
- Routes to handlers in priority order
- Logs unhandled deep links for debugging
- Single subscription cleanup

---

### 2. Deep Link Handlers (`src/lib/deep-linking/handlers.ts`)

**Responsibility**: Process specific deep link patterns

**Pattern**: Each handler returns `boolean`
- `true` = Link was handled (successfully or with error)
- `false` = Link doesn't match this handler's pattern

**Example Handler**:
```typescript
export function handleGmailAuthCallback(url: string): boolean {
  // 1. Check if this handler should process the URL
  if (!url.startsWith('fetchit://auth/callback')) {
    return false; // Not our pattern, let other handlers try
  }

  try {
    // 2. Extract parameters
    const params = new URL(url).searchParams;
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    // 3. Validate required data
    if (!accessToken) {
      toast.error('Failed to link Gmail: No access token received');
      return true; // Handled but failed
    }

    // 4. Create token object
    const token: GmailTokenType = {
      accessToken,
      refreshToken: refreshToken || undefined,
      expiresIn: expiresIn ? parseInt(expiresIn) : undefined,
      issuedAt: Date.now(),
      tokenType: 'Bearer',
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
    };

    // 5. Call Zustand action directly
    linkGmail(token);
    toast.success('Gmail account linked successfully!');

    return true; // Successfully handled
  } catch (error) {
    console.error('❌ Error handling Gmail auth callback:', error);
    toast.error('Failed to link Gmail account');
    return true; // Handled but failed
  }
}
```

**Handler Guidelines**:
- Return `false` early if URL doesn't match
- Always return `true` after processing (success or error)
- Log errors with descriptive messages
- Show user feedback (toast messages)
- Call Zustand actions directly (no callbacks needed)

---

### 3. OAuth Hook (`src/lib/gmail/use-google-auth.tsx`)

**Responsibility**: Open OAuth browser flow ONLY

**Before** (81 lines with deep link handling):
```typescript
export function useGoogleAuth(
  onSuccess: (token: GmailTokenType) => void,
  onError?: (error: string) => void
): UseGoogleAuthResult {
  // 40+ lines of deep link handling logic
  const handleDeepLink = useCallback(({ url }) => {
    // ... process tokens
    onSuccess(token);
  }, [onSuccess, onError]);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);
    // ...
  }, [handleDeepLink]);

  // ... browser opening logic
}
```

**After** (75 lines, no deep link handling):
```typescript
export function useGoogleAuth(): UseGoogleAuthResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePromptAsync = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authUrl = `${BACKEND_URL}/auth/authorize`;
      const result = await WebBrowser.openBrowserAsync(authUrl);

      if (result.type === 'dismiss' || result.type === 'cancel') {
        setIsLoading(false);
      }

      // Note: On success, backend redirects to fetchit://auth/callback
      // which is handled by the centralized deep link router in _layout.tsx
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

  return { promptAsync: handlePromptAsync, isLoading, error, revokeAccess };
}
```

**Changes**:
- Removed `onSuccess` and `onError` callbacks (no longer needed)
- Removed deep link listener and handling
- Simplified to only handle browser opening
- Added clear documentation about deep link handling in `_layout.tsx`

---

## Data Flow

### Gmail OAuth Complete Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User Action                                                  │
│    User taps "Link Account" in Settings                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Component (GmailItem)                                        │
│    const { promptAsync } = useGoogleAuth();                     │
│    promptAsync(); // Triggers OAuth                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. OAuth Hook (useGoogleAuth)                                   │
│    Opens browser: https://your-backend.com/auth/authorize       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. User completes OAuth in browser                              │
│    Signs in with Google, approves permissions                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Backend OAuth Server                                         │
│    Exchanges code for tokens                                    │
│    Redirects: fetchit://auth/callback?accessToken=...           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Deep Link Router (_layout.tsx)                               │
│    Receives: fetchit://auth/callback?accessToken=...            │
│    Routes to: handleGmailAuthCallback(url)                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. Gmail Auth Handler (handlers.ts)                             │
│    Extracts tokens from URL params                              │
│    Creates GmailTokenType object                                │
│    Calls: linkGmail(token) // Zustand action                    │
│    Shows: toast.success('Gmail account linked!')                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. Zustand Store (useGmail)                                     │
│    Saves token to MMKV storage                                  │
│    Updates state: { gmailToken: token, isGmailLinked: true }    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. UI Updates                                                   │
│    Settings: "Connected - Track orders from your emails"        │
│    Home: Fetches and displays orders                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Adding New Deep Links

### Example: Payment Callback

**1. Create Handler** (`src/lib/deep-linking/handlers.ts`)

```typescript
import { usePaymentStore } from '@/store/payment';
import { toast } from '../toast';

export function handlePaymentCallback(url: string): boolean {
  if (!url.startsWith('fetchit://payment/callback')) {
    return false;
  }

  try {
    const params = new URL(url).searchParams;
    const status = params.get('status'); // 'success' | 'failed' | 'cancelled'
    const orderId = params.get('orderId');
    const transactionId = params.get('transactionId');

    if (!orderId) {
      toast.error('Invalid payment callback: No order ID');
      return true;
    }

    // Update payment store
    const { updatePaymentStatus } = usePaymentStore.getState();
    updatePaymentStatus(orderId, {
      status,
      transactionId: transactionId || undefined,
      timestamp: Date.now(),
    });

    // Show user feedback
    if (status === 'success') {
      toast.success('Payment successful!');
      // Navigate to order confirmation
      router.push(`/orders/${orderId}`);
    } else if (status === 'failed') {
      toast.error('Payment failed. Please try again.');
    } else if (status === 'cancelled') {
      toast.info('Payment cancelled');
    }

    return true;
  } catch (error) {
    console.error('❌ Error handling payment callback:', error);
    toast.error('Failed to process payment callback');
    return true;
  }
}
```

**2. Export Handler** (`src/lib/deep-linking/index.ts`)

```typescript
export {
  handleGmailAuthCallback,
  handlePaymentCallback, // Add new export
  handleShareCallback,
} from './handlers';
```

**3. Route in Layout** (`src/app/_layout.tsx`)

```typescript
import {
  handleGmailAuthCallback,
  handlePaymentCallback, // Add import
  handleShareCallback,
} from '@/lib/deep-linking';

// Inside RootLayout useEffect:
const handleDeepLink = ({ url }: { url: string }) => {
  if (handleGmailAuthCallback(url)) return;
  if (handlePaymentCallback(url)) return; // Add routing
  if (handleShareCallback(url)) return;

  console.warn('⚠️ Unhandled deep link:', url);
};
```

**4. Trigger Deep Link** (from payment gateway)

```typescript
// In your payment integration
const PAYMENT_GATEWAY_CONFIG = {
  returnUrl: 'fetchit://payment/callback',
  cancelUrl: 'fetchit://payment/callback?status=cancelled',
};

// Payment gateway will redirect back to:
// fetchit://payment/callback?status=success&orderId=123&transactionId=abc
```

Done! The payment deep link is now fully integrated.

---

## Supported Deep Link Patterns

| Pattern | Purpose | Handler | Status |
|---------|---------|---------|--------|
| `fetchit://auth/callback` | Gmail OAuth callback | `handleGmailAuthCallback` | ✅ Implemented |
| `fetchit://payment/callback` | Payment gateway callback | `handlePaymentCallback` | 📝 Example (not implemented) |
| `fetchit://share/*` | Social sharing | `handleShareCallback` | 📝 Example (not implemented) |
| `fetchit://notification/*` | Push notification open | TBD | 🔮 Future |
| `fetchit://order/:id` | Order detail deep link | TBD | 🔮 Future |
| `https://fetchit.app/*` | Universal links | TBD | 🔮 Future |

---

## Testing Deep Links

### 1. Test with Command Line (Development)

```bash
# Android
adb shell am start -W -a android.intent.action.VIEW -d "fetchit://auth/callback?accessToken=test123&refreshToken=refresh456&expiresIn=3600"

# iOS (Simulator)
xcrun simctl openurl booted "fetchit://auth/callback?accessToken=test123&refreshToken=refresh456&expiresIn=3600"

# iOS (Device)
# Use Safari to open the URL or send via Messages
```

### 2. Test with Browser (Real OAuth Flow)

1. Start backend server: `cd backend && npm run dev`
2. Start ngrok: `ngrok http 3000`
3. Update `BACKEND_URL` in `use-google-auth.tsx`
4. Run app: `pnpm android` or `pnpm ios`
5. Tap "Link Account" in Settings
6. Complete OAuth flow
7. Check console logs for deep link routing

### 3. Test Error Cases

```typescript
// Missing access token
fetchit://auth/callback?refreshToken=refresh456

// Invalid URL format
fetchit://auth/callback?malformed

// Unhandled deep link pattern
fetchit://unknown/route
```

### 4. Check Logs

Look for these console messages:

```
🔗 Deep link received: fetchit://auth/callback?...
✅ Gmail token received via deep link
```

Or for errors:

```
❌ No access token in Gmail callback
❌ Error handling Gmail auth callback: [error details]
⚠️ Unhandled deep link: fetchit://unknown
```

---

## Best Practices

### 1. Handler Design

✅ **DO**:
- Return `false` early if URL doesn't match pattern
- Always return `true` after processing (even on error)
- Log all deep link events with clear messages
- Show user feedback (toasts)
- Call Zustand actions directly
- Handle errors gracefully

❌ **DON'T**:
- Use callbacks (onSuccess/onError) - call store actions directly
- Add deep link handling to hooks/components
- Create multiple listeners
- Forget to handle error cases
- Ignore unhandled deep links

### 2. URL Structure

✅ **DO**:
- Use consistent scheme: `fetchit://`
- Group by feature: `fetchit://[feature]/[action]`
- Use query params for data: `?key=value&key2=value2`
- Validate all required params

❌ **DON'T**:
- Mix schemes (fetchit://, myapp://, etc.)
- Use path params for complex data (use query params)
- Forget to URL-encode values
- Assume params are always present

### 3. Security

✅ **DO**:
- Validate all deep link data
- Sanitize user input from params
- Check token expiration
- Log security-relevant events

❌ **DON'T**:
- Trust deep link data blindly
- Execute actions without validation
- Store sensitive data in URLs
- Expose internal state in deep links

---

## Migration Guide

If you have existing hook-based deep link handling:

### Step 1: Create Handler

Move deep link processing logic from hook to handler:

```typescript
// Before: In hook
useEffect(() => {
  const handleDeepLink = ({ url }) => {
    // ... processing logic
    onSuccess(data);
  };
}, []);

// After: In handlers.ts
export function handleFeatureCallback(url: string): boolean {
  if (!url.startsWith('fetchit://feature/callback')) return false;

  try {
    // ... processing logic (same as before)
    const { updateFeature } = useFeatureStore.getState();
    updateFeature(data); // Call store directly instead of callback
    toast.success('Success!');
    return true;
  } catch (error) {
    toast.error('Failed');
    return true;
  }
}
```

### Step 2: Simplify Hook

Remove deep link handling from hook:

```typescript
// Before
export function useFeatureAuth(onSuccess, onError) {
  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  return { promptAsync };
}

// After
export function useFeatureAuth() {
  // Just browser/flow triggering logic
  return { promptAsync };
}
```

### Step 3: Update Components

Remove callbacks from hook usage:

```typescript
// Before
const { promptAsync } = useFeatureAuth(
  (data) => { /* success */ },
  (error) => { /* error */ }
);

// After
const { promptAsync } = useFeatureAuth();
// Success/error handled by deep link handler
```

### Step 4: Add to Router

Import and route in `_layout.tsx`:

```typescript
import { handleFeatureCallback } from '@/lib/deep-linking';

// In RootLayout useEffect:
if (handleFeatureCallback(url)) return;
```

---

## Industry Standards

This centralized deep link router pattern is used by:

- **Airbnb** - Centralized deep link handling in app delegate
- **Uber** - Router pattern for deep links and universal links
- **Instagram** - Single deep link processor for all features
- **Slack** - Centralized routing with feature-specific handlers

**Reference**: [React Native Deep Linking Best Practices](https://reactnative.dev/docs/linking)

---

## Troubleshooting

### Deep link not working

1. Check app scheme in `app.config.ts`:
   ```typescript
   scheme: 'fetchit'
   ```

2. Rebuild app after scheme changes:
   ```bash
   npx expo prebuild --clean
   pnpm android # or pnpm ios
   ```

3. Check console logs for deep link events

4. Verify handler pattern matches URL

### Handler not triggered

1. Check handler is exported from `index.ts`
2. Verify handler is imported in `_layout.tsx`
3. Ensure handler is called in router
4. Check handler return value (`false` = not handled)

### Multiple handlers triggered

- Handlers are called in order - first match wins
- Ensure patterns don't overlap
- Return `true` to stop routing

---

## Summary

The centralized deep link router provides:

✅ **Scalability**: Easy to add new deep link types
✅ **Maintainability**: All routing logic in one place
✅ **Reliability**: Single listener, no race conditions
✅ **Testability**: Easy to mock and test handlers
✅ **Separation of Concerns**: Hooks focus on their primary purpose
✅ **Industry Standard**: Follows best practices from major apps

**Migration**: Existing hook-based deep link handling can be refactored to this pattern in 4 simple steps.
