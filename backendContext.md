# Asset Management System — Backend Integration & Context Guide

This document is the authoritative reference for the backend architecture, MongoDB schema, REST API endpoints, actual response envelopes, and where each API is consumed by the frontend.

---

## 1. System Overview

- **Stack**: Java / Vert.x microservice
- **Database**: MongoDB
- **Base prefix**: `/kjusys-api/asset-management-api`
- **Default port**: `8080`
- **Local base URL**: `http://localhost:8080/kjusys-api/asset-management-api`

---

## 2. Response Envelope

All responses follow this shape — **note the extra `.data` nesting** inside `responseData`:

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

The frontend always unwraps via `response?.responseData?.data` first, then reads the inner key (e.g. `.assets`, `.categories`, `.locations`, `.statuses`).

Error responses:
```json
{
  "statusCode": 400,
  "type": "ERROR",
  "responseData": {
    "error": "Error message"
  }
}
```

---

## 3. Database Collections

### `assets`
- `_id`: ObjectId
- `assetName`: String
- `assetTagId`: ObjectId → `assettags`
- `statusId`: ObjectId → `status`
- `locationId`: ObjectId → `locations`
- `assetSerialNumber`: String
- `purchaseCost`: Int
- `purchaseDate`: Date
- `isIssuable`: Boolean
- `quantity`: Int
- `campusId`: ObjectId → `campuses`
- `blockId`: String

### `issueto`
Tracks active issues and returns in the same collection.
- `_id`: ObjectId
- `assetId`: ObjectId → `assets`
- `issueDate`: Date
- `locationId`: ObjectId (if issued to location)
- `personId`: ObjectId (if issued to person)
- `issuedToAssetId`: ObjectId (if issued to another asset)
- `ActiveStatus`: Boolean
- `returnStatus`: Boolean
- `returnDate`: Date
- `notes`: String

### `assettags`
- `_id`: ObjectId
- `assetTagName`: String
- `categoryId`: ObjectId → `categories`
- `classificationId`: ObjectId → `classifications`

### `categories`
- `_id`: ObjectId
- `categoryName`: String (e.g. `"IT"`, `"Electrical"`, `"Sound"`, `"Stationery"`, `"Housekeeping"`, `"Furniture"`)

### `locations`
- `_id`: ObjectId
- `locationName`: String

### `status`
- `_id`: ObjectId
- `statusName`: String (`"Ready to Deploy"` | `"Deployed"` | `"Under Maintenance"` | `"Damaged"` | `"Dead Stock"`)

### `licenses`
- `_id`: ObjectId
- `assetId`: ObjectId → `assets`
- `licenseName`: String
- `licenseKey`: String
- `expiryDate`: Date

### `warranty`
- `_id`: ObjectId
- `assetId`: ObjectId → `assets`
- `provider`: String
- `displayId`: String
- `startDate`: Date
- `endDate`: Date
- `ActiveStatus`: Boolean

---

## 4. REST API Endpoints

### A. Assets

#### GET `/assets`
Paginated, filterable asset list (sorted by most recently added by default).

Query params: `page`, `pageSize`, `assetName`, `assetTagName`, `categoryId`, `locationId`, `statusId`, `purchaseDateFrom` (YYYY-MM-DD), `purchaseDateTo`, `sort`

Response inner key: `assets[]`
```json
{
  "assets": [
    {
      "_id": "6a1035ba99696f0a7c441534",
      "assetName": "Wireless Mic",
      "assetSerialNumber": "MIC-SN-001",
      "assetTagName": "Wireless Microphone",
      "category": "Sound",
      "status": "Dead Stock",
      "location": "Technician Room",
      "block": "Admin",
      "purchaseCost": 8000,
      "purchaseDate": "2026-05-18T18:30:00Z",
      "isIssuable": true,
      "quantity": 1,
      "issuedTo": "Not Issued"
    }
  ],
  "totalRecords": 48,
  "currentPage": 1,
  "pageSize": 8,
  "totalPages": 6
}
```
**Used by**: `ViewAssetsComponent` (main list + filter/search/pagination), `IssueAssetComponent` (asset receiver dropdown when issueTo=Asset, pageSize=200), `ReportsComponent` (All tab, pageSize=8)

---

#### GET `/assets-search`
Query params: `q` (searches `assetName` case-insensitively)

Response: `{ data: [{ _id, assetName, assetTagName, isIssuable }] }`

**Used by**: Defined in service as `searchAssets()` — not currently called by any component.

---

#### GET `/asset-details`
Query params: `id` (asset `_id`)

Response inner key: direct object at `responseData.data`
```json
{
  "_id": "...",
  "assetName": "...",
  "assetSerialNumber": "...",
  "purchaseCost": 1200,
  "purchaseDate": "...",
  "isIssuable": true,
  "assetTagId": "...",
  "categoryId": "...",
  "statusId": "...",
  "locationId": "..."
}
```
**Used by**: `EditAssetComponent` (on init, to pre-fill the edit form), `ViewAssetsComponent` (on row click, to enrich selectedAsset with IDs for inline status update)

---

#### POST `/create-asset`
Payload:
```json
{
  "assetName": "string",
  "assetTagId": "ObjectId",
  "statusId": "ObjectId",
  "defaultLocation": "ObjectId",
  "serial": "string",
  "purchaseCost": "string|int",
  "purchaseDate": "YYYY-MM-DD",
  "isReturnable": true
}
```
Response: `{ message: "Asset created successfully", _id: "ObjectId" }`

**Used by**: `CreateAssetComponent` (on Submit)

---

#### PUT `/edit-asset`
Same payload shape as `/create-asset` plus `_id`.

**Used by**: `EditAssetComponent` (on Save), `ViewAssetsComponent` (inline status change via `selectStatus()`)

---

#### GET `/unissued-asset-names`
Query params: `q` (optional, case-insensitive asset name filter)

Response: `{ assetNames: [ { "_id": "ObjectId", "assetName": "MacBook Pro", "assetSerialNumber": "SN12345678" } ] }`

**Used by**: Defined in service — not currently called by any component.

---

#### GET `/get-licenses/:assetId`
Path param: `assetId`

Response inner key: `responseData.data`
```json
{
  "licenses": [{ "licenseName": "...", "licenseKey": "...", "expiryDate": "..." }],
  "warranty": [{ "provider": "...", "displayId": "...", "startDate": "...", "endDate": "...", "status": "Active" }]
}
```
**Used by**: `EditWarrantyLicensesComponent` (on init, to pre-fill the form), `ViewAssetsComponent` (on row click, for Licenses tab)

---

#### GET `/asset-history/:assetId`
Path param: `assetId`

Response inner key: `responseData.data`
```json
{
  "dispatches": [],
  "issues": [
    {
      "issueDate": "2026-05-27T00:00:00Z",
      "location": "Staff Room 1",
      "personId": "12345",
      "issuedToAsset": "N/A"
    }
  ],
  "returns": [
    {
      "returnDate": "2026-05-28T00:00:00Z",
      "location": "Staff Room 1",
      "personId": "12345",
      "returnedToAsset": "N/A"
    }
  ]
}
```
**Used by**: `ViewAssetsComponent` (on row click, for History tab)

---

#### PUT `/edit-licenses-warranty`
Payload:
```json
{
  "assetId": "ObjectId",
  "license": { "licenseName": "...", "licenseKey": "...", "expiryDate": "..." },
  "warranty": { "provider": "...", "displayId": "...", "startDate": "...", "endDate": "...", "status": "Active" }
}
```
**Used by**: `EditWarrantyLicensesComponent` (on Save)

---

#### GET `/get-asset-components/:assetId`
Path param: `assetId`

Response: `{ components: [{ assetId, assetName }] }`

**Used by**: `ViewAssetsComponent` (on row click, for Components tab)

---

#### GET `/asset-history/:assetId`
Path param: `assetId`

Response: `{ dispatches: [], issues: [], returns: [] }`

**Used by**: `ViewAssetsComponent` (on row click, for History tab)

#### GET `/export-reports`
Export reports data as a CSV download.

Query params: `categoryId` (optional), `assetName` (optional), `assetIds` (optional, comma-separated IDs)

Response content type: `text/csv`
Response header: `content-disposition: attachment; filename="report.csv"`

**Used by**: `ReportsComponent` (for Export and Bulk Export actions)

---


### B. Asset Grouping

#### GET `/grp`
Returns assets filtered by category. Same per-asset shape as `/assets`.

Query params: `categoryId` (required for category tabs), `page`, `pageSize`

Response inner key: `assets[]` — same structure as `/assets` response
```json
{
  "assets": [
    {
      "_id": "...",
      "assetName": "Ceiling Fan",
      "assetTagName": "Ceiling Fan",
      "category": "Electrical",
      "status": "Deployed",
      "location": "Parking Lot",
      "purchaseCost": 5000,
      "quantity": 1
    }
  ],
  "categoryId": "6a0ffe51d70e831c1c44154f",
  "totalRecords": 6,
  "currentPage": 1,
  "pageSize": 8,
  "totalPages": 1
}
```
**Used by**: `ReportsComponent` (category tab selected → `loadGrpData()`)

---

#### GET `/reports-grouped`
Returns paginated asset tags grouped by model/name, showing their active status count breakdowns (Total, Ready, Deployed, Dead Stock, Service, EOL).

