/**
 * Proxy configuration for API calls
 * 
 * Use this to switch between direct API calls and proxy server
 * In production, set proxyUrl to your deployed proxy server
 */

export const proxyConfig = {
  // Set to empty string to use direct API calls (may fail due to CORS)
  // Set to your proxy server URL to use proxy (recommended for production)
  proxyUrl: 'https://angular-database-schema-sample.up.railway.app',
  
  // Example proxy server URLs:
  // - http://localhost:3001 (local development)
  // - https://your-proxy.railway.app (Railway)
  // - https://your-proxy.onrender.com (Render)
  // - https://your-proxy.herokuapp.com (Heroku)
  
  // Helper function to get the API endpoint
  getEndpoint(path: string): string {
    if (this.proxyUrl) {
      return `${this.proxyUrl}${path}`;
    }
    return path;
  },

  // Set proxy URL at runtime
  setProxyUrl(url: string): void {
    this.proxyUrl = url;
  }
};
