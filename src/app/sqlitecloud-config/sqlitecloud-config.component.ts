import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../database.service';
import { SQLiteCloudService } from '../sqlitecloud.service';
import { LogService } from '../log.service';

@Component({
  selector: 'app-sqlitecloud-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sqlitecloud-config.component.html',
  styleUrl: './sqlitecloud-config.component.scss'
})
export class SQLiteCloudConfigComponent implements OnInit {
  connectionString: string = 'sqlitecloud://cff5nbfmvk.g3.sqlite.cloud:8860/auth.sqlitecloud?apikey=BXprulelUXaqxBb67ee1lVzRnRQpyMJksx2b1LFcRKA';
  isConnected = false;
  isConnecting = false;
  statusMessage = '';

  constructor(
    private database: DatabaseService,
    private sqliteCloud: SQLiteCloudService,
    private log: LogService,
  ) {}

  ngOnInit() {
    this.isConnected = this.database.cloudEnabled;
  }

  async connectToCloud() {
    this.isConnecting = true;
    this.statusMessage = 'Parsing connection string...';
    
    try {
      // Parse the connection string
      const parsed = this.sqliteCloud.setConnectionString(this.connectionString);
      if (!parsed) {
        this.statusMessage = 'Invalid connection string format';
        this.isConnecting = false;
        return;
      }

      this.statusMessage = 'Connecting to SQLiteCloud...';
      const connected = await this.database.initializeCloud();
      if (connected) {
        this.isConnected = true;
        this.statusMessage = 'Connected to SQLiteCloud successfully';
        this.log.info('SQLiteCloud connected');
      } else {
        this.statusMessage = 'Failed to connect to SQLiteCloud';
        this.log.error('SQLiteCloud connection failed');
      }
    } catch (error) {
      this.statusMessage = 'Error connecting to SQLiteCloud: ' + error;
      this.log.error('SQLiteCloud connection error:', error);
    } finally {
      this.isConnecting = false;
    }
  }

  disconnect() {
    this.isConnected = false;
    this.database.cloudEnabled = false;
    this.statusMessage = 'Disconnected from SQLiteCloud';
  }
}
