import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-cadastro',
  standalone: false,
  styleUrl: './cadastro.scss',
  templateUrl: './cadastro.html',
})
export class Cadastro {
  nome = '';
  email = '';
  senha = '';

  constructor(private router: Router, private auth: AuthService) {}

  cadastrar() {
    if (!this.nome || !this.email || !this.senha) {
      alert('Preencha todos os campos.');
      return;
    }
    const resultado = this.auth.cadastrar(this.nome, this.email, this.senha);
    alert(resultado.mensagem);
    if (resultado.ok) {
      this.router.navigate(['/login']);
    }
  }
}