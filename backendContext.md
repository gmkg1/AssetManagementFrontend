# Asset Management System - Backend Integration & Context Guide

This document provides a comprehensive overview of the backend architecture, MongoDB database collections, and REST API endpoints for the Asset Management system. It reflects the current implementation in the **Java / Vert.x** codebase and serves as a reference for frontend development.

---

## 1. System Overview

- **Technology Stack**: Java / Vert.x Microservice
- **Database**: MongoDB
- **Base Routing Prefix**: `/kjusys-api/asset-management-api`
- **Default Server Port**: `8080` (Standard local development url: `http://localhost:8080/kjusys-api/asset-management-api`)
- **Additional Technologies**: 
  - Redis (for caching/session management)
  - BodyHandler & CorsHandler (Vert.x web handlers)
  - MongoDB Java Driver

---

## 2. Database Collections Schema

The backend uses the following MongoDB collections to manage assets, category tags, issue assignments, returns, licenses, and warranties.

### `assets`
Contains the core records of inventory assets.
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
- `campusId`: `ObjectId` (references `campuses`)
- `blockId`: `String` (e.g., `"B002"`)
- `unitOfMeasureId`: `ObjectId`

### `issueto`
Tracks current and historical asset issue assignments, as well as returned statuses. **Returns are tracked directly inside this collection by updating the issue record** rather than creating a separate collection.
- `_id`: `ObjectId` (often referenced as `issuetoId` or `issueId`)
- `assetId`: `ObjectId` (references `assets`)
- `issueDate`: `Date`
- `locationId`: `ObjectId` (references `locations`, present if issued to a location)
- `personId`: `ObjectId` (references a user/person, present if issued to a person)
- `issuedToAssetId`: `ObjectId` (references another `assets` doc, present if issued to another asset)
- `ActiveStatus`: `Boolean` (indicates if the asset is currently issued; set to `false` on return)
- `returnStatus`: `Boolean` (set to `true` when the asset is returned)
- `returnDate`: `Date` (timestamp of when the asset was returned)
- `notes`: `String` (optional remarks added during return)
- **Partial Unique Index**: `{assetId: 1}` with `partialFilterExpression: {returnStatus: false}` (ensures only one active issue per asset)

### `assettags`
Contains classification/model names for assets.
- `_id`: `ObjectId`
- `assetTagName`: `String` (e.g., `"MacBook Pro 16"`)
- `categoryId`: `ObjectId` (references `categories`)
- `classificationId`: `ObjectId` (references `classifications`)

### `categories`
Top-level category structure for assets.
- `_id`: `ObjectId`
- `categoryName`: `String` (e.g., `"Laptops"`, `"Furniture"`)

### `locations`
Locations where assets can reside or be issued to.
- `_id`: `ObjectId`
- `locationName`: `String` (e.g., `"Staff Room 1"`)

### `status`
Asset states.
- `_id`: `ObjectId`
- `statusName`: `String` (e.g., `"Ready to Deploy"`, `"Deployed"`, `"Under Maintenance"`, `"Damaged"`, `"Dead Stock"`)

### `licenses`
Contains license keys and contracts associated with assets.
- `_id`: `ObjectId`
- `assetId`: `ObjectId` (references `assets`)
- `licenseName`: `String` (e.g., `"Windows 11 Enterprise"`)
- `licenseKey`: `String`
- `expiryDate`: `Date`

### `warranty`
Tracks warranties associated with assets.
- `_id`: `ObjectId`
- `assetId`: `ObjectId` (references `assets`)
- `provider`: `String` (e.g., `"Dell"`, `"Apple"`)
- `displayId`: `String` (warranty serial/contract ID)
- `startDate`: `Date`
- `endDate`: `Date`
- `ActiveStatus`: `Boolean`

---

## 3. Standard Response Format

All responses from the backend follow a standard envelope pattern:
```json
{
  "responseType": "SUCCESS" | "ERROR",
  "statusCode": 200 | 400 | 500,
  "responseData": {
    "data": ... | "error": ...
  }
}
```

---

## 4. REST API Endpoints

### A. Asset Management (CRUD & Listings)

