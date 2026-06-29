import type { IOcrService, ExtractionMode, OcrOptions } from '../types/ocrTypes';
import { tesseractOcrService } from './tesseractOcrService';
import { geminiOcrService } from './geminiOcrService';

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
    // 1. Configure automatic background parameters based on extraction mode
    const autoOptions: OcrOptions = {
      ...options,
      language: 'eng+spa', // Combined dictionary to handle English/Spanish text automatically
      psm: mode === 'document' ? 'auto' : 'single_block',
      preset: mode === 'document' ? 'document' : 'original',
      brightness: 80,
      contrast: 200,
      thresholdMode: 'adaptive',
      deskew: mode === 'document',
    };

    let localResult: { text: string; confidence?: number } | null = null;
    let localError: Error | null = null;

    try {
      // 2. Always attempt local Tesseract processing first
      localResult = await tesseractOcrService.extractText(file, mode, autoOptions, onProgress);
    } catch (err) {
      localError = err instanceof Error ? err : new Error(String(err));
      console.warn('Local Tesseract OCR processing failed:', err);
    }

    // 3. Evaluate if we need to fall back to Gemini AI
    const hasGeminiKey = !!import.meta.env.VITE_GEMINI_API_KEY;
    const isLocalEmpty = !localResult || !localResult.text || localResult.text.trim() === '';
    const isLocalLowConfidence = localResult && localResult.confidence !== undefined && localResult.confidence < 60;

    if (hasGeminiKey && (localError || isLocalEmpty || isLocalLowConfidence)) {
      console.log(
        `Triggering Gemini AI fallback. Reason: ${
          localError ? 'Tesseract threw error' : isLocalEmpty ? 'Tesseract returned empty' : `Low Tesseract confidence (${localResult?.confidence}%)`
        }`
      );
      
      try {
        // Run vision OCR using Gemini API
        return await geminiOcrService.extractText(file, mode, autoOptions, onProgress);
      } catch (geminiErr) {
        console.error('Gemini AI fallback failed:', geminiErr);
        // If Gemini failed too, and Tesseract had some text, return Tesseract's result as a last resort
        if (localResult && localResult.text && localResult.text.trim() !== '') {
          return localResult;
        }
        throw geminiErr; // Otherwise rethrow the Gemini error
      }
    }

    // 4. If no fallback is triggered (or Gemini API key is missing), return local results or throw the local error
    if (localError) {
      throw localError;
    }

    if (isLocalEmpty) {
      throw new Error('No readable text detected. Please try a clearer photo or different mode.');
    }

    return localResult!;
  }
}

export const routingOcrService = RoutingOcrService.getInstance();
export default routingOcrService;
