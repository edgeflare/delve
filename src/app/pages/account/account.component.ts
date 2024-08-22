import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { EditorComponent } from 'ng-essential';
import { NavComponent } from '@shared/components';
import { AuthService } from '@edgeflare/ng-oidc';

@Component({
  selector: 'e-account',
  standalone: true,
  imports: [CommonModule, EditorComponent, NavComponent],
  template: `
  @if(isAuthenticated()) {
    <ng-editor [content]="user() | json" mode="json" [isReadOnly]=true></ng-editor>
  } @else {
    <p>You are not authenticated. Please <a routerLink="/login">login</a>.</p>
  }
  `,
  styles: ``
})
export class AccountComponent {
  private authService = inject(AuthService);

  isAuthenticated = this.authService.isAuthenticated;
  user = this.authService.user;
}
