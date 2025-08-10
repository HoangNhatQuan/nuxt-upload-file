# File Upload Server with Supabase Storage

A Node.js/Express server that handles file uploads using Supabase cloud storage.

## Features

- **Supabase Cloud Storage**: All files are stored in Supabase storage buckets
- **Signed URLs**: Secure file access with time-limited signed URLs
- **File Management**: Upload, list, and delete files with pagination
- **Security**: Private buckets with server-side URL generation
- **Rate Limiting**: Built-in rate limiting for uploads and API requests
- **Validation**: File type and size validation

## Prerequisites

- **Node.js 20 or later** (required for Supabase SDK compatibility)
- npm or yarn

## Setup

### 1. Check Node.js Version

```bash
npm run check:node
```

### 2. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file based on `env.example`:

```bash
cp env.example .env
```

Fill in your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_BUCKET=files

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 3. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Storage in your Supabase dashboard
3. Create a new bucket named `files` (or update `SUPABASE_BUCKET` in your `.env`)
4. Set the bucket to **private** (important for security)
5. Copy your project URL and service role key to the `.env` file

### 4. Bucket Policies (Important for RLS)

If you have Row-Level Security (RLS) enabled on your bucket, you need to configure policies. **For server-side operations, you have two options:**

#### Option A: Disable RLS (Recommended for server-only access)

1. Go to your Supabase dashboard → Storage → Buckets
2. Click on your bucket (e.g., `files`)
3. Toggle off "Row Level Security (RLS)"

#### Option B: Configure RLS Policies (If you want RLS enabled)

Run these SQL commands in your Supabase SQL editor:

```sql
-- Allow service role to bypass RLS (required for server operations)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (bypasses RLS)
CREATE POLICY "Service role bypass" ON storage.objects
FOR ALL USING (auth.role() = 'service_role');

-- Optional: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Optional: Allow authenticated users to view files
CREATE POLICY "Allow authenticated reads" ON storage.objects
FOR SELECT USING (auth.role() = 'authenticated');

-- Optional: Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (auth.role() = 'authenticated');
```

**Note**: The service role key bypasses RLS by default, but if you have custom policies, you need to explicitly allow the service role.

## API Endpoints

### Upload File

```
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: File (required)
- description: string (optional)
```

Response:

```json
{
  "message": "File uploaded successfully",
  "file": {
    "filename": "anonymous/2024/01/uuid.ext",
    "originalName": "example.jpg",
    "size": 12345,
    "mimetype": "image/jpeg",
    "uploadDate": "2024-01-15T10:30:00.000Z",
    "description": "My file description",
    "url": "https://signed-url..."
  }
}
```

### List Files

```
GET /api/files?prefix=&limit=&offset=

Query Parameters:
- prefix: string (optional) - Filter by prefix
- limit: number (optional, default: 50) - Number of files to return
- offset: number (optional, default: 0) - Pagination offset
```

Response:

```json
{
  "files": [
    {
      "filename": "anonymous/2024/01/uuid.ext",
      "originalName": "example.jpg",
      "size": 12345,
      "mimetype": "image/jpeg",
      "uploadDate": "2024-01-15T10:30:00.000Z",
      "description": "My file description",
      "url": "https://signed-url..."
    }
  ],
  "total": 1,
  "nextOffset": 1
}
```

### Get File URL

```
GET /api/files/:key/url?expiresIn=

Query Parameters:
- expiresIn: number (optional, default: 900) - URL expiration time in seconds
```

Response:

```json
{
  "url": "https://signed-url..."
}
```

### Delete Files

```
DELETE /api/files
Content-Type: application/json

Body:
{
  "keys": ["key1", "key2", "key3"]
}
```

Response:

```json
{
  "message": "Files processed",
  "results": [
    {
      "key": "key1",
      "success": true,
      "error": null
    }
  ]
}
```

### Delete Single File (Legacy)

```
DELETE /api/files/:key
```

Response:

```json
{
  "message": "File deleted successfully"
}
```

## File Storage Strategy

Files are stored using a hierarchical key structure:

```
{userId}/{year}/{month}/{uuid}.{extension}
```

Example: `anonymous/2024/01/abc123-def456-ghi789.jpg`

