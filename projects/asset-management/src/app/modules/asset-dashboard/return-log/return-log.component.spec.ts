import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReturnLogComponent } from './return-log.component';

describe('ReturnLogComponent', () => {
  let component: ReturnLogComponent;
  let fixture: ComponentFixture<ReturnLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReturnLogComponent],
      imports: [RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ReturnLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to I.T department', () => {
    expect(component.activeDept).toBe('I.T');
  });

  it('should start with empty search query', () => {
    expect(component.searchQuery).toBe('');
  });

  it('should start on page 1', () => {
    expect(component.currentPage).toBe(1);
  });

  it('should start with no selected record (list view)', () => {
    expect(component.selectedRecord).toBeNull();
  });

  it('should have correct departments', () => {
    expect(component.departments).toEqual(['I.T', 'Electrical', 'Sound', 'Stationery', 'Housekeeping', 'Furnitures']);
  });

  it('should have correct classification options', () => {
    expect(component.classificationOptions).toEqual(['Asset', 'Component', 'Consumable', 'Accessory']);
  });

  it('should filter records by department', () => {
    component.activeDept = 'Electrical';
    const results = component.filteredRecords;
    expect(results.every(r => r.department === 'Electrical')).toBeTrue();
  });

  it('should filter records by search query', () => {
    component.searchQuery = 'Laptops';
    const results = component.filteredRecords;
    expect(results.every(r => r.assetName.toLowerCase().includes('laptops'))).toBeTrue();
  });

  it('should compute totalPages correctly', () => {
    component.activeDept = 'I.T';
    const expectedPages = Math.ceil(component.filteredRecords.length / 8);
    expect(component.totalPages).toBe(expectedPages);
  });

  it('should change department and reset state', () => {
    component.searchQuery = 'test';
    component.currentPage = 3;
    component.selectedRecord = component.allRecords[0];

    component.setDept('Sound');

    expect(component.activeDept).toBe('Sound');
    expect(component.searchQuery).toBe('');
    expect(component.currentPage).toBe(1);
    expect(component.selectedRecord).toBeNull();
  });

  it('should navigate to previous page', () => {
    component.currentPage = 2;
    component.prevPage();
    expect(component.currentPage).toBe(1);
  });

  it('should not go below page 1', () => {
    component.currentPage = 1;
    component.prevPage();
    expect(component.currentPage).toBe(1);
  });

  it('should navigate to next page', () => {
    const totalPages = component.totalPages;
    if (totalPages > 1) {
      component.currentPage = 1;
      component.nextPage();
      expect(component.currentPage).toBe(2);
    }
  });

  it('should not exceed total pages', () => {
    component.currentPage = component.totalPages;
    component.nextPage();
    expect(component.currentPage).toBe(component.totalPages);
  });

  it('should go to specific page', () => {
    component.goToPage(3);
    expect(component.currentPage).toBe(3);
  });

  it('should open detail view on openDetail', () => {
    const record = component.allRecords[0];
    component.openDetail(record);
    expect(component.selectedRecord).toBe(record);
    expect(component.formAssetName).toBe(record.assetName);
    expect(component.formAssetTag).toBe(record.assetTag);
    expect(component.formClassification).toBe(record.classification);
    expect(component.formTotal).toBe(record.total);
  });

  it('should close detail view on closeDetail', () => {
    component.openDetail(component.allRecords[0]);
    component.closeDetail();
    expect(component.selectedRecord).toBeNull();
  });

  it('should return correct classification class', () => {
    expect(component.getClassClass('Asset')).toBe('class-asset');
    expect(component.getClassClass('Component')).toBe('class-component');
    expect(component.getClassClass('Consumable')).toBe('class-consumable');
    expect(component.getClassClass('Accessory')).toBe('class-accessory');
  });

  it('should have pagedRecords return correct number of items', () => {
    component.activeDept = 'I.T';
    component.currentPage = 1;
    expect(component.pagedRecords.length).toBeLessThanOrEqual(8);
  });
});
