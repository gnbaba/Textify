import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { db } from '../../../config/firebase';

export interface ExtractionBlock {
  id: string;
  text: string;
  timestamp: number;
  order?: number;
}

export type CloudWriteResult = { ok: true; documentId: string } | { ok: false; error: string };

export interface CloudDocument {
  id: string;
  title: string;
  blocks: ExtractionBlock[];
  timestamp: number;
  isPinned?: boolean;
  pinnedAt?: number;
}

export const useCloudHistory = (userId: string | undefined) => {
  const [documents, setDocuments] = useState<CloudDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const ensureDocumentRequestsRef = useRef(new Map<string, Promise<CloudWriteResult>>());

  useEffect(() => {
    if (!userId) {
      setDocuments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const documentsRef = collection(db, 'users', userId, 'documents');
    const q = query(documentsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedDocs: CloudDocument[] = querySnapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data();
          const legacyBlocks = data.text
            ? [{ id: 'legacy', text: data.text, timestamp: data.timestamp }]
            : [];

          return {
            id: docSnapshot.id,
            title: typeof data.title === 'string' ? data.title : 'Untitled',
            blocks: Array.isArray(data.blocks) ? data.blocks : legacyBlocks,
            timestamp: typeof data.timestamp === 'number' ? data.timestamp : 0,
            isPinned: typeof data.isPinned === 'boolean' ? data.isPinned : false,
            pinnedAt: typeof data.pinnedAt === 'number' ? data.pinnedAt : 0,
          };
        });

        // Sort: pinned first (ascending by pinnedAt), then unpinned (descending by timestamp)
        fetchedDocs.sort((a, b) => {
          const aPinned = a.isPinned || false;
          const bPinned = b.isPinned || false;
          if (aPinned && !bPinned) return -1;
          if (!aPinned && bPinned) return 1;
          if (aPinned && bPinned) {
            const aPinnedAt = a.pinnedAt || 0;
            const bPinnedAt = b.pinnedAt || 0;
            return aPinnedAt - bPinnedAt; // ascending: first pin at top (priority)
          }
          return b.timestamp - a.timestamp; // descending: newest unpinned at top
        });

        setDocuments(fetchedDocs);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Snapshot error:', err);
        setError('Unable to sync documents. Please check your connection.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const generateDocumentId = useCallback((): string | null => {
    if (!userId) return null;
    return doc(collection(db, 'users', userId, 'documents')).id;
  }, [userId]);

  const ensureDocument = useCallback(
    (documentId: string, title: string, timestamp: number): Promise<CloudWriteResult> => {
      if (!userId) {
        return Promise.resolve({ ok: false, error: 'Sign in before syncing extracted text.' });
      }

      const requestKey = `${userId}:${documentId}`;
      const existingRequest = ensureDocumentRequestsRef.current.get(requestKey);
      if (existingRequest) return existingRequest;

      const request = (async (): Promise<CloudWriteResult> => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          return { ok: false, error: 'Cloud sync is unavailable while offline.' };
        }

        try {
          setError(null);
          const documentRef = doc(db, 'users', userId, 'documents', documentId);
          const snapshot = await getDoc(documentRef);

          if (!snapshot.exists()) {
            await setDoc(documentRef, { title, timestamp }, { merge: true });
          }

          return { ok: true, documentId };
        } catch (err) {
          console.error('Failed to ensure cloud document:', err);
          setError('Could not create the cloud document.');
          return { ok: false, error: 'Could not create the cloud document.' };
        }
      })();

      ensureDocumentRequestsRef.current.set(requestKey, request);
      void request.then((result) => {
        if (!result.ok && ensureDocumentRequestsRef.current.get(requestKey) === request) {
          ensureDocumentRequestsRef.current.delete(requestKey);
        }
      });

      return request;
    },
    [userId]
  );

  const saveBlock = useCallback(
    async (documentId: string, block: ExtractionBlock): Promise<CloudWriteResult> => {
      if (!userId) {
        return { ok: false, error: 'Sign in before syncing extracted text.' };
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return { ok: false, error: 'Cloud sync is unavailable while offline.' };
      }

      try {
        setError(null);
        const documentRef = doc(db, 'users', userId, 'documents', documentId);
        await setDoc(documentRef, { blocks: arrayUnion(block) }, { merge: true });
        return { ok: true, documentId };
      } catch (err) {
        console.error('Failed to save extraction block:', err);
        setError('Failed to save text to the cloud document.');
        return { ok: false, error: 'Failed to save text to the cloud document.' };
      }
    },
    [userId]
  );

  const deleteExtraction = useCallback(
    async (documentId: string) => {
      if (!userId) return;
      try {
        setError(null);
        await deleteDoc(doc(db, 'users', userId, 'documents', documentId));
      } catch (err) {
        console.error('Failed to delete:', err);
        setError('Failed to delete the document.');
      }
    },
    [userId]
  );

  const renameSession = useCallback(
    async (sessionId: string, newTitle: string) => {
      if (!userId || !newTitle.trim()) return;
      try {
        setError(null);
        const documentRef = doc(db, 'users', userId, 'documents', sessionId);
        await updateDoc(documentRef, { title: newTitle.trim() });
      } catch (err) {
        console.error('Failed to rename:', err);
        setError('Failed to rename the document.');
      }
    },
    [userId]
  );

  const togglePinSession = useCallback(
    async (sessionId: string, currentPinnedStatus: boolean) => {
      if (!userId) return;
      try {
        setError(null);
        const documentRef = doc(db, 'users', userId, 'documents', sessionId);
        const nextPinned = !currentPinnedStatus;
        await updateDoc(documentRef, {
          isPinned: nextPinned,
          pinnedAt: nextPinned ? Date.now() : null,
        });
      } catch (err) {
        console.error('Failed to toggle pin:', err);
        setError('Failed to update pinned status.');
      }
    },
    [userId]
  );

  return {
    documents,
    isLoading,
    error,
    generateDocumentId,
    ensureDocument,
    saveBlock,
    deleteExtraction,
    renameSession,
    togglePinSession,
  };
};
