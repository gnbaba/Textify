import { createWorker, Worker, PSM } from 'tesseract.js';
import type { IOcrService, ExtractionMode } from '../types/ocrTypes';

class TesseractOcrService implements IOcrService {
  private static instance: TesseractOcrService;
  private worker: Worker | null = null;
  private initializationPromise: Promise<Worker> | null = null;
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

  private async getWorker(): Promise<Worker> {
    if (this.worker) {
      return this.worker;
    }

    if (!this.initializationPromise) {
      this.initializationPromise = this.initWorker();
    }

    return this.initializationPromise;
  }

  private async initWorker(): Promise<Worker> {
    try {
      const worker = await createWorker('eng', 1, {
        logger: this.handleLog,
      });
      
      this.worker = worker;
      return worker;
    } catch (error) {
      this.initializationPromise = null;
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to initialize OCR engine: ${errorMessage}`);
    }
  }

  private preprocessImage(file: File): Promise<HTMLCanvasElement> {
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

        if ('filter' in ctx) {
          try {
            ctx.filter = 'grayscale(100%) brightness(80%) contrast(200%)';
          } catch (e) {
            console.warn('Canvas filter gracefully skipped:', e);
          }
        }
    
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
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
    onProgress?: (progress: number) => void
  ): Promise<{ text: string }> {
    this.currentOnProgress = onProgress;
    
    try {
      const worker = await this.getWorker();
      const canvas = await this.preprocessImage(file);
      
      await worker.setParameters({
        tessedit_pageseg_mode: mode === 'graphic' ? PSM.SINGLE_BLOCK : PSM.AUTO,
        user_defined_dpi: '300', 
      });

      const { data } = await worker.recognize(canvas);
      
      // Forces the UI error banner if the engine reads a blank image
      if (!data.text || data.text.trim() === '') {
        throw new Error('No readable text detected. Please try a clearer photo or different mode.');
      }
      
      return { text: data.text };
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