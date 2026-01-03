# 🚀 Quick Start Guide

## ✅ What Was Fixed

### 1️⃣ Twitch Live Status (WORKING NOW!)
Your Twitch card will now show a **🔴 LIVE** indicator when you're streaming.
- Updates every 60 seconds automatically
- Pulse animation when live
- No manual updates needed!

### 2️⃣ Safari Compatibility (FIXED!)
Your site now looks beautiful on Safari with proper fallbacks.

### 3️⃣ Performance (OPTIMIZED!)
- Loading skeletons while data loads
- Smart caching reduces server load
- Better error handling

---

## 🎯 Next Steps to Deploy

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Environment Variables in Cloud Run

You need to add these secrets to your Cloud Run service:

**Required for Twitch:**
- `TWITCH_CLIENT_ID` - Get from https://dev.twitch.tv/console/apps
- `TWITCH_CLIENT_SECRET` - Generate in same place
- `TWITCH_USER_ID` - Get from https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/

**Optional for YouTube:**
- `YOUTUBE_API_KEY` - Your YouTube API key
- `YOUTUBE_CHANNEL_ID` - Your channel ID

### Step 3: Deploy to Cloud Run

**Easy way (using gcloud CLI):**
```bash
gcloud run deploy sage-siren-hub \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

Then add your environment variables in the Cloud Run console or via:
```bash
gcloud run services update sage-siren-hub \
  --set-secrets "TWITCH_CLIENT_ID=TWITCH_CLIENT_ID:latest,TWITCH_CLIENT_SECRET=TWITCH_CLIENT_SECRET:latest,TWITCH_USER_ID=TWITCH_USER_ID:latest"
```

### Step 4: Update GitHub Secrets

Make sure these secrets are set in GitHub:
1. Go to: Repository → Settings → Secrets and Variables → Actions
2. Add:
   - `TWITCH_CLIENT_ID`
   - `TWITCH_CLIENT_SECRET`
   - `TWITCH_USER_ID`
   - `YOUTUBE_API_KEY` (optional)
   - `YOUTUBE_CHANNEL_ID` (optional)

---

## 🧪 How to Test Locally

```bash
# Set your environment variables
export TWITCH_CLIENT_ID="your-client-id"
export TWITCH_CLIENT_SECRET="your-secret"
export TWITCH_USER_ID="your-numeric-id"

# Start the server
npm start

# Open in browser
# http://localhost:8080

# Test the live status API
curl http://localhost:8080/api/twitch/live
```

---

## 📱 What You'll See

### When You're Live on Twitch:
```
┌─────────────────────────┐
│ Twitch 🔴 LIVE         │
│ 1.2K followers          │
└─────────────────────────┘
```
*Card will pulse with animation*

### When You're Offline:
```
┌─────────────────────────┐
│ Twitch                  │
│ 1.2K followers          │
└─────────────────────────┘
```
*Regular card appearance*

---

## 🐛 Troubleshooting

### Live status not showing?
1. Check your Twitch credentials are set
2. Make sure `TWITCH_USER_ID` is the numeric ID, not your username
3. Visit `/api/twitch/live` to test the endpoint
4. Check browser console for errors (F12)

### Stats not updating?
1. Run the GitHub Action manually: Actions → Update Social Media Stats → Run workflow
2. Check the workflow run for errors
3. Verify secrets are set correctly in GitHub

### Safari still looks weird?
1. Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
2. Clear cache
3. Make sure you're on Safari 14+

---

## 📚 Documentation

- **Full Deployment Guide**: See `DEPLOYMENT.md`
- **All Changes**: See `CHANGELOG.md`
- **Need Help?**: Check the troubleshooting sections in both docs

---

## ⚡ Performance Tips

1. **First Deploy**: May take 5-10 minutes (Cloud Run cold start)
2. **Live Status**: Checks every 60 seconds (doesn't waste API quota)
3. **Stats Update**: GitHub Action runs every 6 hours
4. **Caching**: Smart caching reduces server load and improves speed

---

## 🎉 You're All Set!

Once deployed, your media kit will:
- ✅ Show live status when streaming
- ✅ Look perfect on Safari
- ✅ Load fast with skeleton states
- ✅ Handle errors gracefully
- ✅ Cache efficiently

**Your media kit is now production-ready!** 🚀

---

## 💬 Quick Commands Reference

```bash
# Start server locally
npm start

# Fetch social stats
npm run fetch-stats

# Deploy to Cloud Run
gcloud run deploy sage-siren-hub --source .

# View Cloud Run logs
gcloud run services logs read sage-siren-hub --limit 50

# Test live status
curl https://your-app.run.app/api/twitch/live
```

---

**Questions?** Check the full `DEPLOYMENT.md` guide for detailed instructions!
