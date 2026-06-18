# Asset Management System — Frontend Architecture & Integration Guide

This document is the authoritative reference for the frontend monorepo architecture, Webpack Module Federation configurations, dynamic routing, styling standards, and API consumption logic.

---

## 1. System Overview

The frontend is built as a microfrontend (MFE) using **Angular 16** and Webpack **Module Federation** to enable dynamic module loading.

The monorepo structure is divided into three project scopes under `projects/`:
- **`projects/shell`**: The Host Container. It manages global authentication states, core sidebars, header toolbars, and dynamically resolves MFE routes via a JSON registry mapping.
- **`projects/asset-management`**: The Remote Application. It houses the entire asset management features, custom reactive components, forms, pages, and endpoint service calls.
- **`projects/libs`**: Shared libraries containing reusable components (left-menu, header, http interceptors, toast notifications).

---

## 2. Directory Layout & Key Files

```text
KJUSYSAssetManagementFrontend/
├── angular.json                     # Monorepo workspace configuration
├── package.json                     # Dependency manifests & run scripts
├── projects/
│   ├── shell/                       # Host Container App
│   │   ├── webpack.config.js        # Host module federation config
│   │   └── src/
│   │       ├── app/
│   │       │   ├── app.module.ts    # Shell initialization & global providers
│   │       │   ├── app.routes.ts    # Static route fallbacks
│   │       │   └── utils/
│   │       │       └── mfe-common.service.ts # Remote manifest loader
│   │       └── assets/
│   │           └── mf.manifest.json # Dynamic Microfrontend registry
│   │
│   ├── asset-management/            # Asset Management Feature MFE (Remote)
│   │   ├── webpack.config.js        # Remote module federation configuration
│   │   └── src/
│   │       └── app/
│   │           ├── app.routes.ts    # Inner remote routing paths
│   │           ├── services/
│   │           │   └── asset.service.ts # Core API wrapper service
│   │           └── modules/
│   │               └── asset-dashboard/ # Dynamic Tab Shell & components
│   │                   ├── dashboard-tabs.service.ts # Local tab state manager
│   │                   ├── create-asset/
│   │                   ├── edit-asset/
│   │                   ├── issue-asset/
│   │                   ├── return-asset/
│   │                   ├── view-assets/
│   │                   ├── issue-log/
│   │                   └── reports/
│   │
│   └── libs/                        # Shared Angular libraries
│       ├── left-menu-lib/           # Dynamic side navigation component
│       ├── menu-header-lib/         # Breadcrumbs, user profile dropdowns
│       ├── http-common/             # Shared interceptors & headers
│       └── shared-toast/            # Global alerts context
```

---

## 3. Module Federation & Routing Configuration

### Shell Registry (`projects/shell/src/assets/mf.manifest.json`)
The host shell discovers remote bundles at runtime using this JSON metadata registry:
```json
{
  "asset-management": {
    "remoteEntry": "http://localhost:4205/remoteEntry.js",
    "displayName": "AssetManagement",
    "routePath": "asset-management",
    "subModule": [
      {
        "exposedModule": "./AssetDashboardModule",
        "displayName": "Asset Dashboard",
        "subPath": "asset-management/asset-dashboard",
        "ngModuleName": "AssetDashboardModule",
        "pinned": false
      }
    ]
  }
}
```

### Remote Exposes Configuration (`projects/asset-management/webpack.config.js`)
The remote app bundles and exposes its internal dashboard module to the host container:
```javascript
const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');
module.exports = withModuleFederationPlugin({
  name: 'asset-management',
  exposes: {
    './Module': './projects/asset-management/src/app/app.module.ts',
    './AssetDashboardModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
});
```

---

## 4. UI Shell Tab Architecture & Local Routing

