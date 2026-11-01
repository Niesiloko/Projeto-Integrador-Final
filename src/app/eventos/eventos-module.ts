import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { EventosRoutingModule } from './eventos-routing-module';
import { CadastroEvento } from './cadastro-evento/cadastro-evento';
import { CriarEvento } from './criar-evento/criar-evento';
import { MeusEventos } from './meus-eventos/meus-eventos';
import { MeusIngressos } from './meus-ingressos/meus-ingressos';
import { Home } from './home/home';
import { DetalheEvento } from './detalhe-evento/detalhe-evento';

@NgModule({
  declarations: [CadastroEvento, CriarEvento, MeusEventos, MeusIngressos, Home, DetalheEvento],
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    EventosRoutingModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  exports: [CadastroEvento],
})
export class EventosModule {}
