# Tradafy API Routes

**Base URL:** `http://localhost:5004/api`  
**Auth:** Bearer token in `Authorization` header  
**All responses follow :** `{ success: bool, data: {}, message: "" }`

---

## 1. Auth — `/api/auth`

### POST `/api/auth/register`
**Access:** Public

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "buyer"
}
```
> `role` accepts: `"buyer"`, `"supplier"`, `"admin"`, `"shipping_agent"`

**201 Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "roles": ["buyer"],
    "token": "<jwt>"
  }
}
```

---

### POST `/api/auth/login`
**Access:** Public

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**200 Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "roles": ["buyer"],
    "token": "<jwt>"
  }
}
```

---

## 2. Company — `/api/companies`

### GET `/api/companies`
**Access:** Public

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Default: 1 |
| `limit` | number | Default: 20, max: 50 |
| `search` | string | Text search on company name |
| `country` | string | Filter by country code |
| `status` | string | `pending`, `verified`, `rejected` (default: `verified`) |

**200 Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "data": [{ "_id": "...", "name": "...", "country": "...", "verificationStatus": "verified" }]
}
```

---

### GET `/api/companies/:id`
**Access:** Public

**200 Response:**
```json
{
  "success": true,
  "data": { "_id": "...", "name": "...", "country": "...", "verificationStatus": "...", ... }
}
```

---

### POST `/api/companies`
**Access:** Private 🔒

**Body:**
```json
{
  "name": "Acme Corp",
  "country": "US",
  "companyType": "buyer",
  "industry": "Retail",
  "documents": [
    { "name": "Business License", "url": "https://cdn.example.com/license.pdf", "type": "pdf" }
  ]
}
```
> `documents` is optional (max 5 items). Each item requires `name` + `url`; `type` is optional.
> If `documents` provided → `verificationStatus` auto-set to `"submitted"`. Otherwise → `"draft"`.

**201 Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Acme Corp",
    "country": "US",
    "verificationStatus": "submitted",
    "documents": [
      { "_id": "...", "name": "Business License", "url": "...", "type": "pdf" }
    ]
  }
}
```
> Also auto-sets `req.user.companyId` on the user record.

---

### PUT `/api/companies/:id`
**Access:** Private 🔒 (company owner or admin)

**Body:** Any subset of company fields. Notes:
- `verificationStatus` is ignored unless caller is admin
- Uploading `documents` when status is `draft` or `submitted` → auto-advances status to `"submitted"`
- Already `verified` or `rejected` companies are not auto-changed

```json
{
  "description": "Updated bio",
  "documents": [
    { "name": "Tax Certificate", "url": "https://cdn.example.com/tax.pdf", "type": "pdf" },
    { "name": "Export License", "url": "https://cdn.example.com/export.jpg", "type": "image" }
  ]
}
```

**200 Response:**
```json
{
  "success": true,
  "data": { "_id": "...", "verificationStatus": "submitted", "documents": [...], ... }
}
```

---

## 3. Product — `/api/products`

### GET `/api/products`
**Access:** Public

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Default: 1 |
| `limit` | number | Default: 20, max: 50 |
| `search` | string | Full-text search on title + description |
| `category` | string | Filter by category |
| `companyId` | ObjectId | Filter by supplier company |
| `minPrice` | number | Price range filter |
| `maxPrice` | number | Price range filter |

**200 Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 100,
  "totalPages": 20,
  "page": 1,
  "data": [{ "_id": "...", "title": "...", "price": 500, "category": "...", "companyId": "...", "images": [] }]
}
```

---

### GET `/api/products/:id`
**Access:** Public

**200 Response:**
```json
{
  "success": true,
  "data": { "_id": "...", "title": "...", "category": "...", "price": 500, "unit": "box", "companyId": "...", ... }
}
```

---

### POST `/api/products`
**Access:** Private 🔒 (verified company only)

