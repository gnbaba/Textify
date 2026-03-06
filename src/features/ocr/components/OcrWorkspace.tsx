import React from 'react';
import { ImageDropzone } from './ImageDropzone';
import { useOcrProcessor } from '../hooks/useOcrProcessor';
import { tesseractOcrService } from '../services/tesseractOcrService';
// Assuming you have a TextResultEditor, or we can just use a simple div for now
// import TextResultEditor from './TextResultEditor'; 

export const OcrWorkspace = () => {
  // We inject the concrete Tesseract singleton into our decoupled hook right here
  const { status, text, error, process } = useOcrProcessor(tesseractOcrService);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. The Input */}
      <ImageDropzone onImageCaptured={process} />

      {/* 2. The Loading State */}
      {status === 'loading' && (
        <div className="p-4 bg-blue-50 text-blue-700 rounded-lg animate-pulse">
          <p className="font-semibold">Booting up WebAssembly Engine & Extracting Text...</p>
        </div>
      )}

      {/* 3. The Error State */}
      {status === 'error' && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* 4. The Success State */}
      {status === 'success' && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Extracted Text:</h3>
          <textarea 
            className="w-full h-64 p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            value={text}
            readOnly
          />
        </div>
      )}
    </div>
  );
};