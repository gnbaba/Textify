import React from 'react';
import {
  UploadSimple,
  LockKey,
  FileText,
  Copy,
  Check,
} from '@phosphor-icons/react';

export interface VectorSubstrateCardProps {
  progress?: number;
  activeMode: 'document' | 'graphic';
  setActiveMode: (mode: 'document' | 'graphic') => void;
  demoLoaded: boolean;
  setDemoLoaded: (loaded: boolean) => void;
  activeFieldPin?: 'pin1' | 'pin2' | 'pin3' | null;
  setActiveFieldPin?: (pin: 'pin1' | 'pin2' | 'pin3' | null) => void;
  isExpanded: boolean;
}

const DEMO_EXTRACTION_JSON = `{
  "document_type": "FINANCIAL_INVOICE",
  "invoice_number": "INV-2023-0814",
  "issue_date": "2023-10-14",
  "vendor": "STUDIO ARKHITECTURA LTD",
  "currency": "EUR",
  "total_balance_due": 5565.00,
  "confidence": 0.9982,
  "homography_rotation": "0.00° ORTHOGONAL",
  "server_network_requests": 0
}`;

export const VectorSubstrateCard: React.FC<VectorSubstrateCardProps> = ({
  progress = 1,
  activeMode,
  setActiveMode,
  demoLoaded,
  setDemoLoaded,
  isExpanded,
}) => {
  const [copiedDemoJson, setCopiedDemoJson] = React.useState(false);

  const handleCopyDemoJson = () => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(DEMO_EXTRACTION_JSON).catch(() => {
          /* ignore */
        });
      }
    } catch {
      // ignore clipboard error in restricted headless environments
    }
    setCopiedDemoJson(true);
    setTimeout(() => setCopiedDemoJson(false), 2000);
  };

  // ── Stage 1: Perimeter Lines Convergence (0.00 -> 0.25) ──
  const t1 = Math.min(1, Math.max(0, progress / 0.25));
  const ease1 = 1 - Math.pow(1 - t1, 3);
  const pFactor = Number((1 - ease1).toFixed(3)); // 1 = far offscreen, 0 = locked at border

  // ── Stage 2: Interior Wireframe Lines Drawing (0.25 -> 0.50) ──
  const t2 = Number(Math.min(1, Math.max(0, (progress - 0.25) / 0.25)).toFixed(3));
  const wireframeOpacity = t2;

  // ── Stage 3: Glyphs & Typography Reveal (0.50 -> 0.75) ──
  const t3 = Number(Math.min(1, Math.max(0, (progress - 0.50) / 0.25)).toFixed(3));
  const contentOpacity = t3;
  const contentTranslateY = (1 - t3) * 8;

  return (
    <div
      data-testid="vector-substrate-card"
      className={`relative w-full ${
        isExpanded ? 'lg:max-w-[620px]' : 'max-w-[620px]'
      } mx-auto bg-[#FFFDF7] font-mono-industrial select-none transition-all duration-300 ease-out`}
      style={{
        boxShadow: t1 > 0.9 ? '4px 4px 0px 0px #20251F' : 'none',
      }}
    >
      {/* ────────────────────────────────────────────────────────────
          STAGE 1: 4 CONVERGING PERIMETER BORDER LINES + CORNERS
          ──────────────────────────────────────────────────────────── */}
      {/* Top Border Line */}
      <div
        data-testid="perimeter-top"
        style={{
          transform: `translateY(${-100 * pFactor}dvh)`,
        }}
        className="absolute top-0 left-0 right-0 h-[2px] bg-[#20251F] z-30 pointer-events-none will-change-transform"
      />
      {/* Bottom Border Line */}
      <div
        data-testid="perimeter-bottom"
        style={{
          transform: `translateY(${100 * pFactor}dvh)`,
        }}
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#20251F] z-30 pointer-events-none will-change-transform"
      />
      {/* Left Border Line */}
      <div
        data-testid="perimeter-left"
        style={{
          transform: `translateX(${-100 * pFactor}vw)`,
        }}
        className="absolute top-0 bottom-0 left-0 w-[2px] bg-[#20251F] z-30 pointer-events-none will-change-transform"
      />
      {/* Right Border Line */}
      <div
        data-testid="perimeter-right"
        style={{
          transform: `translateX(${100 * pFactor}vw)`,
        }}
        className="absolute top-0 bottom-0 right-0 w-[2px] bg-[#20251F] z-30 pointer-events-none will-change-transform"
      />

      {/* 4 Corner Crosshairs */}
      <span
        data-testid="corner-crosshair-tl"
        style={{ opacity: t1 }}
        className="corner-crosshair -top-2.5 -left-2.5 text-xs font-mono font-bold text-[#20251F] z-40 select-none transition-opacity"
      >
        +
      </span>
      <span
        data-testid="corner-crosshair-tr"
        style={{ opacity: t1 }}
        className="corner-crosshair -top-2.5 -right-2.5 text-xs font-mono font-bold text-[#20251F] z-40 select-none transition-opacity"
      >
        +
      </span>
      <span
        data-testid="corner-crosshair-bl"
        style={{ opacity: t1 }}
        className="corner-crosshair -bottom-2.5 -left-2.5 text-xs font-mono font-bold text-[#20251F] z-40 select-none transition-opacity"
      >
        +
      </span>
      <span
        data-testid="corner-crosshair-br"
        style={{ opacity: t1 }}
        className="corner-crosshair -bottom-2.5 -right-2.5 text-xs font-mono font-bold text-[#20251F] z-40 select-none transition-opacity"
      >
        +
      </span>

      {/* ────────────────────────────────────────────────────────────
          STAGE 2 & 3: INTERNAL WIREFRAME GRID + TYPOGRAPHY CONTENT
          ──────────────────────────────────────────────────────────── */}
      <div className="relative z-10 overflow-hidden">
        {/* HEADER SECTION */}
        <div className="p-4 sm:p-5 bg-[#FFFDF7] relative">
          <div
            style={{
              opacity: contentOpacity,
              transform: `translateY(${contentTranslateY}px)`,
              pointerEvents: contentOpacity > 0.5 ? 'auto' : 'none',
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-base sm:text-lg font-black tracking-tight uppercase text-[#20251F]">
                EXTRACT TEXT PROTOCOL
              </div>
              <span className="px-2 py-0.5 text-[8px] font-bold bg-[#214C3A] text-[#FFFDF7] tracking-[0.1em] uppercase">
                LOCAL WASM RUNTIME
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] font-semibold text-[#20251F]/60 uppercase tracking-wide">
              DROP GRAPHIC SUBSTRATE BELOW TO SCRAPE METADATA AND SAVE TO THE CLOUD HISTORY INDEX.
            </p>
          </div>

          {/* Interior Wireframe Line: Header Bottom Divider */}
          <div
            data-testid="wireframe-header-divider"
            style={{
              transform: `scaleX(${t2})`,
              transformOrigin: 'left',
              opacity: wireframeOpacity,
            }}
            className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#20251F]/20 will-change-transform"
          />
        </div>

        {/* MODE SWITCHER ROW */}
        <div className="p-3 sm:p-4 bg-[#F3EFE3]/40 flex items-center justify-between gap-3 relative">
          {/* Wireframe Box Container for Mode Switcher */}
          <div
            data-testid="wireframe-mode-box"
            style={{
              opacity: wireframeOpacity,
              clipPath: `inset(0 ${(1 - t2) * 100}% 0 0)`,
            }}
            className="flex items-center gap-2 will-change-[clip-path]"
          >
            <button
              onClick={() => setActiveMode('document')}
              className={`px-3 py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] border border-[#20251F] transition-all cursor-pointer flex items-center gap-2 ${
                activeMode === 'document'
                  ? 'bg-[#214C3A] text-[#FFFDF7]'
                  : 'bg-[#FFFDF7] text-[#20251F]/70 hover:bg-[#20251F]/5'
              }`}
              style={{
                opacity: contentOpacity,
                pointerEvents: contentOpacity > 0.5 ? 'auto' : 'none',
              }}
            >
              <span>[ DOCUMENT MODE ]</span>
              <span className="opacity-60 text-[8px]">[?]</span>
            </button>

            <button
              onClick={() => setActiveMode('graphic')}
              className={`px-3 py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] border border-[#20251F] transition-all cursor-pointer flex items-center gap-2 ${
                activeMode === 'graphic'
                  ? 'bg-[#214C3A] text-[#FFFDF7]'
                  : 'bg-[#FFFDF7] text-[#20251F]/70 hover:bg-[#20251F]/5'
              }`}
              style={{
                opacity: contentOpacity,
                pointerEvents: contentOpacity > 0.5 ? 'auto' : 'none',
              }}
            >
              <span>[ GRAPHIC MODE ]</span>
              <span className="opacity-60 text-[8px]">[?]</span>
            </button>
          </div>

          <div
            style={{ opacity: contentOpacity }}
            className="hidden sm:flex items-center gap-2 text-[8px] font-bold text-[#20251F]/50 uppercase"
          >
            <span>θ = 0.00°</span>
          </div>

          {/* Interior Wireframe Line: Mode Switcher Bottom Divider */}
          <div
            data-testid="wireframe-mode-divider"
            style={{
              transform: `scaleX(${t2})`,
              transformOrigin: 'left',
              opacity: wireframeOpacity,
            }}
            className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#20251F]/20 will-change-transform"
          />
        </div>

        {/* DROPZONE CANVAS & EXTRACTION STREAM */}
        <div className="p-4 sm:p-5 space-y-3 bg-[#F3EFE3]/20 relative">
          {/* Wireframe Dashed Dropzone Box */}
          <div
            data-testid="wireframe-dropzone-box"
            onClick={() => {
              if (contentOpacity > 0.5) setDemoLoaded(!demoLoaded);
            }}
            style={{
              opacity: wireframeOpacity,
              transform: `scale(${0.98 + 0.02 * t2})`,
            }}
            className="w-full border-2 border-dashed border-[#20251F]/30 hover:border-[#214C3A] bg-[#FFFDF7] p-5 sm:p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative group will-change-transform"
          >
            <div
              style={{
                opacity: contentOpacity,
                transform: `translateY(${contentTranslateY}px)`,
                pointerEvents: contentOpacity > 0.5 ? 'auto' : 'none',
              }}
              className="w-full flex flex-col items-center justify-center"
            >
              {demoLoaded ? (
                <div className="w-full flex items-center justify-between p-2 bg-[#214C3A]/10 border border-[#214C3A] text-left">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-[#214C3A]" weight="bold" />
                    <div>
                      <div className="text-[10px] font-black text-[#20251F] uppercase">
                        ARKHITECTURA_INVOICE_OCT2023.PNG
                      </div>
                      <div className="text-[8px] font-mono text-[#20251F]/60">
                        DIN A4 &bull; DESKEW: +12.5° &rarr; 0.00° &bull; 4 THREADS WASM
                      </div>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold text-[#214C3A] bg-[#214C3A]/10 px-2 py-1 uppercase">
                    [ACTIVE DEMO]
                  </span>
                </div>
              ) : (
                <>
                  <UploadSimple
                    className="h-9 w-9 text-[#20251F]/40 mb-2 group-hover:text-[#214C3A] transition-colors"
                    weight="bold"
                  />
                  <p className="text-xs font-black uppercase tracking-wide text-[#20251F]">
                    <span className="underline decoration-1 underline-offset-2">CLICK TO UPLOAD</span>, DRAG AND DROP, OR PASTE (CTRL+V)
                  </p>
                  <p className="text-[9px] font-bold text-[#20251F]/40 tracking-wider uppercase mt-1">
                    SUPPORTS: PNG, JPG, WEBP
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Privacy Protocol & Limit Row */}
          <div
            style={{
              opacity: contentOpacity,
              transform: `translateY(${contentTranslateY}px)`,
            }}
            className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-[8px] sm:text-[9px] font-bold uppercase text-[#20251F]/60"
          >
            <div className="flex items-center gap-1.5">
              <LockKey className="w-3.5 h-3.5 text-[#214C3A]" weight="bold" />
              <span>SECURE LOCAL SCANNING PROTOCOL ACTIVE &bull; IMAGES ARE NEVER LOGGED</span>
            </div>
            <div className="px-2.5 py-0.5 bg-[#FFFDF7] border border-[#20251F]/20 text-[#20251F] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E96C3F] animate-pulse" />
              <span>GUEST LIMIT: 9 / 10 CYCLES</span>
            </div>
          </div>

          {/* Wireframe Dashed Lower Stream Box */}
          <div
            data-testid="wireframe-stream-box"
            style={{
              opacity: wireframeOpacity,
              transform: `scale(${0.98 + 0.02 * t2})`,
            }}
            className="w-full border-2 border-dashed border-[#20251F]/25 bg-[#FFFDF7] p-3.5 relative overflow-hidden will-change-transform"
          >
            <div
              style={{
                opacity: contentOpacity,
                transform: `translateY(${contentTranslateY}px)`,
              }}
            >
              {demoLoaded ? (
                <div>
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#20251F]/15 text-[8px] font-bold text-[#214C3A]">
                    <span>[RFC-8259 PARSED STREAM: FINANCIAL_INVOICE]</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyDemoJson();
                      }}
                      className="flex items-center gap-1 text-[#20251F] hover:text-[#214C3A] cursor-pointer"
                    >
                      {copiedDemoJson ? <Check className="w-3 h-3 text-[#214C3A]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDemoJson ? 'COPIED' : 'COPY JSON'}</span>
                    </button>
                  </div>
                  <pre className="text-[8px] font-mono text-[#20251F]/80 leading-relaxed overflow-x-auto max-h-24">
                    {DEMO_EXTRACTION_JSON}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-[10px] font-black tracking-wider text-[#20251F]/70 uppercase">
                    --- READY FOR EXTRACTION PROTOCOL ---
                  </div>
                  <div className="text-[8px] font-bold text-[#20251F]/40 uppercase mt-1">
                    PASTE OR DROP AN IMAGE TO INITIALIZE RAW STREAM
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
