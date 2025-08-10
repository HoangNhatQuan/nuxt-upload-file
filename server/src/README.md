# Express.js Server - Structured Architecture

This Express.js server follows best practices with a modular, scalable architecture.

## Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.js   # Database connection and settings
│   └── upload.js     # Upload configuration and file type definitions
├── controllers/      # Request handlers and business logic
│   └── fileController.js
├── middlewares/      # Reusable middleware functions
│   ├── errorHandler.js
│   ├── upload.js     # Multer configuration
│   └── validation.js # Request validation
├── models/           # Data models and database operations
│   └── file.js
├── routes/           # Route definitions
│   ├── api/
│   │   └── files.js  # File-related routes
│   └── index.js      # Main routes index
├── utils/            # Utility functions
│   └── security.js   # Security utilities
├── app.js            # Express app configuration
└── server.js         # Server entry point
```

## Architecture Principles

### 1. Separation of Concerns

- **Models**: Handle data logic and database interactions
- **Controllers**: Process requests, interact with models, send responses
- **Routes**: Define API endpoints and map to controllers
- **Middleware**: Handle cross-cutting concerns (auth, validation, error handling)

### 2. Modular Design

- Each module has a single responsibility
- Clear interfaces between modules
- Easy to test and maintain

### 3. Configuration Management

- Environment-specific configurations
- Centralized settings
- Easy to modify for different environments

## Key Features

### Security

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation
- File type validation
- Directory traversal protection

### Error Handling

- Centralized error handling middleware
- Consistent error responses
- Development vs production error details

### File Upload

- Support for multiple file uploads
- File type validation
- Size limits
- Checksum calculation
- Supabase storage integration

## API Endpoints

### Health & Configuration

- `GET /api/health` - Server health check
- `GET /api/upload/config` - Upload configuration

### File Operations

- `GET /api/files` - List files with pagination
- `POST /api/upload` - Upload multiple files
- `POST /api/upload/single` - Upload single file (legacy)
- `GET /api/files/:key/url` - Get signed URL
- `DELETE /api/files` - Delete multiple files
- `DELETE /api/files/:key` - Delete single file (legacy)

## Development

### Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

### Environment Variables

Create a `.env` file with:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET=your_bucket_name
CLOUD_MAX_FILE_BYTES=52428800
NODE_ENV=development
PORT=3001
```

## Testing

- `npm run test:supabase` - Test Supabase connection
- `npm run test:upload` - Test file upload functionality

## Best Practices Implemented

1. **Environment Variables**: Using dotenv for configuration
2. **Error Handling**: Centralized error handling with proper HTTP status codes
3. **Validation**: Input validation using express-validator
4. **Security**: Helmet, CORS, rate limiting, file validation
5. **Modularity**: Clear separation of concerns
6. **Documentation**: Comprehensive code comments and structure
7. **Testing**: Separate test files for different functionalities
