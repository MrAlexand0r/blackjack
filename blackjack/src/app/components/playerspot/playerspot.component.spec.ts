import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerspotComponent } from './playerspot.component';

describe('PlayerspotComponent', () => {
  let component: PlayerspotComponent;
  let fixture: ComponentFixture<PlayerspotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerspotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerspotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
