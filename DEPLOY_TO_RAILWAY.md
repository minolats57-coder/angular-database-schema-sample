
# Deploy Proxy Server to Railway

Your proxy server is ready to deploy to Railway. Follow these steps:

## Step 1: Push Code to GitHub via Web UI

Since git CLI is having network issues, use GitHub's web upload:

1. Go to https://github.com/google-gemini/angular-database-schema-sample
2. Click **"Add file"** → **"Upload files"**
3. Drag and drop these files into the upload area:
   - `proxy-server.js`
   - `proxy-config.ts`
   - `railway.json`
   - `src/app/sqlitecloud.service.ts` (updated)
   - `src/app/openai.service.ts` (updated)

Or clone the repo locally, add files, and push:
```bash
git clone https://github.com/google-gemini/angular-database-schema-sample
cd angular-database-schema-sample
# Copy the new files here
git add .
git commit -m "Add proxy server"
git push
```

## Step 2: Set JWT Token on Railway

You need to add your JWT token as an environment variable in your Railway project.

1.  Go to your project on Railway.
2.  Go to the "Variables" tab.
3.  Add a new variable with the name `JWT_TOKEN`.
4.  For the value, you can use the following sample token for local development. **For production, you must generate a secure token.**

    ```
    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXZlbG9wZXIiLCJuYW1lIjoiTG9jYWwgRGV2IiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzU2ODk2MDB9.this-is-not-a-real-signature-and-should-not-be-used-in-production
    ```
