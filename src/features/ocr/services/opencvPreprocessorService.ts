/* eslint-disable @typescript-eslint/no-explicit-any */
import type { OcrOptions } from '../types/ocrTypes';

export class OpenCVPreprocessorService {
  /**
   * Preprocesses an image on a canvas using OpenCV.js WebAssembly.
   * Modifies the canvas in-place with the preprocessed binary image.
   */
  public static preprocess(canvas: HTMLCanvasElement, options?: OcrOptions): void {
    const cv = window.cv;
    if (!cv || !cv.Mat) {
      console.warn('OpenCV.js not loaded. Skipping WebAssembly preprocessing.');
      return;
    }

    const src = cv.imread(canvas);
    const gray = new cv.Mat();
    const blurred = new cv.Mat();
    const thresholded = new cv.Mat();
    const rotated = new cv.Mat();

    try {
      // 1. Convert to Grayscale
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

      // 2. Reduce Noise with Gaussian Blur
      const blurSize = new cv.Size(3, 3);
      cv.GaussianBlur(gray, blurred, blurSize, 0, 0, cv.BORDER_DEFAULT);

      // 3. Apply Thresholding (Binarization)
      const preset = options?.preset || 'document';

      if (preset === 'original') {
        // Do not binarize if 'original' is requested
        cv.imshow(canvas, src);
        return;
      }

      const threshType = preset === 'invert' ? cv.THRESH_BINARY_INV : cv.THRESH_BINARY;
      const thresholdMode = options?.thresholdMode || 'adaptive';
      const manualThreshVal = options?.threshold !== undefined ? options.threshold : 128;

      if (thresholdMode === 'manual') {
        // Manual global thresholding
        cv.threshold(blurred, thresholded, manualThreshVal, 255, threshType);
      } else {
        // Adaptive thresholding: Gaussian local window thresholding
        // Block size must be odd and > 1. 11 is standard for documents.
        cv.adaptiveThreshold(
          blurred,
          thresholded,
          255,
          cv.ADAPTIVE_THRESH_GAUSSIAN_C,
          threshType,
          11,
          2
        );
      }

      // 4. Deskewing (Optional rotational correction)
      // Check if deskew is enabled
      const shouldDeskew = options?.deskew !== undefined ? options.deskew : (preset === 'document');
      let processedMat = thresholded;

      if (shouldDeskew) {
        const angle = this.getDeskewAngle(cv, thresholded);
        if (Math.abs(angle) > 0.5) {
          const center = new cv.Point(thresholded.cols / 2, thresholded.rows / 2);
          const M = cv.getRotationMatrix2D(center, angle, 1.0);

          // Warp the original image (or binary image). Warping the binary image directly is faster.
          cv.warpAffine(
            thresholded,
            rotated,
            M,
            thresholded.size(),
            cv.INTER_LINEAR,
            cv.BORDER_CONSTANT,
            new cv.Scalar(255, 255, 255) // White background fill
          );

          processedMat = rotated;
          M.delete();
        }
      }

      // 5. Render preprocessed image back onto the canvas
      cv.imshow(canvas, processedMat);

    } catch (err) {
      console.error('OpenCV preprocessing error:', err);
      // Fallback: draw original image if cv errors out
      cv.imshow(canvas, src);
    } finally {
      // Manual garbage collection to prevent memory leaks in WASM heap
      src.delete();
      gray.delete();
      blurred.delete();
      thresholded.delete();
      rotated.delete();
    }
  }

  /**
   * Computes the angle of rotation needed to deskew the text.
   */
  private static getDeskewAngle(cv: any, binaryMat: any): number {
    const temp = new cv.Mat();
    const pts = new cv.Mat();

    try {
      // Invert the binary image temporarily so that text is white (255) and background is black (0)
      // minAreaRect calculates the bounds of non-zero (white) pixels.
      cv.bitwise_not(binaryMat, temp);
      cv.findNonZero(temp, pts);

      if (pts.empty()) {
        return 0;
      }

      const rect = cv.minAreaRect(pts);
      let angle = rect.angle;

      // minAreaRect angle rules in OpenCV:
      if (angle < -45) {
        angle = angle + 90;
      }

      // Only deskew if the tilt is noticeable (0.5 to 25 degrees)
      if (Math.abs(angle) > 0.5 && Math.abs(angle) < 25) {
        return angle;
      }

      return 0;
    } catch (err) {
      console.warn('Failed to calculate deskew angle:', err);
      return 0;
    } finally {
      temp.delete();
      pts.delete();
    }
  }
}
