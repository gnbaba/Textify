export type OcrStatus = 'idle' | 'loading' | 'success' | 'error';

export type ExtractionMode = 'document' | 'graphic';

export interface IOcrService {
  extractText(
    file: File,
    mode: ExtractionMode,
    onProgress?: (progress: number) => void
  ): Promise<{ text: string }>;
}