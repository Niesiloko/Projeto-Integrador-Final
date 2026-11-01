import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EventoService } from '../../shared/navbar/evento.service';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-criar-evento',
  standalone: false,
  styleUrl: './criar-evento.scss',
  templateUrl: './criar-evento.html',
})
export class CriarEvento {

  evento = {
    titulo: '',
    categoria: '',
    data: '',
    local: '',
    descricao: '',
    valor: 0,
    imagem: ''
  };

 
constructor(
  private router: Router,
  private eventoService: EventoService,
  private auth: AuthService
) {}

salvarEvento() {
  const usuario = this.auth.usuarioLogado;
  if (!usuario) {
    alert('Faça login para publicar um evento.');
    this.router.navigate(['/login']);
    return;
  }
  if (!this.evento.titulo || !this.evento.categoria || !this.evento.data || !this.evento.local) {
    alert('Preencha título, categoria, data/horário e local.');
    return;
  }
  if (this.evento.valor < 0) {
    alert('O valor do ingresso não pode ser negativo.');
    return;
  }

  this.eventoService.salvar(this.evento, usuario.email);
  this.router.navigate(['/eventos/meus-eventos']);
}
}