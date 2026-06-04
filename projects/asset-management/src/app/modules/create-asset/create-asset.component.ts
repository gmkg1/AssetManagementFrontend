import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-asset',
  templateUrl: './create-asset.component.html',
  styleUrls: ['./create-asset.component.css'],
})
export class CreateAssetComponent {

  // â”€â”€ Left column fields â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  company         = '';
  assetTag        = '';
  serial          = '';
  model           = '';
  status          = '';
  category        = 'Consumables';
  defaultLocation = '';

  // â”€â”€ Right column fields â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  assetName    = '';
  orderNumber  = '';
  warranty     = '';
  purchaseDate = '';
  eolDate      = '';
  supplier     = '';
  purchaseCost = '';
  isReturnable = true;

  // â”€â”€ Dropdown options â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  companies  = ['Kristu Jayanti University', 'KJC Trust'];
  models     = ['MacBook Pro 13"', 'Dell Latitude 14', 'HP EliteBook', 'Lenovo ThinkPad'];
  statuses   = ['Available', 'Deployed', 'Under Maintenance', 'Retired'];
  categories = ['Consumables', 'I.T', 'Electricals', 'Sound', 'Stationery', 'Housekeeping', 'Furniture'];
  locations  = ['SDC Lab', 'Admin Block', 'Library', 'Sports Block', 'PFA Wing'];
  suppliers  = ['Dell India', 'Apple Reseller', 'HP India', 'Lenovo Store'];

  // â”€â”€ UI state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  showSuccess      = false;
  isLoading        = false;
  errorMessage     = '';
  isDragOver       = false;
  assetImageFile   : File | null = null;
  assetImagePreview: string | null = null;
  billFile         : File | null = null;

  constructor(private router: Router) {}
  // â”€â”€ Bill upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  onBillSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.billFile = input.files[0];
    }
  }

  // â”€â”€ Asset image upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  goBack()         : void { this.router.navigate(['/kjusys/view-assets']); }
  goToDashboard()  : void { this.router.navigate(['/kjusys/asset-dashboard']); }
  goToIssueAsset() : void { this.router.navigate(['/kjusys/issue-asset']); }
  goToIssueLog()   : void { this.router.navigate(['/kjusys/issue-log']); }
  goToReturnLog()  : void { this.router.navigate(['/kjusys/return-log']); }
  goToReports()    : void { this.router.navigate(['/kjusys/reports']); }

  // â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  onSubmit(): void {
    this.errorMessage = '';

    if (!this.assetTag.trim()) {
      this.errorMessage = 'Asset Tag is required.';
      return;
    }
    if (!this.status) {
      this.errorMessage = 'Status is required.';
      return;
    }

    this.isLoading = true;

    const payload = {
      company:         this.company,
      assetTag:        this.assetTag,
      serial:          this.serial,
      model:           this.model,
      status:          this.status,
      category:        this.category,
      defaultLocation: this.defaultLocation,
      assetName:       this.assetName,
      orderNumber:     this.orderNumber,
      warranty:        this.warranty,
      purchaseDate:    this.purchaseDate,
      eolDate:         this.eolDate,
      supplier:        this.supplier,
      purchaseCost:    this.purchaseCost,
      isReturnable:    this.isReturnable,
    };

    console.log('Create Asset payload:', payload);

    // TODO: replace with real API call via AssetService
    setTimeout(() => {
      this.isLoading   = false;
      this.showSuccess = true;
    }, 600);
  }

  // â”€â”€ Reset form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  createAnother(): void {
    this.showSuccess      = false;
    this.company          = '';
    this.assetTag         = '';
    this.serial           = '';
    this.model            = '';
    this.status           = '';
    this.category         = 'Consumables';
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
