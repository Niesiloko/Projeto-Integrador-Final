import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Evento } from '../../shared/navbar/evento.model';
import { EventoService } from '../../shared/navbar/evento.service';
import { IngressoService } from '../../shared/navbar/ingresso.service';
import { CategoriaService } from '../../shared/navbar/categoria.service';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-detalhe-evento',
  standalone: false,
  templateUrl: './detalhe-evento.html',
  styleUrl: './detalhe-evento.scss'
})
export class DetalheEvento {

  evento?: Evento;
  jaComprado = false;
  encerrado = false;

  constructor(
    route: ActivatedRoute,
    private router: Router,
    private eventoService: EventoService,
    private ingressoService: IngressoService,
    public categoriaService: CategoriaService,
    private auth: AuthService
  ) {
    const id = Number(route.snapshot.paramMap.get('id'));
    this.evento = this.eventoService.buscarPorId(id);
    this.encerrado = !!this.evento && new Date(this.evento.data).getTime() <= Date.now();
    this.atualizarCompra();
  }

  private atualizarCompra() {
    const usuario = this.auth.usuarioLogado;
    this.jaComprado = !!(
      this.evento &&
      usuario &&
      this.ingressoService.jaComprou(this.evento.id, usuario.email)
    );
  }

  comprar() {
    if (!this.evento || this.encerrado) {
      return;
    }
    const usuario = this.auth.usuarioLogado;
    if (!usuario) {
      // manda para o login; a tela de login mostra as contas de teste
      this.router.navigate(['/login']);
      return;
    }
    this.ingressoService.comprar(this.evento, usuario.nome, usuario.email);
    this.atualizarCompra();
  }
}