# Asset Management System - Backend Integration & Context Guide

This document provides a comprehensive overview of the backend architecture, MongoDB database collections, and REST API endpoints for the Asset Management system. It reflects the actual implementation in the **Java / Vert.x** codebase and serves as a reference for frontend development.

---

## 1. System Overview

- **Technology Stack**: Java / Vert.x Microservice
- **Database**: MongoDB
- **Base Routing Prefix**: `/kjusys-api/asset-management-api`
- **Default Server Port**: `8080` (Standard local development url: `http://localhost:8080/kjusys-api/asset-management-api`)

---

## 2. Database Collections Schema

The backend uses the following MongoDB collections to manage assets, category tags, issue assignments, and returns.

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

---

## 3. REST API Endpoints

All responses from the backend follow a standard envelope pattern:
```json
{
  "responseType": "SUCCESS" | "ERROR",
  "statusCode": 200 | 400 | 500,
  "responseData": {
    "data": ...
  }
}
```

### A. Asset Management

#### 1. List Assets
- **Path**: `GET /kjusys-api/asset-management-api/assets`
- **Query Parameters**:
  - `page`: `Integer` (default: 1)
  - `pageSize`: `Integer` (default: 10)
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
      "data": [
        {
          "_id": "6a1035ba99696f0a7c441532",
          "assetName": "MacBook Pro",
          "assetSerialNumber": "SN12345678",
          "purchaseCost": 1200,
          "purchaseDate": "2026-05-27T00:00:00Z",
          "isIssuable": true,
          "quantity": 1,
          "assetTagName": "MacBook Pro 16",
          "model": "MacBook Pro 16",
          "category": "Laptops",
          "status": "Ready to Deploy",
          "issuable": true,
          "location": "Staff Room 1",
          "block": "B002",
          "issuedTo": "Not Issued"
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

#### 3. Create Asset
- **Path**: `POST /kjusys-api/asset-management-api/create-asset`
- **Request Payload**:
  ```json
  {
    "assetName": "MacBook Pro",
    "assetTagId": "6a1035ba99696f0a7c441532",
    "statusId": "6a0fe1928c08584d89441544",
    "defaultLocation": "6a0fe1928c08584d89441544", // Optional
    "serial": "SN123456789",                      // Optional
    "purchaseCost": "1200",                       // Optional (String or Integer representation)
    "purchaseDate": "2026-06-12",                 // Optional (YYYY-MM-DD)
    "isReturnable": true                          // Optional
  }
  ```
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "data": {
        "message": "Asset created successfully",
        "_id": "6a1035ba99696f0a7c441532"
      }
    }
  }
  ```

#### 4. Edit Asset
- **Path**: `PUT /kjusys-api/asset-management-api/edit-asset`
- **Request Payload**:
  ```json
  {
    "_id": "6a1035ba99696f0a7c441532",             // Required
    "assetName": "MacBook Pro",                    // Optional
    "assetTagId": "6a1035ba99696f0a7c441532",      // Optional
    "statusId": "6a0fe1928c08584d89441544",        // Optional
    "defaultLocation": "6a0fe1928c08584d89441544", // Optional
    "serial": "SN123456789",                      // Optional
    "purchaseCost": "1300",                       // Optional
    "purchaseDate": "2026-06-12",                 // Optional
    "isReturnable": true                          // Optional
  }
  ```
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "data": {
        "message": "Asset updated successfully"
      }
    }
  }
  ```

#### 5. Get Asset Details
- **Path**: `GET /kjusys-api/asset-management-api/asset-details`
- **Query Parameters**:
  - `id`: `String` (Asset document ID)
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "data": {
        "_id": "6a1035ba99696f0a7c441532",
        "purchaseCost": 1200,
        "purchaseDate": "2026-05-27T00:00:00Z",
        "assetSerialNumber": "SN12345678",
        "isIssuable": true,
        "assetName": "MacBook Pro",
        "assetTagId": "6a1035ba99696f0a7c441532",
        "categoryId": "6a0fe1928c08584d89441544",
        "quantity": 1,
        "unitOfMeasureId": "6a1533d11fcf30c131441533",
        "campusId": "6a101a50df52662f6e441530",
        "blockId": "B002",
        "statusId": "6a0fe1928c08584d89441544",
        "locationId": "6a0fe1928c08584d89441544"
      }
    }
  }
  ```

---

### B. Asset Tracking (Issue & Return)

#### 1. Get Issued Assets List (Active Assignments)
- **Path**: `GET /kjusys-api/asset-management-api/issued-assets`
- **Query Parameters**:
  - `page`: `Integer`
  - `pageSize`: `Integer`
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
      "data": {
        "assets": [
          {
            "_id": "6a168f4c083766160e44152f",         // issueId
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
    }
  }
  ```

#### 2. Issue an Asset
- **Path**: `POST /kjusys-api/asset-management-api/issue-asset`
- **Request Payload**:
  ```json
  {
    "assetId": "6a1035ba99696f0a7c441532",
    "issueDate": "2026-05-27",
    "locationId": "6a0fe1928c08584d89441544", // null if not Location
    "personId": null,                         // null if not Person
    "issuedToAssetId": null                    // null if not Asset
  }
  ```
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "data": {
        "message": "Asset issued successfully",
        "issueId": "6a168f4c083766160e44152f",
        "assetId": "6a1035ba99696f0a7c441532",
        "issueDate": "2026-05-27T00:00:00Z",
        "locationId": "6a0fe1928c08584d89441544",
        "personId": null,
        "issuedToAssetId": null
      }
    }
  }
  ```

#### 3. Return an Asset
- **Path**: `POST /kjusys-api/asset-management-api/return-asset`
- **Request Payload**:
  ```json
  {
    "assetId": "6a1035ba99696f0a7c441532",      // Required
    "issuetoId": "6a168f4c083766160e44152f",    // Required (Original issue record ID)
    "returnDate": "2026-05-27",                 // Required (YYYY-MM-DD)
    "notes": "Returned in perfect condition"    // Optional
  }
  ```
- **Response Shape**:
  ```json
  {
    "responseType": "SUCCESS",
    "statusCode": 200,
    "responseData": {
      "data": {
        "message": "Asset returned successfully",
        "returnId": "6a168f4c083766160e44152f",
        "assetId": "6a1035ba99696f0a7c441532",
        "issuetoId": "6a168f4c083766160e44152f",
        "returnDate": "2026-05-27T00:00:00Z",
        "locationId": "6a0fe1928c08584d89441544",
        "personId": null,
        "issuedToAssetId": null
      }
    }
  }
  ```

#### 4. Get Return Logs
- **Path**: `GET /kjusys-api/asset-management-api/return-logs`
- **Query Parameters**:
  - `page`: `Integer`
  - `pageSize`: `Integer`
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
          "returnDate": "2026-05-27T06:38:33Z"
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

### C. Dropdowns & Metadata

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

#### 5. Get Category Counts (Dashboard)
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

#### 6. Get Status Counts (Dashboard Donut Chart)
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

#### 7. Get Asset Status Summary (Dashboard Grid)
- **Path**: `GET /kjusys-api/asset-management-api/asset-status-summary`
- **Query Parameters**:
  - `page`: `Integer`
  - `pageSize`: `Integer`
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
          "deadStock": 0,
          "underMaintenance": 2,
          "damaged": 0
        }
      ],
      "totalRecords": 1,
      "currentPage": 1,
      "pageSize": 10,
      "totalPages": 1
    }
  }
  ```

#### 8. Create Asset Tag
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
