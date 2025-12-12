import { Injectable } from '@angular/core';
import { LogService } from './log.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000'; // Or your API base URL
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(private log: LogService) { }

  async register(user: any): Promise<any> {
    const response = await fetch(`${this.apiUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    return response.json();
  }

  async registerAdmin(user: any): Promise<any> {
    const response = await fetch(`${this.apiUrl}/register-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    return response.json();
  }

  async login(credentials: any): Promise<any> {
    const response = await fetch(`${this.apiUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    if (response.ok) {
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
    }
    return data;
  }

  async refresh(): Promise<any> {
    const response = await fetch(`${this.apiUrl}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });
    const data = await response.json();
    if (response.ok) {
      this.accessToken = data.accessToken;
    }
    return data;
  }

  async getProfile(): Promise<any> {
    if (!this.accessToken) {
        throw new Error('No access token available');
    }
    const response = await fetch(`${this.apiUrl}/profile`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    return response.json();
  }

  async getAdminData(): Promise<any> {
    if (!this.accessToken) {
        throw new Error('No access token available');
    }
    const response = await fetch(`${this.apiUrl}/admin`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    return response.json();
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }
}
