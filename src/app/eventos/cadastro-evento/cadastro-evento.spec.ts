import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { EventosModule } from '../eventos-module';
import { CadastroEvento } from './cadastro-evento';

describe('CadastroEvento', () => {
  let component: CadastroEvento;
  let fixture: ComponentFixture<CadastroEvento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // CadastroEvento é declarado no EventosModule, que já importa CommonModule,
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

    fixture = TestBed.createComponent(CadastroEvento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
