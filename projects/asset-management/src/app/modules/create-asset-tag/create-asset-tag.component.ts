import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-asset-tag',
  templateUrl: './create-asset-tag.component.html',
  styleUrls: ['./create-asset-tag.component.css'],
})
export class CreateAssetTagComponent {

  // â”€â”€ Form fields â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  category      = '';
  assetTypeName = '';
  displayId     = '';
  classification = '';
  assetImageFile: File | null = null;
  assetImagePreview: string | null = null;

  // â”€â”€ Dropdown options â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  categories      = ['IT â€“ Information Technology', 'Electricals', 'Sound', 'Stationery', 'Housekeeping', 'Furniture'];
  assetTypeNames  = ['Mouse', 'Keyboard', 'Monitor', 'Laptop', 'Printer', 'Scanner', 'Projector'];
  displayIds      = ['MSE', 'KBD', 'MON', 'LPT', 'PRN', 'SCN', 'PRJ'];
  classifications = ['Returnable', 'Non-Returnable', 'Consumable'];

  // â”€â”€ Dropdown open states â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  catOpen    = false;
  typeOpen   = false;
  dispOpen   = false;
  classOpen  = false;

  // â”€â”€ UI state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  showSuccess  = false;
  isLoading    = false;
  errorMessage = '';
  isDragOver   = false;

  constructor(private router: Router) {}

  @HostListener('document:click')
  onDocumentClick(): void {
    this.catOpen   = false;
    this.typeOpen  = false;
    this.dispOpen  = false;
    this.classOpen = false;
  }

  closeAllDropdowns(): void {
    this.catOpen   = false;
    this.typeOpen  = false;
    this.dispOpen  = false;
    this.classOpen = false;
  }

  toggleDropdown(name: 'cat' | 'type' | 'disp' | 'class', event: Event): void {
    event.stopPropagation();
    const wasOpen = name === 'cat'   ? this.catOpen
                  : name === 'type'  ? this.typeOpen
                  : name === 'disp'  ? this.dispOpen
                  : this.classOpen;
    this.closeAllDropdowns();
    if (name === 'cat')   this.catOpen   = !wasOpen;
    if (name === 'type')  this.typeOpen  = !wasOpen;
    if (name === 'disp')  this.dispOpen  = !wasOpen;
    if (name === 'class') this.classOpen = !wasOpen;
  }

  selectOption(field: 'category' | 'assetTypeName' | 'displayId' | 'classification', value: string, event: Event): void {
    event.stopPropagation();
    (this as any)[field] = value;
    this.closeAllDropdowns();
  }

  // â”€â”€ Image upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.loadImageFile(input.files[0]);
    }
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
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.loadImageFile(file);
    }
  }

  private loadImageFile(file: File): void {
    this.assetImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.assetImagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.assetImageFile    = null;
    this.assetImagePreview = null;
  }

  // â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  goBack(): void         { this.router.navigate(['/kjusys/view-assets']); }
  goToDashboard(): void  { this.router.navigate(['/kjusys/asset-dashboard']); }
  goToIssueAsset(): void { this.router.navigate(['/kjusys/issue-asset']); }
  goToIssueLog(): void   { this.router.navigate(['/kjusys/issue-log']); }
  goToReturnLog(): void  { this.router.navigate(['/kjusys/return-log']); }
  goToReports(): void    { this.router.navigate(['/kjusys/reports']); }

  // â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  onSubmit(): void {
    this.errorMessage = '';

    if (!this.category || !this.assetTypeName || !this.displayId || !this.classification) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;

    const payload = {
      category:       this.category,
      assetTypeName:  this.assetTypeName,
      displayId:      this.displayId,
      classification: this.classification,
      assetImage:     this.assetImageFile?.name ?? null,
    };

    console.log('Create Asset Tag payload:', payload);

    // TODO: replace with real API call via AssetService
    setTimeout(() => {
      this.isLoading   = false;
      this.showSuccess = true;
    }, 600);
  }

  createAnother(): void {
    this.showSuccess       = false;
    this.category          = '';
    this.assetTypeName     = '';
    this.displayId         = '';
    this.classification    = '';
    this.assetImageFile    = null;
    this.assetImagePreview = null;
    this.errorMessage      = '';
  }
}
