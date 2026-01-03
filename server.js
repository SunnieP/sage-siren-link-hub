const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for API requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve static files with cache control
app.use(express.static('public', {
  maxAge: '1h',
  setHeaders: (res, path) => {
    // JSON files should have shorter cache
    if (path.endsWith('.json')) {
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
    }
    // CSS and JS files can be cached longer
    if (path.endsWith('.css') || path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
    }
    // Images can be cached even longer
    if (path.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    }
  }
}));

// Utility function for HTTPS requests
function httpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

// Get Twitch OAuth token
async function getTwitchToken() {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Twitch credentials not configured');
  }

  const url = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'POST' }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data).access_token);
        } else {
          reject(new Error(`Twitch auth failed: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

// Cache for Twitch token (avoid getting new token every request)
let tokenCache = { token: null, expiresAt: 0 };

// API endpoint to check Twitch live status
app.get('/api/twitch/live', async (req, res) => {
  try {
    const userId = process.env.TWITCH_USER_ID;
    const clientId = process.env.TWITCH_CLIENT_ID;

    if (!userId || !clientId) {
      return res.status(503).json({
        isLive: false,
        error: 'Twitch not configured',
        cached: false
      });
    }

    // Get or refresh token
    let token = tokenCache.token;
    if (!token || Date.now() >= tokenCache.expiresAt) {
      token = await getTwitchToken();
      tokenCache = {
        token,
        expiresAt: Date.now() + (3600 * 1000) // 1 hour
      };
    }

    // Check if live
    const streamsUrl = `https://api.twitch.tv/helix/streams?user_id=${userId}`;
    const options = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-Id': clientId
      }
    };

    const data = await httpsRequest(streamsUrl, options);
    const isLive = data.data && data.data.length > 0;

    // Set cache header - cache for 60 seconds
    res.setHeader('Cache-Control', 'public, max-age=60');

    return res.json({
      isLive,
      streamData: isLive ? {
        title: data.data[0].title,
        game: data.data[0].game_name,
        viewers: data.data[0].viewer_count,
        startedAt: data.data[0].started_at
      } : null,
      cached: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking Twitch live status:', error.message);

    // Return fallback response
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).json({
      isLive: false,
      error: error.message,
      cached: false,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all route to serve index.html for SPA-like behavior
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Twitch API configured: ${!!(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET)}`);
});
