import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriarEvento } from './criar-evento';

describe('CriarEvento', () => {
  let component: CriarEvento;
  let fixture: ComponentFixture<CriarEvento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CriarEvento],
    }).compileComponents();

    fixture = TestBed.createComponent(CriarEvento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
