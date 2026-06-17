import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { AssetService } from '../../../services/asset.service';
import { DashboardTabsService } from '../dashboard-tabs.service';

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

  constructor(
    public router: Router,
    private assetService: AssetService,
    private cdr : ChangeDetectorRef,
    @Optional() private dashboardTabsService: DashboardTabsService
  ) { }

  ngOnInit(): void {
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
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load active issues:', err);
        this.cdr.detectChanges();
      }
    });
  }

  toggleIssueDropdown(): void {
    this.issueDropdownOpen = !this.issueDropdownOpen;
  }

  private navigate(tabId: string, fallbackPath: string): void {
    if (this.dashboardTabsService) {
      this.dashboardTabsService.changeTab(tabId);
    } else {
      this.router.navigate([fallbackPath]);
    }
  }

  goToDashboard(): void { this.navigate('dashboard', '/kjusys/asset-management/asset-dashboard'); }
  goToViewAssets(): void { this.navigate('view-assets', '/kjusys/asset-management/view-assets'); }
  goToIssueAsset(): void { this.navigate('issue-asset', '/kjusys/asset-management/issue-asset'); }
  goToIssueLog(): void { this.navigate('issue-log', '/kjusys/asset-management/issue-log'); }
  goToReturnLog(): void { this.navigate('return-log', '/kjusys/asset-management/return-log'); }
  goToReports(): void { this.navigate('reports', '/kjusys/asset-management/reports'); }

  onIssueSelect(issue: any): void {
    this.selectedIssue = issue;
    this.selectedIssueId = issue._id;
    this.issueDropdownOpen = false;
  }

  getSelectedLabel(): string {
    if (!this.selectedIssue) {
      return 'Select Issued Asset';
    }
    const serial = this.selectedIssue.assetSerialNumber || '—';
    return `${serial} — ${this.selectedIssue.assetName || 'Unknown Asset'} (${this.selectedIssue.receiverName || 'Unknown'})`;
  }

  getIssueDateMin(): string {
    if (!this.selectedIssue || !this.selectedIssue.issueDate) {
      return '';
    }
    const dStr = this.selectedIssue.issueDate;
    if (typeof dStr === 'string' && dStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      return dStr.substring(0, 10);
    }
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return '';
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    } catch (e) {
      return '';
    }
  }

  onCancel(): void {
    this.navigate('return-log', '/kjusys/asset-management/return-log');
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

    const minDate = this.getIssueDateMin();
    if (minDate && this.returnDate < minDate) {
      alert(`Return date cannot be before the issue date (${minDate}).`);
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
        this.navigate('return-log', '/kjusys/asset-management/return-log');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error('Error returning asset:', err);
        alert(err?.error?.error ?? 'Failed to return asset. Please try again.');
      }
    });
  }
}