To provide a seamless, non-reloading administration panel, all sub-screens are built as tab components housed inside `AssetDashboardComponent`. Tab switches are controlled by `DashboardTabsService`:
```typescript
@Injectable({
  providedIn: 'root'
})
export class DashboardTabsService {
  private activeTabSource = new BehaviorSubject<string>('dashboard');
  activeTab$ = this.activeTabSource.asObservable();

  // Shared prefill states for cross-tab navigation
  issueAssetId = '';
  issueAssetName = '';
  issueAssetTag = '';
  issueAssetModel = '';
  issueAssetCategory = '';

  changeTab(tabName: string) {
    this.activeTabSource.next(tabName);
  }
}
```

### Navigation Map
In `asset-dashboard.component.html`:
```html
<div [ngSwitch]="activeTab">
  <app-dashboard *ngSwitchCase="'dashboard'"></app-dashboard>
  <app-view-assets *ngSwitchCase="'view-assets'"></app-view-assets>
  <app-create-asset *ngSwitchCase="'create-asset'"></app-create-asset>
  <app-issue-asset *ngSwitchCase="'issue-asset'"></app-issue-asset>
  <app-return-asset *ngSwitchCase="'return-asset'"></app-return-asset>
  <app-issue-log *ngSwitchCase="'issue-log'"></app-issue-log>
  <app-return-log *ngSwitchCase="'return-log'"></app-return-log>
  <app-reports *ngSwitchCase="'reports'"></app-reports>
</div>
```

---

## 5. API Consumption Mappings

### A. View Assets (`ViewAssetsComponent`)
- **Summary Stats Cards**: Hits `GET /status` to load counts.
- **Main Asset Grid**: Hits `GET /assets?page=X&pageSize=Y` with query filter strings.
- **Detail Drawer**: Triggered on row click:
  - Hits `GET /asset-details?id=X` to fetch specific identifiers.
  - Hits `GET /get-licenses/:id` to populate license keys and warranties.
  - Hits `GET /asset-history/:id` to render timelines of dispatches, issues, and returns.

### B. Issue Asset (`IssueAssetComponent`)
- **Asset Autocomplete Search**: Hits `GET /unissued-asset-names?q=query` on keypress (3+ chars).
- **Unit Hierarchy Selector**: Hits `GET /units-list` on init. Resolves child hierarchies matching the asset's `unitOfMeasureId`. Scales the local `availableQuantity` and inputs dynamically based on the selected child unit's `conversionFactor`.
- **Recent Logs**: Hits `GET /issued-assets?page=1&pageSize=3` to render recent records.
- **Issue Dispatch**: Posts `{ assetId, issueDate, issueQuantity, unitOfMeasurement, conversionFactor }` to `POST /issue-asset`.

### C. Return Asset (`ReturnAssetComponent`)
- **Active Issues Search**: Hits `GET /issued-assets?page=1&pageSize=100` to list issued records that have pending return balances.
- **Details Card**: Extracts `issueQuantity`, `returnedQuantity`, and chosen `unit` from the active issue, showing remaining balances.
- **Return Dispatch**: Posts `{ assetId, issuetoId, returnDate, returnQuantity }` to `POST /return-asset`.

### D. Reports (`ReportsComponent`)
- **Flat Reports (All Tab)**: Hits `GET /assets?page=X&pageSize=8`.
- **Grouped Reports Tab**: Hits `GET /reports-grouped?page=X&pageSize=8` to load summaries of status breakdowns by asset tag model.
- **Backend CSV Exporting**: Triggers streaming files from `/export-reports` using `HttpClient` with `{ responseType: 'blob' }`.

---

## 6. Styling & CSS Standards

- **Core Framework**: Custom CSS stylesheets utilizing standard Tailwind utility bindings where configured.
- **Design Typography**: Sans-serif (Roboto / Outfit), with tight margins (`mb-0.5`, `gap-2`).
- **Dense Data Layouts**: Inputs are set to `h-8` height and margins are structured as `py-1` and `px-3` to suit high-density dashboard layouts.
