import { Component } from '@angular/core';
import { Evento } from '../../shared/navbar/evento.model';
import { EventoService } from '../../shared/navbar/evento.service';
import { Categoria } from '../../shared/navbar/categoria.model';
import { CategoriaService } from '../../shared/navbar/categoria.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  eventos: Evento[] = [];

  busca = '';
  local = '';
  categoriaId: number | null = null;
  data = '';

  constructor(private eventoService: EventoService, public categoriaService: CategoriaService) {
    // a vitrine mostra só o que ainda vai acontecer, do mais próximo ao mais distante
    const agora = Date.now();
    this.eventos = this.eventoService.listar()
      .filter(e => new Date(e.data).getTime() > agora)
      .sort((a, b) => a.data.localeCompare(b.data));
  }

  // só as categorias que têm algum evento aparecem no filtro
  get categorias(): Categoria[] {
    const usadas = new Set(this.eventos.map(e => e.categoriaId));
    return this.categoriaService.listar().filter(c => usadas.has(c.id));
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
