# 📧 Complete Gmail OAuth Integration Guide for React Native/Expo Apps

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Part 1: Google Cloud Console Setup](#part-1-google-cloud-console-setup)
- [Part 2: Backend Server Setup](#part-2-backend-server-setup)
- [Part 3: Frontend Implementation](#part-3-frontend-implementation)
- [Part 4: Usage & Testing](#part-4-usage--testing)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Complete File Reference](#complete-file-reference)

---

## Overview

This guide documents a complete Gmail OAuth integration that allows users to:

1. **Link their Gmail account** to your React Native app
2. **Read their emails** using Gmail API
3. **Parse and display** email data (e.g., purchase orders, receipts, etc.)

### Why Backend Proxy?

Gmail API requires **sensitive OAuth scopes** (`gmail.readonly`), which means:

- Google requires HTTPS redirect URIs
- Direct mobile OAuth is unreliable for sensitive scopes
- Backend proxy is the **standard production-ready pattern**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GMAIL OAUTH FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌──────────────┐     ┌─────────────┐                  │
│  │   Mobile    │────▶│   Backend    │────▶│   Google    │                  │
│  │    App      │     │   Server     │     │   OAuth     │                  │
│  └─────────────┘     └──────────────┘     └─────────────┘                  │
│        │                    │                    │                          │
│        │  1. Open Browser   │  2. Redirect to    │                          │
│        │  ───────────────▶  │  Google OAuth      │                          │
│        │                    │  ──────────────▶   │                          │
│        │                    │                    │                          │
│        │                    │  4. Code returned  │  3. User approves        │
│        │                    │  ◀──────────────   │                          │
│        │                    │                    │                          │
│        │                    │  5. Exchange code  │                          │
│        │                    │  for tokens        │                          │
│        │                    │  ──────────────▶   │                          │
│        │                    │                    │                          │
│        │  6. Deep link with │  6. Tokens         │                          │
│        │  tokens            │  returned          │                          │
│        │  ◀─────────────────│  ◀──────────────   │                          │
│        │                    │                    │                          │
│        │  7. Save tokens &  │                    │                          │
│        │  fetch emails      │                    │                          │
│        ▼                    ▼                    ▼                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### Required Tools

- Node.js 18+
- pnpm (or npm/yarn)
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)
- ngrok (for development HTTPS tunnel)

### Required Accounts

- Google Cloud Console account
- ngrok account (free tier works)

### Tech Stack (Frontend)

- Expo SDK 53+
- React Native
- TypeScript
- Zustand (state management)
- React Query / TanStack Query
- expo-web-browser
- expo-linking
- react-native-mmkv (secure storage)

### Tech Stack (Backend)

- Node.js + Express
- googleapis (Google's official SDK)
- dotenv
- cors

---

## Part 1: Google Cloud Console Setup

### Step 1.1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "MyApp Gmail Integration")
4. Click "Create"

### Step 1.2: Enable Gmail API

1. Go to [APIs & Services → Library](https://console.cloud.google.com/apis/library)
2. Search for "Gmail API"
3. Click on it and press "Enable"

### Step 1.3: Configure OAuth Consent Screen

1. Go to [APIs & Services → OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Select **"External"** and click "Create"
3. Fill in the required fields:
   - App name: Your app name
   - User support email: Your email
   - Developer contact email: Your email
4. Click "Save and Continue"

**Add Scopes:**

1. Click "Add or Remove Scopes"
2. Find and add: `https://www.googleapis.com/auth/gmail.readonly`
3. Click "Update" → "Save and Continue"

**Add Test Users (Important for development):**

1. Click "Add Users"
2. Add Gmail addresses you'll test with
3. Click "Save and Continue"

> ⚠️ **Important**: While in "Testing" mode, only test users can authorize the app.

### Step 1.4: Create OAuth 2.0 Credentials

1. Go to [APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Fill in:
   - Name: "Web Client" (or any name)
   - Authorized redirect URIs: Add later (after setting up ngrok)
5. Click "Create"
6. **Save the Client ID and Client Secret** - you'll need these!

**Example credentials:**

```
Client ID: 387582042851-cr143vppbs1lj55fmf08p7fj13e34vhg.apps.googleusercontent.com
Client Secret: GOCSPX-xxxxxxxxxxxxxxxxxxxxx
```

---

## Part 2: Backend Server Setup

### Step 2.1: Create Backend Directory Structure

```bash
mkdir backend
cd backend
npm init -y
```

### Step 2.2: Install Dependencies

```bash
npm install express cors dotenv googleapis
npm install --save-dev nodemon
```

### Step 2.3: Create package.json

```json
{
  "name": "gmail-oauth-backend",
  "version": "1.0.0",
  "description": "OAuth proxy server for Gmail API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "type": "commonjs",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "googleapis": "^164.0.0"
  }
}
```

### Step 2.4: Create server.js

This is the **complete OAuth backend server**:

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// OAuth2 Client Setup
// IMPORTANT: Update this URL with your ngrok URL for development
// or your production URL for production
const BACKEND_URL =
  process.env.NGROK_URL || 'https://your-ngrok-url.ngrok-free.dev';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${BACKEND_URL}/auth/callback`
);

// Gmail API scopes
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'OAuth Backend Server Running' });
});

/**
 * Step 1: Authorization endpoint
 * The app opens this URL to start the OAuth flow
 */
app.get('/auth/authorize', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request refresh token
    scope: SCOPES,
    prompt: 'consent', // Force consent screen to get refresh token
  });

  // Redirect user to Google OAuth page
  res.redirect(authUrl);
});

/**
 * Step 2: Callback endpoint
 * Google redirects here after user approves the access
 */
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('No authorization code provided');
  }

  try {
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // IMPORTANT: Update 'yourappscheme' to your app's custom URL scheme
    // This is defined in your app.config.ts (Expo) or AndroidManifest.xml
    const appScheme = 'yourappscheme://auth/callback';

    const params = new URLSearchParams({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || '',
      expiresIn: tokens.expiry_date?.toString() || '',
      tokenType: tokens.token_type || 'Bearer',
      scope: tokens.scope || '',
    });

    const redirectUrl = `${appScheme}?${params.toString()}`;

    // Show success page and redirect back to app
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Gmail Connected</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 320px;
          }
          .success {
            color: #4CAF50;
            font-size: 64px;
            margin-bottom: 20px;
          }
          h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
            color: #333;
          }
          p {
            color: #666;
            margin: 10px 0;
          }
          .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #4CAF50;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✓</div>
          <h1>Gmail Connected!</h1>
          <p>Returning to app...</p>
          <div class="spinner"></div>
        </div>
        <script>
          setTimeout(() => {
            window.location.href = '${redirectUrl}';
            
            // Fallback message if redirect doesn't work
            setTimeout(() => {
              document.querySelector('.container').innerHTML = 
                '<div class="success">✓</div>' +
                '<h1>Success!</h1>' +
                '<p>You can close this window and return to the app.</p>';
            }, 2000);
          }, 1000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.status(500).send(`
      <html>
      <body style="font-family: sans-serif; padding: 40px; text-align: center;">
        <h1 style="color: #f44336;">❌ Error</h1>
        <p>Failed to connect Gmail. Please try again.</p>
        <p style="color: #666; font-size: 14px;">${error.message}</p>
      </body>
      </html>
    `);
  }
});

/**
 * Step 3: Token refresh endpoint
 * App calls this to refresh expired access tokens
 */
app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'No refresh token provided' });
  }

  try {
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    res.json({
      accessToken: credentials.access_token,
      expiresIn: credentials.expiry_date,
      tokenType: credentials.token_type,
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Start server on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ OAuth Backend Server running on http://localhost:${PORT}`);
  console.log(`📱 Authorization URL: ${BACKEND_URL}/auth/authorize`);
});
```

### Step 2.5: Create .env File

Create `backend/.env`:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
PORT=3000
NGROK_URL=https://your-ngrok-url.ngrok-free.dev
```

> ⚠️ **Never commit `.env` to git!** Add it to `.gitignore`.

### Step 2.6: Setup ngrok (Development)

1. **Install ngrok:**

   ```bash
   # macOS
   brew install ngrok

   # Or download from https://ngrok.com/download
   ```

2. **Create free ngrok account** at https://ngrok.com

3. **Add your authtoken:**

   ```bash
   ngrok config add-authtoken YOUR_NGROK_AUTHTOKEN
   ```

4. **Start ngrok tunnel:**

   ```bash
   ngrok http 3000
   ```

5. **Copy the HTTPS URL** (e.g., `https://fatherly-nourishable-lida.ngrok-free.dev`)

6. **Update Google Cloud Console:**

   - Go to your OAuth 2.0 Client ID
   - Add redirect URI: `https://YOUR-NGROK-URL.ngrok-free.dev/auth/callback`
   - Wait 2-3 minutes for changes to propagate

7. **Update `backend/.env`:**
   ```env
   NGROK_URL=https://YOUR-NGROK-URL.ngrok-free.dev
   ```

---

## Part 3: Frontend Implementation

### Step 3.1: Install Required Packages

```bash
# Core packages
npx expo install expo-web-browser expo-linking

# Storage
npx expo install react-native-mmkv

# State management
npx expo install zustand

# Data fetching
npx expo install @tanstack/react-query axios
```

### Step 3.2: Configure App Scheme (Deep Linking)

#### For Expo (app.config.ts or app.json)

```typescript
// app.config.ts
export default {
  expo: {
    scheme: 'yourappscheme', // This is your custom URL scheme
    // ... other config
    plugins: [
      'expo-web-browser',
      // ... other plugins
    ],
  },
};
```

#### For Android (AndroidManifest.xml)

After running `npx expo prebuild`, verify/add deep link config:

```xml
<activity
  android:name=".MainActivity"
  android:launchMode="singleTask"
  android:exported="true">

  <!-- Main launcher -->
  <intent-filter>
    <action android:name="android.intent.action.MAIN"/>
    <category android:name="android.intent.category.LAUNCHER"/>
  </intent-filter>

  <!-- Deep link for OAuth callback -->
  <intent-filter>
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT"/>
    <category android:name="android.intent.category.BROWSABLE"/>
    <data android:scheme="yourappscheme"/>
    <data android:scheme="yourappscheme" android:host="auth" android:pathPrefix="/callback"/>
  </intent-filter>
</activity>
```

### Step 3.3: Create Storage Utility

Create `src/lib/storage.tsx`:

```typescript
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export function getItem<T>(key: string): T | null {
  const value = storage.getString(key);
  return value ? JSON.parse(value) || null : null;
}

export function setItem<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value));
}

export function removeItem(key: string): void {
  storage.delete(key);
}
```

### Step 3.4: Create Gmail Token Utilities

Create `src/lib/gmail/utils.tsx`:

```typescript
import { getItem, removeItem, setItem } from '@/lib/storage';

const GMAIL_TOKEN = 'gmail_token';

export type GmailTokenType = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  issuedAt?: number;
  tokenType?: string;
  scope?: string;
};

export function getGmailToken(): GmailTokenType | null {
  return getItem<GmailTokenType>(GMAIL_TOKEN);
}

export function removeGmailToken(): void {
  removeItem(GMAIL_TOKEN);
}

export function setGmailToken(value: GmailTokenType): void {
  setItem<GmailTokenType>(GMAIL_TOKEN, value);
}

export function isGmailTokenValid(token: GmailTokenType | null): boolean {
  if (!token || !token.accessToken) return false;

  // Check if token is expired
  if (token.expiresIn && token.issuedAt) {
    const now = Date.now();
    const expiresAt = token.issuedAt + token.expiresIn * 1000;
    return now < expiresAt;
  }

  // If no expiry info, assume token is valid
  return true;
}
```

### Step 3.5: Create Zustand Store for Gmail State

Create `src/lib/gmail/index.tsx`:

```typescript
import { create } from 'zustand';

import { createSelectors } from '../utils';
import type { GmailTokenType } from './utils';
import { getGmailToken, removeGmailToken, setGmailToken } from './utils';

type GmailState = {
  gmailToken: GmailTokenType | null;
  isGmailLinked: boolean;
  linkGmail: (token: GmailTokenType) => void;
  unlinkGmail: () => void;
  hydrate: () => void;
};

const _useGmail = create<GmailState>((set) => ({
  gmailToken: null,
  isGmailLinked: false,

  linkGmail: (token) => {
    setGmailToken(token);
    set({ gmailToken: token, isGmailLinked: true });
  },

  unlinkGmail: () => {
    removeGmailToken();
    set({ gmailToken: null, isGmailLinked: false });
  },

  hydrate: () => {
    try {
      const token = getGmailToken();
      if (token !== null) {
        set({ gmailToken: token, isGmailLinked: true });
      } else {
        set({ gmailToken: null, isGmailLinked: false });
      }
    } catch (e) {
      console.error('Error hydrating Gmail token:', e);
    }
  },
}));

// Create selectors for better performance
export const useGmail = createSelectors(_useGmail);

// Export standalone functions for use outside components
export const linkGmail = (token: GmailTokenType) =>
  _useGmail.getState().linkGmail(token);
export const unlinkGmail = () => _useGmail.getState().unlinkGmail();
export const hydrateGmail = () => _useGmail.getState().hydrate();
```

### Step 3.6: Create the Google Auth Hook

This is the **core hook** that handles the OAuth flow:

Create `src/lib/gmail/use-google-auth.tsx`:

```typescript
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';

import type { GmailTokenType } from './utils';

// IMPORTANT: Update this URL to your backend URL
// Development: ngrok URL
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
      // IMPORTANT: Update 'yourappscheme' to match your app scheme
      if (url.startsWith('yourappscheme://auth/callback')) {
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
```

### Step 3.7: Create Gmail API Client

Create `src/api/gmail/client.ts`:

```typescript
import axios from 'axios';

import type { GmailTokenType } from '@/lib/gmail/utils';

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1';

// Gmail message type
export type GmailMessage = {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body: {
      data?: string;
    };
  };
  internalDate: string;
};

// List messages response type
export type GmailListResponse = {
  messages?: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
  resultSizeEstimate?: number;
};

/**
 * Gmail API client class
 */
export class GmailClient {
  private accessToken: string;

  constructor(token: GmailTokenType) {
    this.accessToken = token.accessToken;
  }

  /**
   * Fetch messages matching a search query
   */
  async fetchMessages(
    query: string,
    maxResults: number = 10,
    pageToken?: string
  ): Promise<GmailListResponse> {
    const response = await axios.get<GmailListResponse>(
      `${GMAIL_API_BASE}/users/me/messages`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        params: {
          q: query,
          maxResults,
          pageToken,
        },
      }
    );

    return response.data;
  }

  /**
   * Fetch details of a specific message
   */
  async fetchMessageDetail(messageId: string): Promise<GmailMessage> {
    const response = await axios.get<GmailMessage>(
      `${GMAIL_API_BASE}/users/me/messages/${messageId}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        params: {
          format: 'full',
        },
      }
    );

    return response.data;
  }

  /**
   * Update access token (for token refresh)
   */
  updateAccessToken(newToken: string): void {
    this.accessToken = newToken;
  }
}

