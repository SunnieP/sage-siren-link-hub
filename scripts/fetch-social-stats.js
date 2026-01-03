const fs = require('fs');
const path = require('path');
const https = require('https');

// Utility function for HTTPS requests
function httpsRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

// Fetch Twitch OAuth token
async function getTwitchToken() {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
        console.log('Twitch credentials not configured, skipping...');
        return null;
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
        req.end();
    });
}

// Fetch Twitch followers and live status
async function getTwitchStats() {
    try {
        const token = await getTwitchToken();
        if (!token) return null;

        const userId = process.env.TWITCH_USER_ID;
        const clientId = process.env.TWITCH_CLIENT_ID;

        if (!userId || !clientId) {
            console.log('Twitch user ID or client ID not configured, skipping...');
            return null;
        }

        // Fetch followers
        const followersUrl = `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${userId}`;
        const options = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Client-Id': clientId
            }
        };

        const followersData = await httpsRequest(followersUrl, options);
        const followers = followersData.total || 0;

        // Check if live
        const streamsUrl = `https://api.twitch.tv/helix/streams?user_id=${userId}`;
        const streamsData = await httpsRequest(streamsUrl, options);
        const isLive = streamsData.data && streamsData.data.length > 0;

        console.log(`Twitch: ${followers} followers, Live: ${isLive}`);

        return { followers, isLive };
    } catch (error) {
        console.error('Error fetching Twitch stats:', error.message);
        return null;
    }
}

// Fetch YouTube stats
async function getYouTubeStats() {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const channelId = process.env.YOUTUBE_CHANNEL_ID;
        
        if (!apiKey || !channelId) {
            console.log('YouTube credentials not configured, skipping...');
            return null;
        }

        const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
        const data = await httpsRequest(url);
        
        if (data.items && data.items.length > 0) {
            return parseInt(data.items[0].statistics.subscriberCount);
        }
        return null;
    } catch (error) {
        console.error('Error fetching YouTube stats:', error.message);
        return null;
    }
}

// Main execution
async function updateStats() {
    console.log('Fetching social media stats...');

    const platforms = [];

    // Fetch Twitch
    const twitchData = await getTwitchStats();
    if (twitchData !== null) {
        platforms.push({
            platform: 'Twitch',
            followers: twitchData.followers,
            isLive: twitchData.isLive || false
        });
    }

    // Fetch YouTube
    const youtubeSubscribers = await getYouTubeStats();
    if (youtubeSubscribers !== null) {
        platforms.push({ platform: 'YouTube', followers: youtubeSubscribers });
        console.log(`YouTube: ${youtubeSubscribers} subscribers`);
    }

    // TikTok and Twitter would require additional API setup
    // Placeholder for future implementation
    console.log('TikTok and Twitter stats require additional API setup');

    // If no platforms were fetched, keep existing data
    if (platforms.length === 0) {
        console.log('No stats fetched, keeping existing data');
        return;
    }

    // Write to social.stats.json
    const statsPath = path.join(__dirname, '../public/data/social.stats.json');
    const statsData = { platforms, lastUpdated: new Date().toISOString() };
    fs.writeFileSync(statsPath, JSON.stringify(statsData, null, 2));

    // Update media kit with latest stats
    const mediaKitPath = path.join(__dirname, '../public/data/media.kit.json');
    const mediaKit = JSON.parse(fs.readFileSync(mediaKitPath, 'utf8'));
    mediaKit.stats = platforms;
    mediaKit.lastUpdated = new Date().toISOString();
    fs.writeFileSync(mediaKitPath, JSON.stringify(mediaKit, null, 2));

    console.log('Stats updated successfully!');
}

updateStats().catch(error => {
    console.error('Error updating stats:', error);
    process.exit(1);
});
