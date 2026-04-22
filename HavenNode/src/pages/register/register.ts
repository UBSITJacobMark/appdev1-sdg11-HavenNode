import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  municipality = '';

  municipalities = [
    'Baguio City', 'La Trinidad', 'Itogon', 'Mankayan',
    'Tuba', 'Tublay', 'Kapangan', 'Kabayan', 'Atok',
    'Kibungan', 'Bakun', 'Bokod', 'Sablan', 'Buguias', 'Alilem'
  ];

  onRegister() {
    // logic later
    console.log('Register submitted:', this.name, this.email, this.municipality);
  }
}
