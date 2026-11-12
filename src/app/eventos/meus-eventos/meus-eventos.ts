import { Component } from '@angular/core';
import { Evento } from '../../shared/navbar/evento.model';
import { EventoService } from '../../shared/navbar/evento.service';
import { Ingresso } from '../../shared/navbar/ingresso.model';
import { IngressoService } from '../../shared/navbar/ingresso.service';
import { CategoriaService } from '../../shared/navbar/categoria.service';
import { AuthService } from '../../shared/auth.service';

interface ResumoVendas {
  vendidos: number;
  receita: number;
  pendentes: Ingresso[];
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

  // confirmações e avisos aparecem no próprio cartão do evento
  confirmandoExclusao?: number;
  confirmandoReembolso?: number;
  avisos: Record<number, string> = {};

  constructor(
    private eventoService: EventoService,
    private ingressoService: IngressoService,
    public categoriaService: CategoriaService,
    private auth: AuthService
  ) {
    this.carregar();
  }

  carregar() {
    const usuario = this.auth.usuarioLogado;
    this.meusEventos = usuario ? this.eventoService.listarDoOrganizador(usuario.email) : [];

    const todos = this.ingressoService.listar();
    this.resumos = {};
    this.receitaTotal = 0;

    for (const ev of this.meusEventos) {
      // ingressos reembolsados não contam como venda
      const ativos = todos.filter(i => i.eventoId === ev.id && i.status !== 'REEMBOLSADO');
      const receita = ativos.reduce((soma, i) => soma + i.valor, 0);

      this.resumos[ev.id] = {
        vendidos: ativos.length,
        receita,
        pendentes: todos.filter(i => i.eventoId === ev.id && i.status === 'REEMBOLSO_SOLICITADO')
      };
      this.receitaTotal += receita;
    }
  }

  //depois de aprovado, o ingresso e o QR Code deixam de valer
  // clique em "Sim, aprovar"
  aprovar(ingresso: Ingresso) {
    this.confirmandoReembolso = undefined;
    this.ingressoService.aprovarReembolso(ingresso.id);
    this.carregar();
  }

  // primeiro clique em Excluir: confere a regra e pede confirmação no cartão
  pedirExclusao(id: number) {
    // evento com ingressos ativos não pode sumir: os compradores perderiam o ingresso
    if (this.ingressoService.temIngressosAtivos(id)) {
      this.avisos[id] = 'Este evento tem ingressos ativos (confirmados, com reembolso em análise ou utilizados) e não pode ser excluído.';
      return;
    }
    delete this.avisos[id];
    this.confirmandoExclusao = id;
  }

  // clique em "Sim, excluir"
  excluir(id: number) {
    this.confirmandoExclusao = undefined;
    this.eventoService.excluir(id);
    this.carregar();
  }
}