import { Component, Inject, EventEmitter, Output, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy } from '@angular/core';
import { ConfirmDeleteDialogData } from '../types';

@Component({
  selector: 'ng-confirm-delete-dialog',
  standalone: true,
  imports: [
    CommonModule, MatSnackBarModule, MatDialogModule, FormsModule,
    MatFormFieldModule, MatButtonModule, MatInputModule
  ],
  templateUrl: './confirm-delete-dialog.component.html',
  styles: `
    mat-dialog-content, mat-form-field {
      width: 100%;
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDeleteDialogComponent {
  @Output() deletionComplete = new EventEmitter<void>();
  @Input() confirmationInput = '';
  itemName!: string;
  deleteUrl!: string;
  itemType: string | undefined;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeleteDialogData,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.itemName = data.itemName;
    this.deleteUrl = data.deleteUrl;
    this.itemType = data.itemType;
  }

  confirmDelete() {
    this.http.delete<any>(this.deleteUrl).subscribe({ // eslint-disable-line @typescript-eslint/no-explicit-any
      next: (response) => {
        // Pass the entire response to the snackBar and emit it back to the caller
        const successMessage = response?.message || `${this.itemName} ${this.itemType} deleted successfully`;
        this.snackBar.open(successMessage, 'Close', { duration: 3000 });
        this.deletionComplete.emit(response); // Emit the response to the caller
        this.dialogRef.close();
      },
      error: (error) => {
        // Handle the error, returning the error message if available
        const errorMessage = error?.error?.message || `Error deleting ${this.itemName} ${this.itemType}: ${error.message}`;
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

}
