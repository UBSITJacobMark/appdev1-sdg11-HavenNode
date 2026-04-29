import { Routes } from '@angular/router';
import { HomeComponent } from '../pages/home/home'; // ✅ Changed 'Home' to 'HomeComponent'
import { DashboardComponent } from '../pages/dashboard/dashboard';
import { NodeDetailComponent } from '../pages/node-detail/node-detail'; // ✅ Match class name
import { NotFoundComponent } from '../pages/not-found/not-found'; // ✅ Match class name
import { About } from '../pages/about/about';
import { Login } from '../pages/login/login'; 
import { Register } from '../pages/register/register';
import { Contact } from '../pages/contact/contact';


export const routes: Routes = [
    {path: 'about', component: About},

    { path: '', component: HomeComponent },
    { path: 'login', component: Login }, 
    { path: 'register', component: Register},
    { path: 'contact', component: Contact },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'dashboard/:id', component: NodeDetailComponent }, // ✅ Required URL parameter [cite: 49]
    { path: '', component: HomeComponent },
    { path: '**', component: NotFoundComponent } // ✅ Required wildcard route [cite: 50]
    
  ];