import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CriarEvento } from './criar-evento/criar-evento';
import { MeusEventos } from './meus-eventos/meus-eventos';
import { MeusIngressos } from './meus-ingressos/meus-ingressos';
import { DetalheEvento } from './detalhe-evento/detalhe-evento';
import { Categorias } from './categorias/categorias';
import { Dashboard } from './dashboard/dashboard';
import { perfilGuard } from '../shared/perfil.guard';

// canActivate: só o perfil certo abre a tela (a API também confere e responde 403)
const organizador = { canActivate: [perfilGuard('ORGANIZADOR')] };
const participante = { canActivate: [perfilGuard('PARTICIPANTE')] };

const routes: Routes = [
  { path: '', redirectTo: 'meus-eventos', pathMatch: 'full' },
  { path: 'criar-evento', component: CriarEvento, ...organizador },
  { path: 'editar-evento/:id', component: CriarEvento, ...organizador },
  { path: 'categorias', component: Categorias, ...organizador },
  { path: 'dashboard', component: Dashboard, ...organizador },
  { path: 'meus-eventos', component: MeusEventos, ...organizador },
  { path: 'meus-ingressos', component: MeusIngressos, ...participante },
  { path: 'detalhe/:id', component: DetalheEvento },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventosRoutingModule {}