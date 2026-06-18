# Asset Management System — Backend Integration & Context Guide

This document is the authoritative reference for the backend architecture, MongoDB schema, REST API endpoints, response envelopes, and frontend integration mappings.

---

## 1. System Overview

- **Stack**: Java 17 / Vert.x microservice Web toolkit.
- **Database**: MongoDB.
- **Base prefix**: `/kjusys-api/asset-management-api`
- **Default port**: `8080`
- **Local base URL**: `http://localhost:8080/kjusys-api/asset-management-api`

---

## 2. Response Envelope

### Success Envelope
All successful requests return a JSON object with this shape. **Note the extra `.data` nesting** inside `responseData`:
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
*Note*: The frontend service layers unwrap this via `response?.responseData?.data` (or `response?.responseData`) and bind the target collection.

### Error Envelope
All validation failures, circular loops, or database exceptions return a standard 400/500 code with this shape:
```json
{
  "statusCode": 400,
  "type": "ERROR",
  "responseData": {
    "error": "Insufficient quantity available"
  }
}
```

---

## 3. Database Collections Spec

### A. Collection: `assets`
Contains both serialized physical inventory (quantity = 1) and bulk consumables (quantity > 1).
- `_id`: ObjectId
- `assetName`: String (e.g. `"Wireless Mic"`)
- `assetTagId`: ObjectId → references `assettags`
- `statusId`: ObjectId → references `status`
- `locationId`: ObjectId → references `locations` (default storage location)
- `assetSerialNumber`: String (alphanumeric, unique index)
- `purchaseCost`: NumberInt (represented as whole numbers in cents/dollars)
- `purchaseDate`: ISODate
- `isIssuable`: Boolean (determines eligibility for dispatch)
- `quantity`: NumberInt | Double (the *remaining available* stock level)
- `unitOfMeasureId`: ObjectId → references `units`
- `campusId`: ObjectId → references `campuses`
- `blockId`: String (e.g. `"B002"`)

### B. Collection: `issueto`
Tracks all active outgoings, transactions, and return quantities.
- `_id`: ObjectId
- `assetId`: ObjectId → references `assets`
- `issueDate`: ISODate
- `locationId`: ObjectId → references `locations` (if assigned to a room/block)
- `personId`: ObjectId → references users (if assigned to an employee/student)
- `issuedToAssetId`: ObjectId → references `assets` (if embedded inside another asset)
- `ActiveStatus`: Boolean (`true` if unreturned balance exists)
- `returnStatus`: Boolean (`true` only when `returnedQuantity == issueQuantity`)
- `returnDate`: ISODate (timestamp of the last return transaction)
- `quantity`: Number (available stock of the asset *before* this issue transaction)
- `unitOfMeasurement`: String (the chosen transaction unit acronym, e.g., `"L"`)
- `issueQuantity`: NumberInt | Double (issued quantity in transaction units)
- `issueUnitId`: ObjectId → references `units` (the unit used for this transaction)
- `conversionFactor`: Number (acronym conversion factor vs. asset base unit, e.g., `1000`)
- `returnedQuantity`: NumberInt | Double (cumulative returns in transaction units)
- `notes`: String (optional remarks)

### C. Collection: `units`
Stores hierarchical measurement conversions.
- `_id`: ObjectId
- `unitOfMeasure`: String (e.g. `"Kilolitre"`)
- `acronym`: String (e.g. `"kL"`)
- `hierarchy`: Array of nested child nodes:
  - `childNode`: String (acronym, e.g. `"L"`)
  - `childNodeName`: String (name, e.g. `"Litre"`)
  - `conversionFactor`: NumberInt (scale factor vs base unit, e.g. `1000`)

### D. Collection: `assettags`
- `_id`: ObjectId
- `assetTagName`: String (model identifier, e.g. `"MacBook Pro 16"`)
- `categoryId`: ObjectId → references `categories`

---

## 4. REST API Endpoints Reference

### A. Assets Management

