import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { WorkspaceProvider } from '../shared/context/WorkspaceContext';
import { LandingPage } from '../pages/LandingPage';
import { DocsPage } from '../pages/DocsPage';

const OcrWorkspace = lazy(() => import('../features/ocr/components/OcrWorkspace').then(module => ({ default: module.OcrWorkspace })));

function App() {
  return (
    <WorkspaceProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<LandingPage />} />
          <Route path="/docs" element={<DocsPage />} />

          <Route path="/app" element={
            <DashboardLayout>
              <div className="border-2 border-[#4D694E] font-mono-industrial text-[#4D694E] divide-y-2 divide-[#4D694E] overflow-hidden bg-[#FFF3D5] shadow-[6px_6px_0px_0px_#4D694E]">
                {/* Header panel */}
                <div className="p-5 bg-[#FFF3D5] relative">
                  <span className="absolute top-2 left-2 text-[10px] text-[#4D694E]/25 font-bold">+</span>
                  <h1 className="text-lg font-black tracking-wide uppercase">
                    EXTRACT TEXT PROTOCOL
                  </h1>
                  <p className="mt-1.5 text-[10px] font-bold text-[#4D694E]/60 uppercase tracking-wide">
                    DROP GRAPHIC SUBSTRATE BELOW TO SCRAPE METADATA AND SAVE TO THE CLOUD HISTORY INDEX.
                  </p>
                </div>
                
                {/* Workspace panel wrapper */}
                <div className="bg-[#FFF3D5]/10 p-4 md:p-6">
                  <Suspense fallback={
                    <div className="h-[400px] w-full animate-pulse bg-[#FFF3D5]/40 border-2 border-dashed border-[#4D694E] flex flex-col items-center justify-center font-mono-industrial text-[10px] font-bold uppercase text-[#4D694E]/50">
                      <span>/// RETRIEVING WORKSPACE MODULES ///</span>
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