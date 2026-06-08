import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService } from '../../services/asset.service';

export interface Asset {
  id: string;
  name: string;
  department: string;
  category: string;
  status: string;
  assignedTo: string;
  purchaseDate: string;
  condition: string;
  assetTag: string;
  serial: string;
  checkoutDate: string;
  model: string;
  modelNo: string;
  returnable: string;
  purchaseCost: string;
  location: string;
  block: string;
  quantity: number;
  issuedTo?: {
    name: string; studentId: string; department: string;
    email: string; phone: string; checkoutDate: string; returnDate: string;
  };
}

export interface FilterOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-view-assets',
  templateUrl: './view-assets.component.html',
  styleUrls: ['./view-assets.component.scss'],
})
export class ViewAssetsComponent implements OnInit, OnDestroy {
  view: 'list' | 'detail' = 'list';
  selectedAsset: Asset | null = null;
  detailTab: 'info'|'licenses'|'components'|'assets'|'history'|'maintenances'|'files' = 'info';

  isLoading = true;
  apiError: string | null = null;

  categories: FilterOption[] = [];
  locations: FilterOption[] = [];
  statuses: FilterOption[] = [];

  selectedCategoryId = '';
  selectedLocationId = '';
  selectedStatusId = '';
  purchaseDate = '';
  searchQuery = '';
  assetTagQuery = '';
  private assetTagTimer: ReturnType<typeof setTimeout> | null = null;

