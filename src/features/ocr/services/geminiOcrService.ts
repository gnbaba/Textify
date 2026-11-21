import { auth } from '../../../config/firebase';
import type { ExtractionMode, IOcrService, OcrOptions } from '../types/ocrTypes';

const isAbortError = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';

const compressImageForCloud = async (file: File, maxBytes = 2.5 * 1024 * 1024): Promise<File> => {
  if (
    file.size <= maxBytes &&
    (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp')
  ) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const tempUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = tempUrl;
    img.onload = () => {
      URL.revokeObjectURL(tempUrl);

      let width = img.naturalWidth;
      let height = img.naturalHeight;
      const maxDim = 2400;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const tryQuality = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            if (blob.size <= maxBytes || quality <= 0.5) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              tryQuality(quality - 0.15);
            }
          },
          'image/jpeg',
          quality
        );
      };

      tryQuality(0.9);
    };
    img.onerror = () => {
      URL.revokeObjectURL(tempUrl);
      reject(new Error('Failed to load image for cloud compression.'));
    };
  });
};

export class GeminiOcrService implements IOcrService {
  private static instance: GeminiOcrService;

  private constructor() {}

  public static getInstance(): GeminiOcrService {
    if (!GeminiOcrService.instance) {
      GeminiOcrService.instance = new GeminiOcrService();
    }
    return GeminiOcrService.instance;
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  public async extractText(
    file: File,
    mode: ExtractionMode,
    options?: OcrOptions,
    onProgress?: (progress: number) => void
  ): Promise<{ text: string; confidence?: number }> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Sign in with Google to enable Cloud AI OCR.');
    }

    const token = await user.getIdToken();
    if (!token) {
      throw new Error('Authentication required: Failed to retrieve user ID token.');
    }

    if (onProgress) onProgress(20);

    try {
      const compressedFile = await compressImageForCloud(file);
      if (onProgress) onProgress(40);

      const base64Data = await this.fileToBase64(compressedFile);
      if (onProgress) onProgress(60);

      const signals = [AbortSignal.timeout(20000), ...(options?.signal ? [options.signal] : [])];
      const signal = AbortSignal.any(signals);

      const response = await fetch('/api/gemini-ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: compressedFile.type,
          mode,
        }),
        signal,
      });

      if (onProgress) onProgress(80);

      if (!response.ok) {
        let errorMsg = `Server error (HTTP ${response.status})`;
        try {
          const errorJson = (await response.json()) as { error?: string };
          if (errorJson.error) errorMsg = errorJson.error;
        } catch {
          const text = await response.text();
          if (text) errorMsg = text;
        }
        throw new Error(errorMsg);
      }

      const resJson = (await response.json()) as { text?: string };
      const extractedText = resJson.text;

      if (!extractedText || extractedText.trim() === '') {
        throw new Error('Gemini failed to extract any readable text from the image.');
      }

      if (onProgress) onProgress(100);
      return { text: extractedText };
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }

      console.error('Gemini OCR Service Error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`AI Scan failed: ${errorMessage}`);
    }
  }
}

export const geminiOcrService = GeminiOcrService.getInstance();
