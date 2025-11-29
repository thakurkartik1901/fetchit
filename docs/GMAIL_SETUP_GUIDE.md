# Gmail Integration Setup Guide - FetchIt

## 🎉 Implementation Complete!

All Gmail integration features have been successfully implemented. Follow this guide to set up and test the feature.

## 📋 What Was Implemented

### Backend
- ✅ OAuth proxy server (`backend/`)
- ✅ Google OAuth flow handling
- ✅ Token management and refresh endpoints

### Frontend
- ✅ Gmail token storage utilities
- ✅ Zustand store for Gmail state
- ✅ OAuth hook with deep linking
- ✅ Gmail API client
- ✅ React Query hooks for data fetching
- ✅ Email parser for order extraction
- ✅ Home tab with order tracking UI
- ✅ Settings integration for linking Gmail
- ✅ State hydration on app startup

---

## 🚀 Setup Instructions

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Google Cloud Console

#### 2.1 Create Project & Enable Gmail API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "FetchIt Gmail Integration"
3. Navigate to **APIs & Services** → **Library**
4. Search for "Gmail API" and click **Enable**

#### 2.2 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** and click **Create**
3. Fill in required fields:
   - **App name**: FetchIt
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click **Save and Continue**

#### 2.3 Add OAuth Scopes

1. Click **Add or Remove Scopes**
2. Filter for "gmail" and select:
   - `https://www.googleapis.com/auth/gmail.readonly`
3. Click **Update** → **Save and Continue**

#### 2.4 Add Test Users

1. Click **Add Users**
2. Add Gmail addresses you'll use for testing
3. Click **Save and Continue**

> ⚠️ **Important**: While in "Testing" mode, only test users can authorize the app

#### 2.5 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Name: "FetchIt OAuth Client"
5. **Don't add redirect URI yet** (we'll add it after setting up ngrok)
6. Click **Create**
7. **Copy and save**:
   - Client ID: `387582042851-xxxxx.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxxxxxxxxxxxx`

### Step 3: Setup ngrok (Development)

#### 3.1 Install ngrok

```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com/download
```

#### 3.2 Create ngrok Account

1. Sign up at https://ngrok.com (free tier works)
2. Get your authtoken from the dashboard

#### 3.3 Add Authtoken

```bash
ngrok config add-authtoken YOUR_NGROK_AUTHTOKEN
```

#### 3.4 Start ngrok Tunnel

```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding  https://fatherly-nourishable-lida.ngrok-free.dev -> http://localhost:3000
```

**Copy the HTTPS URL** (e.g., `https://fatherly-nourishable-lida.ngrok-free.dev`)

### Step 4: Update Google Cloud Console with Redirect URI

1. Go back to **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, click **Add URI**
4. Add: `https://YOUR-NGROK-URL.ngrok-free.dev/auth/callback`
   - Example: `https://fatherly-nourishable-lida.ngrok-free.dev/auth/callback`
5. Click **Save**
6. **Wait 2-3 minutes** for changes to propagate

### Step 5: Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
GOOGLE_CLIENT_ID=387582042851-xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
PORT=3000
NGROK_URL=https://fatherly-nourishable-lida.ngrok-free.dev
```

### Step 6: Update Frontend OAuth Hook

Edit `src/lib/gmail/use-google-auth.tsx`:

Find line 7 and update the `BACKEND_URL`:

```typescript
const BACKEND_URL = 'https://fatherly-nourishable-lida.ngrok-free.dev';
```

Replace with your actual ngrok URL.

**Note**: Deep link handling is centralized in `src/app/_layout.tsx` for better scalability. The hook only handles opening the OAuth browser flow.

### Step 7: Install Frontend Dependencies (Already Done)

The following packages have been installed:
- ✅ `expo-web-browser` - OAuth browser flow
- ✅ `expo-linking` - Deep linking (already installed)
- ✅ `react-native-mmkv` - Secure storage (already installed)
- ✅ `zustand` - State management (already installed)
- ✅ `@tanstack/react-query` - Data fetching (already installed)
- ✅ `axios` - HTTP client (already installed)

### Step 8: Rebuild the App

Since we added `expo-web-browser` plugin, rebuild the app:

```bash
# Clean and rebuild
npx expo prebuild --clean

# Run on Android
pnpm android