#### GET `/assets`
Paginated, filterable asset list sorted by `_id` descending (most recently added).
- **Query Params**: `page`, `pageSize`, `assetName`, `assetTagName`, `categoryId`, `locationId`, `statusId`, `purchaseDateFrom`, `purchaseDateTo`, `sort`
- **Response Key**: `assets`
- **Frontend Consumed By**: `ViewAssetsComponent`, `IssueAssetComponent`

#### GET `/asset-details`
Retrieve specific asset details for editing or detail drawers.
- **Query Params**: `id` (ObjectId string)
- **Response Key**: Maps directly to `responseData.data` (no list wrapper)
- **Frontend Consumed By**: `EditAssetComponent`, `ViewAssetsComponent`

#### POST `/create-asset`
Register a new asset.
- **Payload**:
  ```json
  {
    "assetName": "Wireless Mic",
    "assetTagId": "6a102c50fdc67fb190441537",
    "statusId": "6a195d74a35d9b53bb44152e",
    "defaultLocation": "6a0fe1928c08584d89441544",
    "serial": "MIC-SN-001",
    "purchaseCost": 8000,
    "purchaseDate": "2026-05-22",
    "isReturnable": true,
    "quantity": 1,
    "unitOfMeasureId": "6a1533d11fcf30c131441533"
  }
  ```
- **Frontend Consumed By**: `CreateAssetComponent`

#### PUT `/edit-asset`
Update existing asset details. Same payload shape as `/create-asset` with the additional `_id` field.
- **Frontend Consumed By**: `EditAssetComponent`, `ViewAssetsComponent` (inline status)

#### GET `/unissued-asset-names`
Retrieve names and serials of assets with available stock for auto-complete.
- **Query Params**: `q` (keypress filter)
- **Response Key**: `assetNames` (returns assets where `quantity > 1` OR if `quantity <= 1` and has no active issues)
- **Frontend Consumed By**: `IssueAssetComponent`

---

### B. Grouping & Reports

#### GET `/grp`
Retrieve assets filtered by a specific category.
- **Query Params**: `categoryId`, `page`, `pageSize`
- **Response Key**: `assets`
- **Frontend Consumed By**: `ReportsComponent`

#### GET `/reports-grouped`
Paginated Tag/Model summary list showing count breakdowns by active status.
- **Query Params**: `page`, `pageSize`, `categoryId` (optional)
- **Response Key**: `reports`
- **Frontend Consumed By**: `ReportsComponent`

#### GET `/export-reports`
Export paginated grouped reports data to a CSV stream download.
- **Query Params**: `categoryId`, `assetName`, `assetIds`
- **Response Content-Type**: `text/csv`
- **Frontend Consumed By**: `ReportsComponent`

---

### C. Issue & Return

#### GET `/issued-assets`
Retrieve filterable logs of issued assets.
- **Query Params**: `page`, `pageSize`, `assetName`, `category`, `issuedTo`, `type`, `issueDate`
- **Response Key**: `assets`
- **Frontend Consumed By**: `DashboardComponent`, `IssueAssetComponent`, `IssueLogComponent`, `ReturnAssetComponent`

#### POST `/issue-asset`
Issue full or partial quantity of stock.
- **Payload**:
  ```json
  {
    "assetId": "6a1035ba99696f0a7c441534",
    "issueDate": "2026-06-18",
    "locationId": "6a0fe1928c08584d89441544",
    "personId": null,
    "issuedToAssetId": null,
    "issueQuantity": 1,
    "unitOfMeasurement": "kL",
    "conversionFactor": 1
  }
  ```
- **Frontend Consumed By**: `IssueAssetComponent`

#### POST `/return-asset`
Process return of full or partial issued balance.
- **Payload**:
  ```json
  {
    "assetId": "6a1035ba99696f0a7c441534",
    "issuetoId": "6a2bac052daf9c00d589ff3b",
    "returnDate": "2026-06-18",
    "returnQuantity": 1,
    "notes": "Good condition"
  }
  ```
- **Frontend Consumed By**: `ReturnAssetComponent`

#### GET `/return-logs`
Retrieve filterable return logs.
- **Query Params**: `page`, `pageSize`, `name`, `classification`, `total`, `returnType`, `returnTo`, `returnDate`
- **Response Key**: `data`
- **Frontend Consumed By**: `ReturnLogComponent`
