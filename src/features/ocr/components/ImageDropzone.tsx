import React, { useState, useCallback, useEffect, useRef } from 'react';

export interface ImageDropzoneProps {
  onImageCaptured: (file: File) => void;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onImageCaptured }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    setPreviewUrl(URL.createObjectURL(file));
    onImageCaptured(file);
  }, [onImageCaptured]);

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
  }, [handleFile]);

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        handleFile(e.clipboardData.files[0]);
      }
    };
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [handleFile]);

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
          ? 'border-[#4D694E] bg-[#FFF3D5]/50' 
          : 'border-[#4D694E]/30 bg-[#FFF3D5]/10 hover:bg-[#FFF3D5]/40'
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
        <div className="relative w-full h-full group">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-full object-contain p-2"
          />
          {/* Olive Green Hover Overlay */}
          <div className="absolute inset-0 bg-[#4D694E] bg-opacity-0 group-hover:bg-opacity-80 transition-all duration-200 flex items-center justify-center">
            <p className="text-[#FFF3D5] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-md">
              Click or drag to replace
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center p-6 pointer-events-none">
          <svg className="mx-auto h-12 w-12 text-[#4D694E]/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium text-[#4D694E]/80">
            <span className="text-[#4D694E] font-bold hover:opacity-80">Click to upload</span>, drag and drop, or paste (Ctrl+V)
          </p>
          <p className="mt-1 text-xs text-[#4D694E]/50">Supports PNG, JPG, WEBP, GIF</p>
        </div>
      )}
    </div>
  );
};