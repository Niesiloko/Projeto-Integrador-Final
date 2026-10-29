import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeusEventos } from './meus-eventos';

describe('MeusEventos', () => {
  let component: MeusEventos;
  let fixture: ComponentFixture<MeusEventos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MeusEventos],
    }).compileComponents();

    fixture = TestBed.createComponent(MeusEventos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
