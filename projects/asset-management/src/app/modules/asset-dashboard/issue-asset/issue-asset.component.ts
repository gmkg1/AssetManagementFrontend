import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService } from '../../../services/asset.service';
import { DashboardTabsService } from '../dashboard-tabs.service';

export interface IssueRecord {
  assetName: string;
  assetCategory: string;
  issueDate: string;
  receiverName: string;
  receiverType: string;
  issueQuantity?: number;
  unit?: string;
}

type OptionItem = { _id: string; label: string };

const PAGE_SIZE = 8;

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
  assetsList: { _id: string; displayLabel: string; assetName: string; assetTagName: string; assetSerialNumber: string; displayId?: string; category: string }[] = [];

  availableQuantity = 1;
  unitOfMeasure = 'Nos';
  issueQuantity = 1;

  allUnits: any[] = [];
  unitOptions: { name: string; acronym: string; conversionFactor: number }[] = [];
  selectedUnit: { name: string; acronym: string; conversionFactor: number } | null = null;
  baseQuantity = 0;

  issueTo = 'User';
  receiverSearch = '';
  selectedReceiverId = '';
  selectedReceiverLabel = '';
  issueDate = '';
  expectedReturn = '';
  expectedReturnTime = '';
  notes = '';

  timePickerOpen = false;
  selectedHour: number | null = null;
  selectedMinute: number | null = null;
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);       // 0–23
  minutes: number[] = Array.from({ length: 60 }, (_, i) => i); // 0–59

  selectHour(h: number): void {
    this.selectedHour = h;
    this._applyTime();
  }

  selectMinute(m: number): void {
    this.selectedMinute = m;
    this._applyTime();
    if (this.selectedHour !== null) this.timePickerOpen = false;
  }

  private _applyTime(): void {
    if (this.selectedHour !== null && this.selectedMinute !== null) {
      const hh = String(this.selectedHour).padStart(2, '0');
      const mm = String(this.selectedMinute).padStart(2, '0');
      this.expectedReturnTime = `${hh}:${mm}`;
    }
  }

  today = new Date().toISOString().slice(0, 10);

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
    private assetService: AssetService,
    private cdr: ChangeDetectorRef,
    @Optional() private dashboardTabsService: DashboardTabsService
  ) { }

  ngOnInit(): void {
    if (this.dashboardTabsService && this.dashboardTabsService.issueAssetId) {
      this.assetId = this.dashboardTabsService.issueAssetId;
      this.assetName = this.dashboardTabsService.issueAssetName;
      this.assetSearch = this.dashboardTabsService.issueAssetName;
      this.assetTag = this.dashboardTabsService.issueAssetTag;
      this.assetModel = this.dashboardTabsService.issueAssetModel;
      this.assetCategory = this.dashboardTabsService.issueAssetCategory;
    } else {
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
    }

    this.issueDate = new Date().toISOString().slice(0, 10);
    this.loadIssueOptions();
    this.loadIssueLog();

    this.assetService.getUnits().subscribe({
      next: (response: any) => {
        this.allUnits = response?.responseData?.data?.units ?? response?.responseData?.units ?? [];
        this.resolveAssetQuantityAndUnit();
      },
      error: (err) => {
        console.error('Failed to load units list:', err);
        this.resolveAssetQuantityAndUnit();
      }
    });
  }

  onUnitChange(): void {
    if (!this.selectedUnit) return;
    this.availableQuantity = this.baseQuantity * this.selectedUnit.conversionFactor;
    if (this.issueQuantity > this.availableQuantity) {
      this.issueQuantity = this.availableQuantity;
    }
  }

  populateUnitOptions(match: any): void {
    this.unitOptions = [];
    const unitId = match.unitOfMeasureId;
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
        name: match.unitOfMeasure || 'pieces',
        acronym: match.unitOfMeasure || 'pieces',
        conversionFactor: 1
      });
    }
    this.selectedUnit = this.unitOptions[0];
    this.onUnitChange();
  }

  resolveAssetQuantityAndUnit(): void {
    if (!this.assetName) return;
    this.assetService.searchAssets(this.assetName).subscribe({
      next: (response: any) => {
        const rawResults = response?.responseData?.data?.assets ?? response?.responseData?.assets ?? [];
        const results = Array.isArray(rawResults) ? rawResults : [];
        const match = results.find((r: any) =>
          r._id === this.assetId
        ) ?? results.find((r: any) =>
          (r.assetName ?? '').toLowerCase() === this.assetName.toLowerCase()
        ) ?? results[0];

        if (match) {
          this.baseQuantity = match.quantity ?? 1;
          this.availableQuantity = match.quantity ?? 1;
          this.unitOfMeasure = match.unitOfMeasure ?? 'Nos';
          this.populateUnitOptions(match);
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to resolve asset quantity and unit:', err);
      }
    });
  }

  ngOnDestroy(): void { }

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
      },
      error: (err) => {
        console.error('Failed to load locations for dropdown:', err);
      },
    });

    this.assetService.getAssets({ page: 1, pageSize: 200 }).subscribe({
      next: (response: any) => {
        const raw: any[] =
          response?.responseData?.data?.assets ??
          response?.responseData?.assets ??
          [];
        this.assets = Array.isArray(raw)
          ? raw
            .map((item: any) => ({
              _id: item._id ?? '',
              label: `${item.assetName} (${item.assetTagName || 'No Tag'})`,
            }))
            .filter((item: OptionItem) => item._id && item.label)
          : [];
        this.receiverOptionsLoading = false;
      },
      error: (err) => {
        console.error('Failed to load assets for dropdown:', err);
        this.receiverOptionsLoading = false;
      },
    });
  }

  private loadIssueLog(): void {
    this.isLoadingLog = true;
    this.logError = null;

    this.assetService.getIssuedAssets({ page: this.currentPage, pageSize: 3 }).subscribe({
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
          issueQuantity: item.issueQuantity ?? 1,
          unit: item.unit ?? 'Nos',
        }));

        this.isLoadingLog = false;
        this.cdr.detectChanges();
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
    this.timePickerOpen = false;
  }

  onAssetSearchInput(query: string): void {
    this.assetSearch = query;
    this.assetDropdownOpen = true;
    if (!query.trim() || query.trim().length < 3) {
      this.assetsList = [];
      this.assetOptionsLoading = false;
      return;
    }
    this.assetOptionsLoading = true;
    // Use /unissued-asset-names for suggestions — only assets not currently issued
    this.assetService.getUnissuedAssetNames(query).subscribe({
      next: (response: any) => {
        const items: any[] =
          response?.responseData?.data?.assetNames ??
          response?.responseData?.assetNames ??
          [];
        this.assetsList = items.map((item: any) => {
          if (typeof item === 'string') {
            return {
              _id: '',
              displayLabel: item,
              assetName: item,
              assetTagName: '',
              assetSerialNumber: '',
              category: '',
            };
          }
          const name = item?.assetName ?? '';
          const serial = item?.assetSerialNumber ?? '';
          const displayId = item?.displayId ?? '';
          const display = displayId ? `${name} (${displayId})` : (serial ? `${name} (${serial})` : name);
          return {
            _id: item?._id ?? '',
            displayLabel: display,
            assetName: name,
            assetTagName: '',
            assetSerialNumber: serial,
            displayId: displayId,
            category: '',
          };
        });
        this.assetOptionsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to fetch unissued asset names:', err);
        this.assetOptionsLoading = false;
      }
    });
  }

  selectAssetOption(asset: { _id: string; displayLabel: string; assetName: string; assetTagName: string; assetSerialNumber: string; displayId?: string; category: string }): void {
    this.assetSearch = asset.displayLabel;
    this.assetDropdownOpen = false;
    this.assetOptionsLoading = true;

    // Resolve full asset details (_id, tag, category) via /assets-search
    this.assetService.searchAssets(asset.assetName).subscribe({
      next: (response: any) => {
        const rawResults = response?.responseData?.data?.assets ?? response?.responseData?.assets ?? [];
        const results = Array.isArray(rawResults) ? rawResults : [];
        const match = results.find((r: any) =>
          (asset.displayId && (r.displayId ?? '') === asset.displayId) ||
          (r.assetSerialNumber ?? '') === asset.assetSerialNumber
        ) ?? results.find((r: any) =>
          (r.assetName ?? '').toLowerCase() === asset.assetName.toLowerCase()
        ) ?? results[0];

        if (match) {
          this.assetId = match._id ?? '';
          this.assetName = match.assetName ?? asset.assetName;
          this.assetTag = match.assetTagName ?? 'No Tag';
          this.assetModel = match.assetTagName ?? 'No Tag';
          this.assetCategory = match.category ?? 'No Category';
          this.baseQuantity = match.quantity ?? 1;
          this.availableQuantity = match.quantity ?? 1;
          this.unitOfMeasure = match.unitOfMeasure ?? 'Nos';
          this.issueQuantity = 1;
          this.populateUnitOptions(match);
        } else {
          // Fallback: keep the name but no id (submit will fail validation)
          this.assetId = '';
          this.assetName = asset.assetName;
        }
        this.assetOptionsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to resolve asset details:', err);
        this.assetOptionsLoading = false;
      }
    });
  }

  goBack(): void {
    if (this.dashboardTabsService) {
      this.dashboardTabsService.changeTab('view-assets');
    } else {
      this.router.navigate(['/kjusys/asset-management/view-assets']);
    }
  }
  goToDashboard(): void {
    if (this.dashboardTabsService) {
      this.dashboardTabsService.changeTab('dashboard');
    } else {
      this.router.navigate(['/kjusys/asset-management/asset-dashboard']);
    }
  }
  goToViewAssets(): void {
    if (this.dashboardTabsService) {
      this.dashboardTabsService.changeTab('view-assets');
    } else {
      this.router.navigate(['/kjusys/asset-management/view-assets']);
    }
  }
  goToIssueLog(): void {
    if (this.dashboardTabsService) {
      this.dashboardTabsService.changeTab('issue-log');
    } else {
      this.router.navigate(['/kjusys/asset-management/issue-log']);
    }
  }
  goToReturnLog(): void {
    if (this.dashboardTabsService) {
      this.dashboardTabsService.changeTab('return-log');
    } else {
      this.router.navigate(['/kjusys/asset-management/return-log']);
    }
  }
  goToReports(): void {
    if (this.dashboardTabsService) {
      this.dashboardTabsService.changeTab('reports');
    } else {
      this.router.navigate(['/kjusys/asset-management/reports']);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.submitError = null;

    if (!this.assetId || !this.selectedReceiverId || !this.issueDate) {
      this.submitError = 'Asset, receiver, and issue date are required.';
      return;
    }

    const avail = Number(this.availableQuantity);
    if (isNaN(avail) || avail <= 0) {
      this.submitError = 'Asset available quantity is invalid or not loaded.';
      return;
    }

    const issueQty = Number(this.issueQuantity);
    if (isNaN(issueQty) || issueQty <= 0) {
      this.submitError = 'Issue quantity must be greater than 0.';
      return;
    }

    if (issueQty > avail + 0.0001) {
      const uAcronym = this.selectedUnit ? this.selectedUnit.acronym : this.unitOfMeasure;
      this.submitError = `Cannot issue more than available quantity (${this.availableQuantity} ${uAcronym}).`;
      return;
    }

    if (this.expectedReturn && this.expectedReturn < this.issueDate) {
      this.submitError = 'Expected return date cannot be before the issue date.';
      return;
    }

    const payload: {
      assetId: string;
      issueDate: string;
      locationId?: string | null;
      personId?: string | null;
      issuedToAssetId?: string | null;
      issueQuantity?: number;
      unitOfMeasurement?: string;
      conversionFactor?: number;
    } = {
      assetId: this.assetId,
      issueDate: this.issueDate,
      locationId: null,
      personId: null,
      issuedToAssetId: null,
      issueQuantity: this.issueQuantity,
      unitOfMeasurement: this.selectedUnit ? this.selectedUnit.acronym : this.unitOfMeasure,
      conversionFactor: this.selectedUnit ? this.selectedUnit.conversionFactor : 1,
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
        this.cdr.detectChanges();
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
    this.selectedHour = null;
    this.selectedMinute = null;
    this.timePickerOpen = false;
    this.notes = '';
    this.availableQuantity = 1;
    this.unitOfMeasure = 'Nos';
    this.issueQuantity = 1;
    this.baseQuantity = 0;
    this.selectedUnit = null;
    this.unitOptions = [];
  }
}
