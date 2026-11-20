import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type OcrProcessResult, useOcrProcessor } from '../hooks/useOcrProcessor';
import type { IOcrService } from '../types/ocrTypes';

const mockFile = new File(['(⌐□_□)'], 'test-image.png', { type: 'image/png' });

describe('useOcrProcessor', () => {
  let mockOcrService: IOcrService;

  beforeEach(() => {
    mockOcrService = {
      extractText: vi.fn(),
    };
  });

  it('should initialize with idle state', () => {
    const { result } = renderHook(() => useOcrProcessor(mockOcrService));

    expect(result.current.status).toBe('idle');
    expect(result.current.text).toBe('');
  });

  it('should return a successful result and transition to success', async () => {
    const expectedText = 'Structured Extracted Text';
    vi.mocked(mockOcrService.extractText).mockResolvedValueOnce({ text: expectedText });

    const { result } = renderHook(() => useOcrProcessor(mockOcrService));
    let processPromise: Promise<OcrProcessResult> | undefined;

    act(() => {
      processPromise = result.current.process(mockFile);
    });

    expect(result.current.status).toBe('loading');

    let processResult: OcrProcessResult | undefined;
    await act(async () => {
      processResult = await processPromise;
    });

    expect(processResult).toEqual({ ok: true, text: expectedText });
    expect(result.current.status).toBe('success');
    expect(result.current.text).toBe(expectedText);
    expect(mockOcrService.extractText).toHaveBeenCalledWith(
      mockFile,
      'document',
      expect.objectContaining({
        isStale: expect.any(Function),
        signal: expect.any(AbortSignal),
      }),
      expect.any(Function)
    );
    expect(mockOcrService.extractText).toHaveBeenCalledTimes(1);
  });

  it('should return an error result when OCR service fails', async () => {
    vi.mocked(mockOcrService.extractText).mockRejectedValueOnce(new Error('Tesseract failed'));

    const { result } = renderHook(() => useOcrProcessor(mockOcrService));
    let processPromise: Promise<OcrProcessResult> | undefined;

    act(() => {
      processPromise = result.current.process(mockFile);
    });

    expect(result.current.status).toBe('loading');

    let processResult: OcrProcessResult | undefined;
    await act(async () => {
      processResult = await processPromise;
    });

    expect(processResult).toEqual({ ok: false, error: 'Tesseract failed' });
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Tesseract failed');
    expect(result.current.text).toBe('');
  });

  it('should return an error result when OCR service returns empty text', async () => {
    vi.mocked(mockOcrService.extractText).mockResolvedValueOnce({ text: '   ' });

    const { result } = renderHook(() => useOcrProcessor(mockOcrService));
    let processPromise: Promise<OcrProcessResult> | undefined;

    act(() => {
      processPromise = result.current.process(mockFile);
    });

    let processResult: OcrProcessResult | undefined;
    await act(async () => {
      processResult = await processPromise;
    });

    expect(processResult).toEqual({
      ok: false,
      error: 'No readable text detected in selected region.',
    });
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('No readable text detected in selected region.');
  });

  it('should normalize a Gemini no-readable-text failure to the shared empty-text error', async () => {
    vi.mocked(mockOcrService.extractText).mockRejectedValueOnce(
      new Error('AI Scan failed: Gemini failed to extract any readable text from the image.')
    );

    const { result } = renderHook(() => useOcrProcessor(mockOcrService));
    let processPromise: Promise<OcrProcessResult> | undefined;

    act(() => {
      processPromise = result.current.process(mockFile);
    });

    let processResult: OcrProcessResult | undefined;
    await act(async () => {
      processResult = await processPromise;
    });

    expect(processResult).toEqual({
      ok: false,
      error: 'No readable text detected in selected region.',
    });
    expect(result.current.status).toBe('error');
  });

  it('should return an aborted result without an error when the current request aborts', async () => {
    vi.mocked(mockOcrService.extractText).mockRejectedValueOnce(
      new DOMException('The operation was aborted.', 'AbortError')
    );

    const { result } = renderHook(() => useOcrProcessor(mockOcrService));
    let processPromise: Promise<OcrProcessResult> | undefined;

    act(() => {
      processPromise = result.current.process(mockFile);
    });

    let processResult: OcrProcessResult | undefined;
    await act(async () => {
      processResult = await processPromise;
    });

    expect(processResult).toEqual({ ok: false, aborted: true });
    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBe(0);
  });

  it('should abort the first request and return an aborted result for superseded scans', async () => {
    let resolveFirst: ((value: { text: string; confidence?: number }) => void) | undefined;
    let firstSignal: AbortSignal | undefined;
    vi.mocked(mockOcrService.extractText)
      .mockImplementationOnce(
        (_file, _mode, options) =>
          new Promise((resolve) => {
            firstSignal = options?.signal;
            resolveFirst = resolve;
          })
      )
      .mockResolvedValueOnce({ text: 'Second Request Text' });

    const { result } = renderHook(() => useOcrProcessor(mockOcrService));
    let firstPromise: Promise<OcrProcessResult> | undefined;
    let secondPromise: Promise<OcrProcessResult> | undefined;

    act(() => {
      firstPromise = result.current.process(mockFile);
    });
    act(() => {
      secondPromise = result.current.process(mockFile);
    });

    expect(firstSignal?.aborted).toBe(true);

    act(() => {
      resolveFirst?.({ text: 'First Stale Text' });
    });

    let firstResult: OcrProcessResult | undefined;
    let secondResult: OcrProcessResult | undefined;
    await act(async () => {
      [firstResult, secondResult] = await Promise.all([firstPromise!, secondPromise!]);
    });

    expect(firstResult).toEqual({ ok: false, aborted: true });
    expect(secondResult).toEqual({ ok: true, text: 'Second Request Text' });
    expect(result.current.text).toBe('Second Request Text');
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });
  });
});
