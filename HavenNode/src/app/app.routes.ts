import { Routes } from '@angular/router';
import { HomeComponent } from '../pages/home/home'; // ✅ Changed 'Home' to 'HomeComponent'
import { DashboardComponent } from '../pages/dashboard/dashboard';
import { NotFoundComponent } from '../pages/not-found/not-found'; // ✅ Match class name
import { About } from '../pages/about/about';
import { Login } from '../pages/login/login'; 
import { Register } from '../pages/register/register';
import { Contact } from '../pages/contact/contact';


export const routes: Routes = [
    {path: 'about', component: About}
];