Query params: `page`, `pageSize`, `categoryId` (optional, to filter asset tags by category)

Response:
```json
{
  "reports": [
    {
      "displayId": "LPT",
      "name": "MacBook Pro",
      "categoryName": "IT",
      "total": 12,
      "ready": 8,
      "deployed": 4,
      "deadStock": 0,
      "service": 0,
      "eol": 0
    }
  ],
  "categoryId": "6a0ffe51d70e831c1c44154e",
  "totalRecords": 1,
  "currentPage": 1,
  "pageSize": 8,
  "totalPages": 1
}
```
**Used by**: `ReportsComponent` (on tab changes and page clicks)

---

### C. Issue & Return

#### GET `/issued-assets`
Query params: `page`, `pageSize`, `assetName`, `category`, `issuedTo`, `type` (`"Location"` | `"Person"` | `"Asset"`), `issueDate` (YYYY-MM-DD)

Response inner key: `assets[]`
```json
{
  "assets": [
    {
      "_id": "ObjectId (issueId)",
      "assetId": "ObjectId",
      "assetName": "MacBook Pro",
      "assetSerialNumber": "SN12345678",
      "assetCategory": "IT",
      "issueDate": "2026-05-27T00:00:00Z",
      "receiverName": "Staff Room 1",
      "receiverType": "Location",
      "locationId": "ObjectId",
      "personId": null,
      "issuedToAssetId": null
    }
  ],
  "totalRecords": 1,
  "currentPage": 1,
  "pageSize": 10,
  "totalPages": 1
}
```
**Used by**:
- `DashboardComponent` — `{ page: 1, pageSize: 3 }` for recent issue history table
- `IssueAssetComponent` — `{ page, pageSize: 3 }` for the issue log table below the form; also `{ page: 1, pageSize: 100 }` pre-loaded for asset receiver dropdown
- `IssueLogComponent` — `{ page, pageSize: 8, ...filters }` for the full issue log with filters
- `ReturnAssetComponent` — `{ page: 1, pageSize: 100 }` to populate the active issues dropdown

---

#### POST `/issue-asset`
Payload (one of `locationId`, `personId`, `issuedToAssetId` required):
```json
{
  "assetId": "ObjectId",
  "issueDate": "YYYY-MM-DD",
  "locationId": "ObjectId | null",
  "personId": "ObjectId | null",
  "issuedToAssetId": "ObjectId | null"
}
```
**Used by**: `IssueAssetComponent` (on Issue button click)

---

#### POST `/return-asset`
Payload:
```json
{
  "assetId": "ObjectId",
  "issuetoId": "ObjectId",
  "returnDate": "YYYY-MM-DD",
  "notes": "optional string"
}
```
**Used by**: `ReturnAssetComponent` (on Return button click)

---

#### GET `/return-logs`
Query params: `page`, `pageSize`, `name`, `classification`, `total`, `returnType`, `returnTo`, `returnDate`

Response inner key: `data[]`
```json
{
  "data": [
    {
      "name": "MacBook Pro",
      "classification": "IT",
      "total": 1,
      "returnType": "Location",
      "returnTo": "Staff Room 1",
      "returnDate": "2026-05-27T06:38:33Z",
      "notes": "Returned in perfect condition"
    }
  ],
  "totalRecords": 1,
  "currentPage": 1,
  "pageSize": 10,
  "totalPages": 1
}
```
**Used by**: `ReturnLogComponent` (on init and all filter/page changes)

---

### D. Dashboard & Analytics

#### GET `/status`
Returns per-status asset counts for the donut chart.

Response inner key: `assets[]`
```json
{
  "assets": [
    { "statusId": "...", "statusName": "Ready to Deploy", "assetCount": 8 },
    { "statusId": "...", "statusName": "Deployed", "assetCount": 5 }
  ]
}
```
**Used by**:
- `DashboardComponent` — drives `readyToDeploy` + `deployed` counts for the donut SVG
- `ViewAssetsComponent` — drives the 4 stat cards (total, available, deployed, maintenance) at the top of the list

---

#### GET `/categories`
Returns per-category asset counts for the dashboard category cards.

Query params: `page`, `size`

Response inner key: `assets[]`
```json
{
  "assets": [
    { "categoryId": "...", "categoryName": "IT", "assetCount": 15 }
  ]
}
```
**Used by**:
- `DashboardComponent` — `getCategoryCount()` to render the category count cards and populate `departments[]`

Note: also called by `ViewAssetsComponent`, `CreateAssetComponent`, `CreateAssetTagComponent`, `EditAssetComponent` via `getCategories()` — same endpoint, used for dropdown population in those cases.

---

#### GET `/asset-status-summary`
Query params: `page`, `pageSize`

