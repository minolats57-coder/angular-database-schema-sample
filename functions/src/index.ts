import * as functions from 'firebase-functions';
import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

// Enable CORS for all routes
app.use(cors({ origin: true }));
app.use(express.json());

// SQLiteCloud proxy endpoint
app.post('/sqlitecloud/query', async (req: Request, res: Response) => {
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
        timeout: 30000
      }
    );

    return res.json(response.data);
  } catch (error: any) {
    console.error('SQLiteCloud proxy error:', error.message);
    return res.status(500).json({
      error: error.message || 'Failed to execute SQLiteCloud query'
    });
  }
});

// SQLiteCloud connection test endpoint
app.post('/sqlitecloud/test', async (req: Request, res: Response) => {
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
        timeout: 10000
      }
    );

    return res.json({ connected: true, message: 'Connection successful' });
  } catch (error: any) {
    console.error('SQLiteCloud test error:', error.message);
    return res.status(500).json({
      connected: false,
      error: error.message || 'Connection failed'
    });
  }
});

// OpenAI proxy endpoint
app.post('/openai/chat', async (req: Request, res: Response) => {
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
        timeout: 60000
      }
    );

    return res.json(response.data);
  } catch (error: any) {
    console.error('OpenAI proxy error:', error.message);
    return res.status(500).json({
      error: error.message || 'Failed to call OpenAI API'
    });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export the Express app as a Cloud Function
export const api = functions.https.onRequest(app);
