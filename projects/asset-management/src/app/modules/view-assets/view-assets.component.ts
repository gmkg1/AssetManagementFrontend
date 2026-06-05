import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Breadcrumb } from '@libs/shared-ui';
export interface Asset {
  id: string;
  name: string;
  department: string;
  category: string;
  status: 'Available' | 'Deployed' | 'Under Maintenance' | 'Retired';
  assignedTo: string;
  purchaseDate: string;
  condition: 'Good' | 'Fair' | 'Poor';
  // detail fields
  assetTag: string;
  serial: string;
  checkoutDate: string;
  model: string;
  modelNo: string;
  returnable: string;
  purchaseCost: string;
  issuedTo?: {
    name: string; studentId: string; department: string;
    email: string; phone: string; checkoutDate: string; returnDate: string;
  };
}


@Component({
  selector: 'app-view-assets',
  templateUrl: './view-assets.component.html',
  styleUrls: ['./view-assets.component.css'],
})
export class ViewAssetsComponent implements OnInit, OnDestroy {
  // breadcrumbs
  breadcrumbs: Breadcrumb[] = [
    { label: 'I.T' },
    { label: 'Assets' }
  ];

  

  // â”€â”€ view state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  view: 'list' | 'detail' = 'list';
  selectedAsset: Asset | null = null;
  detailTab: 'info'|'licenses'|'components'|'assets'|'history'|'maintenances'|'files' = 'info';
  moduleTabs = [
    { id: 'asset-dashboard', label: 'Dashboard' },
    { id: 'view-assets', label: 'View Assets' },
    { id: 'issue-asset', label: 'Issue Asset' },
    { id: 'issue-log', label: 'Issue Log' },
    { id: 'return-log', label: 'Return Log' },
    { id: 'reports', label: 'Reports' },
  ];
  activeModuleTabId = 'view-assets';

  // â”€â”€ list state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  searchQuery = '';
  searchField = 'all';
  searchFieldLabel = 'All Fields';
  selectedSearchField = [{ value: 'all', label: 'All Fields' }];
  searchFieldOptions = [
    { value: 'all', label: 'All Fields' },
    { value: 'name', label: 'Name' },
    { value: 'id', label: 'Asset ID' },
    { value: 'assignedTo', label: 'Assigned To' },
    { value: 'department', label: 'Department' },
    { value: 'category', label: 'Category' }
  ];  selectedCategory = 'All';
  selectedStatus = 'All';
  categories = ['All', 'I.T', 'Electricals', 'Sound', 'Stationery', 'Housekeeping', 'Furniture'];
  statuses   = ['All', 'Available', 'Deployed', 'Under Maintenance', 'Retired'];

  // multi-select filter state
  categoriesMulti = ['I.T', 'Electricals', 'Sound', 'Stationery', 'Housekeeping', 'Furniture'];
  statusesMulti   = ['Available', 'Deployed', 'Under Maintenance', 'Retired'];
  selectedCategories: string[] = [];
  selectedStatuses:   string[] = [];
  categoryOpen = false;
  statusOpen   = false;

