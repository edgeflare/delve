import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule, RouterOutlet } from '@angular/router';
import { LoginButtonComponent } from '@shared/components';

@Component({
  selector: 'e-nav',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatToolbarModule, MatIconModule, RouterModule, LoginButtonComponent, MatButtonModule],
  template: `
<mat-toolbar color="primary" class="flex justify-between items-center">
  <a href="/home">
    <span class="flex items-center text-2xl">
    <mat-icon [inline]="true" style="font-size: 2.5rem;">terminal</mat-icon>
    </span>
  </a>

  <div class="flex-1"></div>

  <button mat-button routerLink="/">
    <span class="flex items-center text-2xl">
      &nbsp;
      <pre><code><b>/delve</b></code></pre>
    </span>
  </button>

  <div class="flex-1 flex justify-end">
    <e-login-button></e-login-button>
  </div>
</mat-toolbar>

<router-outlet />
`,
  styles: ``
})
export class NavComponent {
}
