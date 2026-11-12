import { Injectable } from '@angular/core';
import { Usuario } from './auth.service';
import { Evento } from './navbar/evento.model';
import { Ingresso, StatusIngresso } from './navbar/ingresso.model';
import { CategoriaService } from './navbar/categoria.service';

// Dados de demonstração: quem abre o site publicado pela primeira vez já encontra
// contas de teste, eventos e ingressos, em vez de telas vazias.
@Injectable({ providedIn: 'root' })
export class DemoService {
  private chaves = ['usuarios', 'eventos', 'ingressos', 'categorias', 'sessao'];

  // contas de teste (mostradas na tela de login e no LEIA-ME); senhas só de demonstração
  static readonly contas = [
    { perfil: 'Organizador', email: 'organizador@conectaevent.com', senha: 'organizador123' },
    { perfil: 'Participante', email: 'participante@conectaevent.com', senha: 'participante123' }
  ];

  constructor(private categoriaService: CategoriaService) {}

  // só carrega se o navegador ainda não tem nenhum dado do sistema
  carregarSeVazio() {
    const vazio = this.chaves.every(c => localStorage.getItem(c) === null);
    if (vazio) {
      this.carregar();
    }
  }

  // apaga tudo e carrega a demonstração de novo (botão no Dashboard)
  restaurar() {
    this.chaves.forEach(c => localStorage.removeItem(c));
    this.carregar();
  }

  private carregar() {
    const usuarios: Usuario[] = [
      { nome: 'Ana Souza', email: 'organizador@conectaevent.com', senha: 'organizador123' },
      { nome: 'Carla Mendes', email: 'participante@conectaevent.com', senha: 'participante123' },
      { nome: 'Diego Ramos', email: 'diego@email.com', senha: 'demo123' },
      { nome: 'Elisa Prado', email: 'elisa@email.com', senha: 'demo123' }
    ];

    const cat = (nome: string) => this.categoriaService.obterOuCriar(nome).id;
    const org = 'organizador@conectaevent.com';

    // datas relativas a hoje, para a demonstração funcionar em qualquer dia
    const eventos: Evento[] = [
      { id: 1, titulo: 'Festival de Rock Ourinhos', categoriaId: cat('Música'), data: this.daquiA(30, 20),
        local: 'Parque de Exposições - Ourinhos/SP', valor: 80, organizadorEmail: org,
        descricao: 'Bandas da região em uma noite inteira de rock.' },
      { id: 2, titulo: 'Hackathon UniFIO', categoriaId: cat('Tecnologia'), data: this.daquiA(20, 9),
        local: 'UniFIO - Ourinhos/SP', valor: 25, organizadorEmail: org,
        descricao: '24 horas de desenvolvimento em equipe, com mentoria e premiação.' },
      // acontece em 1 dia: demonstra a regra de reembolso só até 48 horas antes
      { id: 3, titulo: 'Corrida Noturna 5K', categoriaId: cat('Esportes'), data: this.daquiA(1),
        local: 'Avenida Jacinto Sá - Ourinhos/SP', valor: 40, organizadorEmail: org,
        descricao: 'Corrida de rua com percurso iluminado. Kit atleta incluso.' },
      { id: 4, titulo: 'Workshop de Angular', categoriaId: cat('Workshops'), data: this.daquiA(10, 19),
        local: 'Laboratório 3 - UniFIO', valor: 50, organizadorEmail: org,
        descricao: 'Oficina prática de Angular com Angular Material.' },
      { id: 5, titulo: 'Noite de Stand-up', categoriaId: cat('Teatro'), data: this.daquiA(15, 21),
        local: 'Teatro Municipal - Ourinhos/SP', valor: 35, organizadorEmail: org,
        descricao: 'Comediantes da região em uma noite de humor.' },
      // já aconteceu: os ingressos aparecem como utilizados
      { id: 6, titulo: 'Meetup de Spring Boot', categoriaId: cat('Tecnologia'), data: this.daquiA(-5, 19),
        local: 'Auditório - UniFIO', valor: 0, organizadorEmail: org,
        descricao: 'Encontro gratuito sobre APIs REST com Spring Boot.' }
    ];

    const venda = (id: number, eventoId: number, titular: string, email: string, status: StatusIngresso): Ingresso => {
      const ev = eventos.find(e => e.id === eventoId)!;
      return {
        id, codigo: `CE-${eventoId}-${id}`, eventoId, eventoNome: ev.titulo, data: ev.data, local: ev.local,
        titular, valor: ev.valor, status, compradorEmail: email
      };
    };

    const ingressos: Ingresso[] = [
      venda(101, 1, 'Carla Mendes', 'participante@conectaevent.com', 'CONFIRMADO'),
      venda(102, 3, 'Carla Mendes', 'participante@conectaevent.com', 'CONFIRMADO'),
      venda(103, 2, 'Carla Mendes', 'participante@conectaevent.com', 'REEMBOLSO_SOLICITADO'),
      venda(104, 6, 'Carla Mendes', 'participante@conectaevent.com', 'UTILIZADO'),
      venda(105, 1, 'Diego Ramos', 'diego@email.com', 'CONFIRMADO'),
      venda(106, 4, 'Diego Ramos', 'diego@email.com', 'CONFIRMADO'),
      venda(107, 5, 'Diego Ramos', 'diego@email.com', 'REEMBOLSADO'),
      venda(108, 1, 'Elisa Prado', 'elisa@email.com', 'CONFIRMADO'),
      venda(109, 4, 'Elisa Prado', 'elisa@email.com', 'CONFIRMADO'),
      venda(110, 6, 'Elisa Prado', 'elisa@email.com', 'UTILIZADO'),
      venda(111, 2, 'Elisa Prado', 'elisa@email.com', 'CONFIRMADO')
    ];

    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('eventos', JSON.stringify(eventos));
    localStorage.setItem('ingressos', JSON.stringify(ingressos));
  }

  // data no formato do campo datetime-local (aaaa-mm-ddThh:mm), no horário do navegador;
  // sem hora informada, usa o horário atual (exatamente N dias a partir de agora)
  private daquiA(dias: number, hora?: number): string {
    const d = new Date(Date.now() + dias * 86400000);
    if (hora !== undefined) {
      d.setHours(hora, 0, 0, 0);
    }
    const doisDigitos = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}` +
      `T${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
  }
}
