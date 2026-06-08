import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AssetService } from '../../services/asset.service';

export interface ReturnRecord {
  assetName: string;
  assetTag: string;
  classification: string;
  total: number;
  returnType: string;
  returnTo: string;
  returnDate: string;
  department: string;
}

@Component({
  selector: 'app-return-log',
  templateUrl: './return-log.component.html',
  styleUrls: ['./return-log.component.scss'],
})
export class ReturnLogComponent implements OnInit, OnDestroy {
  sidebarOpen = false;
  isLoading = true;
  apiError: string | null = null;

  nameQuery = '';
  classificationQuery = '';
  totalQuery = '';
  returnTypeQuery = '';
  returnToQuery = '';
  returnDateQuery = '';

  selectedRecord: ReturnRecord | null = null;
  currentPage = 1;
  totalPagesVal = 1;
  totalRecords = 0;
  pageSize = 10;
  allRecords: ReturnRecord[] = [];

  formAssetName = '';
  formAssetTag = '';
  formClassification = '';
  formTotal: number | null = null;
  formReturnType = '';
  formReturnTo = '';
  formReturnDate = '';

  get totalPages(): number { return this.totalPagesVal; }

  get visiblePages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPagesVal; i++) {
      if (i === 1 || i === this.totalPagesVal || Math.abs(i - this.currentPage) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== -1) pages.push(-1);
    }
    return pages;
  }

  constructor(private router: Router, private assetService: AssetService) {}

  ngOnInit(): void { this.loadReturnLogs(); }
  ngOnDestroy(): void {}

  private loadReturnLogs(): void {
    this.isLoading = true;
    this.apiError = null;

    this.assetService.getReturnLogs({
      page: this.currentPage,
      pageSize: this.pageSize,
      name: this.nameQuery.trim() || undefined,
      classification: this.classificationQuery.trim() || undefined,
      total: this.totalQuery.trim() || undefined,
      returnType: this.returnTypeQuery.trim() || undefined,
      returnTo: this.returnToQuery.trim() || undefined,
      returnDate: this.returnDateQuery || undefined,
    }).subscribe({
      next: (response: any) => {
        const data = response?.responseData?.data ?? {};
        const raw: any[] = data.data ?? data.assets ?? [];
        this.totalRecords = data.totalRecords ?? raw.length;
        this.totalPagesVal = data.totalPages ?? 1;
        this.currentPage = data.currentPage ?? this.currentPage;
        this.allRecords = raw.map((item: any) => ({
          assetName: item.name ?? item.assetName ?? '—',
          assetTag: item.name ?? item.assetName ?? '—',
          classification: item.classification ?? '—',
          total: item.total ?? 0,
          returnType: item.returnType ?? '—',
          returnTo: item.returnTo ?? item.issuedFor ?? '—',
          returnDate: item.returnDate
            ? new Date(item.returnDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—',
          department: item.classification ?? 'Other',
        }));
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load return logs:', err);
        this.apiError = 'Could not load return log data from the server.';
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadReturnLogs();
  }

  clearFilters(): void {
    this.nameQuery = '';
    this.classificationQuery = '';
    this.totalQuery = '';
    this.returnTypeQuery = '';
    this.returnToQuery = '';
    this.returnDateQuery = '';
    this.currentPage = 1;
    this.loadReturnLogs();
  }

  @HostListener('document:click')
  onDocumentClick(): void { this.sidebarOpen = false; }

  prevPage(): void { if (this.currentPage > 1) { this.currentPage--; this.loadReturnLogs(); } }
  nextPage(): void { if (this.currentPage < this.totalPagesVal) { this.currentPage++; this.loadReturnLogs(); } }
  goToPage(p: number): void { if (p !== this.currentPage) { this.currentPage = p; this.loadReturnLogs(); } }

  goToDashboard(): void { this.router.navigate(['/']); }
  goToViewAssets(): void { this.router.navigate(['/assets/view']); }
  goToIssueAsset(): void { this.router.navigate(['/assets/issue']); }
  goToIssueLog(): void { this.router.navigate(['/assets/issue-log']); }
  goToReports(): void { this.router.navigate(['/assets/reports']); }

  exportCSV(): void {
    const headers = ['Name', 'Classification', 'Total', 'Return Type', 'Return To', 'Return Date'];
    const csv = [
      headers.join(','),
      ...this.allRecords.map(r => [r.assetName, r.classification, r.total, r.returnType, r.returnTo, r.returnDate].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `return-log.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  getClassClass(c: string): string {
    const map: Record<string, string> = {
      Asset: 'class-asset',
      Component: 'class-component',
      Consumable: 'class-consumable',
      Accessory: 'class-accessory'
    };
    return map[c] ?? 'class-asset';
  }
}
