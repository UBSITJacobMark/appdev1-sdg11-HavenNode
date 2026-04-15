import { Routes } from '@angular/router';
import { HomeComponent } from '../pages/home/home'; // ✅ Changed 'Home' to 'HomeComponent'
import { DashboardComponent } from '../pages/dashboard/dashboard';
import { NodeDetailComponent } from '../pages/node-detail/node-detail'; // ✅ Match class name
import { NotFoundComponent } from '../pages/not-found/not-found'; // ✅ Match class name

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'dashboard/:id', component: NodeDetailComponent }, // ✅ Required URL parameter [cite: 49]
    { path: '**', component: NotFoundComponent } // ✅ Required wildcard route [cite: 50]
  ];