import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewAssetTagComponent } from './view-asset-tag.component';

describe('ViewAssetTagComponent', () => {
  let component: ViewAssetTagComponent;
  let fixture: ComponentFixture<ViewAssetTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewAssetTagComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewAssetTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
