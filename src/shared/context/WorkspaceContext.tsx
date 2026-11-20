import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import {
  CloudDocument,
  CloudWriteResult,
  ExtractionBlock,
  useCloudHistory,
} from '../../features/history/hooks/useCloudHistory';

// Define the shape of our global state
export interface WorkspaceContextType {
  activeDocument: CloudDocument | null;
  setActiveDocument: (doc: CloudDocument | null) => void;
  documents: CloudDocument[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  generateDocumentId: () => string | null;
  ensureDocument: (
    documentId: string,
    title: string,
    timestamp: number
  ) => Promise<CloudWriteResult>;
  saveBlock: (documentId: string, block: ExtractionBlock) => Promise<CloudWriteResult>;
  deleteExtraction: (documentId: string) => Promise<boolean>;
  reorderBlocks: (documentId: string, orderedBlockIds: string[]) => Promise<boolean>;
  renameSession: (sessionId: string, newTitle: string) => Promise<boolean>;
  togglePinSession: (sessionId: string, currentPinnedStatus: boolean) => Promise<boolean>;
}

// Create the Context
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// Create the Provider Component that will wrap the app
export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [activeDocument, setActiveDocument] = useState<CloudDocument | null>(null);
  const cloudHistory = useCloudHistory(user?.uid);
  const prevUidRef = useRef<string | undefined>(user?.uid);

  useEffect(() => {
    const prevUid = prevUidRef.current;
    const currUid = user?.uid;

    if (prevUid && prevUid !== currUid) {
      setActiveDocument(null);
    }

    prevUidRef.current = currUid;
  }, [user?.uid]);

  const value: WorkspaceContextType = {
    activeDocument,
    setActiveDocument,
    ...cloudHistory,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
