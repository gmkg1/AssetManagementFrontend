import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AssetService } from '../../services/asset.service';
import { Breadcrumb } from '@libs/shared-ui';

@Component({
  selector: 'app-create-asset',
  templateUrl: './create-asset.component.html',
  styleUrls: ['./create-asset.component.css'],
})
export class CreateAssetComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', callback: () => this.router.navigate(['/kjusys/asset-management/asset-dashboard']) },
    { label: 'Create Asset' },
  ];

  // Left column fields
  company         = '';
  assetTag        = '';
  serial          = '';
  model           = '';
  status          = '';
  category        = '';
  defaultLocation = '';

  // Right column fields
  assetName    = '';
  orderNumber  = '';
  warranty     = '';
  purchaseDate = '';
  eolDate      = '';
  supplier     = '';
  purchaseCost = '';
  isReturnable = true;

  // Dropdown options
  companies  = ['Kristu Jayanti University', 'KJC Trust'];
  models     : any[] = [];
  statuses   : any[] = [];
  categories : any[] = [];
  locations  : any[] = [];
  suppliers  = ['Dell India', 'Apple Reseller', 'HP India', 'Lenovo Store'];

  // Searchable dropdown properties
  assetTagSearch    = '';
  showTagDropdown   = false;
  filteredModels    : any[] = [];

  // UI state
  showSuccess      = false;
  isLoading        = false;
  errorMessage     = '';
  isDragOver       = false;
  assetImageFile   : File | null = null;
  assetImagePreview: string | null = null;
  billFile         : File | null = null;

  constructor(private router: Router, private assetService: AssetService) {}

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

  // Asset image upload
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) this.loadImageFile(input.files[0]);
  }
  onDragOver(event: DragEvent): void  { event.preventDefault(); this.isDragOver = true; }
  onDragLeave(event: DragEvent): void { event.preventDefault(); this.isDragOver = false; }
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) this.loadImageFile(file);
  }
  private loadImageFile(file: File): void {
    this.assetImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.assetImagePreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }
  removeImage(event: Event): void {
    event.stopPropagation();
    this.assetImageFile    = null;
    this.assetImagePreview = null;
  }

  // Navigation
  goBack()         : void { this.router.navigate(['/kjusys/asset-management/view-assets']); }
  goToDashboard()  : void { this.router.navigate(['/kjusys/asset-management/asset-dashboard']); }
  goToIssueAsset() : void { this.router.navigate(['/kjusys/asset-management/issue-asset']); }
  goToIssueLog()   : void { this.router.navigate(['/kjusys/asset-management/issue-log']); }
  goToReturnLog()  : void { this.router.navigate(['/kjusys/asset-management/return-log']); }
  goToReports()    : void { this.router.navigate(['/kjusys/asset-management/reports']); }
  goToCreateTag()  : void { this.router.navigate(['/kjusys/asset-management/create-asset-tag']); }

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

    this.isLoading = true;

    const payload = {
      assetName:       this.assetName.trim(),
      assetTagId:      this.model,
      statusId:        this.status,
      defaultLocation: this.defaultLocation || null,
      serial:          this.serial.trim(),
      purchaseCost:    this.purchaseCost.trim(),
      purchaseDate:    this.purchaseDate.trim(),
      isReturnable:    this.isReturnable,
    };

    console.log('Create Asset payload:', payload);

    this.assetService.createAsset(payload).subscribe({
      next: (res: any) => {
        this.isLoading   = false;
        this.showSuccess = true;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.responseData?.errors?.[0] || err?.error?.error || 'Failed to create asset.';
      }
    });
  }

  createAnother(): void {
    this.showSuccess      = false;
    this.company          = '';
    this.assetTag         = '';
    this.assetTagSearch   = '';
    this.serial           = '';
    this.model            = '';
    this.status           = '';
    this.category         = '';
    this.defaultLocation  = '';
    this.assetName        = '';
    this.orderNumber      = '';
    this.warranty         = '';
    this.purchaseDate     = '';
    this.eolDate          = '';
    this.supplier         = '';
    this.purchaseCost     = '';
    this.isReturnable     = true;
    this.assetImageFile   = null;
    this.assetImagePreview = null;
    this.billFile         = null;
    this.errorMessage     = '';
  }
}
