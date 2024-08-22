import {
  AfterViewInit, Component, OnDestroy, ElementRef,
  ViewChild, ChangeDetectorRef, signal, effect, Input,
  inject,
  HostListener,
  ViewEncapsulation,
  InjectionToken,
  Inject,
  Optional,
} from '@angular/core';

import Reveal from 'reveal.js';
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js';
import Highlight from 'reveal.js/plugin/highlight/highlight.esm.js';

import mermaid from 'mermaid';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EditorComponent } from '../editor/editor.component';
import { WebdavService } from '../webdav/webdav.service';
import { PlatformService } from '../core';
import { WindowMode } from '../types';

/**
 * Injection token for providing the root path for delve functionality.
 */
export const DELVE_ROOT_PATH = new InjectionToken<string>('/delve');

/**
 * Component for displaying and editing content using Reveal.js and an editor.
 */
@Component({
  selector: 'ng-reveal',
  standalone: true,
  templateUrl: './reveal.component.html',
  styleUrls: ['./reveal.component.scss'],
  encapsulation: ViewEncapsulation.None, // Disable ViewEncapsulation for styling flexibility
  imports: [
    CommonModule,
    MatIconModule,
    EditorComponent,
    MatButtonToggleModule,
    MatButtonModule,
    MatTooltipModule
  ],
})
export class RevealComponent implements AfterViewInit, OnDestroy {
  /**
   * Injected services and dependencies.
   */
  private route = inject(ActivatedRoute);
  private webdavService = inject(WebdavService);
  private matSnackBar = inject(MatSnackBar);
  private router = inject(Router);
  private platformService = inject(PlatformService);

  /**
   * Prefix for modifier keys based on the platform (e.g., "⌘" for macOS, "Ctrl" for others).
   */
  modifierKeyPrefix = this.platformService.modifierKeyPrefix;

  /**
   * The root path for delve functionality.
   */
  private rootPath = '/delve';

  /**
   * Reference to the Reveal.js container element.
   */
  @ViewChild('revealContainer', { static: false }) revealContainer!: ElementRef;

  /**
   * Input properties for configuring the component.
   */
  @Input() windowMode = signal<WindowMode>('preview');  // Current window mode
  @Input() editorMode = 'html';                        // Editor mode (e.g., 'html', 'markdown')
  @Input() content = signal(`<section><h1>Hello World!</h1></section>`); // Content to be displayed in Reveal.js
  @Input() filename: string | null = null;              // Filename for saving

  /**
   * Indicates whether Reveal.js has been initialized.
   */
  private isRevealInitialized = signal(false);
  /**
   * Constructor for the RevealComponent.
   * 
   * @param cdr ChangeDetectorRef for manual change detection
   * @param rootPath (Optional) Root path for delve functionality, injected using the DELVE_ROOT_PATH token
   */
  constructor(
    private cdr: ChangeDetectorRef,
    @Optional() @Inject(DELVE_ROOT_PATH) rootPath?: string
  ) {
    this.rootPath = rootPath || this.rootPath;
    this.filename = this.route.snapshot.paramMap.get('filename');

    // Effect to manage Reveal.js initialization/destruction based on windowMode
    effect(() => {
      const currentMode = this.windowMode();
      if (this.shouldRevealBeVisible(currentMode)) {
        if (!this.isRevealInitialized()) {
          this.initializeReveal();
          this.isRevealInitialized.set(true);
        }
      } else {
        if (this.isRevealInitialized()) {
          this.destroyReveal();
          this.isRevealInitialized.set(false);
        }
      }
      this.cdr.detectChanges();
    }, { allowSignalWrites: true });
  }

  /**
   * Checks if Reveal.js should be visible based on the current window mode.
   * 
   * @param mode The current window mode
   * @returns `true` if Reveal.js should be visible, `false` otherwise
   */
  private shouldRevealBeVisible(mode: WindowMode): boolean {
    return mode !== 'edit';
  }

