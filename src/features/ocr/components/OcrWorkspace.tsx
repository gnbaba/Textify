import React, { useState } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { useOcrProcessor } from '../hooks/useOcrProcessor';
import { tesseractOcrService } from '../services/tesseractOcrService';

export const OcrWorkspace = () => {
  const { status, text, error, progress, process } = useOcrProcessor(tesseractOcrService);
  
  // Local state just for the "Copied!" button animation
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset button after 2 seconds
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. The Input */}
      <ImageDropzone onImageCaptured={process} />

      {/* 2. The Progress Bar (Replacing the basic loading text) */}
      {status === 'loading' && (
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-center text-sm font-medium text-gray-700">
            <span>{progress === 0 ? 'Booting WebAssembly Engine...' : 'Extracting Text...'}</span>
            <span className="text-blue-600 font-bold">{progress}%</span>
          </div>
          {/* The visual bar */}
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 3. The Error State */}
      {status === 'error' && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
          <p className="font-semibold mb-1">Processing Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* 4. The Success State */}
      {status === 'success' && (
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Extracted Text</h3>
            
            <button 
              onClick={handleCopy}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                copied 
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200 border'
              }`}
            >
              {copied ? '✓ Copied to Clipboard' : 'Copy Text'}
            </button>
            
          </div>
          <textarea 
            className="w-full h-64 p-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            value={text}
            readOnly
          />
        </div>
      )}
    </div>
  );
};