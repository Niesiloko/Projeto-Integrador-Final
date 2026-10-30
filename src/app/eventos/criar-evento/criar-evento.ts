import { Component } from '@angular/core';
import { Router } from '@angular/router';

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
    descricao: ''
  };

  constructor(private router: Router) {}

  salvarEvento() {
    if (!this.evento.titulo || !this.evento.data || !this.evento.local) {
      alert('Preencha título, data e local.');
      return;
    }
    const salvos = JSON.parse(localStorage.getItem('eventos') || '[]');
    salvos.push({ id: Date.now(), ...this.evento });
    localStorage.setItem('eventos', JSON.stringify(salvos));

    this.router.navigate(['/eventos/meus-eventos']);
  }
}
