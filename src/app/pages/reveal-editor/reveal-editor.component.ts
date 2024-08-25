import { CommonModule } from '@angular/common';
import {
  Component,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  OnDestroy,
  inject,
  signal,
  HostListener,
  Input, AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { PlatformService } from '@app/core';
import { EditorComponent, Reveal2Component, WebdavService, WindowMode } from 'ng-essential';

@Component({
  selector: 'e-reveal-editor',
  templateUrl: './reveal-editor.component.html',
  styleUrls: ['./reveal-editor.component.scss'],
  imports: [EditorComponent, Reveal2Component, CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, MatButtonToggleModule],
  standalone: true,
})
export class RevealEditorComponent implements OnDestroy, AfterViewInit {
  /**
   * Injected services and dependencies.
   */
  private route = inject(ActivatedRoute);
  private webdavService = inject(WebdavService);
  private matSnackBar = inject(MatSnackBar);
  private router = inject(Router);
  private platformService = inject(PlatformService);
  private cdr = inject(ChangeDetectorRef);

  /**
  * Prefix for modifier keys based on the platform (e.g., "⌘" for macOS, "Ctrl" for others).
  */
  modifierKeyPrefix = this.platformService.modifierKeyPrefix;
  windowMode = signal<WindowMode>('vsplit');

  @Input() filename: string | null = null;

  editorHeight = '100vh';
  editorWidth = '100%';

  content = `
<section>Horizontal Slide</section>
<section>
  <section>Vertical Slide 1</section>
  <section>Vertical Slide 2</section>
</section>
  `;

  @ViewChild('editorContainer', { read: ViewContainerRef }) editorContainer!: ViewContainerRef;
  private editorComponentRef!: ComponentRef<EditorComponent>;

  @ViewChild('revealContainer', { read: ViewContainerRef }) revealContainer!: ViewContainerRef;
  private revealComponentRef!: ComponentRef<Reveal2Component>;

  constructor() {
    const mode = this.route.snapshot.paramMap.get('mode') as WindowMode;
    if (mode) {
      this.windowMode.set(mode);
    } else {
      this.windowMode.set('preview'); // Default to 'preview'
    }
  }

  onEditorContentChanged(newContent: string) {
    this.content = newContent;
    // TODO: add validation here to check if the content is valid Reveal.js syntax
  }

  ngAfterViewInit() {
    if (this.filename) {
      this.webdavService.get(this.filename).subscribe(fileContent => {
        this.content = fileContent || this.content;
      });
    }

    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.editorComponentRef) {
      this.editorComponentRef.destroy();
    }
    if (this.revealComponentRef) {
      this.revealComponentRef.destroy();
    }
  }

  /**
   * Saves the current content to the file on the WebDAV server.
   */
  saveFile() {
    if (this.filename) {
      this.webdavService.put(this.filename, this.content).subscribe({
        next: () => {
          this.matSnackBar.open('File saved successfully', 'Close', { duration: 2000 });
        },
        // uncaught error handled by global error handler
      });
    } else {
      this.matSnackBar.open('Cannot save file without a filename', 'Close', { duration: 2000 });
    }
  }

  /**
   * Handles changes in the window mode button toggle group.
   * 
   * @param event The button toggle change event
   */
  onWindowModeChange(event: MatButtonToggleChange) {
    this.windowMode.set(event.value as WindowMode); // Update the windowMode signal
    // Navigate to the appropriate route based on the window mode
    switch (event.value) {
      case 'preview':
        this.router.navigate(['../preview'], { relativeTo: this.route });
        break;
      case 'edit':
        this.router.navigate(['../edit'], { relativeTo: this.route });
        break;
      case 'vsplit':
        this.router.navigate(['../vsplit'], { relativeTo: this.route });
        break;
      case 'hsplit':
        this.router.navigate(['../hsplit'], { relativeTo: this.route });
        break;
    }
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
          this.router.navigate(['../preview'], { relativeTo: this.route });
          break;
        case event.key.toLowerCase() === 'e':
          event.preventDefault();
          this.windowMode.set('edit');
          this.router.navigate(['../edit'], { relativeTo: this.route });
          break;
        case event.key === 'v': // Shift + V
          if (event.shiftKey) {
            event.preventDefault();
            this.windowMode.set('vsplit');
            this.router.navigate(['../vsplit'], { relativeTo: this.route });
          }
          break;
        case event.key.toLowerCase() === 'h':
          event.preventDefault();
          this.windowMode.set('hsplit');
          this.router.navigate(['../hsplit'], { relativeTo: this.route });
          break;
      }
    }
  }

}
