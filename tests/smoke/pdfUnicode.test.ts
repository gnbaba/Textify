// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import jsPDF from 'jspdf';
import { describe, expect, it } from 'vitest';

describe('Smoke Test: PDF Unicode & Font Header', () => {
  it('verifies NotoSans font binary exists, size > 100 KB, and header is TrueType', () => {
    const fontPath = path.resolve(__dirname, '../../public/fonts/NotoSans-Regular.ttf');
    expect(fs.existsSync(fontPath)).toBe(true);

    const stats = fs.statSync(fontPath);
    expect(stats.size).toBeGreaterThan(100 * 1024);

    const buffer = fs.readFileSync(fontPath);
    // TrueType header magic bytes: 00 01 00 00
    expect(buffer[0]).toBe(0x00);
    expect(buffer[1]).toBe(0x01);
    expect(buffer[2]).toBe(0x00);
    expect(buffer[3]).toBe(0x00);
  });

  it('generates a PDF with embedded NotoSans rendering accented characters and currency symbols', () => {
    const fontPath = path.resolve(__dirname, '../../public/fonts/NotoSans-Regular.ttf');
    const fontBuffer = fs.readFileSync(fontPath);
    const fontBase64 = fontBuffer.toString('base64');

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    doc.addFileToVFS('NotoSans-Regular.ttf', fontBase64);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
    doc.setFont('NotoSans', 'normal');

    const sampleText = 'Invoice #1042 — Total: €245.00 / £199.50 — Señor José Muñoz';
    doc.text(sampleText, 20, 20);

    const output = doc.output('arraybuffer');
    expect(output.byteLength).toBeGreaterThan(0);
  });
});