#### 1. List Assets
- **Path**: `GET /kjusys-api/asset-management-api/assets`
- **Query Parameters**:
  - `page`: `Integer` (default: 1)
  - `pageSize`: `Integer` (default: 10, max: 100)
  - `assetName`: `String` (filter)
  - `assetTagName`: `String` (filter)
  - `categoryId`: `String` (filter)
  - `locationId`: `String` (filter)
  - `statusId`: `String` (filter)
  - `purchaseDateFrom`: `String` (filter: `"YYYY-MM-DD"`)
  - `purchaseDateTo`: `String` (filter: `"YYYY-MM-DD"`)
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "assets": [
        {
          "_id": "ObjectId",
          "assetName": "MacBook Pro",
          "assetSerialNumber": "SN12345678",
          "purchaseCost": 1200,
          "purchaseDate": "2026-05-27T00:00:00Z",
          "isIssuable": true,
          "quantity": 1,
          "assetTagName": "MacBook Pro 16",
          "category": "Laptops",
          "status": "Ready to Deploy",
          "location": "Staff Room 1",
          "blockId": "B002"
        }
      ],
      "totalRecords": 1,
      "currentPage": 1,
      "pageSize": 10,
      "totalPages": 1
    }
  }
  ```

#### 2. Search Assets
- **Path**: `GET /kjusys-api/asset-management-api/assets-search`
- **Query Parameters**:
  - `query`: `String` (searches within `assetName` case-insensitively)
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "data": [
        {
          "_id": "6a1035ba99696f0a7c441532",
          "assetName": "MacBook Pro",
          "assetTagName": "MacBook Pro 16",
          "isIssuable": true
        }
      ]
    }
  }
  ```

#### 3. Get Asset Details
- **Path**: `GET /kjusys-api/asset-management-api/asset-details`
- **Query Parameters**:
  - `id`: `String` (Asset document ID)
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "_id": "ObjectId",
      "assetName": "MacBook Pro",
      "assetSerialNumber": "SN12345678",
      "purchaseCost": 1200,
      "purchaseDate": "2026-05-27T00:00:00Z",
      "isIssuable": true,
      "assetTagId": "ObjectId",
      "categoryId": "ObjectId",
      "quantity": 1,
      "unitOfMeasureId": "ObjectId",
      "campusId": "ObjectId",
      "blockId": "B002",
      "statusId": "ObjectId",
      "locationId": "ObjectId"
    }
  }
  ```

#### 4. Create Asset
- **Path**: `POST /kjusys-api/asset-management-api/create-asset`
- **Request Payload**:
  ```json
  {
    "assetName": "MacBook Pro",
    "assetTagId": "ObjectId",
    "statusId": "ObjectId",
    "defaultLocation": "ObjectId (optional, maps to locationId)",
    "serial": "String (optional, maps to assetSerialNumber)",
    "purchaseCost": "String/Int (optional)",
    "purchaseDate": "String (optional, YYYY-MM-DD)",
    "isReturnable": "Boolean (optional, default: true, maps to isIssuable)"
  }
  ```
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "message": "Asset created successfully",
      "_id": "ObjectId"
    }
  }
  ```

#### 5. Edit Asset
- **Path**: `PUT /kjusys-api/asset-management-api/edit-asset`
- **Request Payload**:
  ```json
  {
    "_id": "ObjectId",
    "assetName": "MacBook Pro",
    "assetTagId": "ObjectId",
    "statusId": "ObjectId",
    "defaultLocation": "ObjectId (optional)",
    "serial": "String (optional)",
    "purchaseCost": "String/Int (optional)",
    "purchaseDate": "String (optional, YYYY-MM-DD)",
    "isReturnable": "Boolean (optional)"
  }
  ```
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "message": "Asset updated successfully"
    }
  }
  ```

#### 6. List Unissued Asset Names
Searches for unique names of assets that do not have any active (unreturned) issues.
- **Path**: `GET /kjusys-api/asset-management-api/unissued-asset-names`
- **Query Parameters**:
  - `q` or `query`: `String` (optional keypress filter to search for asset names case-insensitively)
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "assetNames": [
        "Lenovo ThinkPad",
        "MacBook Pro"
      ]
    }
  }
  ```

