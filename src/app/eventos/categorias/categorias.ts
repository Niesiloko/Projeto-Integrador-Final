import { Component } from '@angular/core';
import { Categoria } from '../../shared/navbar/categoria.model';
import { CategoriaService } from '../../shared/navbar/categoria.service';
import { EventoService } from '../../shared/navbar/evento.service';

@Component({
  selector: 'app-categorias',
  standalone: false,
  templateUrl: './categorias.html',
  styleUrl: './categorias.scss'
})
export class Categorias {
  categorias: Categoria[] = [];
  eventosPorCategoria: Record<number, number> = {};

  // formulário: com id preenchido, está editando; sem id, está criando
  form: { id?: number; nome: string; descricao: string } = { nome: '', descricao: '' };
  mensagem = '';
  erro = false;

  // id da categoria que está pedindo confirmação de exclusão (a confirmação fica na própria linha)
  confirmandoExclusao?: number;

  constructor(private categoriaService: CategoriaService, private eventoService: EventoService) {
    this.carregar();
  }

  carregar() {
    this.categorias = this.categoriaService.listar();
    this.eventosPorCategoria = {};
    for (const e of this.eventoService.listar()) {
      this.eventosPorCategoria[e.categoriaId] = (this.eventosPorCategoria[e.categoriaId] ?? 0) + 1;
    }
  }

  salvar() {
    const resultado = this.categoriaService.salvar(this.form);
    this.mostrar(resultado.mensagem, !resultado.ok);
    if (resultado.ok) {
      this.cancelar();
      this.carregar();
    }
  }

  editar(c: Categoria) {
    this.form = { id: c.id, nome: c.nome, descricao: c.descricao ?? '' };
    this.mensagem = '';
  }

  cancelar() {
    this.form = { nome: '', descricao: '' };
  }

  // primeiro clique na lixeira: pede confirmação na linha
  pedirExclusao(c: Categoria) {
    // regra: categoria com eventos não pode ser excluída
    if (this.eventoService.usaCategoria(c.id)) {
      this.mostrar(`Não é possível excluir "${c.nome}": existem eventos nessa categoria.`, true);
      return;
    }
    this.mensagem = '';
    this.confirmandoExclusao = c.id;
  }

  // clique em "Sim, excluir"
  excluir(c: Categoria) {
    this.confirmandoExclusao = undefined;
    this.categoriaService.excluir(c.id);
    if (this.form.id === c.id) {
      this.cancelar();
    }
    this.mostrar('Categoria excluída.', false);
    this.carregar();
  }

  private mostrar(texto: string, erro: boolean) {
    this.mensagem = texto;
    this.erro = erro;
  }
}
