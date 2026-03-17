import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { OcrWorkspace } from '../features/ocr/components/OcrWorkspace';
import { WorkspaceProvider } from '../shared/context/WorkspaceContext';

function App() {
  return (
    <WorkspaceProvider>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#4D694E] sm:text-4xl">
              Extract Text
            </h1>
            <p className="mt-2 text-[#4D694E]/80 font-medium">
              Drop an image below to extract its text and save it to the cloud.
            </p>
          </div>
          
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-[#4D694E]/10">
            <OcrWorkspace />
          </div>
        </div>
      </DashboardLayout>
    </WorkspaceProvider>
  );
}

export default App;