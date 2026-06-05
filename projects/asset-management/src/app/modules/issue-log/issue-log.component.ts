import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// â”€â”€ Generic tab item (IT, Sound, Stationery, Housekeeping, Furnitures) â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface IssueLogItem {
  id: string;
  name: string;
  assetId: string;
  imageUrl: string;
  classification: 'Asset' | 'Component' | 'Consumable' | 'Accessory';
  total: number;
  issueType: string;
  issuedTo: string;
  issuedDate: string;
  selected: boolean;
}

// â”€â”€ Electrical tab item â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface ElectricalIssueItem {
  id: string;
  assetName: string;
  assetTag: string;
  issuedTo: string;
  department: string;
  dateIssued: string;
  dueDate: string;
  status: 'Active' | 'Overdue' | 'Returned';
  condition: 'Good' | 'Fair' | 'Poor';
  selected: boolean;
}

// â”€â”€ Generic tab data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TAB_DATA: Record<string, IssueLogItem[]> = {
  IT: [
    { id: '1', name: 'Laptops',     assetId: '1210073015', imageUrl: 'assets/images/laptop.png',   classification: 'Asset',      total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '2', name: 'Desktops',    assetId: '1210073015', imageUrl: 'assets/images/desktop.png',  classification: 'Asset',      total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '3', name: 'VOIP Phones', assetId: '1210073015', imageUrl: 'assets/images/voip.png',     classification: 'Component',  total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '4', name: 'Displays',    assetId: '1210073015', imageUrl: 'assets/images/display.png',  classification: 'Consumable', total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '5', name: 'Tablets',     assetId: '1210073015', imageUrl: 'assets/images/tablet.png',   classification: 'Accessory',  total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '6', name: 'CCTV',        assetId: '1210073015', imageUrl: 'assets/images/cctv.png',     classification: 'Consumable', total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '7', name: 'Keyboards',   assetId: '1210073015', imageUrl: 'assets/images/keyboard.png', classification: 'Consumable', total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '8', name: 'Mouse',       assetId: '1210073015', imageUrl: 'assets/images/mouse.png',    classification: 'Consumable', total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
  ],
  Sound: [
    { id: '1', name: 'Speakers',    assetId: '1210073015', imageUrl: '', classification: 'Asset',      total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '2', name: 'Microphones', assetId: '1210073015', imageUrl: '', classification: 'Asset',      total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '3', name: 'Amplifiers',  assetId: '1210073015', imageUrl: '', classification: 'Asset',      total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '4', name: 'Mixers',      assetId: '1210073015', imageUrl: '', classification: 'Component',  total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '5', name: 'Cables',      assetId: '1210073015', imageUrl: '', classification: 'Consumable', total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
  ],
  Stationery: [
    { id: '1', name: 'Pens',        assetId: '1210073015', imageUrl: '', classification: 'Consumable', total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '2', name: 'Notebooks',   assetId: '1210073015', imageUrl: '', classification: 'Consumable', total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '3', name: 'Staplers',    assetId: '1210073015', imageUrl: '', classification: 'Asset',      total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '4', name: 'Markers',     assetId: '1210073015', imageUrl: '', classification: 'Consumable', total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '5', name: 'Files',       assetId: '1210073015', imageUrl: '', classification: 'Consumable', total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
  ],
  Housekeeping: [
    { id: '1', name: 'Mops',           assetId: '1210073015', imageUrl: '', classification: 'Consumable', total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '2', name: 'Brooms',         assetId: '1210073015', imageUrl: '', classification: 'Consumable', total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '3', name: 'Vacuum Cleaner', assetId: '1210073015', imageUrl: '', classification: 'Asset',      total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '4', name: 'Dustbins',       assetId: '1210073015', imageUrl: '', classification: 'Asset',      total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
  ],
  Furnitures: [
    { id: '1', name: 'Chairs',   assetId: '1210073015', imageUrl: '', classification: 'Asset', total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '2', name: 'Tables',   assetId: '1210073015', imageUrl: '', classification: 'Asset', total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '3', name: 'Shelves',  assetId: '1210073015', imageUrl: '', classification: 'Asset', total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '4', name: 'Cabinets', assetId: '1210073015', imageUrl: '', classification: 'Asset', total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
    { id: '5', name: 'Sofas',    assetId: '1210073015', imageUrl: '', classification: 'Asset', total: 320, issueType: '', issuedTo: '', issuedDate: '', selected: false },
  ],
};

// â”€â”€ Electrical tab data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ELECTRICAL_DATA: ElectricalIssueItem[] = [
  { id: '1',  assetName: 'Projector Epson EB-X41',  assetTag: 'EL-1001', issuedTo: 'Alice Johnson',    department: 'Science Dept.',     dateIssued: 'Jan 10, 2025', dueDate: 'Feb 10, 2025', status: 'Active',   condition: 'Good', selected: false },
  { id: '2',  assetName: 'Extension Cord 10m',      assetTag: 'EL-1002', issuedTo: 'Brian Mensah',     department: 'Admin',             dateIssued: 'Dec 5, 2024',  dueDate: 'Jan 5, 2025',  status: 'Overdue',  condition: 'Fair', selected: false },
  { id: '3',  assetName: 'UPS APC 1500VA',          assetTag: 'EL-1003', issuedTo: 'Clara Owusu',      department: 'I.T Dept.',         dateIssued: 'Nov 20, 2024', dueDate: 'Dec 20, 2024', status: 'Returned', condition: 'Good', selected: false },
  { id: '4',  assetName: 'LED Desk Lamp',           assetTag: 'EL-1004', issuedTo: 'David Asante',     department: 'Library',           dateIssued: 'Jan 15, 2025', dueDate: 'Mar 15, 2025', status: 'Active',   condition: 'Good', selected: false },
  { id: '5',  assetName: 'Electric Kettle',         assetTag: 'EL-1005', issuedTo: 'Evelyn Tetteh',    department: 'Cafeteria',         dateIssued: 'Oct 1, 2024',  dueDate: 'Nov 1, 2024',  status: 'Overdue',  condition: 'Poor', selected: false },
  { id: '6',  assetName: 'Air Conditioner 1.5HP',   assetTag: 'EL-1006', issuedTo: 'Frank Boateng',    department: 'Principal Office',  dateIssued: 'Jan 3, 2025',  dueDate: 'Jul 3, 2025',  status: 'Active',   condition: 'Good', selected: false },
  { id: '7',  assetName: 'Ceiling Fan 56"',         assetTag: 'EL-1007', issuedTo: 'Grace Acheampong', department: 'Classroom B2',      dateIssued: 'Sep 12, 2024', dueDate: 'Dec 12, 2024', status: 'Returned', condition: 'Fair', selected: false },
  { id: '8',  assetName: 'Microwave Oven',          assetTag: 'EL-1008', issuedTo: 'Henry Darko',      department: 'Staff Room',        dateIssued: 'Jan 20, 2025', dueDate: 'Apr 20, 2025', status: 'Active',   condition: 'Good', selected: false },
  { id: '9',  assetName: 'Electric Iron',           assetTag: 'EL-1009', issuedTo: 'Irene Quaye',      department: 'Housekeeping',      dateIssued: 'Dec 18, 2024', dueDate: 'Jan 18, 2025', status: 'Overdue',  condition: 'Fair', selected: false },
  { id: '10', assetName: 'Smart TV 55"',            assetTag: 'EL-1010', issuedTo: 'James Ofori',      department: 'Conference Room',   dateIssued: 'Jan 8, 2025',  dueDate: 'Jun 8, 2025',  status: 'Active',   condition: 'Good', selected: false },
];

const PAGE_SIZE = 8;

@Component({
  selector: 'app-issue-log',
  templateUrl: './issue-log.component.html',
  styleUrls: ['./issue-log.component.css'],
})
export class IssueLogComponent implements OnInit, OnDestroy {

  // â”€â”€ UI state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  filterOpen   = false;

  // â”€â”€ Filter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  filterClassifications: string[] = [];
  readonly classificationFilterOptions = ['Asset', 'Component', 'Consumable', 'Accessory'];

  moduleTabs = [
    { id: 'asset-dashboard', label: 'Dashboard' },
    { id: 'view-assets', label: 'View Assets' },
    { id: 'issue-asset', label: 'Issue Asset' },
    { id: 'issue-log', label: 'Issue Log' },
    { id: 'return-log', label: 'Return Log' },
    { id: 'reports', label: 'Reports' },
  ];
  activeModuleTabId = 'issue-log';

  // â”€â”€ Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  tabs      = ['IT', 'Electrical', 'Sound', 'Stationery', 'Housekeeping', 'Furnitures'];
  activeTab = 'IT';

  // â”€â”€ Search / pagination â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  searchQuery  = '';
  currentPage  = 1;

  // â”€â”€ Search field selector â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  searchField      = 'all';
  searchFieldLabel = 'All Fields';
  selectedSearchField = [{ value: 'all', label: 'All Fields' }];
  readonly searchFieldOptions = [
    { value: 'all',        label: 'All Fields'  },
    { value: 'name',       label: 'Name'        },
    { value: 'id',         label: 'Asset ID'    },
    { value: 'issuedTo',   label: 'Issued To'   },
    { value: 'department', label: 'Department'  },
    { value: 'status',     label: 'Status'      },
  ];

  constructor(private route: ActivatedRoute, public router: Router) {}

  onSearchFieldChange(selection: any[]): void {
    const selected = selection?.[0] ?? { value: 'all', label: 'All Fields' };
    this.searchField = selected.value;
    this.searchFieldLabel = selected.label;
    this.selectedSearchField = [selected];
    this.searchQuery = '';
    this.currentPage = 1;
  }

  // â”€â”€ Lifecycle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['category']) {
        const match = this.tabs.find(
          (t) => t.toLowerCase() === params['category'].toLowerCase()
        );
        if (match) this.activeTab = match;
      }
      if (params['assetName']) this.searchQuery = params['assetName'];
    });
  }

  ngOnDestroy(): void {}

  @HostListener('document:click')
  onDocumentClick(): void { this.filterOpen = false; }

  // â”€â”€ Generic getters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  get allItems(): IssueLogItem[] {
    return TAB_DATA[this.activeTab] ?? [];
  }

  get filteredItems(): IssueLogItem[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.allItems.filter((item) => {
      const matchesSearch = !q || this.matchesField(item, q);
      const matchesClass =
        this.filterClassifications.length === 0 ||
        this.filterClassifications.includes(item.classification);
      return matchesSearch && matchesClass;
    });
  }

  private matchesField(item: IssueLogItem, q: string): boolean {
    switch (this.searchField) {
      case 'name':     return item.name.toLowerCase().includes(q);
      case 'id':       return item.assetId.toLowerCase().includes(q);
      case 'issuedTo': return item.issuedTo.toLowerCase().includes(q);
      default:         return (
        item.name.toLowerCase().includes(q) ||
        item.assetId.toLowerCase().includes(q) ||
        item.classification.toLowerCase().includes(q) ||
        item.issuedTo.toLowerCase().includes(q)
      );
    }
  }

  get pagedItems(): IssueLogItem[] {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    return this.filteredItems.slice(start, start + PAGE_SIZE);
  }

  // â”€â”€ Electrical getters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  get allElectricalItems(): ElectricalIssueItem[] {
    return ELECTRICAL_DATA;
  }

  get filteredElectricalItems(): ElectricalIssueItem[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.allElectricalItems.filter((i) => {
      if (!q) return true;
      switch (this.searchField) {
        case 'name':       return i.assetName.toLowerCase().includes(q);
        case 'id':         return i.assetTag.toLowerCase().includes(q);
        case 'issuedTo':   return i.issuedTo.toLowerCase().includes(q);
        case 'department': return i.department.toLowerCase().includes(q);
        case 'status':     return i.status.toLowerCase().includes(q);
        default:           return (
          i.assetName.toLowerCase().includes(q) ||
          i.assetTag.toLowerCase().includes(q) ||
          i.issuedTo.toLowerCase().includes(q) ||
          i.department.toLowerCase().includes(q)
        );
      }
    });
  }

  get pagedElectricalItems(): ElectricalIssueItem[] {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    return this.filteredElectricalItems.slice(start, start + PAGE_SIZE);
  }

  // â”€â”€ Pagination â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  get totalPages(): number {
    const len =
      this.activeTab === 'Electrical'
        ? this.filteredElectricalItems.length
        : this.filteredItems.length;
    return Math.max(1, Math.ceil(len / PAGE_SIZE));
  }

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

  prevPage(): void { if (this.currentPage > 1) { this.currentPage--; this.clearSelection(); } }
  nextPage(): void { if (this.currentPage < this.totalPages) { this.currentPage++; this.clearSelection(); } }
  goToPage(p: number): void { if (p >= 1 && p <= this.totalPages) { this.currentPage = p; this.clearSelection(); } }

  // â”€â”€ Tab switch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  setTab(tab: string): void {
    this.activeTab   = tab;
    this.currentPage = 1;
    this.searchQuery = '';
    this.searchField = 'all';
    this.searchFieldLabel = 'All Fields';
    this.filterClassifications = [];
  }

  // â”€â”€ Filter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  toggleFilterPanel(event: Event): void { event.stopPropagation(); this.filterOpen = !this.filterOpen; }

  toggleClassFilter(c: string): void {
    const i = this.filterClassifications.indexOf(c);
    if (i === -1) this.filterClassifications.push(c);
    else this.filterClassifications.splice(i, 1);
    this.currentPage = 1;
  }

  clearFilters(): void { this.filterClassifications = []; this.currentPage = 1; }

  // â”€â”€ Export CSV â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  exportCSV(): void {
    if (this.activeTab === 'Electrical') {
      const headers = ['Asset Name', 'Asset Tag', 'Issued To', 'Department', 'Date Issued', 'Due Date', 'Status', 'Condition'];
      const rows = this.filteredElectricalItems.map((i) => [
        i.assetName, i.assetTag, i.issuedTo, i.department,
        i.dateIssued, i.dueDate, i.status, i.condition,
      ]);
      this.downloadCSV([headers, ...rows], 'electrical-issue-log.csv');
    } else {
      const headers = ['Name', 'Asset ID', 'Classification', 'Total', 'Issue Type', 'Issued To', 'Issued Date'];
      const rows = this.filteredItems.map((i) => [
        i.name, i.assetId, i.classification, i.total,
        i.issueType || 'â€”', i.issuedTo || 'â€”', i.issuedDate || 'â€”',
      ]);
      this.downloadCSV([headers, ...rows], `${this.activeTab.toLowerCase()}-issue-log.csv`);
    }
  }

  private downloadCSV(data: (string | number)[][], filename: string): void {
    const csv  = data.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  // â”€â”€ Multi-select â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  get selectedGenericCount(): number { return this.pagedItems.filter(i => i.selected).length; }
  get selectedElecCount():    number { return this.pagedElectricalItems.filter(i => i.selected).length; }
  get selectedCount():        number { return this.activeTab === 'Electrical' ? this.selectedElecCount : this.selectedGenericCount; }

  get allChecked(): boolean {
    if (this.activeTab === 'Electrical') {
      const rows = this.pagedElectricalItems;
      return rows.length > 0 && rows.every((r: ElectricalIssueItem) => r.selected);
    } else {
      const rows = this.pagedItems;
      return rows.length > 0 && rows.every((r: IssueLogItem) => r.selected);
    }
  }
  get someChecked(): boolean {
    if (this.activeTab === 'Electrical') {
      const rows = this.pagedElectricalItems;
      return rows.some((r: ElectricalIssueItem) => r.selected) && !this.allChecked;
    } else {
      const rows = this.pagedItems;
      return rows.some((r: IssueLogItem) => r.selected) && !this.allChecked;
    }
  }

  toggleAll(): void {
    const next = !this.allChecked;
    if (this.activeTab === 'Electrical') {
      this.pagedElectricalItems.forEach(r => r.selected = next);
    } else {
      this.pagedItems.forEach(r => r.selected = next);
    }
  }

  toggleRow(row: IssueLogItem | ElectricalIssueItem): void { row.selected = !row.selected; }

  clearSelection(): void {
    if (this.activeTab === 'Electrical') {
      this.pagedElectricalItems.forEach(r => r.selected = false);
    } else {
      this.pagedItems.forEach(r => r.selected = false);
    }
  }

  bulkExportSelected(): void {
    if (this.activeTab === 'Electrical') {
      const rows = this.pagedElectricalItems.filter(i => i.selected);
      if (!rows.length) return;
      const headers = ['Asset Name', 'Asset Tag', 'Issued To', 'Department', 'Date Issued', 'Due Date', 'Status', 'Condition'];
      const data = rows.map(i => [i.assetName, i.assetTag, i.issuedTo, i.department, i.dateIssued, i.dueDate, i.status, i.condition]);
      this.downloadCSV([headers, ...data], 'electrical-issue-log-selected.csv');
    } else {
      const rows = this.pagedItems.filter(i => i.selected);
      if (!rows.length) return;
      const headers = ['Name', 'Asset ID', 'Classification', 'Total', 'Issue Type', 'Issued To', 'Issued Date'];
      const data = rows.map(i => [i.name, i.assetId, i.classification, i.total, i.issueType || 'â€”', i.issuedTo || 'â€”', i.issuedDate || 'â€”']);
      this.downloadCSV([headers, ...data], `${this.activeTab.toLowerCase()}-issue-log-selected.csv`);
    }
  }

  // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getClassClass(c: string): string {
    const map: Record<string, string> = {
      Asset: 'class-asset', Component: 'class-component',
      Consumable: 'class-consumable', Accessory: 'class-accessory',
    };
    return map[c] || '';
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      Active: 'status-active', Overdue: 'status-overdue', Returned: 'status-returned',
    };
    return map[s] || '';
  }

  // â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  goToDashboard():  void { this.router.navigate(['/kjusys/asset-dashboard']); }
  goToViewAssets(): void { this.router.navigate(['/kjusys/view-assets']); }
  goToIssueAsset(): void { this.router.navigate(['/kjusys/issue-asset']); }
  goToReturnLog():  void { this.router.navigate(['/kjusys/return-log']); }
  goToReports():    void { this.router.navigate(['/kjusys/reports']); }

  onModuleTabChange(tabId: string): void {
    this.activeModuleTabId = tabId;
    this.router.navigate(['/kjusys', tabId]);
  }
}

