import { Injectable } from '@angular/core';
import { Evento } from './evento.model';
import { Ingresso } from './ingresso.model';

@Injectable({ providedIn: 'root' })
export class IngressoService {
  private chave = 'ingressos';
  private prazoReembolsoHoras = 48;

  // depois de 2 reembolsos no mesmo evento, a pessoa não pode mais comprar ingresso para ele
  readonly limiteReembolsosPorEvento = 2;

  listar(): Ingresso[] {
    return JSON.parse(localStorage.getItem(this.chave) || '[]');
  }

  private gravar(lista: Ingresso[]) {
    localStorage.setItem(this.chave, JSON.stringify(lista));
  }

  listarDoUsuario(email: string): Ingresso[] {
    return this.listar().filter(i => i.compradorEmail === email);
  }

  // ingresso reembolsado já foi devolvido e não conta; os demais ainda prendem o evento
  temIngressosAtivos(eventoId: number): boolean {
    return this.listar().some(i => i.eventoId === eventoId && i.status !== 'REEMBOLSADO');
  }

  // o ingresso guarda uma cópia do nome, da data e do local: atualiza quando o evento é editado
  atualizarDadosDoEvento(evento: Evento) {
    const lista = this.listar();
    for (const i of lista.filter(i => i.eventoId === evento.id)) {
      i.eventoNome = evento.titulo;
      i.data = evento.data;
      i.local = evento.local;
    }
    this.gravar(lista);
  }

  // verdadeiro se o usuário já tem um ingresso válido deste evento
  jaComprou(eventoId: number, email: string): boolean {
    return this.listarDoUsuario(email).some(
      i => i.eventoId === eventoId && i.status !== 'REEMBOLSADO'
    );
  }

  // quantas vezes a pessoa já foi reembolsada (aprovado) neste evento
  reembolsosNoEvento(eventoId: number, email: string): number {
    return this.listarDoUsuario(email).filter(i => i.eventoId === eventoId && i.status === 'REEMBOLSADO').length;
  }

  // regra: comprar e reembolsar o mesmo evento repetidamente não é permitido
  compraBloqueada(eventoId: number, email: string): boolean {
    return this.reembolsosNoEvento(eventoId, email) >= this.limiteReembolsosPorEvento;
  }

  // verdadeiro se, aprovado este pedido, a pessoa chega ao limite e não poderá comprar de novo
  ehUltimoReembolso(ingresso: Ingresso): boolean {
    return this.reembolsosNoEvento(ingresso.eventoId, ingresso.compradorEmail) + 1 >= this.limiteReembolsosPorEvento;
  }

  comprar(evento: Evento, titular: string, email: string): Ingresso | undefined {
    if (this.compraBloqueada(evento.id, email)) {
      return undefined;
    }
    const id = Date.now();
    const ingresso: Ingresso = {
      id,
      codigo: `CE-${evento.id}-${id}`,
      eventoId: evento.id,
      eventoNome: evento.titulo,
      data: evento.data,
      local: evento.local,
      titular,
      compradorEmail: email,
      valor: evento.valor,
      status: 'CONFIRMADO'
    };
    const lista = this.listar();
    lista.push(ingresso);
    this.gravar(lista);
    return ingresso;
  }

  solicitarReembolso(id: number): { ok: boolean; mensagem: string } {
    const lista = this.listar();
    const ingresso = lista.find(i => i.id === id);

    if (!ingresso || ingresso.status !== 'CONFIRMADO') {
      return { ok: false, mensagem: 'Este ingresso não pode ser reembolsado.' };
    }

    const horasAteEvento = (new Date(ingresso.data).getTime() - Date.now()) / 3600000;
    if (horasAteEvento < this.prazoReembolsoHoras) {
      return {
        ok: false,
        mensagem: `O reembolso só pode ser solicitado até ${this.prazoReembolsoHoras} horas antes do início do evento.`
      };
    }

    ingresso.status = 'REEMBOLSO_SOLICITADO';
    this.gravar(lista);
    return { ok: true, mensagem: 'Reembolso solicitado. Aguarde a aprovação do organizador.' };
  }

  aprovarReembolso(id: number) {
    this.atualizarStatus(id, 'REEMBOLSADO');
  }

  validar(codigo: string): { valido: boolean; mensagem: string } {
    const lista = this.listar();
    const ingresso = lista.find(i => i.codigo === codigo.trim());

    if (!ingresso) {
      return { valido: false, mensagem: 'Ingresso não encontrado.' };
    }
    if (ingresso.status === 'REEMBOLSADO') {
      return { valido: false, mensagem: 'Ingresso reembolsado e invalidado.' };
    }
    if (ingresso.status === 'UTILIZADO') {
      return { valido: false, mensagem: 'Ingresso já utilizado.' };
    }
    ingresso.status = 'UTILIZADO';
    this.gravar(lista);
    return { valido: true, mensagem: `Entrada liberada para ${ingresso.titular}.` };
  }

  private atualizarStatus(id: number, status: Ingresso['status']) {
    const lista = this.listar();
    const ingresso = lista.find(i => i.id === id);
    if (ingresso) {
      ingresso.status = status;
      this.gravar(lista);
    }
  }
}