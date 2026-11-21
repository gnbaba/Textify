import {
  ArrowLeft,
  BookOpen,
  CaretRight,
  Cpu,
  FolderSimple,
  GithubLogo,
  ShieldCheck,
  Sparkle,
  Warning,
} from '@phosphor-icons/react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Sidebar outline sections
const SECTIONS = [
  { id: 'overview', title: '01 / Overview & Features' },
  { id: 'architecture', title: '02 / Workspace Architecture' },
  { id: 'database', title: '03 / Firestore Blueprint' },
  { id: 'solid', title: '04 / SOLID Standards' },
  { id: 'developer', title: '05 / Developer Journey' },
];

export const DocsPage = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="overflow-x-hidden w-full max-w-full relative min-h-[100dvh] bg-[#F3EFE3] text-[#20251F] selection:bg-[#214C3A] selection:text-[#FFFDF7]">
      {/* Ambient overlays */}
      <div className="fixed inset-0 noise-bg pointer-events-none z-[1]" />
      <div className="fixed inset-0 halftone-overlay pointer-events-none z-[1]" />

      {/* Header bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFDF7] border-b border-[#20251F]/20">
        <nav className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-1.5 border border-[#20251F]/20 hover:border-[#20251F] hover:bg-[#20251F]/5 transition-colors flex items-center justify-center relative z-10"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" weight="bold" />
            </Link>
            <span className="font-mono-industrial text-[11px] font-bold tracking-[0.1em] uppercase flex items-center gap-1.5 text-[#20251F]">
              TEXTIFY<span className="text-[#20251F]/30">/</span>DOCS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/app"
              replace
              className="bg-[#214C3A] text-[#FFFDF7] px-4 py-1.5 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase hover:bg-[#183a2b] active:scale-[0.98] transition-all relative z-10 shadow-drafting-sm cursor-pointer"
            >
              RUN WORKSPACE &rarr;
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto pt-20 pb-16 px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar - Navigation Table of Contents */}
        <aside className="lg:col-span-3 lg:sticky lg:top-20 h-fit border border-[#20251F]/20 p-4 bg-[#FFFDF7] flex flex-col gap-2 shadow-drafting-sm">
          <div className="font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase text-[#20251F]/50 border-b border-[#20251F]/15 pb-2 mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#214C3A]" /> INDEX LISTING
          </div>
          <div className="flex flex-col gap-1 font-mono-industrial text-[10px] font-bold tracking-[0.05em] uppercase">
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`w-full text-left px-3 py-2 border flex items-center justify-between transition-all cursor-pointer ${
                  activeSection === sec.id
                    ? 'bg-[#214C3A] text-[#FFFDF7] border-[#214C3A] shadow-drafting-sm'
                    : 'border-transparent text-[#20251F]/70 hover:border-[#20251F]/30 hover:bg-[#20251F]/5 hover:text-[#20251F]'
                }`}
              >
                <span>{sec.title}</span>
                {activeSection === sec.id && (
                  <CaretRight className="w-3.5 h-3.5 text-[#D9E4CB]" weight="bold" />
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="lg:col-span-9 space-y-12">
          {/* Main Title Header */}
          <div className="border-b border-[#20251F]/20 pb-6">
            <div className="font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase text-[#20251F]/50 mb-3 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#214C3A] rounded-full" />
                SYS.DOCS: READY
              </span>
              <span className="text-[#20251F]/30">&bull;</span>
              <span>VER 1.0.4-WASM</span>
              <span className="text-[#20251F]/30">&bull;</span>
              <span>MODULE / ARCHITECTURE</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[-0.03em] text-[#20251F]">
              TECHNICAL
              <br />
              DOCUMENTATION.
            </h1>
            <p className="mt-4 font-mono-industrial text-[11px] md:text-[12px] font-semibold tracking-[0.03em] leading-[1.6] uppercase text-[#20251F]/65 max-w-3xl">
              Complete architectural blueprint and specification for the Textify client-side
              Document Processing app.
            </p>
          </div>

          {/* Section 01: Overview */}
          <section id="overview" className="border-b border-[#20251F]/20 pb-8 space-y-4">
            <div className="flex items-center gap-2 font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase text-[#20251F]/50">
              <Sparkle className="w-4 h-4 text-[#E96C3F]" weight="bold" /> 01 / OVERVIEW & CORE
              FEATURES
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#20251F]">
              LOCAL TRANSLATION PIPELINE
            </h2>
            <div className="font-mono-industrial text-[11px] font-semibold tracking-[0.02em] uppercase text-[#20251F]/70 space-y-4 leading-[1.6]">
              <p>
                Textify is an open-source Document Processing utility designed to ingest scanned
                documents (invoices, receipts, contracts, graphics), extract structured text using
                local OCR engines, validate outputs, and sync them securely.
              </p>
              <div className="border border-[#20251F]/20 p-4 bg-[#FFFDF7] space-y-3 shadow-drafting-sm">
                <div>
                  <span className="text-[#20251F] font-black">A. MULTI-SOURCE INGESTION</span>
                  <p className="text-[10px] text-[#20251F]/60 mt-1">
                    Accepts PNGs, JPEGs, TIFFs, and WebPs directly into the workspace container
                    under a client-side layout constraint.
                  </p>
                </div>
                <div>
                  <span className="text-[#20251F] font-black">B. LOCAL OCR ENGINE</span>
                  <p className="text-[10px] text-[#20251F]/60 mt-1">
                    Runs Tesseract.js locally inside separate browser Web Workers. Character
                    translation is fully isolated within the browser viewport.
                  </p>
                </div>
                <div>
                  <span className="text-[#20251F] font-black">
                    C. REAL-TIME SESSION FEED & SORTING
                  </span>
                  <p className="text-[10px] text-[#20251F]/60 mt-1">
                    Draggable blocks allow sorting, arranging, and compiling individual parsed text
                    segments before final layout extraction.
                  </p>
                </div>
                <div>
                  <span className="text-[#20251F] font-black">D. CLOUD SYNCHRONIZATION</span>
                  <p className="text-[10px] text-[#20251F]/60 mt-1">
                    Allows users to link their private workspaces to Firebase Cloud Firestore for
                    synchronized session feeds.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 02: Architecture */}
          <section id="architecture" className="border-b border-[#20251F]/20 pb-8 space-y-4">
            <div className="flex items-center gap-2 font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase text-[#20251F]/50">
              <Cpu className="w-4 h-4 text-[#214C3A]" weight="bold" /> 02 / WORKSPACE STRUCTURE
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#20251F]">
              MODULAR SOURCE DIRECTORY
            </h2>
            <div className="font-mono-industrial text-[11px] font-semibold tracking-[0.02em] uppercase text-[#20251F]/70 space-y-4 leading-[1.6]">
              <p>
                Textify is built using a features-oriented modular architecture. It encapsulates
                configurations, DTOs, contexts, and helper wrappers:
              </p>

              {/* Directory Map */}
              <div className="bg-[#FFFDF7] border border-[#20251F]/20 p-4 font-mono-industrial text-[10px] text-[#20251F] leading-relaxed shadow-drafting-sm">
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#20251F]/10 font-bold uppercase text-[#20251F]/80">
                  <FolderSimple className="w-4 h-4 text-[#214C3A]" /> Source Directory Map
                </div>
                <div>src/</div>
                <div className="pl-4">
                  ├── app/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                  &nbsp;# Routing and global css files
                </div>
                <div className="pl-4">
                  ├── components/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; # Core layout
                  shells (DashboardLayout)
                </div>
                <div className="pl-4">
                  ├── features/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; # Feature
                  modules
                </div>
                <div className="pl-8">
                  ├── auth/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; #
                  Authentication logic & widgets
                </div>
                <div className="pl-8">
                  ├── history/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;# Session logs
                  & Firestore synchronization
                </div>
                <div className="pl-8">
                  └── ocr/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;#
                  Tesseract scanning & drag-drop blocks
                </div>
                <div className="pl-4">
                  └── shared/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; #
                  Common utilities and typings
                </div>
                <div className="pl-8">
                  ├── context/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;# Workspace
                  global state controller
                </div>
                <div className="pl-8">
                  ├── types/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;# System
                  DTO models & type definitions
                </div>
                <div className="pl-8">
                  └── utils/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;# PDF
                  engines and text copy utils
                </div>
              </div>

              {/* Service Boundaries */}
              <div className="space-y-2">
                <span className="font-black text-[#20251F] uppercase">
                  System Request Lifecycle & Boundaries
                </span>
                <p>
                  1. **Ingest**: Visual substrate (document image) dropped into Dropzone container.
                </p>
                <p>
                  2. **OCR Worker Execution**: React context triggers local worker threads.
                  Tesseract parses the image buffers and resolves layout boundaries.
                </p>
                <p>
                  3. **State Management**: Extracted textual arrays populate the dnd-kit sortable
                  container.
                </p>
                <p>
                  4. **Sync / Export**: Sorted block hierarchies are either exported to
                  clipboard/PDF or synchronized to Firestore.
                </p>
              </div>
            </div>
          </section>

          {/* Section 03: Database/Firestore */}
          <section id="database" className="border-b border-[#20251F]/20 pb-8 space-y-4">
            <div className="flex items-center gap-2 font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase text-[#20251F]/50">
              <ShieldCheck className="w-4 h-4 text-[#214C3A]" weight="bold" /> 03 / FIRESTORE
              SCHEMAS & SECURITIES
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#20251F]">
              STRUCTURED CLOUD STORAGE
            </h2>
            <div className="font-mono-industrial text-[11px] font-semibold tracking-[0.02em] uppercase text-[#20251F]/70 space-y-4 leading-[1.6]">
              <p>
                Data synchronization utilizes Google Cloud Firestore. Multi-tenant isolation is
                enforced at both application levels and cloud rules.
              </p>

              {/* Firestore Collections Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono-industrial text-[10px] border-collapse border border-[#20251F]/20 shadow-drafting-sm">
                  <thead>
                    <tr className="bg-[#20251F] text-[#FFFDF7] uppercase font-bold">
                      <th className="p-3 border-r border-[#20251F]/40">Collection / Path</th>
                      <th className="p-3 border-r border-[#20251F]/40">Constraints</th>
                      <th className="p-3">Primary Usage</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#FFFDF7] text-[#20251F] uppercase">
                    <tr className="border-b border-[#20251F]/15">
                      <td className="p-3 border-r border-[#20251F]/15 font-bold">
                        {'users / {uid} / documents / {documentId}'}
                      </td>
                      <td className="p-3 border-r border-[#20251F]/15">
                        uid (Auth match), documentId
                      </td>
                      <td className="p-3">
                        Primary document index with validated top-level blocks array, title,
                        timestamp, isPinned, and pinnedAt. Protected by memoryLocalCache().
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r border-[#20251F]/15 font-bold">
                        {'users / {uid} / usage / {dateId}'}
                      </td>
                      <td className="p-3 border-r border-[#20251F]/15">
                        dateId (YYYY-MM-DD), count &le; 20
                      </td>
                      <td className="p-3">
                        Daily Cloud AI quota tracker. Client read-only; updated via serverless proxy
                        admin transactions.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Firestore Transaction Safe Sync Example */}
              <div>
                <span className="font-black text-[#20251F] uppercase block mb-2">
                  Transactional Document Block Reorder (TypeScript / Firestore)
                </span>
                <p className="mb-3">
                  This transaction coordinates individual block order mappings inside Firestore
                  using runTransaction with concurrent-block preservation:
                </p>
                <div className="bg-[#FFFDF7] border border-[#20251F]/20 p-4 text-[9px] md:text-[10px] font-mono-industrial text-[#20251F] overflow-x-auto whitespace-pre shadow-drafting-sm">
                  {`import { doc, runTransaction } from "firebase/firestore";
import { db } from "../config/firebase";

export async function reorderBlocks(
  userId: string, 
  documentId: string, 
  orderedBlockIds: string[]
): Promise<boolean> {
  const documentRef = doc(db, "users", userId, "documents", documentId);

  await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(documentRef);
    if (!docSnap.exists()) throw new Error("Document not found");

    const existingBlocks = docSnap.data().blocks || [];
    const blockMap = new Map(existingBlocks.map((b) => [b.id, b]));
    const updatedOrderedBlocks = [];
    let currentOrder = 1000;

    for (const id of orderedBlockIds) {
      const b = blockMap.get(id);
      if (b) {
        updatedOrderedBlocks.push({ ...b, order: currentOrder });
        currentOrder += 1000;
        blockMap.delete(id);
      }
    }

    // Preserve any concurrent blocks saved on server
    for (const remaining of blockMap.values()) {
      updatedOrderedBlocks.push({ ...remaining, order: currentOrder });
      currentOrder += 1000;
    }

    transaction.update(documentRef, { blocks: updatedOrderedBlocks });
  });

  return true;
}`}
                </div>
              </div>
            </div>
          </section>

          {/* Section 04: SOLID Coding Standards */}
          <section id="solid" className="border-b border-[#20251F]/20 pb-8 space-y-4">
            <div className="flex items-center gap-2 font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase text-[#20251F]/50">
              <Cpu className="w-4 h-4 text-[#214C3A]" weight="bold" /> 04 / ARCHITECTURE & CORE
              SERVICES
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#20251F]">
              STRICT IMPLEMENTATION FLOW
            </h2>
            <div className="font-mono-industrial text-[11px] font-semibold tracking-[0.02em] uppercase text-[#20251F]/70 space-y-4 leading-[1.6]">
              <p>
                Textify follows strict layer-decoupling principles. Data is bound to boundaries
                using explicit flow constraints:
              </p>

              <div className="bg-[#FFFDF7] border border-[#20251F]/20 p-4 text-center font-black uppercase text-[#20251F] shadow-drafting-sm">
                Route &rarr; Layout &rarr; Workspace Component &rarr; Hooks &rarr; Core Services
              </div>

              <div className="space-y-4 mt-4">
                <div>
                  <span className="font-black text-[#20251F] uppercase">
                    Asynchronous Hook Lifecycle Architecture
                  </span>
                  <p className="text-[10px] text-[#20251F]/60 mt-1">
                    Textify uses functional React hooks to cleanly separate presentation from state
                    and side effects:
                  </p>
                  <div className="bg-[#FFFDF7] border border-[#20251F]/20 p-4 text-[9px] md:text-[10px] font-mono-industrial text-[#20251F] overflow-x-auto whitespace-pre mt-2 shadow-drafting-sm">
                    {`// Layer Hierarchy:
// Route (App.tsx)
//   └── Layout (DashboardLayout.tsx)
//         └── Component (OcrWorkspace.tsx)
//               ├── State Hooks (useOcrProcessor, useCloudHistory)
//               └── Core Services (routingOcrService, canvasPreprocessorService, geminiOcrService)

export const useOcrProcessor = (ocrService: IOcrService) => {
  // Manages stale request cancellation via requestIdRef and AbortController
  // Emits real-time progress events without memory leaks
};`}
                  </div>
                </div>

                <div>
                  <span className="font-black text-[#20251F] uppercase">
                    Local-First Routing Service Pattern
                  </span>
                  <p className="text-[10px] text-[#20251F]/60 mt-1">
                    OCR processing remains 100% client-side by default with optional, explicit Cloud
                    AI routing:
                  </p>
                  <div className="bg-[#FFFDF7] border border-[#20251F]/20 p-4 text-[9px] md:text-[10px] font-mono-industrial text-[#20251F] overflow-x-auto whitespace-pre mt-2 shadow-drafting-sm">
                    {`class RoutingOcrService implements IOcrService {
  async extractText(file: File, mode: ExtractionMode, options?: OcrOptions) {
    if (options?.engine === 'ai') {
      // Explicit opt-in only: routes through authenticated /api/gemini-ocr proxy
      return geminiOcrService.extractText(file, mode, options);
    }
    // Default path: 100% local WASM Tesseract. Zero external telemetry.
    return tesseractOcrService.extractText(file, mode, options);
  }
}`}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 05: Developer Notes */}
          <section id="developer" className="pb-8 space-y-4">
            <div className="flex items-center gap-2 font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase text-[#20251F]/50">
              <Warning className="w-4 h-4 text-[#E96C3F]" weight="bold" /> 05 / DEV LOGS &
              DISCLAIMER
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#20251F]">
              DEVELOPMENT REFLECTION INDEX
            </h2>
            <div className="font-mono-industrial text-[11px] font-semibold tracking-[0.02em] uppercase text-[#20251F]/70 space-y-4 leading-[1.6]">
              <p>
                Textify has been built as a functional open-source document scraping application and
                as a core learning pipeline in my personal development journey as a software
                developer. Writing this utility has allowed me to deep-dive into client-side async
                engines, client-side WebAssembly Web Workers, data synchronizations with Firestore
                collections, and modular SOLID structure systems.
              </p>

              <div className="border border-dashed border-[#20251F]/30 p-4 bg-[#FFFDF7]">
                <span className="font-black text-[#20251F] uppercase">
                  Project Maturity & Execution Note
                </span>
                <p className="text-[10px] text-[#20251F]/65 uppercase mt-1.5 leading-relaxed">
                  As this project is a continuous learning process, it should be noted that some
                  structural edge cases, OCR parsing offsets, or environment-specific latency gaps
                  may occur during runtime. I am committed to iteratively debugging the code,
                  optimizing the Web Worker lifecycles, and improving overall stability as I expand
                  my engineering capabilities.
                </p>
              </div>

              <p>
                I appreciate your feedback and interest in the codebase. Feel free to contribute or
                check the project on GitHub to inspect development progression.
              </p>

              <div className="pt-4 flex items-center gap-3">
                <a
                  href="https://github.com/gnbaba/Textify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#214C3A] text-[#FFFDF7] px-5 py-2.5 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase hover:bg-[#183a2b] active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-drafting-sm cursor-pointer"
                >
                  <GithubLogo className="w-4 h-4" weight="bold" /> Github Repo
                </a>
                <Link
                  to="/"
                  className="border border-[#20251F]/30 text-[#20251F] px-5 py-2.5 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase hover:bg-[#20251F]/5 active:scale-[0.98] transition-all cursor-pointer"
                >
                  &larr; Back to Landing
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#F3EFE3] border-t border-[#20251F]/20 py-8 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase text-[#20251F]/50">
          <div className="md:col-span-6">
            &copy; {new Date().getFullYear()} TEXTIFY INC. &bull; DEVELOPER DOCUMENTATION PORTAL.
          </div>
          <div className="md:col-span-6 text-left md:text-right">
            BUILT BY @GNBABA &bull; PORTAL REV 1.0.4-WASM
          </div>
        </div>
      </footer>
    </main>
  );
};
