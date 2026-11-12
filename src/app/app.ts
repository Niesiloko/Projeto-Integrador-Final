import { Component, signal } from '@angular/core';
import { DemoService } from './shared/demo.service';

@Component({
  selector: 'app-root',
  standalone: false,
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('conecta-event');

  constructor(demo: DemoService) {
    // primeira visita no navegador: carrega contas e eventos de demonstração
    demo.carregarSeVazio();
  }
}
