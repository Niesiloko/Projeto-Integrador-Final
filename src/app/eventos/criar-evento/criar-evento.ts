import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService } from '../../shared/navbar/evento.service';
import { IngressoService } from '../../shared/navbar/ingresso.service';
import { Categoria } from '../../shared/navbar/categoria.model';
import { CategoriaService } from '../../shared/navbar/categoria.service';
import { AuthService } from '../../shared/auth.service';

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

  evento = {
    titulo: '',
    categoriaId: null as number | null,
    data: '',
    local: '',
    descricao: '',
    valor: 0,
    imagem: ''
  };

  constructor(
    route: ActivatedRoute,
    private router: Router,
    private eventoService: EventoService,
    private ingressoService: IngressoService,
    categoriaService: CategoriaService,
    private auth: AuthService
  ) {
    this.categorias = categoriaService.listar();

    const id = route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarParaEdicao(Number(id));
    }
  }

  private carregarParaEdicao(id: number) {
    const existente = this.eventoService.buscarPorId(id);
    const usuario = this.auth.usuarioLogado;

    if (!existente || !usuario || existente.organizadorEmail !== usuario.email) {
      alert('Evento não encontrado ou você não é o organizador dele.');
      this.router.navigate(['/eventos/meus-eventos']);
      return;
    }

    this.idEdicao = id;
    this.evento = {
      titulo: existente.titulo,
      categoriaId: existente.categoriaId,
      data: existente.data,
      local: existente.local,
      descricao: existente.descricao,
      valor: existente.valor,
      imagem: existente.imagem ?? ''
    };
  }

  salvarEvento() {
    const usuario = this.auth.usuarioLogado;
    if (!usuario) {
      alert('Faça login para publicar um evento.');
      this.router.navigate(['/login']);
      return;
    }
    if (!this.evento.titulo || !this.evento.categoriaId || !this.evento.data || !this.evento.local) {
      alert('Preencha título, categoria, data/horário e local.');
      return;
    }
    if (this.evento.valor < 0) {
      alert('O valor do ingresso não pode ser negativo.');
      return;
    }

    const dados = { ...this.evento, categoriaId: this.evento.categoriaId as number };

    if (this.idEdicao) {
      const atualizado = this.eventoService.atualizar(this.idEdicao, dados);
      if (atualizado) {
        this.ingressoService.atualizarDadosDoEvento(atualizado);
      }
    } else {
      this.eventoService.salvar(dados, usuario.email);
    }
    this.router.navigate(['/eventos/meus-eventos']);
  }
}
