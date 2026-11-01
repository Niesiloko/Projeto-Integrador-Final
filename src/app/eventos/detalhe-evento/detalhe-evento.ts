import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Evento } from '../../shared/navbar/evento.model';
import { EventoService } from '../../shared/navbar/evento.service';
import { IngressoService } from '../../shared/navbar/ingresso.service';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-detalhe-evento',
  standalone: false,
  templateUrl: './detalhe-evento.html',
  styleUrl: './detalhe-evento.scss'
})
export class DetalheEvento {

  evento?: Evento;

  constructor(
    route: ActivatedRoute,
    private router: Router,
    private eventoService: EventoService,
    private ingressoService: IngressoService,
    private auth: AuthService
  ) {
    const id = Number(route.snapshot.paramMap.get('id'));
    this.evento = this.eventoService.buscarPorId(id);
  }

  comprar() {
    if (!this.evento) {
      return;
    }
    const usuario = this.auth.usuarioLogado;
    if (!usuario) {
      alert('Faça login para comprar ingressos.');
      this.router.navigate(['/login']);
      return;
    }
    this.ingressoService.comprar(this.evento, usuario.nome, usuario.email);
    alert('Compra confirmada! Seu ingresso está em Meus Ingressos.');
    this.router.navigate(['/eventos/meus-ingressos']);
  }
}