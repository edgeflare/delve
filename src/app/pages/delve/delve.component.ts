import { AfterViewInit, Component, inject, Input, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { RevealComponent, WebdavService, WindowMode } from 'ng-essential';

@Component({
  selector: 'e-delve',
  standalone: true,
  imports: [RevealComponent, MatButtonModule],
  template: `
    @if(fileContent()) {
    <ng-reveal [content]="fileContent" [editorMode]="'html'" [windowMode]="windowMode"></ng-reveal>
    }
  `,
  styles: ``
})
export class DelveComponent implements AfterViewInit {
  private webdavService = inject(WebdavService);
  private route = inject(ActivatedRoute);

  private helloWorld = `<section><h1>Hello World!</h1></section>`;
  @Input() filename: string | null = null;
  fileContent: WritableSignal<string> = signal('');
  windowMode = signal<WindowMode>('preview');

  constructor() {
    const mode = this.route.snapshot.paramMap.get('mode') as WindowMode;
    if (mode) {
      this.windowMode.set(mode);
    } else {
      this.windowMode.set('preview'); // Default to 'preview'
    }
  }

  ngAfterViewInit() {
    if (this.filename) {
      this.webdavService.get(this.filename).subscribe(fileContent => {
        this.fileContent.set(fileContent || this.helloWorld);
      });
    }
  }

  /**
   * Saves the current content to the file on the WebDAV server.
   */
  saveFile() {
    if (this.filename) {
      const content = this.fileContent();
      this.webdavService.put(this.filename, content).subscribe({
        next: () => {
          console.log('File saved successfully');
        },
        error: (error) => {
          console.error('Error saving file:', error);
        }
      });
    } else {
      console.warn('No filename specified for saving');
    }
  }
}
