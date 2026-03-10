import React, { useState, useEffect, useRef } from 'react';
import { ImageDropzone } from './ImageDropzone';
import { useOcrProcessor } from '../hooks/useOcrProcessor';
import { tesseractOcrService } from '../services/tesseractOcrService';
import type { ExtractionMode } from '../types/ocrTypes';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCloudHistory } from '../../history/hooks/useCloudHistory';

export const OcrWorkspace = () => {
  const { status, text, error, progress, process } = useOcrProcessor(tesseractOcrService);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<ExtractionMode>('document');

  
  const { user } = useAuth();
  const { saveExtraction } = useCloudHistory(user?.uid);

  // Use a ref to prevent double-saving the same extraction if React re-renders
  const lastSavedText = useRef<string | null>(null);

  
  useEffect(() => {
    if (status === 'success' && text && text !== lastSavedText.current) {
      if (user) {
        // Title based on the mode user selected
        const title = mode === 'document' ? 'Document Scan' : 'Graphic Scan';
        saveExtraction(text, title);
      }
      lastSavedText.current = text; // Mark as saved
    }
    
    // Reset tracker if we start loading a new image
    if (status === 'loading') {
      lastSavedText.current = null;
    }
  }, [status, text, saveExtraction, user, mode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); 
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* The "Tools" Mode Toggle */}
      <div className="flex justify-center mb-2">
        <div className="bg-[#FFF3D5] p-1 rounded-xl inline-flex shadow-sm border border-[#4D694E]/20">
          <button
            onClick={() => setMode('document')}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
              mode === 'document'
                ? 'bg-[#4D694E] text-white shadow-md'
                : 'text-[#4D694E] hover:bg-[#4D694E]/10'
            }`}
          >
            <span>Document Mode</span>
            <div className={`group relative flex items-center justify-center w-5 h-5 rounded-full border text-xs font-bold ${mode === 'document' ? 'border-white/40 text-white/80' : 'border-[#4D694E]/40 text-[#4D694E]/70'}`}>
              i
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-[#4D694E] text-[#FFF3D5] text-xs p-2.5 rounded-lg shadow-xl z-10 pointer-events-none text-center font-normal leading-relaxed">
                Reads every scattered word. Best for receipts, posters, and standard documents.
                <svg className="absolute text-[#4D694E] h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
              </div>
            </div>
          </button>

          <button
            onClick={() => setMode('graphic')}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
              mode === 'graphic'
                ? 'bg-[#4D694E] text-white shadow-md'
                : 'text-[#4D694E] hover:bg-[#4D694E]/10'
            }`}
          >
            <span>Graphic Mode</span>
            <div className={`group relative flex items-center justify-center w-5 h-5 rounded-full border text-xs font-bold ${mode === 'graphic' ? 'border-white/40 text-white/80' : 'border-[#4D694E]/40 text-[#4D694E]/70'}`}>
              i
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-[#4D694E] text-[#FFF3D5] text-xs p-2.5 rounded-lg shadow-xl z-10 pointer-events-none text-center font-normal leading-relaxed">
                Reads single blocks of text. Best for heavily stylized logos and graphics.
                <svg className="absolute text-[#4D694E] h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
              </div>
            </div>
          </button>
        </div>
      </div>

      <ImageDropzone onImageCaptured={(file) => process(file, mode)} />

      {status === 'loading' && (
        <div className="p-6 bg-[#FFF3D5]/50 border border-[#4D694E]/20 rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-center text-sm font-medium text-[#4D694E]">
            <span>{progress === 0 ? 'Booting WebAssembly Engine...' : 'Extracting Text...'}</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-[#4D694E]/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-[#4D694E] h-3 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
          <p className="font-semibold mb-1">Processing Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="p-6 bg-white border border-[#4D694E]/20 rounded-xl shadow-sm flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-[#4D694E]">Extracted Text</h3>
              {user && <span className="px-2.5 py-1 bg-[#4D694E]/10 text-[#4D694E] text-xs font-bold rounded-full">Saved to Cloud</span>}
            </div>
            
            <button 
              onClick={handleCopy}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                copied 
                  ? 'bg-[#4D694E] text-white'
                  : 'bg-[#FFF3D5] text-[#4D694E] hover:bg-[#4D694E]/10 border-[#4D694E]/20 border'
              }`}
            >
              {copied ? '✓ Copied!' : 'Copy Text'}
            </button>
            
          </div>
          <textarea 
            className="w-full h-64 p-4 text-gray-800 bg-[#FFF3D5]/30 border border-[#4D694E]/20 rounded-lg focus:ring-2 focus:ring-[#4D694E] focus:border-transparent resize-y"
            value={text}
            readOnly
          />
        </div>
      )}
    </div>
  );
};