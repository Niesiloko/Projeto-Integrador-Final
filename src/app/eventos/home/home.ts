import { Component } from '@angular/core';
import { Evento } from '../../shared/navbar/evento.model';
import { EventoService } from '../../shared/navbar/evento.service';

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
  categoria = '';
  data = '';

  constructor(private eventoService: EventoService) {
    this.eventos = this.eventoService.listar();
  }

  get categorias(): string[] {
    return [...new Set(this.eventos.map(e => e.categoria).filter(c => !!c))];
  }

  get eventosFiltrados(): Evento[] {
    const nome = this.busca.trim().toLowerCase();
    const local = this.local.trim().toLowerCase();

    return this.eventos.filter(e =>
      (!nome || e.titulo.toLowerCase().includes(nome)) &&
      (!local || e.local.toLowerCase().includes(local)) &&
      (!this.categoria || e.categoria === this.categoria) &&
      (!this.data || e.data.startsWith(this.data))
    );
  }

  limpar() {
    this.busca = '';
    this.local = '';
    this.categoria = '';
    this.data = '';
  }
}