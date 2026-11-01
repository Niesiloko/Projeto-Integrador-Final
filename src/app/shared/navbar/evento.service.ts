import { Injectable } from '@angular/core';
import { Evento } from './evento.model';

@Injectable({ providedIn: 'root' })
export class EventoService {
  private chave = 'eventos';

  listar(): Evento[] {
    const lista = JSON.parse(localStorage.getItem(this.chave) || '[]');
   
    return lista.map((e: Evento) => ({ ...e, valor: e.valor ?? 0 }));
  }

  buscarPorId(id: number): Evento | undefined {
    return this.listar().find(e => e.id === id);
  }

  salvar(dados: Omit<Evento, 'id'>): Evento {
    const evento: Evento = { id: Date.now(), ...dados };
    const lista = this.listar();
    lista.push(evento);
    localStorage.setItem(this.chave, JSON.stringify(lista));
    return evento;
  }

  excluir(id: number) {
    const lista = this.listar().filter(e => e.id !== id);
    localStorage.setItem(this.chave, JSON.stringify(lista));
  }
}