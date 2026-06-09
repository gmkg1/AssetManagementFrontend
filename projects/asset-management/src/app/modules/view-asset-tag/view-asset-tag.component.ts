import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TableColumn, PrimaryAction } from '@libs/table';

@Component({
  selector: 'app-view-asset-tag',
  templateUrl: './view-asset-tag.component.html',
  styleUrls: ['./view-asset-tag.component.css'],
})
export class ViewAssetTagComponent implements OnInit {
  view: 'list' | 'detail' = 'list';
  selectedTag: any = null;
  tags: any[] = [];

  // ── Derived counts for stats cards ────────────────────────────────────────────
  returnableCount    = 0;
  nonReturnableCount = 0;
  consumableCount    = 0;
  defaultTagImage    = 'assets/viwasstag.svg';

  // ── Table config ──────────────────────────────────────────────────────────────
  tableColumns: TableColumn[] = [
    { key: 'assetTypeName',  label: 'Asset Type',     type: 'text', sortable: true },
    { key: 'category',       label: 'Category',        type: 'text' },
    { key: 'displayId',      label: 'Display ID',      type: 'text' },
    {
      key: 'classification',
      label: 'Classification',
      type: 'badge',
      colorMap: {
        'Returnable':     { bg: '#DCFCE7', text: '#15803D' },
        'Non-Returnable': { bg: '#FEF9C3', text: '#A16207' },
        'Consumable':     { bg: '#FEE2E2', text: '#B91C1C' },
      },
    },
    { key: 'createdOn',   label: 'Created On', type: 'date' },
    { key: 'totalAssets', label: 'Assets',     type: 'number' },
  ];

  tableActions: PrimaryAction[] = [
    {
      type: 'edit',
      label: 'Edit',
      theme: 'primary',
    },
    {
      type: 'view',
      label: 'View',
      theme: 'secondary',
    },
  ];

  // ── Tabs ──────────────────────────────────────────────────────────────────────
  tabsConfig: any[] = [
    { id: 'dashboard',   label: 'Dashboard',   subtitle: 'Overview & Summary' },
    { id: 'view-assets', label: 'View Assets', subtitle: 'Browse all assets' },
    { id: 'asset-tags',  label: 'Asset Tags',  subtitle: 'Manage asset types' },
    { id: 'issue-asset', label: 'Issue Asset', subtitle: 'Assign to a user' },
    { id: 'issue-log',   label: 'Issue Log',   subtitle: 'View issued assets' },
    { id: 'return-log',  label: 'Return Log',  subtitle: 'Track returns' },
    { id: 'reports',     label: 'Reports',     subtitle: 'Asset analytics' },
  ];