**Body:**
```json
{
  "title": "Premium Widget",
  "category": "Electronics",
  "price": 500,
  "quantity": 1000,
  "unit": "box",
  "description": "...",
  "incoterm": "FOB",
  "countryOfOrigin": "CN"
}
```
> `title` and `category` are required. All other fields optional.

**201 Response:**
```json
{
  "success": true,
  "data": { "_id": "...", "title": "...", "companyId": "...", ... }
}
```

---

### PUT `/api/products/:id`
**Access:** Private 🔒 (owner company or admin)

**Body:** Any subset of product fields (`title`, `price`, `category`, `description`, etc.)

**200 Response:**
```json
{
  "success": true,
  "data": { "_id": "...", "title": "Updated Title", ... }
}
```

---

### DELETE `/api/products/:id`
**Access:** Private 🔒 (owner company or admin)
> Soft delete only — sets `isDeleted: true`, `isActive: false`

**200 Response:**
```json
{
  "success": true,
  "message": "Product successfully archived."
}
```

---

## 4. RFQ — `/api/rfq`

All routes require authentication 🔒.

### POST `/api/rfq`
**Access:** Private 🔒 (buyer with a company)

**Body — Path A (product-based):**
```json
{
  "productId": "<ObjectId>",
  "quantity": 100,
  "targetPrice": 450,
  "incoterm": "FOB"
}
```
> `supplierCompanyId` is **auto-resolved** from `product.companyId`. Status set to `in_progress`.

**Body — Path B (manual):**
```json
{
  "productName": "Custom Rubber Gasket",
  "quantity": 200,
  "targetPrice": 300,
  "incoterm": "EXW",
  "supplierCompanyId": "<ObjectId>"
}
```
> If `supplierCompanyId` is provided → `status: "in_progress"`. Otherwise → `status: "open"`.

**201 Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "productName": "...",
    "category": "...",
    "quantity": 100,
    "targetPrice": 450,
    "incoterm": "FOB",
    "status": "in_progress",
    "buyerCompanyId": "...",
    "supplierCompanyId": "...",
    "buyerUserId": "..."
  }
}
```

---

### GET `/api/rfq`
**Access:** Private 🔒 (buyer sees only their company's RFQs)

**Query Params:** `page`, `limit`, `status` (`open`, `in_progress`, `converted`, `closed`)

**200 Response:**
```json
{
  "success": true,
  "count": 3,
  "total": 3,
  "totalPages": 1,
  "page": 1,
  "data": [{ "_id": "...", "productName": "...", "quantity": 100, "status": "in_progress", ... }]
}
```

---

### GET `/api/rfq/:id`
**Access:** Private 🔒 (buyer company or supplier company or admin)

**200 Response:**
```json
{
  "success": true,
  "data": { "_id": "...", "productName": "...", "quantity": 100, "status": "...", "buyerCompanyId": "...", "supplierCompanyId": "...", ... }
}
```

---

### PUT `/api/rfq/:id`
**Access:** Private 🔒 (buyer only, RFQ must be `open` or `in_progress`)

**Body:** Any subset of: `quantity`, `targetPrice`, `productName`

**200 Response:**
```json
{
  "success": true,
  "data": { "_id": "...", "quantity": 150, "targetPrice": 420, ... }
}
```

---

### PATCH `/api/rfq/:id/close`
**Access:** Private 🔒 (buyer only)

**200 Response:**
```json
{
  "success": true,
  "message": "RFQ has been closed.",
  "data": { "_id": "...", "status": "closed", ... }
}
```

---

### PATCH `/api/rfq/:id/assign-supplier`
**Access:** Private 🔒 (buyer only)

**Body:**
```json
{
  "supplierCompanyId": "<ObjectId>"
}
```

**200 Response:**
```json
{
  "success": true,
  "message": "Supplier assigned successfully.",
  "data": { "_id": "...", "supplierCompanyId": "...", "status": "in_progress", ... }
}
```

---

### POST `/api/rfq/:id/convert`
**Access:** Private 🔒 (buyer only, RFQ must be `open` or `in_progress` with a `supplierCompanyId`)

**201 Response:**
```json
{
  "success": true,
  "message": "RFQ successfully converted to Deal.",
  "data": {
    "rfqId": "...",
    "deal": {
      "_id": "...",
      "buyerCompanyId": "...",
      "supplierCompanyId": "...",
      "status": "inquiry",
      "quantity": 100,
      "price": 450,
      "timeline": [...],
      "activityLog": [...]
    }
  }
}
```

---

## 5. Deal — `/api/deals`

All routes require authentication 🔒.

### POST `/api/deals`
**Access:** Private 🔒 (buyer with a company)

**Body:**
```json
{
  "supplierCompanyId": "<ObjectId>",
  "productId": "<ObjectId>",
  "quantity": 300,
  "price": 600,
  "incoterm": "FOB"
}
```
> `supplierCompanyId` is required.

**201 Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "buyerCompanyId": "...",
    "supplierCompanyId": "...",
    "status": "inquiry",
    "quantity": 300,
    "price": 600,
    "timeline": [{ "stage": "inquiry", "updatedAt": "...", "notes": "Deal opened" }],
    "activityLog": [{ "action": "Deal created", "userId": "...", "timestamp": "..." }]
  }
}
```

