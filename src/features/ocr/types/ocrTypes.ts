export interface IOcrService {
  extractText(file: File): Promise<{ text: string }>;
}

export type OcrStatus = 'idle' | 'loading' | 'success' | 'error';