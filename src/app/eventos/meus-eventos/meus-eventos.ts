import { ChangeDetectorRef, Component } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Evento } from '../../shared/navbar/evento.model';
import { EventoService } from '../../shared/navbar/evento.service';
import { Ingresso, Reembolso } from '../../shared/navbar/ingresso.model';
import { IngressoService } from '../../shared/navbar/ingresso.service';
import { AuthService } from '../../shared/auth.service';
import { mensagemDeErro } from '../../shared/api';

interface ResumoVendas {
  vendidos: number;
  receita: number;
  emitidos: number;          // todos os ingressos do evento, inclusive reembolsados
  pendentes: Reembolso[];
}

@Component({
  selector: 'app-meus-eventos',
  standalone: false,
  styleUrl: './meus-eventos.scss',
  templateUrl: './meus-eventos.html',
})
export class MeusEventos {

  meusEventos: Evento[] = [];
  resumos: Record<number, ResumoVendas> = {};
  receitaTotal = 0;
  carregando = true;
  erro = '';

  // confirmações e avisos aparecem no próprio cartão do evento
  confirmandoExclusao?: number;
  confirmandoReembolso?: { id: number; acao: 'aprovar' | 'recusar' };
  avisos: Record<number, string> = {};

  constructor(
    private eventoService: EventoService,
    private ingressoService: IngressoService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.carregar();
  }

  carregar() {
    const usuario = this.auth.usuarioLogado;
    if (!usuario) {
      return;
    }
    // forkJoin: dispara as três consultas juntas e espera todas responderem
    forkJoin({
      eventos: this.eventoService.listarDoOrganizador(usuario.id),
      ingressos: this.ingressoService.listar(),
      pendentes: this.ingressoService.reembolsosPendentes(usuario.id)
    }).subscribe({
      next: ({ eventos, ingressos, pendentes }) => this.montarResumos(eventos, ingressos, pendentes),
      error: erro => this.erro = mensagemDeErro(erro)
    }).add(() => {
      this.carregando = false;
      this.cdr.markForCheck();
    });
  }

  private montarResumos(eventos: Evento[], todos: Ingresso[], pendentes: Reembolso[]) {
    this.meusEventos = eventos;
    this.resumos = {};
    this.receitaTotal = 0;
    this.erro = '';

    for (const ev of eventos) {
      // ingressos reembolsados não contam como venda
      const doEvento = todos.filter(i => i.eventoId === ev.id);
      const ativos = doEvento.filter(i => i.status !== 'REEMBOLSADO');
      const receita = ativos.reduce((soma, i) => soma + i.valor, 0);

      this.resumos[ev.id] = {
        vendidos: ativos.length,
        receita,
        emitidos: doEvento.length,
        pendentes: pendentes.filter(r => r.ingresso.eventoId === ev.id)
      };
      this.receitaTotal += receita;
    }
  }

  // clique em "Sim, aprovar" ou "Sim, recusar"
  // aprovado: o ingresso e o QR Code deixam de valer; recusado: o ingresso volta a valer
  decidir(reembolso: Reembolso) {
    const pedido = this.confirmandoReembolso?.acao === 'aprovar'
      ? this.ingressoService.aprovarReembolso(reembolso.id)
      : this.ingressoService.recusarReembolso(reembolso.id);

    this.confirmandoReembolso = undefined;
    pedido.subscribe({
      next: () => this.carregar(),
      error: erro => {
        this.avisos[reembolso.ingresso.eventoId] = mensagemDeErro(erro);
        this.carregar();
      }
    });
  }

  // primeiro clique em Excluir: confere a regra e pede confirmação no cartão
  pedirExclusao(id: number) {
    // mesma regra da API: evento com ingressos vendidos não pode ser apagado (perderia o histórico)
    if ((this.resumos[id]?.emitidos ?? 0) > 0) {
      this.avisos[id] = 'Este evento já possui ingressos vendidos e não pode ser excluído.';
      return;
    }
    delete this.avisos[id];
    this.confirmandoExclusao = id;
  }

  // clique em "Sim, excluir"
  excluir(id: number) {
    this.confirmandoExclusao = undefined;
    this.eventoService.excluir(id).subscribe({
      next: () => this.carregar(),
      error: erro => {
        this.avisos[id] = mensagemDeErro(erro);
        this.cdr.markForCheck();
      }
    });
  }
}
