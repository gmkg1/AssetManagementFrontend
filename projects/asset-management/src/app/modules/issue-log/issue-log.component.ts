import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AssetService } from '../../services/asset.service';

export interface IssueRecord {
  assetName: string;
  assetCategory: string;
  issueDate: string;
  receiverName: string;
  receiverType: string;
}

@Component({
  selector: 'app-issue-log',
  templateUrl: './issue-log.component.html',
  styleUrls: ['./issue-log.component.scss'],
})
export class IssueLogComponent implements OnInit, OnDestroy {
  issueLog: IssueRecord[] = [];
  isLoading = true;
  apiError: string | null = null;
  sidebarOpen = false;

  assetNameQuery = '';
  categoryQuery = '';
  issuedToQuery = '';
  selectedType = '';
  issueDate = '';

  currentPage = 1;
  totalPages = 1;
  totalRecords = 0;
  pageSize = 10;

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      if (i === 1 || i === this.totalPages || Math.abs(i - this.currentPage) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== -1) pages.push(-1);
    }
    return pages;
  }

  constructor(private router: Router, private assetService: AssetService) {}

  ngOnInit(): void {
    this.loadIssueLog();
  }

  ngOnDestroy(): void {}

  private loadIssueLog(): void {
    this.isLoading = true;
    this.apiError = null;

    this.assetService.getIssuedAssets({
      page: this.currentPage,
      pageSize: this.pageSize,
      assetName: this.assetNameQuery.trim() || undefined,
      category: this.categoryQuery.trim() || undefined,
      issuedTo: this.issuedToQuery.trim() || undefined,
      type: this.selectedType || undefined,
      issueDate: this.issueDate || undefined,
    }).subscribe({
      next: (response: any) => {
        const data = response?.responseData?.data ?? {};
        const raw: any[] = data.assets ?? [];

        this.totalRecords = data.totalRecords ?? raw.length;
        this.totalPages = data.totalPages ?? 1;
        this.currentPage = data.currentPage ?? this.currentPage;

        this.issueLog = raw.map((item: any) => ({
          assetName: item.assetName ?? '—',
          assetCategory: item.assetCategory ?? '—',
          issueDate: item.issueDate
            ? new Date(item.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—',
          receiverName: item.receiverName ?? '—',
          receiverType: item.receiverType ?? '—',
        }));
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load issue log:', err);
        this.apiError = 'Could not load issue log from server.';
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadIssueLog();
  }

  clearFilters(): void {
    this.assetNameQuery = '';
    this.categoryQuery = '';
    this.issuedToQuery = '';
    this.selectedType = '';
    this.issueDate = '';
    this.currentPage = 1;
    this.loadIssueLog();
  }

  prevPage(): void { if (this.currentPage > 1) { this.currentPage--; this.loadIssueLog(); } }
  nextPage(): void { if (this.currentPage < this.totalPages) { this.currentPage++; this.loadIssueLog(); } }
  goToPage(p: number): void { if (p !== this.currentPage) { this.currentPage = p; this.loadIssueLog(); } }

  getReceiverTypeClass(type: string): string {
    const map: Record<string, string> = {
      Location: 'bg-blue-50 text-blue-700',
      Asset: 'bg-purple-50 text-purple-700',
      Person: 'bg-green-50 text-green-700',
    };
    return map[type] ?? 'bg-slate-50 text-slate-600';
  }

  @HostListener('document:click')
  onDocumentClick(): void { this.sidebarOpen = false; }

  goToDashboard(): void { this.router.navigate(['/']); }
  goToViewAssets(): void { this.router.navigate(['/assets/view']); }
  goToIssueAsset(): void { this.router.navigate(['/assets/issue']); }
  goToReturnLog(): void { this.router.navigate(['/assets/return-log']); }
  goToReports(): void { this.router.navigate(['/assets/reports']); }
}