  /**
   * Lifecycle hook: Called after the component's view has been initialized.
   */
  ngAfterViewInit() {
    setTimeout(() => {
      if (this.shouldRevealBeVisible(this.windowMode())) {
        this.initializeReveal();
        this.isRevealInitialized.set(true);
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Initializes Reveal.js with specified plugins and configuration.
   */
  private initializeReveal() {
    Reveal.initialize({
      controls: true,
      progress: true,
      plugins: [Markdown, Highlight],
      embedded: true,
      markdown: {
        // TODO: fix markdown rendering. all slides are rendered as one slide
        // separator: '^---$',            // For horizontal slides
        // verticalSeparator: '^\n\n\n$', // For vertical slides
        // notesSeparator: '^Note:',
      },
    });

    this.initializeMermaid();
    this.syncReveal();
  }

  /**
   * Initializes Mermaid.js for rendering diagrams and charts.
   */
  private initializeMermaid() {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: { curve: 'basis' },
    });

    // Re-run mermaid rendering when the slide changes
    Reveal.on("slidechanged", () => {
      mermaid.run({ querySelector: '.mermaid', suppressErrors: false });
    });
  }

  /**
   * Lifecycle hook: Called when the component is destroyed.
   */
  ngOnDestroy() {
    this.destroyReveal();
  }

  /**
   * Handles content changes in the editor and updates Reveal.js.
   * 
   * @param newContent The new content from the editor
   */
  handleContentChange(newContent: string) {
    if (this.content() !== newContent) {
      this.content.set(newContent);
      this.syncReveal();
    }
  }

  /**
   * Synchronizes the content in Reveal.js with the component's content signal.
   */
  private syncReveal() {
    if (this.isRevealInitialized()) {
      const revealContainer = document.querySelector('.reveal .slides');
      if (revealContainer) {
        revealContainer.innerHTML = this.content();
        Reveal.sync();
        Reveal.layout();
        mermaid.run({ querySelector: '.mermaid', suppressErrors: false });
      } else {
        console.error('Reveal container not found.');
      }
    }
  }

  /**
   * Destroys the Reveal.js instance.
   */
  private destroyReveal() {
    if (this.isRevealInitialized()) {
      Reveal.destroy();
    }
  }

  /**
   * Handles changes in the window mode button toggle group.
   * 
   * @param event The button toggle change event
   */
  onWindowModeChange(event: MatButtonToggleChange) {
    this.windowMode.set(event.value as WindowMode); // Update the windowMode signal
    this.reloadWindow();
  }

  /**
   * Saves the current content to the file on the WebDAV server.
   */
  saveFile() {
    if (this.filename) {
      const content = this.content();
      this.webdavService.put(this.filename, content).subscribe({
        next: () => {
          this.matSnackBar.open('File saved successfully', 'Close', { duration: 2000 });
        },
        // Error handling is assumed to be done globally
      });
    } else {
      console.warn('No filename specified for saving');
    }
  }

  /**
   * Reloads the window with the updated URL based on the current window mode.
   */
  reloadWindow() {
    // const url = `/<span class="math-inline">\{this\.rootPath\}/</span>{this.filename}/${this.windowMode()}`;
    const url = `/${this.rootPath}/${this.filename}/${this.windowMode()}`
    this.router.navigateByUrl(url).then(() => {
      if (!this.router.url.endsWith(url)) {
        window.location.reload();
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const modifierKey = this.platformService.isMac ? event.metaKey : event.ctrlKey;

    if (modifierKey) {
      switch (true) {
        case event.key.toLowerCase() === 's':
          event.preventDefault();
          this.saveFile();
          break;
        case event.key.toLowerCase() === 'p':
          event.preventDefault();
          this.windowMode.set('preview');
          this.reloadWindow();
          break;
        case event.key.toLowerCase() === 'e':
          event.preventDefault();
          this.windowMode.set('edit');
          this.reloadWindow();
          break;
        case event.key === 'v': // Shift + V
          if (event.shiftKey) {
            event.preventDefault();
            this.windowMode.set('vsplit');
            this.reloadWindow();
          }
          break;
        case event.key.toLowerCase() === 'h':
          event.preventDefault();
          this.windowMode.set('hsplit');
          this.reloadWindow();
          break;
      }
    }
  }

}
