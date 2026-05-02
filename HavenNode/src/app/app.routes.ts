import { Routes } from '@angular/router';

export const routes: Routes = [
    // 1. Home Page (Root)
    {
        path: '',
        loadComponent: () => import('../pages/home/home').then(m => m.HomeComponent),
        title: 'HavenNode | Benguet DRRM'
    },
    
    // 2. Command Center (Map)
    {
        path: 'dashboard',
        loadComponent: () => import('../pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'HavenNode | Command Center'
    },
    
    // 3. About Page
    {
        path: 'about',
        loadComponent: () => import('../pages/about/about').then(m => m.About),
        title: 'HavenNode | About SDG 11'
    }, 

    // 4. Login Page (ADDED THIS)
    {
        path: 'login',
        loadComponent: () => import('../pages/login/login').then(m => m.Login),
        title: 'HavenNode | Sign In'
    },

    // 5. Register Page (ADDED THIS)
    {
        path: 'register',
        loadComponent: () => import('../pages/register/register').then(m => m.Register),
        title: 'HavenNode | Join Us'
    },

    // 6. Contact Page (ADDED THIS)
    {
        path: 'contact',
        loadComponent: () => import('../pages/contact/contact').then(m => m.Contact),
        title: 'HavenNode | Contact'
    },

    // 7. Wildcard (Catch-all for 404s)
    {
        path: '**', 
        loadComponent: () => import('../pages/not-found/not-found.component').then(m => m.NotFoundComponent),
        title: 'HavenNode | Page Not Found'
    }
];