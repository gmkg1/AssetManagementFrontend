import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';

export interface ReturnRecord {
  assetName: string;
  assetTag: string;
  classification: 'Asset' | 'Component' | 'Consumable' | 'Accessory';
  total: number;
  returnType: string;
  returnTo: string;
  returnDate: string;
  department: string;
  selected: boolean;
}

const PAGE_SIZE = 8;

@Component({
  selector: 'app-return-log',
  templateUrl: './return-log.component.html',
  styleUrls: ['./return-log.component.css'],
})
export class ReturnLogComponent implements OnInit, OnDestroy {

  assetsDropdownOpen = false;

  // â”€â”€ Filter state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  filterOpen = false;
  filterClassifications: string[] = [];
  readonly classificationFilterOptions = ['Asset', 'Component', 'Consumable', 'Accessory'];

  // â”€â”€ View state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  selectedRecord: ReturnRecord | null = null;

  // â”€â”€ Department tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  departments = ['I.T', 'Electrical', 'Sound', 'Stationery', 'Housekeeping', 'Furnitures'];
  activeDept = 'I.T';

  searchQuery = '';
  currentPage = 1;

  // â”€â”€ Form fields (detail view) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  formAssetName      = '';
  formAssetTag       = '';
  formClassification = '';
  formTotal: number | null = null;
  formReturnType     = '';
  formReturnTo       = '';
  formReturnDate     = '';

  classificationOptions = ['Asset', 'Component', 'Consumable', 'Accessory'];
  returnTypeOptions     = ['Permanent Return', 'Temporary Return', 'Damaged Return', 'Lost Report'];
  returnToOptions       = ['IT Department', 'Admin Office', 'Library', 'Lab Store', 'Principal Office'];

