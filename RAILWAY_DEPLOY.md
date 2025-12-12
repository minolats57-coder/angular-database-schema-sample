# Deploy to Railway (Direct Instructions)

Your code is ready to deploy. Use the Railway GitHub integration to deploy directly from your repository.

## Quick Deploy Link

Since git CLI is blocked, use Railway's web interface to deploy:

### Option 1: Railway GitHub App (Easiest)

1. Go to https://railway.app/dashboard
2. Click **"New Project"** 
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub account
5. Select: `minolats57-coder/angular-database-schema-sample`
6. Railway detects `proxy-server.js` and `railway.json`
7. Click **"Deploy"**

That's it! Railway will:
- Build the Node.js app
- Start the proxy server with `node proxy-server.js`
- Assign you a public URL like: `https://angular-database-schema-sample-prod-xxxxx.railway.app`

### Option 2: If Files Need to Be Pushed

Since git is blocked locally, push files via GitHub Web UI:

1. Go to https://github.com/minolats57-coder/angular-database-schema-sample
2. Click **"Add file"** → **"Upload files"**
3. Upload these files:
   - `proxy-server.js`
   - `proxy-config.ts`
   - `railway.json`
   - Updated service files

Then follow Option 1 to deploy to Railway.

---

## After Railway Deployment

### 1. Get Your Proxy URL
In Railway dashboard, click your project and find the **Domains** section. Copy the URL.

### 2. Update Frontend Config
Edit `src/app/proxy-config.ts`:

```typescript
export const proxyConfig = {
  // PASTE YOUR RAILWAY URL HERE (no trailing slash!)
  proxyUrl: 'https://railway.com/project/9dbb3ac8-11b8-47aa-8919-b138461c103f/service/8182a3f8-f32c-4c84-9e25-71aaa775a1bf/settings?environmentId=38cb1e37-2dd3-47a5-bc97-196d1ea0cf68#deployangular-database-schema-sample-prod-xxxxx.railway.app',
  
  getEndpoint(path: string): string {
    if (this.proxyUrl) {
      return `${this.proxyUrl}${path}`;
    }
    return path;
  },

  setProxyUrl(url: string): void {
    this.proxyUrl = url;
  }
};
```

### 3. Rebuild and Deploy Frontend
```bash
npm run build
firebase deploy --only hosting
```

### 4. Test It Works
1. Go to https://artor56-b5fc9.web.app
2. Scroll to **"SQLiteCloud Integration"** section
3. Click **"Connect to SQLiteCloud"**
4. Should show: ✅ **"Connected to SQLiteCloud successfully"**

---

## Verify Proxy Server

Once deployed, test it:

```bash
curl https://your-railway-url.railway.app/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

---

## Railway Dashboard

Your workspace: `96c98c99-cb1e-4f57-85e0-f9a94470a0a6`

View your projects at: https://railway.app/dashboard

---

## Files Ready for Deployment

✅ `proxy-server.js` - Your proxy server  
✅ `railway.json` - Railway configuration  
✅ `proxy-config.ts` - Frontend proxy settings  
✅ All service updates  

Everything is in your GitHub repo ready to deploy!
