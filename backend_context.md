# Asset Management System - Backend Integration & Context Guide

This document provides a comprehensive overview of the backend architecture, MongoDB database collections, and REST API endpoints. It is designed to help you prompt or implement frontend developments accurately.

---

## 1. System Overview
The backend is a **Java / Vert.x** microservice that serves as the Asset Management API. It uses **MongoDB** as its primary data store and exposes REST endpoints under the base prefix `/api/asset-management`.

---

## 2. Database Collections Schema

Here are the key MongoDB collections and their schemas relevant to asset tracking (issuing and returning).

### `assets`
Contains the core records of physical or digital inventory assets.
- `_id`: `ObjectId`
- `assetName`: `String` (e.g., `"MacBook Pro"`)
- `assetTagId`: `ObjectId` (references `assettags`)
- `statusId`: `ObjectId` (references `status`)
- `locationId`: `ObjectId` (references `locations`, the default/current home location)
- `assetSerialNumber`: `String`
- `purchaseCost`: `Int`
- `purchaseDate`: `Date`
- `isIssuable`: `Boolean`
- `quantity`: `Int`
- `campusId`: `ObjectId`
- `blockId`: `String`

### `issueto`
Tracks current and historical asset issue assignments. An asset can be issued to one of three receiver types: **Location**, **Person**, or **Asset**.
- `_id`: `ObjectId` (referred to as `issuetoId` or `issueId`)
- `assetId`: `ObjectId` (references `assets`)
- `issueDate`: `Date`
- `locationId`: `ObjectId` (references `locations`, present if issued to a location)
- `personId`: `ObjectId` (references a user/person, present if issued to a person)
- `issuedToAssetId`: `ObjectId` (references another `assets` doc, present if issued to another asset)

### `returnto`
Tracks returned assets referencing their corresponding issue record (`issuetoId`).
- `_id`: `ObjectId`
- `assetId`: `ObjectId` (references `assets`)
- `returnDate`: `Date`
- `issuetoId`: `ObjectId` (references the original `issueto` record)
- `locationId`: `ObjectId` (references `locations`, optional return location)
- `personId`: `ObjectId` (optional return receiver)
- `returnedToAssetId`: `ObjectId` (optional return target asset)
- `notes`: `String` (optional remarks)

---

## 3. API Endpoints

All API endpoints return responses in the format:
```json
{
  "responseType": "SUCCESS" | "ERROR",
  "statusCode": 200 | 400 | 500,
  "responseData": { ... }
}
```

### A. Get Issued Assets list
- **Path**: `GET /api/asset-management/issued-assets`
- **Query Parameters**:
  - `page`: `Integer` (default: 1)
  - `pageSize`: `Integer` (default: 10)
  - `assetName`: `String` (filter)
  - `category`: `String` (filter)
  - `issuedTo`: `String` (filter)
  - `type`: `String` (filter: "Location", "Person", "Asset")
  - `issueDate`: `String` (filter: "YYYY-MM-DD")
- **Response Shape** (`responseData.data`):
  ```json
  {
    "assets": [
      {
        "_id": "6a168f4c083766160e44152f",
        "assetId": "6a1035ba99696f0a7c441532",
        "assetName": "MacBook Pro",
        "assetCategory": "Laptops",
        "issueDate": "2026-05-27T00:00:00Z",
        "receiverName": "Staff Room 1",
        "receiverType": "Location",
        "locationId": "6a0fe1928c08584d89441544",
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

### B. Issue an Asset
- **Path**: `POST /api/asset-management/issue-asset`
- **Request Payload**:
  ```json
  {
    "assetId": "6a1035ba99696f0a7c441532",
    "issueDate": "2026-05-27",
    "locationId": "6a0fe1928c08584d89441544", // Null if not Location
    "personId": null,                         // Null if not Person
    "issuedToAssetId": null                    // Null if not Asset
  }
  ```

### C. Return an Asset (NEW)
- **Path**: `POST /api/asset-management/return-asset`
- **Request Payload**:
  ```json
  {
    "assetId": "6a1035ba99696f0a7c441532",      // Required
    "issuetoId": "6a168f4c083766160e44152f",    // Required (Original Issue record ID)
    "returnDate": "2026-05-27",                 // Required (YYYY-MM-DD)
    "locationId": "6a0fe1928c08584d89441544",   // Optional/Nullable
    "personId": null,                           // Optional/Nullable
    "returnedToAssetId": null,                  // Optional/Nullable
    "notes": "Returned in good condition"       // Optional
  }
  ```

### D. Get Return Logs
- **Path**: `GET /api/asset-management/return-logs`
- **Query Parameters**:
  - `page`: `Integer`
  - `pageSize`: `Integer`
  - `name`: `String` (Asset name filter)
  - `classification`: `String` (Category filter)
  - `returnType`: `String` ("Location", "Person", "Asset")
  - `returnTo`: `String` (Receiver name filter)
  - `returnDate`: `String` ("YYYY-MM-DD" filter)
- **Response Shape** (`responseData.data`):
  ```json
  {
    "data": [
      {
        "name": "MacBook Pro",
        "classification": "Laptops",
        "total": 1,
        "returnType": "Location",
        "returnTo": "Staff Room 1",
        "returnDate": "2026-05-27T06:38:33.348Z"
      }
    ],
    "totalRecords": 1,
    "currentPage": 1,
    "pageSize": 10,
    "totalPages": 1
  }
  ```

---

## 4. Frontend Implementation Guidelines

When writing code or prompting an AI to update the **Return Asset** frontend page, keep these guidelines in mind:

1. **Dropdown Population**:
   - Call `GET /api/asset-management/issued-assets` to fetch active issues.
   - The user selects the `Issue ID` (matching `_id` in the issue record).
   - Display key info dynamically upon selection (e.g. `Asset Name`, `Receiver Type` / `Return Type`).

2. **State Management**:
   - Store the selected `assetId`, `locationId`, `personId`, and `issuedToAssetId` from the selected issue object.
   - When the user clicks "Return Asset", construct the payload using these retrieved IDs.

3. **Routing / Navigation**:
   - On successful asset return, alert the user and navigate them back to the Return Log page (`/kjusys/return-log` or `/assets/return-log`).
