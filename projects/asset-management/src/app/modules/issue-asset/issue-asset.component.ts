import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService } from '../../services/asset.service';

export interface IssueRecord {
  assetName: string;
  assetCategory: string;
  issueDate: string;
  receiverName: string;
  receiverType: string;
}

type OptionItem = { _id: string; label: string };

const PAGE_SIZE = 10;

@Component({
  selector: 'app-issue-asset',
  templateUrl: './issue-asset.component.html',
  styleUrls: ['./issue-asset.component.scss'],
})
export class IssueAssetComponent implements OnInit, OnDestroy {
  assetId = '';
  assetName = '';
  assetTag = '';
  assetModel = '';
  assetCategory = '';
  assets: OptionItem[] = [];
  assetSearch = '';
  assetDropdownOpen = false;
  assetsList: any[] = [];

  issueTo = 'User';
  receiverSearch = '';
  selectedReceiverId = '';
  selectedReceiverLabel = '';
  issueDate = '';
  expectedReturn = '';
  expectedReturnTime = '';
  notes = '';

  showSuccess = false;
  isSubmitting = false;
  submitError: string | null = null;
  submitted = false;
  sidebarOpen = false;

  receiverDropdownOpen = false;
  assetOptionsLoading = false;
  receiverOptionsLoading = false;

  locations: OptionItem[] = [];
  users: OptionItem[] = [
    { _id: 'user-1', label: 'Amal Martin' },
    { _id: 'user-2', label: 'Kurian George' },
    { _id: 'user-3', label: 'Melbin Joseph' },
    { _id: 'user-4', label: 'Mariyan' },
    { _id: 'user-5', label: 'Joyal Saji' },
    { _id: 'user-6', label: 'Dewang' },
    { _id: 'user-7', label: 'Riya Thomas' },
  ];

  issueLog: IssueRecord[] = [];
  isLoadingLog = true;
  logError: string | null = null;
  searchQuery = '';
  currentPage = 1;
  totalPages = 1;
  totalRecords = 0;

