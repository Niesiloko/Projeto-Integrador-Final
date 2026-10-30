import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  busca = '';
  local = 'Ourinhos, SP';

  eventos = [
    { titulo: 'Workshop de Angular', cidade: 'Ourinhos/SP', data: '20/11/2026', imagem: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600' },
    { titulo: 'Feira de Tecnologia', cidade: 'Ourinhos/SP', data: '05/12/2026', imagem: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600' },
    { titulo: 'Festival de Música', cidade: 'Marília/SP', data: '12/12/2026', imagem: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600' }
  ];

  get eventosFiltrados() {
    const t = this.busca.toLowerCase();
    return this.eventos.filter(e => e.titulo.toLowerCase().includes(t));
  }
} 