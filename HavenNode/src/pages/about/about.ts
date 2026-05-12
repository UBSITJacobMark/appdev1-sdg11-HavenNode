import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink,Navbar],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {}
