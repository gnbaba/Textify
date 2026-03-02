
export type OcrStatus = 'idle' | 'loading' | 'success' | 'error';

export interface OcrResult {
  text: string;
}

export interface IOcrService {
  extractText(file: File): Promise<OcrResult>;
}
