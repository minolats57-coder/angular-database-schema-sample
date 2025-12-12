# Quick Start: Setting Up the Proxy Server

## Problem Solved ✓
Your Angular app can now communicate with SQLiteCloud and OpenAI through an API proxy server, bypassing CORS restrictions.

---

## Fastest Way: Deploy to Railway (5 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add proxy server and proxy config"
git push
```

### Step 2: Deploy on Railway
1. Go to https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select your repository
4. Railway auto-detects `proxy-server.js` and deploys it
5. Wait ~2 minutes for deployment
6. Copy your deployment URL (looks like: `https://your-app-xxxxx.railway.app`)

### Step 3: Update Frontend
Edit `src/app/proxy-config.ts`:
```typescript
export const proxyConfig = {
  proxyUrl: 'https://your-app-xxxxx.railway.app',  // ← Paste your URL here
  // ...
};
```

### Step 4: Deploy Frontend
```bash
npm run build
firebase deploy --only hosting
```

**Done!** Your app now works with SQLiteCloud and OpenAI.

---

## Alternative: Local Development

### Run Locally
```bash
# Terminal 1: Start proxy server
node proxy-server.js

# Terminal 2: Start Angular app
npm start
```

Then edit `src/app/proxy-config.ts`:
```typescript
proxyUrl: 'http://localhost:3001'
```

---

## Testing

1. Go to https://artor56-b5fc9.web.app
2. Scroll to **"SQLiteCloud Integration"**
3. Click **"Connect to SQLiteCloud"**
   - Should now show "Connected" instead of error
4. Try entering a database schema prompt
   - Should get responses from OpenAI now

---

## Other Deployment Options

- **Render**: https://render.com (free tier available)
- **Heroku**: https://heroku.com (paid plan required)
- **Vercel**: https://vercel.com (create `vercel.json` first)
- **Google Cloud Run**: https://cloud.google.com/run

See `PROXY_SETUP.md` for detailed instructions.

---

## What's Next?

1. ✅ Proxy server ready
2. ✅ Frontend configured to use proxy
3. Deploy proxy to your chosen platform
4. Update frontend with proxy URL
5. Test the app

---

## Need Help?

Check `PROXY_SETUP.md` for troubleshooting and detailed setup instructions.
