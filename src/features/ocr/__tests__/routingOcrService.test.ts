import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { routingOcrService } from '../services/routingOcrService';
import { tesseractOcrService } from '../services/tesseractOcrService';
import { geminiOcrService } from '../services/geminiOcrService';

vi.mock('../services/tesseractOcrService', () => ({
  tesseractOcrService: {
    extractText: vi.fn(),
  },
}));

vi.mock('../services/geminiOcrService', () => ({
  geminiOcrService: {
    extractText: vi.fn(),
  },
}));

const mockFile = new File(['(⌐□_□)'], 'test-image.png', { type: 'image/png' });

describe('RoutingOcrService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_GEMINI_API_KEY', 'mock-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should run tesseractOcrService first with pre-configured automatic parameters', async () => {
    vi.mocked(tesseractOcrService.extractText).mockResolvedValueOnce({ text: 'local text', confidence: 85 });

    const result = await routingOcrService.extractText(mockFile, 'document');

    expect(result.text).toBe('local text');
    expect(tesseractOcrService.extractText).toHaveBeenCalledTimes(1);
    expect(tesseractOcrService.extractText).toHaveBeenCalledWith(
      mockFile,
      'document',
      expect.objectContaining({
        language: 'eng+spa',
        psm: 'auto',
        preset: 'document',
        brightness: 80,
        contrast: 200,
        thresholdMode: 'adaptive',
        deskew: true,
      }),
      undefined
    );
    expect(geminiOcrService.extractText).not.toHaveBeenCalled();
  });

  it('should fallback to geminiOcrService when tesseractOcrService throws an error', async () => {
    vi.mocked(tesseractOcrService.extractText).mockRejectedValueOnce(new Error('Tesseract crashed'));
    vi.mocked(geminiOcrService.extractText).mockResolvedValueOnce({ text: 'gemini fallback text' });

    const result = await routingOcrService.extractText(mockFile, 'document');

    expect(result.text).toBe('gemini fallback text');
    expect(tesseractOcrService.extractText).toHaveBeenCalledTimes(1);
    expect(geminiOcrService.extractText).toHaveBeenCalledTimes(1);
  });

  it('should fallback to geminiOcrService when tesseractOcrService returns empty text', async () => {
    vi.mocked(tesseractOcrService.extractText).mockResolvedValueOnce({ text: '   ', confidence: 90 });
    vi.mocked(geminiOcrService.extractText).mockResolvedValueOnce({ text: 'gemini fallback text' });

    const result = await routingOcrService.extractText(mockFile, 'document');

    expect(result.text).toBe('gemini fallback text');
    expect(tesseractOcrService.extractText).toHaveBeenCalledTimes(1);
    expect(geminiOcrService.extractText).toHaveBeenCalledTimes(1);
  });

  it('should fallback to geminiOcrService when tesseractOcrService returns low confidence score', async () => {
    vi.mocked(tesseractOcrService.extractText).mockResolvedValueOnce({ text: 'poor text quality', confidence: 45 });
    vi.mocked(geminiOcrService.extractText).mockResolvedValueOnce({ text: 'gemini fallback text' });

    const result = await routingOcrService.extractText(mockFile, 'document');

    expect(result.text).toBe('gemini fallback text');
    expect(tesseractOcrService.extractText).toHaveBeenCalledTimes(1);
    expect(geminiOcrService.extractText).toHaveBeenCalledTimes(1);
  });
});
