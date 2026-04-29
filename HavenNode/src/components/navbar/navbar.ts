import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm z-index-header">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold tracking-widest text-uppercase" routerLink="/">HavenNode</a>
    
        <div class="navbar-nav ms-auto flex-row gap-3">
          <a class="nav-link fw-bold" routerLink="/dashboard" routerLinkActive="active">Map</a>
          <a class="nav-link fw-bold" routerLink="/about" routerLinkActive="active">About</a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .tracking-widest { letter-spacing: 0.15em; }
    .z-index-header { z-index: 300; }
  `]
})
export class NavbarComponent {}