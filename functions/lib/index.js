"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
// Enable CORS for all routes
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
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
        const response = await axios_1.default.post(sqlUrl, { statement }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        return res.json(response.data);
    }
    catch (error) {
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
        const response = await axios_1.default.post(sqlUrl, { statement: 'SELECT 1' }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        return res.json({ connected: true, message: 'Connection successful' });
    }
    catch (error) {
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
        const response = await axios_1.default.post(`${baseUrl}/chat/completions`, {
            model,
            messages,
            max_tokens: maxTokens || 1024,
            temperature: 0.7,
            top_p: 0.9
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 60000
        });
        return res.json(response.data);
    }
    catch (error) {
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
// Export the Express app as a Cloud Function
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map