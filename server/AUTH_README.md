# Authentication System Implementation

This document describes the authentication system implemented for the file upload server, adding user-scoped file management with MongoDB and Supabase.

## Features Implemented

### ✅ Completed Features

- [x] **MongoDB Connection** - Secure connection with environment variable validation
- [x] **User Model** - Mongoose schema with username, passwordHash, and files array
- [x] **Authentication Routes** - `/auth/signup` and `/auth/signin` endpoints
- [x] **Password Security** - bcrypt hashing with 12 salt rounds
- [x] **User-Scoped File Operations** - Upload, list, delete files per user
- [x] **Validation Middleware** - Username presence and format validation
- [x] **Error Handling** - Centralized error responses
- [x] **Rate Limiting** - Separate limits for auth and file operations
- [x] **Supabase Integration** - File storage with user verification

## Environment Variables

Add these to your `.env` file:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fileupload?retryWrites=true&w=majority

# Existing Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET=your_bucket_name
```

## API Endpoints

### Authentication

#### `POST /api/auth/signup`

Create a new user account.

**Request:**

```json
{
  "username": "alice",
  "password": "StrongPass123"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "username": "alice"
  },
  "message": "User created successfully"
}
```

#### `POST /api/auth/signin`

Authenticate existing user.

**Request:**

```json
{
  "username": "alice",
  "password": "StrongPass123"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "username": "alice"
  },
  "message": "Authentication successful"
}
```

### User-Scoped File Operations

All file operations require a `username` parameter (via query, body, or header).

#### `GET /api/files?username=alice`

Get all files for a specific user.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "uuid-here",
        "path": "file-path-in-supabase",
        "bucket": "bucket-name",
        "size": 1024,
        "mimeType": "image/jpeg",
        "name": "photo.jpg",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "urlSigned": "https://signed-url-here"
      }
    ],
    "total": 1
  }
}
```

#### `POST /api/files/upload`

Upload files for a specific user.

**Request:**

```
Content-Type: multipart/form-data
username: alice
files: [file1, file2, ...]
description: Optional description
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "uuid-here",
        "key": "file-path",
        "name": "photo.jpg",
        "size": 1024,
        "contentType": "image/jpeg",
        "urlSigned": "https://signed-url-here"
      }
    ],
    "uploaded": 1,
    "total": 1
  },
  "message": "Successfully uploaded 1 file(s)"
}
```

#### `DELETE /api/files/:id?username=alice`

Delete a specific file for a user.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "deleted": true,
    "fileId": "uuid-here"
  },
  "message": "File deleted successfully"
}
```

#### `GET /api/files/:id/url?username=alice`

Get a signed URL for a specific file.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "url": "https://signed-url-here",
    "expiresIn": 900
  }
}
```

## Security Features

### Password Requirements

- Minimum 8 characters
- Maximum 128 characters
- Must contain at least one letter and one number
- Hashed with bcrypt (12 salt rounds)

### Username Requirements

- 3-50 characters
- Only letters, numbers, underscores, and hyphens
- Unique across the system

### Rate Limiting

- **Authentication**: 5 attempts per 15 minutes per IP
- **File Upload**: 20 uploads per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per IP

### User Scoping

- All file operations require valid username
- Users can only access their own files
- File existence verified in Supabase before returning

## Database Schema

### User Collection

```javascript
{
  username: String (unique, required),
  passwordHash: String (required),
  files: [FileItem],
  createdAt: Date,
  updatedAt: Date
}
```

### FileItem (Embedded in User)

```javascript
{
  id: String (UUID, unique),
  path: String (Supabase path),
  bucket: String (Supabase bucket),
  size: Number,
  mimeType: String,
  name: String,
  createdAt: Date,
  publicURL: String (optional),
  metadata: Object (optional)
}
```

## Error Responses

All endpoints return consistent error formats:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (missing username)
- `404` - Not Found (file not found)
- `409` - Conflict (username already exists)
- `500` - Internal Server Error

## Testing

Run the authentication tests:

```bash
npm run test:auth
```

This will test:

1. User signup
2. User signin
3. Get user files
4. Invalid credentials rejection
5. Missing username rejection

## File Structure

```
src/
├── lib/
│   └── mongodb.js          # MongoDB connection
├── models/
│   ├── file.js            # Existing Supabase file operations
│   └── user.js            # User model with embedded files
├── services/
│   └── userService.js     # User operations and authentication
├── controllers/
│   ├── authController.js  # Authentication endpoints
│   └── userFileController.js # User-scoped file operations
├── routes/
│   ├── auth.js           # Authentication routes
│   └── userFiles.js      # User file routes
├── middlewares/
│   └── auth.js           # Username validation middleware
└── utils/
    └── password.js       # Password hashing utilities
```

## Implementation Notes

### Client-Side Session Management

The server returns only the username after authentication. The client should:

1. Store `sessionStartedAt` timestamp locally
2. Include username in all file operation requests
3. Implement session expiration logic on the client side

### File Verification

When listing files, the system:

1. Retrieves files from MongoDB
2. Verifies each file still exists in Supabase
3. Generates fresh signed URLs
4. Returns only existing files

### Error Handling

- Centralized error middleware
- Consistent error response format
- Proper HTTP status codes
- No sensitive information in error messages

## Next Steps

Potential enhancements:

- JWT token authentication
- Password reset functionality
- User profile management
- File sharing between users
- Advanced file metadata and search
- Bulk file operations
