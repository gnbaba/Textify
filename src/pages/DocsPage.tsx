import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Cpu,
  ShieldCheck,
  Warning,
  GithubLogo,
  CaretRight,
  Sparkle,
  FolderSimple,
} from '@phosphor-icons/react';

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
    <main className="overflow-x-hidden w-full max-w-full relative min-h-[100dvh] bg-[#FFF3D5] text-[#4D694E] selection:bg-[#4D694E] selection:text-[#FFF3D5]">
      {/* Ambient overlays */}
      <div className="fixed inset-0 noise-bg pointer-events-none z-[1]" />
      <div className="fixed inset-0 halftone-overlay pointer-events-none z-[1]" />

      {/* Header bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFF3D5] border-b-2 border-[#4D694E]">
        <nav className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-1.5 border border-[#4D694E]/30 hover:border-[#4D694E] transition-colors flex items-center justify-center relative z-10" aria-label="Go back">
              <ArrowLeft className="w-4 h-4" weight="bold" />
            </Link>
            <span className="font-mono-industrial text-[11px] font-bold tracking-[0.1em] uppercase flex items-center gap-1.5">
              TEXTIFY<span className="text-[#4D694E]/40">/</span>DOCS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/app"
              replace
              className="bg-[#4D694E] text-[#FFF3D5] px-4 py-1.5 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase hover:bg-[#3a4f3b] active:scale-[0.97] transition-all border-2 border-[#4D694E] relative z-10"
            >
              RUN WORKSPACE
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto pt-20 pb-16 px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar - Navigation Table of Contents */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24 h-fit border-2 border-[#4D694E] p-4 bg-[#FFF3D5] flex flex-col gap-2">
          <div className="font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase text-[#4D694E]/40 border-b border-[#4D694E]/15 pb-2 mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> INDEX LISTING
          </div>
          <div className="flex flex-col gap-1 font-mono-industrial text-[10px] font-bold tracking-[0.05em] uppercase">
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`w-full text-left px-3 py-2 border flex items-center justify-between transition-all ${
                  activeSection === sec.id
                    ? 'bg-[#4D694E] text-[#FFF3D5] border-[#4D694E]'
                    : 'border-transparent hover:border-[#4D694E]/40 hover:bg-[#4D694E]/5'
                }`}
              >
                <span>{sec.title}</span>
                {activeSection === sec.id && <CaretRight className="w-3.5 h-3.5" weight="bold" />}
              </button>
            ))}
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="lg:col-span-9 space-y-12">
          
          {/* Main Title Header */}
          <div className="border-b-2 border-[#4D694E] pb-6">
            <div className="font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase text-[#4D694E]/50 mb-3 flex items-center gap-2 flex-wrap">
              <span>SYS.DOCS: READY</span>
              <span className="text-[#4D694E]/20">///</span>
              <span>VER 1.0.0</span>
              <span className="text-[#4D694E]/20">///</span>
              <span>MODULE / DOCS</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[-0.03em] text-[#4D694E]">
              TECHNICAL<br />DOCUMENTATION.
            </h1>
            <p className="mt-4 font-mono-industrial text-[11px] md:text-[12px] font-semibold tracking-[0.03em] leading-[1.6] uppercase text-[#4D694E]/65 max-w-3xl">
              Complete reference and blueprint for the Textify client-side Document Processing app.
            </p>
          </div>

          {/* Section 01: Overview */}
          <section id="overview" className="border-b-2 border-[#4D694E] pb-8 space-y-4">
            <div className="flex items-center gap-2 font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase text-[#4D694E]/40">
              <Sparkle className="w-4 h-4 text-[#4D694E]/50" weight="bold" /> 01 / OVERVIEW & CORE FEATURES
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#4D694E]">
              LOCAL TRANSLATION PIPELINE
            </h2>
            <div className="font-mono-industrial text-[11px] font-semibold tracking-[0.02em] uppercase text-[#4D694E]/70 space-y-4 leading-[1.6]">
              <p>
                Textify is an open-source Document Processing utility designed to ingest scanned documents (invoices, receipts, contracts, graphics), extract structured text using local OCR engines, validate outputs, and sync them securely.
              </p>
              <div className="border-2 border-[#4D694E] p-4 bg-[#FFF3D5] space-y-3">
                <div>
                  <span className="text-[#4D694E] font-black">A. MULTI-SOURCE INGESTION</span>
                  <p className="text-[10px] text-[#4D694E]/60 mt-1">
                    Accepts PNGs, JPEGs, TIFFs, and WebPs directly into the workspace container under a client-side layout constraint.
                  </p>
                </div>
                <div>
                  <span className="text-[#4D694E] font-black">B. LOCAL OCR ENGINE</span>
                  <p className="text-[10px] text-[#4D694E]/60 mt-1">
                    Runs Tesseract.js locally inside separate browser Web Workers. Character translation is fully isolated within the browser viewport.
                  </p>
                </div>
                <div>
                  <span className="text-[#4D694E] font-black">C. REAL-TIME SESSION FEED & SORTING</span>
                  <p className="text-[10px] text-[#4D694E]/60 mt-1">
                    Draggable blocks allow sorting, arranging, and compiling individual parsed text segments before final layout extraction.
                  </p>
                </div>
                <div>
                  <span className="text-[#4D694E] font-black">D. CLOUD SYNCHRONIZATION</span>
                  <p className="text-[10px] text-[#4D694E]/60 mt-1">
                    Allows users to link their private workspaces to Firebase Cloud Firestore for synchronized session feeds.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 02: Architecture */}
          <section id="architecture" className="border-b-2 border-[#4D694E] pb-8 space-y-4">
            <div className="flex items-center gap-2 font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase text-[#4D694E]/40">
              <Cpu className="w-4 h-4 text-[#4D694E]/50" weight="bold" /> 02 / WORKSPACE STRUCTURE
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#4D694E]">
              MODULAR SOURCE DIRECTORY
            </h2>
            <div className="font-mono-industrial text-[11px] font-semibold tracking-[0.02em] uppercase text-[#4D694E]/70 space-y-4 leading-[1.6]">
              <p>
                Textify is built using a features-oriented modular architecture. It encapsulates configurations, DTOs, contexts, and helper wrappers:
              </p>
              
              {/* Directory Map */}
              <div className="bg-[#FFF3D5] border-2 border-[#4D694E] p-4 font-mono-industrial text-[10px] text-[#4D694E] leading-relaxed shadow-[4px_4px_0px_0px_#4D694E]">
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#4D694E]/10 font-bold uppercase">
                  <FolderSimple className="w-4 h-4" /> Source Directory Map
                </div>
                <div>src/</div>
                <div className="pl-4">├── app/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;# Routing and global css files</div>
                <div className="pl-4">├── components/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; # Core layout shells (DashboardLayout)</div>
                <div className="pl-4">├── features/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; # Feature modules</div>
                <div className="pl-8">├── auth/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; # Authentication logic & widgets</div>
                <div className="pl-8">├── history/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;# Session logs & Firestore synchronization</div>
                <div className="pl-8">└── ocr/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;# Tesseract scanning & drag-drop blocks</div>
                <div className="pl-4">└── shared/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; # Common utilities and typings</div>
                <div className="pl-8">├── context/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;# Workspace global state controller</div>
                <div className="pl-8">├── types/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;# System DTO models & type definitions</div>
                <div className="pl-8">└── utils/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;# PDF engines and text copy utils</div>
              </div>

              {/* Service Boundaries */}
              <div className="space-y-2">
                <span className="font-black text-[#4D694E] uppercase">System Request Lifecycle & Boundaries</span>
                <p>
                  1. **Ingest**: Visual substrate (document image) dropped into Dropzone container.
                </p>
                <p>
                  2. **OCR Worker Execution**: React context triggers local worker threads. Tesseract parses the image buffers and resolves layout boundaries.
                </p>
                <p>
                  3. **State Management**: Extracted textual arrays populate the dnd-kit sortable container.
                </p>
                <p>
                  4. **Sync / Export**: Sorted block hierarchies are either exported to clipboard/PDF or synchronized to Firestore.
                </p>
              </div>
            </div>
          </section>

          {/* Section 03: Database/Firestore */}
          <section id="database" className="border-b-2 border-[#4D694E] pb-8 space-y-4">
            <div className="flex items-center gap-2 font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase text-[#4D694E]/40">
              <ShieldCheck className="w-4 h-4 text-[#4D694E]/50" weight="bold" /> 03 / FIRESTORE SCHEMAS & SECURITIES
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#4D694E]">
              STRUCTURED CLOUD STORAGE
            </h2>
            <div className="font-mono-industrial text-[11px] font-semibold tracking-[0.02em] uppercase text-[#4D694E]/70 space-y-4 leading-[1.6]">
              <p>
                Data synchronization utilizes Google Cloud Firestore. Multi-tenant isolation is enforced at both application levels and cloud rules.
              </p>
              
              {/* Firestore Collections Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono-industrial text-[10px] border-collapse border-2 border-[#4D694E]">
                  <thead>
                    <tr className="bg-[#4D694E] text-[#FFF3D5] uppercase font-bold border-b-2 border-[#4D694E]">
                      <th className="p-3 border-r border-[#4D694E]">Collection / Path</th>
                      <th className="p-3 border-r border-[#4D694E]">Constraints</th>
                      <th className="p-3">Primary Usage</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#FFF3D5] text-[#4D694E] uppercase">
                    <tr className="border-b border-[#4D694E]">
                      <td className="p-3 border-r border-[#4D694E] font-bold">{"users / {uid}"}</td>
                      <td className="p-3 border-r border-[#4D694E]">uid (FK)</td>
                      <td className="p-3">User profiles and auth sync metadata.</td>
                    </tr>
                    <tr className="border-b border-[#4D694E]">
                      <td className="p-3 border-r border-[#4D694E] font-bold">{"history / {sessionId}"}</td>
                      <td className="p-3 border-r border-[#4D694E]">sessionId (UUID), userId (FK)</td>
                      <td className="p-3">Scanned history session headers.</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r border-[#4D694E] font-bold">{"history / {sessionId} / blocks"}</td>
                      <td className="p-3 border-r border-[#4D694E]">sorted_index (NUM)</td>
                      <td className="p-3">Individual parsed text segments inside a session.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Firestore Transaction Safe Sync Example */}
              <div>
                <span className="font-black text-[#4D694E] uppercase block mb-2">Atomic Block Sync Transaction (TypeScript / Firestore)</span>
                <p className="mb-3">
                  This transaction-safe update coordinates individual block order mappings inside Firestore atomic batches:
                </p>
                <div className="bg-[#FFF3D5] border-2 border-[#4D694E] p-4 text-[9px] md:text-[10px] font-mono-industrial text-[#4D694E] overflow-x-auto whitespace-pre shadow-[4px_4px_0px_0px_#4D694E]">
{`import { writeBatch, doc, collection } from "firebase/firestore";
import { db } from "../config/firebase";

export async function syncSortedBlocks(
  userId: string, 
  sessionId: string, 
  blocks: { id: string; text: string; order: number }[]
) {
  const batch = writeBatch(db);
  const sessionRef = doc(db, "users", userId, "history", sessionId);
  
  // Set session update timestamp
  batch.update(sessionRef, { updatedAt: new Date() });

  blocks.forEach((block) => {
    const blockRef = doc(collection(sessionRef, "blocks"), block.id);
    batch.set(blockRef, {
      text: block.text,
      order: block.order,
      syncedAt: new Date()
    });
  });

  await batch.commit();
}`}
                </div>
              </div>
            </div>
          </section>

          {/* Section 04: SOLID Coding Standards */}
          <section id="solid" className="border-b-2 border-[#4D694E] pb-8 space-y-4">
            <div className="flex items-center gap-2 font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase text-[#4D694E]/40">
              <Cpu className="w-4 h-4 text-[#4D694E]/50" weight="bold" /> 04 / SOLID CODING STANDARDS
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#4D694E]">
              STRICT IMPLEMENTATION FLOW
            </h2>
            <div className="font-mono-industrial text-[11px] font-semibold tracking-[0.02em] uppercase text-[#4D694E]/70 space-y-4 leading-[1.6]">
              <p>
                Textify follows strict layer-decoupling principles. Data is bound to boundaries using explicit flow constraints:
              </p>
              
              <div className="bg-[#FFF3D5] border-2 border-[#4D694E] p-4 text-center font-black uppercase text-[#4D694E] shadow-[4px_4px_0px_0px_#4D694E]">
                Route &rarr; Controller &rarr; Service &rarr; Repository
              </div>

              <div className="space-y-4 mt-4">
                <div>
                  <span className="font-black text-[#4D694E] uppercase">Abstract BaseRepository Definition</span>
                  <p className="text-[10px] text-[#4D694E]/60 mt-1">
                    Enforces standard CRUD patterns across local storage structures and database connectors:
                  </p>
                  <div className="bg-[#FFF3D5] border-2 border-[#4D694E] p-4 text-[9px] md:text-[10px] font-mono-industrial text-[#4D694E] overflow-x-auto whitespace-pre mt-2 shadow-[4px_4px_0px_0px_#4D694E]">
{`abstract class BaseRepository<T> {
  protected abstract collectionName: string;
  
  abstract findById(id: string): Promise<T | null>;
  abstract create(payload: Partial<T>): Promise<T>;
  abstract update(id: string, payload: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<void>;
}`}
                  </div>
                </div>

                <div>
                  <span className="font-black text-[#4D694E] uppercase">Service Constructor DI Pattern</span>
                  <p className="text-[10px] text-[#4D694E]/60 mt-1">
                    Services utilize dependency injection to guarantee loose coupling and mockable unit test sandboxing:
                  </p>
                  <div className="bg-[#FFF3D5] border-2 border-[#4D694E] p-4 text-[9px] md:text-[10px] font-mono-industrial text-[#4D694E] overflow-x-auto whitespace-pre mt-2 shadow-[4px_4px_0px_0px_#4D694E]">
{`class OcrService implements IOcrService {
  constructor(
    private readonly worker: Tesseract.Worker,
    private readonly repo: IHistoryRepository,
    private readonly sync: ICloudSyncService
  ) {}

  async processImage(imageBuffer: ArrayBuffer): Promise<string> {
    // OCR algorithms stay here decoupled from UI layouts
    const { data: { text } } = await this.worker.recognize(imageBuffer);
    return text;
  }
}`}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 05: Developer Notes */}
          <section id="developer" className="pb-8 space-y-4">
            <div className="flex items-center gap-2 font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase text-[#4D694E]/40">
              <Warning className="w-4 h-4 text-[#4D694E]/50" weight="bold" /> 05 / DEV LOGS & DISCLAIMER
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#4D694E]">
              DEVELOPMENT REFLECTION INDEX
            </h2>
            <div className="font-mono-industrial text-[11px] font-semibold tracking-[0.02em] uppercase text-[#4D694E]/70 space-y-4 leading-[1.6]">
              <p>
                Textify has been built as a functional open-source document scraping application and as a core learning pipeline in my personal development journey as a software developer. Writing this utility has allowed me to deep-dive into client-side async engines, client-side WebAssembly Web Workers, data synchronizations with Firestore collections, and modular SOLID structure systems.
              </p>
              
              <div className="border-2 border-dashed border-[#4D694E]/40 p-4 bg-[#4D694E]/5">
                <span className="font-black text-[#4D694E] uppercase">Project Maturity & Execution Note</span>
                <p className="text-[10px] text-[#4D694E]/65 uppercase mt-1.5 leading-relaxed">
                  As this project is a continuous learning process, it should be noted that some structural edge cases, OCR parsing offsets, or environment-specific latency gaps may occur during runtime. I am committed to iteratively debugging the code, optimizing the Web Worker lifecycles, and improving overall stability as I expand my engineering capabilities.
                </p>
              </div>

              <p>
                I appreciate your feedback and interest in the codebase. Feel free to contribute or check the project on GitHub to inspect development progression.
              </p>

              <div className="pt-4 flex items-center gap-3">
                <a
                  href="https://github.com/gnbaba/Textify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#4D694E] text-[#FFF3D5] px-5 py-2.5 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase hover:bg-[#3a4f3b] active:scale-[0.97] transition-all border-2 border-[#4D694E] flex items-center gap-1.5"
                >
                  <GithubLogo className="w-4 h-4" weight="bold" /> Github Repo
                </a>
                <Link
                  to="/"
                  className="border-2 border-[#4D694E] text-[#4D694E] px-5 py-2.5 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase hover:bg-[#4D694E] hover:text-[#FFF3D5] active:scale-[0.97] transition-all"
                >
                  Back to landing
                </Link>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#FFF3D5] border-t-2 border-[#4D694E]/30 py-8 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase text-[#4D694E]/45">
          <div className="md:col-span-6">
            &copy; {new Date().getFullYear()} TEXTIFY INC. /// DEVELOPER DOCUMENTATION PORTAL.
          </div>
          <div className="md:col-span-6 text-left md:text-right">
            BUILT BY @GNBABA /// PORTAL REV 1.0.0
          </div>
        </div>
      </footer>
    </main>
  );
};
