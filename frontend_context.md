# Asset Management System - Frontend Architecture & Integration Guide

This document provides a comprehensive guide to the frontend architecture of the Asset Management system, explaining its structure, Module Federation setup, API integrations, and design standards. It is designed to help backend developers understand the frontend codebase and easily integrate new API endpoints or debug user flows.

---

## 1. System Overview

The frontend is built as an **Angular 16** monorepo using a **Microfrontend (MFE)** architecture powered by Webpack's **Module Federation**.

The workspace is split into three main areas under the `projects/` directory:
- **`projects/shell`**: The host/container application. It manages navigation layouts, authorization, and loads microfrontends dynamically at runtime.
- **`projects/asset-management`**: The functional remote module containing the business logic and screens for asset tracking (dashboards, lists, logs, issue/return forms).
- **`projects/libs`**: A collection of reusable shared libraries containing atomic UI elements (tables, dropdowns, tabs, alerts) and core services.

---

## 2. Monorepo Directory Layout

```text
AssetManagementFrontend/
├── angular.json                     # Workspace configuration (projects, architect targets)
├── package.json                     # Monorepo dependencies and build/serve scripts
├── backendContext.md                # Backend schema and API documentation
├── frontend_context.md              # [This File] Frontend explanation for backend devs
├── projects/
│   ├── shell/                       # Host Shell Application (Runs on port 4200)
│   │   ├── webpack.config.js        # Module federation shared package definitions
│   │   └── src/
│   │       ├── app/
│   │       │   ├── app.module.ts    # Application initialization & provider registry
│   │       │   ├── app.routes.ts    # Static route definitions (login, fallback)
│   │       │   └── utils/
│   │       │       ├── mfe-common.service.ts # Loads remotes dynamically via manifest
│   │       │       └── routes.ts    # Dynamically generates MFE routes from JSON manifest
│   │       └── assets/
│   │           └── mf.manifest.json # Microfrontend remote URLs and Exposed Modules registry
│   │
│   ├── asset-management/            # Asset Management Remote Application (Runs on port 4205)
│   │   ├── webpack.config.js        # Defines exposed Angular modules
│   │   └── src/
│   │       └── app/
│   │           ├── app.routes.ts    # Internal routing mapping subpaths to component modules
│   │           ├── services/
│   │           │   └── asset.service.ts # Core service containing HTTP API calls
│   │           └── modules/         # Screen-specific feature modules
│   │               ├── asset-dashboard/
│   │               ├── view-assets/
│   │               ├── create-asset/
│   │               ├── create-asset-tag/
│   │               ├── edit-asset/
│   │               ├── issue-asset/
│   │               ├── issue-log/
│   │               ├── return-asset/ # Process returns (currently static/offline)
│   │               ├── return-log/
│   │               └── reports/
│   │
│   └── libs/                        # Shared Angular libraries
│       ├── shared-auth/             # Authentication guards, tokens, and core modules
│       ├── left-menu-lib/           # Dynamic sidebar layout component
│       ├── menu-header-lib/         # App header, user profile, and breadcrumbs
│       ├── http-common/             # Shared HTTP interceptors and headers config
│       └── shared-toast/            # Custom notification alerts (ngx-toastr wrappers)
```

---

## 3. Running & Serving Locally

Development builds execute concurrently to launch both the host shell and the remote module.

- **Serve Development Command**:
  ```bash
  npm run serve
  ```
  *This invokes `concurrently` to run:*
  - **Shell Container** at `http://localhost:4200/`
  - **Asset Management Remote** at `http://localhost:4205/`

- **Build Production Bundles**:
  ```bash
  # Builds core UI libs
  npm run build:lib
  # Builds host shell and remote features
  npm run build
  ```

---

## 4. Module Federation & Dynamic Routing

Instead of hardcoding remote URLs, the Shell application resolves and registers microfrontend routes dynamically at startup.

