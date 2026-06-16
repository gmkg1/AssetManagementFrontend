import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { AssetService } from '../../../services/asset.service';
import { DashboardTabsService } from '../dashboard-tabs.service';

export interface ReportAsset {
  id: string;
  name: string;
  category: string;
  type: 'Asset';
  total: number;
  readyToDeploy: number;
  deployed: number;
  deadStock: number;
  underService: number;
  damaged: number;
  checked: boolean;
}

export interface CategoryFilter {
  categoryId: string;
  categoryName: string;
}

const PAGE_SIZE = 8;

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {
  readonly allTab = 'All';

  /** Tabs built from /categories-list */
  categoryFilters: CategoryFilter[] = [];
  /** Active category tab — null means "All" */
  activeCategoryId: string | null = null;

  searchQuery = '';
  currentPage = 1;
  allChecked = false;
  sidebarOpen = false;
  isLoading = true;
  apiError: string | null = null;

  assets: ReportAsset[] = [];
  serverTotalPages = 1;
  serverTotalRecords = 0;

  get activeTabLabel(): string {
    if (!this.activeCategoryId) return this.allTab;
    return this.categoryFilters.find(c => c.categoryId === this.activeCategoryId)?.categoryName ?? this.allTab;
  }

  get departments(): string[] {
    return [this.allTab, ...this.categoryFilters.map(c => c.categoryName)];
  }

  get activeDept(): string {
    return this.activeTabLabel;
  }

  get pagedAssets(): ReportAsset[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q || q.length < 3) return this.assets;
    return this.assets.filter(a => a.name.toLowerCase().includes(q));
  }

  get totalPages(): number { return this.serverTotalPages; }
  get totalRecords(): number { return this.serverTotalRecords; }

  get pageNumbers(): (number | '...')[] {
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 2) return [1, 2, 3, '...', total];
    if (current >= total - 1) return [1, '...', total - 2, total - 1, total];
    return [1, '...', current, '...', total];
  }

  get selectedCount(): number { return this.pagedAssets.filter(a => a.checked).length; }

  get deptTotal(): number { return this.pagedAssets.reduce((s, a) => s + a.total, 0); }
  get deptReady(): number { return this.pagedAssets.reduce((s, a) => s + a.readyToDeploy, 0); }
  get deptDeployed(): number { return this.pagedAssets.reduce((s, a) => s + a.deployed, 0); }
  get deptDeadStock(): number { return this.pagedAssets.reduce((s, a) => s + a.deadStock, 0); }
  get deptUnderService(): number { return this.pagedAssets.reduce((s, a) => s + a.underService, 0); }
  get deptDamaged(): number { return this.pagedAssets.reduce((s, a) => s + a.damaged, 0); }

  constructor(
    private router: Router,
    private assetService: AssetService,
    private cdr: ChangeDetectorRef,
    @Optional() private dashboardTabsService: DashboardTabsService
  ) {}

  ngOnInit(): void {
    this.loadCategoriesAndData();
  }

  ngOnDestroy(): void {}

  onSearchInput(): void {
    this.cdr.detectChanges();
  }

  /** Load categories for tabs, then trigger initial data load */
  private loadCategoriesAndData(): void {
    this.isLoading = true;
    this.apiError = null;

    this.assetService.getCategoriesList().subscribe({
      next: (res: any) => {
        const rd = res?.responseData?.data ?? res?.responseData ?? {};
        const cats: any[] = Array.isArray(rd.categories) ? rd.categories
          : Array.isArray(rd.data) ? rd.data
          : Array.isArray(rd) ? rd
          : [];
        this.categoryFilters = cats.map(c => ({
          categoryId: c.categoryId ?? c._id,
          categoryName: c.categoryName ?? c.name ?? '—'
        }));
        this.loadAllAssets(1);
      },
      error: () => {
        // Still load data even if categories fail
        this.loadAllAssets(1);
      }
    });
  }

  /** "All" tab → GET /assets (full paginated list) */
  private loadAllAssets(page: number): void {
    this.isLoading = true;
    this.apiError = null;
    this.allChecked = false;
    this.currentPage = page;

    this.assetService.getAssets({ page, pageSize: PAGE_SIZE }).subscribe({
      next: (response: any) => {
        const rd = response?.responseData?.data ?? response?.responseData ?? {};
        const raw: any[] = Array.isArray(rd.assets) ? rd.assets
          : Array.isArray(rd.data) ? rd.data
          : [];
        this.serverTotalPages = rd.totalPages ?? 1;
        this.serverTotalRecords = rd.totalRecords ?? raw.length;
        this.assets = this.mapAssetsToReport(raw);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load /assets:', err);
        this.apiError = 'Could not load report data from the server.';
        this.assets = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Category tab → GET /grp?categoryId=<id> */
  private loadGrpData(page: number): void {
    this.isLoading = true;
    this.apiError = null;
    this.allChecked = false;
    this.currentPage = page;

    this.assetService.getAssetGrouped({
      categoryId: this.activeCategoryId!,
      page,
      pageSize: PAGE_SIZE
    }).subscribe({
      next: (response: any) => {
        const rd = response?.responseData?.data ?? response?.responseData ?? {};
        const raw: any[] = Array.isArray(rd.assets) ? rd.assets
          : Array.isArray(rd.data) ? rd.data
          : Array.isArray(rd) ? rd
          : [];
        this.serverTotalPages = rd.totalPages ?? 1;
        this.serverTotalRecords = rd.totalRecords ?? raw.length;
        this.assets = this.mapAssetsToReport(raw);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load /grp:', err);
        this.apiError = 'Could not load report data from the server.';
        this.assets = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Map /assets response items → ReportAsset (flat per-asset rows) */
  private mapAssetsToReport(raw: any[]): ReportAsset[] {
    return raw.map((item, index) => {
      const status: string = (item.status ?? '').toLowerCase();
      return {
        id: item._id ?? `ASSET-${index + 1}`,
        name: item.assetName ?? item.name ?? '—',
        category: item.category ?? item.categoryName ?? '—',
        type: 'Asset',
        total: item.quantity ?? 1,
        readyToDeploy: status.includes('ready') ? 1 : 0,
        deployed: status.includes('deployed') ? 1 : 0,
        deadStock: status.includes('dead') ? 1 : 0,
        underService: status.includes('maintenance') || status.includes('service') ? 1 : 0,
        damaged: status.includes('damage') ? 1 : 0,
        checked: false
      };
    });
  }

  /** Map /grp response items → ReportAsset (grouped status-breakdown rows) */
  private mapGrpToReport(raw: any[]): ReportAsset[] {
    return raw.map((item, index) => ({
      id: item.assetTagName ?? item._id ?? `TAG-${index + 1}`,
      name: item.assetTagName ?? item.assetName ?? item.name ?? '—',
      category: item.category ?? item.categoryName ?? '—',
      type: 'Asset',
      total: item.totalAssets ?? item.total ?? item.quantity ?? 0,
      readyToDeploy: item.ready ?? item.readyToDeploy ?? 0,
      deployed: item.deployed ?? 0,
      deadStock: item.deadStock ?? 0,
      underService: item.underMaintenance ?? item.underService ?? 0,
      damaged: item.damaged ?? 0,
      checked: false
    }));
  }

  selectDept(dept: string): void {
    if (dept === this.allTab) {
      this.activeCategoryId = null;
    } else {
      const match = this.categoryFilters.find(c => c.categoryName === dept);
      this.activeCategoryId = match?.categoryId ?? null;
    }
    this.searchQuery = '';
    this.allChecked = false;
    this.loadPage(1);
  }

  /** Route to the correct API based on active tab */
  private loadPage(page: number): void {
    if (!this.activeCategoryId) {
      this.loadAllAssets(page);
    } else {
      this.loadGrpData(page);
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void { this.sidebarOpen = false; }

  exportCSV(): void {
    const headers = ['Name', 'Category', 'Total', 'Ready to Deploy', 'Deployed', 'Dead Stock', 'Under Service', 'Damaged'];
    const csv = [
      headers.join(','),
      ...this.pagedAssets.map(a =>
        [a.name, a.category, a.total, a.readyToDeploy, a.deployed, a.deadStock, a.underService, a.damaged].join(',')
      )
    ].join('\n');
    this.downloadCSV(csv, `report-${this.activeDept}.csv`);
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  toggleAll(): void {
    this.allChecked = !this.allChecked;
    this.pagedAssets.forEach(a => a.checked = this.allChecked);
  }

  goToPage(p: number | '...'): void {
    if (p !== '...' && p !== this.currentPage) {
      this.loadPage(p);
    }
  }
  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1);
    }
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadPage(this.currentPage + 1);
    }
  }

  bulkExport(): void {
    const rows = this.pagedAssets.filter(a => a.checked);
    const headers = ['Name', 'Category', 'Total', 'Ready to Deploy', 'Deployed', 'Dead Stock', 'Under Service', 'Damaged'];
    const csv = [
      headers.join(','),
      ...rows.map(a =>
        [a.name, a.category, a.total, a.readyToDeploy, a.deployed, a.deadStock, a.underService, a.damaged].join(',')
      )
    ].join('\n');
    this.downloadCSV(csv, `report-${this.activeDept}-selected.csv`);
  }

  bulkDelete(): void {
    if (confirm(`Delete ${this.selectedCount} item(s)?`)) {
      const checkedIds = new Set(this.pagedAssets.filter(a => a.checked).map(a => a.id));
      this.assets = this.assets.filter(a => !checkedIds.has(a.id));
      this.allChecked = false;
      this.cdr.detectChanges();
    }
  }

  clearSelection(): void {
    this.pagedAssets.forEach(a => a.checked = false);
    this.allChecked = false;
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      Asset: 'class-asset',
      Component: 'class-component',
      Consumable: 'class-consumable',
      Accessory: 'class-accessory'
    };
    return map[type] ?? '';
  }

  goToDashboard(): void {
    if (this.dashboardTabsService) {
      this.dashboardTabsService.changeTab('dashboard');
    } else {
      this.router.navigate(['/kjusys/asset-management/asset-dashboard']);
    }
  }
  goToViewAssets(): void {
    if (this.dashboardTabsService) {
      this.dashboardTabsService.changeTab('view-assets');
    } else {
      this.router.navigate(['/kjusys/asset-management/view-assets']);
    }
  }
  goToIssueAsset(): void {
    if (this.dashboardTabsService) {
      this.dashboardTabsService.changeTab('issue-asset');
    } else {
      this.router.navigate(['/kjusys/asset-management/issue-asset']);
    }
  }
  goToIssueLog(): void {
    if (this.dashboardTabsService) {
      this.dashboardTabsService.changeTab('issue-log');
    } else {
      this.router.navigate(['/kjusys/asset-management/issue-log']);
    }
  }
  goToReturnLog(): void {
    if (this.dashboardTabsService) {
      this.dashboardTabsService.changeTab('return-log');
    } else {
      this.router.navigate(['/kjusys/asset-management/return-log']);
    }
  }
}
