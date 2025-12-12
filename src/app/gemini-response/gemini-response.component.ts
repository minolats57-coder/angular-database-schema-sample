import { AfterViewChecked, Component, ElementRef, viewChild } from '@angular/core';
import { OpenAiService } from '../openai.service';
import { LogService } from '../log.service';
import { HelpfulLabelComponent } from '../helpful-label/helpful-label.component';

@Component({
  selector: 'app-gemini-response',
  standalone: true,
  imports: [HelpfulLabelComponent],
  templateUrl: './gemini-response.component.html',
  styleUrl: './gemini-response.component.scss'
})
export class GeminiResponseComponent implements AfterViewChecked {
  protected scrollAnchor = viewChild.required<ElementRef<HTMLDivElement>>('scrollAnchor');

  constructor(
    private log: LogService,
    protected openAi: OpenAiService,
  ) { }

  scrolled = false;

  ngAfterViewChecked(): void {
    if (!this.openAi.lastResponse || this.openAi.lastResponse.type == "none") {
      return;
    }

    if (this.scrolled) {
      // Only scroll into view once.
      return;
    }

    console.log('scroll')
    this.scrollAnchor().nativeElement.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    this.scrolled = true;
  }
}