/**
 * Factory function to create Gmail client
 */
export function createGmailClient(token: GmailTokenType): GmailClient {
  return new GmailClient(token);
}

// Standalone API functions for React Query

export async function listMessages({
  accessToken,
  q,
  maxResults = 100,
  pageToken,
}: {
  accessToken: string;
  q: string;
  maxResults?: number;
  pageToken?: string;
}): Promise<GmailListResponse> {
  const response = await axios.get<GmailListResponse>(
    `${GMAIL_API_BASE}/users/me/messages`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q,
        maxResults,
        pageToken,
      },
    }
  );

  return response.data;
}

export async function getMessage({
  accessToken,
  id,
}: {
  accessToken: string;
  id: string;
}): Promise<GmailMessage> {
  const response = await axios.get<GmailMessage>(
    `${GMAIL_API_BASE}/users/me/messages/${id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        format: 'full',
      },
    }
  );

  return response.data;
}

/**
 * Build Gmail search query for purchase emails
 */
export function buildPurchasesQuery(): string {
  return 'category:purchases';
}
```

### Step 3.8: Create React Query Hooks

Create `src/api/gmail/hooks.ts`:

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

import type { GmailListResponse } from './client';
import { buildPurchasesQuery, listMessages } from './client';

/**
 * Hook to fetch purchase email IDs with pagination
 */
export function usePurchaseMessageIds(accessToken: string | null) {
  return useInfiniteQuery<GmailListResponse>({
    enabled: Boolean(accessToken),
    queryKey: ['gmail', 'purchases', 'ids'],
    queryFn: async ({ pageParam }) =>
      listMessages({
        accessToken: accessToken as string,
        q: buildPurchasesQuery(),
        pageToken: pageParam as string | undefined,
      }),
    initialPageParam: undefined as unknown as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
  });
}
```

### Step 3.9: Create Email Parser (Optional)

Create `src/api/gmail/parser.ts`:

```typescript
type GmailMessage = {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: { name: string; value: string }[];
    body: {
      data?: string;
    };
  };
  internalDate: string;
};

export type OrderStatus =
  | 'order_placed'
  | 'shipped'
  | 'delivered'
  | 'refund'
  | 'cancelled'
  | 'exchange'
  | 'payment_failed'
  | 'return';

export type ParsedOrder = {
  id: string;
  vendor: string;
  status: OrderStatus;
  orderId?: string;
  totalAmount?: string;
  orderDate?: string;
  items?: { name: string; quantity?: number; price?: string }[];
};

function getHeader(message: GmailMessage, name: string): string | undefined {
  const headers = message?.payload?.headers;
  return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())
    ?.value;
}

