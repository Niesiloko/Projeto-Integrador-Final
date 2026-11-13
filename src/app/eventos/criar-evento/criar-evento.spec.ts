import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { EventosModule } from '../eventos-module';
import { CriarEvento } from './criar-evento';

describe('CriarEvento', () => {
  let component: CriarEvento;
  let fixture: ComponentFixture<CriarEvento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // CriarEvento é declarado no EventosModule, que já importa CommonModule,
      // FormsModule e os módulos do Angular Material usados no template.
      imports: [EventosModule],
      providers: [
        // O EventosModule usa RouterModule.forChild, que NÃO cria o Router.
        // provideRouter([]) cria um Router sem rotas (e o ActivatedRoute).
        provideRouter([]),
        provideHttpClient(),        // registra o HttpClient usado pelos services
        provideHttpClientTesting(), // troca o HTTP real por um falso: nenhum pedido sai para a rede
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CriarEvento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
