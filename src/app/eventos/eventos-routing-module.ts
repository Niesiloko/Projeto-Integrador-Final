import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CadastroEvento } from './cadastro-evento/cadastro-evento';
import { CriarEvento } from './criar-evento/criar-evento';
import { MeusEventos } from './meus-eventos/meus-eventos';
import { MeusIngressos } from './meus-ingressos/meus-ingressos';

const routes: Routes = [
  { path: '', redirectTo: 'meus-eventos', pathMatch: 'full' },
  { path: 'criar-evento', component: CriarEvento },
  { path: 'meus-eventos', component: MeusEventos },
  { path: 'meus-ingressos', component: MeusIngressos },
  { path: 'cadastro-evento', component: CadastroEvento }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventosRoutingModule {}