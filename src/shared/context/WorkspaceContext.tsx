import React, { createContext, useContext, useState } from 'react';
import { CloudDocument } from '../../features/history/hooks/useCloudHistory';

// Define the shape of our global state
interface WorkspaceContextType {
  activeDocument: CloudDocument | null;
  setActiveDocument: (doc: CloudDocument | null) => void;
}

// Create the Context
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// Create the Provider Component that will wrap the app
export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeDocument, setActiveDocument] = useState<CloudDocument | null>(null);

  return (
    <WorkspaceContext.Provider value={{ activeDocument, setActiveDocument }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

// Create a custom hook so the components can easily tune in
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};