import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { Evento } from '../../shared/navbar/evento.model';
import { Ingresso } from '../../shared/navbar/ingresso.model';
import { EventoService } from '../../shared/navbar/evento.service';
import { IngressoService } from '../../shared/navbar/ingresso.service';
import { AuthService } from '../../shared/auth.service';
import { mensagemDeErro } from '../../shared/api';

@Component({
  selector: 'app-detalhe-evento',
  standalone: false,
  templateUrl: './detalhe-evento.html',
  styleUrl: './detalhe-evento.scss'
})
export class DetalheEvento {

  evento?: Evento;
  carregando = true;
  comprando = false;
  erro = '';

  jaComprado = false;
  encerrado = false;
  bloqueado = false;
  esgotado = false;
  vagasRestantes = 0;

  private id: number;

  constructor(
    route: ActivatedRoute,
    private router: Router,
    private eventoService: EventoService,
    public ingressoService: IngressoService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.id = Number(route.snapshot.paramMap.get('id'));
    this.carregar();
  }

  // busca o evento, as vagas e (se for participante) os próprios ingressos, tudo ao mesmo tempo
  private carregar() {
    const usuario = this.auth.usuarioLogado;
    forkJoin({
      evento: this.eventoService.buscarPorId(this.id),
      vagas: this.eventoService.vagas(this.id),
      meus: this.auth.ehParticipante && usuario
        ? this.ingressoService.listarDoUsuario(usuario.id)
        : of([] as Ingresso[])
    }).subscribe({
      next: ({ evento, vagas, meus }) => {
        this.evento = evento;
        this.encerrado = new Date(evento.data).getTime() <= Date.now();
        this.vagasRestantes = vagas.disponiveis;
        this.esgotado = vagas.esgotado;
        this.jaComprado = this.ingressoService.jaComprou(meus, evento.id);
        this.bloqueado = !this.jaComprado && this.ingressoService.compraBloqueada(meus, evento.id);
      },
      error: erro => {
        // 404: o evento não existe; a tela mostra "Evento não encontrado"
        this.evento = undefined;
        if (erro.status !== 404) {
          this.erro = mensagemDeErro(erro);
        }
      }
    }).add(() => {
      this.carregando = false;
      this.comprando = false;
      this.cdr.markForCheck();
    });
  }

  comprar() {
    if (!this.evento || this.encerrado || this.bloqueado || this.esgotado) {
      return;
    }
    const usuario = this.auth.usuarioLogado;
    if (!usuario) {
      // manda para o login; a tela de login mostra as contas de teste
      this.router.navigate(['/login']);
      return;
    }
    this.comprando = true;
    this.erro = '';
    this.ingressoService.comprar(this.evento.id, usuario.id, usuario.nome).subscribe({
      // comprou: recarrega para atualizar vagas e mostrar "Ingresso comprado"
      next: () => this.carregar(),
      // a API confere as regras de novo (esgotou agora, limite de reembolsos...) e explica o motivo
      error: erro => {
        this.erro = mensagemDeErro(erro);
        this.carregar();
      }
    });
  }
}
