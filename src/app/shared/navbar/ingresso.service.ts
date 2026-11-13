import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Ingresso, Reembolso } from './ingresso.model';
import { EventoApi } from './evento.service';
import { API_URL } from '../api';

// Formatos do JSON da API (entidades Ingresso.java e Reembolso.java).
interface IngressoApi {
  id: number;
  codigo: string;
  titular: string;
  valor: number;
  status: Ingresso['status'];
  evento: EventoApi;
  participante: { id: number };
}

interface ReembolsoApi {
  id: number;
  motivo: string;
  status: Reembolso['status'];
  ingresso: IngressoApi;
}

// As regras (capacidade, um ingresso por pessoa, limite de reembolsos, prazo de 48 h)
// são garantidas pelo backend. Aqui ficam só as chamadas à API e os cálculos para a tela avisar antes.
@Injectable({ providedIn: 'root' })
export class IngressoService {
  // mesmo valor de IngressoServico.LIMITE_REEMBOLSOS_POR_EVENTO no backend
  readonly limiteReembolsosPorEvento = 2;

  constructor(private http: HttpClient) {}

  // todos os ingressos (o organizador filtra os dos seus eventos)
  listar(): Observable<Ingresso[]> {
    return this.http.get<IngressoApi[]>(`${API_URL}/ingressos`).pipe(map(lista => lista.map(paraIngresso)));
  }

  // "Meus ingressos" do participante
  listarDoUsuario(participanteId: number): Observable<Ingresso[]> {
    return this.http.get<IngressoApi[]>(`${API_URL}/usuarios/${participanteId}/ingressos`)
      .pipe(map(lista => lista.map(paraIngresso)));
  }

  comprar(eventoId: number, participanteId: number, titular: string): Observable<Ingresso> {
    return this.http.post<IngressoApi>(`${API_URL}/ingressos`, {
      evento: { id: eventoId },
      participante: { id: participanteId },
      titular
    }).pipe(map(paraIngresso));
  }

  solicitarReembolso(ingressoId: number, motivo: string): Observable<Reembolso> {
    return this.http.post<ReembolsoApi>(`${API_URL}/reembolsos`, { ingresso: { id: ingressoId }, motivo: motivo.trim() })
      .pipe(map(paraReembolso));
  }

  // pedidos pendentes dos eventos do organizador (GET /usuarios/{id}/reembolsos)
  reembolsosPendentes(organizadorId: number): Observable<Reembolso[]> {
    return this.http.get<ReembolsoApi[]>(`${API_URL}/usuarios/${organizadorId}/reembolsos`)
      .pipe(map(lista => lista.map(paraReembolso)));
  }

  aprovarReembolso(reembolsoId: number): Observable<Reembolso> {
    return this.http.post<ReembolsoApi>(`${API_URL}/reembolsos/${reembolsoId}/aprovar`, null).pipe(map(paraReembolso));
  }

  // recusado: o ingresso volta a valer normalmente, com o QR Code
  recusarReembolso(reembolsoId: number): Observable<Reembolso> {
    return this.http.post<ReembolsoApi>(`${API_URL}/reembolsos/${reembolsoId}/recusar`, null).pipe(map(paraReembolso));
  }

  // ---- cálculos sobre a lista de ingressos da própria pessoa ----

  // verdadeiro se a pessoa já tem um ingresso válido deste evento
  jaComprou(ingressos: Ingresso[], eventoId: number): boolean {
    return ingressos.some(i => i.eventoId === eventoId && i.status !== 'REEMBOLSADO');
  }

  // quantas vezes a pessoa já foi reembolsada (aprovado) neste evento
  reembolsosNoEvento(ingressos: Ingresso[], eventoId: number): number {
    return ingressos.filter(i => i.eventoId === eventoId && i.status === 'REEMBOLSADO').length;
  }

  // regra: comprar e reembolsar o mesmo evento repetidamente não é permitido
  compraBloqueada(ingressos: Ingresso[], eventoId: number): boolean {
    return this.reembolsosNoEvento(ingressos, eventoId) >= this.limiteReembolsosPorEvento;
  }

  // verdadeiro se, aprovado este pedido, a pessoa chega ao limite e não poderá comprar de novo
  ehUltimoReembolso(ingressos: Ingresso[], ingresso: Ingresso): boolean {
    return this.reembolsosNoEvento(ingressos, ingresso.eventoId) + 1 >= this.limiteReembolsosPorEvento;
  }
}

function paraIngresso(i: IngressoApi): Ingresso {
  return {
    id: i.id,
    codigo: i.codigo,
    eventoId: i.evento.id,
    eventoNome: i.evento.titulo,
    data: i.evento.dataHora.slice(0, 16),
    local: i.evento.local,
    titular: i.titular,
    valor: Number(i.valor),
    status: i.status,
    participanteId: i.participante.id
  };
}

function paraReembolso(r: ReembolsoApi): Reembolso {
  return { id: r.id, motivo: r.motivo, status: r.status, ingresso: paraIngresso(r.ingresso) };
}
