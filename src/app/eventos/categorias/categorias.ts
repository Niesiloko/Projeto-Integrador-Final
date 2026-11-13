import { ChangeDetectorRef, Component } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Categoria } from '../../shared/navbar/categoria.model';
import { CategoriaService } from '../../shared/navbar/categoria.service';
import { EventoService } from '../../shared/navbar/evento.service';
import { mensagemDeErro } from '../../shared/api';

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

  constructor(
    private categoriaService: CategoriaService,
    private eventoService: EventoService,
    private cdr: ChangeDetectorRef
  ) {
    this.carregar();
  }

  carregar() {
    forkJoin({ categorias: this.categoriaService.listar(), eventos: this.eventoService.listar() }).subscribe({
      next: ({ categorias, eventos }) => {
        this.categorias = categorias;
        this.eventosPorCategoria = {};
        for (const e of eventos) {
          this.eventosPorCategoria[e.categoriaId] = (this.eventosPorCategoria[e.categoriaId] ?? 0) + 1;
        }
        this.cdr.markForCheck();
      },
      error: erro => this.mostrar(mensagemDeErro(erro), true)
    });
  }

  salvar() {
    if (!this.form.nome.trim()) {
      this.mostrar('Informe o nome da categoria.', true);
      return;
    }
    const editando = !!this.form.id;
    this.categoriaService.salvar(this.form).subscribe({
      next: () => {
        this.mostrar(editando ? 'Categoria atualizada.' : 'Categoria criada.', false);
        this.cancelar();
        this.carregar();
      },
      // ex.: 409 "Já existe uma categoria chamada Música."
      error: erro => this.mostrar(mensagemDeErro(erro), true)
    });
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
    // regra (também conferida pela API): categoria com eventos não pode ser excluída
    if (this.eventosPorCategoria[c.id]) {
      this.mostrar(`Não é possível excluir "${c.nome}": existem eventos nessa categoria.`, true);
      return;
    }
    this.mensagem = '';
    this.confirmandoExclusao = c.id;
  }

  // clique em "Sim, excluir"
  excluir(c: Categoria) {
    this.confirmandoExclusao = undefined;
    this.categoriaService.excluir(c.id).subscribe({
      next: () => {
        if (this.form.id === c.id) {
          this.cancelar();
        }
        this.mostrar('Categoria excluída.', false);
        this.carregar();
      },
      error: erro => this.mostrar(mensagemDeErro(erro), true)
    });
  }

  private mostrar(texto: string, erro: boolean) {
    this.mensagem = texto;
    this.erro = erro;
    this.cdr.markForCheck();
  }
}
