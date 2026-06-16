# Asset Management System - Frontend Architecture & Integration Guide

This document provides a current view of the frontend architecture, Module Federation setup, API integration points, and developer guidance. It is intended to help backend developers understand how the frontend consumes backend services and how to wire new endpoints into the UI.

---

## 1. System Overview

The frontend is an **Angular 16** monorepo using a **Microfrontend (MFE)** architecture with Webpack **Module Federation**.

The workspace is organized into three primary areas under `projects/`:
- **`projects/shell`**: Host container application. It manages navigation, authentication, and loads remote microfrontends dynamically.
- **`projects/asset-management`**: Remote application that implements the asset management feature screens and API integration.
- **`projects/libs`**: Shared Angular libraries for UI components, authentication, HTTP helpers, and toast notifications.

---

## 2. Monorepo Directory Layout

```text
AssetManagementFrontend/
├── angular.json                     # Angular workspace config
├── package.json                     # Monorepo scripts and dependencies
├── backendContext.md                # Backend API and schema reference
├── frontend_context.md              # [This file] Frontend architecture guide
├── projects/
│   ├── shell/                       # Host Shell Application
│   │   ├── webpack.config.js        # Module Federation host config
│   │   └── src/
│   │       ├── app/
│   │       │   ├── app.module.ts    # Shell bootstrap and providers
│   │       │   ├── app.routes.ts    # Shell route definitions
│   │       │   └── utils/
│   │       │       ├── mfe-common.service.ts # Loads remote manifest and builds routes
│   │       │       └── routes.ts    # Generates dynamic routes from JSON manifest
│   │       └── assets/
│   │           └── mf.manifest.json # Remote metadata and submodule registry
│   │
│   ├── asset-management/            # Asset Management Remote App
│   │   ├── webpack.config.js        # Remote federation expose config
│   │   └── src/
│   │       └── app/
│   │           ├── app.routes.ts    # Internal lazy-load route definitions
│   │           ├── services/
│   │           │   └── asset.service.ts # Backend API integration service
│   │           └── modules/asset-dashboard/   # All feature screens live here
│   │               ├── dashboard/             # Dashboard tab
│   │               ├── view-assets/           # View Assets tab
│   │               ├── create-asset/          # Create Asset tab
│   │               ├── create-asset-tag/      # Create Asset Tag tab
│   │               ├── edit-asset/            # Edit Asset tab
│   │               ├── edit-warranty-licenses/ # Edit Warranty/Licenses tab
│   │               ├── issue-asset/           # Issue Asset tab
│   │               ├── issue-log/             # Issue Log tab
│   │               ├── return-asset/          # Return Asset tab
│   │               ├── return-log/            # Return Log tab
│   │               └── reports/               # Reports tab
│   │
│   └── libs/                        # Shared Angular libraries
│       ├── shared-auth/             # Auth guards, login integration, JWT helpers
│       ├── left-menu-lib/           # Dynamic sidebar layout component
│       ├── menu-header-lib/         # Header, breadcrumbs, toolbar UI
│       ├── http-common/             # Shared interceptors and HTTP helpers
│       └── shared-toast/            # Toast notifications wrapper
```

---

## 3. Running & Serving Locally

- **Start development**:
  ```bash
  npm run serve
  ```
  Runs both apps in parallel:
  - Shell at `http://localhost:4200/`
  - Asset Management remote at `http://localhost:4205/`

- **Build shared libraries**: `npm run build:lib`
- **Build shell + remote**: `npm run build`
- **Start production server**: `npm run start`

---

## 4. Module Federation & Dynamic Routing

The shell loads remote microfrontends via a manifest. Only `AssetDashboardModule` is exposed — all screens (tabs) live inside it.

### Manifest (`projects/shell/src/assets/mf.manifest.json`)

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

### Remote exposes (`projects/asset-management/webpack.config.js`)

```js
exposes: {
  './Module': './projects/asset-management/src/app/app.module.ts',
  './AssetDashboardModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
}
```

---

## 5. Actual Response Envelope

All API responses from this backend follow this envelope (note: differs slightly from backendContext.md):

```json
{
  "statusCode": 200,
  "type": "SUCCESS",
  "responseData": {
    "data": {
      "<key>": [ ... ],
      "totalRecords": 48,
      "currentPage": 1,
      "pageSize": 8,
      "totalPages": 6
    },
    "message": []
  }
}
```

