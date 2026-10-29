import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { EventosRoutingModule } from './eventos-routing-module';
import { CadastroEvento } from './cadastro-evento/cadastro-evento';

@NgModule({
  declarations: [
    CadastroEvento
  ],
  imports: [
    CommonModule,
    FormsModule,
    EventosRoutingModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  exports: [
    CadastroEvento
  ]
})
export class EventosModule { }