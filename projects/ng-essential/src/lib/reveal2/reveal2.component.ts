import {
  Component, Input, signal, ElementRef, OnDestroy,
  ViewChild, ViewEncapsulation, ChangeDetectionStrategy,
  effect,
  afterNextRender,
  input,
  SimpleChanges,
  OnChanges,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';

import Reveal from 'reveal.js';
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js';
import Highlight from 'reveal.js/plugin/highlight/highlight.esm.js';
import mermaid from 'mermaid';
import { CommonModule } from '@angular/common';
import RevealHighlight from 'reveal.js/plugin/highlight/highlight.esm.js';

@Component({
  selector: 'ng-reveal2',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #revealContainer class="reveal" [style.height]="height" [style.width]="width">
      <div class="slides"> {{ content() }}</div>
    </div>
  `,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reveal2Component implements OnChanges, OnDestroy {
  @ViewChild('revealContainer', { static: true }) revealContainer!: ElementRef;

  content = input(`<section>Hello World!</section>`);
  @Input() height = '100vh';
  @Input() width = '100vw';

  private reveal: Reveal.Api | null = null;
  private isRevealInitialized = signal(false);

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) {
    console.log('initial content:', this.content());

    afterNextRender(() => {
      this.initializeReveal();
      this.cdr.detectChanges();
    });

    effect(() => {
      console.log('Current reveal content:', this.content());
      if (this.isRevealInitialized()) {
        this.syncReveal();
      }

      this.cdr.detectChanges();
    }, { allowSignalWrites: true });
  }

  ngOnDestroy() {
    this.destroyReveal();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['content'] && this.isRevealInitialized()) {
      this.syncReveal();
    }
  }

  private initializeMermaid() {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: { curve: 'basis' },
    });

    if (!this.reveal) {
      return;
    }
    this.reveal.on('slidechanged', () => {
      mermaid.run({ querySelector: '.mermaid', suppressErrors: false });
    });
  }

  private getCurrentSlideIndices(): [number, number] {
    if (this.reveal) {
      const indices = this.reveal.getIndices();
      return [indices.h, indices.v];
    }
    return [0, 0];
  }

  private syncReveal() {
    if (this.isRevealInitialized() && this.reveal) {
      // Store current slide indices
      const [currentHorizontalIndex, currentVerticalIndex] = this.getCurrentSlideIndices();

      // Create a temporary div to parse the content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.content();

      // Clear existing slides
      const slidesContainer = this.revealContainer.nativeElement.querySelector('.reveal .slides');
      slidesContainer.innerHTML = '';

      // Append new slides
      while (tempDiv.firstChild) {
        slidesContainer.appendChild(tempDiv.firstChild);
      }

      // Update Reveal.js
      this.reveal.sync();
      this.reveal.layout();

      // Run Mermaid
      // this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          mermaid.run({ querySelector: '.mermaid', suppressErrors: false });
        }, 0);
      // });

      // Restore the previous slide position
      this.reveal.slide(currentHorizontalIndex, currentVerticalIndex);
    }
  }

  private initializeReveal() {
    const slides: Element = this.revealContainer.nativeElement.querySelector('.slides');
    if (slides) {
      slides.innerHTML = this.content();
    }

    this.reveal = new Reveal(this.revealContainer.nativeElement, {
      controls: true,
      progress: true,
      plugins: [Markdown, Highlight, RevealHighlight],
      embedded: true,
      height: '100%',
      width: '100%',
    });

    this.reveal.initialize().then(() => {
      this.isRevealInitialized.set(true);
      this.initializeMermaid();
      this.syncReveal();
    });
  }

  private destroyReveal() {
    if (this.reveal) {
      this.reveal.destroy();
      this.reveal = null;
      this.isRevealInitialized.set(false);
    }
  }

}
