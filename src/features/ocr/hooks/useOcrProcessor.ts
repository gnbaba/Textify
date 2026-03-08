// File 3: src/features/ocr/hooks/useOcrProcessor.ts

import { useState, useCallback } from 'react';
import type { IOcrService, OcrStatus } from '../types/ocrTypes';

export const useOcrProcessor = (ocrService: IOcrService) => {
  const [status, setStatus] = useState<OcrStatus>('idle');
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const process = useCallback(
    async (file: File) => {
      setStatus('loading');
      setError(null);
      setText('');
      setProgress(0);

      try {
        const result = await ocrService.extractText(file, (currentProgress) => {
          setProgress(currentProgress);
        });
        
        setText(result.text);
        setStatus('success');
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'An unknown error occurred during OCR processing.';
        setError(errorMessage);
        setStatus('error');
      }
    },
    [ocrService]
  );

  return {
    status,
    text,
    error,
    progress,
    process,
  };
};