// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  quotaCalls: 0,
}));

vi.mock('firebase-admin/app', () => ({
  cert: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({})),
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(() => ({
    verifyIdToken: vi.fn(async () => ({ uid: 'audit-user' })),
  })),
}));

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    doc: vi.fn(() => ({})),
    runTransaction: vi.fn(async (callback: (transaction: unknown) => Promise<void>) => {
      state.quotaCalls += 1;
      await callback({
        get: async () => ({ data: () => ({ count: 0 }) }),
        set: () => undefined,
      });
    }),
  })),
}));

import handler from '../../api/gemini-ocr';

type HandlerRequest = Parameters<typeof handler>[0];
type HandlerResponse = Parameters<typeof handler>[1];

const makeRequest = (body: unknown): HandlerRequest =>
  ({
    method: 'POST',
    headers: { authorization: 'Bearer audit-token' },
    body,
  }) as unknown as HandlerRequest;

const makeResponse = () => {
  let statusCode = 0;
  let payload: unknown;
  const response = {
    status(code: number) {
      statusCode = code;
      return response;
    },
    json(body: unknown) {
      payload = body;
      return response;
    },
  };

  return {
    response: response as unknown as HandlerResponse,
    status: () => statusCode,
    body: () => payload,
  };
};

const fetchMock = vi.fn();

beforeEach(() => {
  state.quotaCalls = 0;
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  process.env.GEMINI_API_KEY = 'audit-gemini-key';
  process.env.FIREBASE_PROJECT_ID = 'audit-project';
  process.env.FIREBASE_CLIENT_EMAIL = 'audit@example.com';
  process.env.FIREBASE_PRIVATE_KEY = 'line1\\nline2';
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Cloud OCR audit regressions', () => {
  it('rejects MAX_TOKENS truncation with HTTP 422 instead of returning partial text', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [
            {
              finishReason: 'MAX_TOKENS',
              content: { parts: [{ text: 'partial output' }] },
            },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    );

    const response = makeResponse();
    await handler(
      makeRequest({ imageBase64: 'aGVsbG8=', mimeType: 'image/png' }),
      response.response
    );

    expect(response.status()).toBe(422);
    expect(response.body()).toEqual({
      error: 'Cloud AI output was truncated (MAX_TOKENS). Try cropping a smaller region.',
    });
    expect(state.quotaCalls).toBe(1);
  });

  it('accepts a normal STOP response with HTTP 200', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [
            {
              finishReason: 'STOP',
              content: { parts: [{ text: 'clean output' }] },
            },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    );

    const response = makeResponse();
    await handler(
      makeRequest({ imageBase64: 'aGVsbG8=', mimeType: 'image/png' }),
      response.response
    );

    expect(response.status()).toBe(200);
    expect(response.body()).toEqual({ text: 'clean output' });
  });

  it('rejects an empty base64 payload with HTTP 400 before auth, quota, or Gemini', async () => {
    const response = makeResponse();
    await handler(
      makeRequest({ imageBase64: 'data:image/png;base64,', mimeType: 'image/png' }),
      response.response
    );

    expect(response.status()).toBe(400);
    expect(response.body()).toEqual({ error: 'Image payload cannot be empty.' });
    expect(state.quotaCalls).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a whitespace-only base64 payload with HTTP 400 before quota', async () => {
    const response = makeResponse();
    await handler(makeRequest({ imageBase64: '   ', mimeType: 'image/png' }), response.response);

    expect(response.status()).toBe(400);
    expect(response.body()).toEqual({ error: 'Image payload cannot be empty.' });
    expect(state.quotaCalls).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
