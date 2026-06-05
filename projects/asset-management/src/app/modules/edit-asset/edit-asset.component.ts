import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-asset',
  templateUrl: './edit-asset.component.html',
  styleUrls: ['./edit-asset.component.css']
})
export class EditAssetComponent {
  assetId = 'AST-008';
  company = '';
  companies = ['Kristu Jayanti University', 'KJC Sports Centre', 'SDC Lab'];
  assetTag = 'ITCN0038480006';
  serial = '';
  model = '';
  models = ['MacBook Pro 13"', 'Dell Inspiron 15', 'HP LaserJet Pro', 'BenQ MX550'];
  status = '';
  statuses = ['Ready to Deploy', 'Deployed', 'Under Maintenance', 'Retired'];
  category = '';
  categories = ['I.T', 'Electricals', 'Sound', 'Stationery', 'Housekeeping', 'Furniture'];
  defaultLocation = '';
  locations = ['Head Office', 'SDC Lab', 'Computer Lab', 'Storage Room'];
  assetName = 'MacBook Pro';
  orderNumber = '';
  warranty = '';
  purchaseDate = '';
  eolDate = '';
  supplier = '';
  suppliers = ['Dell', 'HP', 'Apple', 'BenQ', 'Logitech'];
  purchaseCost = '';
  billFile: File | null = null;
  isReturnable = false;
  assetImagePreview: string | ArrayBuffer | null = null;
  assetImageFile: File | null = null;
  isDragOver = false;
  errorMessage = '';
  isLoading = false;
  showSuccess = false;
  sidebarOpen = false;

  constructor(private router: Router) {}

  @HostListener('document:click')
  onDocumentClick(): void {
    this.sidebarOpen = false;
  }

  goBack(): void { this.router.navigate(['/kjusys/view-assets']); }
  goToDashboard(): void { this.router.navigate(['/kjusys/asset-dashboard']); }
  goToIssueAsset(): void { this.router.navigate(['/kjusys/issue-asset']); }
  goToReturnLog(): void { this.router.navigate(['/kjusys/return-log']); }
  goToReports(): void { this.router.navigate(['/kjusys/reports']); }

  onSubmit(): void {
    this.errorMessage = '';
    this.isLoading = true;

    setTimeout(() => {
      this.isLoading = false;
      this.showSuccess = true;
    }, 600);
  }

  onBillSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.billFile = file;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      return;
    }

    this.assetImageFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.assetImagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.assetImageFile = null;
    this.assetImagePreview = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    const file = event.dataTransfer?.files?.[0] ?? null;
    if (!file) {
      return;
    }

    this.assetImageFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.assetImagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }
}
