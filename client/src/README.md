# Client Project Structure

This document outlines the refactored project structure following Vue 3 + Nuxt 3 + Pinia best practices.

## 📁 Directory Structure

```
src/
├── composables/          # Reusable composable hooks
│   ├── useApi.ts        # API communication layer
│   ├── useFileUpload.ts # File upload business logic
│   └── useFileUtils.ts  # File utility functions
├── components/          # Vue components
│   ├── file-upload/     # File upload components
│   ├── header.vue       # App header
│   └── footer.vue       # App footer
├── stores/              # Pinia stores
│   └── use-upload-file.ts # File upload state management
├── types/               # TypeScript type definitions
│   └── file.ts          # File-related types
├── pages/               # Nuxt pages
└── assets/              # Static assets
```

## 🏗️ Architecture Overview

### 1. **Composables (Hooks)**

Composables provide reusable business logic and state management:

- **`useApi.ts`**: Handles all API communication
- **`useFileUpload.ts`**: Main file upload business logic hook
- **`useFileUtils.ts`**: File validation, preview generation, and utilities

### 2. **Stores (State Management)**

Pure Pinia stores with state, getters, and actions:

- **`use-upload-file.ts`**: Centralized file upload state management
- Uses pure Pinia structure (state, getters, actions)
- Handles file queuing, upload progress, and error states

### 3. **Types (Type Safety)**

Centralized TypeScript definitions:

- **`file.ts`**: All file-related types and interfaces
- Shared across composables, stores, and components

### 4. **Components (UI Layer)**

Vue components focused on presentation:

- **`file-upload/`**: Modular file upload components
- **`basic.vue`**: Main file upload interface
- Uses composables for business logic

## 🔄 Data Flow

```
Component → useFileUpload Hook → Store → useApi → Server
     ↑                                    ↓
     └─────────────── State ←─────────────┘
```

## 📋 Best Practices Implemented

### 1. **Separation of Concerns**

- **UI Logic**: Components handle presentation only
- **Business Logic**: Composables handle business rules
- **State Management**: Stores handle global state
- **API Layer**: Dedicated API composable

### 2. **Type Safety**

- Centralized type definitions
- Proper TypeScript integration
- Type-safe API responses

### 3. **Reusability**

- Modular composables
- Shared utilities
- Consistent interfaces

### 4. **Performance**

- Memoized getters
- Optimized state updates
- Efficient file handling

### 5. **Error Handling**

- Centralized error management
- User-friendly error messages
- Proper error states

## 🚀 Usage Examples

### Using the File Upload Hook

```typescript
const {
  uploadedFiles,
  queuedFiles,
  isUploading,
  addFiles,
  uploadFiles,
  deleteFile,
} = useFileUpload();
```

### Using File Utilities

```typescript
const { validateFile, generatePreview, formatFileSize, getFileIcon } =
  useFileUtils();
```

### Using the Store Directly

```typescript
const uploadStore = useUploadFile();
await uploadStore.loadFiles();
```

## 🔧 Key Improvements

1. **Removed Redundant Code**: Eliminated duplicate logic across components
2. **Better Organization**: Clear separation between layers
3. **Improved Type Safety**: Centralized type definitions
4. **Enhanced Reusability**: Modular composables and utilities
5. **Better Error Handling**: Centralized error management
6. **Performance Optimization**: Efficient state management and computed properties

## 📝 Migration Notes

- Components now use `useFileUpload` hook instead of direct store access
- File utilities are centralized in `useFileUtils`
- Types are imported from `@/types/file`
- Store follows pure Pinia structure with state, getters, and actions