---

### GET `/api/deals`
**Access:** Private 🔒 (participant sees only their deals — buyer or supplier company)

**Query Params:** `page`, `limit`, `status`

**200 Response:**
```json
{
  "success": true,
  "count": 2,
  "total": 2,
  "totalPages": 1,
  "page": 1,
  "data": [{ "_id": "...", "status": "inquiry", "quantity": 300, "price": 600, ... }]
}
```

---

### GET `/api/deals/:id`
**Access:** Private 🔒 (participant or admin)

**200 Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "status": "negotiation",
    "quantity": 300,
    "price": 600,
    "incoterm": "FOB",
    "timeline": [...],
    "activityLog": [...]
  }
}
```

---

### PUT `/api/deals/:id`
**Access:** Private 🔒 (participant, deal must not be `closed`)

**Body:** Any subset of: `quantity`, `price`, `paymentTerms`, `incoterm`

**200 Response:**
```json
{
  "success": true,
  "data": { "_id": "...", "quantity": 120, "paymentTerms": "Net 30", ... }
}
```

---

### PATCH `/api/deals/:id/status`
**Access:** Private 🔒 (participant, sequential transitions enforced)

**Allowed status flow:**
```
inquiry → negotiation → agreement → payment → production → shipping_request → shipping → delivery → closed
```
> `shipping_request` stage: buyer/supplier creates a freight request. Once a bid is accepted the deal auto-transitions to `shipping`.
> Any stage can also jump directly to `closed`.

**Body:**
```json
{
  "status": "negotiation",
  "notes": "Moving to negotiation phase"
}
```

**200 Response:**
```json
{
  "success": true,
  "message": "Deal status updated to 'negotiation'.",
  "data": {
    "_id": "...",
    "status": "negotiation",
    "timeline": [...],
    "activityLog": [...]
  }
}
```

---

## 6. Messages — `/api/messages`

All routes require authentication 🔒.

### POST `/api/messages`
**Access:** Private 🔒 (deal participant, deal must not be `closed`)

**Body:**
```json
{
  "dealId": "<ObjectId>",
  "text": "Hello, I accept the terms.",
  "receiverId": "<ObjectId>",
  "type": "text"
}
```
> `dealId` required. At least one of `text` or `attachments` required. `type`: `"text"` | `"file"` | `"system"`.

**201 Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "dealId": "...",
    "senderId": "...",
    "text": "Hello, I accept the terms.",
    "type": "text",
    "readBy": ["<senderId>"],
    "createdAt": "..."
  }
}
```