The data array is always under `responseData.data.<key>` where `<key>` varies by endpoint:
- `/assets` → `responseData.data.assets[]`
- `/grp` → `responseData.data.assets[]`
- `/issued-assets` → `responseData.data.assets[]`
- `/categories` → `responseData.data.assets[]` (with `categoryId`, `categoryName`, `assetCount`)
- `/categories-list` → `responseData.data.categories[]`
- `/locations-list` → `responseData.data.locations[]`
- `/statuses-list` → `responseData.data.statuses[]`
- `/status` → `responseData.data.assets[]` (with `statusId`, `statusName`, `assetCount`)
- `/asset-tags-list` → `responseData.data.assetTags[]`
- `/return-logs` → `responseData.data.data[]`
- `/asset-details` → `responseData.data` (single object)
- `/get-licenses/:id` → `responseData.data.licenses[]` + `responseData.data.warranty[]`
- `/get-asset-components/:id` → `responseData.data.components[]`
- `/asset-history/:id` → `responseData.data.dispatches[]`, `.issues[]`, `.returns[]`

---

## 6. Page-by-Page API Calls

All screens are tab components inside `AssetDashboardModule`. Navigation between tabs is handled by `DashboardTabsService` without page reloads.

---

### Dashboard (`app-asset-dashboard-dashboard`)

**On init — three parallel calls:**

| Call | Endpoint | Purpose |
|------|----------|---------|
| `getCategoryCount()` | `GET /categories` | Category cards with asset counts |
| `getIssuedAssets({ page:1, pageSize:3 })` | `GET /issued-assets?page=1&pageSize=3` | Recent issues table (top 3) |
| `getStatusSummary()` | `GET /status` | Donut chart — Ready to Deploy vs Deployed counts |

**Response fields used:**
- `/categories` → `responseData.data.assets[].categoryId`, `.categoryName`, `.assetCount`
- `/issued-assets` → `responseData.data.assets[].receiverName`, `.receiverType`, `.issueDate`, `.assetCategory`
- `/status` → `responseData.data.assets[].statusName`, `.assetCount`

---

### View Assets (`app-view-assets`)

**On init — four calls:**

| Call | Endpoint | Purpose |
|------|----------|---------|
| `getCategories()` | `GET /categories` | Category filter dropdown |
| `getLocations()` | `GET /locations-list` | Location filter dropdown |
| `getStatuses()` | `GET /statuses-list` | Status filter dropdown |
| `getStatusSummary()` | `GET /status` | Summary counts bar (Total / Available / Deployed / Maintenance) |
| `getAssets(filters)` | `GET /assets?page=&pageSize=&...` | Main asset table |

**On filter/search/paginate:**

| Call | Endpoint | Params |
|------|----------|--------|
| `getAssets(filters)` | `GET /assets` | `page`, `pageSize`, `assetName`, `assetTagName`, `categoryId`, `locationId`, `statusId`, `purchaseDateFrom`, `sort` |

**On row click (detail panel):**

| Call | Endpoint | Purpose |
|------|----------|---------|
| `getAssetDetails(id)` | `GET /asset-details?id=<id>` | Full asset fields for detail panel |
| `getLicensesAndWarranty(id)` | `GET /get-licenses/<id>` | Licenses & Warranty tab |
| `getAssetComponents(id)` | `GET /get-asset-components/<id>` | Components tab |
| `getAssetHistory(id)` | `GET /asset-history/<id>` | History tab |

**On status change (inline dropdown in detail panel):**

| Call | Endpoint | Payload |
|------|----------|---------|
| `updateAsset(payload)` | `PUT /edit-asset` | `{ _id, assetName, assetTagId, statusId, defaultLocation, serial, purchaseCost, purchaseDate, isReturnable }` |

---

### Create Asset (`app-create-asset`)

**On init:**

| Call | Endpoint | Purpose |
|------|----------|---------|
| `getCategories()` | `GET /categories` | Category dropdown |
| `getLocations()` | `GET /locations-list` | Default location dropdown |
| `getStatuses()` | `GET /statuses-list` | Status dropdown |
| `getAssetTags()` | `GET /asset-tags-list` | Model/asset-tag searchable dropdown |

**On submit:**

