// File 2: src/features/ocr/services/tesseractOcrService.ts

import { createWorker, Worker } from 'tesseract.js';
import type { IOcrService } from '../types/ocrTypes';

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

  private handleLog = (m: any) => {
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

  public async extractText(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<{ text: string }> {
    this.currentOnProgress = onProgress;
    
    try {
      const worker = await this.getWorker();
      const { data } = await worker.recognize(file);
      
      return { text: data.text };
    } catch (error) {
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