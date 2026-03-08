import React, { useState, useCallback, useEffect, useRef } from 'react';

export interface ImageDropzoneProps {
  onImageCaptured: (file: File) => void;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onImageCaptured }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PRO MOVE: Clean up the object URL to prevent memory leaks!
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    // Set the visual preview
    setPreviewUrl(URL.createObjectURL(file));
    // Send it to the brain
    onImageCaptured(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [onImageCaptured]);

  const onPaste = useCallback((e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      handleFile(e.clipboardData.files[0]);
    }
  }, [onImageCaptured]);

  // Attach paste listener to the window so the user can paste anywhere
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        handleFile(e.clipboardData.files[0]);
      }
    };
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative w-full h-64 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 ease-in-out ${
        isDragging 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileInputChange}
        accept="image/*"
        className="hidden"
      />

      {previewUrl ? (
        // Preview State
        <div className="relative w-full h-full group">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-full object-contain p-2"
          />
          {/* Hover Overlay to let users know they can replace it */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
            <p className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-md">
              Click or drag to replace
            </p>
          </div>
        </div>
      ) : (
        // Empty State
        <div className="text-center p-6 pointer-events-none">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium text-gray-700">
            <span className="text-blue-600 hover:text-blue-500">Click to upload</span>, drag and drop, or paste (Ctrl+V)
          </p>
          <p className="mt-1 text-xs text-gray-500">Supports PNG, JPG, WEBP, GIF</p>
        </div>
      )}
    </div>
  );
};