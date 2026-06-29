import type { IOcrService, ExtractionMode, OcrOptions } from '../types/ocrTypes';

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
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    if (onProgress) onProgress(20);

    try {
      const base64Data = await this.fileToBase64(file);
      if (onProgress) onProgress(40);

      // System instruction embedded in the prompt to enforce raw text response
      const prompt = mode === 'graphic'
        ? 'Extract text from this image. It contains a single block of text or logotype. Return only the extracted text as-is, with no introductory text, no comments, and no markdown wrapping.'
        : 'Perform OCR on this image. Extract all text exactly as written, preserving layouts, paragraphs, tables (as markdown), and lists. Return only the extracted text with no conversational intro/outro and no wrapper.';

      const payload = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: file.type || 'image/jpeg',
                  data: base64Data,
                },
              },
            ],
          },
        ],
      };

      if (onProgress) onProgress(60);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (onProgress) onProgress(80);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error (HTTP ${response.status}): ${errText}`);
      }

      const resJson = await response.json();
      const extractedText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!extractedText || extractedText.trim() === '') {
        throw new Error('Gemini failed to extract any readable text from the image.');
      }

      if (onProgress) onProgress(100);
      return { text: extractedText };
    } catch (error) {
      console.error('Gemini OCR Service Error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`AI Scan failed: ${errorMessage}`);
    }
  }
}

export const geminiOcrService = GeminiOcrService.getInstance();