Response: per-asset-tag status breakdown (ready, deployed, underMaintenance, damaged, deadStock).

**Used by**: Defined in service as `getAssetStatusSummary()` — not currently called by any component.

---

### E. Metadata / Lookup Dropdowns

#### GET `/categories-list`
Flat list of categories for dropdowns and filter tabs.

Response inner key: `categories[]`
```json
{
  "categories": [
    { "categoryId": "6a0ffe51d70e831c1c44154e", "categoryName": "IT" },
    { "categoryId": "6a0ffe51d70e831c1c44154f", "categoryName": "Electrical" }
  ]
}
```
**Used by**: `ReportsComponent` — on init to build the category filter tab bar

---

#### GET `/locations-list`
Response inner key: `locations[]`
```json
{
  "locations": [
    { "locationId": "...", "locationName": "Staff Room 1" }
  ]
}
```
**Used by**: `CreateAssetComponent`, `EditAssetComponent`, `IssueAssetComponent`, `ViewAssetsComponent` — all for location dropdown population

---

#### GET `/statuses-list`
Response inner key: `statuses[]`
```json
{
  "statuses": [
    { "statusId": "...", "statusName": "Ready to Deploy" }
  ]
}
```
**Used by**: `CreateAssetComponent`, `EditAssetComponent`, `ViewAssetsComponent` — for status dropdown population

---

#### GET `/asset-tags-list`
Response inner key: `assetTags[]` (or similar — check service)
```json
{
  "data": [
    { "id": "...", "assetTagName": "MacBook Pro 16", "categoryId": "..." }
  ]
}
```
**Used by**: `CreateAssetComponent`, `EditAssetComponent` — for the searchable model/asset-tag dropdown

---

#### POST `/create-asset-tag`
Payload:
```json
{
  "assetTagName": "MacBook Pro 16",
  "category": "ObjectId"
}
```
**Used by**: `CreateAssetTagComponent` (on Submit)

---

## 5. API → Component Quick Reference

| Endpoint | Method | Components |
|---|---|---|
| `/assets` | GET | ViewAssetsComponent, IssueAssetComponent, ReportsComponent |
| `/asset-details` | GET | EditAssetComponent, ViewAssetsComponent |
| `/create-asset` | POST | CreateAssetComponent |
| `/edit-asset` | PUT | EditAssetComponent, ViewAssetsComponent |
| `/get-licenses/:id` | GET | EditWarrantyLicensesComponent, ViewAssetsComponent |
| `/edit-licenses-warranty` | PUT | EditWarrantyLicensesComponent |
| `/get-asset-components/:id` | GET | ViewAssetsComponent |
| `/asset-history/:id` | GET | ViewAssetsComponent |
| `/grp` | GET | ReportsComponent |
| `/issued-assets` | GET | DashboardComponent, IssueAssetComponent, IssueLogComponent, ReturnAssetComponent |
| `/issue-asset` | POST | IssueAssetComponent |
| `/return-asset` | POST | ReturnAssetComponent |
| `/return-logs` | GET | ReturnLogComponent |
| `/status` | GET | DashboardComponent, ViewAssetsComponent |
| `/categories` | GET | DashboardComponent, ViewAssetsComponent, CreateAssetComponent, CreateAssetTagComponent, EditAssetComponent |
| `/categories-list` | GET | ReportsComponent |
| `/locations-list` | GET | CreateAssetComponent, EditAssetComponent, IssueAssetComponent, ViewAssetsComponent |
| `/statuses-list` | GET | CreateAssetComponent, EditAssetComponent, ViewAssetsComponent |
| `/asset-tags-list` | GET | CreateAssetComponent, EditAssetComponent |
| `/create-asset-tag` | POST | CreateAssetTagComponent |
| `/export-reports` | GET | ReportsComponent |
| `/reports-grouped` | GET | ReportsComponent |

---

## 6. Service Methods with No Active Callers

These are defined in `asset.service.ts` but not called by any component:

| Method | Endpoint |
|---|---|
| `searchAssets()` | GET `/assets-search` |
| `getAssetsLegacy()` | GET `/assets` |
| `getAssetsByCategory()` | GET `/grp` |
| `getAssetStatusSummary()` | GET `/asset-status-summary` |
| `getIssuedDetailByAssetId()` | GET `/issued-asset-details/:id` |
| `getUnissuedAssetNames()` | GET `/unissued-asset-names` |

---

## 7. Development Notes

- **Date format**: `YYYY-MM-DD` for input, ISO 8601 for output
- **ID format**: MongoDB ObjectId (24-char hex)
- **Pagination**: default page=1, pageSize=10, max=100
- **CORS**: enabled for all origins with credentials
- **Content-Type**: `application/json`
