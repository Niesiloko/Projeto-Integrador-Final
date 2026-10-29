import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
{ path: '', redirectTo: 'eventos/cadastro', pathMatch: 'full' },
  {
    path: 'eventos',
    loadChildren: () => import('./eventos/eventos-module').then(m => m.EventosModule)
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
