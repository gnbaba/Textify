
import { useState } from 'react';
import { IOcrService, OcrStatus } from '../types/ocrTypes';
import { TesseractOcrService } from '../services/tesseractOcrService';
import { formatText } from '../services/textFormatterService';

export function useOcrProcessor(service: IOcrService = new TesseractOcrService()) {
  const [status, setStatus] = useState<OcrStatus>('idle');
  const [text, setText] = useState('');

  const process = async (file: File) => {
    try {
      setStatus('loading');
      const result = await service.extractText(file);
      setText(formatText(result.text));
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return { status, text, process };
}
