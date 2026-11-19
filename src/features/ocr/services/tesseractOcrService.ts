import { createWorker, PSM, Worker } from 'tesseract.js';
import type { ExtractionMode, IOcrService, OcrOptions } from '../types/ocrTypes';
import { preprocessCanvasImage } from './canvasPreprocessorService';

class TesseractOcrService implements IOcrService {
  private static instance: TesseractOcrService;
  private worker: Worker | null = null;
  private initializationPromise: Promise<Worker> | null = null;
  private currentLanguage: string = 'eng';
  private currentOnProgress?: (progress: number) => void;

  private constructor() {}

  public static getInstance(): TesseractOcrService {
    if (!TesseractOcrService.instance) {
      TesseractOcrService.instance = new TesseractOcrService();
    }
    return TesseractOcrService.instance;
  }

  private handleLog = (m: { status: string; progress: number }) => {
    if (m.status === 'recognizing text' && this.currentOnProgress) {
      const percentage = Math.round(m.progress * 100);
      this.currentOnProgress(percentage);
    }
  };

  private async getWorker(lang: string = 'eng'): Promise<Worker> {
    if (this.worker && this.currentLanguage === lang) {
      return this.worker;
    }

    if (this.worker && this.currentLanguage !== lang) {
      await this.terminateWorker();
    }

    if (!this.initializationPromise) {
      this.currentLanguage = lang;
      this.initializationPromise = this.initWorker(lang);
    }

    return this.initializationPromise;
  }

  private async initWorker(lang: string): Promise<Worker> {
    try {
      const worker = await createWorker(lang, 1, {
        logger: this.handleLog,
        workerPath: '/ocr-assets/worker.min.js',
        corePath: '/ocr-assets',
        langPath: '/ocr-assets',
      });

      this.worker = worker;
      return worker;
    } catch (error) {
      this.initializationPromise = null;
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to initialize OCR engine: ${errorMessage}`);
    }
  }

  public async extractText(
    file: File,
    mode: ExtractionMode,
    options?: OcrOptions,
    onProgress?: (progress: number) => void
  ): Promise<{ text: string; confidence?: number }> {
    this.currentOnProgress = onProgress;

    try {
      const lang = options?.language || 'eng';
      const worker = await this.getWorker(lang);

      const canvas = await preprocessCanvasImage(file);

      let pagesegMode = mode === 'graphic' ? PSM.SINGLE_BLOCK : PSM.AUTO;
      if (options?.psm) {
        switch (options.psm) {
          case 'auto':
            pagesegMode = PSM.AUTO;
            break;
          case 'single_block':
            pagesegMode = PSM.SINGLE_BLOCK;
            break;
          case 'sparse_text':
            pagesegMode = PSM.SPARSE_TEXT;
            break;
          case 'single_line':
            pagesegMode = PSM.SINGLE_LINE;
            break;
          default:
            break;
        }
      }

      await worker.setParameters({
        tessedit_pageseg_mode: pagesegMode,
        user_defined_dpi: '300',
      });

      const { data } = await worker.recognize(canvas);

      return {
        text: data.text || '',
        confidence: data.confidence,
      };
    } catch (error) {
      console.error('OCR Extraction Error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`OCR processing failed: ${errorMessage}`);
    } finally {
      this.currentOnProgress = undefined;
    }
  }

  public async terminateWorker(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.initializationPromise = null;
    }
  }
}

export const tesseractOcrService = TesseractOcrService.getInstance();
