import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-asset-tag',
  templateUrl: './edit-asset-tag.component.html',
  styleUrls: ['./edit-asset-tag.component.css'],
})
export class EditAssetTagComponent implements OnInit {

  // ── Form fields ────────────────────────────────────────────────────────────
  tagId          = 0;
  category       = '';
  assetTypeName  = '';
  displayId      = '';
  classification = '';
  assetImageFile: File | null = null;
  assetImagePreview: string | null = null;

  // ── Original values (for change detection) ────────────────────────────────
  private original: any = {};

  // ── Dropdown options ───────────────────────────────────────────────────────
  categories      = ['IT – Information Technology', 'Electricals', 'Sound', 'Stationery', 'Housekeeping', 'Furniture'];
  assetTypeNames  = ['Mouse', 'Keyboard', 'Monitor', 'Laptop', 'Printer', 'Scanner', 'Projector', 'Microphone', 'Whiteboard', 'Chair', 'Vacuum Cleaner', 'Extension Board', 'Projector'];
  displayIds      = ['MSE', 'KBD', 'MON', 'LPT', 'PRN', 'SCN', 'PRJ', 'MIC', 'WBD', 'CHR', 'VCL', 'EXB'];
  classifications = ['Returnable', 'Non-Returnable', 'Consumable'];

  // ── Dropdown open states ───────────────────────────────────────────────────
  catOpen    = false;
  typeOpen   = false;
  dispOpen   = false;
  classOpen  = false;

  // ── UI state ───────────────────────────────────────────────────────────────
  showSuccess  = false;
  isLoading    = false;
  errorMessage = '';
  isDragOver   = false;

  // ── Mock data (mirrors view-asset-tag mock) ───────────────────────────────
  private mockTags: any[] = [
    { id: 1,  category: 'IT – Information Technology', assetTypeName: 'Laptop',         displayId: 'LPT', classification: 'Returnable',     imageUrl: null },
    { id: 2,  category: 'IT – Information Technology', assetTypeName: 'Mouse',           displayId: 'MSE', classification: 'Non-Returnable', imageUrl: null },
    { id: 3,  category: 'IT – Information Technology', assetTypeName: 'Keyboard',        displayId: 'KBD', classification: 'Non-Returnable', imageUrl: null },
    { id: 4,  category: 'IT – Information Technology', assetTypeName: 'Monitor',         displayId: 'MON', classification: 'Returnable',     imageUrl: null },
    { id: 5,  category: 'IT – Information Technology', assetTypeName: 'Printer',         displayId: 'PRN', classification: 'Returnable',     imageUrl: null },
    { id: 6,  category: 'Electricals',                  assetTypeName: 'Extension Board', displayId: 'EXB', classification: 'Returnable',     imageUrl: null },
    { id: 7,  category: 'Sound',                         assetTypeName: 'Microphone',     displayId: 'MIC', classification: 'Returnable',     imageUrl: null },
    { id: 8,  category: 'Stationery',                    assetTypeName: 'Whiteboard',     displayId: 'WBD', classification: 'Non-Returnable', imageUrl: null },
    { id: 9,  category: 'Furniture',                     assetTypeName: 'Chair',          displayId: 'CHR', classification: 'Returnable',     imageUrl: null },
    { id: 10, category: 'Housekeeping',                  assetTypeName: 'Vacuum Cleaner', displayId: 'VCL', classification: 'Consumable',     imageUrl: null },
    { id: 11, category: 'IT – Information Technology', assetTypeName: 'Scanner',         displayId: 'SCN', classification: 'Returnable',     imageUrl: null },
    { id: 12, category: 'IT – Information Technology', assetTypeName: 'Projector',       displayId: 'PRJ', classification: 'Returnable',     imageUrl: null },
  ];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Accept editId from either route param or query param
    const paramId   = this.route.snapshot.paramMap.get('id');
    const queryId   = this.route.snapshot.queryParamMap.get('editId');
    const id        = Number(paramId ?? queryId ?? 0);

    const tag = this.mockTags.find(t => t.id === id) ?? this.mockTags[0];
    this.tagId          = tag.id;
    this.category       = tag.category;
    this.assetTypeName  = tag.assetTypeName;
    this.displayId      = tag.displayId;
    this.classification = tag.classification;
    this.assetImagePreview = tag.imageUrl ?? null;

    // Store originals so we can show a "no changes" message
    this.original = { ...tag };
  }

  // ── Dropdown ───────────────────────────────────────────────────────────────
  @HostListener('document:click')
  onDocumentClick(): void { this.closeAllDropdowns(); }

  closeAllDropdowns(): void {
    this.catOpen = this.typeOpen = this.dispOpen = this.classOpen = false;
  }

  toggleDropdown(name: 'cat' | 'type' | 'disp' | 'class', event: Event): void {
    event.stopPropagation();
    const wasOpen = name === 'cat' ? this.catOpen : name === 'type' ? this.typeOpen : name === 'disp' ? this.dispOpen : this.classOpen;
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

  // ── Image upload ───────────────────────────────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.loadImageFile(input.files[0]);
  }

  onDragOver(event: DragEvent): void  { event.preventDefault(); this.isDragOver = true; }
  onDragLeave(event: DragEvent): void { event.preventDefault(); this.isDragOver = false; }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file?.type.startsWith('image/')) this.loadImageFile(file);
  }

  private loadImageFile(file: File): void {
    this.assetImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.assetImagePreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.assetImageFile = null;
    this.assetImagePreview = null;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  get hasChanges(): boolean {
    return this.category       !== this.original.category       ||
           this.assetTypeName  !== this.original.assetTypeName  ||
           this.displayId      !== this.original.displayId      ||
           this.classification !== this.original.classification ||
           this.assetImageFile !== null;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  onSubmit(): void {
    this.errorMessage = '';
    if (!this.category || !this.assetTypeName || !this.displayId || !this.classification) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }
    this.isLoading = true;
    const payload = {
      id:             this.tagId,
      category:       this.category,
      assetTypeName:  this.assetTypeName,
      displayId:      this.displayId,
      classification: this.classification,
      assetImage:     this.assetImageFile?.name ?? null,
    };
    console.log('Edit Asset Tag payload:', payload);
    // TODO: replace with real API call
    setTimeout(() => {
      this.isLoading   = false;
      this.showSuccess = true;
    }, 600);
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  goBack(): void { this.router.navigate(['/kjusys/asset-management/view-asset-tag']); }
}
