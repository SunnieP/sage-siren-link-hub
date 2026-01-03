# 🚀 Deployment Guide - SageSiren Link Hub

## Overview

This guide covers deploying your updated media kit to Google Cloud Run with Twitch live status detection, improved performance, and Safari compatibility.

## 📋 Prerequisites

- Google Cloud account with billing enabled
- gcloud CLI installed and authenticated
- GitHub repository secrets configured
- Twitch API credentials

## 🔑 Required Environment Variables

Set these as secrets in both GitHub Actions and Cloud Run:

### Twitch API
- `TWITCH_CLIENT_ID` - Your Twitch application client ID
- `TWITCH_CLIENT_SECRET` - Your Twitch application client secret
- `TWITCH_USER_ID` - Your Twitch user ID (numeric)

### YouTube API (Optional)
- `YOUTUBE_API_KEY` - Your YouTube Data API v3 key
- `YOUTUBE_CHANNEL_ID` - Your YouTube channel ID

## 🛠️ Initial Setup

### 1. Get Twitch API Credentials

1. Go to https://dev.twitch.tv/console/apps
2. Create a new application or use existing one
3. Set OAuth Redirect URL to: `https://localhost`
4. Copy your Client ID and generate a Client Secret
5. Get your User ID from: https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/

### 2. Configure GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions

Add the following secrets:
```
TWITCH_CLIENT_ID
TWITCH_CLIENT_SECRET
TWITCH_USER_ID
YOUTUBE_API_KEY (optional)
YOUTUBE_CHANNEL_ID (optional)
```

## 📦 Deploying to Cloud Run

### Option 1: Deploy with gcloud CLI (Recommended)

```bash
# 1. Set your project ID
export PROJECT_ID="your-gcp-project-id"
gcloud config set project $PROJECT_ID

# 2. Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 3. Build and deploy
gcloud run deploy sage-siren-hub \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production" \
  --set-secrets "TWITCH_CLIENT_ID=TWITCH_CLIENT_ID:latest,TWITCH_CLIENT_SECRET=TWITCH_CLIENT_SECRET:latest,TWITCH_USER_ID=TWITCH_USER_ID:latest"
```

### Option 2: Deploy with Cloud Build

1. Create `cloudbuild.yaml`:

```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/sage-siren-hub', '.']

  # Push the container image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/sage-siren-hub']

  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'sage-siren-hub'
      - '--image'
      - 'gcr.io/$PROJECT_ID/sage-siren-hub'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'

images:
  - 'gcr.io/$PROJECT_ID/sage-siren-hub'
```

2. Run:
```bash
gcloud builds submit --config cloudbuild.yaml
```

### Option 3: Setting Up Cloud Run Secrets

If using Secret Manager:

```bash
# Create secrets
echo -n "your-client-id" | gcloud secrets create TWITCH_CLIENT_ID --data-file=-
echo -n "your-client-secret" | gcloud secrets create TWITCH_CLIENT_SECRET --data-file=-
echo -n "your-user-id" | gcloud secrets create TWITCH_USER_ID --data-file=-

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding TWITCH_CLIENT_ID \
  --member=serviceAccount:$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

# Repeat for other secrets
```

## 🔄 Continuous Deployment

The GitHub Actions workflow will automatically:
- Fetch social stats every 6 hours
- Update follower counts
- Check Twitch live status
- Commit changes to repository

### Manual Stats Update

Run the workflow manually:
```bash
# Via GitHub UI: Actions → Update Social Media Stats → Run workflow

# Or trigger via API
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/YOUR_USERNAME/sage-siren-link-hub/actions/workflows/update-social-stats.yml/dispatches \
  -d '{"ref":"main"}'
```

## 🧪 Local Testing

### Test the server locally:

```bash
# Install dependencies
npm install

# Set environment variables
export TWITCH_CLIENT_ID="your-client-id"
export TWITCH_CLIENT_SECRET="your-client-secret"
export TWITCH_USER_ID="your-user-id"

# Start server
npm start

# Test in browser
open http://localhost:8080

# Test live status API
curl http://localhost:8080/api/twitch/live
```

### Test stats fetching:

```bash
npm run fetch-stats
```

## 🔍 Monitoring & Debugging

### Check Cloud Run logs:

```bash
gcloud run services logs read sage-siren-hub \
  --region us-central1 \
  --limit 50
```

### Test live status endpoint:

```bash
curl https://your-app.run.app/api/twitch/live
```

Expected response:
```json
{
  "isLive": true,
  "streamData": {
    "title": "Stream Title",
    "game": "Game Name",
    "viewers": 42,
    "startedAt": "2024-01-15T20:00:00Z"
  },
  "cached": false,
  "timestamp": "2024-01-15T20:30:00.000Z"
}
```

## 🎨 Custom Domain Setup

1. Map your domain:
```bash
gcloud run domain-mappings create \
  --service sage-siren-hub \
  --domain thehustl.shop \
  --region us-central1
```

2. Update DNS records as instructed by gcloud output

## 🔒 Security Best Practices

1. **Never commit secrets to repository**
2. **Use Secret Manager for production**
3. **Enable Cloud Armor for DDoS protection** (optional)
4. **Set up Cloud Monitoring alerts**
5. **Regularly rotate API credentials**

## 📊 Performance Optimizations Applied

✅ **Caching Strategy**
- Static files: 1 hour
- JSON data: 5 minutes
- Images: 24 hours
- API responses: 60 seconds

✅ **Loading Improvements**
- Skeleton loading states
- Optimized font loading with `display=swap`
- Lazy loading for below-fold content

✅ **Safari Compatibility**
- Fallback backgrounds for glassmorphism
- Vendor prefixes for animations
- Progressive enhancement

## 🆘 Troubleshooting

### Live status not updating?
1. Check Twitch API credentials are set correctly
2. Verify user ID is numeric (not username)
3. Check Cloud Run logs for API errors
4. Test endpoint directly: `/api/twitch/live`

### Stats not showing?
1. Verify `social.stats.json` has data
2. Run GitHub Action manually to fetch stats
3. Check browser console for fetch errors

### Safari issues?
1. Hard refresh (Cmd+Shift+R)
2. Clear cache
3. Check Safari version (15.4+ recommended)

## 📝 Notes

- Live status checks every 60 seconds when page is active
- Polling pauses when page is hidden (saves API quota)
- Token cache prevents excessive OAuth requests
- First deployment may take 5-10 minutes

## 🔗 Useful Links

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Twitch API Documentation](https://dev.twitch.tv/docs/api)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