---

### GET `/api/messages`
**Access:** Private 🔒 (deal participant)
> Also marks fetched messages as read for the requesting user.

**Query Params:**
| Param | Required | Description |
|-------|----------|-------------|
| `dealId` | ✅ | ObjectId of the deal |
| `page` | no | Default: 1 |
| `limit` | no | Default: 20, max: 50 |

**200 Response:**
```json
{
  "success": true,
  "count": 2,
  "total": 2,
  "totalPages": 1,
  "page": 1,
  "data": [
    { "_id": "...", "dealId": "...", "senderId": "...", "text": "...", "readBy": [...], "createdAt": "..." }
  ]
}
```

---

## 7. Admin — `/api/admin`

All routes require authentication 🔒 **and** `admin` role.

### GET `/api/admin/users`
**Query Params:** `page`, `limit`, `role` (`buyer`/`supplier`/`admin`), `isActive` (`true`/`false`)

**200 Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "totalPages": 5,
  "page": 1,
  "data": [{ "_id": "...", "firstName": "...", "email": "...", "roles": [...], "isActive": true }]
}
```

---

### PATCH `/api/admin/users/:id/toggle-status`
**200 Response:**
```json
{
  "success": true,
  "message": "User has been deactivated.",
  "data": { "_id": "...", "email": "...", "isActive": false }
}
```

---

### GET `/api/admin/companies`
**Query Params:** `page`, `limit`, `status` (`pending`/`verified`/`rejected`/`submitted`/`draft`), `search`

**200 Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 20,
  "data": [{
    "_id": "...",
    "name": "...",
    "country": "...",
    "verificationStatus": "submitted",
    "documents": [
      { "_id": "...", "name": "Business License", "url": "...", "type": "pdf" }
    ]
  }]
}
```
> `documents` is included so admin can review files before calling the verify endpoint.

---

### PATCH `/api/admin/companies/:id/verify`
**Body:**
```json
{
  "verificationStatus": "verified"
}
```
> Accepts: `"pending"`, `"verified"`, `"rejected"`

**200 Response:**
```json
{
  "success": true,
  "message": "Company verification status set to 'verified'.",
  "data": { "_id": "...", "name": "...", "verificationStatus": "verified" }
}
```

---

### GET `/api/admin/deals`
**Query Params:** `page`, `limit`, `status`

**200 Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 10,
  "data": [{ "_id": "...", "status": "negotiation", "buyerCompanyId": "...", "supplierCompanyId": "..." }]
}
```

---

### GET `/api/admin/deals/:id`
**200 Response:**
```json
{
  "success": true,
  "data": { "_id": "...", "status": "...", "timeline": [...], "activityLog": [...] }
}
```

---

### GET `/api/admin/rfq`
**Query Params:** `page`, `limit`, `status`

**200 Response:**
```json
{
  "success": true,
  "count": 3,
  "total": 3,
  "data": [{ "_id": "...", "productName": "...", "status": "converted", "dealId": "..." }]
}
```

---

### GET `/api/admin/rfq/:id`
**200 Response:**
```json
{
  "success": true,
  "data": { "_id": "...", "productName": "...", "quantity": 100, "status": "converted", "dealId": "..." }
}
```

---

---

## 8. Shipping — `/api/shipping`

All routes require authentication 🔒.

**Role matrix:**
| Endpoint | Buyer/Supplier | Shipping Agent | Admin |
|----------|:-:|:-:|:-:|
| POST /shipping/request | ✅ | ❌ | ✅ |
| GET /shipping/request/:dealId | ✅ | ❌ | ✅ |
| GET /shipping/bids/:requestId | ✅ | ❌ | ✅ |
| POST /shipping/bid/:id/accept | ✅ | ❌ | ✅ |
| GET /shipping/requests | ❌ | ✅ | ❌ |
| POST /shipping/bid | ❌ | ✅ | ❌ |

---

### POST `/api/shipping/request`
**Access:** Private 🔒 (buyer or supplier — deal must be in `shipping_request` status)

**Body:**
```json
{
  "dealId": "<ObjectId>",
  "origin": "Shanghai, CN",
  "destination": "Los Angeles, US",
  "cargoDetails": "Electronic components, fragile",
  "quantity": 500,
  "incoterm": "FOB"
}
```
> Only one shipping request per deal. Duplicate requests return `400` with the existing `shippingRequestId`.

**201 Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "dealId": "...",
    "origin": "Shanghai, CN",
    "destination": "Los Angeles, US",
    "quantity": 500,
    "incoterm": "FOB",
    "status": "open",
    "createdByRole": "buyer"
  }
}
```

