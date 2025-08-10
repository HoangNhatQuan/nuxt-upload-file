# File Upload Client

A modern file upload application built with Nuxt 3, featuring a comprehensive upload flow with drag-and-drop support, file queuing, and real-time progress tracking.

## Features

### 🚀 **Complete Upload Flow**

1. **Pre-upload Check**: Display existing files with thumbnails and type icons
2. **File Selection**: Drag-and-drop or "Choose files" with staging area
3. **Explicit Upload**: Manual upload button with per-file progress
4. **File Management**: Preview, download, and delete uploaded files

### 📁 **Universal File Support**

- **Images**: JPEG, PNG, GIF, WebP, HEIC
- **Videos**: MP4, AVI, MOV, WebM, and more
- **Audio**: MP3, WAV, AAC, FLAC, and more
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Archives**: ZIP, RAR, 7Z, TAR, GZ
- **All other file types** supported

### 🎯 **Key Features**

- **Drag & Drop**: Intuitive file selection with visual feedback
- **File Queue**: Stage multiple files before uploading
- **Progress Tracking**: Real-time upload progress with speed and time estimates
- **File Previews**: Image thumbnails and type-specific icons
- **Duplicate Handling**: Automatic naming conflict resolution
- **Error Handling**: Comprehensive error messages and retry options
- **Responsive Design**: Works on desktop and mobile devices

### 🔧 **Technical Features**

- **Server API Integration**: Uses Express.js backend API
- **TypeScript**: Full type safety and IntelliSense
- **Vue 3 Composition API**: Modern reactive state management
- **Pinia Store**: Centralized state management
- **Tailwind CSS**: Utility-first styling
- **Nuxt UI**: Pre-built components and design system

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Environment Setup

1. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Configure API URL** (if needed):
   ```bash
   # Default: http://localhost:3001/api
   API_BASE_URL=http://localhost:3001/api
   ```

### Installation

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Start the development server**:

   ```bash
   pnpm run dev
   ```

3. **Start the backend server** (in a separate terminal):

   ```bash
   cd ../server
   npm start
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Uploading Files

1. **Select Files**:

   - Drag and drop files onto the upload area
   - Or click "Choose files" to browse
   - Multiple files can be selected at once

2. **Review Queue**:

   - Files appear in the staging area
   - Preview images and file information
   - Remove individual files or clear all

3. **Upload**:
   - Click the "Upload" button to start
   - Watch real-time progress for each file
   - Files are uploaded sequentially

### Managing Files

- **View**: Click the eye icon to preview images
- **Download**: Files are served directly from the server
- **Delete**: Click the trash icon to remove files
- **Refresh**: Click the refresh button to reload the file list

## API Integration

The client communicates with the Express.js backend API:

- `GET /api/files` - List all uploaded files
- `POST /api/upload` - Upload a new file
- `DELETE /api/files/:filename` - Delete a file
- `GET /api/files/:filename` - Download/view a file

## File Constraints

- **Maximum file size**: 50MB per file
- **Supported formats**: All file types
- **Storage**: Files stored on server filesystem
- **Security**: File type validation and size limits

## Development

### Project Structure

```
src/
├── components/file-upload/
│   ├── basic.vue          # Basic upload interface
│   ├── dialog.vue         # Modal upload interface
│   ├── file-queue.vue     # File staging area
│   ├── uploaded-list.vue  # File management list
│   └── uploader.vue       # Drag & drop uploader
├── lib/
│   └── api.ts            # API service
├── stores/
│   └── use-upload-file.ts # Upload state management
└── pages/
    └── index.vue         # Main application page
```

### Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Run ESLint
- `pnpm run lint:fix` - Fix ESLint errors

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - see LICENSE file for details
