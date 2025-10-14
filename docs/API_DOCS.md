# API Documentation

## Photo Grouping System

The photobooth system requires photo grouping via group codes for ALL photo-related APIs. Every photo and photo-draft uploaded must include a `code` field that groups related photos together. All API endpoints will only return or operate on photos/photo-drafts from the same group code.

**Workflow:**
1. Frontend generates or prompts for a group code
2. Include the code when uploading photos via POST `/api/photo` or POST `/api/photo-draft`
3. Videotron prompts for the same code and fetches only matching photos via GET `/api/photos?code={code}` or GET `/api/photo-draft?code={code}`

**Group Code Requirements:**
- Required for ALL photo-related API endpoints
- Any non-empty string (no specific format required)
- Case-sensitive
- Stored in browser localStorage for Videotron persistence
- Must be provided for both uploads and retrievals

---

## POST `/api/photo`

**Content-Type:** `multipart/form-data`
**Authentication:** API Key required in `x-api-key` header or `Authorization: Bearer {key}`

**Fields:**
- `file` (required): Image file
- `frame` (optional): String
- `code` (required): Group code string for photo grouping/filtering
- `iconData` (optional): JSON string `[{x: number, y: number, iconId: number}]`

**Note:** The `code` field is required for photo grouping functionality. Photos are scoped by this code for the Videotron display.

**Response:**

