import { createWorker, Worker, PSM } from 'tesseract.js';
import type { IOcrService, ExtractionMode, OcrOptions } from '../types/ocrTypes';
import { loadOpenCv } from './opencvLoader';
import { OpenCVPreprocessorService } from './opencvPreprocessorService';

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

  private preprocessImage(file: File, options?: OcrOptions, useOpenCv: boolean = false): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
    
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
    
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2D context for canvas'));
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (useOpenCv) {
          // Draw raw image first, then process via OpenCV WASM
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          OpenCVPreprocessorService.preprocess(canvas, options);
        } else {
          // Fallback to standard Canvas CSS Filter
          if ('filter' in ctx) {
            try {
              let filterVal = 'none';
              const preset = options?.preset || 'document';

              if (preset === 'document') {
                const b = options?.brightness !== undefined ? options.brightness : 80;
                const c = options?.contrast !== undefined ? options.contrast : 200;
                filterVal = `grayscale(100%) brightness(${b}%) contrast(${c}%)`;
              } else if (preset === 'invert') {
                const b = options?.brightness !== undefined ? options.brightness : 100;
                const c = options?.contrast !== undefined ? options.contrast : 200;
                filterVal = `grayscale(100%) invert(100%) brightness(${b}%) contrast(${c}%)`;
              }

              ctx.filter = filterVal;
            } catch (e) {
              console.warn('Canvas filter gracefully skipped:', e);
            }
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
    
        resolve(canvas);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image for preprocessing'));
      };

      img.src = objectUrl;
    });
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

      let useOpenCv = false;
      try {
        await loadOpenCv();
        useOpenCv = true;
      } catch (err) {
        console.warn('OpenCV loading failed, falling back to Canvas filter preprocessing:', err);
      }

      const canvas = await this.preprocessImage(file, options, useOpenCv);
      
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