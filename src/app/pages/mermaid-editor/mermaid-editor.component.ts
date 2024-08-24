import { CommonModule } from '@angular/common';
import { Component, ViewChild, ViewContainerRef, ComponentRef, OnDestroy } from '@angular/core';
import { EditorComponent, MermaidComponent } from 'ng-essential';

@Component({
  selector: 'e-mermaid-editor',
  template: `
    <div>
      @switch (windowMode) {
        @case ('preview') {
          <ng-mermaid [mermaidContent]="editorContent" [height]="editorHeight" [width]="editorWidth"></ng-mermaid> 
        }
        @case ('edit') {
          <ng-editor 
            [content]="editorContent" 
            [height]="editorHeight" 
            [width]="editorWidth" 
            (editorContentChanged)="onEditorContentChanged($event)"
          ></ng-editor>
        }
        @case ('hsplit') {
          <div style="display: flex; flex-direction: column; height: 100vh;">
            <ng-editor 
              [content]="editorContent" 
              [height]="'50vh'" 
              [width]="editorWidth" 
              (editorContentChanged)="onEditorContentChanged($event)"
            ></ng-editor>
            <ng-mermaid [mermaidContent]="editorContent" [height]="'50vh'" [width]="editorWidth"></ng-mermaid> 
          </div>
        }
        @case ('vsplit') {
          <div style="display: flex; height: 100vh;">
            <ng-editor 
              [content]="editorContent" 
              [height]="editorHeight" 
              [width]="'50vw'" 
              (editorContentChanged)="onEditorContentChanged($event)"
            ></ng-editor>
            <ng-mermaid [mermaidContent]="editorContent" [height]="editorHeight" [width]="'50vw'"></ng-mermaid>
          </div>
        }
        @default {
          <div style="display: flex; flex-direction: column; height: 100vh;">
            <ng-editor 
              [content]="editorContent" 
              [height]="'100vh'" 
              [width]="editorWidth" 
              (editorContentChanged)="onEditorContentChanged($event)"
            ></ng-editor>
            <ng-mermaid [mermaidContent]="editorContent" [height]="'100vh'" [width]="editorWidth"></ng-mermaid> 
          </div>      
        }
      }
    </div>
  `,
  styles: [],
  imports: [EditorComponent, MermaidComponent, CommonModule],
  standalone: true,
})
export class MermaidEditorComponent implements OnDestroy {
  windowMode = 'vsplit';  // Default to 'vsplit' mode
  editorHeight = '100vh'; // Default to full height
  editorWidth = '50vw';   // Default to half width

  editorContent = `
flowchart TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]  
  `;

  @ViewChild('editorContainer', { read: ViewContainerRef }) editorContainer!: ViewContainerRef;
  private editorComponentRef!: ComponentRef<EditorComponent>;

  @ViewChild('mermaidContainer', { read: ViewContainerRef }) mermaidContainer!: ViewContainerRef;
  private mermaidComponentRef!: ComponentRef<MermaidComponent>;

  onEditorContentChanged(newContent: string) {
    this.editorContent = newContent;
    // might add validation here to check if the content is valid
  }

  ngOnDestroy() {
    if (this.editorComponentRef) {
      this.editorComponentRef.destroy();
    }
    if (this.mermaidContainer) {
      this.mermaidComponentRef.destroy();
    }
  }
}
