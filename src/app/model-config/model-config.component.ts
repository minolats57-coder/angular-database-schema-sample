import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LogService } from '../log.service';
import { OpenAiService } from '../openai.service';
import { HelpfulLabelComponent } from '../helpful-label/helpful-label.component';

@Component({
  selector: 'app-model-config',
  templateUrl: './model-config.component.html',
  styleUrl: './model-config.component.scss',
  standalone: true,
  imports: [HelpfulLabelComponent, FormsModule, CommonModule]
})
export class ModelConfigComponent implements OnInit {
  protected apiKey: string = '';
  protected baseUrl: string = 'https://http.openai-gpt-oss-120b-proxy.yotta-infrastructure.on-prem.clusters.s9t.link';
  protected model: string = 'openai/gpt-oss-120b';
  protected headersId: string = '524436ef-5d4c-4d55-9351-71d67036b92b';
  protected isConfigured: boolean = false;

  constructor(
    private log: LogService,
    protected openAi: OpenAiService,
  ) { }

  systemInstruction = `You are an AI database agent.

  1. Users describe what data they would like to store in plain language.
  
  2. You translate these descriptions into a suitable database schema.
     - Consider the tables, columns and data types that would be appropriate.
     - Expand the set of obvious columns to be added to include columns that
       are also likely to exist in production databases.
  
  3. Compare the current schema with the new schema.
     - Review the existing tables and columns in the current schema.
     - Ensure columns data types are still appropriate in the new schema.
     - Determine whether any tables and/or columns are missing.
     - Identify which columns need to moved to different tables.
     
  4. Respond with multiple function calls to fully update the schema.
     - Create all missing tables.
     - Alter existing tables to add missing columns.
     - Delete columns that have been moved to another table.

For example, if the user asks to create a library management system with books,
authors, members, and loans, return 4 tables: one each for books, authors,
members, and loans.`;

  ngOnInit(): void {
    // Configure with default values
    this.configure();
  }

  configure() {
    if (this.apiKey && this.baseUrl && this.model) {
      const config = {
        apiKey: this.apiKey,
        baseUrl: this.baseUrl,
        model: this.model,
        defaultHeaders: this.headersId ? { "id": this.headersId } : undefined
      };
      this.openAi.configure(config);
      this.openAi.setSystemInstruction(this.systemInstruction);
      this.isConfigured = true;
      this.log.info('GPT-OSS-120B configured');
    }
  }

}
