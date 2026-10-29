import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeusIngressos } from './meus-ingressos';

describe('MeusIngressos', () => {
  let component: MeusIngressos;
  let fixture: ComponentFixture<MeusIngressos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MeusIngressos],
    }).compileComponents();

    fixture = TestBed.createComponent(MeusIngressos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
