import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAssetTagComponent } from './create-asset-tag.component';

describe('CreateAssetTagComponent', () => {
  let component: CreateAssetTagComponent;
  let fixture: ComponentFixture<CreateAssetTagComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateAssetTagComponent]
    });
    fixture = TestBed.createComponent(CreateAssetTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
