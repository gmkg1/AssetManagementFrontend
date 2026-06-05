import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';

export interface ReportAsset {
  id: string;
  name: string;
  type: 'Asset' | 'Component' | 'Consumable' | 'Accessory';
  total: number;
  readyToDeploy: number;
  deployed: number;
  deadStock: number;
  underService: number;
  eol: number;
  checked: boolean;
}

const PAGE_SIZE = 8;

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, OnDestroy {

  departments = ['I.T', 'Electrical', 'Sound', 'Stationery', 'Housekeeping', 'Furnitures'];
  activeDept  = 'I.T';
  searchQuery = '';
  searchField = 'all';
  searchFieldLabel = 'All Fields';
  selectedSearchField = [{ value: 'all', label: 'All Fields' }];
  searchFieldOptions = [
    { value: 'all', label: 'All Fields' },
    { value: 'name', label: 'Name' },
    { value: 'id', label: 'ID' },
    { value: 'type', label: 'Type' },
  ];
  moduleTabs = [
    { id: 'asset-dashboard', label: 'Dashboard' },
    { id: 'view-assets', label: 'View Assets' },
    { id: 'issue-asset', label: 'Issue Asset' },
    { id: 'issue-log', label: 'Issue Log' },
    { id: 'return-log', label: 'Return Log' },
    { id: 'reports', label: 'Reports' },
  ];
  activeModuleTabId = 'reports';
  currentPage = 1;
  allChecked  = false;

  // â”€â”€ Filter state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  filterOpen = false;
  filterTypes: string[] = [];
  readonly typeFilterOptions = ['Asset', 'Component', 'Consumable', 'Accessory'];

  private allAssets: Record<string, ReportAsset[]> = {
    'I.T': [
      { id: '1210073015', name: 'Laptops',     type: 'Asset',      total: 320,  readyToDeploy: 270, deployed: 130, deadStock: 10, underService: 10, eol: 10, checked: false },
      { id: '1210073015', name: 'Desktops',    type: 'Asset',      total: 320,  readyToDeploy: 270, deployed: 130, deadStock: 10, underService: 10, eol: 10, checked: false },
      { id: '1210073015', name: 'VOIP Phones', type: 'Component',  total: 320,  readyToDeploy: 270, deployed: 130, deadStock: 10, underService: 10, eol: 10, checked: false },
      { id: '1210073015', name: 'Displays',    type: 'Consumable', total: 320,  readyToDeploy: 270, deployed: 130, deadStock: 10, underService: 10, eol: 10, checked: false },
      { id: '1210073015', name: 'Tablets',     type: 'Accessory',  total: 320,  readyToDeploy: 270, deployed: 130, deadStock: 10, underService: 10, eol: 10, checked: false },
      { id: '1210073015', name: 'CCTV',        type: 'Consumable', total: 320,  readyToDeploy: 270, deployed: 130, deadStock: 10, underService: 10, eol: 10, checked: false },
      { id: '1210073015', name: 'Keyboards',   type: 'Consumable', total: 320,  readyToDeploy: 270, deployed: 130, deadStock: 10, underService: 10, eol: 10, checked: false },
      { id: '1210073015', name: 'Mouse',       type: 'Consumable', total: 320,  readyToDeploy: 270, deployed: 130, deadStock: 10, underService: 10, eol: 10, checked: false },
    ],
    'Electrical': [
      { id: '1210073016', name: 'Projectors',  type: 'Asset',      total: 45,   readyToDeploy: 30,  deployed: 12, deadStock: 2, underService: 1, eol: 0, checked: false },
      { id: '1210073017', name: 'UPS Units',   type: 'Asset',      total: 60,   readyToDeploy: 50,  deployed: 8,  deadStock: 1, underService: 1, eol: 0, checked: false },
      { id: '1210073018', name: 'Air Cond.',   type: 'Asset',      total: 30,   readyToDeploy: 25,  deployed: 4,  deadStock: 0, underService: 1, eol: 0, checked: false },
      { id: '1210073019', name: 'Fans',        type: 'Consumable', total: 120,  readyToDeploy: 100, deployed: 18, deadStock: 2, underService: 0, eol: 0, checked: false },
    ],
    'Sound': [
      { id: '1210073020', name: 'Microphones', type: 'Asset',      total: 25,   readyToDeploy: 20,  deployed: 4,  deadStock: 1, underService: 0, eol: 0, checked: false },
      { id: '1210073021', name: 'Speakers',    type: 'Asset',      total: 18,   readyToDeploy: 14,  deployed: 3,  deadStock: 1, underService: 0, eol: 0, checked: false },
      { id: '1210073022', name: 'Amplifiers',  type: 'Component',  total: 10,   readyToDeploy: 8,   deployed: 2,  deadStock: 0, underService: 0, eol: 0, checked: false },
    ],
    'Stationery': [
      { id: '1210073023', name: 'Markers',     type: 'Consumable', total: 500,  readyToDeploy: 400, deployed: 90, deadStock: 5, underService: 0, eol: 5, checked: false },
      { id: '1210073024', name: 'Notebooks',   type: 'Consumable', total: 800,  readyToDeploy: 700, deployed: 90, deadStock: 5, underService: 0, eol: 5, checked: false },
      { id: '1210073025', name: 'Pens',        type: 'Consumable', total: 1000, readyToDeploy: 900, deployed: 90, deadStock: 5, underService: 0, eol: 5, checked: false },
    ],
    'Housekeeping': [
      { id: '1210073026', name: 'Mop Sets',    type: 'Consumable', total: 40,   readyToDeploy: 35,  deployed: 4,  deadStock: 1, underService: 0, eol: 0, checked: false },
      { id: '1210073027', name: 'Vacuum',      type: 'Asset',      total: 10,   readyToDeploy: 8,   deployed: 2,  deadStock: 0, underService: 0, eol: 0, checked: false },
    ],
    'Furnitures': [
      { id: '1210073028', name: 'Chairs',      type: 'Asset',      total: 500,  readyToDeploy: 450, deployed: 45, deadStock: 3, underService: 2, eol: 0, checked: false },
      { id: '1210073029', name: 'Desks',       type: 'Asset',      total: 200,  readyToDeploy: 180, deployed: 18, deadStock: 1, underService: 1, eol: 0, checked: false },
      { id: '1210073030', name: 'Conf. Tables',type: 'Asset',      total: 20,   readyToDeploy: 18,  deployed: 2,  deadStock: 0, underService: 0, eol: 0, checked: false },
    ],
  };

  get assets(): ReportAsset[] {
    const list = this.allAssets[this.activeDept] || [];
    const q = this.searchQuery.toLowerCase().trim();
    return list.filter(a => {
      const matchesSearch = !q || this.matchesSearchField(a, q);
      const matchesType   = this.filterTypes.length === 0 || this.filterTypes.includes(a.type);
      return matchesSearch && matchesType;
    });
  }

  get pagedAssets(): ReportAsset[] {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    return this.assets.slice(start, start + PAGE_SIZE);
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.assets.length / PAGE_SIZE)); }

  get pageNumbers(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  get selectedCount(): number { return this.pagedAssets.filter(a => a.checked).length; }

  constructor(private router: Router) {}

  ngOnInit(): void {}
  ngOnDestroy(): void {}

  onSearchFieldChange(selection: any[]): void {
    const selected = selection?.[0] ?? { value: 'all', label: 'All Fields' };
    this.searchField = selected.value;
    this.searchFieldLabel = selected.label;
    this.selectedSearchField = [selected];
    this.searchQuery = '';
    this.currentPage = 1;
  }

  onModuleTabChange(tabId: string): void {
    this.activeModuleTabId = tabId;
    this.router.navigate(['/kjusys', tabId]);
  }

  private matchesSearchField(asset: ReportAsset, query: string): boolean {
    switch (this.searchField) {
      case 'name': return asset.name.toLowerCase().includes(query);
      case 'id': return asset.id.toLowerCase().includes(query);
      case 'type': return asset.type.toLowerCase().includes(query);
      default: return (
        asset.name.toLowerCase().includes(query) ||
        asset.id.toLowerCase().includes(query) ||
        asset.type.toLowerCase().includes(query)
      );
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void { this.filterOpen = false; }

  selectDept(dept: string): void { this.activeDept = dept; this.currentPage = 1; this.allChecked = false; }

  toggleFilterPanel(event: Event): void { event.stopPropagation(); this.filterOpen = !this.filterOpen; }

  toggleTypeFilter(t: string): void {
    const i = this.filterTypes.indexOf(t);
    if (i === -1) this.filterTypes.push(t);
    else this.filterTypes.splice(i, 1);
    this.currentPage = 1;
  }

  clearFilters(): void { this.filterTypes = []; this.currentPage = 1; }

  exportCSV(): void {
    const rows = this.assets;
    const headers = ['Name', 'ID', 'Type', 'Total', 'Ready to Deploy', 'Deployed', 'Dead Stock', 'Under Service', 'EOL'];
    const csv = [
      headers.join(','),
      ...rows.map(a => [a.name, a.id, a.type, a.total, a.readyToDeploy, a.deployed, a.deadStock, a.underService, a.eol].join(','))
    ].join('\n');
    this.downloadCSV(csv, `report-${this.activeDept}.csv`);
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  toggleAll(): void {
    this.allChecked = !this.allChecked;
    this.pagedAssets.forEach(a => a.checked = this.allChecked);
  }

  goToPage(p: number): void { this.currentPage = p; }
  prevPage(): void { if (this.currentPage > 1) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }

  bulkExport(): void {
    const rows = this.pagedAssets.filter(a => a.checked);
    const headers = ['Name', 'ID', 'Type', 'Total', 'Ready to Deploy', 'Deployed', 'Dead Stock', 'Under Service', 'EOL'];
    const csv = [headers.join(','), ...rows.map(a => [a.name, a.id, a.type, a.total, a.readyToDeploy, a.deployed, a.deadStock, a.underService, a.eol].join(','))].join('\n');
    this.downloadCSV(csv, `report-${this.activeDept}-selected.csv`);
  }

  bulkDelete(): void {
    if (confirm(`Delete ${this.selectedCount} item(s)?`)) {
      this.allAssets[this.activeDept] = this.allAssets[this.activeDept].filter(a => !a.checked);
      this.allChecked = false;
    }
  }

  clearSelection(): void { this.pagedAssets.forEach(a => a.checked = false); this.allChecked = false; }

  getTypeClass(type: string): string {
    const map: any = { 'Asset': 'class-asset', 'Component': 'class-component', 'Consumable': 'class-consumable', 'Accessory': 'class-accessory' };
    return map[type] || '';
  }

  goToDashboard():  void { this.router.navigate(['/kjusys/asset-dashboard']); }
  goToViewAssets(): void { this.router.navigate(['/kjusys/view-assets']); }
  goToIssueAsset(): void { this.router.navigate(['/kjusys/issue-asset']); }
  goToIssueLog():   void { this.router.navigate(['/kjusys/issue-log']); }
  goToReturnLog():  void { this.router.navigate(['/kjusys/return-log']); }
}
