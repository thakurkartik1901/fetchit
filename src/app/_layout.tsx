// Import  global CSS file
import '../../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Toaster } from 'sonner-native';

import { APIProvider } from '@/api';
import { loadSelectedTheme } from '@/lib';
import {
  handleGmailAuthCallback,
  handlePaymentCallback,
  handleShareCallback,
} from '@/lib/deep-linking';
import { hydrateGmail } from '@/lib/gmail';
import { useThemeConfig } from '@/lib/use-theme-config';
import { hydrateAuth } from '@/store/auth';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)',
};

hydrateAuth();
hydrateGmail();
loadSelectedTheme();
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export default function RootLayout() {
  // Centralized Deep Link Router
  React.useEffect(() => {
    /**
     * Deep Link Router
     *
     * Routes incoming deep links to appropriate handlers.
     * Handlers return true if they processed the link, false otherwise.
     *
     * Supported patterns:
     * - fetchit://auth/callback - Gmail OAuth callback
     * - fetchit://payment/callback - Payment callback (future)
     * - fetchit://share/* - Social sharing (future)
     */
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
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Providers>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
    </Providers>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig();
  return (
    <GestureHandlerRootView
      style={styles.container}
      className={theme.dark ? `dark` : undefined}
    >
      <KeyboardProvider>
        <ThemeProvider value={theme}>
          <APIProvider>
            <BottomSheetModalProvider>
              {children}
              <Toaster position="bottom-center" />
            </BottomSheetModalProvider>
          </APIProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