This provides:

- **Organization**: Files are grouped by user and date
- **Uniqueness**: UUID ensures no filename conflicts
- **Scalability**: Hierarchical structure supports large volumes
- **Security**: No predictable file paths

## Security Features

- **Private Buckets**: All storage buckets are private
- **Signed URLs**: File access requires server-generated signed URLs
- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: File type and size validation
- **Path Traversal Protection**: Prevents directory traversal attacks

## Development

```bash
# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

| Variable                    | Description               | Default       |
| --------------------------- | ------------------------- | ------------- |
| `SUPABASE_URL`              | Your Supabase project URL | Required      |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Required      |
| `SUPABASE_BUCKET`           | Storage bucket name       | `files`       |
| `PORT`                      | Server port               | `3001`        |
| `NODE_ENV`                  | Environment mode          | `development` |

## Recent Fixes and Improvements

### Fixed Issues

1. **MulterError: Unexpected field** - Fixed field name compatibility issue
   - The server now accepts both `'file'` (single) and `'files'` (multiple) field names
   - This ensures compatibility with different client implementations

2. **File size limits** - Updated to support 50MB files as required
   - Increased multer file size limit to 50MB
   - Updated express body parser limits to handle larger requests
   - Added field size limit for form data

3. **Enhanced error handling** - Better error messages and validation
   - More descriptive error messages for upload failures
   - Improved file type validation with comprehensive MIME type support
   - Better handling of edge cases

### Supported File Types

The server now supports a comprehensive range of file types:

- **Images**: JPEG, PNG, GIF, WebP, SVG, BMP, TIFF, ICO
- **Videos**: MP4, AVI, MOV, WMV, FLV, WebM, MKV, 3GP, OGG, M4V
- **Audio**: MP3, WAV, OGG, AAC, FLAC, WMA, M4A, Opus
- **Documents**: PDF, Word, Excel, PowerPoint, TXT, CSV, RTF, JSON, XML, ZIP, RAR, 7Z

### Testing

Run the test suite to verify functionality:

```bash
# Test Supabase connection
npm run test:supabase

# Test upload functionality
npm run test:upload
```

## Migration from Local Storage

```javascript
const fs = require("fs-extra");
const path = require("path");
const { uploadFile } = require("./storage");

async function migrateFiles() {
  const uploadsDir = path.join(__dirname, "uploads");
  const files = await fs.readdir(uploadsDir);

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const stats = await fs.stat(filePath);

    // Create a file object compatible with multer
    const fileObj = {
      originalname: file,
      buffer: await fs.readFile(filePath),
      size: stats.size,
      mimetype: "application/octet-stream", // You might want to detect this
    };

    try {
      await uploadFile({
        file: fileObj,
        contentType: fileObj.mimetype,
        description: "Migrated from local storage",
      });
      console.log(`Migrated: ${file}`);
    } catch (error) {
      console.error(`Failed to migrate ${file}:`, error);
    }
  }
}

migrateFiles();
```

## Troubleshooting

### Node.js Version Issues

If you see a deprecation warning about Node.js 18 or below:

1. **Check your Node.js version**:

   ```bash
   node --version
   ```

2. **Upgrade Node.js** (choose one method):

   **Using nvm (recommended)**:

   ```bash
   nvm install 20
   nvm use 20
   ```

   **Using NodeSource**:

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

   **Download from nodejs.org**:
   Visit [nodejs.org](https://nodejs.org) and download Node.js 20 LTS

3. **Verify the upgrade**:
   ```bash
   npm run check:node
   ```

### Supabase Connection Issues

If you encounter connection problems:

1. Verify your environment variables are set correctly
2. Ensure your Supabase project is active
3. Check that the bucket exists and is private
4. Run the test script: `npm run test:supabase`

### RLS Policy Errors

If you see "new row violates row-level security policy" errors:

1. **Check if RLS is enabled** on your bucket in Supabase dashboard
2. **Option A**: Disable RLS on the bucket (easiest solution)
3. **Option B**: Add the service role policy from the setup instructions above
4. **Verify service role key**: Ensure you're using the service role key, not the anon key
5. **Test again**: Run `npm run test:supabase` after making changes

## License

MIT
