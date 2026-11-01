import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EventoService } from '../../shared/navbar/evento.service';

@Component({
  selector: 'app-criar-evento',
  standalone: false,
  styleUrl: './criar-evento.scss',
  templateUrl: './criar-evento.html',
})
export class CriarEvento {

  evento = {
    titulo: '',
    categoria: '',
    data: '',
    local: '',
    descricao: '',
    valor: 0
  };

  constructor(private router: Router, private eventoService: EventoService) {}

  salvarEvento() {
    if (!this.evento.titulo || !this.evento.categoria || !this.evento.data || !this.evento.local) {
      alert('Preencha título, categoria, data/horário e local.');
      return;
    }
    if (this.evento.valor < 0) {
      alert('O valor do ingresso não pode ser negativo.');
      return;
    }

    this.eventoService.salvar(this.evento);
    this.router.navigate(['/eventos/meus-eventos']);
  }
}