---

### GET `/api/shipping/request/:dealId`
**Access:** Private 🔒 (buyer or supplier)

**200 Response:**
```json
{
  "success": true,
  "data": { "_id": "...", "dealId": "...", "origin": "...", "destination": "...", "status": "open", ... }
}
```

---

### GET `/api/shipping/bids/:requestId`
**Access:** Private 🔒 (buyer or supplier)

**200 Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "agentId": "...",
      "price": 4500,
      "transportType": "sea",
      "transitTime": "18-22 days",
      "services": ["customs"],
      "validity": "2026-05-01T00:00:00.000Z",
      "status": "pending"
    }
  ]
}
```

---

### POST `/api/shipping/bid/:id/accept`
**Access:** Private 🔒 (buyer or supplier)

> **Side effects (atomic):**
> - Winning bid → `accepted`
> - All other bids → `rejected`
> - ShippingRequest → `closed`
> - Deal: `selectedBidId` + `shippingAgentId` set; `status` auto-transitions to `shipping`

**200 Response:**
```json
{
  "success": true,
  "message": "Bid accepted. Deal has moved to shipping stage.",
  "data": {
    "bid": { "_id": "...", "status": "accepted", ... },
    "deal": { "_id": "...", "status": "shipping", "shippingAgentId": "..." }
  }
}
```

---

### GET `/api/shipping/requests`
**Access:** Private 🔒 (shipping_agent only)

> ⚠️ **Privacy:** Only cargo-level fields are returned. Deal pricing, buyer/supplier identities, and payment terms are **never** exposed to agents.

**Query Params:** `page`, `limit`

**200 Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 12,
  "totalPages": 3,
  "page": 1,
  "data": [
    {
      "_id": "...",
      "origin": "Shanghai, CN",
      "destination": "Los Angeles, US",
      "cargoDetails": "Electronics, fragile",
      "quantity": 500,
      "incoterm": "FOB",
      "createdAt": "2026-04-05T..."
    }
  ]
}
```

---

### POST `/api/shipping/bid`
**Access:** Private 🔒 (shipping_agent only)

> One bid per agent per request — duplicate submissions return `400`.

**Body:**
```json
{
  "shippingRequestId": "<ObjectId>",
  "price": 4500,
  "transportType": "sea",
  "transitTime": "18-22 days",
  "services": ["customs", "door-to-door"],
  "validity": "2026-05-01",
  "notes": "Includes full cargo insurance.",
  "documents": ["https://cdn.example.com/bl_template.pdf"]
}
```

**201 Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "shippingRequestId": "...",
    "agentId": "...",
    "price": 4500,
    "transportType": "sea",
    "status": "pending"
  }
}
```

---

## Error Responses

| Status | Meaning |
|--------|---------|
| `400` | Validation failed / bad request (e.g. invalid transition, duplicate) |
| `401` | No token / invalid token |
| `403` | Authenticated but not authorized (wrong role or company) |
| `404` | Resource not found or soft-deleted |
| `500` | Internal server error |

**Validation error shape (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Please include a valid email" }]
}
```
