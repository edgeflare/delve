import { Component, inject } from '@angular/core';
import { AuthService } from '@edgeflare/ng-oidc';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'e-login-button',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, RouterModule, MatButtonModule, MatListModule],
  templateUrl: './login-button.component.html',
  styles: ``
})
export class LoginButtonComponent {
  private authService = inject(AuthService);

  login() {
    this.authService.signinRedirect();
  }

  logout() {
    this.authService.signoutRedirect();
  }

  isAuthenticated = this.authService.isAuthenticated
}
