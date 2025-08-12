import { ref } from 'vue';

export const useFileUtils = () => {
  const isGeneratingPreview = ref(false);

  // File validation
  const validateFile = (file: File): FileValidationResult => {
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 10MB',
      };
    }

    // Check file type (optional - you can customize this)
    const allowedTypes = [
      'image/',
      'application/pdf',
      'text/',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const isAllowedType = allowedTypes.some(
      (type) => file.type.startsWith(type) || file.type === type,
    );

    if (!isAllowedType) {
      return {
        isValid: false,
        error: 'File type not supported',
      };
    }

    return { isValid: true };
  };

  // Generate preview for images
  const generatePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        isGeneratingPreview.value = true;
        const reader = new FileReader();
        reader.onload = (e) => {
          isGeneratingPreview.value = false;
          resolve(e.target?.result as string);
        };
        reader.onerror = () => {
          isGeneratingPreview.value = false;
          resolve('');
        };
        reader.readAsDataURL(file);
      } else {
        resolve('');
      }
    });
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Generate unique file name
  const generateUniqueFileName = (originalName: string): string => {
    const nameParts = originalName.split('.');
    const ext = nameParts.pop();
    const baseName = nameParts.join('.');
    return `${baseName}_${Date.now()}.${ext}`;
  };

  // Get file icon based on type
  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'i-heroicons-photo';
    if (mimeType === 'application/pdf') return 'i-heroicons-document-text';
    if (mimeType.startsWith('text/')) return 'i-heroicons-document';
    if (mimeType.includes('word')) return 'i-heroicons-document-text';
    return 'i-heroicons-document';
  };

  // Validate multiple files
  const validateFiles = (files: File[]): FileValidationResult[] => {
    return files.map(validateFile);
  };

  // Check if all files are valid
  const areAllFilesValid = (files: File[]): boolean => {
    return files.every((file) => validateFile(file).isValid);
  };

  return {
    isGeneratingPreview,
    validateFile,
    validateFiles,
    areAllFilesValid,
    generatePreview,
    formatFileSize,
    generateUniqueFileName,
    getFileIcon,
  };
};
