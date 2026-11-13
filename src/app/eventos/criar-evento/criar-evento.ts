import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EventoService } from '../../shared/navbar/evento.service';
import { Categoria } from '../../shared/navbar/categoria.model';
import { CategoriaService } from '../../shared/navbar/categoria.service';
import { AuthService } from '../../shared/auth.service';
import { mensagemDeErro } from '../../shared/api';

@Component({
  selector: 'app-criar-evento',
  standalone: false,
  styleUrl: './criar-evento.scss',
  templateUrl: './criar-evento.html',
})
export class CriarEvento {

  // a mesma tela serve para criar (/criar-evento) e editar (/editar-evento/:id)
  idEdicao?: number;
  categorias: Categoria[] = [];
  vendidos = 0;
  erro = '';
  salvando = false;

  evento = {
    titulo: '',
    categoriaId: null as number | null,
    data: '',
    local: '',
    descricao: '',
    valor: 0,
    capacidade: 100,
    imagem: ''
  };

  constructor(
    route: ActivatedRoute,
    private router: Router,
    private eventoService: EventoService,
    categoriaService: CategoriaService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    categoriaService.listar().subscribe({
      next: categorias => {
        this.categorias = categorias;
        this.cdr.markForCheck();
      },
      error: erro => this.mostrarErro(erro)
    });

    const id = route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarParaEdicao(Number(id));
    }
  }

  private carregarParaEdicao(id: number) {
    forkJoin({ existente: this.eventoService.buscarPorId(id), vagas: this.eventoService.vagas(id) }).subscribe({
      next: ({ existente, vagas }) => {
        if (existente.organizadorId !== this.auth.usuarioLogado?.id) {
          alert('Você não é o organizador deste evento.');
          this.router.navigate(['/eventos/meus-eventos']);
          return;
        }
        this.idEdicao = id;
        this.vendidos = vagas.vendidos;
        this.evento = {
          titulo: existente.titulo,
          categoriaId: existente.categoriaId,
          data: existente.data,
          local: existente.local,
          descricao: existente.descricao,
          valor: existente.valor,
          capacidade: existente.capacidade,
          imagem: existente.imagem ?? ''
        };
        this.cdr.markForCheck();
      },
      error: () => {
        alert('Evento não encontrado.');
        this.router.navigate(['/eventos/meus-eventos']);
      }
    });
  }

  salvarEvento() {
    const usuario = this.auth.usuarioLogado;
    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }
    // conferências rápidas antes de chamar a API (ela valida tudo de novo e devolve 400/409 se precisar)
    if (!this.evento.titulo || !this.evento.categoriaId || !this.evento.data || !this.evento.local) {
      this.erro = 'Preencha título, categoria, data/horário e local.';
      return;
    }
    if (this.evento.valor < 0) {
      this.erro = 'O valor do ingresso não pode ser negativo.';
      return;
    }
    if (!Number.isInteger(this.evento.capacidade) || this.evento.capacidade < 1) {
      this.erro = 'A capacidade deve ser um número inteiro de pelo menos 1 pessoa.';
      return;
    }
    // regra: na edição, a capacidade não pode ficar menor que os ingressos já vendidos
    if (this.idEdicao && this.evento.capacidade < this.vendidos) {
      this.erro = `A capacidade não pode ser menor que os ${this.vendidos} ingressos já vendidos.`;
      return;
    }

    const dados = { ...this.evento, categoriaId: this.evento.categoriaId as number };
    const pedido = this.idEdicao
      ? this.eventoService.atualizar(this.idEdicao, dados, usuario.id)
      : this.eventoService.salvar(dados, usuario.id);

    this.salvando = true;
    this.erro = '';
    pedido.subscribe({
      next: () => this.router.navigate(['/eventos/meus-eventos']),
      error: erro => {
        this.salvando = false;
        this.mostrarErro(erro);
      }
    });
  }

  private mostrarErro(erro: unknown) {
    // ex.: 400 "A data do evento deve estar no futuro"
    this.erro = mensagemDeErro(erro);
    this.cdr.markForCheck();
  }
}
