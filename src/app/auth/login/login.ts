import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  email = '';
  senha = '';

  constructor(private router: Router, private auth: AuthService) {}

  fazerLogin() {
    if (!this.email || !this.senha) {
      alert('Preencha e-mail e senha.');
      return;
    }
    if (!this.auth.login(this.email, this.senha)) {
      alert('E-mail ou senha incorretos.');
      return;
    }
    this.router.navigate(['/']);
  }
}