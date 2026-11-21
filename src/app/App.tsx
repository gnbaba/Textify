import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const LandingPage = lazy(() =>
  import('../pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const DocsPage = lazy(() => import('../pages/DocsPage').then((m) => ({ default: m.DocsPage })));
const DashboardLayout = lazy(() =>
  import('../components/layout/DashboardLayout').then((m) => ({ default: m.DashboardLayout }))
);
const WorkspaceProvider = lazy(() =>
  import('../shared/context/WorkspaceContext').then((m) => ({ default: m.WorkspaceProvider }))
);
const OcrWorkspace = lazy(() =>
  import('../features/ocr/components/OcrWorkspace').then((m) => ({ default: m.OcrWorkspace }))
);

const RouteFallback = (
  <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center font-mono-industrial text-xs uppercase tracking-widest text-[#20251F]/60">
    <span>[ LOADING RUNTIME ]</span>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={RouteFallback}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/docs" element={<DocsPage />} />

          <Route
            path="/app"
            element={
              <WorkspaceProvider>
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
              </WorkspaceProvider>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
