import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CadastroEvento } from './cadastro-evento/cadastro-evento';

const routes: Routes = [
  {path: 'cadastro', component: CadastroEvento }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventosRoutingModule {}
