import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, ShieldCheck } from 'lucide-react';

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
        className={`group relative w-full min-h-[18rem] md:h-64 border border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 ease-in-out ${
          isDragging 
            ? 'border-[#214C3A] bg-[#214C3A]/5' 
            : 'border-[#20251F]/25 bg-[#FFFDF7] hover:border-[#20251F]/60 hover:bg-[#FFFDF7]'
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
            <div className="absolute inset-0 bg-[#20251F]/85 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
              <p className="text-[#FFFDF7] font-bold text-xs uppercase tracking-widest">
                [ CLICK TO REPLACE IMAGE ]
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 pointer-events-none">
            <Upload className="mx-auto h-10 w-10 text-[#20251F]/40 group-hover:text-[#214C3A] mb-3 transition-colors" />
            <div className="text-sm font-medium text-[#20251F]/80">
              <p className="md:hidden text-base text-[#20251F] font-black uppercase tracking-tight">
                TAP HERE TO SCAN GRAPHIC
              </p>
              <p className="hidden md:block text-xs uppercase tracking-wide font-extrabold text-[#20251F]/80">
                <span className="text-[#20251F] border-b border-[#20251F]/40 group-hover:border-[#20251F]">CLICK TO UPLOAD</span>, DRAG AND DROP, OR PASTE (CTRL+V)
              </p>
            </div>
            <p className="mt-2.5 text-[10px] font-bold text-[#20251F]/40 tracking-wider uppercase">SUPPORTS: PNG &bull; JPG &bull; WEBP</p>
          </div>
        )}
      </div>
      
      {/* Security Reassurance Text */}
      <div className="mt-3 flex items-center gap-1.5 text-[9px] text-[#20251F]/60 font-bold uppercase tracking-wider">
        <ShieldCheck className="w-3.5 h-3.5 text-[#214C3A]" />
        <span>SECURE LOCAL SCANNING PROTOCOL ACTIVE &bull; IMAGES ARE NEVER LOGGED</span>
      </div>
    </div>
  );
};