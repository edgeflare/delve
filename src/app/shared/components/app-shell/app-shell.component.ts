import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Input, input, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '@edgeflare/ng-oidc'
import { filter, Subscription } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LoginButtonComponent } from '@app/shared/components';
import { Item } from '@app/shared/interfaces';
import { PlatformService } from '@app/core';

@Component({
  selector: 'e-app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatButtonModule,
    LoginButtonComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent implements OnInit {
  private app = inject(PlatformService);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private title = inject(Title);
  private router = inject(Router);
  private routeSubscription: Subscription = new Subscription();

  isHandset = this.app.isHandset;
  user = this.authService.user;
  error: Error | null = null;
  @ViewChild('drawer') drawer!: MatSidenav;
  @Input() navText!: string;
  @Input() navLink!: string;

  @Input() networkId!: string;

  ngOnInit() {
    this.routeSubscription = this.app.isHandset$.subscribe((isHandset) => {
      if (isHandset) {
        this.routeSubscription.add(
          this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
              this.drawer.close();
            }),
        );
      }
    });

    this.title.setTitle('dashboard | guardian WireGuard');
  }

  navRoutes: Item[] = [
    {
      name: 'Networks',
      path: '/dashboard/networks',
      avatar: 'lan', // hub
    },
    {
      name: 'Peers',
      path: `/dashboard/networks/peers`,
      avatar: 'devices',
    },
  ]

  sideNavRoutes = input<Item[]>(this.navRoutes);
  topNavRoutes = input<Item[]>([{ name: 'guardian', path: '/' }]);
}
