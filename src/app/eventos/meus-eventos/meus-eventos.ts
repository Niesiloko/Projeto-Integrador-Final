import { Component } from '@angular/core';
import { Evento } from '../../shared/navbar/evento.model';
import { EventoService } from '../../shared/navbar/evento.service';

@Component({
  selector: 'app-meus-eventos',
  standalone: false,
  styleUrl: './meus-eventos.scss',
  templateUrl: './meus-eventos.html',
})
export class MeusEventos {

  meusEventos: Evento[] = [];

  constructor(private eventoService: EventoService) {
    this.carregar();
  }

  carregar() {
    this.meusEventos = this.eventoService.listar();
  }

  excluir(id: number) {
    if (!confirm('Deseja excluir este evento?')) {
      return;
    }
    this.eventoService.excluir(id);
    this.carregar();
  }
}