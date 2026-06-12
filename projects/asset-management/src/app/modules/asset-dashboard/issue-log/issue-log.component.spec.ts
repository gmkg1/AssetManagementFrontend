import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { IssueLogComponent } from './issue-log.component';

describe('IssueLogComponent', () => {
  let component: IssueLogComponent;
  let fixture: ComponentFixture<IssueLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IssueLogComponent],
      imports: [CommonModule, RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({}) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IssueLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to IT tab', () => {
    expect(component.activeTab).toBe('IT');
  });

  it('should switch tabs and reset pagination', () => {
    component.setTab('Sound');
    expect(component.activeTab).toBe('Sound');
    expect(component.currentPage).toBe(1);
    expect(component.selectAll).toBeFalse();
  });

  it('should filter IT items by search query', () => {
    component.setTab('IT');
    component.searchQuery = 'laptop';
    expect(component.filteredItems.length).toBeGreaterThan(0);
    expect(component.filteredItems[0].name.toLowerCase()).toContain('laptop');
  });

  it('should return all IT items when search is empty', () => {
    component.setTab('IT');
    component.searchQuery = '';
    expect(component.filteredItems.length).toBe(component.allItems.length);
  });

  it('should return electrical items for Electrical tab', () => {
    component.setTab('Electrical');
    expect(component.allElectricalItems.length).toBeGreaterThan(0);
  });

  it('should filter electrical items by search query', () => {
    component.setTab('Electrical');
    component.searchQuery = 'alice';
    expect(component.filteredElectricalItems.length).toBeGreaterThan(0);
  });

  it('should toggle select all for generic tab', () => {
    component.setTab('IT');
    fixture.detectChanges();
    component.toggleSelectAll();
    expect(component.selectAll).toBeTrue();
    component.pagedItems.forEach((item) => expect(item.selected).toBeTrue());
  });

  it('should toggle select all for electrical tab', () => {
    component.setTab('Electrical');
    fixture.detectChanges();
    component.toggleSelectAll();
    expect(component.selectAll).toBeTrue();
    component.pagedElectricalItems.forEach((item) => expect(item.selected).toBeTrue());
  });

  it('should compute totalPages correctly for IT tab', () => {
    component.setTab('IT');
    const expected = Math.max(1, Math.ceil(component.filteredItems.length / component.pageSize));
    expect(component.totalPages).toBe(expected);
  });

  it('should compute totalPages correctly for Electrical tab', () => {
    component.setTab('Electrical');
    const expected = Math.max(1, Math.ceil(component.filteredElectricalItems.length / component.pageSize));
    expect(component.totalPages).toBe(expected);
  });

  it('should generate initials from a name', () => {
    expect(component.getInitials('Alice Johnson')).toBe('AJ');
    expect(component.getInitials('Brian Mensah')).toBe('BM');
  });

  it('should not navigate below page 1', () => {
    component.currentPage = 1;
    component.onPageChange(0);
    expect(component.currentPage).toBe(1);
  });

  it('should not navigate beyond totalPages', () => {
    component.setTab('IT');
    const last = component.totalPages;
    component.currentPage = last;
    component.onPageChange(last + 1);
    expect(component.currentPage).toBe(last);
  });

  it('should switch to Electrical tab when category param is Electrical', () => {
    component.setTab('Electrical');
    expect(component.activeTab).toBe('Electrical');
  });
});
