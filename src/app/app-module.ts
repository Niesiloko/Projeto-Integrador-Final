import { NgModule } from '@angular/core';
import { BrowserModule,  } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing-module';

// Componentes
import { Login } from './auth/login/login';
import { Cadastro} from './auth/cadastro/cadastro';
import { CriarEvento } from './eventos/criar-evento/criar-evento';
import { MeusEventos } from './eventos/meus-eventos/meus-eventos';
import { MeusIngressos } from './eventos/meus-ingressos/meus-ingressos';
import { Navbar } from './shared/navbar/navbar';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [
    AppModule,
    Login,
    Cadastro,
    CriarEvento,
    MeusEventos,
    MeusIngressos,
    Navbar
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTableModule
  ],
  providers: [
    provideAnimations()
  ],
  bootstrap: [AppModule ]
})
export class AppModule { }