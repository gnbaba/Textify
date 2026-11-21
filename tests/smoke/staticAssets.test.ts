// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Smoke Test: Static Assets & Production Dist Verification', () => {
  it('verifies public OCR and font assets exist', () => {
    const fontPath = path.resolve(__dirname, '../../public/fonts/NotoSans-Regular.ttf');
    const trainedDataPath = path.resolve(__dirname, '../../public/ocr-assets/eng.traineddata.gz');

    expect(fs.existsSync(fontPath)).toBe(true);
    expect(fs.statSync(fontPath).size).toBeGreaterThan(100 * 1024);

    expect(fs.existsSync(trainedDataPath)).toBe(true);
    expect(fs.statSync(trainedDataPath).size).toBeGreaterThan(0);
  });

  it('verifies vercel.json SPA rewrite regex routes correctly', () => {
    const vercelConfig = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../../vercel.json'), 'utf8')
    );
    const rewrite = vercelConfig.rewrites?.[0];
    expect(rewrite).toBeDefined();

    const pattern = new RegExp(`^${rewrite.source}$`);

    expect(pattern.test('/app')).toBe(true);
    expect(pattern.test('/docs')).toBe(true);
    expect(pattern.test('/dashboard')).toBe(true);

    expect(pattern.test('/api/gemini-ocr')).toBe(false);
    expect(pattern.test('/fonts/NotoSans-Regular.ttf')).toBe(false);
    expect(pattern.test('/ocr-assets/eng.traineddata.gz')).toBe(false);
    expect(pattern.test('/assets/index-abc.js')).toBe(false);
  });

  it('verifies built dist assets chunk sizes are all under 500 KB (when dist exists)', () => {
    const distAssetsDir = path.resolve(__dirname, '../../dist/assets');
    if (!fs.existsSync(distAssetsDir)) {
      return;
    }

    const files = fs.readdirSync(distAssetsDir);
    const jsFiles = files.filter((f) => f.endsWith('.js'));
    expect(jsFiles.length).toBeGreaterThan(0);

    for (const jsFile of jsFiles) {
      const stats = fs.statSync(path.join(distAssetsDir, jsFile));
      const sizeKb = stats.size / 1024;
      expect(
        sizeKb,
        `Chunk ${jsFile} is ${sizeKb.toFixed(1)} KB, which exceeds the 500 KB limit`
      ).toBeLessThan(500);
    }
  });
});
