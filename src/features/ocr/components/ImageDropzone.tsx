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
    <div className="w-full flex flex-col items-center">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative w-full min-h-[18rem] md:h-64 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 ease-in-out ${
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
            <div className="absolute inset-0 bg-[#4D694E] bg-opacity-0 group-hover:bg-opacity-80 transition-all duration-200 flex items-center justify-center">
              <p className="text-[#FFF3D5] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-md">
                Tap or click to replace
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 pointer-events-none">
            <svg className="mx-auto h-16 w-16 md:h-12 md:w-12 text-[#4D694E]/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="text-sm font-medium text-[#4D694E]/80">
              <p className="md:hidden text-lg text-[#4D694E] font-extrabold tracking-tight">
                Tap here to scan document
              </p>
              <p className="hidden md:block">
                <span className="text-[#4D694E] font-bold hover:opacity-80">Click to upload</span>, drag and drop, or paste (Ctrl+V)
              </p>
            </div>
            <p className="mt-2 text-xs text-[#4D694E]/50">Supports PNG, JPG, WEBP</p>
          </div>
        )}
      </div>
      
      {/* Security Reassurance Text */}
      <div className="mt-3 flex items-center gap-1.5 text-xs text-[#4D694E]/60 font-medium">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Images are processed securely on your device and are never stored.</span>
      </div>
    </div>
  );
};