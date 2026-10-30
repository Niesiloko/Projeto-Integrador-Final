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
      id: 1,
      eventoNome: 'Workshop de Angular',
      titular: 'Seu Nome',
      data: '2026-11-20T19:00',
      local: 'Auditório UNIFIO',
      codigo: 'CE-0001'
    },
    {
      id: 2,
      eventoNome: 'Feira de Tecnologia',
      titular: 'Seu Nome',
      data: '2026-12-05T14:00',
      local: 'Ourinhos/SP',
      codigo: 'CE-0002'
    }
  ];
}
