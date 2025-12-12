# API Proxy Server Setup

The application uses an API proxy server to handle requests to SQLiteCloud and OpenAI APIs due to CORS restrictions in the browser.

## Local Development

### 1. Install Dependencies
```bash
npm install express cors axios body-parser
```

### 2. Run the Proxy Server
```bash
node proxy-server.js
```

The server will start on `http://localhost:3001`

### 3. Configure the Angular App
Edit `src/app/proxy-config.ts`:
```typescript
export const proxyConfig = {
  proxyUrl: 'http://localhost:3001',
  // ... rest of config
};
```

### 4. Run Angular App
In another terminal:
```bash
npm start
```

The app will now use the local proxy server for all API calls.

---

## Production Deployment

### Option 1: Railway (Recommended)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Add proxy server"
   git push origin main
   ```

2. **Deploy on Railway**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository
   - Railway will detect `proxy-server.js`
   - Wait for deployment (~2 minutes)
   - Note the deployed URL (e.g., `https://your-proxy-xxxxxx.railway.app`)

3. **Update Angular App**
   - Edit `src/app/proxy-config.ts`:
   ```typescript
   proxyUrl: 'https://your-proxy-xxxxxx.railway.app'
   ```
   - Rebuild and redeploy the Angular app

### Option 2: Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign in with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Select your GitHub repository
   - Set build command: `npm install`
   - Set start command: `node proxy-server.js`
   - Set environment to Node
   - Deploy

3. **Note the URL**
   - Render will give you a URL like `https://your-proxy.onrender.com`
   - Update `proxy-config.ts` with this URL

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create and Deploy**
   ```bash
   heroku create your-proxy-app
   git push heroku main
   ```

3. **Note the URL**
   - Your app URL: `https://your-proxy-app.herokuapp.com`
   - Update `proxy-config.ts`

### Option 4: Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Import from GitHub

2. **Create `vercel.json`**
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "proxy-server.js", "use": "@vercel/node" }
     ],
     "routes": [
       { "src": "/(.*)", "dest": "proxy-server.js" }
     ]
   }
   ```

3. **Deploy**
   - Link your GitHub repo and deploy
   - Note the URL (e.g., `https://your-proxy.vercel.app`)
   - Update `proxy-config.ts`

---

## Updating the Frontend

After deploying the proxy server, update the frontend:

1. **Edit `src/app/proxy-config.ts`**:
   ```typescript
   export const proxyConfig = {
     proxyUrl: 'https://your-deployed-proxy-url.com',
   };
   ```

2. **Rebuild and deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

---

## Verification

Once deployed, test the proxy server:

```bash
curl https://your-proxy-url.com/health
```

Should return:
```json
{"status":"ok","timestamp":"2025-12-12T..."}
```

---

## Environment Variables (Optional)

You can configure the proxy server with environment variables:

```bash
PORT=3001  # Default port
```

---

## Troubleshooting

### "Connection refused" error
- Make sure proxy server is running
- Check the correct URL is set in `proxy-config.ts`

### CORS errors still happening
- Verify the proxy URL doesn't have trailing slash
- Check that the proxy server is publicly accessible

### API calls timing out
- Check proxy server logs
- Verify SQLiteCloud/OpenAI credentials are correct
- Increase timeout in `proxy-server.js` if needed

---

## Security Notes

⚠️ **Important**: The proxy server exposes your API keys. Only deploy to trusted services.

For production, consider:
1. Using environment variables for credentials
2. Adding request authentication/rate limiting
3. Running on a private VPC
4. Implementing request logging and monitoring

---

## Support

For issues or questions, refer to:
- SQLiteCloud Docs: https://docs.sqlitecloud.io
- OpenAI Docs: https://platform.openai.com/docs
