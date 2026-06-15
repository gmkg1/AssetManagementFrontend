import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ViewAssetsComponent } from './view-assets.component';

describe('ViewAssetsComponent', () => {
  let component: ViewAssetsComponent;
  let fixture: ComponentFixture<ViewAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewAssetsComponent],
      imports: [RouterTestingModule, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to list view', () => {
    expect(component.view).toBe('list');
  });

  it('should initialize status counts to 0', () => {
    expect(component.totalCount).toBe(0);
    expect(component.availableCount).toBe(0);
    expect(component.deployedCount).toBe(0);
    expect(component.maintenanceCount).toBe(0);
  });

  it('should open detail view on openDetail', () => {
    const asset = component.assets[0];
    component.openDetail(asset);
    expect(component.view).toBe('detail');
    expect(component.selectedAsset).toBe(asset);
    expect(component.detailTab).toBe('info');
  });

  it('should return to list view on backToList', () => {
    component.openDetail(component.assets[0]);
    component.backToList();
    expect(component.view).toBe('list');
    expect(component.selectedAsset).toBeNull();
  });

  it('should return correct status class', () => {
    expect(component.getStatusClass('Ready to Deploy')).toBe('status-available');
    expect(component.getStatusClass('Deployed')).toBe('status-deployed');
    expect(component.getStatusClass('Under Maintenance')).toBe('status-maintenance');
    expect(component.getStatusClass('Retired')).toBe('status-retired');
  });

  it('should return correct condition class', () => {
    expect(component.getConditionClass('Good')).toBe('condition-good');
    expect(component.getConditionClass('Fair')).toBe('condition-fair');
    expect(component.getConditionClass('Poor')).toBe('condition-poor');
  });
});