#### 7. Get Asset Licenses & Warranty
Retrieves all associated licenses and warranty contracts for a given asset ID.
- **Path**: `GET /kjusys-api/asset-management-api/get-licenses/:assetId`
- **Path or Query Parameters**:
  - `assetId`: `String` (Asset document ID, required in path template or as query parameter)
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "licenses": [
        {
          "licenseName": "Windows 11 Enterprise",
          "licenseKey": "XXXX-XXXX-XXXX-XXXX",
          "expiryDate": "2027-12-31"
        }
      ],
      "warranty": [
        {
          "provider": "Dell",
          "displayId": "WARR-12345",
          "startDate": "2026-06-15",
          "endDate": "2029-06-15",
          "status": "Active"
        }
      ]
    }
  }
  ```

#### 8. Get Asset Components
Retrieves all active sub-components (child assets) assigned/issued to a given parent asset.
- **Path**: `GET /kjusys-api/asset-management-api/get-asset-components/:assetId`
- **Path or Query Parameters**:
  - `assetId`: `String` (Parent asset document ID, required in path template or as query parameter)
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "components": [
        {
          "assetId": "6a1035ba99696f0a7c441532",
          "assetName": "MacBook Pro Charger"
        }
      ]
    }
  }
  ```

---

### B. Asset Tracking (Issue & Return)

#### 1. Get Issued Assets List (Active Assignments)
- **Path**: `GET /kjusys-api/asset-management-api/issued-assets`
- **Query Parameters**:
  - `page`: `Integer` (default: 1)
  - `pageSize`: `Integer` (default: 10, max: 100)
  - `assetName`: `String` (filter)
  - `category`: `String` (filter category name)
  - `issuedTo`: `String` (filter receiver name)
  - `type`: `String` (filter: `"Location"`, `"Person"`, `"Asset"`)
  - `issueDate`: `String` (filter: `"YYYY-MM-DD"`)
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "assets": [
        {
          "_id": "ObjectId (issueId)",
          "assetId": "ObjectId",
          "assetName": "MacBook Pro",
          "assetCategory": "Laptops",
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
  }
  ```

#### 2. Issue an Asset
- **Path**: `POST /kjusys-api/asset-management-api/issue-asset`
- **Request Payload**:
  ```json
  {
    "assetId": "ObjectId",
    "issueDate": "2026-05-27 (optional, defaults to current date)",
    "locationId": "ObjectId (optional)",
    "personId": "ObjectId (optional)",
    "issuedToAssetId": "ObjectId (optional)"
  }
  ```
- **Validation Rules**:
  - At least one of `locationId`, `personId`, or `issuedToAssetId` is required
  - Cannot assign to both a location and an asset simultaneously
  - Self-assignment (assetId == issuedToAssetId) is not allowed
  - Only one active issue per asset (enforced by partial unique index)
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "message": "Asset issued successfully",
      "issueId": "ObjectId",
      "assetId": "ObjectId",
      "issueDate": "2026-05-27T00:00:00Z",
      "locationId": "ObjectId",
      "personId": null,
      "issuedToAssetId": null
    }
  }
  ```

#### 3. Return an Asset
- **Path**: `POST /kjusys-api/asset-management-api/return-asset`
- **Request Payload**:
  ```json
  {
    "assetId": "ObjectId",
    "issuetoId": "ObjectId (Original issue record ID)",
    "returnDate": "2026-05-27 (optional, defaults to current date)",
    "notes": "Returned in perfect condition (optional)"
  }
  ```
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "message": "Asset returned successfully",
      "returnId": "ObjectId",
      "assetId": "ObjectId",
      "issuetoId": "ObjectId",
      "returnDate": "2026-05-27T00:00:00Z",
      "locationId": "ObjectId",
      "personId": null,
      "issuedToAssetId": null
    }
  }
  ```

#### 4. Get Return Logs
- **Path**: `GET /kjusys-api/asset-management-api/return-logs`
- **Query Parameters**:
  - `page`: `Integer` (default: 1)
  - `pageSize`: `Integer` (default: 10)
  - `name`: `String` (Asset name filter)
  - `classification`: `String` (Category filter)
  - `total`: `String` (Quantity filter)
  - `returnType`: `String` (filter: `"Location"`, `"Person"`, `"Asset"`)
  - `returnTo`: `String` (Receiver name filter)
  - `returnDate`: `String` (filter: `"YYYY-MM-DD"`)
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "data": [
        {
          "name": "MacBook Pro",
          "classification": "Laptops",
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
  }
  ```

---

### C. Dashboard & Analytics

#### 1. Get Category Counts
- **Path**: `GET /kjusys-api/asset-management-api/categories`
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "data": [
        {
          "categoryId": "6a0fe1928c08584d8944152d",
          "categoryName": "Laptops",
          "assetCount": 15
        }
      ]
    }
  }
  ```

#### 2. Get Status Counts
- **Path**: `GET /kjusys-api/asset-management-api/status`
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "data": [
        {
          "statusId": "6a0fe1928c08584d89441551",
          "statusName": "Ready to Deploy",
          "assetCount": 8
        }
      ]
    }
  }
  ```

