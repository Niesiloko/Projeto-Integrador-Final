import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
    email = '';
  senha = '';

  constructor(private router: Router) {}

  fazerLogin() {
    if (!this.email || !this.senha) {
      alert('Preencha e-mail e senha.');
      return;
    }
    // Simulação (ainda sem back-end)
    this.router.navigate(['/eventos/meus-eventos']);
  }
}
