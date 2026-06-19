import { ChangeDetectorRef, Component, HostListener, OnInit, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService } from '../../../services/asset.service';
import { DashboardTabsService } from '../dashboard-tabs.service';

@Component({
  selector: 'app-edit-asset',
  templateUrl: './edit-asset.component.html',
  styleUrls: ['./edit-asset.component.css']
})
export class EditAssetComponent implements OnInit {
  assetId = '';      // Database _id
  serialNumber = ''; // Serial label
  company = '';
  companies = ['Kristu Jayanti University', 'KJC Sports Centre', 'SDC Lab'];
  assetTag = '';     // Selected model id
  serial = '';
  model = '';
  models: any[] = [];
  // Searchable dropdown properties
  assetTagSearch = '';
  showTagDropdown = false;
  filteredModels: any[] = [];
  status = '';
  statuses: any[] = [];
  allStatuses: any[] = [];
  category = '';
  categories: any[] = [];
  defaultLocation = '';
  locations: any[] = [];
  assetName = '';
  orderNumber = '';
  purchaseDate = '';
  eolDate = '';
  purchaseCost = '';
  quantity = '';
  unitOfMeasure = '';
  unitsOfMeasure: any[] = [];

  isReturnable = false;
  errorMessage = '';

  isLoading = false;
  showSuccess = false;
  sidebarOpen = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private assetService: AssetService,
    private cdr: ChangeDetectorRef,
    @Optional() private dashboardTabsService: DashboardTabsService
  ) { }

  ngOnInit(): void {
    if (this.dashboardTabsService && this.dashboardTabsService.editAssetId) {
      this.assetId = this.dashboardTabsService.editAssetId;
      this.loadAssetDetails(this.assetId);
    } else {
      this.route.params.subscribe(params => {
        const id = params['id'];
        if (id) {
          this.assetId = id;
          this.loadAssetDetails(id);
        }
      });
    }
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
        this.cdr.detectChanges();
      }
    });

    this.assetService.getStatuses().subscribe({
      next: (res: any) => {
        const rows = res?.responseData?.data?.statuses ?? [];
        this.allStatuses = rows.map((r: any) => ({ id: r.statusId, name: r.statusName }));
        this.filterStatuses();
        this.cdr.detectChanges();
      }
    });

    this.assetService.getAssetTags().subscribe({
      next: (res: any) => {
        const tags = res?.responseData?.data?.assetTags ?? [];
        this.models = tags.map((t: any) => ({ id: t.id, name: t.assetTagName, categoryId: t.categoryId }));
        this.filteredModels = this.models;
        this.syncAssetTagSearch();
        this.cdr.detectChanges();
      }
    });

    this.assetService.getUnits().subscribe({
      next: (res: any) => {
        const rows = res?.responseData?.data?.units ?? [];
        this.unitsOfMeasure = rows.map((u: any) => ({ id: u._id ?? u.id, name: u.name ?? u.unitOfMeasure ?? u.acronym ?? '—' }));
      this.cdr.detectChanges();
      }
    });
  }

  filterStatuses(): void {
    if (this.allStatuses.length > 0) {
      this.statuses = this.allStatuses.filter(s => s.name !== 'Deployed' || s.id === this.status);
    }
  }

  loadAssetDetails(id: string): void {
    this.isLoading = true;
    this.assetService.getAssetDetails(id).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const data = res?.responseData?.data;
        if (data) {
          this.assetName = data.assetName || '';
          this.model = data.assetTagId || '';
          this.assetTag = data.assetTagId || '';
          this.category = data.categoryId || '';
          this.status = data.statusId || '';
          this.defaultLocation = data.locationId || '';
          this.serial = data.displayId || data.assetSerialNumber || '';
          this.serialNumber = data.assetSerialNumber || '';
          this.purchaseCost = data.purchaseCost != null ? data.purchaseCost.toString() : '';
          this.isReturnable = data.isIssuable || false;
          this.quantity = data.quantity != null ? data.quantity.toString() : '';
          this.unitOfMeasure = data.unitOfMeasureId || '';
          this.syncAssetTagSearch();
          this.filterStatuses();
          
          if (data.purchaseDate) {
            // Convert to YYYY-MM-DD
            try {
              this.purchaseDate = new Date(data.purchaseDate).toISOString().substring(0, 10);
            } catch (e) {
              this.purchaseDate = '';
              
            }
          }
        }
        this.cdr.detectChanges();
        
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load asset details.';

      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.sidebarOpen = false;
    this.showTagDropdown = false;
  }

  filterAssetTags(): void {
    this.showTagDropdown = true;
    const search = this.assetTagSearch.toLowerCase();
    this.filteredModels = this.models.filter(m => m.name.toLowerCase().includes(search));
  }

  selectAssetTag(t: any): void {
    this.model = t.id;
    this.assetTagSearch = t.name;
    if (t.categoryId) {
      this.category = t.categoryId;
    }
    this.showTagDropdown = false;
  }

  syncAssetTagSearch(): void {
    if (this.model && this.models.length > 0) {
      const match = this.models.find(m => m.id === this.model);
      if (match) {
        this.assetTagSearch = match.name;
        if (match.categoryId) {
          this.category = match.categoryId;
        }
      }
    }
  }

  goToCreateTag(): void {
    if (this.dashboardTabsService) {
      this.dashboardTabsService.changeTab('create-asset-tag');
    } else {
      this.router.navigate(['/kjusys/asset-management/create-asset-tag']);
    }
  }

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

  blockNonNumbers(event: KeyboardEvent): void {
    if (['.', ',', 'e', 'E', '-', '+'].includes(event.key)) {
      event.preventDefault();
    }
  }

  blockNonIntegers(event: KeyboardEvent): void {
    const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowed.includes(event.key)) return;
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.assetName || !this.assetName.trim()) {
      this.errorMessage = 'Asset Name is required.';
      return;
    }
    if (!this.status) {
      this.errorMessage = 'Status is required.';
      return;
    }
    if (!this.model) {
      this.errorMessage = 'Model (Asset Tag) is required.';
      return;
    }

    this.isLoading = true;

    const payload = {
      _id: this.assetId,
      assetName: this.assetName.trim(),
      assetTagId: this.model,
      statusId: this.status,
      defaultLocation: this.defaultLocation || null,
      serial: this.serialNumber != null ? this.serialNumber.toString().trim() : '',
      purchaseCost: this.purchaseCost != null ? this.purchaseCost.toString().trim() : '',
      purchaseDate: this.purchaseDate ? this.purchaseDate.trim() : '',
      isReturnable: this.isReturnable,
      quantity: this.quantity ? parseInt(this.quantity.toString(), 10) : 1,
      unitOfMeasureId: this.unitOfMeasure || null
    };

    this.assetService.updateAsset(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.showSuccess = true;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.responseData?.errors?.[0] || err?.error?.error || 'Failed to update asset.';
      }
    });
  }
}
