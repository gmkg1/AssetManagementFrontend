# Asset Management Frontend — Presentation Notes
## Key Technical Decisions & Implementation Details

---

## 1. How Components Were Generated (Angular CLI)

Every feature screen was scaffolded using the Angular CLI `ng generate component` command (shortened as `ng g c`).

### Why we used `ng g c` instead of creating files manually

Creating an Angular component manually means writing the `.ts`, `.html`, `.scss` files yourself AND remembering to declare the component inside the right `NgModule`. If you forget the declaration, Angular throws an error and the component won't render.

`ng g c` does all of that in one command — it creates all four files and **automatically adds the component to the `declarations` array** of the nearest module. This is especially important in a multi-module project like this one where forgetting a declaration is an easy mistake.

It also enforces a consistent file-naming convention across the whole project, so every developer knows exactly where to find things.

**Command pattern:**
```bash
ng g c modules/asset-dashboard/<component-name> --project=asset-management
```

The `--project=asset-management` flag is required because this is a monorepo with multiple projects under `projects/`. Without it, the CLI wouldn't know which project's module to register the component in.

**All components generated for this project:**
```bash
ng g c modules/asset-dashboard/dashboard              --project=asset-management
ng g c modules/asset-dashboard/view-assets            --project=asset-management
ng g c modules/asset-dashboard/create-asset           --project=asset-management
ng g c modules/asset-dashboard/edit-asset             --project=asset-management
ng g c modules/asset-dashboard/issue-asset            --project=asset-management
ng g c modules/asset-dashboard/issue-log              --project=asset-management
ng g c modules/asset-dashboard/return-asset           --project=asset-management
ng g c modules/asset-dashboard/return-log             --project=asset-management
ng g c modules/asset-dashboard/edit-warranty-licenses --project=asset-management
ng g c modules/asset-dashboard/reports                --project=asset-management
```

What gets generated automatically for each:
- `<name>.component.ts` — the class with `@Component` decorator
- `<name>.component.html` — the template
- `<name>.component.scss` — the styles
- `<name>.component.spec.ts` — test file
- The component is auto-added to `AssetDashboardModule`'s `declarations[]`

---

## 2. Debouncing — Search Without Spamming the API

**The problem:** If we fire an API call on every keystroke in a search box, we'd send dozens of requests while the user is still typing.

**The solution:** RxJS `debounceTime` — waits until the user stops typing for 300ms before firing.

### How it's wired up (example from `view-assets.component.ts`):

```typescript
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

// 1. Create a Subject — acts as a manual trigger
private searchSubject = new Subject<void>();
private searchSub!: Subscription;

ngOnInit(): void {
  // 2. Subscribe with a 300ms delay
  this.searchSub = this.searchSubject.pipe(
    debounceTime(300)
  ).subscribe(() => {
    this.currentPage = 1;
    this.loadAssets();
  });
}

ngOnDestroy(): void {
  // 3. Always unsubscribe to prevent memory leaks
  this.searchSub?.unsubscribe();
}

onSearchInput(): void {
  const nameLen = this.searchQuery.length;
  const tagLen  = this.assetTagQuery.length;

  // 4. Only trigger at 3 chars (start filtering) or 0 chars (clear/reset)
  const nameTrigger = nameLen === 3 || (nameLen === 0 && tagLen === 0);
  const tagTrigger  = tagLen  === 3 || (tagLen  === 0 && nameLen === 0);

  if (nameTrigger || tagTrigger) {
    this.searchSubject.next(); // push a signal, not the value
  }
}
```

**Key rule:** API calls only fire when:
- User types exactly 3 characters (minimum meaningful search)
- User clears the field back to 0 (reset to show all)
- 1–2 characters do nothing (avoids noisy short queries)

The same pattern is used in `issue-log.component.ts` for filtering the issue log table.

---

## 3. Date Logic — ISO Format for APIs, Human-Readable for Display

**The problem:** Dates from the backend come as ISO strings (e.g., `"2024-03-15T00:00:00.000Z"`). HTML `<input type="date">` needs `YYYY-MM-DD`. The UI should show `15 Mar 2024`.