  get filteredLog(): IssueRecord[] {
    if (!this.searchQuery.trim()) return this.issueLog;
    const q = this.searchQuery.toLowerCase();
    return this.issueLog.filter(r =>
      r.assetName.toLowerCase().includes(q) ||
      r.assetCategory.toLowerCase().includes(q) ||
      r.receiverName.toLowerCase().includes(q) ||
      r.receiverType.toLowerCase().includes(q)
    );
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      if (i === 1 || i === this.totalPages || Math.abs(i - this.currentPage) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== -1) pages.push(-1);
    }
    return pages;
  }

  get filteredReceiverOptions(): OptionItem[] {
    const q = this.receiverSearch.trim().toLowerCase();
    const source = this.issueTo === 'Location' ? this.locations : this.issueTo === 'Asset' ? this.assets : this.users;
    return q ? source.filter((item: OptionItem) => item.label.toLowerCase().includes(q)) : source;
  }

  constructor(
    private hostElement: ElementRef<HTMLElement>,
    private router: Router,
    private route: ActivatedRoute,
    private assetService: AssetService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Record<string, string>) => {
      if (params['assetId']) this.assetId = params['assetId'];
      if (params['assetName']) {
        this.assetName = params['assetName'];
        this.assetSearch = params['assetName'];
      }
      if (params['assetTag']) this.assetTag = params['assetTag'];
      if (params['assetModel']) this.assetModel = params['assetModel'];
      if (params['assetCategory']) this.assetCategory = params['assetCategory'];
    });

    this.issueDate = new Date().toISOString().slice(0, 10);
    this.loadIssueOptions();
    this.loadIssueLog();
  }

  ngOnDestroy(): void {}

  private loadIssueOptions(): void {
    this.receiverOptionsLoading = true;

    this.assetService.getLocations().subscribe({
      next: (response: any) => {
        const raw: any[] =
          response?.responseData?.data?.locations ??
          response?.responseData?.locations ??
          response?.responseData?.data ??
          [];
        this.locations = Array.isArray(raw)
          ? raw
              .map((item: any) => ({
                _id: item.locationId ?? item._id ?? '',
                label: item.locationName ?? '',
              }))
              .filter((item: OptionItem) => item._id && item.label)
          : [];
        this.receiverOptionsLoading = false;
      },
      error: (err) => {
        console.error('Failed to load locations for dropdown:', err);
        this.receiverOptionsLoading = false;
      },
    });
  }

  private loadIssueLog(): void {
    this.isLoadingLog = true;
    this.logError = null;

    this.assetService.getIssuedAssets({ page: this.currentPage, pageSize: PAGE_SIZE }).subscribe({
      next: (response: any) => {
        const data = response?.responseData?.data ?? {};
        const raw: any[] = data.assets ?? [];

        this.totalRecords = data.totalRecords ?? raw.length;
        this.totalPages = data.totalPages ?? 1;
        this.currentPage = data.currentPage ?? this.currentPage;

        this.issueLog = raw.map(item => ({
          assetName: item.assetName ?? '—',
          assetCategory: item.assetCategory ?? '—',
          issueDate: item.issueDate
            ? new Date(item.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—',
          receiverName: item.receiverName ?? '—',
          receiverType: item.receiverType ?? '—',
        }));

        this.isLoadingLog = false;
      },
      error: (err: any) => {
        console.error('Failed to load issue log:', err);
        this.logError = 'Could not load issue log from server.';
        this.isLoadingLog = false;
      },
    });
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

  selectReceiverOption(option: OptionItem): void {
    this.selectedReceiverId = option._id;
    this.selectedReceiverLabel = option.label;
    this.receiverSearch = option.label;
    this.receiverDropdownOpen = false;
  }

  onIssueToChange(type: string): void {
    this.issueTo = type;
    this.selectedReceiverId = '';
    this.selectedReceiverLabel = '';
    this.receiverSearch = '';
    this.receiverDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.hostElement.nativeElement.contains(event.target as Node)) {
      return;
    }
    this.sidebarOpen = false;
    this.receiverDropdownOpen = false;
    this.assetDropdownOpen = false;
  }

  onAssetSearchInput(query: string): void {
    this.assetSearch = query;
    this.assetDropdownOpen = true;
    if (!query.trim()) {
      this.assetsList = [];
      return;
    }
    this.assetOptionsLoading = true;
    this.assetService.searchAssets(query).subscribe({
      next: (response: any) => {
        const raw = response?.responseData?.data?.assets ?? response?.responseData?.assets ?? [];
        this.assetsList = raw.map((item: any) => ({
          _id: item._id,
          label: `${item.assetName} (${item.assetTagName || 'No Tag'})`,
          assetName: item.assetName,
          assetTag: item.assetTagName || 'No Tag'
        }));
        this.assetOptionsLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to search assets:', err);
        this.assetOptionsLoading = false;
      }
    });
  }

  selectAssetOption(option: any): void {
    this.assetId = option._id;
    this.assetName = option.assetName;
    this.assetTag = option.assetTag;
    this.assetSearch = option.assetName;
    this.assetDropdownOpen = false;
  }

  goBack(): void { this.router.navigate(['/assets/view']); }
  goToDashboard(): void { this.router.navigate(['/']); }
  goToViewAssets(): void { this.router.navigate(['/assets/view']); }
  goToIssueLog(): void { this.router.navigate(['/assets/issue-log']); }
  goToReturnLog(): void { this.router.navigate(['/assets/return-log']); }
  goToReports(): void { this.router.navigate(['/assets/reports']); }

  onSubmit(): void {
    this.submitted = true;
    this.submitError = null;

    if (!this.assetId || !this.selectedReceiverId || !this.issueDate) {
      this.submitError = 'Asset, receiver, and issue date are required.';
      return;
    }

    const payload: {
      assetId: string;
      issueDate: string;
      locationId?: string | null;
      personId?: string | null;
      issuedToAssetId?: string | null;
    } = {
      assetId: this.assetId,
      issueDate: this.issueDate,
      locationId: null,
      personId: null,
      issuedToAssetId: null,
    };

    if (this.issueTo === 'Location') payload.locationId = this.selectedReceiverId;
    else if (this.issueTo === 'Asset') payload.issuedToAssetId = this.selectedReceiverId;
    else payload.personId = this.selectedReceiverId;

    this.isSubmitting = true;
    this.assetService.createIssueAsset(payload).subscribe({
      next: () => {
        this.showSuccess = true;
        this.isSubmitting = false;
        this.loadIssueLog();
      },
      error: (err: any) => {
        console.error('Failed to issue asset:', err);
        this.submitError = err?.error?.responseData?.error ?? 'Could not issue asset.';
        this.isSubmitting = false;
      },
    });
  }

  issueAnother(): void {
    this.showSuccess = false;
    this.submitted = false;
    this.selectedReceiverId = '';
    this.selectedReceiverLabel = '';
    this.receiverSearch = '';
    this.assetId = '';
    this.assetName = '';
    this.assetTag = '';
    this.assetSearch = '';
    this.issueDate = new Date().toISOString().slice(0, 10);
    this.expectedReturn = '';
    this.expectedReturnTime = '';
    this.notes = '';
  }
}