### A. Manifest File (`mf.manifest.json`)
The file [mf.manifest.json](file:///c:/Users/mahee/Downloads/KJUSYSAssetManagementFrontend/AssetManagementFrontend/projects/shell/src/assets/mf.manifest.json) maps names to remote entries and exposed modules:
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
      ...
    ]
  }
}
```

### B. Exposed Modules (`webpack.config.js`)
In [webpack.config.js](file:///c:/Users/mahee/Downloads/KJUSYSAssetManagementFrontend/AssetManagementFrontend/projects/asset-management/webpack.config.js), the remote application declares which folders it exposes as federation modules:
```javascript
exposes: {
  './AssetDashboardModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
  './ViewAssetsModule': './projects/asset-management/src/app/modules/view-assets/view-assets.module.ts',
  ...
}
```

### C. Dynamic Route Initialization
1. During startup (`APP_INITIALIZER`), `MfeCommonService` fetches the manifest.
2. `buildRoutes()` (located in [routes.ts](file:///c:/Users/mahee/Downloads/KJUSYSAssetManagementFrontend/AssetManagementFrontend/projects/shell/src/app/utils/routes.ts)) loops over the manifest submodules.
3. For each submodule, it registers a lazy-loaded route mapping the `subPath` (e.g. `asset-management/asset-dashboard`) to a dynamic `loadRemoteModule()` instruction.
4. Finally, it resets the router configuration dynamically: `this.router.resetConfig(routes);`.

---

## 5. API Integration & Service Architecture

The frontend integrates with the Java/Vert.x backend using Angular's standard `HttpClient`.

### A. Environment Configuration
The base URL is resolved in the environment configuration files:
- **Development**: [environment.ts](file:///c:/Users/mahee/Downloads/KJUSYSAssetManagementFrontend/AssetManagementFrontend/projects/asset-management/src/environments/environment.ts)
- **Local Production**: [environment.local-server.prod.ts](file:///c:/Users/mahee/Downloads/KJUSYSAssetManagementFrontend/AssetManagementFrontend/projects/asset-management/src/environments/environment.local-server.prod.ts)

The `AssetService` selects the API root path:
```typescript
private baseUrl = env.apiUrl ?? env.baseUrl; // e.g. https://growing-appreciation-specialties-stephanie.trycloudflare.com/kjusys-api/asset-management-api
```

### B. The API Service (`asset.service.ts`)
The [asset.service.ts](file:///c:/Users/mahee/Downloads/KJUSYSAssetManagementFrontend/AssetManagementFrontend/projects/asset-management/src/app/services/asset.service.ts) contains all HTTP methods. Here is a matrix of the backend endpoints and their corresponding service method:

| Backend HTTP Route | HTTP Method | Service Method | UI Route / Screen |
| :--- | :--- | :--- | :--- |
| `/status` | GET | `getStatusSummary()` | Dashboard (Donut Summary card) |
| `/assets` | GET | `getAssets(filters)` | View Assets (Grid list table) |
| `/assets-search` | GET | `searchAssets(query)` | Global search bar |
| `/categories` | GET | `getCategories()` | View Assets / Create / Edit dropdowns |
| `/locations-list` | GET | `getLocations()` | View Assets / Issue / Return dropdowns |
| `/statuses-list` | GET | `getStatuses()` | View Assets dropdown filter |
| `/issued-assets` | GET | `getIssuedAssets(filters)` | Issue Log (Table) / Return Asset (Dropdown selection) |
| `/issue-asset` | POST | `createIssueAsset(payload)` | Issue Asset Form |
| `/return-logs` | GET | `getReturnLogs(filters)` | Return Log (Grid list table) |
| `/asset-status-summary`| GET | `getAssetStatusSummary()` | Dashboard list table |
| `/asset-tags-list` | GET | `getAssetTags()` | Create Asset Tag list |
| `/create-asset` | POST | `createAsset(payload)` | Create Asset Form |
| `/create-asset-tag` | POST | `createAssetTag(payload)` | Create Asset Tag Form |
| `/asset-details` | GET | `getAssetDetails(id)` | Edit Asset (pre-populate form) |
| `/edit-asset` | PUT | `updateAsset(payload)` | Edit Asset Form (Submit changes) |

---

## 6. Design and Styling Standards

To keep the ERP application visually uniform, the UI uses **Vanilla CSS / Bootstrap 5 / TailwindCSS** with specific typography scales and input field rules (documented in [rules-and-guidelines.md](file:///c:/Users/mahee/Downloads/KJUSYSAssetManagementFrontend/AssetManagementFrontend/docs/rules-and-guidelines.md)):

- **Information Density**: Optimized for data-heavy administrative dashboards.
- **Typography Scale**:
  - Titles: `14px` (`text-sm font-semibold`)
  - Subtitles, Content & Inputs: `12px` (`text-xs`)
  - Secondary text, Labels, & Breadcrumbs: `10px` (`text-[10px]`)
- **Input Borders & Validation**:
  - Default borders: `border-gray-300`
  - Focus state: `border-blue-500 ring-1`
  - Error validation state: `border-red-300`
  - Disabled background: `bg-gray-100`
- **Layout Spacing**: Consistent main area padding using Tailwind `p-5` (1.25rem) to ensure perfect alignment with header breadcrumbs.

---

## 7. Developer Checklist: Adding a New Backend Feature to the UI

If you are a backend engineer creating or updating a feature (e.g., adding **Return Asset** capability):

1. **Update `asset.service.ts`**:
   Add the API endpoint path and request/response structure mapping:
   ```typescript
   returnAsset(payload: any) {
     return this.http.post<any>(`${this.baseUrl}/return-asset`, payload);
   }
   ```
2. **Inject the Service in Components**:
   Open the target component class (e.g. `ReturnAssetComponent` in `return-asset.component.ts`), inject the service, and replace the static mock data/actions with live API calls.
3. **Consume Response**:
   Handle success or error flags in the template using the toast notifications or error styling matching standard guidelines.
4. **Compile & Test**:
   Ensure both the shell and remote build cleanly without TypeScript errors:
   ```bash
   npm run serve
   ```
