/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    cv?: any;
    Module?: {
      onRuntimeInitialized?: () => void;
    };
  }
}

let loadingPromise: Promise<any> | null = null;

export const loadOpenCv = (): Promise<any> => {
  if (window.cv && window.cv.Mat) {
    return Promise.resolve(window.cv);
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    // OpenCV.js calls window.Module.onRuntimeInitialized when WASM is compiled and ready
    window.Module = {
      onRuntimeInitialized: () => {
        if (window.cv) {
          resolve(window.cv);
        } else {
          reject(new Error('OpenCV initialized but window.cv is not defined.'));
        }
      },
    };

    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.10.0/opencv.js';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // In some builds, cv might be defined immediately, but we should wait for onRuntimeInitialized
      if (window.cv && window.cv.Mat && !window.Module?.onRuntimeInitialized) {
        resolve(window.cv);
      }
    };

    script.onerror = () => {
      loadingPromise = null;
      reject(new Error('Failed to load OpenCV.js script from CDN. Please check your internet connection.'));
    };

    document.body.appendChild(script);
  });

  return loadingPromise;
};
