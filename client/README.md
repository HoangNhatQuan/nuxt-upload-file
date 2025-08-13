# File Upload Application

A complete web application for secure file uploads built with modern technologies. This project demonstrates best practices in full-stack development with a focus on security, user experience, and code quality.

## 🚀 Features

### Frontend (Nuxt.js)

- ✅ Modern, responsive Material Design UI
- ✅ Drag and drop file upload
- ✅ Real-time upload progress tracking
- ✅ Image preview and gallery view
- ✅ File management (view, download, delete)
- ✅ Toast notifications for user feedback
- ✅ Mobile-friendly responsive design
- ✅ Client-side file validation

### Backend (Express.js)

- ✅ Secure file upload with validation
- ✅ Image file type filtering
- ✅ File size limits (5MB)
- ✅ Rate limiting protection
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Directory traversal protection
- ✅ Comprehensive error handling
- ✅ RESTful API design

### Security Features (OWASP Compliance)

- ✅ Input validation and sanitization
- ✅ File type and size restrictions
- ✅ Rate limiting to prevent abuse
- ✅ Security headers (XSS protection)
- ✅ CORS protection
- ✅ Secure file handling
- ✅ Error handling without information leakage

## 🛠️ Technology Stack

### Frontend

- **Nuxt.js** - Vue.js framework for server-side rendering
- **Vuetify.js** - Material Design component library
- **Axios** - HTTP client for API communication
- **SCSS** - CSS preprocessor for styling

### Backend

- **Express.js** - Node.js web framework
- **Multer** - File upload middleware
- **Helmet** - Security headers middleware
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Rate limiting protection
- **Express Validator** - Input validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd assignment-kinobi
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the development server
npm run dev
```

The backend will be running on `http://localhost:3001`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to client directory
cd client

# Install dependencies
yarn install

# Start the development server
yarn run dev
```

The frontend will be running on `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
assignment-kinobi/                
/server/src/           # Backend (Express.js)
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

/client/src/                    # Frontend (Nuxt.js)
├── components/file-upload/
│   ├── basic.vue          # Basic upload interface
│   ├── dialog.vue         # Modal upload interface
│   ├── file-queue.vue     # File staging area
│   ├── uploaded-list.vue  # File management list
│   └── uploader.vue       # Drag & drop uploader
├── stores/
│   └── use-upload-file.ts # Upload state management
└── pages/
    └── index.vue         # Main application page
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env in server directory)

```env
PORT=3001
NODE_ENV=development
```

#### Frontend (.env in client directory)

```env
NODE_ENV=development
```

### API Configuration

The frontend is configured to connect to the backend at `http://localhost:3001`. For production, update the `baseURL` in `client/nuxt.config.js`.

## 📖 API Documentation

### Endpoints

| Method | Endpoint               | Description            |
| ------ | ---------------------- | ---------------------- |
| GET    | `/api/health`          | Health check           |
| GET    | `/api/files`           | Get all uploaded files |
| POST   | `/api/upload`          | Upload a new file      |
| GET    | `/api/files/:filename` | Get a specific file    |
| DELETE | `/api/files/:filename` | Delete a file          |

### File Upload Limits

- **File Size**: Maximum 5MB
- **File Types**: JPEG, JPG, PNG, GIF, WebP, Audio, doc/pdf, video/*
- **Files per Request**: 1 file or multi files
- **Rate Limit**: 10 uploads per 15 minutes per IP

## 🚀 Production Deployment

### Backend Deployment

1. Set `NODE_ENV=production`
2. Configure CORS origins for your domain
3. Use a reverse proxy (nginx) for static file serving
4. Implement proper logging
5. Use HTTPS
6. Consider using a CDN for file serving

### Frontend Deployment

1. Update API base URL in `nuxt.config.js`
2. Set `NODE_ENV=production`
3. Build the application: `npm run build`
4. Deploy the generated files to your hosting provider

### Recommended Hosting

- **Backend**: Heroku, AWS EC2, DigitalOcean
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront

## 🔒 Security Features

This application implements several security measures to protect against common web vulnerabilities:

1. **Input Validation**: All inputs are validated and sanitized
2. **File Upload Security**: Secure file handling with type and size restrictions
3. **Rate Limiting**: Prevents abuse and DoS attacks
4. **Security Headers**: Helmet.js for XSS and other header-based attacks
5. **CORS Protection**: Configured for specific origins
6. **Error Handling**: Secure error messages without information leakage

## 🧪 Testing

### Manual Testing Checklist

- [ ] File upload with different image types
- [ ] File size validation (try files > 5MB)
- [ ] File type validation (try non-image files)
- [ ] Drag and drop functionality
- [ ] Upload progress tracking
- [ ] File preview and download
- [ ] File deletion with confirmation
- [ ] Responsive design on mobile devices
- [ ] Error handling for network issues

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**

   - Ensure backend CORS is configured for `http://localhost:3000`
   - Check that both servers are running

2. **File Upload Fails**

   - Verify file size is under 5MB
   - Ensure file is an image (JPEG, PNG, GIF, WebP)
   - Check browser console for error messages

3. **API Connection Issues**

   - Verify backend server is running on port 3001
   - Check network requests in browser dev tools

4. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Ensure Node.js version is 14 or higher

## 📝 Development Guidelines

### Code Style

- Follow Vue.js style guide for frontend
- Use ESLint for code quality
- Implement proper error handling
- Add loading states for async operations

### Best Practices

- Use Vuetify components for consistency
- Implement proper validation
- Add comprehensive error handling
- Test on multiple devices and browsers
- Follow security best practices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Nuxt.js team for the amazing framework
- Vuetify team for the Material Design components
- Express.js community for the robust backend framework
- OWASP for security guidelines and best practices
