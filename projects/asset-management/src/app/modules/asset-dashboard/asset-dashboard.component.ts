import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabItem } from '@libs/tabs';
import { DashboardTabsService } from './dashboard-tabs.service';

@Component({
  selector: 'app-asset-dashboard',
  templateUrl: './asset-dashboard.component.html',
  styleUrls: ['./asset-dashboard.component.scss'],
  providers: [DashboardTabsService]
})
export class AssetDashboardComponent implements OnInit, OnDestroy {
  activeTabId = 'dashboard';
  editAssetVisible = true;
  private subscription!: Subscription;

  tabs: TabItem[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'view-assets', label: 'View Assets' },
    { id: 'create-asset', label: 'Create Asset' },
    { id: 'issue-asset', label: 'Issue Asset' },
    { id: 'return-asset', label: 'Return Asset' },
    { id: 'issue-log', label: 'Issue Log' },
    { id: 'return-log', label: 'Return Log' },
    { id: 'create-asset-tag', label: 'Create Asset Tag' },
    { id: 'reports', label: 'Reports' },
  ];

  constructor(
    private router: Router,
    private dashboardTabsService: DashboardTabsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription = this.dashboardTabsService.activeTab$.subscribe(tabId => {
      if (tabId === 'edit-asset') {
        // Force destroy + recreate the edit-asset component so ngOnInit re-fires
        // with the new editAssetId, even if we're already on the edit-asset tab.
        this.editAssetVisible = false;
        this.activeTabId = tabId;
        this.cdr.detectChanges();
        this.editAssetVisible = true;
      } else {
        this.activeTabId = tabId;
      }
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  get visibleTabs(): TabItem[] {
    if (this.activeTabId === 'edit-asset') {
      const hasEditTab = this.tabs.some(t => t.id === 'edit-asset');
      if (!hasEditTab) {
        return [
          ...this.tabs.slice(0, 3),
          { id: 'edit-asset', label: 'Edit Asset' },
          ...this.tabs.slice(3)
        ];
      }
    }
    if (this.activeTabId === 'edit-warranty-licenses') {
      const hasTab = this.tabs.some(t => t.id === 'edit-warranty-licenses');
      if (!hasTab) {
        return [
          ...this.tabs.slice(0, 2),
          { id: 'edit-warranty-licenses', label: 'Edit Warranty/Licenses' },
          ...this.tabs.slice(2)
        ];
      }
    }
    return this.tabs;
  }

  onTabSelect(tabId: string): void {
    this.dashboardTabsService.changeTab(tabId);
  }
}
