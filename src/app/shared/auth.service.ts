import { Injectable } from '@angular/core';

export interface Usuario {
  nome: string;
  email: string;
  senha: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private chaveUsuarios = 'usuarios';
  private chaveSessao = 'sessao';

  private usuarios(): Usuario[] {
    return JSON.parse(localStorage.getItem(this.chaveUsuarios) || '[]');
  }

  cadastrar(nome: string, email: string, senha: string): { ok: boolean; mensagem: string } {
    const lista = this.usuarios();
    const emailNormalizado = email.trim().toLowerCase();

    if (lista.some(u => u.email === emailNormalizado)) {
      return { ok: false, mensagem: 'Já existe uma conta com esse e-mail.' };
    }
    lista.push({ nome: nome.trim(), email: emailNormalizado, senha });
    localStorage.setItem(this.chaveUsuarios, JSON.stringify(lista));
    return { ok: true, mensagem: 'Cadastro realizado com sucesso!' };
  }

  login(email: string, senha: string): boolean {
    const usuario = this.usuarios().find(
      u => u.email === email.trim().toLowerCase() && u.senha === senha
    );
    if (!usuario) {
      return false;
    }
    localStorage.setItem(this.chaveSessao, usuario.email);
    return true;
  }

  logout() {
    localStorage.removeItem(this.chaveSessao);
  }

  get usuarioLogado(): Usuario | undefined {
    const email = localStorage.getItem(this.chaveSessao);
    return this.usuarios().find(u => u.email === email);
  }

  get estaLogado(): boolean {
    return !!this.usuarioLogado;
  }
}

//Isso é uma simulação para o projeto: a senha fica guardada em texto puro no navegador. Num sistema real, isso vem de um back-end com senha criptografada e vale dizer isso na apresentação.