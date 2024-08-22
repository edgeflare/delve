import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent, ExpandableTableComponent, WebdavService, WebdavResource } from 'ng-essential';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { toObservable } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'e-webdav-resources',
  standalone: true,
  imports: [CommonModule, ExpandableTableComponent, MatIconModule, EditorComponent, MatButtonModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './webdav-resources.component.html',
  styles: ``,
})
export class WebdavResourcesComponent {
  private webdavService = inject(WebdavService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  resources = this.webdavService.resources;
  resources$ = toObservable(this.resources);

  columns = ['name', 'size', 'modified', 'type'];
  cellDefs = ['name', 'size | filesize', 'modified | date: "short"', 'contentType',];
  currentExpandedRow?: WebdavResource;

  isShowDetails = false;

  /** Updates the currently expanded row in the table. */
  handleRowChange(rowData: WebdavResource) {
    this.currentExpandedRow = rowData;
  }

  /** Toggles the display of detailed network information. */
  toggleDetails() {
    this.isShowDetails = !this.isShowDetails;
  }

  // create text file
  createFile() {
    const dialogRef = this.dialog.open(CreateFileDialogComponent, {
      width: '300px', // Adjust the width as needed
    });

    dialogRef.afterClosed().subscribe(fileName => {
      if (fileName) {
        this.webdavService.put(fileName, '').subscribe({ // Create an empty file
          next: () => {
            console.log('File created successfully');
            this.router.navigate([`/delve/${fileName}/edit`]); // Navigate to the edit route
          },
          error: (error: HttpErrorResponse) => {
            console.error('File creation failed', error);
            // Handle the error appropriately (e.g., show an error message to the user)
          }
        });
      }
    });
  }

  // upload file
  selectedFile: File | null = null;

  /** Handles the file input change event and uploads the selected file. */
  uploadFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const filePath = file.name;

      this.webdavService.put(filePath, file).subscribe({
        next: () => {
          console.log('File uploaded successfully');
        },
        error: (error: HttpErrorResponse) => {
          console.error('File upload failed', error);
        }
      });
    }
  }

  isTextFile(contentType: string | undefined): boolean {
    if (!contentType) return false;

    // Prioritize checking for "charset=utf-8"
    if (contentType.includes('charset=utf-8')) return true;

    const textTypes = [
      'text/plain',
      'text/html',
      'application/json',
      'application/xml',
      'application/x-sh', // Shell scripts
    ];

    return textTypes.some(type => contentType.startsWith(type));
  }

  reloadWindow(url: string): void {
    this.router.navigateByUrl(url).then(() => {
      if (!this.router.url.endsWith(url)) {
        window.location.reload();
      }
    });
  }

}

@Component({
  selector: 'e-create-file-dialog',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, MatDialogModule],
  template: `
<mat-dialog-content class="mat-typography">
  <h6>Create New File</h6>
  <mat-form-field appearance="outline">
    <input matInput [formControl]="fileNameControl" aria-label="Name of file to create">
  </mat-form-field>
</mat-dialog-content>
<mat-dialog-actions align="end">
  <button mat-button class="accent-button" (click)="onCancel()">CANCEL</button>
  <button mat-raised-button [mat-dialog-close]="fileNameControl.value"
  [disabled]="!fileNameControl.valid">CREATE</button>
</mat-dialog-actions>
  `,
})
export class CreateFileDialogComponent {
  fileNameControl = new FormControl('', { nonNullable: true });

  constructor(
    public dialogRef: MatDialogRef<CreateFileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: object // pass additional data if needed
  ) { }

  onCancel(): void {
    this.dialogRef.close();
  }
}
