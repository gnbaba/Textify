import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, arrayUnion, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export interface ExtractionBlock {
  id: string;
  text: string;
  timestamp: number;
}

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

  useEffect(() => {
    if (!userId) {
      setDocuments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const documentsRef = collection(db, 'users', userId, 'documents');
    const q = query(documentsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedDocs: CloudDocument[] = querySnapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        const legacyBlocks = data.text ? [{ id: 'legacy', text: data.text, timestamp: data.timestamp }] : [];
        
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
    }, (err) => {
      console.error('Snapshot error:', err);
      setError("Unable to sync documents. Please check your connection.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const createSession = useCallback(async (text: string, title: string): Promise<CloudDocument | null> => {
    if (!userId) return null;
    try {
      setError(null);
      // Mobile-safe ID generation
      const safeId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Date.now().toString(36) + Math.random().toString(36).substring(2);

      const newBlock = { id: safeId, text, timestamp: Date.now() };
      const newDocData = { title, blocks: [newBlock], timestamp: Date.now() };
      const docRef = await addDoc(collection(db, 'users', userId, 'documents'), newDocData);
      
      return { id: docRef.id, ...newDocData } as CloudDocument;
    } catch (err) {
      console.error('Failed to create session:', err);
      setError("Could not create a new document session.");
      return null;
    }
  }, [userId]);

  const addToSession = useCallback(async (sessionId: string, text: string) => {
    if (!userId) return;
    try {
      setError(null);
      const newBlock = { id: crypto.randomUUID(), text, timestamp: Date.now() };
      const documentRef = doc(db, 'users', userId, 'documents', sessionId);
      await updateDoc(documentRef, {
        blocks: arrayUnion(newBlock),
        timestamp: Date.now() 
      });
    } catch (err) {
      console.error('Failed to add to session:', err);
      setError("Failed to save text to the cloud session.");
    }
  }, [userId]);

  const deleteExtraction = useCallback(async (documentId: string) => {
    if (!userId) return;
    try {
      setError(null);
      await deleteDoc(doc(db, 'users', userId, 'documents', documentId));
    } catch (err) {
      console.error('Failed to delete:', err);
      setError("Failed to delete the document.");
    }
  }, [userId]);

  const renameSession = useCallback(async (sessionId: string, newTitle: string) => {
    if (!userId || !newTitle.trim()) return;
    try {
      setError(null);
      const documentRef = doc(db, 'users', userId, 'documents', sessionId);
      await updateDoc(documentRef, { title: newTitle.trim() });
    } catch (err) {
      console.error('Failed to rename:', err);
      setError("Failed to rename the document.");
    }
  }, [userId]);

  const togglePinSession = useCallback(async (sessionId: string, currentPinnedStatus: boolean) => {
    if (!userId) return;
    try {
      setError(null);
      const documentRef = doc(db, 'users', userId, 'documents', sessionId);
      const nextPinned = !currentPinnedStatus;
      await updateDoc(documentRef, { 
        isPinned: nextPinned,
        pinnedAt: nextPinned ? Date.now() : null
      });
    } catch (err) {
      console.error('Failed to toggle pin:', err);
      setError("Failed to update pinned status.");
    }
  }, [userId]);

  return { documents, isLoading, error, createSession, addToSession, deleteExtraction, renameSession, togglePinSession };
};