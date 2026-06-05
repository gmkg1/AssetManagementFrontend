import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface IssueOption {
  value: string;
  label: string;
}

interface ModuleTab {
  id: string;
  label: string;
  subtitle: string;
}

@Component({
  selector: 'app-return-asset',
  templateUrl: './return-asset.component.html',
  styleUrls: ['./return-asset.component.css']
})
export class ReturnAssetComponent {
  public issueDropdownOpen = false;
  public selectedIssueId = '';
  public issueIdOptions: IssueOption[] = [
    { value: 'ISS-001', label: 'ISS-001 — MacBook Pro' },
    { value: 'ISS-002', label: 'ISS-002 — HP Printer' },
    { value: 'ISS-003', label: 'ISS-003 — BenQ Projector' }
  ];

  public assetName = '';
  public returnType = '';
  public expectedReturnDate = '';
  public returnDate = '';
  public notes = '';

  public activeModuleTabId = 'return-asset';
  public moduleTabs: ModuleTab[] = [
    { id: 'dashboard', label: 'Dashboard', subtitle: 'Overview & Summary' },
    { id: 'view-assets', label: 'View Assets', subtitle: 'Browse all assets' },
    { id: 'issue-asset', label: 'Issue Asset', subtitle: 'Assign to a user' },
    { id: 'issue-log', label: 'Issue Log', subtitle: 'Track issued assets' },
    { id: 'return-log', label: 'Return Log', subtitle: 'Track returns' },
    { id: 'return-asset', label: 'Return Asset', subtitle: 'Process asset returns' },
    { id: 'reports', label: 'Reports', subtitle: 'Asset analytics' }
  ];

  constructor(public router: Router) {}

  toggleIssueDropdown(): void {
    this.issueDropdownOpen = !this.issueDropdownOpen;
  }

  goToDashboard(): void { this.router.navigate(['/kjusys/asset-dashboard']); }
  goToViewAssets(): void { this.router.navigate(['/kjusys/view-assets']); }
  goToIssueAsset(): void { this.router.navigate(['/kjusys/issue-asset']); }
  goToIssueLog(): void { this.router.navigate(['/kjusys/issue-log']); }
  goToReturnLog(): void { this.router.navigate(['/kjusys/return-log']); }
  goToReports(): void { this.router.navigate(['/kjusys/reports']); }

  onIssueSelect(option: IssueOption): void {
    this.selectedIssueId = option.value;
    this.assetName = option.label.split('—')[1]?.trim() ?? '';
    this.issueDropdownOpen = false;
  }

  getSelectedLabel(): string {
    const selected = this.issueIdOptions.find(opt => opt.value === this.selectedIssueId);
    return selected?.label ?? 'Issue Tag';
  }

  onCancel(): void {
    this.router.navigate(['/kjusys/return-log']);
  }

  onReturnAsset(): void {
    // This is a placeholder implementation. Replace with real return logic later.
    if (!this.selectedIssueId) {
      alert('Please select an issue ID before returning the asset.');
      return;
    }

    this.router.navigate(['/kjusys/return-log']);
  }

  onModuleTabChange(tabId: string): void {
    this.activeModuleTabId = tabId;

    switch (tabId) {
      case 'dashboard':
        this.goToDashboard();
        break;
      case 'view-assets':
        this.goToViewAssets();
        break;
      case 'issue-asset':
        this.goToIssueAsset();
        break;
      case 'issue-log':
        this.goToIssueLog();
        break;
      case 'return-log':
        this.goToReturnLog();
        break;
      case 'return-asset':
        // Already on this page.
        break;
      case 'reports':
        this.goToReports();
        break;
    }
  }
}
