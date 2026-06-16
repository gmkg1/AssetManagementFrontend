import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AssetService } from '../../services/asset.service';
import { Breadcrumb } from '@libs/shared-ui';

export interface Asset {
  _id?: string;
  id: string;
  name: string;
  department: string;
  category: string;
  status: string;
  statusId?: string;
  locationId?: string;
  assetTagId?: string;
  isReturnable?: boolean;
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
  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', callback: () => this.router.navigate(['/kjusys/asset-management/asset-dashboard']) },
    { label: 'View Assets' },
  ];
  view: 'list' | 'detail' = 'list';
  selectedAsset: Asset | null = null;
  detailTab: 'info'|'licenses'|'components'|'assets'|'history'|'maintenances'|'files' = 'info';

  isLoading = true;
  apiError: string | null = null;

  categories: FilterOption[] = [];
  locations: FilterOption[] = [];
  statuses: FilterOption[] = [];

  assetLicenses: any[] = [];
  assetWarranties: any[] = [];
  assetComponents: any[] = [];

  selectedCategoryId = '';
  selectedLocationId = '';
  selectedStatusId = '';
  purchaseDate = '';
  searchQuery = '';
  assetTagQuery = '';

  private searchSubject = new Subject<void>();
  private searchSub!: Subscription;

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
    { key: 'files', label: 'File', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z' },
    { key: 'history', label: 'History', icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
  ];

  showStatusDropdown = false;

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

  constructor(private router: Router, private route: ActivatedRoute, private assetService: AssetService , private cdr : ChangeDetectorRef ) {}

  ngOnInit(): void {
    // Debounce search input — fires from the 1st character, 300ms after user stops typing
    this.searchSub = this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadAssets();
    });

    this.loadFilterOptions();
    this.route.queryParams.subscribe((params: Record<string, string>) => {
      if (params['category']) this.selectedCategoryId = params['category'];
      this.loadAssets();
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
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
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load assets:', err);
        this.apiError = 'Could not load assets from the server.';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadAssets();
  }

  onSearchInput(): void {
    const nameLen = this.searchQuery.length;
    const tagLen = this.assetTagQuery.length;
    // Fire only when a field hits exactly 3 chars (the minimum to start filtering),
    // or when a field is fully cleared back to 0 (to reset the list).
    // 1–2 chars in either field do nothing.
    const nameTrigger = nameLen === 3 || (nameLen === 0 && tagLen === 0);
    const tagTrigger  = tagLen  === 3 || (tagLen  === 0 && nameLen === 0);
    if (nameTrigger || tagTrigger) {
      this.searchSubject.next();
    }
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
        this.cdr.detectChanges();
      }
    });
  }

  prevPage(): void { if (this.currentPage > 1) { this.currentPage--; this.loadAssets(); } }
  nextPage(): void { if (this.currentPage < this.totalPages) { this.currentPage++; this.loadAssets(); } }
  goToPage(p: number): void { if (p !== this.currentPage) { this.currentPage = p; this.loadAssets(); } }

  private mapToAsset(item: any, index: number): Asset {
    return {
      _id: item._id,
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
  onDocumentClick(): void {
    this.sidebarOpen = false;
    this.showStatusDropdown = false;
  }

  openDetail(asset: Asset): void {
    this.selectedAsset = asset;
    this.detailTab = 'components'; // Default tab components as shown in Figma
    this.view = 'detail';

    this.assetLicenses = [];
    this.assetWarranties = [];
    this.assetComponents = [];

    if (asset._id) {
      this.assetService.getAssetDetails(asset._id).subscribe({
        next: (res: any) => {
          const data = res?.responseData?.data;
          if (data && this.selectedAsset && this.selectedAsset._id === asset._id) {
            let normalizedPurchaseDate = '';
            if (data.purchaseDate) {
              try {
                normalizedPurchaseDate = new Date(data.purchaseDate).toISOString().substring(0, 10);
              } catch (e) {
                normalizedPurchaseDate = '';
              }
            }
            this.selectedAsset = {
              ...this.selectedAsset,
              statusId: data.statusId,
              locationId: data.locationId,
              assetTagId: data.assetTagId,
              serial: data.assetSerialNumber || this.selectedAsset.serial,
              purchaseCost: data.purchaseCost != null ? data.purchaseCost.toString() : this.selectedAsset.purchaseCost,
              purchaseDate: normalizedPurchaseDate || this.selectedAsset.purchaseDate,
              isReturnable: data.isIssuable || false
            };
          }
        }
      });

      this.assetService.getLicensesAndWarranty(asset._id).subscribe({
        next: (res: any) => {
          const data = res?.responseData?.data || {};
          this.assetLicenses = data.licenses || [];
          this.assetWarranties = data.warranty || [];
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Failed to load licenses and warranty:', err);
        }
      });

      this.assetService.getAssetComponents(asset._id).subscribe({
        next: (res: any) => {
          const data = res?.responseData?.data || {};
          this.assetComponents = data.components || [];
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Failed to load components:', err);
        }
      });
    }
  }

  selectStatus(status: { id: string, name: string }, event: Event): void {
    event.stopPropagation();
    this.showStatusDropdown = false;
    if (!this.selectedAsset || !this.selectedAsset._id) return;

    this.isLoading = true;
    const rawCost = (this.selectedAsset.purchaseCost || '').replace('Rs. ', '').replace(/,/g, '');
    const payload = {
      _id:             this.selectedAsset._id,
      assetName:       this.selectedAsset.name,
      assetTagId:      this.selectedAsset.assetTagId || '',
      statusId:        status.id,
      defaultLocation: this.selectedAsset.locationId || null,
      serial:          this.selectedAsset.serial || '',
      purchaseCost:    rawCost,
      purchaseDate:    this.selectedAsset.purchaseDate || '',
      isReturnable:    this.selectedAsset.isReturnable ?? false
    };

    this.assetService.updateAsset(payload).subscribe({
      next: (res: any) => {
        if (this.selectedAsset) {
          this.selectedAsset.status = status.name;
          this.selectedAsset.statusId = status.id;
        }
        this.isLoading = false;
        this.loadAssets();
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Failed to update status:', err);
      }
    });
  }

  backToList(): void { this.view = 'list'; this.selectedAsset = null; }
  goToDashboard(): void { this.router.navigate(['/kjusys/asset-management/asset-dashboard']); }
  goToIssueAsset(): void { this.router.navigate(['/kjusys/asset-management/issue-asset']); }
  goToIssueLog(): void { this.router.navigate(['/kjusys/asset-management/issue-log']); }
  goToReturnLog(): void { this.router.navigate(['/kjusys/asset-management/return-log']); }
  goToReports(): void { this.router.navigate(['/kjusys/asset-management/reports']); }
  issueAsset(asset: Asset): void {
    this.router.navigate(['/kjusys/asset-management/issue-asset'], { queryParams: { assetId: asset.id, assetName: asset.name, assetTag: asset.assetTag, assetModel: asset.model, assetCategory: asset.category } });
  }

  editAsset(asset: Asset): void {
    const id = asset._id || asset.id;
    this.router.navigate(['/kjusys/asset-management/edit-asset', id]);
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
