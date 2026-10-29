import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Cadastro} from './auth/cadastro/cadastro';
import { CriarEvento } from './eventos/criar-evento/criar-evento';
import { MeusEventos } from './eventos/meus-eventos/meus-eventos';
import { MeusIngressos } from './eventos/meus-ingressos/meus-ingressos';

const routes: Routes = [
  { path: '', redirectTo: 'meus-eventos', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'cadastro', component: Cadastro },
  { path: 'criar-evento', component: CriarEvento },
  { path: 'meus-eventos', component: MeusEventos },
  { path: 'meus-ingressos', component: MeusIngressos },
  { path: '**', redirectTo: 'meus-eventos' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }