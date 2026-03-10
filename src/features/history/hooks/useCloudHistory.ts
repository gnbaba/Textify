import { useState, useCallback } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export interface CloudDocument {
  id: string;
  title: string;
  text: string;
  timestamp: number;
}

export const useCloudHistory = (userId: string | undefined) => {
  const [documents, setDocuments] = useState<CloudDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setDocuments([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const documentsRef = collection(db, 'users', userId, 'documents');
      const q = query(documentsRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const fetchedDocs: CloudDocument[] = querySnapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          title: typeof data.title === 'string' ? data.title : 'Untitled',
          text: typeof data.text === 'string' ? data.text : '',
          timestamp: typeof data.timestamp === 'number' ? data.timestamp : 0,
        };
      });

      setDocuments(fetchedDocs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch history.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const saveExtraction = useCallback(async (text: string, title?: string) => {
    if (!userId) {
      setError('User must be authenticated to save extractions.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const documentsRef = collection(db, 'users', userId, 'documents');
      const newDocData = {
        title: title || 'Untitled Extraction',
        text,
        timestamp: Date.now(),
      };

      const docRef = await addDoc(documentsRef, newDocData);
      
      const newDocument: CloudDocument = {
        id: docRef.id,
        ...newDocData,
      };

      setDocuments((prevDocs) => [newDocument, ...prevDocs]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save extraction.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const deleteExtraction = useCallback(async (documentId: string) => {
    if (!userId) {
      setError('User must be authenticated to delete extractions.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const documentRef = doc(db, 'users', userId, 'documents', documentId);
      await deleteDoc(documentRef);
      
      setDocuments((prevDocs) => prevDocs.filter((d) => d.id !== documentId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete extraction.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    documents,
    isLoading,
    error,
    fetchHistory,
    saveExtraction,
    deleteExtraction,
  };
};