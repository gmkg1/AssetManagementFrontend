import { Component, HostListener, OnInit, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { AssetService } from '../../../services/asset.service';
import { DashboardTabsService } from '../dashboard-tabs.service';

@Component({
  selector: 'app-create-asset-tag',
  templateUrl: './create-asset-tag.component.html',
  styleUrls: ['./create-asset-tag.component.css'],
})
export class CreateAssetTagComponent implements OnInit {

  // Form fields
  category = '';
  categoryName = '';
  assetTagName = '';
  displayId = '';
  classification = '';
  assetImageFile: File | null = null;
  assetImagePreview: string | null = null;

  // Dropdown options
  categories: any[] = [];
  displayIds = ['MSE', 'KBD', 'MON', 'LPT', 'PRN', 'SCN', 'PRJ'];
  classifications = ['Returnable', 'Non-Returnable', 'Consumable'];

  // Dropdown open states
  catOpen = false;
  typeOpen = false;
  dispOpen = false;
  classOpen = false;

  // UI state
  showSuccess = false;
  isLoading = false;
  errorMessage = '';
  isDragOver = false;

  constructor(
    private router: Router,
    private assetService: AssetService,
    @Optional() private dashboardTabsService: DashboardTabsService
  ) { }

  ngOnInit(): void {
    this.assetService.getCategories().subscribe({
      next: (res: any) => {
        const rows = res?.responseData?.data?.assets ?? [];
        this.categories = rows.map((r: any) => ({ id: r.categoryId, name: r.categoryName }));
      }
    });
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.catOpen = false;
    this.typeOpen = false;
    this.dispOpen = false;
    this.classOpen = false;
  }

  closeAllDropdowns(): void {
    this.catOpen = false;
    this.typeOpen = false;
    this.dispOpen = false;
    this.classOpen = false;
  }

  toggleDropdown(name: 'cat' | 'type' | 'disp' | 'class', event: Event): void {
    event.stopPropagation();
    const wasOpen = name === 'cat' ? this.catOpen
      : name === 'type' ? this.typeOpen
        : name === 'disp' ? this.dispOpen
          : this.classOpen;
    this.closeAllDropdowns();
    if (name === 'cat') this.catOpen = !wasOpen;
    if (name === 'type') this.typeOpen = !wasOpen;
    if (name === 'disp') this.dispOpen = !wasOpen;
    if (name === 'class') this.classOpen = !wasOpen;
  }

  selectOption(field: 'category' | 'assetTagName' | 'displayId' | 'classification', value: any, event: Event): void {
    event.stopPropagation();
    if (field === 'category') {
      this.category = value.id;
      this.categoryName = value.name;
    } else {
      (this as any)[field] = value;
    }
    this.closeAllDropdowns();
  }

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
    this.assetImageFile = null;
    this.assetImagePreview = null;
  }

  // Navigation
  goBack(): void {
    if (this.dashboardTabsService) {
      this.dashboardTabsService.changeTab('create-asset');
    } else {
      this.router.navigate(['/kjusys/asset-management/create-asset']);
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

  // Submit
  onSubmit(): void {
    this.errorMessage = '';

    if (!this.category || !this.assetTagName || !this.displayId || !this.classification) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('category', this.category);
    formData.append('assetTagName', this.assetTagName.trim());
    formData.append('displayId', this.displayId.trim());
    formData.append('classification', this.classification);
    if (this.assetImageFile) {
      formData.append('assetImage', this.assetImageFile, this.assetImageFile.name);
    }

    console.log('Create Asset Tag payload (FormData)');

    this.assetService.createAssetTag(formData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.showSuccess = true;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.responseData?.errors?.[0] || err?.error?.error || 'Failed to create asset tag.';
      }
    });
  }

  createAnother(): void {
    this.showSuccess = false;
    this.category = '';
    this.categoryName = '';
    this.assetTagName = '';
    this.displayId = '';
    this.classification = '';
    this.assetImageFile = null;
    this.assetImagePreview = null;
    this.errorMessage = '';
  }
}
