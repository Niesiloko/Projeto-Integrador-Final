import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Evento, VagasEvento } from './evento.model';
import { API_URL } from '../api';

// Dados que o formulário preenche (o resto vem da API ou do usuário logado).
export type DadosEvento = Omit<Evento, 'id' | 'organizadorId' | 'categoriaNome'>;

// Formato do evento no JSON da API (entidade Evento.java).
interface EventoApi {
  id: number;
  titulo: string;
  descricao: string | null;
  dataHora: string;
  local: string;
  valor: number;
  capacidade: number;
  imagem: string | null;
  categoria: { id: number; nome: string };
  organizador: { id: number };
}

@Injectable({ providedIn: 'root' })
export class EventoService {
  private url = `${API_URL}/eventos`;

  constructor(private http: HttpClient) {}

  // todos os eventos (precisa estar logado)
  listar(): Observable<Evento[]> {
    return this.http.get<EventoApi[]>(this.url).pipe(map(lista => lista.map(paraEvento)));
  }

  // vitrine da Home: só os que ainda vão acontecer (rota pública)
  listarFuturos(): Observable<Evento[]> {
    return this.http.get<EventoApi[]>(`${this.url}/futuros`).pipe(map(lista => lista.map(paraEvento)));
  }

  buscarPorId(id: number): Observable<Evento> {
    return this.http.get<EventoApi>(`${this.url}/${id}`).pipe(map(paraEvento));
  }

  vagas(id: number): Observable<VagasEvento> {
    return this.http.get<VagasEvento>(`${this.url}/${id}/vagas`);
  }

  // "Meus eventos" do organizador (GET /usuarios/{id}/eventos)
  listarDoOrganizador(organizadorId: number): Observable<Evento[]> {
    return this.http.get<EventoApi[]>(`${API_URL}/usuarios/${organizadorId}/eventos`)
      .pipe(map(lista => lista.map(paraEvento)));
  }

  salvar(dados: DadosEvento, organizadorId: number): Observable<Evento> {
    return this.http.post<EventoApi>(this.url, paraApi(dados, organizadorId)).pipe(map(paraEvento));
  }

  atualizar(id: number, dados: DadosEvento, organizadorId: number): Observable<Evento> {
    return this.http.put<EventoApi>(`${this.url}/${id}`, paraApi(dados, organizadorId)).pipe(map(paraEvento));
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

// API -> tela. A data vem como "2026-12-13T20:00:00"; a tela usa só até os minutos.
export function paraEvento(e: EventoApi): Evento {
  return {
    id: e.id,
    titulo: e.titulo,
    categoriaId: e.categoria.id,
    categoriaNome: e.categoria.nome,
    data: e.dataHora.slice(0, 16),
    local: e.local,
    descricao: e.descricao ?? '',
    valor: Number(e.valor),
    capacidade: e.capacidade,
    imagem: e.imagem ?? undefined,
    organizadorId: e.organizador.id
  };
}

// tela -> API. Relacionamentos vão só com o id: { "categoria": { "id": 1 } }
function paraApi(dados: DadosEvento, organizadorId: number) {
  return {
    titulo: dados.titulo.trim(),
    descricao: dados.descricao?.trim() || null,
    dataHora: `${dados.data}:00`,
    local: dados.local.trim(),
    valor: dados.valor,
    capacidade: dados.capacidade,
    imagem: dados.imagem?.trim() || null,
    categoria: { id: dados.categoriaId },
    organizador: { id: organizadorId }
  };
}

export type { EventoApi };
