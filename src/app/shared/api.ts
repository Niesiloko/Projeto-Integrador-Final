import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';

// Endereço da API Spring Boot, que muda conforme o ambiente:
//  - desenvolvimento (npm start): '/api', pelo proxy do Angular (proxy.conf.json) para http://localhost:8080
//  - produção (ng build): endereço público da API, em src/environments/environment.production.ts
export const API_URL = environment.apiUrl;

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
