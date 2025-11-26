# SageSiren Link Hub

Clean, responsive personal media hub for SageSiren. Functions as a Linktree + media kit with auto-updating social stats.

## Features

- **Responsive Design**: Mobile-first, works beautifully on all devices
- **Light/Dark Mode Toggle**: User preference saved in localStorage
- **Dynamic Content**: All links and stats loaded from JSON files
- **Auto-updating Stats**: GitHub Actions fetches latest social media stats every 6 hours
- **Accessibility**: WCAG compliant with ARIA labels, keyboard navigation, and reduced motion support
- **Fast & Lightweight**: Pure HTML/CSS/JS, no frameworks

## Brand Colors

- **Primary**: Sage Green (#A3B18A), Deep Forest Green (#344E41)
- **Secondary**: Warm Sand (#E9DCC9), Soft Cream (#F7F4EF)
- **Accent**: Golden Ochre (#C6A667), Deep Wineberry (#7B2D43)

## Typography

- **Headings**: Cormorant Garamond (Bold/SemiBold)
- **Body**: Inter (Regular/Medium)

## Setup

### GitHub Secrets (for auto-updating stats)

Add these secrets in your repository settings (Settings → Secrets and Variables → Actions):

#### Twitch
- `TWITCH_CLIENT_ID`: Your Twitch application client ID
- `TWITCH_CLIENT_SECRET`: Your Twitch application client secret
- `TWITCH_USER_ID`: Your Twitch user ID

#### YouTube
- `YOUTUBE_API_KEY`: Your YouTube Data API key
- `YOUTUBE_CHANNEL_ID`: Your YouTube channel ID

#### TikTok (Optional)
- `TIKTOK_USERNAME`: Your TikTok username

#### Twitter/X (Optional)
- `TWITTER_BEARER_TOKEN`: Your Twitter API bearer token
- `TWITTER_USERNAME`: Your Twitter/X username

### Local Development

1. Clone the repository
2. Edit JSON files in `public/data/` to customize links and content
3. Replace `public/assets/avatar.png` with your avatar/logo
4. Open `public/index.html` in a browser or use a local server

### Deployment (GitHub Pages)

1. Go to repository Settings → Pages
2. Source: Deploy from branch
3. Branch: `main`, Folder: `/public`
4. Save and wait for deployment

## File Structure

```
sage-siren-link-hub/
├── .github/
│   └── workflows/
│       └── update-social-stats.yml
├── public/
│   ├── index.html
│   ├── assets/
│   │   ├── style.css
│   │   └── avatar.png
│   └── data/
│       ├── site.config.json
│       ├── social.stats.json
│       └── media.kit.json
├── src/
│   └── main.js
├── scripts/
│   └── fetch-social-stats.js
└── README.md
```

## Updating Content

### Links
Edit `public/data/site.config.json` to update links, categories, and brand info.

### Media Kit
Edit `public/data/media.kit.json` to update bio, partnerships, and contact info.

### Stats (Manual)
Edit `public/data/social.stats.json` to manually update follower counts (or let GitHub Actions handle it automatically).

## License

Personal project for SageSiren. All rights reserved.
