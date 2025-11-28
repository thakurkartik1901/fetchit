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
  res.json({
    status: 'FetchIt OAuth Backend Server Running',
    timestamp: new Date().toISOString()
  });
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

    // IMPORTANT: 'fetchit' is your app's custom URL scheme
    // This matches your app.config.ts scheme
    const appScheme = 'fetchit://auth/callback';

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
        <title>Gmail Connected - FetchIt</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #197dfd 0%, #006FFD 100%);
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
            color: #22C55E;
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
            border-top: 3px solid #22C55E;
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
          <p>Returning to FetchIt app...</p>
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
        <h1 style="color: #EF4444;">❌ Error</h1>
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
  console.log(`✅ FetchIt OAuth Backend Server running on http://localhost:${PORT}`);
  console.log(`📱 Authorization URL: ${BACKEND_URL}/auth/authorize`);
  console.log(`🔗 Backend URL: ${BACKEND_URL}`);
  console.log(`\n⚠️  Make sure to:`);
  console.log(`   1. Update NGROK_URL in .env with your ngrok URL`);
  console.log(`   2. Add redirect URI in Google Cloud Console: ${BACKEND_URL}/auth/callback`);
  console.log(`   3. Update BACKEND_URL in frontend use-google-auth hook`);
});