| Call | Endpoint | Payload |
|------|----------|---------|
| `createAsset(payload)` | `POST /create-asset` | `{ assetName, assetTagId, statusId, defaultLocation, serial, purchaseCost, purchaseDate, isReturnable }` |

---

### Create Asset Tag (`app-create-asset-tag`)

**On init:**

| Call | Endpoint | Purpose |
|------|----------|---------|
| `getCategories()` | `GET /categories` | Category dropdown |

**On submit:**

| Call | Endpoint | Payload |
|------|----------|---------|
| `createAssetTag(payload)` | `POST /create-asset-tag` | `{ category, assetTagName, displayId, classification }` |

---

### Edit Asset (`app-edit-asset`)

**On init:**

| Call | Endpoint | Purpose |
|------|----------|---------|
| `getAssetDetails(id)` | `GET /asset-details?id=<id>` | Pre-fill form fields |
| `getCategories()` | `GET /categories` | Category dropdown |
| `getLocations()` | `GET /locations-list` | Location dropdown |
| `getStatuses()` | `GET /statuses-list` | Status dropdown |
| `getAssetTags()` | `GET /asset-tags-list` | Model/asset-tag searchable dropdown |

**On submit:**

| Call | Endpoint | Payload |
|------|----------|---------|
| `updateAsset(payload)` | `PUT /edit-asset` | `{ _id, assetName, assetTagId, statusId, defaultLocation, serial, purchaseCost, purchaseDate, isReturnable }` |

---

### Edit Warranty / Licenses (`app-edit-warranty-licenses`)

**On init:**

| Call | Endpoint | Purpose |
|------|----------|---------|
| `getLicensesAndWarranty(id)` | `GET /get-licenses/<id>` | Pre-fill existing license and warranty fields |

**On save:**

| Call | Endpoint | Payload |
|------|----------|---------|
| `updateLicensesAndWarranty(payload)` | `PUT /edit-licenses-warranty` | `{ assetId, license: { licenseName, licenseKey, expiryDate }, warranty: { provider, displayId, startDate, endDate, status } }` |

---

### Issue Asset (`app-issue-asset`)

**On init:**

| Call | Endpoint | Purpose |
|------|----------|---------|
| `getLocations()` | `GET /locations-list` | Location receiver dropdown |
| `getAssets({ page:1, pageSize:200 })` | `GET /assets?page=1&pageSize=200` | Asset receiver dropdown (issue to asset) |
| `getIssuedAssets({ page:1, pageSize:3 })` | `GET /issued-assets?page=1&pageSize=3` | Recent issue log table at bottom |

**On asset name keypress (3+ chars):**

| Call | Endpoint | Params |
|------|----------|--------|
| `getAssets({ assetName, pageSize:50 })` | `GET /assets?assetName=<q>&pageSize=50` | Asset search autocomplete |

**On submit:**

| Call | Endpoint | Payload |
|------|----------|---------|
| `createIssueAsset(payload)` | `POST /issue-asset` | `{ assetId, issueDate, locationId?, personId?, issuedToAssetId? }` |

---

### Issue Log (`app-issue-log`)

**On init and on every filter/paginate:**

| Call | Endpoint | Params |
|------|----------|--------|
| `getIssuedAssets(filters)` | `GET /issued-assets` | `page`, `pageSize`, `assetName`, `category`, `issuedTo`, `type`, `issueDate` |

**Response fields used:** `assetName`, `assetCategory`, `issueDate`, `receiverName`, `receiverType`

---

### Return Asset (`app-return-asset`)

**On init:**

| Call | Endpoint | Purpose |
|------|----------|---------|
| `getIssuedAssets({ page:1, pageSize:100 })` | `GET /issued-assets?page=1&pageSize=100` | Populate "select issued asset" dropdown |

**On submit:**

| Call | Endpoint | Payload |
|------|----------|---------|
| `returnAsset(payload)` | `POST /return-asset` | `{ assetId, issuetoId, returnDate }` |

---

### Return Log (`app-return-log`)

**On init and on every filter/paginate:**

| Call | Endpoint | Params |
|------|----------|--------|
| `getReturnLogs(filters)` | `GET /return-logs` | `page`, `pageSize`, `name`, `classification`, `total`, `returnType`, `returnTo`, `returnDate` |

**Response fields used:** `name` (assetName), `classification`, `total`, `returnType`, `returnTo`, `returnDate`