# OR run on iOS
pnpm ios
```

---

## 🧪 Testing the Integration

### Start the Backend Server

In one terminal:

```bash
cd backend
npm run dev
```

You should see:
```
✅ FetchIt OAuth Backend Server running on http://localhost:3000
📱 Authorization URL: https://your-ngrok-url.ngrok-free.dev/auth/authorize
```

### Keep ngrok Running

In another terminal:

```bash
ngrok http 3000
```

### Test the Flow

1. **Launch the App**
   ```bash
   pnpm android  # or pnpm ios
   ```

2. **Navigate to Settings**
   - Tap on "Settings" tab
   - Find "Gmail Account" section at the top

3. **Link Gmail Account**
   - Tap "Link Account" button
   - Browser will open with Google sign-in
   - Sign in with a test user email
   - Approve permissions
   - See "Gmail Connected!" success page
   - App will receive the tokens via deep link
   - You'll see a success toast

4. **Go to Home Tab**
   - Tap "Home" tab (first tab)
   - App will fetch your purchase emails
   - Orders will be parsed and displayed

5. **Test Unlinking**
   - Go back to Settings
   - Tap "Unlink" button
   - Gmail account will be disconnected

---

## 📁 File Structure

```
FetchIt/
├── backend/
│   ├── server.js              # OAuth proxy server
│   ├── package.json
│   ├── .env.example
│   ├── .env                   # Your credentials (not committed)
│   └── README.md
│
├── src/
│   ├── api/
│   │   └── gmail/
│   │       ├── client.ts      # Gmail API client
│   │       ├── types.ts       # TypeScript types
│   │       ├── parser.ts      # Email parser for orders
│   │       ├── hooks/
│   │       │   ├── use-purchase-message-ids.ts
│   │       │   └── index.ts
│   │       └── index.ts
│   │
│   ├── lib/
│   │   ├── deep-linking/
│   │   │   ├── handlers.ts    # Deep link handlers (centralized)
│   │   │   └── index.ts       # Exports
│   │   └── gmail/
│   │       ├── index.tsx      # Zustand store
│   │       ├── utils.ts       # Token storage utilities
│   │       └── use-google-auth.tsx  # OAuth hook (browser only)
│   │
│   ├── components/
│   │   └── settings/
│   │       └── gmail-item.tsx # Gmail link/unlink UI
│   │
│   ├── app/
│   │   ├── _layout.tsx        # Root layout (deep link router + hydration)
│   │   └── (app)/
│   │       ├── index.tsx      # Home screen with orders
│   │       ├── feed.tsx       # Feed (moved from index)
│   │       └── settings.tsx   # Settings with Gmail item
│   │
│   └── docs/
│       ├── GMAIL_INTEGRATION_COMPLETE_GUIDE.md  # Original guide
│       ├── GMAIL_INTEGRATION_DEPENDENCIES.md    # Dependencies list
│       └── GMAIL_SETUP_GUIDE.md                 # This file
```

---

## 🔗 Deep Linking Architecture

The app uses a **centralized deep link router** for better scalability and maintainability.

### How It Works

**1. Deep Link Router** (`src/app/_layout.tsx`)
- Single listener for all deep links
- Routes URLs to appropriate handlers
- Handles both cold start and warm deep links

**2. Deep Link Handlers** (`src/lib/deep-linking/handlers.ts`)
- Pattern-based handlers (Gmail OAuth, payments, sharing, etc.)
- Each handler returns `true` if it processed the link
- Easy to add new deep link types

**3. OAuth Hook** (`src/lib/gmail/use-google-auth.tsx`)
- Simplified to only handle browser OAuth flow
- No deep link logic - fully handled by router
- Cleaner separation of concerns

### Flow

```
User taps "Link Account"
  ↓
useGoogleAuth().promptAsync() opens browser
  ↓
User completes OAuth on backend
  ↓
Backend redirects to: fetchit://auth/callback?accessToken=...
  ↓
Deep link router in _layout.tsx receives URL
  ↓
Routes to handleGmailAuthCallback()
  ↓
Handler extracts token and calls linkGmail()
  ↓
Toast shows success message
```

### Adding New Deep Links

To add a new deep link type (e.g., payment callback):

1. **Add handler** in `src/lib/deep-linking/handlers.ts`:
   ```typescript
   export function handlePaymentCallback(url: string): boolean {
     if (!url.startsWith('fetchit://payment/callback')) {
       return false;
     }

     // Process payment callback
     const params = new URL(url).searchParams;
     const status = params.get('status');
     // ... handle payment

     return true;
   }
   ```

2. **Export** from `src/lib/deep-linking/index.ts`:
   ```typescript
   export { handlePaymentCallback } from './handlers';
   ```

3. **Route** in `src/app/_layout.tsx`:
   ```typescript
   if (handlePaymentCallback(url)) return;
   ```

Done! The router will automatically handle all `fetchit://payment/callback` URLs.

