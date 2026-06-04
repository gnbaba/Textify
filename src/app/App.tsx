import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { WorkspaceProvider } from '../shared/context/WorkspaceContext';
import { LandingPage } from '../pages/LandingPage';

const OcrWorkspace = lazy(() => import('../features/ocr/components/OcrWorkspace').then(module => ({ default: module.OcrWorkspace })));

function App() {
  return (
    <WorkspaceProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<LandingPage />} />

          <Route path="/app" element={
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
                  <Suspense fallback={
                    <div className="h-[600px] w-full animate-pulse bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center">
                      <span className="text-[#4D694E]/50 font-medium">Loading workspace...</span>
                    </div>
                  }>
                    <OcrWorkspace />
                  </Suspense>
                </div>
              </div>
            </DashboardLayout>
          } />
        </Routes>
      </BrowserRouter>
    </WorkspaceProvider>
  );
}

export default App;