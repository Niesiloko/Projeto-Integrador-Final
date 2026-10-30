import { Component } from '@angular/core';

@Component({
  selector: 'app-meus-ingressos',
  standalone: false,
  styleUrl: './meus-ingressos.scss',
  templateUrl: './meus-ingressos.html',
})
export class MeusIngressos {
   ingressos = [
    {
      eventoNome: 'Workshop de Angular',
      data: '20/11/2026 às 19:00',
      local: 'Auditório UNIFIO, Ourinhos/SP',
      titular: 'Seu Nome'
    },
    {
      eventoNome: 'Feira de Tecnologia',
      data: '05/12/2026 às 14:00',
      local: 'Centro de Eventos, Ourinhos/SP',
      titular: 'Seu Nome'
    }
  ];
}
