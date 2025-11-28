# FetchIt - Gmail OAuth Backend Server

OAuth proxy server for Gmail API integration in FetchIt mobile app.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Gmail API" and enable it
4. Configure OAuth Consent Screen:
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" and click "Create"
   - Fill in app name, user support email, developer email
   - Add scope: `https://www.googleapis.com/auth/gmail.readonly`
   - Add test users (your Gmail addresses for testing)
5. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URI (will add after ngrok setup)
   - Save Client ID and Client Secret

### 3. Setup ngrok (Development)

```bash
# Install ngrok
brew install ngrok  # macOS
# OR download from https://ngrok.com/download

# Sign up at https://ngrok.com and get your authtoken
ngrok config add-authtoken YOUR_AUTHTOKEN

# Start ngrok tunnel
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.dev`)

### 4. Update Google Cloud Console Redirect URI

1. Go back to your OAuth 2.0 Client ID in Google Cloud Console
2. Add authorized redirect URI:
   ```
   https://YOUR-NGROK-URL.ngrok-free.dev/auth/callback
   ```
3. Click "Save"
4. Wait 2-3 minutes for changes to propagate

### 5. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your credentials
nano .env
```

Update with your values:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
PORT=3000
NGROK_URL=https://your-ngrok-url.ngrok-free.dev
```

### 6. Start the Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

You should see:
```
✅ FetchIt OAuth Backend Server running on http://localhost:3000
📱 Authorization URL: https://your-ngrok-url.ngrok-free.dev/auth/authorize
```

## API Endpoints

### GET /
Health check endpoint
```bash
curl http://localhost:3000/
```

### GET /auth/authorize
Starts OAuth flow - redirects to Google sign-in

### GET /auth/callback
OAuth callback - receives authorization code and returns tokens

### POST /auth/refresh
Refreshes expired access token
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "your-refresh-token"}'
```

## Testing

1. Make sure server is running
2. Make sure ngrok tunnel is active
3. Open authorization URL in browser:
   ```
   https://your-ngrok-url.ngrok-free.dev/auth/authorize
   ```
4. Sign in with Google account (must be added as test user)
5. Approve permissions
6. Should see success page and redirect to app

## Troubleshooting

### "redirect_uri_mismatch" error
- Verify ngrok URL matches exactly in Google Cloud Console
- Check for typos and trailing slashes
- Wait 2-3 minutes after updating redirect URI

### "Access blocked: App hasn't been verified"
- Add your email to test users in OAuth consent screen
- Make sure you're using a test user email to sign in

### Port already in use
- Change PORT in .env to a different port
- Update ngrok command: `ngrok http NEW_PORT`

## Production Deployment

When deploying to production:
1. Deploy backend to hosting service (Railway, Heroku, AWS, etc.)
2. Update GOOGLE_CLIENT_ID redirect URI to production URL
3. Update frontend BACKEND_URL to production URL
4. Consider moving OAuth app from "Testing" to "Production" mode

## Security Notes

- Never commit `.env` file to git
- Keep Client Secret secure
- Use HTTPS in production
- Implement rate limiting for production
- Add proper error logging
