import { ChangeDetectorRef, Component } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Evento } from '../../shared/navbar/evento.model';
import { Ingresso } from '../../shared/navbar/ingresso.model';
import { EventoService } from '../../shared/navbar/evento.service';
import { IngressoService } from '../../shared/navbar/ingresso.service';
import { AuthService } from '../../shared/auth.service';
import { mensagemDeErro } from '../../shared/api';

interface Barra {
  nome: string;
  valor: number;
  detalhe: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  carregando = true;
  erro = '';

  // indicadores (KPIs), calculados dos eventos do organizador e dos ingressos deles
  eventosPublicados = 0;
  eventosProximos = 0;
  eventosRealizados = 0;
  ingressosVendidos = 0;
  receitaTotal = 0;
  ticketMedio = 0;
  reembolsosPendentes = 0;
  taxaReembolso = 0;

  receitaPorEvento: Barra[] = [];
  vendasPorCategoria: Barra[] = [];

  constructor(
    private eventoService: EventoService,
    private ingressoService: IngressoService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    const usuario = this.auth.usuarioLogado;
    if (!usuario) {
      return;
    }
    forkJoin({
      eventos: this.eventoService.listarDoOrganizador(usuario.id),
      ingressos: this.ingressoService.listar()
    }).subscribe({
      next: ({ eventos, ingressos }) => this.calcular(eventos, ingressos),
      error: erro => this.erro = mensagemDeErro(erro)
    }).add(() => {
      this.carregando = false;
      this.cdr.markForCheck();
    });
  }

  private calcular(eventos: Evento[], todos: Ingresso[]) {
    const agora = Date.now();
    const ids = new Set(eventos.map(e => e.id));
    const ingressos = todos.filter(i => ids.has(i.eventoId));

    // venda = ingresso que não foi devolvido (reembolsado)
    const vendidos = ingressos.filter(i => i.status !== 'REEMBOLSADO');
    const devolvidosOuPedidos = ingressos.filter(
      i => i.status === 'REEMBOLSADO' || i.status === 'REEMBOLSO_SOLICITADO'
    );

    this.eventosPublicados = eventos.length;
    this.eventosProximos = eventos.filter(e => new Date(e.data).getTime() > agora).length;
    this.eventosRealizados = this.eventosPublicados - this.eventosProximos;
    this.ingressosVendidos = vendidos.length;
    this.receitaTotal = vendidos.reduce((soma, i) => soma + i.valor, 0);
    this.ticketMedio = vendidos.length ? this.receitaTotal / vendidos.length : 0;
    this.reembolsosPendentes = ingressos.filter(i => i.status === 'REEMBOLSO_SOLICITADO').length;
    this.taxaReembolso = ingressos.length ? devolvidosOuPedidos.length / ingressos.length : 0;

    this.receitaPorEvento = eventos
      .map(e => {
        const doEvento = vendidos.filter(i => i.eventoId === e.id);
        return {
          nome: e.titulo,
          valor: doEvento.reduce((soma, i) => soma + i.valor, 0),
          detalhe: `${doEvento.length} ${doEvento.length === 1 ? 'ingresso' : 'ingressos'}`
        };
      })
      .sort((a, b) => b.valor - a.valor);

    const porCategoria = new Map<string, number>();
    for (const i of vendidos) {
      const categoria = eventos.find(e => e.id === i.eventoId)!.categoriaNome;
      porCategoria.set(categoria, (porCategoria.get(categoria) ?? 0) + 1);
    }
    this.vendasPorCategoria = [...porCategoria.entries()]
      .map(([nome, qtd]) => ({
        nome,
        valor: qtd,
        detalhe: `${qtd} ${qtd === 1 ? 'ingresso' : 'ingressos'}`
      }))
      .sort((a, b) => b.valor - a.valor);
  }

  // largura da barra em %, relativa ao maior valor da lista
  largura(barra: Barra, lista: Barra[]): number {
    const maior = Math.max(...lista.map(b => b.valor));
    return maior > 0 ? (barra.valor / maior) * 100 : 0;
  }
}
