import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Perfil } from './auth.service';

// Guarda de rota: só deixa abrir a tela quem está logado com o perfil certo.
// Quem não está logado vai para o login; quem tem o outro perfil volta para a Home.
export function perfilGuard(perfil: Perfil): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.estaLogado) {
      return router.createUrlTree(['/login']);
    }
    return auth.usuarioLogado?.perfil === perfil ? true : router.createUrlTree(['/']);
  };
}