#### 3. Get Asset Status Summary
- **Path**: `GET /kjusys-api/asset-management-api/asset-status-summary`
- **Query Parameters**:
  - `page`: `Integer` (default: 1)
  - `pageSize`: `Integer` (default: 10)
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "data": [
        {
          "assetTagName": "MacBook Pro 16",
          "category": "Laptops",
          "totalAssets": 15,
          "ready": 8,
          "deployed": 5,
          "underMaintenance": 2,
          "damaged": 0,
          "deadStock": 0
        }
      ],
      "totalRecords": 1,
      "currentPage": 1,
      "pageSize": 10,
      "totalPages": 1
    }
  }
  ```

#### 4. Get Asset Grouping
- **Path**: `GET /kjusys-api/asset-management-api/grp`
- **Response Shape**: Returns assets grouped by campus and location structure.
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "data": [ ... ]
    }
  }
  ```

---

### D. Metadata & Lookup Lists (Dropdowns)

#### 1. List Categories
- **Path**: `GET /kjusys-api/asset-management-api/categories-list`
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "data": [
        {
          "categoryId": "6a0fe1928c08584d8944152d",
          "categoryName": "Laptops"
        }
      ]
    }
  }
  ```

#### 2. List Locations
- **Path**: `GET /kjusys-api/asset-management-api/locations-list`
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "data": [
        {
          "locationId": "6a0fe1928c08584d89441544",
          "locationName": "Staff Room 1"
        }
      ]
    }
  }
  ```

#### 3. List Statuses
- **Path**: `GET /kjusys-api/asset-management-api/statuses-list`
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "data": [
        {
          "statusId": "6a0fe1928c08584d89441551",
          "statusName": "Ready to Deploy"
        }
      ]
    }
  }
  ```

#### 4. List Asset Tags (Models)
- **Path**: `GET /kjusys-api/asset-management-api/asset-tags-list`
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "data": [
        {
          "id": "6a1035ba99696f0a7c441532",
          "assetTagName": "MacBook Pro 16",
          "categoryId": "6a0fe1928c08584d8944152d"
        }
      ]
    }
  }
  ```

#### 5. Create Asset Tag
- **Path**: `POST /kjusys-api/asset-management-api/create-asset-tag`
- **Request Payload**:
  ```json
  {
    "assetTagName": "MacBook Pro 16",
    "category": "6a0fe1928c08584d8944152d"
  }
  ```
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "data": {
        "message": "Asset tag created successfully",
        "_id": "6a1035ba99696f0a7c441532"
      }
    }
  }
  ```

---

## 5. Error Handling

All error responses follow the standard format:
```json
{
  "responseType": "ERROR",
  "statusCode": 400 | 500,
  "responseData": {
    "error": "Error message describing the issue"
  }
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request (Validation errors)
- `500`: Internal Server Error

### Common Error Cases
- Missing required fields in request payload
- Invalid ObjectId format
- Resource not found
- Self-assignment in issue operations
- Duplicate issue attempts (when asset is already actively issued)

---

## 6. Technology Details

### Vert.x Framework
- **Router**: Routes HTTP requests to appropriate handlers
- **BodyHandler**: Parses request bodies (JSON, form data)
- **CorsHandler**: Enables Cross-Origin Resource Sharing
- **BlockingHandler**: Executes database operations without blocking event loop

### MongoDB Operations
- Aggregation pipeline for complex queries (pagination, filtering, grouping)
- Partial unique indexes for data integrity constraints
- ObjectId for document identification

### Request/Response Envelope
- All responses wrapped in `ResponseType` (SUCCESS/ERROR) and `StatusCode`
- Consistent data structure across all endpoints
- Logging at INFO and ERROR levels for debugging

---

## 7. Development Notes

- **Pagination**: Default page size is 10, max is 100
- **Date Format**: `YYYY-MM-DD` for input, ISO 8601 for output
- **ID Format**: MongoDB ObjectId (24-character hex string)
- **CORS**: Enabled for all origins with credentials support
- **Content-Type**: `application/json`
- **HTTP Methods**: GET (retrieve), POST (create), PUT (update)
