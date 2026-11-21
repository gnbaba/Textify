const FLAT_RANGE_THRESHOLD = 15;
const DARK_MEAN_THRESHOLD = 110;
const THRESHOLD_RATIO = 0.12;
const MIN_WINDOW_SIZE = 15;
const MAX_WINDOW_SIZE = 61;
const VARIANCE_EPSILON = 1e-6;
const PADDING = 25;

function createPaddedCanvas(
  width: number,
  height: number,
  thresholdedCanvas?: HTMLCanvasElement
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width + PADDING * 2;
  canvas.height = height + PADDING * 2;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to get 2D context for preprocessed canvas');
  }

  context.fillStyle = '#FFFFFF';
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (thresholdedCanvas) {
    context.imageSmoothingEnabled = false;
    context.drawImage(thresholdedCanvas, PADDING, PADDING);
  }

  return canvas;
}

function loadImage(objectUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image for preprocessing'));
    image.src = objectUrl;
  });
}

export async function preprocessCanvasImage(file: File): Promise<HTMLCanvasElement> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;

    if (width <= 0 || height <= 0) {
      throw new Error('Image dimensions must be greater than zero');
    }

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = width;
    sourceCanvas.height = height;

    const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!sourceContext) {
      throw new Error('Failed to get 2D context for source canvas');
    }

    sourceContext.fillStyle = '#FFFFFF';
    sourceContext.fillRect(0, 0, width, height);
    sourceContext.drawImage(image, 0, 0, width, height);

    const pixels = sourceContext.getImageData(0, 0, width, height).data;
    const pixelCount = width * height;
    const grayscale = new Uint8ClampedArray(pixelCount);
    let minY = 255;
    let maxY = 0;
    let totalY = 0;

    for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
      const dataIndex = pixelIndex * 4;
      const luminance = Math.round(
        0.299 * pixels[dataIndex] + 0.587 * pixels[dataIndex + 1] + 0.114 * pixels[dataIndex + 2]
      );

      grayscale[pixelIndex] = luminance;
      minY = Math.min(minY, luminance);
      maxY = Math.max(maxY, luminance);
      totalY += luminance;
    }

    if (maxY - minY < FLAT_RANGE_THRESHOLD) {
      return createPaddedCanvas(width, height);
    }

    const meanY = totalY / pixelCount;
    if (meanY < DARK_MEAN_THRESHOLD) {
      for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
        grayscale[pixelIndex] = 255 - grayscale[pixelIndex];
      }
    }

    let windowSize = Math.min(
      MAX_WINDOW_SIZE,
      Math.max(MIN_WINDOW_SIZE, Math.round(Math.min(width, height) / 8))
    );
    if (windowSize % 2 === 0) {
      windowSize += 1;
    }

    const stride = width + 1;
    const integral = new Uint32Array(stride * (height + 1));
    const squaredIntegral = new Float64Array(stride * (height + 1));

    for (let y = 0; y < height; y += 1) {
      let rowSum = 0;
      let squaredRowSum = 0;

      for (let x = 0; x < width; x += 1) {
        const pixelIndex = y * width + x;
        const value = grayscale[pixelIndex];
        rowSum += value;
        squaredRowSum += value * value;

        const integralIndex = (y + 1) * stride + x + 1;
        integral[integralIndex] = integral[y * stride + x + 1] + rowSum;
        squaredIntegral[integralIndex] = squaredIntegral[y * stride + x + 1] + squaredRowSum;
      }
    }

    const thresholdedCanvas = document.createElement('canvas');
    thresholdedCanvas.width = width;
    thresholdedCanvas.height = height;

    const thresholdedContext = thresholdedCanvas.getContext('2d');
    if (!thresholdedContext) {
      throw new Error('Failed to get 2D context for thresholded canvas');
    }

    const output = new ImageData(width, height);
    const radius = Math.floor(windowSize / 2);

    for (let y = 0; y < height; y += 1) {
      const y1 = Math.max(0, y - radius);
      const y2 = Math.min(height - 1, y + radius);

      for (let x = 0; x < width; x += 1) {
        const x1 = Math.max(0, x - radius);
        const x2 = Math.min(width - 1, x + radius);
        const count = (x2 - x1 + 1) * (y2 - y1 + 1);
        const pixelIndex = y * width + x;
        const outputIndex = pixelIndex * 4;
        let value = 255;

        if (count > 0) {
          const sum =
            integral[(y2 + 1) * stride + x2 + 1] -
            integral[y1 * stride + x2 + 1] -
            integral[(y2 + 1) * stride + x1] +
            integral[y1 * stride + x1];
          const squaredSum =
            squaredIntegral[(y2 + 1) * stride + x2 + 1] -
            squaredIntegral[y1 * stride + x2 + 1] -
            squaredIntegral[(y2 + 1) * stride + x1] +
            squaredIntegral[y1 * stride + x1];
          const mean = sum / count;
          const variance = Math.max(0, squaredSum / count - mean * mean);

          if (
            variance >= VARIANCE_EPSILON &&
            grayscale[pixelIndex] * count < sum * (1 - THRESHOLD_RATIO)
          ) {
            value = 0;
          }
        }

        output.data[outputIndex] = value;
        output.data[outputIndex + 1] = value;
        output.data[outputIndex + 2] = value;
        output.data[outputIndex + 3] = 255;
      }
    }

    thresholdedContext.putImageData(output, 0, 0);
    return createPaddedCanvas(width, height, thresholdedCanvas);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
