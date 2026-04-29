import { Routes } from '@angular/router';
import { HomeComponent } from '../pages/home/home'; // ✅ Changed 'Home' to 'HomeComponent'
import { DashboardComponent } from '../pages/dashboard/dashboard.component';
import { NotFoundComponent } from '../pages/not-found/not-found.component'; // ✅ Match class name
import { About } from '../pages/about/about';
import { Login } from '../pages/login/login'; 
import { Register } from '../pages/register/register';
import { Contact } from '../pages/contact/contact';


export const routes: Routes = [
    {path: 'about', component: About},
    {
        path: '',
        loadComponent: () => import('../pages/home/home').then(m => m.HomeComponent),
        title: 'HavenNode | Benguet DRRM'
    },
    {
        path: 'dashboard',
        loadComponent: () => import('../pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'HavenNode | Command Center'
    },
    {
        path: 'about',
        loadComponent: () => import('../pages/about/about').then(m => m.About),
        title: 'HavenNode | About SDG 11'
    },  
    {
    path: '**', 
    loadComponent: () => import('../pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'HavenNode | Page Not Found'
    }
];
