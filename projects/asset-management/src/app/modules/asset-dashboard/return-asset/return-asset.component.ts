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
  public returnQuantity = 1;
  public activeIssues: any[] = [];

  public returnDate = '';
  public isSubmitting = false;

  public allUnits: any[] = [];
  public unitOptions: { name: string; acronym: string; conversionFactor: number }[] = [];
  public selectedUnit: { name: string; acronym: string; conversionFactor: number } | null = null;
  public remainingInSelectedUnit = 0;

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
    this.assetService.getUnits().subscribe({
      next: (response: any) => {
        this.allUnits = response?.responseData?.data?.units ?? response?.responseData?.units ?? [];
      },
      error: (err) => {
        console.error('Failed to load units list:', err);
      }
    });
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

    this.populateUnitOptions(issue);
  }

  populateUnitOptions(issue: any): void {
    this.unitOptions = [];
    const unitId = issue.unitOfMeasureId;
    const mainUnit = this.allUnits.find(u => u._id === unitId || u.id === unitId);
    if (mainUnit) {
      this.unitOptions.push({
        name: mainUnit.unitOfMeasure || mainUnit.name,
        acronym: mainUnit.acronym,
        conversionFactor: 1
      });
      const hierarchy = mainUnit.hierarchy || mainUnit.childUnits || [];
      hierarchy.forEach((child: any) => {
        this.unitOptions.push({
          name: child.childNodeName || child.name,
          acronym: child.childNode || child.acronym,
          conversionFactor: child.conversionFactor
        });
      });
    } else {
      this.unitOptions.push({
        name: issue.unit || 'Nos',
        acronym: issue.unit || 'Nos',
        conversionFactor: 1
      });
    }

    const match = this.unitOptions.find(u => u.acronym.toLowerCase() === (issue.unit || 'Nos').toLowerCase());
    this.selectedUnit = match || this.unitOptions[0];
    this.onUnitChange();
  }

  onUnitChange(): void {
    if (!this.selectedIssue || !this.selectedUnit) return;

    const issueUnitAcronym = this.selectedIssue.unit || 'Nos';
    const issueUnitOpt = this.unitOptions.find(u => u.acronym.toLowerCase() === issueUnitAcronym.toLowerCase());
    const issueCF = issueUnitOpt ? issueUnitOpt.conversionFactor : 1;

    const totalIssued = this.selectedIssue.issueQuantity ?? 1;
    const totalReturned = this.selectedIssue.returnedQuantity ?? 0;
    const remainingInIssueUnit = totalIssued - totalReturned;

    const selectedCF = this.selectedUnit.conversionFactor;
    this.remainingInSelectedUnit = remainingInIssueUnit * (selectedCF / issueCF);

    this.returnQuantity = this.remainingInSelectedUnit;
  }

  getSelectedLabel(): string {
    if (!this.selectedIssue) {
      return 'Select Issued Asset';
    }
    const serial = this.selectedIssue.displayId || this.selectedIssue.assetSerialNumber || '—';
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

    if (!this.returnQuantity || this.returnQuantity <= 0) {
      alert('Return quantity must be greater than 0.');
      return;
    }

    if (this.returnQuantity > this.remainingInSelectedUnit + 0.0001) {
      const uAcronym = this.selectedUnit ? this.selectedUnit.acronym : (this.selectedIssue.unit || 'Nos');
      alert(`Cannot return more than remaining issued quantity (${this.remainingInSelectedUnit} ${uAcronym}).`);
      return;
    }

    const minDate = this.getIssueDateMin();
    if (minDate && this.returnDate < minDate) {
      alert(`Return date cannot be before the issue date (${minDate}).`);
      return;
    }

    // Convert return quantity from selected unit back to the issue's unit
    const issueUnitAcronym = this.selectedIssue.unit || 'Nos';
    const issueUnitOpt = this.unitOptions.find(u => u.acronym.toLowerCase() === issueUnitAcronym.toLowerCase());
    const issueCF = issueUnitOpt ? issueUnitOpt.conversionFactor : 1;
    const selectedCF = this.selectedUnit ? this.selectedUnit.conversionFactor : 1;

    const qtyInIssueUnit = this.returnQuantity * (issueCF / selectedCF);

    this.isSubmitting = true;
    const payload = {
      assetId: this.selectedIssue.assetId,
      issuetoId: this.selectedIssue._id,
      returnDate: this.returnDate,
      returnQuantity: qtyInIssueUnit
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
