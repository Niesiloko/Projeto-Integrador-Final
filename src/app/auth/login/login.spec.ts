import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppModule } from '../../app-module';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Login é "standalone: false" e é declarado no AppModule. Importar o
      // módulo real traz junto tudo o que o template usa (CommonModule via
      // BrowserModule, FormsModule, Angular Material, rotas). Assim o teste
      // usa a mesma configuração do app de verdade.
      // O AppModule já traz o Router (AppRoutingModule usa RouterModule.forRoot).
      imports: [AppModule],
      providers: [
        provideHttpClient(),        // registra o HttpClient usado pelos services
        provideHttpClientTesting(), // troca o HTTP real por um falso: nenhum pedido sai para a rede
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
