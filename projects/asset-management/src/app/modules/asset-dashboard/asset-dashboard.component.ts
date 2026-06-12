import { Component, OnInit, OnDestroy } from '@angular/core';
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
    private dashboardTabsService: DashboardTabsService
  ) {}

  ngOnInit(): void {
    this.syncTabFromUrl();

    this.subscription = this.dashboardTabsService.activeTab$.subscribe(tabId => {
      this.activeTabId = tabId;
      this.syncUrlFromTab(tabId);
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  get visibleTabs(): TabItem[] {
    if (this.activeTabId === 'edit-asset') {
      // Temporarily inject Edit Asset tab when it is active
      const hasEditTab = this.tabs.some(t => t.id === 'edit-asset');
      if (!hasEditTab) {
        return [
          ...this.tabs.slice(0, 3), // Put after Create Asset
          { id: 'edit-asset', label: 'Edit Asset' },
          ...this.tabs.slice(3)
        ];
      }
    }
    return this.tabs;
  }

  onTabSelect(tabId: string): void {
    this.dashboardTabsService.changeTab(tabId);
  }

  private syncTabFromUrl(): void {
    const url = this.router.url;
    if (url.includes('view-assets')) {
      this.dashboardTabsService.changeTab('view-assets');
    } else if (url.includes('create-asset-tag')) {
      this.dashboardTabsService.changeTab('create-asset-tag');
    } else if (url.includes('create-asset')) {
      this.dashboardTabsService.changeTab('create-asset');
    } else if (url.includes('edit-asset')) {
      const match = url.match(/edit-asset\/([^/?#]+)/);
      if (match && match[1]) {
        this.dashboardTabsService.editAssetId = match[1];
      }
      this.dashboardTabsService.changeTab('edit-asset');
    } else if (url.includes('issue-asset')) {
      this.dashboardTabsService.changeTab('issue-asset');
    } else if (url.includes('return-asset')) {
      this.dashboardTabsService.changeTab('return-asset');
    } else if (url.includes('issue-log')) {
      this.dashboardTabsService.changeTab('issue-log');
    } else if (url.includes('return-log')) {
      this.dashboardTabsService.changeTab('return-log');
    } else if (url.includes('reports')) {
      this.dashboardTabsService.changeTab('reports');
    } else {
      this.dashboardTabsService.changeTab('dashboard');
    }
  }

  private syncUrlFromTab(tabId: string): void {
    const routeMap: Record<string, string> = {
      'dashboard': 'asset-dashboard',
      'view-assets': 'view-assets',
      'create-asset': 'create-asset',
      'edit-asset': 'edit-asset',
      'issue-asset': 'issue-asset',
      'return-asset': 'return-asset',
      'issue-log': 'issue-log',
      'return-log': 'return-log',
      'create-asset-tag': 'create-asset-tag',
      'reports': 'reports'
    };
    const path = routeMap[tabId];
    if (path) {
      const currentUrl = this.router.url;
      if (!currentUrl.includes(`/asset-management/${path}`)) {
        let finalPath = `/kjusys/asset-management/${path}`;
        if (tabId === 'edit-asset' && this.dashboardTabsService.editAssetId) {
          finalPath = `/kjusys/asset-management/edit-asset/${this.dashboardTabsService.editAssetId}`;
        }
        this.router.navigate([finalPath], { replaceUrl: true });
      }
    }
  }
}
