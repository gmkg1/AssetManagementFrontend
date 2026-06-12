# Requirements Document

## Introduction

The Asset Management Frontend currently uses a mix of spinner icons, loading text, and in one case no loading indicator at all while data is being fetched from the backend. This feature replaces every loading state across all pages with tabular skeleton loaders — animated placeholder rows and columns that structurally mirror each page's real table layout. The goal is to give users an immediate visual representation of what is about to appear, eliminating all spinners and text-based loading indicators.

The affected pages are:
- **View Assets** (`view-assets`) — 8-column asset table with summary stat cards
- **Issue Log** (`issue-log`) — 5-column issue records table
- **Return Log** (`return-log`) — 6-column return records table
- **Asset Dashboard** (`asset-dashboard`) — category card grid + inline issue-history mini-table
- **Reports** (`reports`) — 10-column asset report table with checkboxes

---

## Glossary

- **Skeleton_Loader**: An animated placeholder UI element that mimics the shape and layout of the content that will replace it once data has loaded. It uses a shimmer/pulse animation and contains no real data.
- **Skeleton_Row**: A single horizontal placeholder row inside a Skeleton_Loader, containing Skeleton_Cells whose widths match the proportional widths of the real table columns.
- **Skeleton_Cell**: An individual rectangular placeholder block inside a Skeleton_Row that represents one table column's data cell.
- **Skeleton_Card**: An animated placeholder block used in non-tabular loading areas such as summary stat cards and category cards.
- **Shimmer_Animation**: A CSS animation (using `animate-pulse` from Tailwind CSS) applied to all skeleton elements to indicate active loading.
- **isLoading**: A boolean property present on each page component that is `true` while data is being fetched and `false` once the API call completes or errors.
- **Loading_State**: The period between when a page component initiates a data fetch and when the response (success or error) is received.
- **Spinner**: A circular animated SVG icon used as a loading indicator. Spinners are explicitly prohibited by this feature.
- **Loading_Text**: Any text string such as "Loading...", "Loading issue log...", or "Loading return log..." displayed during a Loading_State. Loading text is explicitly prohibited by this feature.
- **View_Assets_Page**: The Angular component at `view-assets` that displays the paginated asset list and summary stat cards.
- **Issue_Log_Page**: The Angular component at `issue-log` that displays issued-asset records.
- **Return_Log_Page**: The Angular component at `return-log` that displays asset return records.
- **Asset_Dashboard_Page**: The Angular component at `asset-dashboard` that displays category cards and an inline issue-history mini-table.
- **Reports_Page**: The Angular component at `reports` that displays a multi-column asset report table with checkboxes.
- **Skeleton_Module**: A shared Angular module that declares and exports the `SkeletonRowComponent` and `SkeletonCardComponent` reusable components.
- **SkeletonRowComponent**: A reusable Angular component that renders one Skeleton_Row with configurable column-width proportions.
- **SkeletonCardComponent**: A reusable Angular component that renders one rectangular Skeleton_Card placeholder.

---

## Requirements

### Requirement 1: Shared Skeleton Component Infrastructure

**User Story:** As a developer, I want a shared skeleton loader module so that all pages can use consistent, reusable skeleton components without duplicating animation logic.

#### Acceptance Criteria

1. THE Skeleton_Module SHALL declare and export a `SkeletonRowComponent` that renders a single animated Skeleton_Row.
2. THE Skeleton_Module SHALL declare and export a `SkeletonCardComponent` that renders a single animated Skeleton_Card.
3. THE SkeletonRowComponent SHALL accept an input property named `columns` that takes an array of numbers in the range 0–100 representing the relative width percentages of each Skeleton_Cell, and SHALL render exactly `columns.length` Skeleton_Cells.
4. THE SkeletonRowComponent SHALL accept an input property named `rowHeight` (default `h-8`) that sets the height of each Skeleton_Cell using a Tailwind CSS height class.
5. WHEN the Skeleton_Module is imported into a page module, THE Skeleton_Module SHALL make both `SkeletonRowComponent` and `SkeletonCardComponent` available for use in that page module's templates.
6. THE SkeletonRowComponent SHALL apply the `animate-pulse` class from Tailwind CSS to every Skeleton_Cell it renders.
7. THE SkeletonCardComponent SHALL apply the `animate-pulse` class from Tailwind CSS to the card placeholder element.
8. THE SkeletonCardComponent SHALL accept an input property named `height` (default `h-20`) that sets the card height using a Tailwind CSS height class.
9. THE Skeleton_Module SHALL be placed in the `projects/asset-management/src/app/shared/` directory.
10. WHEN the `columns` input property is an empty array, THE SkeletonRowComponent SHALL render a single full-width Skeleton_Cell as a fallback.

---

### Requirement 2: View Assets Page — Table Skeleton Loader

**User Story:** As a user, I want to see placeholder table rows while asset data is loading on the View Assets page, so that I can understand the table structure before data arrives.

#### Acceptance Criteria

1. WHILE `isLoading` is `true` on the View_Assets_Page, THE View_Assets_Page SHALL render exactly 8 Skeleton_Rows in place of the asset data rows.
2. WHILE `isLoading` is `true` on the View_Assets_Page, THE View_Assets_Page SHALL render exactly 4 Skeleton_Cards in place of the summary stat cards (Total Assets, Ready to Deploy, Deployed, Under Maintenance).
3. WHILE `isLoading` is `true` on the View_Assets_Page, THE View_Assets_Page SHALL render the table header row (column labels) present in the DOM above the Skeleton_Rows.
4. WHILE `isLoading` is `true` on the View_Assets_Page, THE View_Assets_Page SHALL render the toolbar (search and filter inputs) present in the DOM above the skeleton.
5. WHEN `isLoading` transitions from `true` to `false` on the View_Assets_Page, THE View_Assets_Page SHALL remove all Skeleton_Rows and Skeleton_Cards from the DOM and render the real asset data.
6. WHILE `isLoading` is `true` on the View_Assets_Page, THE View_Assets_Page SHALL NOT render any Spinner element.
7. WHILE `isLoading` is `true` on the View_Assets_Page, THE View_Assets_Page SHALL NOT render any Loading_Text.
8. THE Skeleton_Rows on the View_Assets_Page SHALL use 8 Skeleton_Cells whose proportional widths represent the 8 real table columns: Asset ID, Asset Name, Department, Category, Status, Assigned To, Purchase Date, and Condition.

---

### Requirement 3: Issue Log Page — Table Skeleton Loader

**User Story:** As a user, I want to see placeholder table rows while issue log data is loading, so that I understand the layout before records appear.

#### Acceptance Criteria

1. WHILE `isLoading` is `true` on the Issue_Log_Page, THE Issue_Log_Page SHALL render exactly 8 Skeleton_Rows in the DOM in place of the issue log data rows.
2. WHILE `isLoading` is `true` on the Issue_Log_Page, THE Issue_Log_Page SHALL render the table header row (Asset Name, Category, Issued To, Type, Issue Date) present in the DOM above the Skeleton_Rows.
3. WHILE `isLoading` is `true` on the Issue_Log_Page, THE Issue_Log_Page SHALL render the filter toolbar (search inputs and date filter) present in the DOM above the skeleton rows.
4. WHEN `isLoading` transitions to `false` on the Issue_Log_Page, THE Issue_Log_Page SHALL remove all Skeleton_Rows from the DOM and render the real issue log records.
5. WHILE `isLoading` is `true` on the Issue_Log_Page, THE Issue_Log_Page SHALL NOT render any Spinner element.
6. WHILE `isLoading` is `true` on the Issue_Log_Page, THE Issue_Log_Page SHALL NOT render any Loading_Text.
7. THE Skeleton_Rows on the Issue_Log_Page SHALL use exactly 5 Skeleton_Cells whose proportional widths are aligned to the 5 real columns: Asset Name, Category, Issued To, Type, and Issue Date.

---

### Requirement 4: Return Log Page — Table Skeleton Loader

**User Story:** As a user, I want to see placeholder table rows while return log data is loading, so that the page does not appear blank.

#### Acceptance Criteria

1. IF `isLoading` is `true` on the Return_Log_Page, THEN THE Return_Log_Page SHALL render exactly 8 Skeleton_Rows in the DOM in place of the return log data rows.
2. IF `isLoading` is `true` on the Return_Log_Page, THEN THE Return_Log_Page SHALL render the table header row (Name, Classification, Total, Return Type, Return To, Return Date) in the DOM above the Skeleton_Rows.
3. IF `isLoading` is `true` on the Return_Log_Page, THEN THE Return_Log_Page SHALL render the filter toolbar in the DOM above the skeleton rows.
4. WHEN `isLoading` transitions to `false` on the Return_Log_Page, THE Return_Log_Page SHALL remove all Skeleton_Rows from the DOM and render the real return log records.
5. WHILE `isLoading` is `true` on the Return_Log_Page, THE Return_Log_Page SHALL NOT render any Spinner element.
6. WHILE `isLoading` is `true` on the Return_Log_Page, THE Return_Log_Page SHALL NOT render any Loading_Text.
7. THE Skeleton_Rows on the Return_Log_Page SHALL use exactly 6 Skeleton_Cells matching the 6 real columns: Name, Classification, Total, Return Type, Return To, and Return Date.
8. WHEN `isLoading` transitions to `false` and the return log response contains zero records, THE Return_Log_Page SHALL not render Skeleton_Rows and SHALL render the real table structure with an empty state message in the DOM.

---

### Requirement 5: Asset Dashboard Page — Card and Table Skeleton Loaders

**User Story:** As a user, I want to see animated placeholder cards and table rows on the dashboard while data is loading, so that the page feels structured and responsive from the first moment.

#### Acceptance Criteria

1. IF `isLoading` is `true` on the Asset_Dashboard_Page, THEN THE Asset_Dashboard_Page SHALL render exactly 6 Skeleton_Cards arranged in a 6-column grid in the DOM in place of the real category cards.
2. IF `isLoading` is `true` on the Asset_Dashboard_Page, THEN THE Asset_Dashboard_Page SHALL render exactly 3 Skeleton_Rows inside the Issue History panel in the DOM in place of real issue history rows.
3. WHEN `isLoading` transitions to `false` on the Asset_Dashboard_Page, THE Asset_Dashboard_Page SHALL remove all Skeleton_Cards and Skeleton_Rows from the DOM and render the real category cards and issue history rows.
4. WHILE `isLoading` is `true` on the Asset_Dashboard_Page, THE Asset_Dashboard_Page SHALL NOT render any element with the CSS class `animate-spin`.
5. WHILE `isLoading` is `true` on the Asset_Dashboard_Page, THE Asset_Dashboard_Page SHALL NOT render any Loading_Text string.
6. THE Skeleton_Cards on the Asset_Dashboard_Page SHALL use `h-20` as the card height to visually match the real category cards.
7. THE Skeleton_Rows inside the Issue History panel SHALL use exactly 4 Skeleton_Cells matching the 4 real columns: Receiver Name, Department, Issue Date, and Asset Dept.
8. THE Skeleton_Cards on the Asset_Dashboard_Page SHALL apply the `animate-pulse` Shimmer_Animation, consistent with the `SkeletonCardComponent` from Requirement 1.
9. THE Skeleton_Rows inside the Issue History panel SHALL apply the `animate-pulse` Shimmer_Animation, consistent with the `SkeletonRowComponent` from Requirement 1.

---

### Requirement 6: Reports Page — Table Skeleton Loader

**User Story:** As a user, I want to see placeholder table rows while report data is loading on the Reports page, so that the table structure is visible before content appears.

#### Acceptance Criteria

1. WHEN the Reports_Page component initiates a data fetch (ngOnInit or equivalent lifecycle hook fires), THE Reports_Page SHALL render exactly 8 Skeleton_Rows in the DOM in place of the report data rows, and each Skeleton_Row SHALL be non-interactive (no click, hover, or focus events).
2. WHEN the API response for report data is received successfully by the Reports_Page, THE Reports_Page SHALL remove all Skeleton_Rows from the DOM and render the real report records.
3. WHILE Skeleton_Rows are rendered on the Reports_Page, THE Reports_Page SHALL NOT render any element with the CSS class `animate-spin`.
4. WHILE Skeleton_Rows are rendered on the Reports_Page, THE Reports_Page SHALL NOT render any Loading_Text string.
5. THE Skeleton_Rows on the Reports_Page SHALL use exactly 10 Skeleton_Cells matching the 10 real columns: checkbox, Name, Type, Total, Ready, Deployed, Dead Stock, Service, EOL, and actions.
6. WHEN the Reports_Page component initiates a data fetch, THE Reports_Page SHALL render the table header row (column labels) present in the DOM above the Skeleton_Rows.
7. WHEN the Reports_Page component initiates a data fetch, THE Reports_Page SHALL render the search and export toolbar present in the DOM above the Skeleton_Rows.
8. WHEN the API response for report data returns an error, THE Reports_Page SHALL remove all Skeleton_Rows from the DOM and render the existing error state UI.

---

### Requirement 7: Global Prohibition of Spinners and Loading Text

**User Story:** As a user, I want no spinning icons or text-based loading messages visible anywhere in the application, so that the loading experience is consistent and visually clean.

#### Acceptance Criteria

1. WHILE the View_Assets_Page is in Loading_State, THE View_Assets_Page SHALL NOT render any element with the CSS class `animate-spin` in the DOM.
2. WHILE the Issue_Log_Page is in Loading_State, THE Issue_Log_Page SHALL NOT render any element with the CSS class `animate-spin` in the DOM.
3. WHILE the Return_Log_Page is in Loading_State, THE Return_Log_Page SHALL NOT render any element with the CSS class `animate-spin` in the DOM.
4. WHILE the Asset_Dashboard_Page is in Loading_State, THE Asset_Dashboard_Page SHALL NOT render any element with the CSS class `animate-spin` in the DOM. (Note: the `animate-pulse` class used on Skeleton_Cards is permitted.)
5. WHILE the Reports_Page is in Loading_State, THE Reports_Page SHALL NOT render any element with the CSS class `animate-spin` in the DOM.
6. THE Issue_Log_Page template SHALL NOT contain the SVG spinner element or the text string "Loading issue log..." in its rendered DOM output at any time.
7. THE Return_Log_Page template SHALL NOT contain the text string "Loading return log..." in its rendered DOM output at any time.
8. IF an API error occurs on any page, THEN THE page SHALL render the existing error message UI (red banner) and SHALL NOT render any Spinner or Loading_Text.

---

### Requirement 8: Skeleton Structural Fidelity

**User Story:** As a user, I want the skeleton rows to visually match the column structure of each page's real table, so that the transition from skeleton to data feels smooth and does not cause layout shifts.

#### Acceptance Criteria

1. WHILE the View_Assets_Page is in Loading_State, THE View_Assets_Page SHALL render exactly 8 Skeleton_Rows using the same CSS grid layout class (`table-cols`) as the real asset data rows, and the real asset data rows SHALL NOT be present in the DOM.
2. WHILE the Issue_Log_Page is in Loading_State, THE Issue_Log_Page SHALL render exactly 8 Skeleton_Rows using the same CSS grid class (`grid-cols-5`) as the real issue log rows, and the real issue log rows SHALL NOT be present in the DOM.
3. WHILE the Return_Log_Page is in Loading_State, THE Return_Log_Page SHALL render exactly 8 Skeleton_Rows using the same CSS grid class (`grid-cols-6`) as the real return log rows, and the real return log rows SHALL NOT be present in the DOM.
4. WHILE the Asset_Dashboard_Page is in Loading_State, THE Skeleton_Rows inside the Issue History panel SHALL use the same CSS grid class (`issue-cols`) as the real issue history rows, and the real issue history rows SHALL NOT be present in the DOM.
5. WHILE the Reports_Page is in Loading_State, THE Reports_Page SHALL render exactly 8 Skeleton_Rows using the same CSS grid class (`report-cols`) as the real report rows, and the real report rows SHALL NOT be present in the DOM.
6. WHEN `isLoading` transitions from `true` to `false` on any page, THE page SHALL replace skeleton content with real content without changing the outer container width or height by more than 0 pixels, so that no visible layout shift occurs.
7. WHEN `isLoading` transitions from `true` to `false` on the Issue_Log_Page, Return_Log_Page, Asset_Dashboard_Page, or Reports_Page, THE page SHALL replace skeleton content with real content without changing the outer container dimensions, so that no visible layout shift occurs.
