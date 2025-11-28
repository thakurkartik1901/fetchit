import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';

import type { GmailTokenType } from './utils';

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

export function useGoogleAuth(
  onSuccess: (token: GmailTokenType) => void,
  onError?: (error: string) => void
): UseGoogleAuthResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle deep link callback from backend
  const handleDeepLink = useCallback(
    ({ url }: { url: string }) => {
      console.log('🔗 Deep link received:', url);

      // Check if this is our auth callback
      // IMPORTANT: 'fetchit' matches your app scheme from app.config.ts
      if (url.startsWith('fetchit://auth/callback')) {
        const params = new URL(url).searchParams;

        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');
        const expiresIn = params.get('expiresIn');

        if (accessToken) {
          const token: GmailTokenType = {
            accessToken,
            refreshToken: refreshToken || undefined,
            expiresIn: expiresIn ? parseInt(expiresIn) : undefined,
            issuedAt: Date.now(),
            tokenType: 'Bearer',
            scope: 'https://www.googleapis.com/auth/gmail.readonly',
          };

          console.log('✅ Received Gmail token from backend');
          setIsLoading(false);
          setError(null);
          onSuccess(token);
        } else {
          const errorMsg = 'No access token received';
          console.error('❌', errorMsg);
          setError(errorMsg);
          setIsLoading(false);
          onError?.(errorMsg);
        }
      }
    },
    [onSuccess, onError]
  );

  // Listen for deep link callbacks
  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);

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
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      setIsLoading(false);
      onError?.(errorMessage);
      console.error('❌ Browser error:', errorMessage);
    }
  }, [onError]);

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
