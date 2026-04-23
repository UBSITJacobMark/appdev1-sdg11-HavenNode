import { Routes } from '@angular/router';
import { HomeComponent } from '../pages/home/home.component';
import { DashboardComponent } from '../pages/dashboard/dashboard.component';
import { AboutComponent } from '../pages/about/about.component';
import { NodeDetailComponent } from '../pages/node-detail/node-detail.component';
import { NotFoundComponent } from '../pages/not-found/not-found.component';
import { PrecipitationComponent } from '../pages/hazards/precipitation/precipitation.component';
import { TemperatureComponent } from '../pages/hazards/temperature/temperature.component';
import { WindComponent } from '../pages/hazards/wind/wind.component';
import { HumidityComponent } from '../pages/hazards/humidity/humidity.component';
import { FloodComponent } from '../pages/hazards/flood/flood.component';

export const routes: Routes = [
  // 1. Default Route (Landing Page)
  {
    path: '',
    loadComponent: () => import('../pages/home/home.component').then(m => m.HomeComponent),
    title: 'HavenNode | Benguet DRRM'
  },
  
  // 2. The Command Center (The map and telemetry we just built)
  {
    path: 'dashboard',
    loadComponent: () => import('../pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'HavenNode | Command Center'
  },

  // 3. Project Background & SDG Information
  {
    path: 'about',
    loadComponent: () => import('../pages/about/about.component').then(m => m.AboutComponent),
    title: 'HavenNode | About SDG 11'
  },

  // 4. Dynamic Route (For clicking on a specific hazard node/sensor)
  {
    path: 'node/:id', 
    loadComponent: () => import('../pages/node-detail/node-detail.component').then(m => m.NodeDetailComponent),
    title: 'HavenNode | Node Detail'
  },

  // 5. Fallback Route (404 Page)
  // MUST be at the very bottom of the array!
  {
    path: 'hazards/precipitation',
    loadComponent: () => import('../pages/hazards/precipitation/precipitation.component').then(m => m.PrecipitationComponent),
    title: 'HavenNode | Precipitation Hazard'
  },
  {
    path: 'hazards/temperature',
    loadComponent: () => import('../pages/hazards/temperature/temperature.component').then(m => m.TemperatureComponent),
    title: 'HavenNode | Temperature Hazard'
  },
  {
    path: 'hazards/wind',
    loadComponent: () => import('../pages/hazards/wind/wind.component').then(m => m.WindComponent),
    title: 'HavenNode | Wind Hazard'
  },
  {
    path: 'hazards/humidity',
    loadComponent: () => import('../pages/hazards/humidity/humidity.component').then(m => m.HumidityComponent),
    title: 'HavenNode | Humidity Hazard'
  },
  {
    path: 'hazards/flood',
    loadComponent: () => import('../pages/hazards/flood/flood.component').then(m => m.FloodComponent),
    title: 'HavenNode | Flood Hazard'
  }
  ,{
    path: '**', 
    loadComponent: () => import('../pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'HavenNode | Page Not Found'
  },
];