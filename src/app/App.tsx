import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { DocsPage } from '../pages/DocsPage';
import { LandingPage } from '../pages/LandingPage';
import { WorkspaceProvider } from '../shared/context/WorkspaceContext';

const OcrWorkspace = lazy(() =>
  import('../features/ocr/components/OcrWorkspace').then((module) => ({
    default: module.OcrWorkspace,
  }))
);

function App() {
  return (
    <WorkspaceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/docs" element={<DocsPage />} />

          <Route
            path="/app"
            element={
              <DashboardLayout>
                <div className="border border-[#20251F]/15 font-mono-industrial text-[#20251F] overflow-hidden bg-[#FFFDF7] shadow-drafting-sm">
                  {/* Header panel */}
                  <div className="p-5 md:p-6 bg-[#FFFDF7] border-b border-[#20251F]/15 relative">
                    <span className="absolute top-2.5 left-2.5 text-[10px] text-[#20251F]/30 font-bold select-none">
                      +
                    </span>
                    <div className="font-mono-industrial text-[9px] font-bold tracking-[0.18em] uppercase text-[#20251F]/50 mb-1.5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#214C3A] rounded-full" />
                      <span>SYS.WORKSPACE &bull; LOCAL WASM INGESTION</span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase text-[#20251F]">
                      EXTRACT TEXT
                    </h1>
                    <p className="mt-1 text-[10px] md:text-[11px] font-medium text-[#20251F]/60 uppercase tracking-wide">
                      LOCAL-FIRST OPTICAL RECOGNITION. PRIVATE BY DEFAULT.
                    </p>
                  </div>

                  {/* Workspace panel wrapper */}
                  <div className="bg-[#FFFDF7] p-4 md:p-6">
                    <Suspense
                      fallback={
                        <div className="h-[400px] w-full animate-pulse bg-[#F3EFE3]/30 border border-dashed border-[#20251F]/20 flex flex-col items-center justify-center font-mono-industrial text-[10px] font-bold uppercase text-[#20251F]/50">
                          <span>[ INITIALIZING CLIENT RUNTIME ]</span>
                        </div>
                      }
                    >
                      <OcrWorkspace />
                    </Suspense>
                  </div>
                </div>
              </DashboardLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </WorkspaceProvider>
  );
}

export default App;
