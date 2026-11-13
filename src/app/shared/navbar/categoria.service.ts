import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from './categoria.model';
import { API_URL } from '../api';

// CRUD de categorias na API (/categorias). As regras (nome único, não excluir categoria em uso)
// ficam no backend; a tela só mostra a mensagem que a API devolve.
@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private url = `${API_URL}/categorias`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.url);
  }

  // com id: atualiza (PUT); sem id: cria (POST)
  salvar(categoria: { id?: number; nome: string; descricao?: string }): Observable<Categoria> {
    const corpo = { nome: categoria.nome.trim(), descricao: categoria.descricao?.trim() || null };
    return categoria.id
      ? this.http.put<Categoria>(`${this.url}/${categoria.id}`, corpo)
      : this.http.post<Categoria>(this.url, corpo);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
