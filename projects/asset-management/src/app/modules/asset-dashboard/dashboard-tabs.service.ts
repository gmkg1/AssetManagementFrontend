import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DashboardTabsService {
  private activeTabSubject = new BehaviorSubject<string>('dashboard');
  public activeTab$ = this.activeTabSubject.asObservable();

  // Parameter state passed between tabs
  public editAssetId = '';
  public warrantyLicensesAssetId = '';
  public filterCategoryId = '';
  public filterCategoryName = '';

  // For Issue Asset tab
  public issueAssetId = '';
  public issueAssetName = '';
  public issueAssetTag = '';
  public issueAssetModel = '';
  public issueAssetCategory = '';

  // For Clone Asset — prefill data passed to create-asset tab
  public cloneAssetData: {
    assetName: string;
    assetTagId: string;
    assetTagName: string;
    statusId: string;
    locationId: string;
    serial: string;
    purchaseCost: string;
    purchaseDate: string;
    isReturnable: boolean;
  } | null = null;

  constructor() {}

  changeTab(tabId: string): void {
    this.activeTabSubject.next(tabId);
  }

  getActiveTab(): string {
    return this.activeTabSubject.value;
  }
}
