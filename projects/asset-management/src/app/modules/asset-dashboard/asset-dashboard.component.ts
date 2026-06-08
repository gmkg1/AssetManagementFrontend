import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AssetService } from '../../services/asset.service';

interface AssetDepartment {
  id: string;
  name: string;
  cssKey: string;
  count: number;
  unit: string;
  iconBgHex: string;
  iconStroke: string;
  iconPath: string;
}

interface IssueRecord {
  receiverName: string;
  department: string;
  issueDate: string;
  assetDept: string;
}

const CATEGORY_ICON_MAP: Record<string, { unit: string; iconBgHex: string; iconStroke: string; iconPath: string }> = {
  'IT': {
    unit: 'Assets',
    iconBgHex: '#EEEDFF',
    iconStroke: '#0F00E0',
    iconPath: 'M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25'
  },
  'I.T': {
    unit: 'Assets',
    iconBgHex: '#EEEDFF',
    iconStroke: '#0F00E0',
    iconPath: 'M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25'
  },
  'Electricals': {
    unit: 'Items',
    iconBgHex: 'rgba(255,126,134,0.1)',
    iconStroke: '#FF7E86',
    iconPath: 'm3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z'
  },
  'Sound': {
    unit: 'Equipments',
    iconBgHex: 'rgba(161,98,247,0.1)',
    iconStroke: '#A162F7',
    iconPath: 'M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 7.5a.75.75 0 0 1 .75-.75h3.19l3.22-3.22a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-3.22-3.22H7.5a.75.75 0 0 1-.75-.75V7.5Z'
  },
  'Stationery': {
    unit: 'Items',
    iconBgHex: 'rgba(246,204,13,0.1)',
    iconStroke: '#F6CC0D',
    iconPath: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125'
  },
  'Housekeeping': {
    unit: 'Items',
    iconBgHex: 'rgba(126,255,159,0.1)',
    iconStroke: '#00BA2B',
    iconPath: 'M9.813 15.904L9 21l-.813-5.096L3.096 15.096l5.096-.813L9 9.187l.813 5.096 5.096.813-5.096.813ZM19.07 5.93L18 10l-1.07-4.07L12.86 4.86l4.07-1.07L18 0l1.07 3.79 4.07 1.07-4.07 1.07Z'
  },
  'Furniture': {
    unit: 'Furnitures',
    iconBgHex: 'rgba(119,65,0,0.1)',
    iconStroke: '#A25F00',
    iconPath: 'M6 18v3h2v-3h8v3h2v-3c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2zm12-7V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v7h12z'
  }
};

const DEFAULT_ICON = {
  unit: 'Items',
  iconBgHex: 'rgba(100,100,100,0.1)',
  iconStroke: '#666666',
  iconPath: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z'
};

@Component({
  selector: 'app-asset-dashboard',
  templateUrl: './asset-dashboard.component.html',
  styleUrls: ['./asset-dashboard.component.scss']
})
export class AssetDashboardComponent implements OnInit, OnDestroy {

  departments: AssetDepartment[] = [];
  issueHistory: IssueRecord[] = [];

  totalAssets = 0;
  readyToDeploy = 0;
  deployed = 0;

  isLoading = true;
  apiError: string | null = null;

  readonly circumferenceSmall = 2 * Math.PI * 46;

  get readyDashSmall(): string {
    if (this.totalAssets === 0) return '0';
    return ((this.readyToDeploy / this.totalAssets) * this.circumferenceSmall).toFixed(2);
  }

  get deployedDashSmall(): string {
    if (this.totalAssets === 0) return '0';
    return ((this.deployed / this.totalAssets) * this.circumferenceSmall).toFixed(2);
  }

  sidebarOpen = false;

  constructor(
    private router: Router,
    private assetService: AssetService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {}

  private loadDashboardData(): void {
    this.isLoading = true;
    this.apiError = null;

    // Category cards
    this.assetService.getCategoryCount().subscribe({
      next: (response: any) => {
        const categories: any[] = response?.responseData?.data?.assets ?? [];
        this.departments = categories.map(cat => {
          const icon = CATEGORY_ICON_MAP[cat.categoryName] ?? DEFAULT_ICON;
          return {
            id: cat.categoryId,
            name: cat.categoryName,
            cssKey: cat.categoryName.toLowerCase().replace(/\s+/g, '-'),
            count: cat.assetCount ?? 0,
            unit: icon.unit,
            iconBgHex: icon.iconBgHex,
            iconStroke: icon.iconStroke,
            iconPath: icon.iconPath
          };
        });
        this.totalAssets = this.departments.reduce((sum, d) => sum + d.count, 0);
      },
      error: (err) => {
        console.error('Failed to load category counts:', err);
        this.apiError = 'Could not load department data from the server.';
      }
    });

    // Issue history table
    this.assetService.getIssuedAssets({ page: 1, pageSize: 3 }).subscribe({
      next: (response: any) => {
        const issued: any[] = response?.responseData?.data?.assets ?? [];
        this.issueHistory = issued.slice(0, 3).map(item => ({
          receiverName: item.receiverName ?? 'Unknown',
          department:   item.receiverType ?? '—',
          issueDate:    item.issueDate
            ? new Date(item.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—',
          assetDept: item.assetCategory ?? '—'
        }));
      },
      error: (err) => {
        console.error('Failed to load issued assets:', err);
      }
    });

    // Assets by status donut — use /status endpoint for accurate totals
    this.assetService.getStatusSummary().subscribe({
      next: (response: any) => {
        const rows: any[] = response?.responseData?.data?.assets ?? [];
        this.readyToDeploy = 0;
        this.deployed      = 0;
        rows.forEach(r => {
          if (r.statusName === 'Ready to Deploy') this.readyToDeploy = r.assetCount ?? 0;
          if (r.statusName === 'Deployed')        this.deployed      = r.assetCount ?? 0;
        });
        this.totalAssets = this.readyToDeploy + this.deployed;
        this.isLoading   = false;
      },
      error: (err: any) => {
        console.error('Failed to load status summary:', err);
        this.isLoading = false;
      }
    });
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.sidebarOpen = false;
  }

  viewMoreIssues(): void {
    this.router.navigate(['/assets/issue-log']);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  navigateToDeptAssets(deptId: string): void {
    this.router.navigate(['/assets/view'], { queryParams: { category: deptId } });
  }

  goToIssueLog(): void { this.router.navigate(['/assets/issue-log']); }
}
