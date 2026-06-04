import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AssetDashboardComponent } from './asset-dashboard.component';

describe('AssetDashboardComponent', () => {
  let component: AssetDashboardComponent;
  let fixture: ComponentFixture<AssetDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssetDashboardComponent],
      imports: [RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AssetDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 6 departments', () => {
    expect(component.departments.length).toBe(6);
  });

  it('should calculate readyDash correctly', () => {
    const expected = ((component.readyToDeploy / component.totalAssets) * component.circumference).toFixed(2);
    expect(component.readyDash).toBe(expected);
  });

  it('should calculate deployedDash correctly', () => {
    const expected = ((component.deployed / component.totalAssets) * component.circumference).toFixed(2);
    expect(component.deployedDash).toBe(expected);
  });

  it('should toggle assets dropdown', () => {
    expect(component.assetsDropdownOpen).toBeFalse();
    component.toggleAssetsDropdown();
    expect(component.assetsDropdownOpen).toBeTrue();
    component.toggleAssetsDropdown();
    expect(component.assetsDropdownOpen).toBeFalse();
  });

  it('should update activeTab on selectTab', () => {
    component.selectTab('issues');
    expect(component.activeTab).toBe('issues');
  });
});