**Success (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "filename": "photobooth/1234567890-example.jpg",
    "originalName": "example.jpg",
    "gcsUrl": "https://storage.googleapis.com/bucket/photobooth/1234567890-example.jpg",
    "frame": "frame-name",
    "iconData": [
      {
        "id": 1,
        "x": 100,
        "y": 200,
        "photoId": 1,
        "iconId": 1
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error (400/500):**
```json
{
  "error": "Error message",
  "details": "Additional details"
}
```

## POST `/api/photo-draft`

**Content-Type:** `multipart/form-data`
**Authentication:** API Key required in `x-api-key` header or `Authorization: Bearer {key}`

**Fields:**
- `file` (required): Image file
- `code` (required): Group code string for photo grouping/filtering

**Note:** The `code` field is required for photo grouping functionality. Photo drafts are scoped by this code.

**Response:**

**Success (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "url": "https://storage.googleapis.com/bucket/photobooth/1234567890-example.jpg",
    "groupCode": "ABC123",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error (400):**
```json
{
  "error": "Group code is required"
}
```

**Error (400/500):**
```json
{
  "error": "Error message"
}
```

## GET `/api/photo-draft`

**Authentication:** API Key required in `x-api-key` header or `Authorization: Bearer {key}`

**Query Parameters (choose one method):**
- `code` (required for single code): Group code string to filter photo drafts by group
- `codes` (required for multiple codes): JSON array of group code strings, e.g., `["ABC123", "DEF456"]`

**Alternative:** You can also pass the group code via `x-group-code` header (only for single code requests)

**Description:** Retrieves the latest photo-draft for the specified group code(s). For single code requests, returns the latest draft for that group. For multiple codes, returns an object with each code as a key and its latest draft as the value.

**Single Code Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "url": "https://storage.googleapis.com/bucket/photobooth/1234567890-example.jpg",
    "groupCode": "ABC123",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Multiple Codes Response (200):**
```json
{
  "success": true,
  "data": {
    "ABC123": {
      "id": 1,
      "url": "https://storage.googleapis.com/bucket/photobooth/1234567890-example.jpg",
      "groupCode": "ABC123",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "DEF456": {
      "id": 2,
      "url": "https://storage.googleapis.com/bucket/photobooth/1234567891-example.jpg",
      "groupCode": "DEF456",
      "createdAt": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

**Error (400) - Missing Parameters:**
```json
{
  "error": "Group code is required. Use either \"code\" parameter for single code or \"codes\" parameter for multiple codes"
}
```

**Error (400) - Invalid Codes Parameter:**
```json
{
  "error": "Invalid codes parameter. Must be a valid JSON array of strings"
}
```

**Error (400) - Invalid Codes Array:**
```json
{
  "error": "Codes parameter must be a non-empty array of strings"
}
```

**Error (404):**
```json
{
  "error": "No photo drafts found for the specified group code"
}
```

**Error (500):**
```json
{
  "error": "Internal server error"
}
```

## GET `/api/photos`

**Authentication:** API Key required in `x-api-key` header or `Authorization: Bearer {key}`

**Query Parameters:**
- `code` (required): Group code string to filter photos by group

**Alternative:** You can also pass the group code via `x-group-code` header

**Description:** Retrieves all photos filtered by the provided group code. Only photos uploaded with the same group code will be returned.

**Response:**

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "filename": "photobooth/1234567890-example.jpg",
      "originalName": "example.jpg",
      "gcsUrl": "https://storage.googleapis.com/bucket/photobooth/1234567890-example.jpg",
      "frame": "frame-name",
      "groupCode": "ABC123",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error (400):**
```json
{
  "error": "Group code is required"
}
```

**Error (500):**
```json
{
  "error": "Failed to fetch photos"
}
```

## GET `/api/icons`

**Authentication:** None required (public endpoint)

**Description:** Retrieves all available icons for use in photo editing.

**Response:**

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Heart Icon",
      "url": "https://storage.googleapis.com/bucket/icons/1234567890-heart.png",
      "category": "Emojis",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error (500):**
```json
{
  "error": "Failed to fetch icons"
}
```

## GET `/api/admin/frames`

**Authentication:** None required (public endpoint)

**Description:** Retrieves all available frames for photo editing.

**Response:**

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Classic Frame",
      "url": "https://storage.googleapis.com/bucket/frames/1234567890-classic.png",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error (500):**
```json
{
  "error": "Internal server error"
}
```

## GET `/api/admin/devices`

**Authentication:** None required (public endpoint)

**Description:** Retrieves all registered devices for the photobooth system.

**Response:**

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Device 1",
      "pin": "1234",
      "startTime": "09:00",
      "endTime": "17:00",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error (500):**
```json
{
  "error": "Internal server error"
}
```

---

## Admin API Endpoints

The following endpoints require admin authentication via the `Authorization: Bearer {token}` header.

## POST `/api/icons`

**Content-Type:** `multipart/form-data`
**Authentication:** Admin required

**Fields:**
- `file` (required): Icon image file
- `name` (required): Icon name
- `category` (optional): Icon category string

**Response:**

**Success (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Heart Icon",
    "url": "https://storage.googleapis.com/bucket/icons/1234567890-heart.png",
    "category": "Emojis"
  }
}
```

**Error (400/500):**
```json
{
  "error": "Error message"
}
```

## PUT `/api/icons/{id}`

**Content-Type:** `multipart/form-data` or `application/json`
**Authentication:** Admin required

**For FormData (file upload):**
- `file` (optional): New icon image file
- `name` (required): Icon name
- `category` (optional): Icon category string

**For JSON (name only):**
```json
{
  "name": "Updated Icon Name",
  "category": "Updated Category"
}
```

**Response:**

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Icon Name",
    "url": "https://storage.googleapis.com/bucket/icons/1234567890-updated.png",
    "category": "Updated Category",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

## DELETE `/api/icons/{id}`

**Authentication:** Admin required

**Response:**

**Success (200):**
```json
{
  "success": true,
  "message": "Icon deleted successfully"
}
```

## POST `/api/admin/frames`

**Content-Type:** `multipart/form-data`
**Authentication:** Admin required

**Fields:**
- `file` (required): Frame image file
- `name` (required): Frame name

**Response:**

**Success (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Classic Frame",
    "url": "https://storage.googleapis.com/bucket/frames/1234567890-classic.png"
  }
}
```

## PUT `/api/admin/frames/{id}`

**Content-Type:** `multipart/form-data` or `application/json`
**Authentication:** Admin required

**For FormData (file upload):**
- `file` (optional): New frame image file
- `name` (required): Frame name

**For JSON (name only):**
```json
{
  "name": "Updated Frame Name"
}
```

**Response:**

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Frame Name",
    "url": "https://storage.googleapis.com/bucket/frames/1234567890-updated.png",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

## DELETE `/api/admin/frames/{id}`

**Authentication:** Admin required

**Response:**

**Success (200):**
```json
{
  "success": true,
  "message": "Frame deleted successfully"
}
```

## POST `/api/admin/devices`

**Content-Type:** `application/json`
**Authentication:** Admin required

**Fields:**
- `name` (required): Device name
- `pin` (required): 4-digit PIN code
- `startTime` (optional): Start time in HH:MM format
- `endTime` (optional): End time in HH:MM format

**Response:**

**Success (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Device 1",
    "pin": "1234",
    "startTime": "09:00",
    "endTime": "17:00"
  }
}
```

## PUT `/api/admin/devices/{id}`

**Content-Type:** `application/json`
**Authentication:** Admin required

**Fields:**
- `name` (optional): Device name
- `pin` (optional): 4-digit PIN code
- `startTime` (optional): Start time in HH:MM format
- `endTime` (optional): End time in HH:MM format

**Response:**

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Device",
    "pin": "5678",
    "startTime": "10:00",
    "endTime": "18:00",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

## DELETE `/api/admin/devices/{id}`

**Authentication:** Admin required

**Response:**

**Success (200):**
```json
{
  "success": true,
  "message": "Device deleted successfully"
}
```

## POST `/api/admin/auth/sign-in`

**Content-Type:** `application/json`

**Fields:**
- `email` (required): Admin email address
- `password` (required): Admin password

**Response:**

**Success (200):**
```json
{
  "success": true,
  "user": {
    "email": "admin@example.com",
    "name": "Admin User"
  }
}
```
*Sets an `admin-session` cookie for authentication*

**Error (401):**
```json
{
  "error": "Invalid credentials"
}
```

## DELETE `/api/admin/auth/sign-in`

**Description:** Signs out the admin user by clearing the session cookie.

**Response:**

**Success (200):**
```json
{
  "success": true
}
```

## GET `/api/admin/session`

**Description:** Checks if there's an active admin session.

**Response:**

**With active session (200):**
```json
{
  "session": {
    "user": {
      "email": "admin@example.com",
      "name": "Admin User",
      "id": 1
    }
  },
  "user": {
    "email": "admin@example.com",
    "name": "Admin User",
    "id": 1
  }
}
```

**No session (200):**
```json
{
  "session": null,
  "user": null
}
```

## GET `/api/admin/activities`

**Authentication:** Admin required

**Query Parameters:**
- `limit` (optional): Number of activities to return (default: 50)
- `offset` (optional): Number of activities to skip (default: 0)
- `entityType` (optional): Filter by entity type (e.g., "frame", "icon", "device")
- `action` (optional): Filter by action type (e.g., "created", "updated", "deleted")

**Response:**

**Success (200):**
```json
{
  "data": [
    {
      "id": 1,
      "entityType": "frame",
      "entityId": 1,
      "action": "created",
      "description": "Frame created",
      "metadata": {
        "name": "Classic Frame"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0
  }
}
```