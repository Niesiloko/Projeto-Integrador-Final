import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { map, shareReplay } from 'rxjs';
import { AuthService } from '../auth.service'; 

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {

  // verdadeiro quando a tela tem menos de 768 px (celular)
  readonly telaPequena$ = inject(BreakpointObserver)
    .observe('(max-width: 767px)')
    .pipe(map(r => r.matches), shareReplay({ bufferSize: 1, refCount: true }));

  constructor(public auth: AuthService, private router: Router) {}

  // no celular, o menu fecha sozinho ao escolher uma página
  fecharSeCelular(menu: MatSidenav) {
    if (menu.mode === 'over') {
      menu.close();
    }
  }

  sair() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}