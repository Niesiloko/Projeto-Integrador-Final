import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, Perfil } from '../../shared/auth.service';
import { mensagemDeErro } from '../../shared/api';

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
  perfil: Perfil = 'PARTICIPANTE';
  erro = '';
  salvando = false;

  constructor(private router: Router, private auth: AuthService, private cdr: ChangeDetectorRef) {}

  cadastrar() {
    if (!this.nome || !this.email || !this.senha) {
      this.erro = 'Preencha todos os campos.';
      return;
    }
    this.salvando = true;
    this.erro = '';

    // cria a conta na API e já entra com ela
    this.auth.cadastrar(this.nome, this.email, this.senha, this.perfil).subscribe({
      next: () => {
        this.auth.login(this.email, this.senha).subscribe({
          next: usuario => this.router.navigate([usuario.perfil === 'ORGANIZADOR' ? '/eventos/dashboard' : '/']),
          error: () => this.router.navigate(['/login'])
        });
      },
      error: erro => {
        // ex.: 409 "Já existe um usuário com o e-mail..." ou 400 com a regra do campo
        this.salvando = false;
        this.erro = mensagemDeErro(erro);
        this.cdr.markForCheck();
      }
    });
  }
}
