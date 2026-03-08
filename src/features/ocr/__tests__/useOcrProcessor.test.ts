import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOcrProcessor } from '../hooks/useOcrProcessor';
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

  it('should transition from idle to loading to success on successful OCR', async () => {
    const expectedText = 'Structured Extracted Text';
    
    // Mock the service to return the object shape our hook expects
    vi.mocked(mockOcrService.extractText).mockResolvedValueOnce({ text: expectedText });

    const { result } = renderHook(() => useOcrProcessor(mockOcrService));

    act(() => {
      result.current.process(mockFile);
    });

    expect(result.current.status).toBe('loading');

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.text).toBe(expectedText);
    expect(mockOcrService.extractText).toHaveBeenCalledWith(
      mockFile, 
      'document', 
      expect.any(Function)
    );
    expect(mockOcrService.extractText).toHaveBeenCalledTimes(1);
  });

  it('should transition to error state if OCR service fails', async () => {
    vi.mocked(mockOcrService.extractText).mockRejectedValueOnce(new Error('Tesseract failed'));

    const { result } = renderHook(() => useOcrProcessor(mockOcrService));

    act(() => {
      result.current.process(mockFile);
    });

    expect(result.current.status).toBe('loading');

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.text).toBe('');
  });
});