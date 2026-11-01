import { Injectable } from '@angular/core';
import { Evento } from './evento.model';
import { Ingresso } from './ingresso.model';

@Injectable({ providedIn: 'root' })
export class IngressoService {
  private chave = 'ingressos';

  listar(): Ingresso[] {
    return JSON.parse(localStorage.getItem(this.chave) || '[]');
  }

  private gravar(lista: Ingresso[]) {
    localStorage.setItem(this.chave, JSON.stringify(lista));
  }

private prazoReembolsoDias = 7;

listarDoUsuario(email: string): Ingresso[] {
  return this.listar().filter(i => i.compradorEmail === email);
}


comprar(evento: Evento, titular: string, email: string): Ingresso {
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

  const diasAteEvento = (new Date(ingresso.data).getTime() - Date.now()) / 86400000;
  if (diasAteEvento < this.prazoReembolsoDias) {
    return {
      ok: false,
      mensagem: `O reembolso só pode ser solicitado até ${this.prazoReembolsoDias} dias antes do evento.`
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