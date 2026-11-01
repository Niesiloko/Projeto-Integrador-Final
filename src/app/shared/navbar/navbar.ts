import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service'; // ajuste o caminho



@Component({
  selector: 'app-navbar',
  standalone: false,
  styleUrl: './navbar.scss',
  templateUrl: './navbar.html',
})
export class Navbar {

constructor(public auth: AuthService, private router: Router) {}

sair() {
  this.auth.logout();
  this.router.navigate(['/']);
}
}
