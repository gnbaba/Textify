import type { ExtractionMode, IOcrService, OcrOptions } from '../types/ocrTypes';
import { geminiOcrService } from './geminiOcrService';
import { tesseractOcrService } from './tesseractOcrService';

const isAbortError = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';

class RoutingOcrService implements IOcrService {
  private static instance: RoutingOcrService;

  private constructor() {}

  public static getInstance(): RoutingOcrService {
    if (!RoutingOcrService.instance) {
      RoutingOcrService.instance = new RoutingOcrService();
    }
    return RoutingOcrService.instance;
  }

  public async extractText(
    file: File,
    mode: ExtractionMode,
    options?: OcrOptions,
    onProgress?: (progress: number) => void
  ): Promise<{ text: string; confidence?: number }> {
    // If Cloud AI is explicitly requested, route directly to Gemini service
    if (options?.engine === 'ai') {
      return geminiOcrService.extractText(file, mode, options, onProgress);
    }

    // Default: 100% local Tesseract execution with zero network fallback
    const autoOptions: OcrOptions = {
      ...options,
      language: options?.language ?? 'eng',
      signal: options?.signal,
      psm: mode === 'document' ? 'auto' : 'single_block',
      preset: mode === 'document' ? 'document' : 'original',
      thresholdMode: 'adaptive',
      deskew: mode === 'document',
    };

    let localResult: { text: string; confidence?: number } | null = null;

    try {
      localResult = await tesseractOcrService.extractText(file, mode, autoOptions, onProgress);
    } catch (err) {
      if (isAbortError(err)) {
        throw err;
      }
      throw err;
    }

    if (!localResult || !localResult.text || localResult.text.trim() === '') {
      throw new Error('No readable text detected in selected region.');
    }

    return localResult;
  }
}

export const routingOcrService = RoutingOcrService.getInstance();
export default routingOcrService;
