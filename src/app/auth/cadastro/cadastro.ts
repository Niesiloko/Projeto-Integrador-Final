import { Component } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  cadastrar() {
    if (!this.nome || !this.email || !this.senha) {
      alert('Preencha todos os campos.');
      return;
    }
    alert('Cadastro realizado com sucesso!');
    this.router.navigate(['/login']);
  }
}
