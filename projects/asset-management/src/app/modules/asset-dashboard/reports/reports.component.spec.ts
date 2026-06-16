import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { ReportsComponent } from './reports.component';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportsComponent],
      imports: [RouterTestingModule, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to I.T department', () => {
    expect(component.activeDept).toBe('I.T');
  });

  it('should change department', () => {
    component.selectDept('Sound');
    expect(component.activeDept).toBe('Sound');
    expect(component.currentPage).toBe(1);
  });

  it('should filter by search query', () => {
    component.searchQuery = 'Laptops';
    expect(component.assets.every(a => a.name.toLowerCase().includes('laptops'))).toBeTrue();
  });
});
