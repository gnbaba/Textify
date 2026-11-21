// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type SnapshotDocument = {
  id: string;
  data: () => Record<string, unknown>;
};

type Snapshot = {
  docs: SnapshotDocument[];
};

const state = vi.hoisted(() => ({
  snapshotCallback: null as ((snapshot: Snapshot) => void) | null,
  unsubscribe: vi.fn(),
}));

vi.mock('../../src/config/firebase', () => ({ db: {} }));

vi.mock('firebase/firestore', () => ({
  arrayUnion: vi.fn(),
  collection: vi.fn(() => ({})),
  deleteDoc: vi.fn(),
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(),
  limit: vi.fn(() => ({})),
  onSnapshot: vi.fn((_query: unknown, callback: (snapshot: Snapshot) => void) => {
    state.snapshotCallback = callback;
    return state.unsubscribe;
  }),
  orderBy: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  runTransaction: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
}));

import { useCloudHistory } from '../../src/features/history/hooks/useCloudHistory';

const snapshotWith = (id: string, title: string): Snapshot => ({
  docs: [
    {
      id,
      data: () => ({ title, blocks: [], timestamp: 1 }),
    },
  ],
});

beforeEach(() => {
  state.snapshotCallback = null;
  state.unsubscribe.mockClear();
});

describe('useCloudHistory account isolation', () => {
  it('clears account A documents synchronously when uid changes to account B', () => {
    const { result, rerender } = renderHook(
      ({ uid }: { uid: string | undefined }) => useCloudHistory(uid),
      { initialProps: { uid: 'alice' as string | undefined } }
    );

    act(() => {
      state.snapshotCallback?.(snapshotWith('alice-doc', 'Alice Document'));
    });

    expect(result.current.documents.map((document) => document.title)).toEqual(['Alice Document']);

    rerender({ uid: 'bob' });

    expect(result.current.documents).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.hasMore).toBe(false);
    expect(state.unsubscribe).toHaveBeenCalledTimes(1);

    act(() => {
      state.snapshotCallback?.(snapshotWith('bob-doc', 'Bob Document'));
    });

    expect(result.current.documents.map((document) => document.title)).toEqual(['Bob Document']);
  });
});
