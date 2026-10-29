import { Component } from '@angular/core';

@Component({
  selector: 'app-cadastro-evento',
  standalone: false,
  templateUrl: './cadastro-evento.html',
  styleUrl: './cadastro-evento.scss'
})
export class CadastroEvento {
  nome = '';
  local = '';
  dataHorario = '';
  descricao = '';
  mensagem = '';

  salvar(): void {
    if (!this.nome.trim() || !this.local.trim()) return;
    this.mensagem = `Evento "${this.nome.trim()}" validado com sucesso (simulação)!`;
  }

  limpar(): void {
    this.nome = '';
    this.local = '';
    this.dataHorario = '';
    this.descricao = '';
    this.mensagem = '';
  }
}