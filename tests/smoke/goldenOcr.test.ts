// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import Tesseract from 'tesseract.js';
import { describe, expect, it } from 'vitest';

describe('Smoke Test: Golden Invoice OCR', () => {
  it('extracts expected invoice text from fixture with local assets', async () => {
    const fixturePath = path.resolve(__dirname, '../fixtures/golden-invoice.png');
    expect(fs.existsSync(fixturePath)).toBe(true);

    const langPath = path.resolve(__dirname, '../../public/ocr-assets');
    const worker = await Tesseract.createWorker('eng', 1, {
      langPath,
      cachePath: langPath,
    });

    try {
      const { data } = await worker.recognize(fixturePath);
      expect(data.text).toMatch(/TEXTIFY\s+INVOICE/i);
      expect(data.text).toMatch(/INVOICE\s+NO:\s*2026-0042/i);
      expect(data.text).toMatch(/245\.00/i);
    } finally {
      await worker.terminate();
    }
  }, 30000);
});
