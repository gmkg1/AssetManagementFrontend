import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AssetService } from '../../../services/asset.service';
import { DashboardTabsService } from '../dashboard-tabs.service';

@Component({
  selector: 'app-edit-warranty-licenses',
  templateUrl: './edit-warranty-licenses.component.html',
  styleUrls: ['./edit-warranty-licenses.component.scss']
})
export class EditWarrantyLicensesComponent implements OnInit {

  assetId = '';
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  showSuccess = false;

  // License fields
  licenseName = '';
  licenseKey = '';
  licenseExpiry = '';

  // Warranty fields
  warrantyName = '';
  warrantyReferenceId = '';
  warrantyStartDate = '';
  warrantyExpiryDate = '';
  warrantyStatus = '';

  warrantyStatusOptions = ['Active', 'Expired', 'Pending'];

  constructor(
    private assetService: AssetService,
    private dashboardTabsService: DashboardTabsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.assetId = this.dashboardTabsService.warrantyLicensesAssetId || '';
    if (this.assetId) {
      this.loadExistingData();
    }
  }

  private loadExistingData(): void {
    this.isLoading = true;
    this.assetService.getLicensesAndWarranty(this.assetId).subscribe({
      next: (res: any) => {
        const data = res?.responseData?.data || {};
        const licenses: any[] = data.licenses || [];
        const warranties: any[] = data.warranty || [];

        if (licenses.length > 0) {
          const lic = licenses[0];
          this.licenseName = lic.licenseName || '';
          this.licenseKey = lic.licenseKey || '';
          this.licenseExpiry = lic.expiryDate
            ? new Date(lic.expiryDate).toISOString().substring(0, 10)
            : '';
        }

        if (warranties.length > 0) {
          const war = warranties[0];
          this.warrantyName = war.provider || '';
          this.warrantyReferenceId = war.displayId || '';
          this.warrantyStartDate = war.startDate
            ? new Date(war.startDate).toISOString().substring(0, 10)
            : '';
          this.warrantyExpiryDate = war.endDate
            ? new Date(war.endDate).toISOString().substring(0, 10)
            : '';
          this.warrantyStatus = war.status || '';
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onSave(): void {
    this.errorMessage = '';

    const licName = this.licenseName.trim();
    const licKey = this.licenseKey.trim();
    const warProvider = this.warrantyName.trim();
    const warRefId = this.warrantyReferenceId.trim();

    // Validate: at least one of licenseName or provider must be filled
    if (!licName && !warProvider) {
      this.errorMessage = 'Please enter at least a License Name or a Warranty Provider before saving.';
      return;
    }

    this.isSaving = true;

    const payload: any = { assetId: this.assetId };

    if (licName || licKey || this.licenseExpiry) {
      payload.license = {
        licenseName: licName || undefined,
        licenseKey: licKey || undefined,
        expiryDate: this.licenseExpiry || null
      };
    }

    if (warProvider || warRefId || this.warrantyStartDate || this.warrantyExpiryDate || this.warrantyStatus) {
      payload.warranty = {
        provider: warProvider || undefined,
        displayId: warRefId || undefined,
        startDate: this.warrantyStartDate || null,
        endDate: this.warrantyExpiryDate || null,
        status: this.warrantyStatus || undefined
      };
    }

    this.assetService.createLicenses(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.showSuccess = true;
        setTimeout(() => {
          this.showSuccess = false;
          this.goBack();
        }, 1500);
      },
      error: (err: any) => {
        this.isSaving = false;
        this.errorMessage =
          err?.error?.responseData?.data?.error ||
          err?.error?.responseData?.errors?.[0] ||
          err?.error?.error ||
          'Failed to save. Please try again.';
      }
    });
  }

  goBack(): void {
    this.dashboardTabsService.changeTab('view-assets');
  }
}
