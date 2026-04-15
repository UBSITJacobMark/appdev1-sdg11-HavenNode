import { Routes } from '@angular/router';
import { Home } from '../pages/home/home';
import { DashboardComponent } from '../pages/dashboard/dashboard';
import { NodeDetail } from '../pages/node-detail/node-detail';
import { NotFound } from '../pages/not-found/not-found';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'dashboard', component: DashboardComponent},
    { path: 'dashboard/:id', component: NodeDetail },
    { path: '**', component: NotFound }
  ];