import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Breadcrumb } from '@libs/shared-ui';

interface AssetDepartment {
  name: string;
  cssKey: string;
  count: number;
  unit: string;
  iconBgHex: string;
  iconStroke: string;
  iconPath: string;
}

interface IssueRecord {
  receiverName: string;
  department: string;
  issueDate: string;
  assetDept: string;
}

@Component({
  selector: 'app-asset-dashboard',
  templateUrl: './asset-dashboard.component.html',
  styleUrls: ['./asset-dashboard.component.css']
})
export class AssetDashboardComponent implements OnInit, OnDestroy {

  breadcrumbs: Breadcrumb[] = [
    { label: 'Apps', callback: () => this.router.navigate(['/kjusys']) },
    { label: 'Asset Management' }
  ];

  departments: AssetDepartment[] = [
    {
      name: 'I.T', cssKey: 'it', count: 80, unit: 'Assets',
      iconBgHex: '#EEEDFF', iconStroke: '#0F00E0',
      iconPath: 'M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25'
    },
    {
      name: 'Electricals', cssKey: 'electricals', count: 567, unit: 'Items',
      iconBgHex: 'rgba(255,126,134,0.1)', iconStroke: '#FF7E86',
      iconPath: 'm3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z'
    },
    {
      name: 'Sound', cssKey: 'sound', count: 100, unit: 'Equipments',
      iconBgHex: 'rgba(161,98,247,0.1)', iconStroke: '#A162F7',
      iconPath: 'M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 7.5a.75.75 0 0 1 .75-.75h3.19l3.22-3.22a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-3.22-3.22H7.5a.75.75 0 0 1-.75-.75V7.5Z'
    },
    {
      name: 'Stationery', cssKey: 'stationery', count: 890, unit: 'Items',
      iconBgHex: 'rgba(246,204,13,0.1)', iconStroke: '#F6CC0D',
      iconPath: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125'
    },
    {
      name: 'Housekeeping', cssKey: 'housekeeping', count: 1000, unit: 'Items',
      iconBgHex: 'rgba(126,255,159,0.1)', iconStroke: '#00BA2B',
      iconPath: 'M9.813 15.904L9 21l-.813-5.096L3.096 15.096l5.096-.813L9 9.187l.813 5.096 5.096.813-5.096.813ZM19.07 5.93L18 10l-1.07-4.07L12.86 4.86l4.07-1.07L18 0l1.07 3.79 4.07 1.07-4.07 1.07Z'
    },
    {
      name: 'Furniture', cssKey: 'furniture', count: 2341, unit: 'Furnitures',
      iconBgHex: 'rgba(119,65,0,0.1)', iconStroke: '#A25F00',
      iconPath: 'M6 18v3h2v-3h8v3h2v-3c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2zm12-7V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v7h12z'
    }
  ];

  issueHistory: IssueRecord[] = [
    { receiverName: 'Kurian George', department: 'SDC',       issueDate: '24 Feb 2025', assetDept: 'I.T' },
    { receiverName: 'Mariyan',       department: 'PFA',       issueDate: '24 Feb 2025', assetDept: 'I.T' },
    { receiverName: 'Melbin Joseph', department: 'CS PG',     issueDate: '24 Feb 2025', assetDept: 'I.T' },
    { receiverName: 'Joyal Saji',    department: 'Sports',    issueDate: '24 Feb 2025', assetDept: 'I.T' },
    { receiverName: 'Dewang',        department: 'Admission', issueDate: '24 Feb 2025', assetDept: 'I.T' }
  ];

  totalAssets   = 10000;
  readyToDeploy = 500;
  deployed      = 9500;

  moduleTabs = [
    { id: 'asset-dashboard', label: 'Dashboard' },
    { id: 'view-assets', label: 'View Assets' },
    { id: 'issue-asset', label: 'Issue Asset' },
    { id: 'issue-log', label: 'Issue Log' },
    { id: 'return-log', label: 'Return Log' },
    { id: 'reports', label: 'Reports' },
  ];
  activeModuleTabId = 'asset-dashboard';

  // Small donut: r=46, circumference = 2Ï€Ã—46 â‰ˆ 289.03
  readonly circumferenceSmall = 2 * Math.PI * 46;

  get readyDashSmall():    string { return ((this.readyToDeploy / this.totalAssets) * this.circumferenceSmall).toFixed(2); }
  get deployedDashSmall(): string { return ((this.deployed      / this.totalAssets) * this.circumferenceSmall).toFixed(2); }

  constructor(private router: Router) {}

  ngOnInit(): void {}
  ngOnDestroy(): void {}

  onModuleTabChange(tabId: string): void {
    this.activeModuleTabId = tabId;
    this.router.navigate(['/kjusys', tabId]);
  }

  viewMoreIssues(): void { this.router.navigate(['/kjusys/view-assets']); }
  navigateTo(path: string): void { this.router.navigate([path]); }
  navigateToIssueLog(): void { this.router.navigate(['/kjusys/issue-log']); }
  navigateToDeptAssets(dept: string): void {
    this.router.navigate(['/kjusys/view-assets'], { queryParams: { category: dept } });
  }
}
