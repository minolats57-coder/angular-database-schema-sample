import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OpenAiService } from '../openai.service';
import { LogService } from '../log.service';

@Component({
  selector: 'app-openai-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './openai-config.component.html',
  styleUrl: './openai-config.component.scss'
})
export class OpenAiConfigComponent {
  apiKey: string = '';
  baseUrl: string = 'https://http.openai-gpt-oss-120b-proxy.yotta-infrastructure.on-prem.clusters.s9t.link';
  model: string = 'openai/gpt-oss-120b';
  headersId: string = '524436ef-5d4c-4d55-9351-71d67036b92b';
  systemInstruction: string = 'You are a database schema design assistant. Help create and modify database schemas based on user requirements.';
  
  isConfigured: boolean = false;
  statusMessage: string = '';

  constructor(
    private openAiService: OpenAiService,
    private log: LogService,
  ) {}

  applyConfiguration() {
    if (!this.apiKey || !this.baseUrl || !this.model) {
      this.statusMessage = 'Please fill in all required fields';
      this.log.warn('OpenAI configuration incomplete');
      return;
    }

    try {
      const config = {
        apiKey: this.apiKey,
        baseUrl: this.baseUrl,
        model: this.model,
        defaultHeaders: this.headersId ? { "id": this.headersId } : undefined
      };

      this.openAiService.configure(config);
      
      if (this.systemInstruction) {
        this.openAiService.setSystemInstruction(this.systemInstruction);
      }

      this.isConfigured = true;
      this.statusMessage = `OpenAI configured with model: ${this.model}`;
      this.log.info('OpenAI configuration applied successfully');
    } catch (error) {
      this.statusMessage = 'Failed to configure OpenAI: ' + error;
      this.log.error('OpenAI configuration error:', error);
    }
  }

  resetConfiguration() {
    this.apiKey = '';
    this.baseUrl = 'https://http.openai-gpt-oss-120b-proxy.yotta-infrastructure.on-prem.clusters.s9t.link';
    this.model = 'openai/gpt-oss-120b';
    this.headersId = '524436ef-5d4c-4d55-9351-71d67036b92b';
    this.isConfigured = false;
    this.statusMessage = 'Configuration reset';
  }
}
