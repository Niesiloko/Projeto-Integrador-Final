import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Cadastro } from './auth/cadastro/cadastro';

const routes: Routes = [
  { path: '', redirectTo: 'eventos/meus-eventos', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'cadastro', component: Cadastro },
  {
    path: 'eventos',
    loadChildren: () =>
      import('./eventos/eventos-module').then(m => m.EventosModule)
  },
  { path: '**', redirectTo: 'eventos/meus-eventos' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }