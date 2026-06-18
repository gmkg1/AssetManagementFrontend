# Product Requirements Document (PRD) — Asset Management System

## 1. Document Control
- **Title**: Product Requirements Document (PRD) — Asset Management System
- **Status**: Approved / Implemented
- **Target Audience**: Product Managers, Software Engineers, QA Leads, System Administrators

---

## 2. Product Vision & Goals

### Vision
To provide a unified, intuitive, and high-performance asset management solution that tracks the complete lifecycle of corporate and educational assets. The system supports both high-value serialized equipment (e.g., laptops, projectors) and bulk consumables (e.g., liquids, cables, stationery) under a single interface.

### High-Level Goals
1. **Maximize Stock Utilization**: Minimize unused inventory through real-time available stock tracking.
2. **Lifecycle Auditing**: Maintain a complete, unmodifiable audit log of all dispatches, issues, and returns for every asset.
3. **Flexible Stock Issuance**: Support fractional, quantity-based issuance with multi-unit conversion capability (e.g., Kilolitres to Litres).
4. **Data Portability**: Enable administrators to generate and export filtered Excel/CSV reports for external audits.

---

## 3. User Personas

### Persona A: Stock/Campus Administrator (Primary User)
- **Role**: Manages asset acquisition, registration, model tagging, status updates, and reports.
- **Pain Points**: Hard-to-track consumable stocks, lack of audit history when assets move between departments, slow interfaces when loading thousands of items.
- **Key Needs**: Searchable grids, batch CSV exporting, dynamic stock level updates, quick issue/return actions.

### Persona B: Department Lead / Receiver (Secondary User)
- **Role**: Receives assets on behalf of a block, room, or specific project.
- **Key Needs**: Clear visibility of what has been issued to their department and simple return processes.

---

## 4. Functional Specifications

### Feature Area 1: Asset Registration & Lifecycle
- **Asset Creation**: Register new assets with a unique Serial Number, Model Tag, Status, Default Location, Purchase Cost, and Purchase Date. Enforce mandatory tracking of whether an asset is issuable/returnable.
- **Asset Cloning**: Allow administrators to clone details of an existing asset record with a single click to speed up registration of identical bulk batches.
- **Status Tracking**: Track active lifecycles using defined statuses: `"Ready to Deploy"`, `"Deployed"`, `"Under Maintenance"`, `"Damaged"`, `"Dead Stock"`.

### Feature Area 2: Quantity-Based Asset Issuance
- **Serialized Assets**: For assets with quantity $\le 1$, enforce strict single-issue validation. Enforce that a serialized asset cannot have multiple active outgoing assignments.
- **Bulk & Consumable Assets**: Support partial quantity issuance for assets with quantity $> 1$. Decrease available stock by the issued amount and allow remaining stock to be issued to other targets.
- **Circular Assignment Prevention**: Validate recursive dependency chains. Prevent an asset from being issued to another asset if it forms a closed loop (e.g., Asset A issued to Asset B, which is issued to Asset A).
- **Time/Date Bindings**: Enforce validation that the Expected Return Date cannot precede the Issue Date. Include a custom 24-hour return time picker.

### Feature Area 3: Multi-Unit Scaling & Hierarchy
- **Parent-Child Relationships**: Support hierarchical units of measure (e.g., Kilolitre as parent, Litre and Millilitre as child nodes).
- **Dynamic Conversion**: When issuing, populate the "Unit" dropdown with the parent unit and all child units from the hierarchy. When the user changes the unit, dynamically scale the displayed available stock and input limits using the unit's `conversionFactor`.
- **Base Unit Storage**: Convert all issued and returned quantities to the asset's base unit when executing stock reductions or additions in the database to maintain consistent ledger records.

### Feature Area 4: Returns Management
- **Partial Returns**: Allow users to return fractional amounts of issued assets. Increment the returned quantity log and restore stock in the parent asset document.
- **Status Closure**: Automatically transition the assignment log to `returnStatus: true` and `ActiveStatus: false` only when the cumulative returned quantity matches the issued quantity.

### Feature Area 5: Reporting & CSV Exporting
- **Real-Time Analytics**: Dashboard donut charts showing statuses ("Ready" vs "Deployed") and category count cards.
- **Grouped Model Status Reports**: Table showing paginated tag models grouped by category, displaying breakdowns of status counts (Total, Deployed, Dead Stock, Service, EOL).
- **Backend CSV Streams**: Stream filtered lists of Assets, Issue Logs, and Return Logs as standard CSV attachments directly from the backend to support heavy dataset exports.

---

## 5. Non-Functional Requirements (NFRs)

### Performance & Scalability
- **Pagination**: All list grids must enforce mandatory page sizes to prevent browser rendering bottlenecks.
- **Index Optimization**: Enforce database-level indexing on search fields (`assetName`) and lookup keys (`assetId`, `returnStatus`) to ensure sub-second query execution.

### Usability & Design
- **Compact Layout**: Maximize screen space on admin tables with small, readable typography (`text-xs` to `text-[10px]`).
- **Real-time Feedback**: Block form submissions at the browser level and display explanatory errors if fields are invalid or loading.

### Reliability
- **Type Coercion Safeguards**: The system must seamlessly support both fractional (floating-point) and whole number stocks, ensuring no mathematical round-off errors prevent full returns.
- **Atomic Operations**: Quantity deduction and log inserts must execute sequentially on the database level; if one step fails, the request must abort without corrupting inventory states.
