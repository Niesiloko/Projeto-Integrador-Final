import { Component } from '@angular/core';
import { EventoService } from '../../shared/navbar/evento.service';
import { IngressoService } from '../../shared/navbar/ingresso.service';
import { CategoriaService } from '../../shared/navbar/categoria.service';
import { AuthService } from '../../shared/auth.service';
import { DemoService } from '../../shared/demo.service';

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
  logado = false;

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

  confirmandoRestauracao = false;

  constructor(
    private eventoService: EventoService,
    private ingressoService: IngressoService,
    private categoriaService: CategoriaService,
    private auth: AuthService,
    private demo: DemoService
  ) {
    this.calcular();
  }

  calcular() {
    const usuario = this.auth.usuarioLogado;
    this.logado = !!usuario;
    if (!usuario) {
      return;
    }

    const agora = Date.now();
    const eventos = this.eventoService.listarDoOrganizador(usuario.email);
    const ids = new Set(eventos.map(e => e.id));
    const ingressos = this.ingressoService.listar().filter(i => ids.has(i.eventoId));

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

    const porCategoria = new Map<number, number>();
    for (const i of vendidos) {
      const categoriaId = eventos.find(e => e.id === i.eventoId)!.categoriaId;
      porCategoria.set(categoriaId, (porCategoria.get(categoriaId) ?? 0) + 1);
    }
    this.vendasPorCategoria = [...porCategoria.entries()]
      .map(([id, qtd]) => ({
        nome: this.categoriaService.nome(id),
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

  restaurarDemonstracao() {
    this.confirmandoRestauracao = false;
    this.demo.restaurar();
    // a sessão foi apagada: entra de novo como o organizador da demonstração
    const conta = DemoService.contas[0];
    this.auth.login(conta.email, conta.senha);
    this.calcular();
  }
}
