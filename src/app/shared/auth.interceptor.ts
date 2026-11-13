import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

// Interceptor: roda antes de TODA requisição HTTP do front.
//  - coloca o cabeçalho Authorization com a credencial do usuário logado (se a tela não colocou outro);
//  - avisa a API que é uma chamada JavaScript (X-Requested-With), para o navegador
//    não abrir a janela de login dele quando a resposta for 401.
export const authInterceptor: HttpInterceptorFn = (requisicao, proximo) => {
  const credencial = inject(AuthService).credencial;
  let headers = requisicao.headers.set('X-Requested-With', 'XMLHttpRequest');

  if (credencial && !headers.has('Authorization')) {
    headers = headers.set('Authorization', `Basic ${credencial}`);
  }
  return proximo(requisicao.clone({ headers }));
};