  // ── Mock data (replace with API call when endpoint is ready) ──────────────────
  private mockTags: any[] = [
    { id: 1,  category: 'IT – Information Technology', assetTypeName: 'Laptop',          displayId: 'LPT', classification: 'Returnable',     imageUrl: null, createdOn: '2024-01-01', totalAssets: 24  },
    { id: 2,  category: 'IT – Information Technology', assetTypeName: 'Mouse',           displayId: 'MSE', classification: 'Non-Returnable', imageUrl: null, createdOn: '2024-01-02', totalAssets: 52  },
    { id: 3,  category: 'IT – Information Technology', assetTypeName: 'Keyboard',        displayId: 'KBD', classification: 'Non-Returnable', imageUrl: null, createdOn: '2024-01-03', totalAssets: 48  },
    { id: 4,  category: 'IT – Information Technology', assetTypeName: 'Monitor',         displayId: 'MON', classification: 'Returnable',     imageUrl: null, createdOn: '2024-01-04', totalAssets: 30  },
    { id: 5,  category: 'IT – Information Technology', assetTypeName: 'Printer',         displayId: 'PRN', classification: 'Returnable',     imageUrl: null, createdOn: '2024-01-05', totalAssets: 8   },
    { id: 6,  category: 'Electricals',                  assetTypeName: 'Extension Board', displayId: 'EXB', classification: 'Returnable',     imageUrl: null, createdOn: '2024-01-06', totalAssets: 16  },
    { id: 7,  category: 'Sound',                         assetTypeName: 'Microphone',      displayId: 'MIC', classification: 'Returnable',     imageUrl: null, createdOn: '2024-01-07', totalAssets: 6   },
    { id: 8,  category: 'Stationery',                    assetTypeName: 'Whiteboard',      displayId: 'WBD', classification: 'Non-Returnable', imageUrl: null, createdOn: '2024-01-08', totalAssets: 12  },
    { id: 9,  category: 'Furniture',                     assetTypeName: 'Chair',           displayId: 'CHR', classification: 'Returnable',     imageUrl: null, createdOn: '2024-01-09', totalAssets: 200 },
    { id: 10, category: 'Housekeeping',                  assetTypeName: 'Vacuum Cleaner',  displayId: 'VCL', classification: 'Consumable',     imageUrl: null, createdOn: '2024-01-10', totalAssets: 5   },
    { id: 11, category: 'IT – Information Technology', assetTypeName: 'Scanner',         displayId: 'SCN', classification: 'Returnable',     imageUrl: null, createdOn: '2024-01-11', totalAssets: 7   },
    { id: 12, category: 'IT – Information Technology', assetTypeName: 'Projector',       displayId: 'PRJ', classification: 'Returnable',     imageUrl: null, createdOn: '2024-01-12', totalAssets: 14  },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.tags = this.mockTags;
    this.computeCounts();
  }

  private computeCounts(): void {
    this.returnableCount    = this.tags.filter(t => t.classification === 'Returnable').length;
    this.nonReturnableCount = this.tags.filter(t => t.classification === 'Non-Returnable').length;
    this.consumableCount    = this.tags.filter(t => t.classification === 'Consumable').length;
  }

  // ── Table events ──────────────────────────────────────────────────────────────
  onAction(event: { actionKey: string; row: any }): void {
    if (event.actionKey === 'edit') this.editTag(event.row);
    if (event.actionKey === 'view') this.onRowClick(event.row);
  }

  onRowClick(tag: any): void {
    this.selectedTag = tag;
    this.view = 'detail';
  }

  backToList(): void {
    this.view = 'list';
    this.selectedTag = null;
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────────
  onTabClick(tabId: string): void {
    const routes: Record<string, string> = {
      'dashboard':   '/kjusys/asset-management/asset-dashboard',
      'view-assets': '/kjusys/asset-management/view-assets',
      'asset-tags':  '/kjusys/asset-management/view-asset-tag',
      'issue-asset': '/kjusys/asset-management/issue-asset',
      'issue-log':   '/kjusys/asset-management/issue-log',
      'return-log':  '/kjusys/asset-management/return-log',
      'reports':     '/kjusys/asset-management/reports',
    };
    if (routes[tabId]) this.router.navigate([routes[tabId]]);
  }

  // ── Badge helpers ─────────────────────────────────────────────────────────────
  getClassBadgeStyle(classification: string): { bg: string; color: string } {
    const map: Record<string, { bg: string; color: string }> = {
      'Returnable':     { bg: '#DCFCE7', color: '#15803D' },
      'Non-Returnable': { bg: '#FEF9C3', color: '#A16207' },
      'Consumable':     { bg: '#FEE2E2', color: '#B91C1C' },
    };
    return map[classification] ?? { bg: '#F1F5F9', color: '#475569' };
  }

  // ── Navigation ────────────────────────────────────────────────────────────────
  editTag(tag: any):    void { this.router.navigate(['/kjusys/asset-management/edit-asset-tag'], { queryParams: { editId: tag.id } }); }
  goToCreateTag():      void { this.router.navigate(['/kjusys/asset-management/create-asset-tag']); }
  goToDashboard():      void { this.router.navigate(['/kjusys/asset-management/asset-dashboard']); }
  goToViewAssets():     void { this.router.navigate(['/kjusys/asset-management/view-assets']); }
}
