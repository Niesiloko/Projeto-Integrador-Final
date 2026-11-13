import { HttpErrorResponse } from '@angular/common/http';

// Endereço da API Spring Boot.
// Em desenvolvimento, "/api" passa pelo proxy do Angular (proxy.conf.json), que repassa para http://localhost:8080.
// Ao publicar o front em outro servidor, troque pelo endereço público da API (ex.: 'https://minha-api.com').
export const API_URL = '/api';

// Corpo de erro padrão da API (ErroResposta.java).
interface ErroApi {
  mensagem?: string;
  campos?: Record<string, string> | null;
}

// Transforma o erro HTTP em um texto para mostrar na tela.
export function mensagemDeErro(erro: unknown): string {
  if (!(erro instanceof HttpErrorResponse)) {
    return 'Erro inesperado. Tente novamente.';
  }
  if (erro.status === 0) {
    return 'Não foi possível conectar ao servidor. Verifique se a API (backend) está rodando.';
  }
  const corpo = erro.error as ErroApi | null;
  // erro de validação (400): mostra a mensagem de cada campo
  if (corpo?.campos && Object.keys(corpo.campos).length > 0) {
    return Object.values(corpo.campos).join(' ');
  }
  return corpo?.mensagem ?? `Erro ${erro.status} ao falar com o servidor.`;
}
