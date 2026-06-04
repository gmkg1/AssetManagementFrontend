import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAssetsComponent } from './view-assets.component';

describe('ViewAssetsComponent', () => {
  let component: ViewAssetsComponent;
  let fixture: ComponentFixture<ViewAssetsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewAssetsComponent]
    });
    fixture = TestBed.createComponent(ViewAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
