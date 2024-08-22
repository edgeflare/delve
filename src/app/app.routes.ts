import { Routes } from '@angular/router';
import { NavComponent } from './shared/components';
// import { ChartComponent } from './pages/chart/chart.component';

/**
 * Defines the main routes for the application.
 */
export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/public').then((m) => m.PUBLIC_ROUTES),
  },
  {
    path: '',
    component: NavComponent,            // top navbar
    children: [
      {
        path: 'delve',
        // canActivate: [authGuard],    // Uncomment to protect the 'delve' section with authentication
        children: [
          {
            path: '',                   // List of files in WebDAV
            loadComponent: () => import('./pages/webdav-resources').then((m) => m.WebdavResourcesComponent),
            title: 'Delve Resources'
          },
          {
            path: ':filename',          // Specific file within WebDAV
            children: [
              {
                path: ':mode',
                loadComponent: () => import('./pages/delve').then((m) => m.DelveComponent),
                title: 'Delve Editor'
              },
            ],
          },
        ],
      },
      {
        path: 'chart',
        loadComponent: () => import('./pages/chart/chart.component').then((m) => m.ChartComponent),
        title: 'Chart'
      },
      {
        path: '',
        redirectTo: 'delve',
        pathMatch: 'full'
      },
    ]
  },
  {
    path: '',
    pathMatch: 'prefix',
    loadChildren: () => import('./pages/public').then((m) => m.PUBLIC_ROUTES),
  },
];
