import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AssetService } from '../../services/asset.service';
import { Breadcrumb } from '@libs/shared-ui';

@Component({
  selector: 'app-create-asset-tag',
  templateUrl: './create-asset-tag.component.html',
  styleUrls: ['./create-asset-tag.component.css'],
})
export class CreateAssetTagComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', callback: () => this.router.navigate(['/kjusys/asset-management/asset-dashboard']) },
    { label: 'Create Asset Tag' },
  ];

  // Form fields
  category      = '';
  categoryName  = '';
  assetTagName  = '';
  displayId     = '';
  classification = '';
  assetImageFile: File | null = null;
  assetImagePreview: string | null = null;

  // Dropdown options — shaped for lib-dropdown-lib (idField='id', textField='title')
  categories      : any[] = [];
  displayIds      = [
    { id: 'MSE', title: 'MSE' }, { id: 'KBD', title: 'KBD' }, { id: 'MON', title: 'MON' },
    { id: 'LPT', title: 'LPT' }, { id: 'PRN', title: 'PRN' }, { id: 'SCN', title: 'SCN' },
    { id: 'PRJ', title: 'PRJ' }
  ];
  classifications = [
    { id: 'Returnable', title: 'Returnable' },
    { id: 'Non-Returnable', title: 'Non-Returnable' },
    { id: 'Consumable', title: 'Consumable' }
  ];

  // Selected items arrays for lib-dropdown-lib
  selectedCategory      : any[] = [];
  selectedDisplayId     : any[] = [];
  selectedClassification: any[] = [];

  // UI state
  showSuccess  = false;
  isLoading    = false;
  errorMessage = '';
  isDragOver   = false;

  constructor(private router: Router, private assetService: AssetService) {}

  ngOnInit(): void {
    this.assetService.getCategories().subscribe({
      next: (res: any) => {
        const rows = res?.responseData?.data?.assets ?? [];
        // Shape for lib-dropdown-lib: {id, title}
        this.categories = rows.map((r: any) => ({ id: r.categoryId, title: r.categoryName }));
      }
    });
  }

  @HostListener('document:click')
  onDocumentClick(): void {}

  closeAllDropdowns(): void {}
  toggleDropdown(name: string, event: Event): void {}

  // lib-dropdown-lib selection handlers
  onCategoryChange(selected: any[]): void {
    this.category     = selected[0]?.id   ?? '';
    this.categoryName = selected[0]?.title ?? '';
  }
  onDisplayIdChange(selected: any[]): void {
    this.displayId = selected[0]?.id ?? '';
  }
  onClassificationChange(selected: any[]): void {
    this.classification = selected[0]?.id ?? '';
  }

  selectOption(field: string, value: any, event: Event): void {}

  // Image upload
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

  // Navigation
  goBack(): void         { this.router.navigate(['/kjusys/asset-management/create-asset']); }
  goToDashboard(): void  { this.router.navigate(['/kjusys/asset-management/asset-dashboard']); }
  goToIssueAsset(): void { this.router.navigate(['/kjusys/asset-management/issue-asset']); }
  goToIssueLog(): void   { this.router.navigate(['/kjusys/asset-management/issue-log']); }
  goToReturnLog(): void  { this.router.navigate(['/kjusys/asset-management/return-log']); }
  goToReports(): void    { this.router.navigate(['/kjusys/asset-management/reports']); }

  // Submit
  onSubmit(): void {
    this.errorMessage = '';

    if (!this.category || !this.assetTagName || !this.displayId || !this.classification) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;

    const payload = {
      category:       this.category,
      assetTagName:   this.assetTagName.trim(),
      displayId:      this.displayId.trim(),
      classification: this.classification,
    };

    console.log('Create Asset Tag payload:', payload);

    this.assetService.createAssetTag(payload).subscribe({
      next: (res: any) => {
        this.isLoading   = false;
        this.showSuccess = true;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.responseData?.errors?.[0] || err?.error?.error || 'Failed to create asset tag.';
      }
    });
  }

  createAnother(): void {
    this.showSuccess          = false;
    this.category             = '';
    this.categoryName         = '';
    this.assetTagName         = '';
    this.displayId            = '';
    this.classification       = '';
    this.selectedCategory     = [];
    this.selectedDisplayId    = [];
    this.selectedClassification = [];
    this.assetImageFile       = null;
    this.assetImagePreview    = null;
    this.errorMessage         = '';
  }
}
