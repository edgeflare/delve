import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  // AfterViewInit,
  inject,
  afterNextRender
} from '@angular/core';
import mermaid, { MermaidConfig } from 'mermaid';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'ng-mermaid',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="mermaid" #mermaidDiagramContainer [style.width]="width" [style.height]="height">
      @if (error) {
        <div #mermaidErrorContainer class="error-message"><pre><code>{{ error }}</code></pre></div> 
      }
    </div>
  `,
  styles: [
    `
    .mermaid { display: flex; justify-content: center; align-items: center; }
    .error-message {
      height: 100%;
      width: 100%;
      color: red;
    }
    `
  ]
})
export class MermaidComponent implements OnChanges {
  private snackBar = inject(MatSnackBar);

  @Input() mermaidContent!: string;
  @Input() height!: string;
  @Input() width!: string;
  @Input() theme = 'default';
  @Input() mermaidConfig: MermaidConfig = {};

  @ViewChild('mermaidDiagramContainer') mermaidDiagramContainer!: ElementRef;
  @ViewChild('mermaidErrorContainer') mermaidErrorContainer!: ElementRef;

  error: string | unknown = undefined;

  constructor(_: ElementRef) {
    afterNextRender(() => {
      this.renderDiagram();
    });
  }

  // // prefer afterNextRender over afterViewInit
  // afterViewInit() {
  //   this.renderDiagram();
  // }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['mermaidContent'] && !changes['mermaidContent'].isFirstChange()) {
      this.renderDiagram();
    }
  }

  private async renderDiagram() {
    this.error = null;

    try {
      mermaid.initialize({
        // user-provided config
        ...this.mermaidConfig,
        theme: this.theme,
        securityLevel: 'loose',
        flowchart: { curve: 'basis' },
      });

      const element = this.mermaidDiagramContainer.nativeElement;
      if (!element) {
        this.error = 'Diagram container not found.';
        return;
      }
      // mermaid.run({ nodes: element, suppressErrors: false });
      // TODO: enable suppressErrors in render call
      const { svg, bindFunctions } = await mermaid.render('mermaidDiagram', this.mermaidContent);

      element.innerHTML = svg;
      bindFunctions?.(element);
    } catch (error) {
      console.error(error);
      this.snackBar.open(error as string, 'Close', {
        duration: 5000,
      });
      this.error = error;
    } finally { }
  }

}
