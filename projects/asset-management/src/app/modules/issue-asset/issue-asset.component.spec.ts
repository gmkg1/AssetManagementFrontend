import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueAssetComponent } from './issue-asset.component';

describe('IssueAssetComponent', () => {
  let component: IssueAssetComponent;
  let fixture: ComponentFixture<IssueAssetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IssueAssetComponent]
    });
    fixture = TestBed.createComponent(IssueAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