### Three date transformations used across the project:

#### a) Display format (for tables and detail panels)
```typescript
// ISO string → "15 Mar 2024"
new Date(item.issueDate).toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
})
```
Used in: `view-assets`, `issue-log`, `return-log`, `dashboard`

#### b) Form pre-fill (for date input fields)
```typescript
// ISO string → "2024-03-15" (what <input type="date"> expects)
new Date(data.purchaseDate).toISOString().substring(0, 10)
```
Used in: `edit-warranty-licenses`, `view-assets` (detail panel), `create-asset` (clone mode)

#### c) Date validation (in create-asset form)
```typescript
// Prevent EOL Date from being before Purchase Date
if (this.eolDate && this.purchaseDate && this.eolDate < this.purchaseDate) {
  this.errorMessage = 'EOL Date cannot be before Purchase Date.';
  return;
}
```
This works because `YYYY-MM-DD` strings sort correctly with string comparison.

#### d) Sending dates to the API
Dates are sent as plain strings in `YYYY-MM-DD` format directly from the `<input type="date">` value — no extra formatting needed.

---

## 4. Serial Number Logic — Smart Auto-Increment for Clone Asset

**The feature:** When cloning an asset, the new asset gets the next available serial number automatically — no manual entry needed.

**Example:** Cloning `LAPTOP-001` → suggests `LAPTOP-002`. If `LAPTOP-002` already exists → `LAPTOP-003`.

### How it works (from `view-assets.component.ts`):

```typescript
cloneAsset(asset: Asset): void {
  this.assetService.getAssetDetails(asset._id).subscribe({
    next: (res) => {
      const rawSerial = data?.assetSerialNumber || asset.serial || '';

      // Step 1: Split the serial into a text prefix and a numeric suffix
      // e.g. "LAPTOP-001" → prefix="LAPTOP-", num="001"
      const match = rawSerial.match(/^(.*?)(\d+)$/);

      const resolveSerial = (existingSerials: Set<string>): string => {
        if (match) {
          let num = parseInt(match[2], 10) + 1;
          const padLen = match[2].length; // preserves zero-padding
          while (true) {
            const candidate = match[1] + String(num).padStart(padLen, '0');
            if (!existingSerials.has(candidate.toLowerCase())) return candidate;
            num++;
          }
        } else {
          // No numeric suffix → append -1, -2, etc.
          let suffix = 1;
          while (true) {
            const candidate = `${rawSerial}-${suffix}`;
            if (!existingSerials.has(candidate.toLowerCase())) return candidate;
            suffix++;
          }
        }
      };

      // Step 2: Search existing assets with the same prefix to get all taken serials
      this.assetService.searchAssets(prefix).subscribe({
        next: (searchRes) => {
          const existingSerials = new Set<string>(
            results.map((a: any) => (a.assetSerialNumber || '').toLowerCase())
          );
          const newSerial = resolveSerial(existingSerials); // first gap found
          // Step 3: Pre-fill Create Asset form with this new serial
          this.dashboardTabsService.cloneAssetData = { ...cloneData, serial: newSerial };
          this.dashboardTabsService.changeTab('create-asset');
        }
      });
    }
  });
}
```

**Key design choices:**
- Regex `/^(.*?)(\d+)$/` splits any serial with a numeric tail
- Zero-padding is preserved (`001` stays 3 digits)
- A `Set<string>` of lowercased existing serials makes collision checks O(1)
- If the search API fails, falls back to simple `+1` increment

---

## 5. How Libraries Are Added to This Project

This is an Angular monorepo. There are two kinds of "libraries":

### a) External npm packages

Added via npm as usual:
```bash
npm install <package-name>
```

Then imported in the module or component that needs it. Examples used in this project:

| Package | Used For |
|---------|----------|
| `@ng-select/ng-select` | Searchable dropdowns |
| `ngx-toastr` | Toast notifications |
| `apexcharts` | Charts on the dashboard |
| `tailwindcss` | Utility CSS classes |
| `rxjs` | Observables, debounce, subscriptions |
| `@angular-architects/module-federation` | Microfrontend wiring |
| `concurrently` | Run shell + remote apps simultaneously in dev |

