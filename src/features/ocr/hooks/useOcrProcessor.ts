import { useCallback, useRef, useState } from 'react';
import type { ExtractionMode, IOcrService, OcrOptions, OcrStatus } from '../types/ocrTypes';

export const useOcrProcessor = (ocrService: IOcrService) => {
  const [status, setStatus] = useState<OcrStatus>('idle');
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const requestIdRef = useRef(0);

  const process = useCallback(
    async (file: File, mode: ExtractionMode = 'document', options?: OcrOptions) => {
      const currentRequestId = ++requestIdRef.current;
      const isStale = () => currentRequestId !== requestIdRef.current;

      setStatus('loading');
      setError(null);
      setText('');
      setProgress(0);

      const mergedOptions: OcrOptions = {
        ...options,
        isStale: options?.isStale ?? isStale,
      };

      try {
        const result = await ocrService.extractText(
          file,
          mode,
          mergedOptions,
          (currentProgress) => {
            if (!isStale()) {
              setProgress(currentProgress);
            }
          }
        );

        if (isStale()) return;

        if (!result.text || result.text.trim().length === 0) {
          throw new Error('No readable text detected in selected region.');
        }

        setText(result.text);
        setStatus('success');
      } catch (err) {
        if (isStale()) return;
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred during OCR processing.';
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
