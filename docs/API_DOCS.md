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