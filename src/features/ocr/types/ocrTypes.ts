export type OcrStatus = 'idle' | 'loading' | 'success' | 'error';

export type ExtractionMode = 'document' | 'graphic';

export type OcrPreset = 'original' | 'document' | 'invert';

export interface OcrOptions {
  preset?: OcrPreset;
  language?: string;
  psm?: string;
  brightness?: number;
  contrast?: number;
  threshold?: number;
  thresholdMode?: 'adaptive' | 'manual';
  deskew?: boolean;
  engine?: 'local' | 'ai';
}

export interface IOcrService {
  extractText(
    file: File,
    mode: ExtractionMode,
    options?: OcrOptions,
    onProgress?: (progress: number) => void
  ): Promise<{ text: string; confidence?: number }>;
}