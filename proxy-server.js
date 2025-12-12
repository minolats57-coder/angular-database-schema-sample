/**
 * Simple Express proxy server for SQLiteCloud and OpenAI
 * Run this locally or deploy to a service like Heroku, Railway, or Render
 * 
 * Usage:
 * 1. Install: npm install express cors axios body-parser
 * 2. Run: node proxy-server.js
 * 3. Server will run on http://localhost:3001
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: true }));
app.use(bodyParser.json({ limit: '10mb' }));

// SQLiteCloud proxy endpoint
app.post('/sqlitecloud/query', async (req, res) => {
  try {
    const { statement, connectionString } = req.body;

    if (!statement || !connectionString) {
      return res.status(400).json({
        error: 'Missing required fields: statement, connectionString'
      });
    }

    // Parse connection string: sqlitecloud://host:port/database?apikey=KEY
    const url = new URL(connectionString.replace('sqlitecloud://', 'https://'));
    const host = url.hostname;
    const port = parseInt(url.port) || 8860;
    const apiKey = url.searchParams.get('apikey');

    if (!apiKey) {
      return res.status(400).json({ error: 'Invalid connection string: missing apikey' });
    }

    const sqlUrl = `https://${host}:${port}/v2/query`;

    const response = await axios.post(
      sqlUrl,
      { statement },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000,
        rejectUnauthorized: false // For self-signed certs
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error('SQLiteCloud proxy error:', error.message);
    return res.status(500).json({
      error: error.message || 'Failed to execute SQLiteCloud query'
    });
  }
});

// SQLiteCloud connection test endpoint
app.post('/sqlitecloud/test', async (req, res) => {
  try {
    const { connectionString } = req.body;

    if (!connectionString) {
      return res.status(400).json({ error: 'Missing connectionString' });
    }

    // Parse connection string
    const url = new URL(connectionString.replace('sqlitecloud://', 'https://'));
    const host = url.hostname;
    const port = parseInt(url.port) || 8860;
    const apiKey = url.searchParams.get('apikey');

    if (!apiKey) {
      return res.status(400).json({ error: 'Invalid connection string: missing apikey' });
    }

    const sqlUrl = `https://${host}:${port}/v2/query`;

    const response = await axios.post(
      sqlUrl,
      { statement: 'SELECT 1' },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        rejectUnauthorized: false
      }
    );

    return res.json({ connected: true, message: 'Connection successful' });
  } catch (error) {
    console.error('SQLiteCloud test error:', error.message);
    return res.status(500).json({
      connected: false,
      error: error.message || 'Connection failed'
    });
  }
});

// OpenAI proxy endpoint
app.post('/openai/chat', async (req, res) => {
  try {
    const { messages, model, baseUrl, apiKey, maxTokens } = req.body;

    if (!messages || !model || !baseUrl || !apiKey) {
      return res.status(400).json({
        error: 'Missing required fields: messages, model, baseUrl, apiKey'
      });
    }

    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model,
        messages,
        max_tokens: maxTokens || 1024,
        temperature: 0.7,
        top_p: 0.9
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000,
        rejectUnauthorized: false
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error('OpenAI proxy error:', error.message);
    return res.status(500).json({
      error: error.message || 'Failed to call OpenAI API'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         API Proxy Server Running                           ║
╠════════════════════════════════════════════════════════════╣
║ Server: http://localhost:${PORT}                           ║
║                                                            ║
║ Endpoints:                                                 ║
║  POST /sqlitecloud/test   - Test SQLiteCloud connection   ║
║  POST /sqlitecloud/query  - Execute SQL query              ║
║  POST /openai/chat        - Call OpenAI API                ║
║  GET  /health             - Health check                   ║
║                                                            ║
║ Deployment options:                                        ║
║  - Railway (railway.app)                                   ║
║  - Render (render.com)                                     ║
║  - Heroku (heroku.com)                                     ║
║  - Vercel (vercel.com)                                     ║
║  - Google Cloud Run                                        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});
