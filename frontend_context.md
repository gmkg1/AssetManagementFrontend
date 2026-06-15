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
│   │           └── modules/         # Feature modules for screens
│   │               ├── asset-dashboard/
│   │               ├── view-assets/
│   │               ├── create-asset/
│   │               ├── create-asset-tag/
│   │               ├── edit-asset/
│   │               ├── issue-asset/
│   │               ├── issue-log/
│   │               ├── return-asset/
│   │               ├── return-log/
│   │               └── reports/
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

The repository starts both the shell and the asset-management remote in development mode.

- **Start development**:
  ```bash
  npm run serve
  ```
  This runs both apps in parallel:
  - Shell at `http://localhost:4200/`
  - Asset Management remote at `http://localhost:4205/`

- **Build shared libraries**:
  ```bash
  npm run build:lib
  ```

- **Build shell + remote**:
  ```bash
  npm run build
  ```

- **Start production server**:
  ```bash
  npm run start
  ```

---

## 4. Module Federation & Dynamic Routing

The shell loads remote microfrontends via a manifest and does not use static remote entries in its webpack config.

### Manifest file

`projects/shell/src/assets/mf.manifest.json` defines the remote entry and submodule routes.

Current manifest contents:
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
      },
      {
        "exposedModule": "./ViewAssetsModule",
        "displayName": "View Assets",
        "subPath": "asset-management/view-assets",
        "ngModuleName": "ViewAssetsModule",
        "pinned": false
      },
      {
        "exposedModule": "./ReturnLogModule",
        "displayName": "Return Log",
        "subPath": "asset-management/return-log",
        "ngModuleName": "ReturnLogModule",
        "pinned": false
      },
      {
        "exposedModule": "./ReportsModule",
        "displayName": "Reports",
        "subPath": "asset-management/reports",
        "ngModuleName": "ReportsModule",
        "pinned": false
      },
      {
        "exposedModule": "./IssueAssetModule",
        "displayName": "Issue Asset",
        "subPath": "asset-management/issue-asset",
        "ngModuleName": "IssueAssetModule",
        "pinned": false
      },
      {
        "exposedModule": "./CreateAssetTagModule",
        "displayName": "Create Asset Tag",
        "subPath": "asset-management/create-asset-tag",
        "ngModuleName": "CreateAssetTagModule",
        "pinned": false
      },
      {
        "exposedModule": "./CreateAssetModule",
        "displayName": "Create Asset",
        "subPath": "asset-management/create-asset",
        "ngModuleName": "CreateAssetModule",
        "pinned": false
      },
      {
        "exposedModule": "./IssueLogModule",
        "displayName": "Issue Log",
        "subPath": "asset-management/issue-log",
        "ngModuleName": "IssueLogModule",
        "pinned": false
      },
      {
        "exposedModule": "./ReturnAssetModule",
        "displayName": "Return Asset",
        "subPath": "asset-management/return-asset",
        "ngModuleName": "ReturnAssetModule",
        "pinned": false
      },
      {
        "exposedModule": "./EditAssetModule",
        "displayName": "Edit Asset",
        "subPath": "asset-management/edit-asset",
        "ngModuleName": "EditAssetModule",
        "pinned": false
      }
    ]
  }
}
```

### Remote exposes

`projects/asset-management/webpack.config.js` exposes the remote application's modules.

Current expose configuration:
```js
exposes: {
  './Module': './projects/asset-management/src/app/app.module.ts',
  './AssetDashboardModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
  './ViewAssetsModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
  './ReturnLogModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
  './ReportsModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
  './IssueAssetModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
  './CreateAssetTagModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
  './CreateAssetModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
  './IssueLogModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
  './ReturnAssetModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
  './EditAssetModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts'
}
```

### Dynamic route initialization

At startup, the shell loads the manifest and builds routes dynamically. The remote entries are registered as lazy-loaded routes and the router is reset so the microfrontend paths are available at runtime.

---

## 5. Backend API Integration

The frontend integrates with the backend through `projects/asset-management/src/app/services/asset.service.ts`.

### Environment configuration

The remote uses the environment file at `projects/asset-management/src/environments/environment.ts`:
```ts
export const environment = {
  production: false,
  apiUrl: 'https://kentucky-injection-pas-northern.trycloudflare.com/kjusys-api/asset-management-api',
  appName: 'Asset Management',
  version: '1.0.0'
};
```

The service resolves the API root as:
```ts
private baseUrl = env.apiUrl ?? env.baseUrl;
```

### Backend endpoint mapping

| Backend Route | HTTP Verb | Service Method | UI Screen |
| --- | --- | --- | --- |
| `/status` | GET | `getStatusSummary()` | Dashboard summary |
| `/assets` | GET | `getAssets(filters)` | View Assets |
| `/assets-search` | GET | `searchAssets(query)` | Search |
| `/unissued-asset-names` | GET | `getUnissuedAssetNames(query)` | Issue Asset (keypress dropdown choices) |
| `/categories` | GET | `getCategories()` | Category dropdowns |
| `/locations-list` | GET | `getLocations()` | Location dropdowns |
| `/statuses-list` | GET | `getStatuses()` | Status filters |
| `/issued-assets` | GET | `getIssuedAssets(filters)` | Issue/return selection |
| `/issue-asset` | POST | `createIssueAsset(payload)` | Issue asset form |
| `/return-asset` | POST | `returnAsset(payload)` | Return asset form |
| `/return-logs` | GET | `getReturnLogs(filters)` | Return history |
| `/asset-status-summary` | GET | `getAssetStatusSummary()` | Dashboard status summary |
| `/asset-tags-list` | GET | `getAssetTags()` | Tag list |
| `/create-asset` | POST | `createAsset(payload)` | Create asset form |
| `/create-asset-tag` | POST | `createAssetTag(payload)` | Create asset tag form |
| `/asset-details` | GET | `getAssetDetails(id)` | Edit asset form |
| `/edit-asset` | PUT | `updateAsset(payload)` | Update asset |
| `/get-licenses/:assetId` | GET | `getLicensesAndWarranty(assetId)` | View Asset -> Details -> Licenses & Warranty tab |
| `/get-asset-components/:assetId` | GET | `getAssetComponents(assetId)` | View Asset -> Details -> Components tab |

---

## 6. Remote Application Routing

The remote app uses `projects/asset-management/src/app/app.routes.ts` to define internal child routes under `kjusys`.

The current child route list includes:
- `kjusys/asset-dashboard`
- `kjusys/view-assets`
- `kjusys/return-log`
- `kjusys/reports`
- `kjusys/issue-asset`
- `kjusys/create-asset-tag`
- `kjusys/create-asset`
- `kjusys/issue-log`
- `kjusys/return-asset`
- `kjusys/edit-asset/:id`

Note: All of these child routes currently lazy-load the same `AssetDashboardModule` file, so the route naming is handled within that shared module structure.

---

## 7. Design and Styling Standards

The UI uses shared styling conventions for a consistent dashboard experience.

- **Density**: Designed for administrative data views.
- **Typography**:
  - Titles: `14px` / `text-sm font-semibold`
  - Content: `12px` / `text-xs`
  - Labels: `10px` / `text-[10px]`
- **Input states**:
  - Default border: `border-gray-300`
  - Focus: `border-blue-500 ring-1`
  - Error: `border-red-300`
  - Disabled: `bg-gray-100`
- **Spacing**: Consistent padding using Tailwind utilities like `p-5`.

For detailed UI rules, see `docs/rules-and-guidelines.md`.

---

## 8. Update Checklist for Backend Features

When adding or changing a backend route:

1. **Update `asset.service.ts`**
   - Add the new endpoint and method mapping.
   - Keep query param handling consistent with existing API methods.
2. **Update the component or module**
   - Inject `AssetService` into the relevant component.
   - Replace any static/mock logic with actual HTTP calls.
3. **Update routing if needed**
   - Add a shell manifest entry for new shell-facing routes.
   - Add a remote child route if the new feature needs a client-side path.
4. **Verify locally**
   - Run `npm run serve`.
   - Confirm the shell loads the remote and the API call returns expected data.

---

## 9. Useful Commands

- `npm run serve` — run shell and remote for development.
- `npm run build:lib` — build shared libraries.
- `npm run build` — build shell and asset-management bundles.
- `npm run start` — launch the production server from `prod-server/`.
