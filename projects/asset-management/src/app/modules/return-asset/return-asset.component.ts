import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AssetService } from '../../services/asset.service';

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
export class ReturnAssetComponent implements OnInit {
  public issueDropdownOpen = false;
  public selectedIssueId = '';
  public selectedIssue: any = null;
  public activeIssues: any[] = [];

  public returnDate = '';
  public isSubmitting = false;

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

  constructor(public router: Router, private assetService: AssetService) {}

  ngOnInit(): void {
    // Set default return date to today's date in YYYY-MM-DD format
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.returnDate = `${yyyy}-${mm}-${dd}`;

    this.loadActiveIssues();
  }

  loadActiveIssues(): void {
    this.assetService.getIssuedAssets({ page: 1, pageSize: 100 }).subscribe({
      next: (response: any) => {
        const data = response?.responseData?.data ?? {};
        this.activeIssues = data.assets ?? [];
      },
      error: (err: any) => {
        console.error('Failed to load active issues:', err);
      }
    });
  }

  toggleIssueDropdown(): void {
    this.issueDropdownOpen = !this.issueDropdownOpen;
  }

  goToDashboard(): void { this.router.navigate(['/kjusys/asset-management/asset-dashboard']); }
  goToViewAssets(): void { this.router.navigate(['/kjusys/asset-management/view-assets']); }
  goToIssueAsset(): void { this.router.navigate(['/kjusys/asset-management/issue-asset']); }
  goToIssueLog(): void { this.router.navigate(['/kjusys/asset-management/issue-log']); }
  goToReturnLog(): void { this.router.navigate(['/kjusys/asset-management/return-log']); }
  goToReports(): void { this.router.navigate(['/kjusys/asset-management/reports']); }

  onIssueSelect(issue: any): void {
    this.selectedIssue = issue;
    this.selectedIssueId = issue._id;
    this.issueDropdownOpen = false;
  }

  getSelectedLabel(): string {
    if (!this.selectedIssue) {
      return 'Select Issued Asset';
    }
    const shortId = this.selectedIssue._id ? this.selectedIssue._id.substring(this.selectedIssue._id.length - 6).toUpperCase() : 'ISS';
    return `${shortId} — ${this.selectedIssue.assetName || 'Unknown Asset'} (${this.selectedIssue.receiverName || 'Unknown'})`;
  }

  onCancel(): void {
    this.router.navigate(['/kjusys/asset-management/return-log']);
  }

  onReturnAsset(): void {
    if (!this.selectedIssue) {
      alert('Please select an issued asset before processing return.');
      return;
    }
    if (!this.returnDate) {
      alert('Please select a return date.');
      return;
    }

    this.isSubmitting = true;
    const payload = {
      assetId: this.selectedIssue.assetId,
      issuetoId: this.selectedIssue._id,
      returnDate: this.returnDate
    };

    this.assetService.returnAsset(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/kjusys/asset-management/return-log']);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error('Error returning asset:', err);
        alert(err?.error?.error ?? 'Failed to return asset. Please try again.');
      }
    });
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
