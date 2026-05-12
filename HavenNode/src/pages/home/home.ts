import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Navbar], // Use the correct component name
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent { }