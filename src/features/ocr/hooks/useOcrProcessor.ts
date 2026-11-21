import { useCallback, useEffect, useRef, useState } from 'react';
import type { ExtractionMode, IOcrService, OcrOptions, OcrStatus } from '../types/ocrTypes';

export type OcrProcessResult =
  | { ok: true; text: string; confidence?: number }
  | { ok: false; aborted: true }
  | { ok: false; aborted?: false; error: string };

const NO_READABLE_TEXT_ERROR = 'No readable text detected in selected region.';

const isAbortError = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';

const getErrorMessage = (error: unknown): string => {
  if (
    error instanceof Error &&
    error.message.includes('Gemini failed to extract any readable text from the image.')
  ) {
    return NO_READABLE_TEXT_ERROR;
  }

  return error instanceof Error
    ? error.message
    : 'An unknown error occurred during OCR processing.';
};

export const useOcrProcessor = (ocrService: IOcrService) => {
  const [status, setStatus] = useState<OcrStatus>('idle');
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    requestIdRef.current += 1;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus('idle');
    setError(null);
    setText('');
    setProgress(0);
  }, []);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      abortControllerRef.current?.abort();
    };
  }, []);

  const process = useCallback(
    async (
      file: File,
      mode: ExtractionMode = 'document',
      options?: OcrOptions
    ): Promise<OcrProcessResult> => {
      abortControllerRef.current?.abort();

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const currentRequestId = ++requestIdRef.current;
      const isStale = () =>
        currentRequestId !== requestIdRef.current || options?.isStale?.() === true;

      setStatus('loading');
      setError(null);
      setText('');
      setProgress(0);

      const mergedOptions: OcrOptions = {
        ...options,
        engine: options?.engine,
        signal: abortController.signal,
        isStale,
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

        if (isStale()) {
          if (currentRequestId === requestIdRef.current) {
            setText('');
            setProgress(0);
            setStatus('idle');
          }

          return { ok: false, aborted: true };
        }

        if (!result.text || result.text.trim().length === 0) {
          const errorMessage = NO_READABLE_TEXT_ERROR;
          setError(errorMessage);
          setStatus('error');
          return { ok: false, error: errorMessage };
        }

        setText(result.text);
        setStatus('success');

        return {
          ok: true,
          text: result.text,
          ...(result.confidence !== undefined ? { confidence: result.confidence } : {}),
        };
      } catch (err) {
        if (isStale() || isAbortError(err)) {
          if (currentRequestId === requestIdRef.current) {
            setText('');
            setProgress(0);
            setStatus('idle');
          }

          return { ok: false, aborted: true };
        }

        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        setStatus('error');
        return { ok: false, error: errorMessage };
      } finally {
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
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
    cancel,
  };
};
