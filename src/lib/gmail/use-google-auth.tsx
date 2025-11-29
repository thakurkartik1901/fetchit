import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';

// IMPORTANT: Update this URL to your backend URL
// Development: ngrok URL (e.g., https://abc123.ngrok-free.dev)
// Production: your deployed backend URL
const BACKEND_URL = 'https://your-ngrok-url.ngrok-free.dev';

type UseGoogleAuthResult = {
  promptAsync: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  revokeAccess: () => Promise<void>;
};

/**
 * Google OAuth Hook
 *
 * Simplified hook that only handles opening the OAuth browser flow.
 * Deep link handling is centralized in src/app/_layout.tsx
 *
 * The flow:
 * 1. User calls promptAsync() -> Opens browser with backend OAuth URL
 * 2. User completes OAuth in browser
 * 3. Backend redirects to fetchit://auth/callback with tokens
 * 4. Deep link router in _layout.tsx handles the callback
 * 5. handleGmailAuthCallback() processes tokens and calls linkGmail()
 */
export function useGoogleAuth(): UseGoogleAuthResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start the OAuth flow
  const handlePromptAsync = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Opening backend OAuth URL...');

      // Open backend authorization endpoint in browser
      const authUrl = `${BACKEND_URL}/auth/authorize`;
      const result = await WebBrowser.openBrowserAsync(authUrl);

      console.log('🌐 Browser result:', result.type);

      // If user dismisses the browser without completing auth
      if (result.type === 'dismiss' || result.type === 'cancel') {
        setIsLoading(false);
        console.log('ℹ️ User dismissed browser');
      }

      // Note: On success, the backend redirects to fetchit://auth/callback
      // which is handled by the centralized deep link router in _layout.tsx
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      setIsLoading(false);
      console.error('❌ Browser error:', errorMessage);
    }
  }, []);

  const revokeAccess = useCallback(async () => {
    // Implement token revocation if needed
    setError(null);
  }, []);

  return {
    promptAsync: handlePromptAsync,
    isLoading,
    error,
    revokeAccess,
  };
}
