import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/auth.service';
import { mensagemDeErro } from '../../shared/api';

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
  entrando = false;

  // contas do banco de demonstração, mostradas abaixo do formulário
  contasTeste = AuthService.contasTeste;

  constructor(private router: Router, private auth: AuthService, private cdr: ChangeDetectorRef) {}

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
    this.entrando = true;
    this.erro = '';

    // a resposta chega depois: o subscribe diz o que fazer em caso de sucesso (next) ou de erro (error)
    this.auth.login(this.email, this.senha).subscribe({
      next: usuario => {
        // cada perfil começa pela sua tela principal
        this.router.navigate([usuario.perfil === 'ORGANIZADOR' ? '/eventos/dashboard' : '/']);
      },
      error: erro => {
        this.entrando = false;
        this.erro = erro.status === 401 ? 'E-mail ou senha incorretos.' : mensagemDeErro(erro);
        // sem zone.js, o Angular precisa ser avisado de que a tela mudou depois de uma resposta HTTP
        this.cdr.markForCheck();
      }
    });
  }
}
