import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ViewAssetsComponent } from './view-assets.component';

describe('ViewAssetsComponent', () => {
  let component: ViewAssetsComponent;
  let fixture: ComponentFixture<ViewAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewAssetsComponent],
      imports: [RouterTestingModule],
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

  it('should compute totalCount correctly', () => {
    expect(component.totalCount).toBe(component.assets.length);
  });

  it('should compute availableCount correctly', () => {
    const expected = component.assets.filter(a => a.status === 'Available').length;
    expect(component.availableCount).toBe(expected);
  });

  it('should compute deployedCount correctly', () => {
    const expected = component.assets.filter(a => a.status === 'Deployed').length;
    expect(component.deployedCount).toBe(expected);
  });

  it('should compute maintenanceCount correctly', () => {
    const expected = component.assets.filter(a => a.status === 'Under Maintenance').length;
    expect(component.maintenanceCount).toBe(expected);
  });

  it('should filter assets by search query', () => {
    component.searchQuery = 'macbook';
    const results = component.filteredAssets;
    expect(results.every(a => a.name.toLowerCase().includes('macbook'))).toBeTrue();
  });

  it('should filter assets by category', () => {
    component.selectedCategory = 'I.T';
    const results = component.filteredAssets;
    expect(results.every(a => a.category === 'I.T')).toBeTrue();
  });

  it('should filter assets by status', () => {
    component.selectedStatus = 'Available';
    const results = component.filteredAssets;
    expect(results.every(a => a.status === 'Available')).toBeTrue();
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
    expect(component.getStatusClass('Available')).toBe('status-available');
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
