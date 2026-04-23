import { Routes } from '@angular/router';

export const routes: Routes = [
  // 1. Default Route (Landing Page)
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'HavenNode | Benguet DRRM'
  },
  
  // 2. The Command Center (The map and telemetry we just built)
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'HavenNode | Command Center'
  },

  // 3. Project Background & SDG Information
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
    title: 'HavenNode | About SDG 11'
  },

  // 4. Dynamic Route (For clicking on a specific hazard node/sensor)
  {
    path: 'node/:id', 
    loadComponent: () => import('./pages/node-detail/node-detail.component').then(m => m.NodeDetailComponent),
    title: 'HavenNode | Node Detail'
  },

  // 5. Fallback Route (404 Page)
  // MUST be at the very bottom of the array!
  {
    path: '**', 
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'HavenNode | Page Not Found'
  }
];