---

## 🎨 UI Components

### Home Screen (`src/app/(app)/index.tsx`)

**Not Linked State:**
- Welcome message with email icon
- Description of the feature
- "Go to Settings" button

**Linked State:**
- Email summary card (total emails, parsed orders)
- "Refresh Orders" button
- Orders list with:
  - Vendor name
  - Status badge (delivered, shipped, cancelled, etc.)
  - Order amount
  - Order ID
- "Load More Emails" button (pagination)
- Empty state when no orders found

### Settings (`src/app/(app)/settings.tsx`)

**Gmail Item:**
- Shows connection status
- "Link Account" or "Unlink" button
- Description text

---

## 🔧 Configuration Details

### App Scheme

- **Scheme**: `fetchit`
- **Deep Link**: `fetchit://auth/callback`
- Configured in: `app.config.ts`

### Backend URLs

- **Development**: ngrok URL (e.g., `https://abc123.ngrok-free.dev`)
- **Production**: Your deployed backend URL

### Gmail API Endpoints

- **Authorization**: `GET /auth/authorize`
- **Callback**: `GET /auth/callback`
- **Token Refresh**: `POST /auth/refresh`

---

## 🐛 Troubleshooting

### "redirect_uri_mismatch" Error

**Problem**: Redirect URI doesn't match Google Cloud Console

**Solution**:
1. Verify ngrok URL matches exactly in Google Cloud Console
2. Check for typos and trailing slashes
3. Wait 2-3 minutes after updating redirect URI

### "Access blocked: App hasn't been verified"

**Problem**: User email not added to test users

**Solution**:
1. Go to OAuth consent screen
2. Add user email to test users
3. Use that email to sign in

### Deep Link Not Working

**Problem**: App doesn't receive tokens after OAuth

**Solution**:
1. Verify app scheme is `fetchit` in `app.config.ts`
2. Rebuild app: `npx expo prebuild --clean && pnpm android`
3. Check logs for deep link events
4. Ensure backend is using correct scheme: `fetchit://auth/callback`

### Backend Connection Error

**Problem**: Can't connect to backend

**Solution**:
1. Verify backend is running: `cd backend && npm run dev`
2. Verify ngrok is running: `ngrok http 3000`
3. Update `BACKEND_URL` in `use-google-auth.tsx` with ngrok URL
4. Check `backend/.env` has correct `NGROK_URL`

### No Orders Showing

**Problem**: Gmail linked but no orders displayed

**Solution**:
1. Verify you have purchase emails in Gmail
2. Check browser network tab for Gmail API calls
3. Check console logs for parsing errors
4. Verify email parser supports your vendors (`src/api/gmail/parser.ts`)

---

## 🎯 Next Steps

### Customize Email Parser

Edit `src/api/gmail/parser.ts` to add support for more vendors:

```typescript
// Add your vendor detection logic
if (/swiggy/i.test(from)) vendor = 'Swiggy';
else if (/zomato/i.test(from)) vendor = 'Zomato';
else if (/blinkit/i.test(from)) vendor = 'Blinkit';
// ... add more vendors
```

### Production Deployment

1. **Deploy Backend**:
   - Use Railway, Heroku, AWS, etc.
   - Set environment variables
   - Update redirect URI to production URL

2. **Update Frontend**:
   - Change `BACKEND_URL` to production URL
   - Rebuild app

3. **Google Cloud Console**:
   - Add production redirect URI
   - Move app from "Testing" to "Production"
   - Submit for verification if needed

### Add More Features

- Background email sync (Expo Background Fetch)
- Push notifications for order updates
- Order detail screens
- Filtering and search
- Multiple account support

---

## 📝 Important Notes

- Never commit `.env` files to git
- Keep Client Secret secure
- Use HTTPS in production
- Add rate limiting for production
- Implement proper error handling and logging
- Test with multiple Gmail accounts
- Consider token expiration and refresh logic

---

## 🎉 Success!

If you've followed all steps, you should now have:

1. ✅ Working Gmail OAuth flow
2. ✅ Orders displaying on Home screen
3. ✅ Link/unlink functionality in Settings
4. ✅ Email parsing for popular vendors
5. ✅ Proper state management and persistence

**Enjoy tracking your orders with FetchIt!** 📦🚀
