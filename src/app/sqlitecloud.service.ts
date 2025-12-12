// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Injectable } from '@angular/core';
import { LogService } from './log.service';
import { proxyConfig } from './proxy-config';

interface SQLiteCloudConfig {
  host: string;
  port: number;
  database: string;
  apiKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class SQLiteCloudService {
  // SQLiteCloud connection configuration
  // Connection string: sqlitecloud://cff5nbfmvk.g3.sqlite.cloud:8860/auth.sqlitecloud?apikey=BXprulelUXaqxBb67ee1lVzRnRQpyMJksx2b1LFcRKA
  private config: SQLiteCloudConfig = {
    host: 'cff5nbfmvk.g3.sqlite.cloud',
    port: 8860,
    database: 'auth.sqlitecloud',
    apiKey: 'BXprulelUXaqxBb67ee1lVzRnRQpyMJksx2b1LFcRKA'
  };

  private isConnected = false;

  constructor(private log: LogService) {}

  setConnectionString(connectionString: string): boolean {
    try {
      // Parse connection string format: sqlitecloud://host:port/database?apikey=KEY
      const url = new URL(connectionString.replace('sqlitecloud://', 'https://'));
      
      this.config = {
        host: url.hostname,
        port: parseInt(url.port) || 8860,
        database: url.pathname.replace('/', ''),
        apiKey: url.searchParams.get('apikey') || ''
      };

      if (!this.config.apiKey) {
        this.log.error('Invalid connection string: missing apikey');
        return false;
      }

      this.log.info('SQLiteCloud connection string parsed:', {
        host: this.config.host,
        port: this.config.port,
        database: this.config.database
      });
      return true;
    } catch (error) {
      this.log.error('Failed to parse connection string:', error);
      return false;
    }
  }

  async connect(): Promise<boolean> {
    try {
      // Build connection string from config
      const connectionString = `sqlitecloud://${this.config.host}:${this.config.port}/${this.config.database}?apikey=${this.config.apiKey}`;
      
      // Use proxy endpoint
      const endpoint = proxyConfig.getEndpoint('/api/sqlitecloud/test');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ connectionString })
      });

      const result = await response.json();

      if (response.ok && result.connected) {
        this.isConnected = true;
        this.log.info('Connected to SQLiteCloud database:', this.config.database);
        return true;
      } else {
        this.log.error('Failed to connect to SQLiteCloud:', result.error);
        return false;
      }
    } catch (error) {
      this.log.error('SQLiteCloud connection error:', error);
      return false;
    }
  }

  async executeSQL(sql: string): Promise<any> {
    try {
      const connectionString = `sqlitecloud://${this.config.host}:${this.config.port}/${this.config.database}?apikey=${this.config.apiKey}`;
      
      const endpoint = proxyConfig.getEndpoint('/api/sqlitecloud/query');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          statement: sql,
          connectionString
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SQL execution failed: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      this.log.debug('SQL executed:', sql, 'Result:', result);
      return result;
    } catch (error) {
      this.log.error('SQL execution error:', error);
      throw error;
    }
  }

  async createTable(tableName: string, columns: Array<{columnName: string, columnType: string}>): Promise<void> {
    const columnDefs = columns
      .map(col => {
        const sqlType = this.mapToSQLType(col.columnType);
        return `${col.columnName} ${sqlType}`;
      })
      .join(', ');

    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs})`;
    await this.executeSQL(sql);
    this.log.info(`Table ${tableName} created in SQLiteCloud`);
  }

  async alterTableAddColumns(tableName: string, columns: Array<{columnName: string, columnType: string}>): Promise<void> {
    for (const col of columns) {
      const sqlType = this.mapToSQLType(col.columnType);
      const sql = `ALTER TABLE ${tableName} ADD COLUMN ${col.columnName} ${sqlType}`;
      await this.executeSQL(sql);
    }
    this.log.info(`Columns added to ${tableName}`);
  }

  async alterTableRemoveColumns(tableName: string, columns: Array<{columnName: string}>): Promise<void> {
    for (const col of columns) {
      const sql = `ALTER TABLE ${tableName} DROP COLUMN ${col.columnName}`;
      try {
        await this.executeSQL(sql);
      } catch (error) {
        this.log.warn(`Failed to drop column ${col.columnName}:`, error);
      }
    }
    this.log.info(`Columns removed from ${tableName}`);
  }

  async getTableSchema(tableName: string): Promise<any> {
    const sql = `PRAGMA table_info(${tableName})`;
    return await this.executeSQL(sql);
  }

  private mapToSQLType(columnType: string): string {
    const typeMap: { [key: string]: string } = {
      'string': 'TEXT',
      'integer': 'INTEGER',
      'date': 'DATETIME'
    };
    return typeMap[columnType] || 'TEXT';
  }
}
