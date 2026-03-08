export type OcrStatus = 'idle' | 'loading' | 'success' | 'error';

export interface IOcrService {
  extractText(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<{ text: string }>;
}