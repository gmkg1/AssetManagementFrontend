import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnLogComponent } from './return-log.component';

describe('ReturnLogComponent', () => {
  let component: ReturnLogComponent;
  let fixture: ComponentFixture<ReturnLogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReturnLogComponent]
    });
    fixture = TestBed.createComponent(ReturnLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
