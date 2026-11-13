import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URL } from './api';

export type Perfil = 'ORGANIZADOR' | 'PARTICIPANTE';

// Usuário como a API devolve (a senha nunca vem na resposta).
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
}

interface Sessao {
  usuario: Usuario;
  credencial: string; // "email:senha" em Base64, enviado no cabeçalho Authorization (HTTP Basic)
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private chaveSessao = 'sessao';

  // contas do import.sql do backend, mostradas na tela de login
  static readonly contasTeste = [
    { perfil: 'Organizador', email: 'ana@conectaevent.com', senha: 'organizador123' },
    { perfil: 'Participante', email: 'carla@email.com', senha: 'participante123' }
  ];

  constructor(private http: HttpClient) {}

  // Cria a conta pela rota pública POST /usuarios/cadastro.
  cadastrar(nome: string, email: string, senha: string, perfil: Perfil): Observable<Usuario> {
    return this.http.post<Usuario>(`${API_URL}/usuarios/cadastro`, {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha,
      perfil
    });
  }

  // Confere e-mail e senha perguntando à API "quem sou eu?" (GET /usuarios/me).
  // Se a API aceitar, guarda o usuário e a credencial; se não, o Observable dá erro 401.
  login(email: string, senha: string): Observable<Usuario> {
    const credencial = this.paraBase64(`${email.trim().toLowerCase()}:${senha}`);
    const headers = new HttpHeaders({ Authorization: `Basic ${credencial}` });

    return this.http.get<Usuario>(`${API_URL}/usuarios/me`, { headers }).pipe(
      tap(usuario => {
        const sessao: Sessao = { usuario, credencial };
        localStorage.setItem(this.chaveSessao, JSON.stringify(sessao));
      })
    );
  }

  logout() {
    localStorage.removeItem(this.chaveSessao);
  }

  get usuarioLogado(): Usuario | undefined {
    return this.sessao()?.usuario;
  }

  // usado pelo interceptor para autenticar cada requisição
  get credencial(): string | undefined {
    return this.sessao()?.credencial;
  }

  get estaLogado(): boolean {
    return !!this.usuarioLogado;
  }

  get ehOrganizador(): boolean {
    return this.usuarioLogado?.perfil === 'ORGANIZADOR';
  }

  get ehParticipante(): boolean {
    return this.usuarioLogado?.perfil === 'PARTICIPANTE';
  }

  private sessao(): Sessao | undefined {
    const salvo = localStorage.getItem(this.chaveSessao);
    if (!salvo) {
      return undefined;
    }
    const sessao = JSON.parse(salvo);
    // sessão do tempo do localStorage (sem credencial): descarta
    return sessao?.credencial ? sessao : undefined;
  }

  // btoa só aceita caracteres simples; o TextEncoder permite senhas com acento
  private paraBase64(texto: string): string {
    const bytes = new TextEncoder().encode(texto);
    return btoa(String.fromCharCode(...bytes));
  }
}

// Observação para a apresentação: o HTTP Basic envia e-mail e senha (em Base64, que NÃO é criptografia)
// em toda requisição, e o front guarda essa credencial no navegador. É aceitável no projeto acadêmico;
// em produção usaríamos HTTPS e um token com validade (por exemplo, JWT).
