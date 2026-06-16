import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IssueAssetComponent } from './issue-asset.component';

describe('IssueAssetComponent', () => {
  let component: IssueAssetComponent;
  let fixture: ComponentFixture<IssueAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IssueAssetComponent],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({ assetId: 'asset-1', assetName: 'Wireless Mic' }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IssueAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the issue date', () => {
    expect(component.issueDate).toBeTruthy();
  });

  it('should show validation error when receiver is missing', () => {
    component.onSubmit();
    expect(component.submitError).toBe('Asset, receiver, and issue date are required.');
  });

  it('should reset the receiver and issue date on issueAnother', () => {
    component.selectedReceiverId = 'abc123';
    component.issueDate = '2026-05-27';
    component.showSuccess = true;

    component.issueAnother();

    expect(component.selectedReceiverId).toBe('');
    expect(component.showSuccess).toBeFalse();
    expect(component.issueDate).toBeTruthy();
  });
});
