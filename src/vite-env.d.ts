/// <reference types="vite/client" />

interface LenisInstance {
  start: () => void;
  stop: () => void;
  scrollTo: (
    target: number | string | Element,
    options?: {
      offset?: number;
      duration?: number;
      immediate?: boolean;
      lock?: boolean;
    }
  ) => void;
}

interface Window {
  __lenis?: LenisInstance;
  __ScrollTrigger?: unknown;
}