  currentPage = 1;
  totalPages = 1;
  totalRecords = 0;
  pageSize = 10;

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      if (i === 1 || i === this.totalPages || Math.abs(i - this.currentPage) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== -1) pages.push(-1);
    }
    return pages;
  }

  tabs = [
    { key: 'info', label: 'Info', icon: 'M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z' },
    { key: 'licenses', label: 'Licenses', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z' },
    { key: 'components', label: 'Components', icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z' },
    { key: 'assets', label: 'Assets', icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z' },
    { key: 'history', label: 'History', icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
    { key: 'maintenances', label: 'Maintenances', icon: 'M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.653-4.655m5.8-5.8 1.875-1.875a1.875 1.875 0 0 1 2.652 2.652l-1.875 1.875m-5.8 5.8-.8.8' },
    { key: 'files', label: 'Files', icon: 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3' },
  ];

  actions = [
    { label: 'Edit Asset', color: '#E53935', icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125' },
    { label: 'Issue Asset', color: '#43A047', icon: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z' },
    { label: 'Add Note', color: '#1E88E5', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z' },
    { label: 'Clone Asset', color: '#757575', icon: 'M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75' },
    { label: 'Return and Delete', color: '#FB8C00', icon: 'M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3' },
  ];

  assets: Asset[] = [];
  totalCount = 0;
  availableCount = 0;
  deployedCount = 0;
  maintenanceCount = 0;
  assetsDropdownOpen = false;
  sidebarOpen = false;

  constructor(private router: Router, private route: ActivatedRoute, private assetService: AssetService) {}

  ngOnInit(): void {
    this.loadFilterOptions();
    this.route.queryParams.subscribe((params: Record<string, string>) => {
      if (params['category']) this.selectedCategoryId = params['category'];
      this.loadAssets();
    });
  }

  ngOnDestroy(): void {
    if (this.assetTagTimer) clearTimeout(this.assetTagTimer);
  }

  private loadFilterOptions(): void {
    this.assetService.getCategories().subscribe({
      next: (response: any) => {
        const rows = response?.responseData?.data?.assets ?? [];
        this.categories = rows.map((r: any) => ({ id: r.categoryId, name: r.categoryName }));
      }
    });
    this.assetService.getLocations().subscribe({
      next: (response: any) => {
        const rows = response?.responseData?.data?.locations ?? [];
        this.locations = rows.map((r: any) => ({ id: r.locationId, name: r.locationName }));
      }
    });
    this.assetService.getStatuses().subscribe({
      next: (response: any) => {
        const rows = response?.responseData?.data?.statuses ?? [];
        this.statuses = rows.map((r: any) => ({ id: r.statusId, name: r.statusName }));
      }
    });
  }

  private loadAssets(): void {
    this.isLoading = true;
    this.apiError = null;
    this.loadStatusCounts();
    this.assetService.getAssets({
      page: this.currentPage,
      pageSize: this.pageSize,
      assetName: this.searchQuery.trim() || undefined,
      assetTagName: this.assetTagQuery.trim() || undefined,
      categoryId: this.selectedCategoryId || undefined,
      locationId: this.selectedLocationId || undefined,
      statusId: this.selectedStatusId || undefined,
      purchaseDateFrom: this.purchaseDate || undefined,
    }).subscribe({
      next: (response: any) => {
        const data = response?.responseData?.data ?? {};
        const raw: any[] = data.assets ?? [];
        this.totalRecords = data.totalRecords ?? raw.length;
        this.totalPages = data.totalPages ?? 1;
        this.currentPage = data.currentPage ?? this.currentPage;
        this.assets = raw.map((item, i) => this.mapToAsset(item, i));
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load assets:', err);
        this.apiError = 'Could not load assets from the server.';
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadAssets();
  }

  clearFilters(): void {
    this.selectedCategoryId = '';
    this.selectedLocationId = '';
    this.selectedStatusId = '';
    this.purchaseDate = '';
    this.searchQuery = '';
    this.assetTagQuery = '';
    this.currentPage = 1;
    this.loadAssets();
  }

  onAssetTagInput(value: string): void {
    this.assetTagQuery = value;
    if (this.assetTagTimer) clearTimeout(this.assetTagTimer);
    if (!value || value.trim().length < 3) return;
    this.assetTagTimer = setTimeout(() => this.onFilterChange(), 350);
  }

  private loadStatusCounts(): void {
    this.assetService.getStatusSummary().subscribe({
      next: (response: any) => {
        const rows: any[] = response?.responseData?.data?.assets ?? [];
        let total = 0, readyToDeploy = 0, deployed = 0, maintenance = 0;
        rows.forEach(r => {
          total += r.assetCount ?? 0;
          if (r.statusName === 'Ready to Deploy') readyToDeploy = r.assetCount ?? 0;
          else if (r.statusName === 'Deployed') deployed = r.assetCount ?? 0;
          else if (r.statusName === 'Under Maintenance') maintenance = r.assetCount ?? 0;
        });
        this.totalCount = total;
        this.availableCount = readyToDeploy;
        this.deployedCount = deployed;
        this.maintenanceCount = maintenance;
      }
    });
  }

  prevPage(): void { if (this.currentPage > 1) { this.currentPage--; this.loadAssets(); } }
  nextPage(): void { if (this.currentPage < this.totalPages) { this.currentPage++; this.loadAssets(); } }
  goToPage(p: number): void { if (p !== this.currentPage) { this.currentPage = p; this.loadAssets(); } }

  private mapToAsset(item: any, index: number): Asset {
    return {
      id: item.assetSerialNumber ?? `AST-${String(index + 1).padStart(3, '0')}`,
      name: item.assetName ?? '—',
      department: item.location ?? '—',
      category: item.category ?? '—',
      status: item.status ?? '—',
      assignedTo: '—',
      purchaseDate: item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
      condition: 'Good',
      assetTag: item.assetTagName ?? '—',
      serial: item.assetSerialNumber ?? '—',
      checkoutDate: '—',
      model: item.assetTagName ?? '—',
      modelNo: '—',
      returnable: item.isIssuable ? 'Yes' : 'No',
      purchaseCost: item.purchaseCost != null ? `Rs. ${item.purchaseCost.toLocaleString()}` : '—',
      location: item.location ?? '—',
      block: '—',
      quantity: item.quantity ?? 0,
    };
  }

  @HostListener('document:click')
  onDocumentClick(): void { this.sidebarOpen = false; }

  openDetail(asset: Asset): void { this.selectedAsset = asset; this.detailTab = 'info'; this.view = 'detail'; }
  backToList(): void { this.view = 'list'; this.selectedAsset = null; }
  goToDashboard(): void { this.router.navigate(['/']); }
  goToIssueAsset(): void { this.router.navigate(['/assets/issue']); }
  goToIssueLog(): void { this.router.navigate(['/assets/issue-log']); }
  goToReturnLog(): void { this.router.navigate(['/assets/return-log']); }
  goToReports(): void { this.router.navigate(['/assets/reports']); }
  issueAsset(asset: Asset): void {
    this.router.navigate(['/assets/issue'], { queryParams: { assetId: asset.id, assetName: asset.name, assetTag: asset.assetTag, assetModel: asset.model, assetCategory: asset.category } });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Ready to Deploy': 'status-available',
      'Deployed': 'status-deployed',
      'Under Maintenance': 'status-maintenance',
      'Damaged': 'status-retired',
      'Dead Stock': 'status-retired',
    };
    return map[status] ?? 'status-available';
  }

  getConditionClass(c: string): string {
    const map: Record<string, string> = { 'Good': 'condition-good', 'Fair': 'condition-fair', 'Poor': 'condition-poor' };
    return map[c] ?? 'condition-good';
  }

  copyToClipboard(value: string): void { navigator.clipboard?.writeText(value); }
}
