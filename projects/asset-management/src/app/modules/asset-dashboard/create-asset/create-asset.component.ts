import { Component, HostListener, OnInit, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { AssetService } from '../../../services/asset.service';
import { DashboardTabsService } from '../dashboard-tabs.service';

@Component({
  selector: 'app-create-asset',
  templateUrl: './create-asset.component.html',
  styleUrls: ['./create-asset.component.css'],
})
export class CreateAssetComponent implements OnInit {

  // Left column fields
  company = '';
  assetTag = '';
  serial = '';
  model = '';
  status = '';
  category = '';
  defaultLocation = '';

  // Right column fields
  assetName = '';
  orderNumber = '';
  warranty = '';
  purchaseDate = '';
  eolDate = '';
  supplier = '';
  purchaseCost = '';
  isReturnable = true;

  // Dropdown options
  companies = ['Kristu Jayanti University', 'KJC Trust'];
  models: any[] = [];
  statuses: any[] = [];
  categories: any[] = [];
  locations: any[] = [];
  suppliers = ['Dell India', 'Apple Reseller', 'HP India', 'Lenovo Store'];

  // Searchable dropdown properties
  assetTagSearch = '';
  showTagDropdown = false;
  filteredModels: any[] = [];

  // UI state
  showSuccess = false;
  isLoading = false;
  errorMessage = '';
  billFile: File | null = null;

  constructor(
    private router: Router,
    private assetService: AssetService,
    @Optional() private dashboardTabsService: DashboardTabsService
  ) { }

  ngOnInit(): void {
    this.loadDropdowns();
  }

  loadDropdowns(): void {
    this.assetService.getCategories().subscribe({
      next: (res: any) => {
        const rows = res?.responseData?.data?.assets ?? [];
        this.categories = rows.map((r: any) => ({ id: r.categoryId, name: r.categoryName }));
      }
    });

    this.assetService.getLocations().subscribe({
      next: (res: any) => {
        const rows = res?.responseData?.data?.locations ?? [];
        this.locations = rows.map((r: any) => ({ id: r.locationId, name: r.locationName }));
      }
    });

    this.assetService.getStatuses().subscribe({
      next: (res: any) => {
        const rows = res?.responseData?.data?.statuses ?? [];
        this.statuses = rows.map((r: any) => ({ id: r.statusId, name: r.statusName }));
      }
    });

    this.assetService.getAssetTags().subscribe({
      next: (res: any) => {
        const tags = res?.responseData?.data?.assetTags ?? [];
        this.models = tags.map((t: any) => ({ id: t.id, name: t.assetTagName }));
        this.filteredModels = this.models;
      }
    });
  }

  // Search filter for dropdown
  filterAssetTags(): void {
    this.showTagDropdown = true;
    const search = this.assetTagSearch.toLowerCase();
    this.filteredModels = this.models.filter(m => m.name.toLowerCase().includes(search));
  }

  selectAssetTag(t: any): void {
    this.model = t.id;
    this.assetTagSearch = t.name;
    this.showTagDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.showTagDropdown = false;
  }

  // Bill upload
  onBillSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.billFile = input.files[0];
    }
  }


  // Navigation
  goBack(): void {
    if (this.dashboardTabsService) {
      this.dashboardTabsService.changeTab('view-assets');
    } else {
      this.router.navigate(['/kjusys/asset-management/view-assets']);
    }
  }
  goToDashboard(): void {
    if (this.dashboardTabsService) {
      this.dashboardTabsService.changeTab('dashboard');
    } else {
      this.router.navigate(['/kjusys/asset-management/asset-dashboard']);
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
  goToReports(): void {
    if (this.dashboardTabsService) {
      this.dashboardTabsService.changeTab('reports');
    } else {
      this.router.navigate(['/kjusys/asset-management/reports']);
    }
  }
  goToCreateTag(): void {
    if (this.dashboardTabsService) {
      this.dashboardTabsService.changeTab('create-asset-tag');
    } else {
      this.router.navigate(['/kjusys/asset-management/create-asset-tag']);
    }
  }

  blockNonNumbers(event: KeyboardEvent): void {
    if (['.', ',', 'e', 'E', '-', '+'].includes(event.key)) {
      event.preventDefault();
    }
  }

  // Submit
  onSubmit(): void {
    this.errorMessage = '';

    if (!this.model) {
      this.errorMessage = 'Model (Asset Tag) is required.';
      return;
    }
    if (!this.status) {
      this.errorMessage = 'Status is required.';
      return;
    }
    if (!this.assetName.trim()) {
      this.errorMessage = 'Asset Name is required.';
      return;
    }

    if (this.eolDate && this.purchaseDate && this.eolDate < this.purchaseDate) {
      this.errorMessage = 'EOL Date cannot be before Purchase Date.';
      return;
    }

    this.isLoading = true;

    const payload = {
      assetName: this.assetName.trim(),
      assetTagId: this.model,
      statusId: this.status,
      defaultLocation: this.defaultLocation || null,
      serial: this.serial.trim(),
      purchaseCost: this.purchaseCost.trim(),
      purchaseDate: this.purchaseDate.trim(),
      isReturnable: this.isReturnable,
    };

    console.log('Create Asset payload:', payload);

    this.assetService.createAsset(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.showSuccess = true;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.responseData?.errors?.[0] || err?.error?.error || 'Failed to create asset.';
      }
    });
  }

  createAnother(): void {
    this.showSuccess = false;
    this.company = '';
    this.assetTag = '';
    this.assetTagSearch = '';
    this.serial = '';
    this.model = '';
    this.status = '';
    this.category = '';
    this.defaultLocation = '';
    this.assetName = '';
    this.orderNumber = '';
    this.warranty = '';
    this.purchaseDate = '';
    this.eolDate = '';
    this.supplier = '';
    this.purchaseCost = '';
    this.isReturnable = true;
    this.billFile = null;
    this.errorMessage = '';
  }
}
