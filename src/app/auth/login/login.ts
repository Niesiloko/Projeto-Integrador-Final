import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/auth.service';
import { DemoService } from '../../shared/demo.service';

@Component({
  selector: 'app-login',
  standalone: false,
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  email = '';
  senha = '';
  erro = '';

  // contas de demonstração, mostradas abaixo do formulário
  contasTeste = DemoService.contas;

  constructor(private router: Router, private auth: AuthService) {}

  usarConta(conta: { email: string; senha: string }) {
    this.email = conta.email;
    this.senha = conta.senha;
    this.erro = '';
  }

  fazerLogin() {
    if (!this.email || !this.senha) {
      this.erro = 'Preencha e-mail e senha.';
      return;
    }
    if (!this.auth.login(this.email, this.senha)) {
      this.erro = 'E-mail ou senha incorretos.';
      return;
    }
    this.router.navigate(['/']);
  }
}