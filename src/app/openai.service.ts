// OpenAI Integration Service
// Supports both OpenAI GPT models and custom OSS models via proxy

import { Injectable } from '@angular/core';
import { LogService } from './log.service';
import { DatabaseService } from './database.service';
import { functionDeclarations } from './gemini-function-declarations';
import { proxyConfig } from './proxy-config';

type ResponseType = "none" | "waiting" | "unknown" | "functionCalls" | "invalidFunctionCalls" | "text" | "error";

type Response = {
  type: ResponseType,
  response?: string,
};

interface OpenAIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  defaultHeaders?: Record<string, string>;
}

@Injectable({
  providedIn: 'root'
})
export class OpenAiService {
  private config: OpenAIConfig | null = null;
  private maxRetries = 3;
  private retryDelay = 5000; // ms
  public lastResponse: Response = { type: "none" };
  private systemInstruction = "";

  constructor(
    private log: LogService,
    private database: DatabaseService,
  ) {}

  configure(config: OpenAIConfig) {
    this.config = config;
    this.log.info('OpenAI service configured', { model: config.model, baseUrl: config.baseUrl });
  }

  setSystemInstruction(instruction: string) {
    this.systemInstruction = instruction;
  }

  async generateResponse(prompt: string): Promise<void> {
    if (!this.config) {
      this.lastResponse = {
        type: "error",
        response: 'OpenAI service not configured. Please provide API key, base URL, and model.',
      };
      return;
    }

    try {
      this.lastResponse = { type: "waiting" };

      // Add system instruction if configured
      const messages = [];
      if (this.systemInstruction) {
        messages.push({
          role: "system",
          content: this.systemInstruction
        });
      }

      // Add database context to the prompt
      const enhancedPrompt = prompt + "\nCurrent database schema:\n" +
        (this.database.tables.length ?
          JSON.stringify(this.database.tables)
          : "None, the database does not contain any table definitions.");

      messages.push({
        role: "user",
        content: enhancedPrompt
      });

      this.log.info("Sending prompt to OpenAI:\n-----\n" + enhancedPrompt + "\n-----");

      const response = await this.fetchChatCompletionWithRetries(
        messages,
        1024,
        false
      );

      // Parse the response for function calls
      const responseText = response.choices[0].message.content;
      
      // Try to extract JSON function calls from the response
      const functionCalls = this.extractFunctionCalls(responseText);
      
      if (functionCalls && functionCalls.length > 0) {
        this.log.info("Extracted function calls from response:", functionCalls);
        
        const results = await Promise.all(functionCalls.map(async (fc) => {
          try {
            const err = await this.database.callFunction(fc as any);
            if (err) {
              this.log.error("Error calling function: " + fc.name, err);
              return false;
            }
            this.log.info("Successfully called function " + fc.name);
            return true;
          } catch (e) {
            this.log.error("Exception calling function " + fc.name, e);
            return false;
          }
        }));

        const success = results.every(r => r === true);
        this.lastResponse = {
          type: success ? "functionCalls" : "invalidFunctionCalls",
          response: JSON.stringify(functionCalls, null, 2),
        };
      } else if (responseText) {
        this.log.info("Received text response:", responseText);
        this.lastResponse = {
          type: "text",
          response: responseText,
        };
      } else {
        this.lastResponse = {
          type: "unknown",
          response: JSON.stringify(response),
        };
      }
    } catch (e) {
      this.lastResponse = {
        type: "error",
        response: '' + e,
      };
      throw e;
    }
  }

  private extractFunctionCalls(text: string): any[] {
    const calls = [];
    
    // Try to find JSON patterns that match function calls
    const jsonPattern = /\{\s*"name"\s*:\s*"(createTable|alterTable)"[\s\S]*?\}/g;
    const matches = text.matchAll(jsonPattern);
    
    for (const match of matches) {
      try {
        const jsonStr = match[0];
        const parsed = JSON.parse(jsonStr);
        if (parsed.name && parsed.args) {
          calls.push({
            name: parsed.name,
            args: parsed.args
          });
        }
      } catch (e) {
        this.log.debug("Failed to parse potential function call:", match[0]);
      }
    }
    
    return calls;
  }

  private async fetchChatCompletionWithRetries(
    messages: any[],
    maxTokens: number,
    stream: boolean
  ): Promise<any> {
    if (!this.config) {
      throw new Error('OpenAI service not configured');
    }

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        // Use proxy endpoint instead of direct API call
        const endpoint = proxyConfig.getEndpoint('/api/openai/chat');
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: messages,
            baseUrl: this.config.baseUrl,
            apiKey: this.config.apiKey,
            maxTokens: maxTokens,
            stream: stream
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        this.log.warn(`Attempt ${attempt + 1} failed:`, error);
        
        if (attempt < this.maxRetries - 1) {
          this.log.info(`Retrying after ${this.retryDelay}ms...`);
          await this.delay(this.retryDelay);
        } else {
          throw error;
        }
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
