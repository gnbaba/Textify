import React, { useState, useCallback, useEffect, useRef } from 'react';
import { UploadSimple, LockKey } from '@phosphor-icons/react';

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
    <div className="w-full flex flex-col items-center font-mono-industrial">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative w-full min-h-[18rem] md:h-64 border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 ease-in-out ${
          isDragging 
            ? 'border-[#4D694E] bg-[#FFF3D5]/50' 
            : 'border-[#4D694E] bg-[#FFF3D5]/10 hover:bg-[#FFF3D5]/35'
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
              className="w-full h-full object-contain p-3"
            />
            <div className="absolute inset-0 bg-[#4D694E]/90 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
              <p className="text-[#FFF3D5] font-bold text-xs uppercase tracking-widest">
                [ CLICK TO REPLACE IMAGE ]
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 pointer-events-none">
            <UploadSimple className="mx-auto h-12 w-12 text-[#4D694E]/40 mb-4" weight="bold" />
            <div className="text-sm font-medium text-[#4D694E]/80">
              <p className="md:hidden text-base text-[#4D694E] font-black uppercase tracking-tight">
                TAP HERE TO SCAN GRAPHIC
              </p>
              <p className="hidden md:block text-xs uppercase tracking-wide font-extrabold">
                <span className="text-[#4D694E] border-b border-[#4D694E]">CLICK TO UPLOAD</span>, DRAG AND DROP, OR PASTE (CTRL+V)
              </p>
            </div>
            <p className="mt-2.5 text-[10px] font-bold text-[#4D694E]/40 tracking-wider uppercase">SUPPORTS: PNG, JPG, WEBP</p>
          </div>
        )}
      </div>
      
      {/* Security Reassurance Text */}
      <div className="mt-3 flex items-center gap-1.5 text-[9px] text-[#4D694E]/60 font-bold uppercase tracking-wider">
        <LockKey className="w-3.5 h-3.5" weight="bold" />
        <span>SECURE LOCAL SCANNING PROTOCOL ACTIVE /// IMAGES ARE NEVER LOGGED</span>
      </div>
    </div>
  );
};