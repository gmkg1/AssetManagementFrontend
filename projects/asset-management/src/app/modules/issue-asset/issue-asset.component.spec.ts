import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { IssueAssetComponent } from './issue-asset.component';

describe('IssueAssetComponent', () => {
  let component: IssueAssetComponent;
  let fixture: ComponentFixture<IssueAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IssueAssetComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({}) },
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

  it('should default issueType to Temporary', () => {
    expect(component.issueType).toBe('Temporary');
  });

  it('should return false for isFormValid when fields are empty', () => {
    expect(component.isFormValid).toBeFalse();
  });

  it('should return true for isFormValid when all required fields are filled', () => {
    component.receiverName   = 'John Doe';
    component.studentId      = 'KJ24A001';
    component.department     = 'SDC';
    component.email          = 'john@kjc.edu.in';
    component.phone          = '9876543210';
    component.checkoutDate   = '2025-03-01';
    component.expectedReturn = '2025-06-01';
    expect(component.isFormValid).toBeTrue();
  });

  it('should not require expectedReturn when issueType is Permanent', () => {
    component.receiverName = 'John Doe';
    component.studentId    = 'KJ24A001';
    component.department   = 'SDC';
    component.email        = 'john@kjc.edu.in';
    component.phone        = '9876543210';
    component.checkoutDate = '2025-03-01';
    component.issueType    = 'Permanent';
    component.expectedReturn = '';
    expect(component.isFormValid).toBeTrue();
  });

  it('should set showSuccess to true on valid submit', () => {
    component.receiverName   = 'John Doe';
    component.studentId      = 'KJ24A001';
    component.department     = 'SDC';
    component.email          = 'john@kjc.edu.in';
    component.phone          = '9876543210';
    component.checkoutDate   = '2025-03-01';
    component.expectedReturn = '2025-06-01';
    component.onSubmit();
    expect(component.showSuccess).toBeTrue();
  });

  it('should reset form on issueAnother', () => {
    component.receiverName = 'John Doe';
    component.showSuccess  = true;
    component.issueAnother();
    expect(component.receiverName).toBe('');
    expect(component.showSuccess).toBeFalse();
  });

  it('should select department and close dropdown', () => {
    component.deptOpen = true;
    component.selectDept('Admin');
    expect(component.department).toBe('Admin');
    expect(component.deptOpen).toBeFalse();
  });

  it('should select issue type and close dropdown', () => {
    component.issueTypeOpen = true;
    component.selectIssueType('Permanent');
    expect(component.issueType).toBe('Permanent');
    expect(component.issueTypeOpen).toBeFalse();
  });
});
