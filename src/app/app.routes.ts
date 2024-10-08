import { Routes } from '@angular/router';

/**
 * Defines the main routes for the application.
 */
export const routes: Routes = [
  {
    path: 'demo',
    loadChildren: () => import('./pages/public').then((m) => m.PUBLIC_ROUTES),
  },
  {
    path: 'mermaid',
    loadComponent: () => import('./pages/mermaid-editor/mermaid-editor.component').then((m) => m.MermaidEditorComponent),
  },
  {
    path: '',
    // component: NavComponent,            // top navbar
    children: [
      {
        path: 'delve',
        // canActivate: [authGuard],       // Uncomment to protect the 'delve' section with authentication
        children: [
          {
            path: '',                      // List of files in WebDAV
            loadComponent: () => import('./pages/webdav-resources').then((m) => m.WebdavResourcesComponent),
            title: 'Delve Resources'
          },
          {
            path: ':filename',             // Specific file within WebDAV
            children: [
              {
                path: ':mode',
                // loadComponent: () => import('./pages/delve').then((m) => m.DelveComponent),
                // experimening with a more modular, Angular way. pluggins not working
                loadComponent: () => import('./pages/reveal-editor/reveal-editor.component').then((m) => m.RevealEditorComponent),
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
