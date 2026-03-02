
import Tesseract from 'tesseract.js';
import { IOcrService, OcrResult } from '../types/ocrTypes';

export class TesseractOcrService implements IOcrService {
  async extractText(file: File): Promise<OcrResult> {
    const { data } = await Tesseract.recognize(file, 'eng');
    return { text: data.text };
  }
}
