import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Adashboard } from './adashboard';

describe('Adashboard', () => {
  let component: Adashboard;
  let fixture: ComponentFixture<Adashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Adashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Adashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
