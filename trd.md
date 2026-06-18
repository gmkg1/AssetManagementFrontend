# Technical Requirements Document (TRD) — Asset Management System

## 1. Document Control
- **Title**: Technical Requirements Document (TRD) — Asset Management System
- **Status**: Approved / Implemented
- **Target Audience**: Backend Engineers, Frontend Engineers, DevOps Engineers, Database Administrators

---

## 2. System Architecture

The application is structured into a microfrontend web application backed by a Vert.x microservice.

```mermaid
graph TD
    subgraph Client Application (MFE)
        Shell[Shell Container Host - Port 4200]
        AssetMFE[Asset Management Remote - Port 4205]
        Shell -.->|Webpack Module Federation| AssetMFE
    end
    
    subgraph API Gateway / Router
        VertxRouter[Vert.x HTTP Router - Port 8080]
    end
    
    subgraph Backend Microservice
        Starter[MicroserviceStarter]
        Handlers[Request Handlers / Controllers]
        AssetsService[AssetsService.java]
        VertxRouter --> Starter
        Starter --> Handlers
        Handlers --> AssetsService
    end
    
    subgraph Persistence Layer
        MongoDB[(MongoDB Database)]
        AssetsService -->|Mongo Sync Driver| MongoDB
    end
```

### Key Architectural Choices:
1. **Frontend Webpack Module Federation**: The Shell dynamically loads remote Entry Bundles (`remoteEntry.js`) using a remote manifest. Dynamic routes are constructed at runtime, enabling independent deployment.
2. **Reactive Vert.x Web Gateway**: Handlers run on Vert.x worker threads, decoding request payloads into `JsonObject` structures before passing them to the synchronous database access services.
3. **MongoDB Document Store**: Selected for schema flexibility (handling custom metadata per category) and nested document structures (hierarchical units).

---

## 3. Database Schema Specification

### A. Collection: `assets`
Stores physical inventory items. Can be serialized (quantity = 1) or bulk/consumable (quantity > 1).
```json
{
  "_id": "ObjectId",
  "assetName": "String",
  "assetTagId": "ObjectId -> assettags",
  "statusId": "ObjectId -> status",
  "locationId": "ObjectId -> locations",
  "assetSerialNumber": "String (unique index)",
  "purchaseCost": "NumberInt | Double",
  "purchaseDate": "ISODate",
  "isIssuable": "Boolean",
  "quantity": "NumberInt | Double",
  "unitOfMeasureId": "ObjectId -> units",
  "campusId": "ObjectId -> campuses",
  "blockId": "String"
}
```

### B. Collection: `issueto`
Tracks all active outgoings (issuances) and return balances.
```json
{
  "_id": "ObjectId",
  "assetId": "ObjectId -> assets",
  "issueDate": "ISODate",
  "locationId": "ObjectId -> locations (nullable)",
  "personId": "ObjectId -> persons (nullable)",
  "issuedToAssetId": "ObjectId -> assets (nullable)",
  "ActiveStatus": "Boolean (true if unreturned quantity > 0)",
  "returnStatus": "Boolean (true only when returnedQuantity == issueQuantity)",
  "returnDate": "ISODate (last return operation timestamp)",
  "quantity": "Number (asset availability level *at the time of issuance*)",
  "unitOfMeasurement": "String (acronym of selected unit at issuance)",
  "issueQuantity": "NumberInt | Double (issued quantity in transaction units)",
  "issueUnitId": "ObjectId -> units",
  "conversionFactor": "NumberInt | Double (ratio of base unit / issue unit)",
  "returnedQuantity": "NumberInt | Double (cumulative returns in transaction units)",
  "notes": "String"
}
```
*Index*: A partial unique index is enforced on `assetId` where `returnStatus: false` for serialized assets.

### C. Collection: `units`
Stores hierarchical units of measure and scaling logic.
```json
{
  "_id": "ObjectId",
  "unitOfMeasure": "String (e.g. Kilolitre)",
  "acronym": "String (e.g. kL)",
  "hierarchy": [
    {
      "childNode": "String (e.g. L)",
      "childNodeName": "String (e.g. Litre)",
      "conversionFactor": "NumberInt (e.g. 1000)"
    }
  ]
}
```

---

## 4. Key Algorithms & Core Logic

### A. Unit Conversion & Stock Deductions
When an asset is issued with a selected unit:
1. Retrieve the unit's `conversionFactor` ($CF$) from the hierarchy. The parent unit has a $CF$ of `1`.
2. Convert the user's input `issueQuantity` ($Q_{issue}$) into base unit equivalent ($Q_{base}$):
   $$Q_{base} = \frac{Q_{issue}}{CF}$$
3. Retrieve available stock ($Q_{available}$) from the asset doc.
4. Validate:
   $$Q_{base} \le Q_{available}$$
5. Perform MongoDB atomic update to deduct stock:
   $$Q_{new\_stock} = Q_{available} - Q_{base}$$
   *Note*: Integer type is preserved in MongoDB if $Q_{new\_stock}$ is a whole number; otherwise, double precision is stored.

### B. Circular Assignment Loop Prevention
To prevent infinite cyclic loops when issuing an asset to another asset:
```java
ObjectId sourceObjectId = new ObjectId(assetId.trim());
ObjectId current = new ObjectId(issuedToAssetId.trim());
while (current != null) {
  if (current.equals(sourceObjectId)) {
    throw new IllegalArgumentException("Circular assignment loop detected");
  }
  Document parentAssoc = collection.find(new Document("assetId", current).append("returnStatus", false)).first();
  if (parentAssoc != null) {
    current = parentAssoc.getObjectId("issuedToAssetId");
  } else {
    current = null;
  }
}
```

### C. Floating-Point Precision & Tolerant Return Matching
Due to binary representations of decimals, arithmetic operations can leave small remainders (e.g., $99.9999999$ instead of $100.0$). The return status calculation applies a tolerance threshold ($0.0001$):
```java
double newReturned = alreadyReturned + returnQuantityVal;
if (newReturned >= issueQuantityVal - 0.0001) {
  updateFields.append("ActiveStatus", false)
              .append("returnStatus", true);
}
```

### D. Safe Number Field Extraction
To prevent `ClassCastException` runtime errors in Java when fields contain integer values in some documents and double values in others:
```java
private Number getNumberField(Document doc, String field, Number defaultVal) {
  if (doc == null || field == null) return defaultVal;
  Object val = doc.get(field);
  if (val instanceof Number) {
    double d = ((Number) val).doubleValue();
    if (d == Math.floor(d)) {
      return (int) d;
    }
    return d;
  }
  return defaultVal;
}
```

---

## 5. API Contracts (Standard Response Wrap)
All successful endpoints wrap response payloads in a consistent JSON envelope:
```json
{
  "statusCode": 200,
  "type": "SUCCESS",
  "responseData": {
    "data": { ... }
  }
}
```
*Error responses* return HTTP status codes in the 400/500 range, formatted as:
```json
{
  "statusCode": 400,
  "type": "ERROR",
  "responseData": {
    "error": "Error message details"
  }
}
```