/**
 * Parse order information from a Gmail message
 * Customize this based on the vendors/stores you want to support
 */
export function parseOrderFromMessage(
  message: GmailMessage
): ParsedOrder | null {
  const subject = getHeader(message, 'Subject') || '';
  const from = getHeader(message, 'From') || '';
  const snippet = message.snippet || '';
  const content = subject + ' ' + snippet;

  // Determine vendor from email sender
  let vendor = '';

  // Add your vendor detection logic here
  if (/amazon/i.test(from)) vendor = 'Amazon';
  else if (/ebay/i.test(from)) vendor = 'eBay';
  else if (/walmart/i.test(from)) vendor = 'Walmart';
  else if (/target/i.test(from)) vendor = 'Target';
  // Add more vendors as needed
  else {
    // Skip unknown vendors
    return null;
  }

  // Determine order status from content
  let status: OrderStatus = 'order_placed';

  if (/refund/i.test(content)) {
    status = 'refund';
  } else if (/cancelled?/i.test(content)) {
    status = 'cancelled';
  } else if (/shipped|dispatched/i.test(content)) {
    status = 'shipped';
  } else if (/delivered/i.test(content)) {
    status = 'delivered';
  } else if (/order\s+(confirmation|confirmed|placed)/i.test(content)) {
    status = 'order_placed';
  }

  // Extract amount (customize regex for your currency/format)
  const amountMatch = snippet.match(/(\$|€|£|₹|INR|USD)\s*([0-9,]+\.?[0-9]*)/i);
  const totalAmount = amountMatch ? amountMatch[0] : undefined;

  // Extract order ID (customize for different vendors)
  const orderIdMatch = snippet.match(/order[\s#:]*([A-Z0-9-]+)/i);
  const orderId = orderIdMatch ? orderIdMatch[1] : undefined;

  if (!orderId && !totalAmount) {
    return null;
  }

  return {
    id: message.id,
    vendor,
    status,
    orderId,
    totalAmount,
    orderDate: new Date(
      Number(message.internalDate || Date.now())
    ).toISOString(),
  };
}
```

### Step 3.10: Create Index Exports

Create `src/api/gmail/index.ts`:

```typescript
export * from './client';
export * from './hooks';
export * from './parser';
```

### Step 3.11: Create Gmail Settings Component

Create `src/components/settings/gmail-item.tsx`:

```typescript
import React from 'react';

import { useGmail } from '@/lib';
import { useGoogleAuth } from '@/lib/gmail/use-google-auth';
// Import your UI components
import { Button, Text, View } from '@/components/ui';

export function GmailItem() {
  const isGmailLinked = useGmail.use.isGmailLinked();
  const linkGmail = useGmail.use.linkGmail();
  const unlinkGmail = useGmail.use.unlinkGmail();

  const { promptAsync, isLoading } = useGoogleAuth(
    (token) => {
      linkGmail(token);
      // Show success message
      console.log('Gmail account linked successfully!');
    },
    (error) => {
      // Show error message
      console.error(error);
    }
  );

  function handlePress(): void {
    if (isLoading) return;

    if (isGmailLinked) {
      unlinkGmail();
      console.log('Gmail account unlinked successfully!');
    } else {
      promptAsync();
    }
  }

  return (
    <View>
      <Button
        onPress={handlePress}
        disabled={isLoading}
        label={
          isLoading
            ? 'Loading...'
            : isGmailLinked
              ? 'Unlink Gmail Account'
              : 'Link Gmail Account'
        }
      />
      {isGmailLinked && (
        <Text>Gmail is connected ✓</Text>
      )}
    </View>
  );
}
```

### Step 3.12: Hydrate Gmail State on App Start

In your root layout (`_layout.tsx`):

```typescript
import { hydrateGmail } from '@/lib';

// Call this before your app renders
hydrateGmail();

export default function RootLayout() {
  return (
    <Providers>
      {/* Your app */}
    </Providers>
  );
}
```

### Step 3.13: Create Utility for Zustand Selectors

Create `src/lib/utils.ts`:

```typescript
import type { StoreApi, UseBoundStore } from 'zustand';

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

/**
 * Creates auto-generated selectors for a Zustand store
 * This allows you to use: useGmail.use.isGmailLinked()
 * Instead of: useGmail((state) => state.isGmailLinked)
 */
export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S
) => {
  let store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (let k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};
```

---

## Part 4: Usage & Testing

### Step 4.1: Example Usage Screen

```typescript
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';

import {
  getMessage,
  type ParsedOrder,
  parseOrderFromMessage,
  usePurchaseMessageIds,
} from '@/api/gmail';
import { Button, Text, View } from '@/components/ui';
import { useGmail } from '@/lib';

export default function HomeScreen() {
  const isGmailLinked = useGmail.use.isGmailLinked();
  const gmailToken = useGmail.use.gmailToken();
  const [orders, setOrders] = useState<ParsedOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Fetch purchase email IDs
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
    error,
  } = usePurchaseMessageIds(gmailToken?.accessToken || null);

  // Fetch and parse full email details
  const fetchAndParseOrders = useCallback(async () => {
    if (!gmailToken?.accessToken || !data?.pages) return;

    setIsLoadingOrders(true);
    try {
      // Get message IDs
      const ids = data.pages
        .flatMap((page) => page.messages || [])
        .map((m) => m.id)
        .slice(0, 25); // Limit for demo

      // Fetch full message details
      const messages = await Promise.all(
        ids.map((id) =>
          getMessage({ accessToken: gmailToken.accessToken, id })
        )
      );

      // Parse orders from messages
      const parsed = messages
        .map((m) => parseOrderFromMessage(m))
        .filter(Boolean) as ParsedOrder[];

      setOrders(parsed);
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [gmailToken?.accessToken, data?.pages]);

  // Auto-fetch on mount
  useEffect(() => {
    if (gmailToken?.accessToken && data?.pages && orders.length === 0) {
      fetchAndParseOrders();
    }
  }, [gmailToken?.accessToken, data, orders.length, fetchAndParseOrders]);

  // Not linked state
  if (!isGmailLinked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
          Welcome!
        </Text>
        <Text style={{ textAlign: 'center', marginBottom: 20, color: '#666' }}>
          Link your Gmail account to view your purchase history
        </Text>
        <Text style={{ textAlign: 'center', color: '#888' }}>
          Go to Settings → Link Gmail Account
        </Text>
      </View>
    );
  }

  // Linked state
  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Stats */}
      <View style={{ marginBottom: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
        <Text>Total Emails: {data?.pages?.reduce((sum, p) => sum + (p.messages?.length || 0), 0) || 0}</Text>
        <Text>Parsed Orders: {orders.length}</Text>
      </View>

      {/* Refresh Button */}
      <Button
        label={isLoadingOrders ? 'Loading...' : 'Refresh Orders'}
        onPress={fetchAndParseOrders}
        disabled={isLoadingOrders}
      />

      {/* Orders List */}
      {isLoadingOrders ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ padding: 16, backgroundColor: '#fff', marginVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontWeight: 'bold' }}>{item.vendor}</Text>
              <Text>Status: {item.status}</Text>
              {item.totalAmount && <Text>Amount: {item.totalAmount}</Text>}
              {item.orderId && <Text>Order ID: {item.orderId}</Text>}
            </View>
          )}
        />
      )}

      {/* Load More */}
      {hasNextPage && (
        <Button
          label={isFetchingNextPage ? 'Loading...' : 'Load More'}
          onPress={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        />
      )}
    </View>
  );
}
```

### Step 4.2: Testing Checklist

**Before Testing:**

- [ ] Backend server is running (`npm start` in backend folder)
- [ ] ngrok tunnel is active (`ngrok http 3000`)
- [ ] ngrok URL is added to Google Cloud Console redirect URIs
- [ ] ngrok URL is updated in `backend/.env` and `use-google-auth.tsx`
- [ ] App scheme is configured in `app.config.ts`
- [ ] App is rebuilt after any native config changes (`npx expo prebuild`)

**Testing Flow:**

1. [ ] Open the app
2. [ ] Navigate to settings
3. [ ] Tap "Link Gmail Account"
4. [ ] Browser opens with Google sign-in
5. [ ] Select Google account and approve access
6. [ ] See "Gmail Connected!" success page
7. [ ] App should receive deep link and save token
8. [ ] Navigate to home screen
9. [ ] Emails should load automatically

---

## Production Deployment

### Backend Deployment Options

1. **Railway** (recommended for simplicity)

   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Heroku**

   ```bash
   heroku create your-app-name
   heroku config:set GOOGLE_CLIENT_ID=xxx
   heroku config:set GOOGLE_CLIENT_SECRET=xxx
   git push heroku main
   ```

3. **AWS/GCP/Azure** - Use your preferred cloud platform

### Production Checklist

- [ ] Deploy backend to production server
- [ ] Use production domain with SSL (HTTPS)
- [ ] Update Google Cloud Console redirect URIs to production URL
- [ ] Update `BACKEND_URL` in app to production URL
- [ ] Move OAuth app from "Testing" to "Production" in Google Cloud Console
- [ ] Complete OAuth consent screen verification (if needed)
- [ ] Implement token refresh logic for expired tokens
- [ ] Add rate limiting to backend
- [ ] Add proper error handling and logging

---

## Troubleshooting

### Common Errors

#### "redirect_uri_mismatch"

- Ensure ngrok URL matches exactly in Google Cloud Console
- Wait 2-3 minutes after adding redirect URI
- Check for typos and trailing slashes

#### "localhost refused to connect"

- Use computer's IP or ngrok URL, not "localhost"
- Make sure backend server is running
- Check firewall settings

#### App doesn't receive tokens (deep link not working)

- Verify app scheme is correctly configured
- Check AndroidManifest.xml has correct intent-filter
- Rebuild app after config changes: `npx expo prebuild && pnpm android`
- Check console logs for deep link events

#### "Access blocked: App hasn't been verified"

- Add your email to test users in OAuth consent screen
- Or submit app for verification (production only)

#### Token expires quickly

- Implement token refresh using `/auth/refresh` endpoint
- Store refresh token and use it to get new access tokens

---

## Complete File Reference

```
your-app/
├── backend/
│   ├── server.js              # OAuth proxy server
│   ├── package.json           # Backend dependencies
│   └── .env                   # Backend environment variables (NOT committed)
│
├── src/
│   ├── api/
│   │   └── gmail/
│   │       ├── client.ts      # Gmail API client & functions
│   │       ├── hooks.ts       # React Query hooks
│   │       ├── parser.ts      # Email parsing utilities
│   │       └── index.ts       # Exports
│   │
│   ├── lib/
│   │   ├── gmail/
│   │   │   ├── index.tsx      # Zustand store for Gmail state
│   │   │   ├── use-google-auth.tsx  # OAuth hook (CORE)
│   │   │   └── utils.tsx      # Token storage utilities
│   │   ├── storage.tsx        # MMKV storage wrapper
│   │   └── utils.ts           # Zustand selector helper
│   │
│   ├── components/
│   │   └── settings/
│   │       └── gmail-item.tsx # Gmail link/unlink UI component
│   │
│   └── app/
│       └── _layout.tsx        # Root layout (calls hydrateGmail)
│
├── app.config.ts              # Expo config (scheme definition)
└── android/
    └── app/src/main/
        └── AndroidManifest.xml # Deep link configuration
```

---

## Summary

This guide covers:

1. **Google Cloud Setup** - Creating project, enabling APIs, configuring OAuth
2. **Backend Server** - Express server that handles OAuth flow securely
3. **Frontend Integration** - Complete React Native implementation with:
   - Storage (MMKV)
   - State management (Zustand)
   - OAuth hook (expo-web-browser + expo-linking)
   - Gmail API client (axios)
   - React Query for data fetching
4. **Deep Linking** - Receiving tokens back from backend
5. **Email Parsing** - Extracting order information from emails

The key insight is that Gmail's sensitive OAuth scopes require a backend proxy. This pattern is production-ready and follows Google's best practices.

---

**Last Updated:** November 2025  
**Tested With:** Expo SDK 53, React Native 0.79
