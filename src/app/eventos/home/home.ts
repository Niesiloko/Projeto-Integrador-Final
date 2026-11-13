import { ChangeDetectorRef, Component } from '@angular/core';
import { Evento } from '../../shared/navbar/evento.model';
import { EventoService } from '../../shared/navbar/evento.service';
import { mensagemDeErro } from '../../shared/api';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  eventos: Evento[] = [];
  categorias: { id: number; nome: string }[] = [];
  carregando = true;
  erro = '';

  busca = '';
  local = '';
  categoriaId: number | null = null;
  data = '';

  constructor(private eventoService: EventoService, private cdr: ChangeDetectorRef) {
    // a vitrine mostra só o que ainda vai acontecer, do mais próximo ao mais distante (GET /eventos/futuros)
    this.eventoService.listarFuturos().subscribe({
      next: eventos => {
        this.eventos = eventos;
        this.categorias = this.categoriasUsadas(eventos);
      },
      error: erro => this.erro = mensagemDeErro(erro)
    }).add(() => {
      // .add() roda no fim, com sucesso ou com erro
      this.carregando = false;
      this.cdr.markForCheck();
    });
  }

  // só as categorias que têm algum evento aparecem no filtro.
  // Calculado uma vez (e não num getter): um getter criaria objetos novos a cada redesenho,
  // o *ngFor recriaria as opções e o Angular entraria em loop (erro NG0103).
  private categoriasUsadas(eventos: Evento[]): { id: number; nome: string }[] {
    const unicas = new Map(eventos.map(e => [e.categoriaId, e.categoriaNome]));
    return [...unicas.entries()]
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  get eventosFiltrados(): Evento[] {
    const nome = this.busca.trim().toLowerCase();
    const local = this.local.trim().toLowerCase();

    return this.eventos.filter(e =>
      (!nome || e.titulo.toLowerCase().includes(nome)) &&
      (!local || e.local.toLowerCase().includes(local)) &&
      (!this.categoriaId || e.categoriaId === this.categoriaId) &&
      (!this.data || e.data.startsWith(this.data))
    );
  }

  limpar() {
    this.busca = '';
    this.local = '';
    this.categoriaId = null;
    this.data = '';
  }
}
