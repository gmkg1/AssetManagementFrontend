# KJUsys Frontend Foundation — Developer User Manual

> **Purpose:** This document is the complete reference guide for any developer building a new frontend application on top of this repository. The repo is a pre-built, company-provided foundation — a micro-frontend shell with shared libraries, automation scripts, and design standards baked in. Your job is to follow this foundation, not fight it.

---

## Table of Contents

1. [What This Repo Is](#1-what-this-repo-is)
2. [Prerequisites](#2-prerequisites)
3. [Repository Structure](#3-repository-structure)
4. [Getting Started — First-Time Setup](#4-getting-started--first-time-setup)
5. [Architecture — How It All Works](#5-architecture--how-it-all-works)
6. [Automation CLI — Creating Projects and Modules](#6-automation-cli--creating-projects-and-modules)
7. [The Shared Library Ecosystem](#7-the-shared-library-ecosystem)
8. [UI Design Standards — Rules You Must Follow](#8-ui-design-standards--rules-you-must-follow)
9. [UI Component Libraries — Usage Reference](#9-ui-component-libraries--usage-reference)
10. [Build System](#10-build-system)
11. [Environments and Configuration](#11-environments-and-configuration)
12. [Production Deployment](#12-production-deployment)
13. [Common Mistakes and How to Avoid Them](#13-common-mistakes-and-how-to-avoid-them)

---

## 1. What This Repo Is

This repository is a **company-provided micro-frontend (MFE) base workspace** built on **Angular 16** and **Webpack Module Federation**. It is not a blank Angular project — it is an opinionated, pre-wired foundation that every new frontend application at this company must be built on top of.

Think of it as a platform, not a project. You do not build inside the shell. You build separate **remote applications** that plug into the shell at runtime.

### What it gives you out of the box

- A **host shell application** (`projects/shell`) that acts as the container for all micro-frontends
- A **dynamic manifest-based routing system** that discovers remote apps at runtime without any backend API
- **14 pre-built shared libraries** covering UI components, authentication, HTTP, navigation, and notifications
- **CLI automation scripts** that scaffold new remote projects and sub-modules with zero manual wiring
- A **resource-aware parallel build system** that manages memory during large builds
- **Enforced UI design standards** for typography, spacing, and input fields
- Production-ready Express static servers for each application

### What you build on top of it

Each domain feature (e.g., HR, Finance, Admissions) is a separate Angular **remote project** that you scaffold using the CLI tools. The shell discovers and loads these remotes at runtime. Your feature code never touches the shell directly.

---

## 2. Prerequisites

Before you do anything, ensure your machine meets these requirements.

| Requirement | Version | Notes |
| :--- | :--- | :--- |
| **Node.js** | v16+ (v18 or v20 LTS recommended) | v16 is the minimum; v20 LTS is preferred |
| **Angular CLI** | v16 | Must be installed globally |
| **npm** | v8+ | Comes with Node.js |

Install the Angular CLI globally:

```bash
npm install -g @angular/cli@16
```

Verify your setup:

```bash
node -v      # should be 16.x or higher
ng version   # should show Angular CLI 16.x
```

---

## 3. Repository Structure

```
AssetManagementFrontend/
├── angular.json                  # Angular workspace config — all projects registered here
├── package.json                  # All npm scripts, dependencies
├── tsconfig.json                 # TypeScript config + path aliases for all @libs/*
│
├── docs/                         # ← YOU ARE HERE — all design standards and library docs
│   ├── USER_MANUAL.md            # This file
│   ├── README.md                 # Library index overview
│   ├── rules-and-guidelines.md   # Mandatory UI design standards
│   └── libraries/                # Per-library API documentation
│
├── scripts/                      # Automation and build tools
│   ├── create-project.js         # CLI: scaffold a new MFE remote project
│   ├── create-module.js          # CLI: scaffold a sub-module inside a remote project
│   ├── dynamic-build.js          # RAM-aware parallel build scheduler
│   ├── inject-build-version.js   # Stamps build timestamp into version.json
│   ├── cleanup-old-chunks.js     # Removes stale webpack chunks from dist
│   ├── deploy.sh                 # Deployment shell script
│   └── manual-deploy.sh          # Manual deployment helper
│
├── prod-server/                  # Express static file servers for production
│   ├── shell.js                  # Serves the shell app on port 4200
│   └── server.js                 # Generic reverse-proxy / static server runner
│
└── projects/
    ├── shell/                    # The host shell application (DO NOT add features here)
    │   ├── src/app/
    │   │   ├── navigation/       # Main layout component (header + left menu + router-outlet)
    │   │   ├── utils/
    │   │   │   ├── routes.ts         # Builds Angular routes dynamically from the manifest
    │   │   │   ├── manifestResolver.ts # Loads mf.manifest.json at app startup
    │   │   │   ├── config.ts         # TypeScript types for the manifest schema
    │   │   │   └── mfe-common.service.ts # Shared service token for MFE communication
    │   │   ├── app.module.ts     # Shell's root module — imports all shared libs
    │   │   └── app.routes.ts     # Shell's base routes (login + kjusys redirect)
    │   ├── src/assets/
    │   │   ├── mf.manifest.json       # Local dev manifest (auto-managed by CLI scripts)
    │   │   ├── mf.manifest.prod.json  # Production manifest
    │   │   └── mf.manifest.dev.json   # Dev server manifest
    │   ├── src/environments/     # Environment configs per build target
    │   ├── webpack.config.js     # Shell webpack + Module Federation config (local)
    │   ├── webpack.prod.config.js
    │   └── webpack.dev.config.js
    │
    └── libs/                     # All shared Angular libraries
        ├── shared-auth/          # Authentication, guards, session, AG Grid
        ├── http-common/          # HTTP interceptor, base service, Razorpay loader
        ├── left-menu-lib/        # Left sidebar navigation component
        ├── menu-header-lib/      # Top header / navbar component
        ├── shared-ui/            # Atomic UI components (Button, Breadcrumbs, Upload, etc.)
        ├── shared-toast/         # Toast notification system
        ├── alert/                # Bottom-right alert notification system
        ├── tabs/                 # Primary scrollable tabs navigation
        ├── sub-tabs/             # Secondary tabs navigation
        ├── pill-tabs/            # Compact pill-style tab switcher
        ├── dropdown-lib/         # Single and multi-select dropdown
        ├── multi-dropdown-lib/   # Extended multi-select dropdown variant
        ├── table/                # Full-featured data table with sort/filter/export
        └── date-picker/          # Date range picker component
```

---

## 4. Getting Started — First-Time Setup

Follow these steps exactly, in order.

### Step 1 — Install dependencies

```bash
npm install
```

This installs all workspace dependencies including Angular, Webpack, Tailwind CSS, and all third-party packages.

### Step 2 — Build all shared libraries

Libraries must be compiled before any application can use them. The libraries are consumed from the `dist/` folder via TypeScript path aliases.

```bash
npm run build:lib
```

This runs in three ordered stages:

- **Stage 1** (parallel): `shared-auth`, `multi-dropdown-lib`, `alert`, `tabs`, `sub-tabs`, `shared-ui`, `dropdown-lib`, `table`, `shared-toast`, `pill-tabs`
- **Stage 2** (sequential): `http-common` — must run after stage 1 because it depends on `shared-auth`
- **Stage 3** (parallel): `menu-header-lib`, `left-menu-lib` — depend on both stage 1 and stage 2

> **Important:** If you skip `npm run build:lib`, your applications will fail to compile. The `@libs/*` path aliases in `tsconfig.json` all point to the `dist/` folder, not to source files.

### Step 3 — Start the development server

```bash
npm run serve
```

This starts the shell application at `http://localhost:4200`. Open that URL in your browser. You will see the dashboard with a message that no modules are registered yet — this is expected on a fresh setup.

### Step 4 — Create your first remote project

```bash
npm run create:project -- --name myproject --port 4205
```

See [Section 6](#6-automation-cli--creating-projects-and-modules) for full details on the CLI tools.

---

## 5. Architecture — How It All Works

Understanding this architecture is critical before you write a single line of code.

### 5.1 The Micro-Frontend Model

This workspace uses **Webpack Module Federation**. In this model:

- The **shell** (`projects/shell`) is the **host**. It owns the browser tab, the URL bar, the left menu, and the top header. It never knows about your business logic.
- Your **feature application** (e.g., `hr`, `finance`) is a **remote**. It runs on its own port, exposes its Angular modules via `remoteEntry.js`, and is loaded lazily by the shell at runtime.
- **Shared libraries** (e.g., `@angular/core`, `@libs/shared-auth`) are declared as singletons. Only one instance of each shared dependency runs in the browser at any time, regardless of how many remotes are loaded.

```
Browser
└── Shell (port 4200) ← host
    ├── lib-menu-header-lib   (top nav)
    ├── lib-left-menu-lib     (sidebar)
    └── <router-outlet>
        ├── /kjusys/hr/onboarding  → loads from HR Remote (port 4205)
        ├── /kjusys/finance/payroll → loads from Finance Remote (port 4206)
        └── ...
```

### 5.2 The Manifest System

The shell does not have hardcoded knowledge of which remotes exist. Instead, it reads a JSON manifest file at startup:

**`projects/shell/src/assets/mf.manifest.json`**

This file is the **registry** of all remote applications. Example structure:

```json
{
  "hr": {
    "remoteEntry": "http://localhost:4205/remoteEntry.js",
    "displayName": "Hr",
    "routePath": "hr",
    "subModule": [
      {
        "exposedModule": "./OnboardingModule",
        "displayName": "Onboarding",
        "subPath": "hr/onboarding",
        "ngModuleName": "OnboardingModule",
        "pinned": false
      }
    ]
  }
}
```

When the shell starts, `ManifestResolver` loads this file, then `buildRoutes()` in `routes.ts` dynamically constructs Angular routes for every sub-module listed. The left menu and dashboard grid are also built from this manifest.

> **Key rule:** You never manually edit `mf.manifest.json`. The `create:module` CLI script writes to it automatically. If you need to tweak a display name or subPath, edit the manifest directly after the CLI has generated the entry.

### 5.3 Route Structure

All application routes live under the `/kjusys` path prefix, which maps to the `NavigationComponent` in the shell. The `NavigationComponent` renders the header, sidebar, and the `<router-outlet>` where your remote modules load.

```
/                     → redirects to /kjusys
/login                → SharedAuthComponent (login page)
/kjusys               → NavigationComponent (shell layout)
  /kjusys/hr/onboarding    → OnboardingModule from HR remote
  /kjusys/hr/payroll       → PayrollModule from HR remote
  /kjusys/finance/invoices → InvoicesModule from Finance remote
```

Sub-paths follow the pattern: `/kjusys/{projectName}/{moduleName}`

### 5.4 Shared Singleton Libraries

These libraries are shared as singletons across the shell and all remotes. This means they are loaded once and shared in memory:

| Library | Shared as Singleton |
| :--- | :--- |
| `@angular/core` | Yes |
| `@angular/common` | Yes |
| `@angular/router` | Yes |
| `@libs/shared-auth` | Yes |
| `@libs/http-common` | Yes |
| `@libs/left-menu-lib` | Yes |
| `@libs/menu-header-lib` | Yes |
| `@libs/shared-toast` | Yes |
| `ngx-toastr` | Yes |
| `ngx-spinner` | Yes |

> **Rule:** Never import these as regular npm packages in your remote's `package.json`. They are resolved via `SharedMappings` in webpack and consumed from the shell's singleton. Importing them separately will cause two instances to load and break the app.

---

## 6. Automation CLI — Creating Projects and Modules

This is the most important workflow section. Always use these scripts — never create projects or modules by hand.

### 6.1 Creating a New Remote Project

```bash
npm run create:project -- --name <project-name> --port <port>
```

**Example:**

```bash
npm run create:project -- --name hr --port 4205
```

**What this script does automatically:**

1. Runs `ng generate application hr` with correct flags (standalone=false, legacy NgModule structure)
2. Runs `ng add @angular-architects/module-federation` to configure Module Federation
3. Generates `webpack.config.js`, `webpack.prod.config.js`, `webpack.dev.config.js` for the new project
4. Creates `tailwind.config.js` pre-wired to scan the libs folder
5. Creates all four environment files (`environment.ts`, `.prod.ts`, `.dev.ts`, `.local-server.prod.ts`)
6. Generates a clean `app.module.ts` with the correct imports (`HttpCommonModule`, `SharedAuthModule`, `StoreModule`, etc.)
7. Generates `app.routes.ts` with the standard login + kjusys navigation structure
8. Creates the `NavigationComponent` placeholder
9. Updates `angular.json` with all build configurations (`production`, `development`, `local`, `demo`, `local-server`)
10. Registers the new project in the shell's `webpack.config.js`, `webpack.prod.config.js`, and `webpack.dev.config.js`
11. Creates the production Express server script at `prod-server/hr.js`
12. Adds `build:hr`, `start`, and `serve` entries to `package.json` scripts

**Port rules:**
- Port `4200` is reserved for the shell — never use it
- Every project must have a unique port
- If you omit `--port`, the script auto-detects the next available port from `angular.json`

### 6.2 Creating a Sub-Module Inside a Project

```bash
npm run create:module -- --project <project-name> --module <module-name>
```

**Example:**

```bash
npm run create:module -- --project hr --module onboarding
```

**What this script does automatically:**

1. Creates the module folder at `projects/hr/src/app/modules/onboarding/`
2. Generates the component, routing module, feature module, and spec files
3. Adds a lazy-loaded route entry into `projects/hr/src/app/app.routes.ts` under the `children` array
4. Exposes `./OnboardingModule` in all three webpack configs for the `hr` project
5. Adds the sub-module entry into all three manifest files (`mf.manifest.json`, `.prod.json`, `.dev.json`)
6. Updates `tsconfig.app.json` with the module file reference

**After running this command**, restart your dev server. The module will appear on the shell dashboard and be accessible at `/kjusys/hr/onboarding`.

### 6.3 Quick Reference

| Task | Command |
| :--- | :--- |
| Create a new remote project | `npm run create:project -- --name <name> --port <port>` |
| Create a sub-module | `npm run create:module -- --project <name> --module <module>` |
| Start shell dev server | `npm run serve` |
| Build all libraries | `npm run build:lib` |
| Build everything for production | `npm run build` |
| Start production servers | `npm run start` |
| Clean Angular cache | `npm run clean:cache` |

---

## 7. The Shared Library Ecosystem

All libraries live in `projects/libs/` and are consumed via their `@libs/*` path aliases. They are built to the `dist/libs/` folder and TypeScript resolves imports from there.

### 7.1 Infrastructure Libraries (Always Required)

These libraries form the backbone of every remote application. They are already wired up when you run `create:project`.

---

#### `@libs/shared-auth`

The central authentication and session library. Every remote uses it.

**Key exports:**
- `SharedAuthModule` — import in your `AppModule`
- `SharedAuthComponent` — the login page component (used in `app.routes.ts`)
- `AuthGuard` — route guard; protects all `/kjusys/*` routes
- `AuthService` — manages JWT tokens and session state
- `SharedToastService` — a toast service (also available standalone from `@libs/shared-toast`)
- `AgGridSharedModule` — pre-configured AG Grid module

**Setup in your AppModule:**
```typescript
import { SharedAuthModule, AuthService, AuthGuard } from '@libs/shared-auth';

@NgModule({
  imports: [SharedAuthModule],
  providers: [AuthService, AuthGuard]
})
export class AppModule {}
```

---

#### `@libs/http-common`

Provides a configured `HttpClient` wrapper with interceptor support.

**Key exports:**
- `HttpCommonModule.forRoot(environment)` — import in `AppModule` with your environment object
- `CommonHttpInterceptor` — HTTP interceptor (auto-attaches auth tokens, handles errors)
- `HttpCommonService` — base service class for making API calls

**Setup:**
```typescript
import { HttpCommonModule, CommonHttpInterceptor } from '@libs/http-common';

@NgModule({
  imports: [HttpCommonModule.forRoot(environment)],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: CommonHttpInterceptor, multi: true }
  ]
})
export class AppModule {}
```

---

#### `@libs/left-menu-lib`

Renders the left sidebar navigation menu. Used by the shell's `NavigationComponent` — you do not use this directly in remotes.

**Key exports:**
- `LeftMenuLibModule`
- `LeftMenuLibComponent` — selector: `lib-left-menu-lib`
- `TabCommunicationService` — communicates active tab state across the MFE boundary

---

#### `@libs/menu-header-lib`

Renders the top navigation header. Also used only in the shell's `NavigationComponent`.

**Key exports:**
- `MenuHeaderLibModule`
- `MenuHeaderLibComponent` — selector: `lib-menu-header-lib`
- `ChangePasswordService`

---

#### `@libs/shared-toast`

A standalone toast notification library for programmatic notifications.

**Setup:** Place `<shared-toast></shared-toast>` in your root `app.component.html`. Import `SharedToastModule` in `AppModule`.

**Usage in any component:**
```typescript
import { SharedToastService } from '@libs/shared-toast';

constructor(private toast: SharedToastService) {}

this.toast.success('Record saved successfully!');
this.toast.error('Something went wrong.');
this.toast.warning('Session expiring soon.');
this.toast.info('New update available.');

// Custom notification
this.toast.custom({
  message: 'Upload complete.',
  iconSvg: '<svg>...</svg>',
  iconBgColor: '#e0e7ff',
  textColor: '#3730a3'
});
```

Auto-dismisses after 5 seconds. Timer pauses on hover. Manual close via the X button.

---

### 7.2 UI Component Libraries (Use in Your Features)

These are the libraries you will actively use inside your remote modules.

---

#### `@libs/shared-ui`

The atomic component collection. Import individual components as standalone or via `SharedUiModule`.

```typescript
import { ButtonComponent, EmptyStateComponent, BreadcrumbsTitleComponent } from '@libs/shared-ui';
```

**Components:**

| Selector | Purpose |
| :--- | :--- |
| `lib-button` | Standard button with variants: `primary`, `secondary`, `reject`, `green` |
| `lib-empty-state` | Empty state illustration for no-data scenarios |
| `lib-breadcrumbs-title` | Page header combining breadcrumb trail + page title |
| `lib-mini-fileupload` | Compact inline file picker for forms |
| `lib-file-upload` | Drag-and-drop single file upload area |
| `lib-media-upload` | Multi-file upload with previews and size validation |
| `lib-geo-select` | Cascading Country → State → District selector |

**Button usage:**
```html
<lib-button label="Save" (onClick)="onSave()"></lib-button>
<lib-button label="Processing" [loading]="true"></lib-button>
<lib-button label="Cancel" type="reject"></lib-button>
<lib-button label="Disabled" [disabled]="true"></lib-button>
```

**Breadcrumbs usage:**
```typescript
breadcrumbs = [
  { label: 'Home', callback: () => this.router.navigate(['/']) },
  { label: 'Users' }
];
```
```html
<lib-breadcrumbs-title title="User Management" [breadcrumbs]="breadcrumbs">
</lib-breadcrumbs-title>
```

**Empty state usage:**
```html
<lib-empty-state type="no-results" subtext="Try adjusting your filters.">
</lib-empty-state>
```

---

#### `@libs/alert`

A programmatic alert system positioned at the bottom-right of the viewport. Distinct from toast — alerts support action buttons and stay on screen until acted upon.

**Usage:**
```typescript
import { AlertService } from '@libs/alert';

constructor(private alertService: AlertService) {}

// Basic
this.alertService.success('Data saved successfully');
this.alertService.error('Save failed. Please try again.');
this.alertService.warning('Unsaved changes detected.');
this.alertService.info('Sync completed.', 'Information');

// With action button (stays on screen until clicked)
this.alertService.success(
  'Record submitted for approval.',
  'Action Required',
  'Confirm',
  (id) => { /* handle confirmation */ }
);
```

Alerts auto-dismiss after 5000ms unless they have an action button. Multiple alerts stack vertically.

---

#### `@libs/tabs`

Primary page-level tab navigation with overflow scrolling, count badges, and auto-scrolling to the active tab.

**Usage:**
```typescript
import { TabItem } from '@libs/tabs';

tabs: TabItem[] = [
  { id: 'overview', label: 'Overview', subtitle: 'Summary view' },
  { id: 'details', label: 'View Details', subtitle: 'Full data', count: 5 }
];
activeTabId = 'overview';

onTabChange(id: string) { this.activeTabId = id; }
```
```html
<lib-tabs [tabs]="tabs" [activeTabId]="activeTabId" [autoWidth]="true"
  (tabChange)="onTabChange($event)">
</lib-tabs>
```

> **Content rule:** Tab labels must be exactly **2 words**. Subtitles must be **3–4 words maximum**. This is enforced by the design standard to maintain consistent tab widths.

---

#### `@libs/sub-tabs`

Secondary navigation for sub-sections within a page. Use below primary tabs. Features an 11px font size and subtle blue theme.

```typescript
import { SubTabItem } from '@libs/sub-tabs';

subTabs: SubTabItem[] = [
  { id: 'personal', label: 'Personal Info', count: 2 },
  { id: 'documents', label: 'Documents' },
  { id: 'history', label: 'History' }
];
activeSubTabId = 'personal';
```
```html
<lib-sub-tabs [tabs]="subTabs" [activeTabId]="activeSubTabId"
  (tabChange)="activeSubTabId = $event">
</lib-sub-tabs>
```

---

#### `@libs/pill-tabs`

Compact pill-style tab switcher for small filter groups in headers or toolbars.

```typescript
import { PillTabItem } from '@libs/pill-tabs';

pillTabs: PillTabItem[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' }
];
activePillTab = 'all';
```
```html
<lib-pill-tabs [tabs]="pillTabs" [activeTabId]="activePillTab"
  (tabChange)="activePillTab = $event">
</lib-pill-tabs>
```

---

#### `@libs/dropdown-lib`

The standard dropdown for all single-select and multi-select use cases. Import `DropdownLibModule` in your feature module.

**Single-select:**
```html
<lib-dropdown-lib
  label="Department"
  placeholder="Select department"
  [singleSelection]="true"
  [data]="departments"
  idField="id"
  textField="name"
  [selectedItems]="selectedDept"
  (selectionChange)="selectedDept = $event">
</lib-dropdown-lib>
```

**Multi-select:**
```html
<lib-dropdown-lib
  label="Assign To"
  placeholder="Select team members"
  [singleSelection]="false"
  [data]="users"
  idField="_id"
  textField="fullName"
  [selectedItems]="assignedUsers"
  (selectionChange)="assignedUsers = $event">
</lib-dropdown-lib>
```

> **Note:** `selectedItems` is always an array, even for single-select mode.

---

#### `@libs/table`

A fully-featured data table. Use this for any list/grid view in your modules instead of building custom tables.

```html
<lib-table
  [columns]="columns"
  [data]="tableData"
  [loading]="isLoading"
  [showCheckboxes]="true"
  [clientPagination]="false"
  [primaryActions]="[{ type: 'edit' }, { type: 'delete' }]"
  [filters]="filterConfig"
  [pagination]="paginationState"
  (onEdit)="handleEdit($event)"
  (onDelete)="handleDelete($event)"
  (onPageChange)="loadPage($event)"
  (onSearch)="searchTable($event)"
  (onFilterApply)="applyFilters($event)">
</lib-table>
```

**Column definition:**
```typescript
columns: TableColumn[] = [
  { key: 'name', label: 'Name', sortable: true, type: 'text' },
  { key: 'createdAt', label: 'Date', sortable: true, type: 'date' },
  { key: 'status', label: 'Status', type: 'status' }
];
```

Use `[clientPagination]="true"` for datasets under 1000 rows to avoid repeated API calls.

---

#### `@libs/date-picker`

A custom date range picker with confirmation logic (selection only commits on "Apply").

```html
<lib-date-picker
  [initialStartDate]="startDate"
  [initialEndDate]="endDate"
  placeholder="Select Date Range"
  (dateRangeSelected)="onDateSelect($event)"
  (onClear)="clearDates()">
</lib-date-picker>
```

```typescript
onDateSelect(range: { from: Date; to: Date | null }) {
  this.startDate = range.from;
  this.endDate = range.to;
}
```

---

## 8. UI Design Standards — Rules You Must Follow

These standards are **mandatory**. Every screen built on this platform must conform to them. Inconsistent UI breaks the professional look of the product.

### 8.1 Typography Scale

| Element | Font Size | Font Weight | Tailwind Class |
| :--- | :--- | :--- | :--- |
| Page Title | 14px | Semibold | `text-sm font-semibold` |
| Section Subtitle | 12px | Semibold | `text-xs font-semibold` |
| Body / Content | 12px | Regular | `text-xs` |
| Input Field Text | 12px | Regular | `text-xs` |
| Input Label | 10px | Medium | `text-[10px] font-medium` |
| Secondary / Meta Text | 10px | Regular | `text-[10px]` |
| Breadcrumbs | 10px | Regular | `text-[10px]` |

The scale is intentionally compact. This is an information-dense admin interface, not a consumer app. Do not use larger font sizes than what is listed here for standard content.

### 8.2 Input Field States

Every input field in every form must follow these exact styles:

| State | Border | Background | Focus Ring |
| :--- | :--- | :--- | :--- |
| Default | `border-gray-300` | transparent / white | — |
| Disabled | `border-gray-300` | `bg-gray-100` | — |
| Error / Validation | `border-red-300` | no change | — |
| Active / Focus | `border-blue-500` | no change | `ring-1` |

Example of a correctly styled input:
```html
<input
  type="text"
  class="w-full text-xs border border-gray-300 rounded px-2 py-1.5
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
         disabled:bg-gray-100"
/>
<label class="text-[10px] font-medium text-gray-600">Field Label</label>
```

### 8.3 Layout and Spacing

- **Standard page padding:** Use `p-5` on the main content container. This aligns with the breadcrumbs component's internal padding.
- The `lib-breadcrumbs-title` component and your page content area must have identical padding to appear visually aligned.
- The shell's `NavigationComponent` applies `px-2` to the `<main>` tag. Account for this when calculating inner padding.

### 8.4 Tab Label Rules

When using `lib-tabs`:
- Labels must be exactly **2 words** (e.g., "Capture Score", "View Details")
- Subtitles must be a maximum of **3 to 4 words**

When using `lib-sub-tabs`:
- No strict word count, but keep labels concise — they render at 11px

### 8.5 General Principles

- **Predictability:** If a component behaves a certain way in one module, it must behave the same way everywhere.
- **Density:** Prefer compact layouts. Use `text-xs` and small paddings. Leave whitespace intentional, not accidental.
- **Blue as primary action colour:** `blue-500` / `#005faa` is the primary interactive colour across the entire system. Do not introduce alternative action colours.

---

## 9. UI Component Libraries — Usage Reference

Quick lookup table for when to use which component.

| Situation | Use This |
| :--- | :--- |
| Page header with navigation trail | `lib-breadcrumbs-title` from `@libs/shared-ui` |
| Primary CTA or form submit button | `lib-button` from `@libs/shared-ui` |
| Empty list / no data state | `lib-empty-state` from `@libs/shared-ui` |
| Top-level page sections (e.g., Overview / Reports) | `lib-tabs` from `@libs/tabs` |
| Sub-sections within a page | `lib-sub-tabs` from `@libs/sub-tabs` |
| Small filter toggles (All / Active / Inactive) | `lib-pill-tabs` from `@libs/pill-tabs` |
| Any dropdown — single or multi select | `lib-dropdown-lib` from `@libs/dropdown-lib` |
| Data list / grid | `lib-table` from `@libs/table` |
| Date range input | `lib-date-picker` from `@libs/date-picker` |
| Upload a single file inline (inside a form row) | `lib-mini-fileupload` from `@libs/shared-ui` |
| Upload a single file (full section) | `lib-file-upload` from `@libs/shared-ui` |
| Upload multiple images / documents | `lib-media-upload` from `@libs/shared-ui` |
| Country / State / District select | `lib-geo-select` from `@libs/shared-ui` |
| Programmatic success / error / warning message | `SharedToastService` from `@libs/shared-toast` |
| Alert with an action button | `AlertService` from `@libs/alert` |

---

## 10. Build System

### 10.1 Library Build Order

Libraries have dependencies on each other. Always use `npm run build:lib` which handles the order automatically. Never run individual library builds out of order.

```
Stage 1 (parallel, no inter-lib deps):
  shared-auth, multi-dropdown-lib, alert, tabs, sub-tabs,
  shared-ui, dropdown-lib, table, shared-toast, pill-tabs

Stage 2 (sequential, depends on stage 1):
  http-common

Stage 3 (parallel, depends on stage 1 + 2):
  menu-header-lib, left-menu-lib
```

### 10.2 Dynamic Build Scheduler (`dynamic-build.js`)

The `build` and `build:lib` scripts use a custom parallel build scheduler that is resource-aware. It will not spawn a new build process if:

- Available free RAM drops below the configured headroom (default: 5GB)
- The CPU cap is reached (defaults to CPU count - 1)

It dynamically measures each project's source directory size to decide how much heap to allocate:
- Projects ≥ 15MB of source → **4096MB heap**, 20s cooldown (heavy)
- Projects < 15MB of source → **2048MB heap**, 5s cooldown (light)

You can override these for lighter workloads:
```bash
node scripts/dynamic-build.js --cooldown=1000 --headroom=512 "ng build @libs/foo"
```

### 10.3 Build Configurations

Each remote project (generated by `create:project`) comes with five build configurations:

| Configuration | Purpose | Webpack Config |
| :--- | :--- | :--- |
| `production` | Production deployment | `webpack.prod.config.js` |
| `development` | Dev server with source maps | `webpack.dev.config.js` |
| `local` | Local dev without file replacements | `webpack.config.js` |
| `local-server` | Local production server (serves from dist) | `webpack.config.js` |
| `demo` | Demo/staging environment | `webpack.prod.config.js` |

```bash
# Build a specific remote for production
ng build hr --configuration=production

# Or via the generated npm script
npm run build:hr
```

---

## 11. Environments and Configuration

Each remote project has four environment files generated by `create:project`:

| File | Used For |
| :--- | :--- |
| `environment.ts` | Default / local development |
| `environment.dev.ts` | Dev server deployment |
| `environment.prod.ts` | Production deployment |
| `environment.local-server.prod.ts` | Running production builds locally |

### 11.1 Environment Object Shape

```typescript
export const environment = {
  production: false,
  mfe: {
    hr: 'http://localhost:4205',        // URL where this remote runs
  },
  publicPath: 'http://localhost:4205/',
  baseUrl: 'http://your-api-server/kjusys-api',
  project: 'hr',
  baseRoute: 'kjusys',
  local: false,
  apirefreshUrl: 'http://your-api-server/kjusys-api/authnauthz/refresh-access-token'
};
```

### 11.2 Shell Environment

The shell's `environment.ts` contains the manifest path and the base URLs for all known MFE remotes:

```typescript
export const environment = {
  production: false,
  manifestPath: '/assets/mf.manifest.json',
  mfe: {
    hr: 'http://localhost:4205',
    finance: 'http://localhost:4206',
    // ... other remotes
  },
  baseUrl: 'http://localhost:8080/kjusys-api',
  project: 'shell',
  baseRoute: 'kjusys',
  local: false,
};
```

When deploying to production, update `manifestPath` to point to the production manifest and update all `mfe` URLs to the production subdomain addresses.

### 11.3 The Manifest Files

There are three manifest files used across environments:

| File | Used When |
| :--- | :--- |
| `mf.manifest.json` | Local development |
| `mf.manifest.prod.json` | Production builds |
| `mf.manifest.dev.json` | Dev server builds |

The `create:module` CLI script writes to all three. When deploying, make sure the remote entry URLs in the prod manifest match your actual server addresses.

---

## 12. Production Deployment

### 12.1 Build Everything

```bash
npm run build
```

This runs `dynamic-build.js` which builds the shell and all registered remote applications sequentially/in parallel based on available system resources.

### 12.2 Per-Project Build

To build only one remote:

```bash
npm run build:hr      # builds the hr remote
npm run build:shell   # builds the shell
```

The `BUILD_CONFIG` environment variable selects the configuration (defaults to `production`):

```bash
BUILD_CONFIG=development npm run build:hr
```

### 12.3 Running Production Servers Locally

Every project (shell + remotes) has a generated Express static server script in `prod-server/`:

```bash
npm run start
# Starts: prod-server/shell.js (port 4200)
#         prod-server/hr.js (port 4205)
#         prod-server/finance.js (port 4206)
#         ... all registered remotes
```

Each server serves its respective `dist/<projectName>/` folder and handles SPA routing (returns `index.html` for non-JS paths).

### 12.4 Version Tracking

The `postbuild:shell` script automatically writes a `version.json` file to `dist/shell/assets/version.json` after every shell build, containing the build timestamp. The `VersionCheckService` uses this to detect when a new deployment is live and prompt users to refresh.

---

## 13. Common Mistakes and How to Avoid Them

### ❌ Creating a project or module manually

Always use the CLI scripts. Manually created projects will be missing webpack configs, environment files, manifest entries, `angular.json` configurations, and `package.json` scripts. The automation does about 15 things at once — you will miss something.

### ❌ Adding feature code to the shell project

The shell (`projects/shell`) is the host container. It should only contain layout components (NavigationComponent), MFE plumbing (routes, manifest resolver), and shared module imports. Never add domain-specific features to the shell.

### ❌ Skipping `npm run build:lib` before `npm run serve`

All `@libs/*` imports resolve from the `dist/` folder. If the libraries haven't been compiled, your build will fail with "Cannot find module '@libs/tabs'" errors. Run `npm run build:lib` once after cloning, and again whenever you make changes to a library.

### ❌ Using a port that's already taken

Port 4200 is the shell. Each remote must have a unique port. Check `angular.json` or the environment files to see which ports are already in use before running `create:project`.

### ❌ Not following the typography and input standards

The UI standards in Section 8 are not suggestions. Using `text-base` or `text-lg` on content, or skipping the `ring-1 focus:border-blue-500` on inputs, creates inconsistency that affects every screen in the product. Follow the standards.

### ❌ Manually editing `mf.manifest.json` to add a new module

Run `create:module` and let the script do it. If you must edit the manifest manually (e.g., to change a display name), make sure you edit all three manifest files: `mf.manifest.json`, `mf.manifest.prod.json`, and `mf.manifest.dev.json`.

### ❌ Importing `@angular/core` or other singletons as regular dependencies in your remote

These are provided by the shell as shared singletons via Module Federation. If you install them separately and import them outside of the Module Federation share config, you will get two instances running simultaneously — causing router conflicts, zone.js errors, and other hard-to-debug issues.

### ❌ Using `ng serve <projectName>` without a running shell

Your remote application is designed to run inside the shell. Running a remote in isolation (without the shell loading it) may work partially for development, but routing, auth, and left-menu functionality depend on the shell being present. Use `npm run serve` to start the full stack.

---

## Appendix — All `@libs` Path Aliases

| Import Path | Resolves To |
| :--- | :--- |
| `@libs/alert` | `dist/libs/alert` |
| `@libs/date-picker` | `dist/libs/date-picker` |
| `@libs/dropdown-lib` | `dist/libs/dropdown-lib` |
| `@libs/http-common` | `dist/libs/http-common` |
| `@libs/left-menu-lib` | `dist/libs/left-menu-lib` |
| `@libs/menu-header-lib` | `dist/libs/menu-header-lib` |
| `@libs/multi-dropdown-lib` | `dist/libs/multi-dropdown-lib` |
| `@libs/shared-auth` | `dist/libs/shared-auth` |
| `@libs/shared-toast` | `dist/libs/shared-toast` |
| `@libs/shared-ui` | `dist/libs/shared-ui` |
| `@libs/sub-tabs` | `dist/libs/sub-tabs` |
| `@libs/table` | `dist/libs/table` |
| `@libs/tabs` | `dist/libs/tabs` |
| `@libs/pill-tabs` | `dist/libs/pill-tabs` |

All aliases are defined in the root `tsconfig.json` under `compilerOptions.paths`.

---

*This manual covers the complete developer surface of the KJUsys frontend foundation. For library-specific visual references and extended API details, refer to the individual documents in `docs/libraries/`.*
