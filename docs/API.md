# API Reference

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "agent"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "agent",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "last_login": null
}
```

#### POST /api/auth/login
Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "agent"
  }
}
```

#### GET /api/auth/me
Get current authenticated user information.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "agent",
  "is_active": true
}
```

### Leads

#### POST /api/leads
Create a new lead with AI analysis.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "phone": "+1234567890",
  "budget": 5000000,
  "location": "Mumbai",
  "timeline": "Immediately",
  "property_type": "2BHK",
  "loan_status": "Pre-approved",
  "message": "Looking for a 2BHK apartment in Andheri"
}
```

**Response:** `201 Created`
```json
{
  "lead": {
    "id": 1,
    "name": "Jane Smith",
    "phone": "+1234567890",
    "budget": 5000000,
    "location": "Mumbai",
    "score": 85,
    "category": "Hot",
    "conversion_probability": 0.85,
    "no_show_risk": 0.15,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "ai_analysis": {
    "score": 85,
    "category": "Hot",
    "summary": "High-quality lead with strong buying signals...",
    "recommended_action": "Schedule immediate site visit..."
  },
  "score_breakdown": {
    "ai_score": 85,
    "budget_score": 90,
    "timeline_score": 100,
    "loan_score": 100,
    "message_score": 75
  }
}
```

#### GET /api/leads
List all leads with pagination.

**Query Parameters:**
- `skip` (int, default: 0): Number of records to skip
- `limit` (int, default: 20, max: 100): Maximum records to return
- `category` (string): Filter by category (Hot, Warm, Cold)

**Response:** `200 OK`
```json
{
  "total": 150,
  "leads": [
    {
      "id": 1,
      "name": "Jane Smith",
      "score": 85,
      "category": "Hot",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /api/leads/search
Advanced lead search with filters.

**Query Parameters:**
- `q` (string): Search term (name, location, phone)
- `category` (string): Filter by category
- `min_score`, `max_score` (int): Score range
- `min_budget`, `max_budget` (int): Budget range
- `location` (string): Location filter
- `property_type` (string): Property type filter
- `timeline` (string): Timeline filter
- `sort_by` (string): Sort field (created_at, score, name, budget)
- `sort_order` (string): Sort order (asc, desc)
- `skip`, `limit` (int): Pagination

**Example:**
```
GET /api/leads/search?q=Mumbai&min_score=70&sort_by=score&sort_order=desc
```

#### GET /api/leads/export/csv
Export leads to CSV file.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `category` (string): Filter by category
- `min_score` (int): Minimum score filter

**Response:** `200 OK` (CSV file download)

#### GET /api/leads/{lead_id}
Get a single lead by ID.

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Jane Smith",
  "phone": "+1234567890",
  "budget": 5000000,
  "location": "Mumbai",
  "score": 85,
  "category": "Hot"
}
```

#### DELETE /api/leads/{lead_id}
Delete a lead.

**Response:** `204 No Content`

#### POST /api/leads/{lead_id}/followup
Generate WhatsApp follow-up message.

**Response:** `200 OK`
```json
{
  "lead_id": 1,
  "lead_name": "Jane Smith",
  "category": "Hot",
  "whatsapp_message": "Hi Jane! 👋 Thank you for your interest..."
}
```

### Notes

#### GET /api/leads/{lead_id}/notes
List all notes for a lead.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "lead_id": 1,
    "user_id": 1,
    "content": "Called the lead, very interested",
    "is_important": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /api/leads/{lead_id}/notes
Create a note for a lead.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Follow up scheduled for tomorrow",
  "is_important": false
}
```

**Response:** `201 Created`

### Analytics

#### GET /api/analytics/dashboard
Get dashboard metrics.

**Response:** `200 OK`
```json
{
  "total_leads": 150,
  "categories": {
    "Hot": 45,
    "Warm": 60,
    "Cold": 45
  },
  "avg_score": 65,
  "avg_conversion_probability": 0.65,
  "top_leads": [...]
}
```

#### GET /api/analytics/conversion-funnel
Get conversion funnel data.

**Response:** `200 OK`
```json
{
  "total_leads": 150,
  "hot_leads": 45,
  "warm_leads": 60,
  "cold_leads": 45,
  "conversion_rate": 0.30
}
```

### Activity Logs

#### GET /api/activity-logs
List activity logs with filters.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `action` (string): Filter by action type
- `entity_type` (string): Filter by entity type
- `entity_id` (int): Filter by entity ID
- `days` (int, default: 7): Days to look back
- `limit` (int, default: 100): Maximum logs

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "user_email": "user@example.com",
    "action": "lead_created",
    "entity_type": "lead",
    "entity_id": 1,
    "description": "Created lead: Jane Smith",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

## Error Responses

All endpoints may return these error codes:

### 400 Bad Request
Invalid request data or parameters.

```json
{
  "detail": "Invalid input data"
}
```

### 401 Unauthorized
Missing or invalid authentication token.

```json
{
  "detail": "Invalid or expired token"
}
```

### 403 Forbidden
Insufficient permissions.

```json
{
  "detail": "Insufficient permissions"
}
```

### 404 Not Found
Resource not found.

```json
{
  "detail": "Lead with id 999 not found"
}
```

### 422 Unprocessable Entity
Validation error.

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

### 429 Too Many Requests
Rate limit exceeded.

```json
{
  "detail": "Rate limit exceeded. Maximum 60 requests per minute."
}
```

### 500 Internal Server Error
Server error.

```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

- Default: 60 requests per minute per IP
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp when limit resets