  // â”€â”€ detail tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  tabs = [
    { key: 'info',         label: 'Info',         icon: 'M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z' },
    { key: 'licenses',     label: 'Licenses',     icon: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z' },
    { key: 'components',   label: 'Components',   icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z' },
    { key: 'assets',       label: 'Assets',       icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z' },
    { key: 'history',      label: 'History',      icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
    { key: 'maintenances', label: 'Maintenances', icon: 'M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.653-4.655m5.8-5.8 1.875-1.875a1.875 1.875 0 0 1 2.652 2.652l-1.875 1.875m-5.8 5.8-.8.8' },
    { key: 'files',        label: 'Files',        icon: 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3' },
  ];

  actions = [
    { label: 'Edit Asset',        color: '#E53935', icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125' },
    { label: 'Issue Asset',       color: '#43A047', icon: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z' },
    { label: 'Add Note',          color: '#1E88E5', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z' },
    { label: 'Clone Asset',       color: '#757575', icon: 'M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75' },
    { label: 'Return and Delete', color: '#FB8C00', icon: 'M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3' },
  ];

  // â”€â”€ data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  assets: Asset[] = [
    { id: 'AST-001', name: 'Dell Laptop',          department: 'SDC',       category: 'I.T',          status: 'Deployed',          assignedTo: 'Kurian George', purchaseDate: '12 Jan 2023', condition: 'Good', assetTag: 'AST-001', serial: 'DL-4c9f-001', checkoutDate: 'Mon Jan 15, 2024', model: 'Dell Inspiron 15', modelNo: '5510-001', returnable: 'Yes', purchaseCost: 'Rs. 65,000', issuedTo: { name: 'Kurian George', studentId: 'KJ23A0011', department: 'SDC', email: 'kurian.g@kjc.edu.in', phone: '+91 9876543210', checkoutDate: 'Mon Jan 15, 2024', returnDate: 'Mon Apr 15, 2024' } },
    { id: 'AST-002', name: 'HP Printer',           department: 'Admin',     category: 'I.T',          status: 'Available',         assignedTo: 'â€”',             purchaseDate: '05 Mar 2022', condition: 'Good', assetTag: 'AST-002', serial: 'HP-LJ-002', checkoutDate: 'â€”', model: 'HP LaserJet Pro', modelNo: 'M404n-002', returnable: 'No', purchaseCost: 'Rs. 18,000' },
    { id: 'AST-003', name: 'Projector BenQ',       department: 'CS PG',     category: 'Electricals',  status: 'Deployed',          assignedTo: 'Melbin Joseph', purchaseDate: '20 Jun 2021', condition: 'Fair', assetTag: 'AST-003', serial: 'BQ-MX-003', checkoutDate: 'Wed Feb 5, 2025', model: 'BenQ MX550', modelNo: 'MX550-003', returnable: 'Yes', purchaseCost: 'Rs. 42,000', issuedTo: { name: 'Melbin Joseph', studentId: 'KJ22B0033', department: 'CS PG', email: 'melbin.j@kjc.edu.in', phone: '+91 9123456789', checkoutDate: 'Wed Feb 5, 2025', returnDate: 'Wed May 5, 2025' } },
    { id: 'AST-004', name: 'Wireless Mic',         department: 'Sports',    category: 'Sound',        status: 'Available',         assignedTo: 'â€”',             purchaseDate: '08 Sep 2022', condition: 'Good', assetTag: 'AST-004', serial: 'SH-WL-004', checkoutDate: 'â€”', model: 'Shure BLX24', modelNo: 'BLX24-004', returnable: 'Yes', purchaseCost: 'Rs. 12,500' },
    { id: 'AST-005', name: 'Office Chair',         department: 'PFA',       category: 'Furniture',    status: 'Deployed',          assignedTo: 'Mariyan',       purchaseDate: '15 Feb 2020', condition: 'Fair', assetTag: 'AST-005', serial: 'CH-OF-005', checkoutDate: 'Fri Mar 1, 2024', model: 'Ergonomic Mesh Chair', modelNo: 'EMC-005', returnable: 'No', purchaseCost: 'Rs. 8,500', issuedTo: { name: 'Mariyan', studentId: 'KJ21C0055', department: 'PFA', email: 'mariyan@kjc.edu.in', phone: '+91 9988776655', checkoutDate: 'Fri Mar 1, 2024', returnDate: 'Fri Jun 1, 2024' } },
    { id: 'AST-006', name: 'Whiteboard Marker Set',department: 'Admission', category: 'Stationery',   status: 'Available',         assignedTo: 'â€”',             purchaseDate: '01 Nov 2023', condition: 'Good', assetTag: 'AST-006', serial: 'WB-MK-006', checkoutDate: 'â€”', model: 'Camlin Whiteboard Set', modelNo: 'CWS-006', returnable: 'No', purchaseCost: 'Rs. 350' },
    { id: 'AST-007', name: 'UPS 1500VA',           department: 'SDC',       category: 'Electricals',  status: 'Under Maintenance', assignedTo: 'â€”',             purchaseDate: '22 Apr 2021', condition: 'Poor', assetTag: 'AST-007', serial: 'APC-UP-007', checkoutDate: 'â€”', model: 'APC Back-UPS 1500', modelNo: 'BX1500-007', returnable: 'No', purchaseCost: 'Rs. 9,200' },
    { id: 'AST-008', name: 'MacBook Pro',          department: 'SDC',       category: 'I.T',          status: 'Deployed',          assignedTo: 'Joyal Saji',    purchaseDate: '10 Jul 2023', condition: 'Good', assetTag: '1210073015', serial: '4c9fc03d-c5a9-3b75-852f-fbad3ab89d19', checkoutDate: 'Tue Feb 25, 2025 1:11AM', model: 'Macbook Pro 13"', modelNo: '6011709847119526', returnable: 'Yes', purchaseCost: 'Rs. 1,20,000', issuedTo: { name: 'Amal Martin', studentId: 'KJ24F0923', department: 'SDC', email: 'amal.m@gmail.com', phone: '+91 6273645367', checkoutDate: 'Tue Feb 25, 2025', returnDate: 'Tue Mar 10, 2025' } },
    { id: 'AST-009', name: 'PA Speaker System',    department: 'Sports',    category: 'Sound',        status: 'Deployed',          assignedTo: 'Dewang',        purchaseDate: '18 Dec 2022', condition: 'Good', assetTag: 'AST-009', serial: 'JBL-PA-009', checkoutDate: 'Sat Jan 20, 2024', model: 'JBL EON615', modelNo: 'EON615-009', returnable: 'Yes', purchaseCost: 'Rs. 28,000', issuedTo: { name: 'Dewang', studentId: 'KJ23D0099', department: 'Sports', email: 'dewang@kjc.edu.in', phone: '+91 9001122334', checkoutDate: 'Sat Jan 20, 2024', returnDate: 'Sat Apr 20, 2024' } },
    { id: 'AST-010', name: 'Standing Desk',        department: 'Admin',     category: 'Furniture',    status: 'Available',         assignedTo: 'â€”',             purchaseDate: '03 Aug 2022', condition: 'Good', assetTag: 'AST-010', serial: 'SD-EL-010', checkoutDate: 'â€”', model: 'Flexispot E2', modelNo: 'E2-010', returnable: 'No', purchaseCost: 'Rs. 22,000' },
    { id: 'AST-011', name: 'Cisco Switch 24-Port', department: 'SDC',       category: 'I.T',          status: 'Deployed',          assignedTo: 'SDC Lab',       purchaseDate: '14 May 2021', condition: 'Good', assetTag: 'AST-011', serial: 'CS-SW-011', checkoutDate: 'Mon Jun 1, 2021', model: 'Cisco SG350-28', modelNo: 'SG350-011', returnable: 'No', purchaseCost: 'Rs. 35,000' },
    { id: 'AST-012', name: 'Air Conditioner 1.5T', department: 'CS PG',     category: 'Electricals',  status: 'Deployed',          assignedTo: 'Room 204',      purchaseDate: '29 Jan 2020', condition: 'Fair', assetTag: 'AST-012', serial: 'LG-AC-012', checkoutDate: 'Wed Feb 1, 2023', model: 'LG Dual Inverter 1.5T', modelNo: 'JS-Q18CPXD-012', returnable: 'No', purchaseCost: 'Rs. 38,000' },
    { id: 'AST-013', name: 'Mop & Bucket Set',     department: 'Housekeeping', category: 'Housekeeping', status: 'Available',       assignedTo: 'â€”',             purchaseDate: '11 Oct 2023', condition: 'Good', assetTag: 'AST-013', serial: 'MB-HK-013', checkoutDate: 'â€”', model: 'Scotch-Brite Pro', modelNo: 'SBP-013', returnable: 'No', purchaseCost: 'Rs. 1,200' },
    { id: 'AST-014', name: 'Laser Pointer',        department: 'Admission', category: 'Stationery',   status: 'Retired',           assignedTo: 'â€”',             purchaseDate: '07 Feb 2019', condition: 'Poor', assetTag: 'AST-014', serial: 'LP-RD-014', checkoutDate: 'â€”', model: 'Logitech R400', modelNo: 'R400-014', returnable: 'No', purchaseCost: 'Rs. 2,500' },
    { id: 'AST-015', name: 'Conference Table',     department: 'Admin',     category: 'Furniture',    status: 'Deployed',          assignedTo: 'Board Room',    purchaseDate: '25 Mar 2018', condition: 'Good', assetTag: 'AST-015', serial: 'CT-BR-015', checkoutDate: 'Mon Apr 1, 2019', model: '10-Seater Oval Table', modelNo: 'OVL10-015', returnable: 'No', purchaseCost: 'Rs. 55,000' },
    { id: 'AST-016', name: 'Dell Monitor 27"',    department: 'SDC',       category: 'I.T',          status: 'Deployed',          assignedTo: 'Riya Thomas',   purchaseDate: '14 Aug 2024', condition: 'Good', assetTag: 'AST-016', serial: 'DL-MN-U2724D-016', checkoutDate: 'Mon Sep 2, 2024', model: 'Dell UltraSharp 27"', modelNo: 'U2724D-016', returnable: 'Yes', purchaseCost: 'Rs. 32,500', issuedTo: { name: 'Riya Thomas', studentId: 'KJ24G0016', department: 'SDC', email: 'riya.t@kjc.edu.in', phone: '+91 9845012345', checkoutDate: 'Mon Sep 2, 2024', returnDate: 'Mon Dec 2, 2024' } },
  ];

  get filteredAssets(): Asset[] {
    return this.assets.filter(a => {
      const q = this.searchQuery.toLowerCase();
      const matchesSearch = !q || this.matchesSearchField(a, q);
      const matchesCategory = this.selectedCategories.length === 0 || this.selectedCategories.includes(a.category);
      const matchesStatus   = this.selectedStatuses.length === 0   || this.selectedStatuses.includes(a.status);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  onSearchFieldChange(selection: any[]): void {
    const selected = selection?.[0] ?? { value: 'all', label: 'All Fields' };
    this.searchField = selected.value;
    this.searchFieldLabel = selected.label;
    this.selectedSearchField = [selected];
    this.searchQuery = '';
  }

  private matchesSearchField(asset: Asset, query: string): boolean {
    switch (this.searchField) {
      case 'name': return asset.name.toLowerCase().includes(query);
      case 'id': return asset.id.toLowerCase().includes(query);
      case 'assignedTo': return asset.assignedTo.toLowerCase().includes(query);
      case 'department': return asset.department.toLowerCase().includes(query);
      case 'category': return asset.category.toLowerCase().includes(query);
      default: return (
        asset.name.toLowerCase().includes(query) ||
        asset.id.toLowerCase().includes(query) ||
        asset.assignedTo.toLowerCase().includes(query) ||
        asset.department.toLowerCase().includes(query) ||
        asset.category.toLowerCase().includes(query)
      );
    }
  }

  toggleCategory(cat: string): void {
    const i = this.selectedCategories.indexOf(cat);
    if (i === -1) this.selectedCategories.push(cat);
    else this.selectedCategories.splice(i, 1);
  }

  toggleStatus(st: string): void {
    const i = this.selectedStatuses.indexOf(st);
    if (i === -1) this.selectedStatuses.push(st);
    else this.selectedStatuses.splice(i, 1);
  }

  get totalCount():       number { return this.assets.length; }
  get availableCount():   number { return this.assets.filter(a => a.status === 'Available').length; }
  get deployedCount():    number { return this.assets.filter(a => a.status === 'Deployed').length; }
  get maintenanceCount(): number { return this.assets.filter(a => a.status === 'Under Maintenance').length; }

  assetsDropdownOpen = false;
  sidebarOpen = false;

  constructor(private router: Router) {}

  ngOnInit(): void {}
  ngOnDestroy(): void {}

  @HostListener('document:click')
  onDocumentClick(): void {
    this.categoryOpen = false;
    this.statusOpen   = false;
    this.sidebarOpen  = false;
  }
  openDetail(asset: Asset): void {
    this.selectedAsset = asset;
    this.detailTab = 'info';
    this.view = 'detail';
  }

  backToList(): void {
    this.view = 'list';
    this.selectedAsset = null;
  }

  goToDashboard(): void { this.router.navigate(['/kjusys/asset-dashboard']); }

  goToIssueAsset(): void { this.router.navigate(['/kjusys/issue-asset']); }

  goToIssueLog(): void { this.router.navigate(['/kjusys/issue-log']); }

  goToReturnLog(): void { this.router.navigate(['/kjusys/return-log']); }

  goToReports(): void { this.router.navigate(['/kjusys/reports']); }

  goToCreateAssetTag(): void { this.router.navigate(['/kjusys/create-asset-tag']); }

  goToCreateAsset(): void { this.router.navigate(['/kjusys/create-asset']); }

  onModuleTabChange(tabId: string): void {
    this.activeModuleTabId = tabId;
    this.router.navigate(['/kjusys', tabId]);
  }

  issueAsset(asset: Asset): void {
    this.router.navigate(['/kjusys/issue-asset'], {
      queryParams: {
        assetId:       asset.id,
        assetName:     asset.name,
        assetTag:      asset.assetTag,
        assetModel:    asset.model,
        assetCategory: asset.category,
      }
    });
  }

  getStatusClass(status: string): string {
    const map: any = { 'Available': 'status-available', 'Deployed': 'status-deployed', 'Under Maintenance': 'status-maintenance', 'Retired': 'status-retired' };
    return map[status] || '';
  }

  getConditionClass(c: string): string {
    const map: any = { 'Good': 'condition-good', 'Fair': 'condition-fair', 'Poor': 'condition-poor' };
    return map[c] || '';
  }

  copyToClipboard(value: string): void { navigator.clipboard?.writeText(value); }
}
