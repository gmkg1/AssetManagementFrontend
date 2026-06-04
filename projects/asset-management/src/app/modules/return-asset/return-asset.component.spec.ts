import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnAssetComponent } from './return-asset.component';

describe('ReturnAssetComponent', () => {
  let component: ReturnAssetComponent;
  let fixture: ComponentFixture<ReturnAssetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReturnAssetComponent]
    });
    fixture = TestBed.createComponent(ReturnAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
