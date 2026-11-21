import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { geminiOcrService } from '../services/geminiOcrService';
import { routingOcrService } from '../services/routingOcrService';
import { tesseractOcrService } from '../services/tesseractOcrService';

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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should run tesseractOcrService first with pre-configured automatic parameters by default', async () => {
    vi.mocked(tesseractOcrService.extractText).mockResolvedValueOnce({
      text: 'local text',
      confidence: 85,
    });

    const result = await routingOcrService.extractText(mockFile, 'document');

    expect(result.text).toBe('local text');
    expect(tesseractOcrService.extractText).toHaveBeenCalledTimes(1);
    expect(tesseractOcrService.extractText).toHaveBeenCalledWith(
      mockFile,
      'document',
      expect.objectContaining({
        language: 'eng',
        psm: 'auto',
        preset: 'document',
        thresholdMode: 'adaptive',
        deskew: true,
      }),
      undefined
    );
    expect(geminiOcrService.extractText).not.toHaveBeenCalled();
  });

  it('should NOT fallback to geminiOcrService when tesseractOcrService throws an error (local only by default)', async () => {
    vi.mocked(tesseractOcrService.extractText).mockRejectedValueOnce(
      new Error('Tesseract crashed')
    );

    await expect(routingOcrService.extractText(mockFile, 'document')).rejects.toThrow(
      'Tesseract crashed'
    );
    expect(tesseractOcrService.extractText).toHaveBeenCalledTimes(1);
    expect(geminiOcrService.extractText).not.toHaveBeenCalled();
  });

  it('should NOT fallback to geminiOcrService when tesseractOcrService returns empty text', async () => {
    vi.mocked(tesseractOcrService.extractText).mockResolvedValueOnce({
      text: '   ',
      confidence: 90,
    });

    await expect(routingOcrService.extractText(mockFile, 'document')).rejects.toThrow(
      'No readable text detected in selected region.'
    );
    expect(tesseractOcrService.extractText).toHaveBeenCalledTimes(1);
    expect(geminiOcrService.extractText).not.toHaveBeenCalled();
  });

  it('should NOT fallback to geminiOcrService when tesseractOcrService returns low confidence score', async () => {
    vi.mocked(tesseractOcrService.extractText).mockResolvedValueOnce({
      text: 'poor text quality',
      confidence: 45,
    });

    const result = await routingOcrService.extractText(mockFile, 'document');

    expect(result.text).toBe('poor text quality');
    expect(tesseractOcrService.extractText).toHaveBeenCalledTimes(1);
    expect(geminiOcrService.extractText).not.toHaveBeenCalled();
  });

  it('should propagate AbortError without triggering Gemini', async () => {
    const abortError = new DOMException('The operation was aborted.', 'AbortError');
    const controller = new AbortController();
    vi.mocked(tesseractOcrService.extractText).mockRejectedValueOnce(abortError);

    await expect(
      routingOcrService.extractText(mockFile, 'document', { signal: controller.signal })
    ).rejects.toBe(abortError);

    expect(tesseractOcrService.extractText).toHaveBeenCalledWith(
      mockFile,
      'document',
      expect.objectContaining({ signal: controller.signal }),
      undefined
    );
    expect(geminiOcrService.extractText).not.toHaveBeenCalled();
  });

  it('should route to geminiOcrService when engine === "ai" is explicitly requested', async () => {
    vi.mocked(geminiOcrService.extractText).mockResolvedValueOnce({
      text: 'gemini enhanced text',
    });

    const result = await routingOcrService.extractText(mockFile, 'document', { engine: 'ai' });

    expect(result.text).toBe('gemini enhanced text');
    expect(tesseractOcrService.extractText).not.toHaveBeenCalled();
    expect(geminiOcrService.extractText).toHaveBeenCalledTimes(1);
    expect(geminiOcrService.extractText).toHaveBeenCalledWith(
      mockFile,
      'document',
      expect.objectContaining({ engine: 'ai' }),
      undefined
    );
  });
});