  // â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  allRecords: ReturnRecord[] = [
    { assetName: 'Laptops',           assetTag: '1210073015', classification: 'Asset',      total: 320, returnType: '', returnTo: '', returnDate: '', department: 'I.T',          selected: false },
    { assetName: 'Desktops',          assetTag: '1210073015', classification: 'Asset',      total: 320, returnType: '', returnTo: '', returnDate: '', department: 'I.T',          selected: false },
    { assetName: 'VOIP Phones',       assetTag: '1210073015', classification: 'Component',  total: 320, returnType: '', returnTo: '', returnDate: '', department: 'I.T',          selected: false },
    { assetName: 'Displays',          assetTag: '1210073015', classification: 'Consumable', total: 320, returnType: '', returnTo: '', returnDate: '', department: 'I.T',          selected: false },
    { assetName: 'Tablets',           assetTag: '1210073015', classification: 'Accessory',  total: 320, returnType: '', returnTo: '', returnDate: '', department: 'I.T',          selected: false },
    { assetName: 'CCTV',              assetTag: '1210073015', classification: 'Consumable', total: 320, returnType: '', returnTo: '', returnDate: '', department: 'I.T',          selected: false },
    { assetName: 'Keyboards',         assetTag: '1210073015', classification: 'Consumable', total: 320, returnType: '', returnTo: '', returnDate: '', department: 'I.T',          selected: false },
    { assetName: 'Mouse',             assetTag: '1210073015', classification: 'Consumable', total: 320, returnType: '', returnTo: '', returnDate: '', department: 'I.T',          selected: false },
    { assetName: 'Servers',           assetTag: '1210073015', classification: 'Asset',      total: 12,  returnType: '', returnTo: '', returnDate: '', department: 'I.T',          selected: false },
    { assetName: 'Routers',           assetTag: '1210073015', classification: 'Asset',      total: 45,  returnType: '', returnTo: '', returnDate: '', department: 'I.T',          selected: false },
    { assetName: 'Projectors',        assetTag: '1210073016', classification: 'Asset',      total: 40,  returnType: '', returnTo: '', returnDate: '', department: 'Electrical',   selected: false },
    { assetName: 'UPS Units',         assetTag: '1210073017', classification: 'Asset',      total: 25,  returnType: '', returnTo: '', returnDate: '', department: 'Electrical',   selected: false },
    { assetName: 'Air Conditioners',  assetTag: '1210073018', classification: 'Asset',      total: 60,  returnType: '', returnTo: '', returnDate: '', department: 'Electrical',   selected: false },
    { assetName: 'Fans',              assetTag: '1210073019', classification: 'Consumable', total: 200, returnType: '', returnTo: '', returnDate: '', department: 'Electrical',   selected: false },
    { assetName: 'Extension Boards',  assetTag: '1210073020', classification: 'Accessory',  total: 150, returnType: '', returnTo: '', returnDate: '', department: 'Electrical',   selected: false },
    { assetName: 'PA Speakers',       assetTag: '1210073021', classification: 'Asset',      total: 18,  returnType: '', returnTo: '', returnDate: '', department: 'Sound',        selected: false },
    { assetName: 'Wireless Mics',     assetTag: '1210073022', classification: 'Asset',      total: 30,  returnType: '', returnTo: '', returnDate: '', department: 'Sound',        selected: false },
    { assetName: 'Amplifiers',        assetTag: '1210073023', classification: 'Component',  total: 12,  returnType: '', returnTo: '', returnDate: '', department: 'Sound',        selected: false },
    { assetName: 'Mixers',            assetTag: '1210073024', classification: 'Asset',      total: 8,   returnType: '', returnTo: '', returnDate: '', department: 'Sound',        selected: false },
    { assetName: 'Whiteboard Markers',assetTag: '1210073025', classification: 'Consumable', total: 500, returnType: '', returnTo: '', returnDate: '', department: 'Stationery',   selected: false },
    { assetName: 'Laser Pointers',    assetTag: '1210073026', classification: 'Accessory',  total: 20,  returnType: '', returnTo: '', returnDate: '', department: 'Stationery',   selected: false },
    { assetName: 'Staplers',          assetTag: '1210073027', classification: 'Consumable', total: 80,  returnType: '', returnTo: '', returnDate: '', department: 'Stationery',   selected: false },
    { assetName: 'Mop & Bucket Sets', assetTag: '1210073028', classification: 'Consumable', total: 60,  returnType: '', returnTo: '', returnDate: '', department: 'Housekeeping', selected: false },
    { assetName: 'Vacuum Cleaners',   assetTag: '1210073029', classification: 'Asset',      total: 15,  returnType: '', returnTo: '', returnDate: '', department: 'Housekeeping', selected: false },
    { assetName: 'Cleaning Trolleys', assetTag: '1210073030', classification: 'Asset',      total: 20,  returnType: '', returnTo: '', returnDate: '', department: 'Housekeeping', selected: false },
    { assetName: 'Office Chairs',     assetTag: '1210073031', classification: 'Asset',      total: 400, returnType: '', returnTo: '', returnDate: '', department: 'Furnitures',   selected: false },
    { assetName: 'Standing Desks',    assetTag: '1210073032', classification: 'Asset',      total: 50,  returnType: '', returnTo: '', returnDate: '', department: 'Furnitures',   selected: false },
    { assetName: 'Conference Tables', assetTag: '1210073033', classification: 'Asset',      total: 12,  returnType: '', returnTo: '', returnDate: '', department: 'Furnitures',   selected: false },
    { assetName: 'Bookshelves',       assetTag: '1210073034', classification: 'Asset',      total: 80,  returnType: '', returnTo: '', returnDate: '', department: 'Furnitures',   selected: false },
  ];

  // â”€â”€ Computed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  get filteredRecords(): ReturnRecord[] {
    const q = this.searchQuery.toLowerCase();
    return this.allRecords.filter(r => {
      const matchesDept   = r.department === this.activeDept;
      const matchesSearch = !q || r.assetName.toLowerCase().includes(q) || r.assetTag.toLowerCase().includes(q) || r.classification.toLowerCase().includes(q);
      const matchesClass  = this.filterClassifications.length === 0 || this.filterClassifications.includes(r.classification);
      return matchesDept && matchesSearch && matchesClass;
    });
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filteredRecords.length / PAGE_SIZE)); }

  get pagedRecords(): ReturnRecord[] {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    return this.filteredRecords.slice(start, start + PAGE_SIZE);
  }

  get selectedCount(): number { return this.pagedRecords.filter(r => r.selected).length; }
  get allChecked(): boolean { return this.pagedRecords.length > 0 && this.pagedRecords.every(r => r.selected); }
  get someChecked(): boolean { return this.pagedRecords.some(r => r.selected) && !this.allChecked; }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const cur   = this.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [1, 2, 3];
    if (cur > 4) pages.push(-1);
    if (cur > 3 && cur < total - 2) pages.push(cur);
    pages.push(-1);
    pages.push(total - 2, total - 1, total);
    return [...new Set(pages)].filter((p, idx, arr) => {
      if (p === -1) return arr[idx - 1] !== -1;
      return true;
    });
  }

  constructor(private router: Router) {}

  ngOnInit(): void  {}
  ngOnDestroy(): void {}

  @HostListener('document:click')
  onDocumentClick(): void { this.filterOpen = false; }

  // â”€â”€ Filter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  toggleFilterPanel(event: Event): void { event.stopPropagation(); this.filterOpen = !this.filterOpen; }

  toggleClassFilter(c: string): void {
    const i = this.filterClassifications.indexOf(c);
    if (i === -1) this.filterClassifications.push(c);
    else this.filterClassifications.splice(i, 1);
    this.currentPage = 1;
  }

  clearFilters(): void { this.filterClassifications = []; this.currentPage = 1; }

  // â”€â”€ Export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  exportCSV(): void {
    const rows = this.filteredRecords;
    const headers = ['Name', 'Asset Tag', 'Classification', 'Total', 'Return Type', 'Return To', 'Return Date', 'Department'];
    const csv = [
      headers.join(','),
      ...rows.map(r => [r.assetName, r.assetTag, r.classification, r.total, r.returnType || 'â€”', r.returnTo || 'â€”', r.returnDate || 'â€”', r.department].join(','))
    ].join('\n');
    this.downloadCSV(csv, `return-log-${this.activeDept}.csv`);
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  // â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  setDept(dept: string): void {
    this.activeDept  = dept;
    this.searchQuery = '';
    this.currentPage = 1;
    this.selectedRecord = null;
    this.clearSelection();
  }

  prevPage(): void { if (this.currentPage > 1) { this.currentPage--; this.clearSelection(); } }
  nextPage(): void { if (this.currentPage < this.totalPages) { this.currentPage++; this.clearSelection(); } }
  goToPage(p: number): void { this.currentPage = p; this.clearSelection(); }

  // â”€â”€ Multi-select â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  toggleAll(): void {
    const next = !this.allChecked;
    this.pagedRecords.forEach(r => r.selected = next);
  }

  toggleRow(row: ReturnRecord): void { row.selected = !row.selected; }

  clearSelection(): void { this.pagedRecords.forEach(r => r.selected = false); }

  bulkExportSelected(): void {
    const rows = this.pagedRecords.filter(r => r.selected);
    if (!rows.length) return;
    const headers = ['Name', 'Asset Tag', 'Classification', 'Total', 'Return Type', 'Return To', 'Return Date', 'Department'];
    const csv = [
      headers.join(','),
      ...rows.map(r => [r.assetName, r.assetTag, r.classification, r.total, r.returnType || 'â€”', r.returnTo || 'â€”', r.returnDate || 'â€”', r.department].join(','))
    ].join('\n');
    this.downloadCSV(csv, `return-log-selected.csv`);
  }

  goToDashboard(): void  { this.router.navigate(['/kjusys/asset-dashboard']); }
  goToViewAssets(): void { this.router.navigate(['/kjusys/view-assets']); }
  goToIssueAsset(): void { this.router.navigate(['/kjusys/issue-asset']); }
  goToIssueLog():   void { this.router.navigate(['/kjusys/issue-log']); }
  goToReports(): void    { this.router.navigate(['/kjusys/reports']); }

  // â”€â”€ Row click â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  openDetail(row: ReturnRecord): void {
    this.selectedRecord     = row;
    this.formAssetName      = row.assetName;
    this.formAssetTag       = row.assetTag;
    this.formClassification = row.classification;
    this.formTotal          = row.total;
    this.formReturnType     = row.returnType;
    this.formReturnTo       = row.returnTo;
    this.formReturnDate     = row.returnDate;
  }

  closeDetail(): void { this.selectedRecord = null; }

  onSubmit(): void {
    if (!this.selectedRecord) return;
    this.selectedRecord.returnType = this.formReturnType;
    this.selectedRecord.returnTo   = this.formReturnTo;
    this.selectedRecord.returnDate = this.formReturnDate;
    this.closeDetail();
  }

  getClassClass(c: string): string {
    const map: any = { 'Asset': 'class-asset', 'Component': 'class-component', 'Consumable': 'class-consumable', 'Accessory': 'class-accessory' };
    return map[c] || '';
  }
}
