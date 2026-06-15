import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService } from '../../services/asset.service';
import { Breadcrumb } from '@libs/shared-ui';



type OptionItem = { _id: string; label: string };

const PAGE_SIZE = 8;

@Component({
  selector: 'app-issue-asset',
  templateUrl: './issue-asset.component.html',
  styleUrls: ['./issue-asset.component.scss'],
})
export class IssueAssetComponent implements OnInit, OnDestroy {
  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', callback: () => this.router.navigate(['/kjusys/asset-management/asset-dashboard']) },
    { label: 'Issue Asset' },
  ];
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
  issueToTabs = [
    { id: 'User', label: 'User' },
    { id: 'Asset', label: 'Asset' },
    { id: 'Location', label: 'Location' },
  ];
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
    private cdr : ChangeDetectorRef
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
    this.assetService.getUnissuedAssetNames(query).subscribe({
      next: (response: any) => {
        const data = response?.responseData?.data || response?.responseData || {};
        const raw = data.assetNames || [];
        this.assetsList = raw;
        this.assetOptionsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to search unissued assets:', err);
        this.assetOptionsLoading = false;
      }
    });
  }

  selectAssetOption(name: string): void {
    this.assetSearch = name;
    this.assetDropdownOpen = false;
    this.assetOptionsLoading = true;
    this.assetService.getAssets({ assetName: name, pageSize: 50 }).subscribe({
      next: (response: any) => {
        const raw = response?.responseData?.data?.assets ?? response?.responseData?.assets ?? [];
        // Find the first Ready to Deploy asset
        const available = raw.find((item: any) => item.status === 'Ready to Deploy');
        if (available) {
          this.assetId = available._id;
          this.assetName = available.assetName;
          this.assetTag = available.assetTagName || 'No Tag';
          this.assetModel = available.assetTagName || 'No Tag';
          this.assetCategory = available.category || 'No Category';
        } else if (raw.length > 0) {
          const first = raw[0];
          this.assetId = first._id;
          this.assetName = first.assetName;
          this.assetTag = first.assetTagName || 'No Tag';
          this.assetModel = first.assetTagName || 'No Tag';
          this.assetCategory = first.category || 'No Category';
        }
        this.assetOptionsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load asset details:', err);
        this.assetOptionsLoading = false;
      }
    });
  }

  goBack(): void { this.router.navigate(['/kjusys/asset-management/view-assets']); }
  goToDashboard(): void { this.router.navigate(['/kjusys/asset-management/asset-dashboard']); }
  goToViewAssets(): void { this.router.navigate(['/kjusys/asset-management/view-assets']); }
  goToIssueLog(): void { this.router.navigate(['/kjusys/asset-management/issue-log']); }
  goToReturnLog(): void { this.router.navigate(['/kjusys/asset-management/return-log']); }
  goToReports(): void { this.router.navigate(['/kjusys/asset-management/reports']); }

  onSubmit(): void {
    this.submitted = true;
    this.submitError = null;

        if (!this.assetId || !this.selectedReceiverId || !this.issueDate) {
      this.submitError = 'Asset, receiver, and issue date are required.';
      return;
    }
    if (this.expectedReturn && this.expectedReturn <= this.issueDate) {
      this.submitError = 'Expected Return Date must be after the Issue Date.';
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