After installing, the package goes into `package.json` under `dependencies` or `devDependencies`.

### b) Internal shared libraries (inside `projects/libs/`)

These are Angular libraries built within the monorepo itself. They are generated with:
```bash
ng generate library <lib-name>
```

The shared libs used in this project:

| Library | What it provides |
|---------|-----------------|
| `@libs/shared-auth` | Auth guards, JWT helpers, login integration |
| `@libs/http-common` | Shared HTTP interceptors (auth headers, error handling) |
| `@libs/left-menu-lib` | The left sidebar navigation component |
| `@libs/menu-header-lib` | Top header / breadcrumbs component |
| `@libs/shared-toast` | Toast notification wrapper |

**Build order matters.** Shared libs must be built before the apps that consume them:
```bash
npm run build:lib        # builds all libs in the correct order
npm run build            # then builds shell + asset-management
```

The build is split into stages to handle inter-library dependencies:
- **Stage 1:** Base libs (auth, UI components, toast, etc.) — can build in parallel
- **Stage 2:** `http-common` — depends on stage 1
- **Stage 3:** `menu-header-lib`, `left-menu-lib` — depend on http-common

---

## 6. ChangeDetectorRef (CDR) — Forcing the UI to Update

### What is it?

Angular normally updates the UI automatically when data changes — this is called **Change Detection**. But some of our components use `ChangeDetectionStrategy.OnPush` (or are rendered inside a microfrontend shell context), which means Angular only checks for changes when:
- An `@Input` property changes
- An event fires from within the template
- You tell it to manually

When data arrives from an HTTP call (an async operation), Angular sometimes doesn't know the data changed and the screen stays blank or stale. That's where `ChangeDetectorRef` comes in.

### How it's injected

```typescript
import { ChangeDetectorRef } from '@angular/core';

constructor(
  private assetService: AssetService,
  private cdr: ChangeDetectorRef   // inject it here
) {}
```

### How it's used

`cdr.detectChanges()` is called right after setting data that came from an API call, to tell Angular "something changed, re-render now":

```typescript
// From view-assets.component.ts — after assets load from API
this.assets = raw.map((item, i) => this.mapToAsset(item, i));
this.isLoading = false;
this.cdr.detectChanges(); // ← force UI refresh
```

```typescript
// From view-assets.component.ts — after licenses/warranty load
this.assetLicenses = data.licenses || [];
this.assetWarranties = data.warranty || [];
this.cdr.detectChanges(); // ← otherwise the detail panel stays empty
```

```typescript
// From dashboard.component.ts — after category counts arrive
this.departments = categories.map(cat => { ... });
this.cdr.detectChanges(); // ← cards won't render without this
```

### Why it was needed in this project specifically

All the feature screens live as **tab components** inside `AssetDashboardModule`. The tab shell controls which component is visible. Because components are swapped in and out without a full route navigation, Angular's normal top-down change detection cycle doesn't always reach deeply nested async updates. Calling `cdr.detectChanges()` after every API response was the reliable fix to ensure data always renders on screen immediately.

**Summary:** Any time you see `this.cdr.detectChanges()` in a component, it means "this data came back from an async call and we're telling Angular to re-check this component's view right now."

---

## 7. Quick Reference — Where Each Feature Lives

| Feature | File |
|---------|------|
| Debounce search | `view-assets.component.ts` → `onSearchInput()` |
| Date display format | Any component → `toLocaleDateString('en-GB', ...)` |
| Date form pre-fill | `edit-warranty-licenses.component.ts` → `.toISOString().substring(0,10)` |
| Serial number clone logic | `view-assets.component.ts` → `cloneAsset()` |
| CDR usage | `view-assets`, `dashboard`, `issue-log` → `this.cdr.detectChanges()` after every API response |
| All API calls | `asset.service.ts` |
| Tab navigation (no page reload) | `dashboard-tabs.service.ts` → `changeTab()` |
| Component generation commands | `ng g c modules/asset-dashboard/<name> --project=asset-management` |
