import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AssetDashboardComponent } from './asset-dashboard.component';

describe('AssetDashboardComponent', () => {
  let component: AssetDashboardComponent;
  let fixture: ComponentFixture<AssetDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssetDashboardComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule
      ]
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

  it('should calculate readyDashSmall correctly', () => {
    const expected =
      ((component.readyToDeploy / component.totalAssets) *
        component.circumferenceSmall).toFixed(2);

    expect(component.readyDashSmall).toBe(expected);
  });

  it('should calculate deployedDashSmall correctly', () => {
    const expected =
      ((component.deployed / component.totalAssets) *
        component.circumferenceSmall).toFixed(2);

    expect(component.deployedDashSmall).toBe(expected);
  });

  it('should close sidebar on document click', () => {
    component.sidebarOpen = true;

    component.onDocumentClick();

    expect(component.sidebarOpen).toBeFalse();
  });
});
