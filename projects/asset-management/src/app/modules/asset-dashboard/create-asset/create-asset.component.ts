import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AssetService } from '../../../services/asset.service';
import { DashboardTabsService } from '../dashboard-tabs.service';

@Component({
  selector: 'app-create-asset',
  templateUrl: './create-asset.component.html',
  styleUrls: ['./create-asset.component.css'],
})
export class CreateAssetComponent implements OnInit, OnDestroy {
  private tabSubscription?: Subscription;

  // Left column fields
  company = '';
  assetTag = '';
  serial = '';
  model = '';
  status = '';
  defaultLocation = '';

  // Right column fields
  assetName = '';
  orderNumber = '';
  purchaseDate = '';
  eolDate = '';
  quantity = '';
  unitOfMeasure = '';
  purchaseCost = '';
  isReturnable = true;

  // Dropdown options
  companies = ['Kristu Jayanti University', 'KJC Trust'];
  models: any[] = [];
  statuses: any[] = [];
  locations: any[] = [];
  unitsOfMeasure: any[] = [];

  // Searchable dropdown properties
  assetTagSearch = '';
  showTagDropdown = false;
  filteredModels: any[] = [];

  // UI state
  showSuccess = false;
  isLoading = false;
  errorMessage = '';
  billFile: File | null = null;
  isCloneMode = false;
  today = new Date().toISOString().substring(0, 10);

  constructor(
    private router: Router,
    private assetService: AssetService,
    private cdr: ChangeDetectorRef,
    @Optional() private dashboardTabsService: DashboardTabsService
  ) { }

  ngOnInit(): void {
    this.loadDropdowns();

    // If this tab is already active when clone is triggered (component already alive,
    // so *ngIf won't recreate it and ngOnInit won't re-run), listen for the tab
    // becoming active again so we can apply clone data immediately.
    // We skip the first emission (BehaviorSubject replays current value on subscribe)
    // because loadDropdowns() already handles the initial clone via tryApplyClone().
    if (this.dashboardTabsService) {
      let isFirstEmission = true;
      this.tabSubscription = this.dashboardTabsService.activeTab$.subscribe(tabId => {
        if (isFirstEmission) {
          isFirstEmission = false;
          return; // skip initial replay — loadDropdowns handles it
        }
        if (tabId === 'create-asset' && this.dashboardTabsService?.cloneAssetData) {
          // Dropdowns are already loaded since component is alive; apply now
          this.applyCloneDataIfPresent();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.tabSubscription?.unsubscribe();
  }

  loadDropdowns(): void {
    let pending = 4; // number of dropdown calls

    const tryApplyClone = () => {
      pending--;
      if (pending === 0) this.applyCloneDataIfPresent();
    };

    this.assetService.getLocations().subscribe({
      next: (res: any) => {
        const rows = res?.responseData?.data?.locations ?? [];
        this.locations = rows.map((r: any) => ({ id: r.locationId, name: r.locationName }));
        tryApplyClone();
      },
      error: () => tryApplyClone()
    });

    this.assetService.getStatuses().subscribe({
      next: (res: any) => {
        const rows = res?.responseData?.data?.statuses ?? [];
        this.statuses = rows.map((r: any) => ({ id: r.statusId, name: r.statusName }));
        tryApplyClone();
      },
      error: () => tryApplyClone()
    });

    this.assetService.getAssetTags().subscribe({
      next: (res: any) => {
        const tags = res?.responseData?.data?.assetTags ?? [];
        this.models = tags.map((t: any) => ({ id: t.id, name: t.assetTagName }));
        this.filteredModels = this.models;
        tryApplyClone();
      },
      error: () => tryApplyClone()
    });

    this.assetService.getUnits().subscribe({
      next: (res: any) => {
        const rows = res?.responseData?.data?.units ?? [];
        this.unitsOfMeasure = rows.map((u: any) => ({ id: u._id ?? u.id, name: u.name ?? u.unitOfMeasure ?? u.acronym ?? '—' }));
        tryApplyClone();
      },
      error: () => tryApplyClone()
    });
  }

  private applyCloneDataIfPresent(): void {
    if (!this.dashboardTabsService?.cloneAssetData) return;
    const d = this.dashboardTabsService.cloneAssetData;
    this.dashboardTabsService.cloneAssetData = null; // consume it

    // Reset any existing form data before prefilling from clone
    this.orderNumber = '';
    this.eolDate = '';
    this.quantity = '';
    this.unitOfMeasure = '';
    this.billFile = null;
    this.errorMessage = '';

    this.isCloneMode = true;
    this.assetName = d.assetName;
    this.serial = d.serial;
    this.status = d.statusId;
    this.defaultLocation = d.locationId;
    this.purchaseCost = d.purchaseCost;
    this.purchaseDate = d.purchaseDate;
    this.isReturnable = d.isReturnable;

    // Set asset tag (model) and its display name in the searchable dropdown
    this.model = d.assetTagId;
    const found = this.models.find(m => m.id === d.assetTagId);
    this.assetTagSearch = found ? found.name : d.assetTagName;

    this.cdr.detectChanges();
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

  blockNonIntegers(event: KeyboardEvent): void {
    // Allow: backspace, delete, tab, escape, enter, arrow keys, home, end
    const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowed.includes(event.key)) return;
    // Block anything that isn't a digit
    if (!/^\d$/.test(event.key)) {
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

    if (this.purchaseDate && this.purchaseDate > this.today) {
      this.errorMessage = 'Purchase Date cannot be a future date.';
      return;
    }

    this.isLoading = true;

    const payload = {
      assetName: this.assetName.trim(),
      assetTagId: this.model,
      statusId: this.status,
      defaultLocation: this.defaultLocation || null,
      serial: this.serial != null ? this.serial.toString().trim() : '',
      purchaseCost: this.purchaseCost != null ? this.purchaseCost.toString().trim() : '',
      purchaseDate: this.purchaseDate ? this.purchaseDate.trim() : '',
      isReturnable: this.isReturnable,
      quantity: this.quantity ? parseInt(this.quantity, 10) : 1,
      unitOfMeasureId: this.unitOfMeasure || null,
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
    this.defaultLocation = '';
    this.assetName = '';
    this.orderNumber = '';
    this.purchaseDate = '';
    this.eolDate = '';
    this.quantity = '';
    this.unitOfMeasure = '';
    this.purchaseCost = '';
    this.isReturnable = true;
    this.billFile = null;
    this.errorMessage = '';
  }
}