---

### Reports (`app-reports`)

**On init — two sequential calls:**

| Call | Endpoint | Purpose |
|------|----------|---------|
| `getCategoriesList()` | `GET /categories-list` | Build category filter tabs |
| `getAssets({ page, pageSize:8 })` | `GET /assets?page=1&pageSize=8` | Initial table data (All tab) |

**On "All" tab selected or paginate while on All:**

| Call | Endpoint | Params |
|------|----------|--------|
| `getAssets(filters)` | `GET /assets` | `page`, `pageSize` |

**On category tab selected or paginate while on category tab:**

| Call | Endpoint | Params |
|------|----------|--------|
| `getAssetGrouped(filters)` | `GET /grp` | `categoryId`, `page`, `pageSize` |

**Response fields used (both endpoints return same shape):**
`assetName`, `category`, `status`, `quantity`, `assetTagName`, `_id`

---

## 7. Service Method Reference (`asset.service.ts`)

| Method | HTTP | Endpoint |
|--------|------|----------|
| `getStatusSummary()` | GET | `/status` |
| `getAssets(filters)` | GET | `/assets` |
| `searchAssets(query)` | GET | `/assets-search?q=` |
| `getCategories()` | GET | `/categories` |
| `getCategoriesList()` | GET | `/categories-list` |
| `getLocations()` | GET | `/locations-list` |
| `getStatuses()` | GET | `/statuses-list` |
| `getAssetTags()` | GET | `/asset-tags-list` |
| `getAssetDetails(id)` | GET | `/asset-details?id=` |
| `getAssetsByCategory(catId, page, size)` | GET | `/grp?categoryId=` |
| `getAssetGrouped(filters)` | GET | `/grp` |
| `getIssuedAssets(filters)` | GET | `/issued-assets` |
| `createIssueAsset(payload)` | POST | `/issue-asset` |
| `returnAsset(payload)` | POST | `/return-asset` |
| `getReturnLogs(filters)` | GET | `/return-logs` |
| `getAssetStatusSummary(page, size)` | GET | `/asset-status-summary` |
| `createAsset(payload)` | POST | `/create-asset` |
| `createAssetTag(payload)` | POST | `/create-asset-tag` |
| `updateAsset(payload)` | PUT | `/edit-asset` |
| `getLicensesAndWarranty(id)` | GET | `/get-licenses/:id` |
| `getAssetComponents(id)` | GET | `/get-asset-components/:id` |
| `updateLicensesAndWarranty(payload)` | PUT | `/edit-licenses-warranty` |
| `getUnissuedAssetNames(query?)` | GET | `/unissued-asset-names?q=` |
| `getAssetHistory(id)` | GET | `/asset-history/:id` |
| `getIssuedDetailByAssetId(id)` | GET | `/issued-asset-details/:id` |
| `getCategoryCount(page, size)` | GET | `/categories` |

---

## 8. Remote Application Routing

`projects/asset-management/src/app/app.routes.ts` defines internal child routes under `/kjusys/`:

- `kjusys/asset-dashboard` → loads `AssetDashboardModule` (tab shell)
- `kjusys/**` → redirects to `asset-dashboard`

All feature screens are tab components declared inside `AssetDashboardModule`. Tab switching is handled by `DashboardTabsService` without route changes.

---

## 9. Design and Styling Standards

- **Density**: Administrative data views, compact.
- **Typography**: Titles `text-sm font-semibold`, content `text-xs`, labels `text-[10px]`
- **Input states**: Default `border-gray-300`, focus `border-blue-500 ring-1`, error `border-red-300`, disabled `bg-gray-100`
- **Spacing**: Tailwind utilities, consistent `p-4` / `p-5` padding.

---

## 10. Update Checklist for Backend Features

1. **Update `asset.service.ts`** — add the endpoint method and params.
2. **Update the component** — inject `AssetService`, call the new method, map the response using `responseData.data.<key>`.
3. **Update routing if needed** — new shell-facing screens need a manifest entry.
4. **Verify** — `npm run serve`, confirm the API call fires and data renders.

---

## 11. Useful Commands

- `npm run serve` — run shell + remote for development.
- `npm run build:lib` — build shared libraries.
- `npm run build` — build shell and asset-management bundles.
- `npm run start` — launch the production server from `prod-server/`.
