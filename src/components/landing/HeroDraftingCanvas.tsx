import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { InvoicePaper } from './hero-papers/InvoicePaper';
import { NotebookPaper } from './hero-papers/NotebookPaper';
import { ReceiptPaper } from './hero-papers/ReceiptPaper';
import { BookExcerptPaper } from './hero-papers/BookExcerptPaper';
import { ShippingLabelPaper } from './hero-papers/ShippingLabelPaper';
import { IdCardPaper } from './hero-papers/IdCardPaper';

export interface PhysicalPaperConfig {
  id: string;
  name: string;
  component: React.ComponentType;
  // Dimensions
  widthClasses: string;
  heightClasses: string;
  // Default resting offsets from desk center
  defaultX: number; // px offset from center
  defaultY: number; // px offset from center
  defaultRotation: number; // degrees
  defaultZIndex: number;
  // Associated OCR target (if this paper contains a scan target)
  ocrTarget?: {
    id: string;
    fieldCode: string;
    label: string;
    textValue: string;
    meta: string;
    // Percentage position inside this paper
    pinX: number;
    pinY: number;
    popoverDirection: 'top' | 'bottom';
  };
}

const PAPERS_CONFIG: PhysicalPaperConfig[] = [
  // 1. Central Architecture Invoice
  {
    id: 'paper-invoice',
    name: 'Invoice',
    component: InvoicePaper,
    widthClasses: 'w-[310px] sm:w-[370px] md:w-[430px] lg:w-[470px]',
    heightClasses: 'h-[230px] sm:h-[270px] md:h-[310px] lg:h-[340px]',
    defaultX: 0,
    defaultY: 10,
    defaultRotation: 0,
    defaultZIndex: 10,
    ocrTarget: {
      id: 'inv-total',
      fieldCode: '[TX-FIELD #01]',
      label: 'TOTAL AMOUNT',
      textValue: '€5,565.00',
      meta: 'CONFIDENCE: 99.8% • LOCAL WASM',
      pinX: 86,
      pinY: 66,
      popoverDirection: 'bottom',
    },
  },
  // 2. Lined Notebook Sheet (Left)
  {
    id: 'paper-notebook',
    name: 'Handwritten Notes',
    component: NotebookPaper,
    widthClasses: 'w-[200px] sm:w-[240px] md:w-[280px] lg:w-[310px]',
    heightClasses: 'h-[240px] sm:h-[280px] md:h-[320px] lg:h-[350px]',
    defaultX: -160,
    defaultY: -20,
    defaultRotation: -9,
    defaultZIndex: 5,
    ocrTarget: {
      id: 'notebook-notes',
      fieldCode: '[TX-FIELD #02]',
      label: 'HANDWRITTEN NOTE',
      textValue: 'Quick Household: 1. Donation inquiry 2. Check book',
      meta: 'CONFIDENCE: 94.6% • OPENCV DESKEW',
      pinX: 52,
      pinY: 34,
      popoverDirection: 'top',
    },
  },
  // 3. Yellowed Poetry Book Excerpt (Top Center)
  {
    id: 'paper-book',
    name: 'Book Page',
    component: BookExcerptPaper,
    widthClasses: 'w-[180px] sm:w-[210px] md:w-[245px] lg:w-[270px]',
    heightClasses: 'h-[200px] sm:h-[235px] md:h-[270px] lg:h-[300px]',
    defaultX: 40,
    defaultY: -145,
    defaultRotation: 5,
    defaultZIndex: 4,
    ocrTarget: {
      id: 'book-sentence',
      fieldCode: '[TX-FIELD #05]',
      label: 'POETRY EXCERPT',
      textValue: 'Between the quiet margins of the paper floor, every glyph awaits the beam of sight.',
      meta: 'CONFIDENCE: 99.7% • DENSE PROSE WASM',
      pinX: 50,
      pinY: 38,
      popoverDirection: 'bottom',
    },
  },
  // 4. Store Thermal Receipt (Top Right)
  {
    id: 'paper-receipt',
    name: 'Grocery Receipt',
    component: ReceiptPaper,
    widthClasses: 'w-[130px] sm:w-[155px] md:w-[175px] lg:w-[195px]',
    heightClasses: 'h-[210px] sm:h-[250px] md:h-[280px] lg:h-[310px]',
    defaultX: 180,
    defaultY: -65,
    defaultRotation: 12,
    defaultZIndex: 6,
    ocrTarget: {
      id: 'receipt-header',
      fieldCode: '[TX-FIELD #03]',
      label: 'STORE RECEIPT',
      textValue: 'Renewal Food Market — TOTAL: $56.88',
      meta: 'THERMAL MONOSPACE • 100% PRIVATE',
      pinX: 50,
      pinY: 65,
      popoverDirection: 'bottom',
    },
  },
  // 5. Shipping Waybill Label (Right)
  {
    id: 'paper-shipping',
    name: 'Shipping Label',
    component: ShippingLabelPaper,
    widthClasses: 'w-[170px] sm:w-[200px] md:w-[230px] lg:w-[250px]',
    heightClasses: 'h-[140px] sm:h-[165px] md:h-[190px] lg:h-[205px]',
    defaultX: 195,
    defaultY: 55,
    defaultRotation: -6,
    defaultZIndex: 7,
    ocrTarget: {
      id: 'shipping-tracking',
      fieldCode: '[TX-FIELD #04]',
      label: 'WAYBILL BARCODE',
      textValue: 'TRK-814234567 • PRIORITY COURIER',
      meta: 'CONFIDENCE: 99.9% • CODE-128 WASM',
      pinX: 68,
      pinY: 82,
      popoverDirection: 'top',
    },
  },
  // 6. Security ID Access Card (Bottom Right)
  {
    id: 'paper-id',
    name: 'ID Badge',
    component: IdCardPaper,
    widthClasses: 'w-[125px] sm:w-[145px] md:w-[165px] lg:w-[180px]',
    heightClasses: 'h-[85px] sm:h-[100px] md:h-[115px] lg:h-[125px]',
    defaultX: 140,
    defaultY: 105,
    defaultRotation: 8,
    defaultZIndex: 8,
  },
];

interface LivePaperState {
  x: number; // delta px from defaultX
  y: number; // delta px from defaultY
  rotation: number;
  zIndex: number;
}

export interface HeroDraftingCanvasProps {
  isIntroComplete?: boolean;
}

export const HeroDraftingCanvas: React.FC<HeroDraftingCanvasProps> = ({ isIntroComplete = true }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const targetPinRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Highest z-index tracking for physical paper elevation
  const maxZIndexRef = useRef<number>(20);

  // Independent spatial state for every paper
  const [papersState, setPapersState] = useState<Record<string, LivePaperState>>(() => {
    const initial: Record<string, LivePaperState> = {};
    PAPERS_CONFIG.forEach((cfg) => {
      initial[cfg.id] = {
        x: 0,
        y: 0,
        rotation: cfg.defaultRotation,
        zIndex: cfg.defaultZIndex,
      };
    });
    return initial;
  });

  const papersStateRef = useRef(papersState);
  papersStateRef.current = papersState;

  // Track which specific paper is currently being dragged
  const [draggingPaperId, setDraggingPaperId] = useState<string | null>(null);

  // Marquee Selection Drag (When dragging on canvas background)
  const [isMarqueeDragging, setIsMarqueeDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);

  // Active OCR Cards
  const [activeCardIds, setActiveCardIds] = useState<Record<string, boolean>>({
    'inv-total': false,
    'notebook-notes': false,
    'receipt-header': false,
    'shipping-tracking': false,
    'book-sentence': false,
  });

  // HUD and Hairlines
  const [hudCoords, setHudCoords] = useState<{ x: number; y: number }>({ x: 420, y: 512 });
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Desk safe boundary limits for each individual paper
  const getBoundaryLimits = useCallback(() => {
    if (!canvasRef.current) {
      return { minX: -260, maxX: 260, minY: -140, maxY: 140 };
    }
    const rect = canvasRef.current.getBoundingClientRect();
    const maxHorizontal = Math.max(120, rect.width * 0.42);
    const maxVertical = Math.max(80, rect.height * 0.38);
    return {
      minX: -maxHorizontal,
      maxX: maxHorizontal,
      minY: -maxVertical,
      maxY: maxVertical,
    };
  }, []);

  // Elastic bounce-back to safe boundaries
  const bouncePaperToSafety = useCallback((paperId: string, currentX: number, currentY: number) => {
    const limits = getBoundaryLimits();
    const targetX = Math.max(limits.minX, Math.min(limits.maxX, currentX));
    const targetY = Math.max(limits.minY, Math.min(limits.maxY, currentY));

    if (currentX !== targetX || currentY !== targetY) {
      const obj = { x: currentX, y: currentY };
      gsap.to(obj, {
        x: targetX,
        y: targetY,
        duration: 0.45,
        ease: 'back.out(1.5)',
        onUpdate: () => {
          setPapersState((prev) => ({
            ...prev,
            [paperId]: {
              ...prev[paperId],
              x: obj.x,
              y: obj.y,
            },
          }));
        },
      });
    }
  }, [getBoundaryLimits]);

  // Scroll-driven self-arrangement: smoothly glide all papers back to default fan stack & close open tags
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        // Automatically close all open OCR tags on scroll
        setActiveCardIds((prev) => {
          const hasOpen = Object.values(prev).some(Boolean);
          if (!hasOpen) return prev;
          return {
            'inv-total': false,
            'notebook-notes': false,
            'receipt-header': false,
            'shipping-tracking': false,
            'book-sentence': false,
          };
        });

        setPapersState((prev) => {
          let hasMoved = false;
          Object.keys(prev).forEach((id) => {
            if (prev[id].x !== 0 || prev[id].y !== 0) hasMoved = true;
          });

          if (!hasMoved) return prev;

          // Animate each paper smoothly back to (x: 0, y: 0)
          PAPERS_CONFIG.forEach((cfg) => {
            const current = prev[cfg.id];
            if (current.x !== 0 || current.y !== 0) {
              const obj = { x: current.x, y: current.y };
              gsap.to(obj, {
                x: 0,
                y: 0,
                duration: 0.8,
                ease: 'power2.out',
                onUpdate: () => {
                  setPapersState((p) => ({
                    ...p,
                    [cfg.id]: {
                      ...p[cfg.id],
                      x: obj.x,
                      y: obj.y,
                      zIndex: cfg.defaultZIndex,
                    },
                  }));
                },
              });
            }
          });

          return prev;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Dragging an Individual Paper
  const handlePaperPointerDown = (paperId: string, e: React.PointerEvent<HTMLDivElement>) => {
    if (!isIntroComplete) return;
    if ((e.target as HTMLElement).closest('.ocr-marker') || (e.target as HTMLElement).closest('.ocr-card')) {
      return;
    }
    e.stopPropagation();

    // Elevate this paper's z-index to the top of the desk
    maxZIndexRef.current += 1;
    const newZ = maxZIndexRef.current;

    setDraggingPaperId(paperId);
    setPapersState((prev) => ({
      ...prev,
      [paperId]: {
        ...prev[paperId],
        zIndex: newZ,
      },
    }));

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startPaperX = papersStateRef.current[paperId]?.x || 0;
    const startPaperY = papersStateRef.current[paperId]?.y || 0;

    const onPointerMove = (moveEv: PointerEvent) => {
      const deltaX = moveEv.clientX - startClientX;
      const deltaY = moveEv.clientY - startClientY;

      let nextX = startPaperX + deltaX;
      let nextY = startPaperY + deltaY;

      // Apply rubber-band damping at boundaries
      const limits = getBoundaryLimits();
      if (nextX < limits.minX) nextX = limits.minX + (nextX - limits.minX) * 0.25;
      if (nextX > limits.maxX) nextX = limits.maxX + (nextX - limits.maxX) * 0.25;
      if (nextY < limits.minY) nextY = limits.minY + (nextY - limits.minY) * 0.25;
      if (nextY > limits.maxY) nextY = limits.maxY + (nextY - limits.maxY) * 0.25;

      setPapersState((prev) => ({
        ...prev,
        [paperId]: {
          ...prev[paperId],
          x: nextX,
          y: nextY,
        },
      }));

      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setHudCoords({
          x: Math.round(moveEv.clientX - rect.left),
          y: Math.round(moveEv.clientY - rect.top),
        });
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      const cur = papersStateRef.current[paperId];
      if (cur) {
        bouncePaperToSafety(paperId, cur.x, cur.y);
      }
      setDraggingPaperId(null);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Handle Canvas Background Click (Draws Marquee Box)
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isIntroComplete) return;
    if ((e.target as HTMLElement).closest('.paper-item') || (e.target as HTMLElement).closest('.ocr-card')) {
      return;
    }
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const startX = Math.round(e.clientX - rect.left);
    const startY = Math.round(e.clientY - rect.top);

    setIsMarqueeDragging(true);
    setDragStart({ x: startX, y: startY });
    setDragCurrent({ x: startX, y: startY });
    setHudCoords({ x: startX, y: startY });
    setCursorPos({ x: startX, y: startY });

    const onPointerMove = (moveEv: PointerEvent) => {
      if (!canvasRef.current) return;
      const cRect = canvasRef.current.getBoundingClientRect();
      const curX = Math.max(0, Math.min(cRect.width, Math.round(moveEv.clientX - cRect.left)));
      const curY = Math.max(0, Math.min(cRect.height, Math.round(moveEv.clientY - cRect.top)));

      setCursorPos({ x: curX, y: curY });
      setDragCurrent({ x: curX, y: curY });
      setHudCoords({ x: Math.abs(curX - startX), y: Math.abs(curY - startY) });

      // Dynamic AABB Collision Detection against live pin locations on moved papers
      const selLeft = Math.min(startX, curX);
      const selTop = Math.min(startY, curY);
      const selRight = Math.max(startX, curX);
      const selBottom = Math.max(startY, curY);
      const selW = selRight - selLeft;
      const selH = selBottom - selTop;

      if (selW > 15 && selH > 15) {
        PAPERS_CONFIG.forEach((cfg) => {
          if (!cfg.ocrTarget) return;
          const targetId = cfg.ocrTarget.id;
          const pinEl = targetPinRefs.current[targetId];
          if (pinEl) {
            const pinRect = pinEl.getBoundingClientRect();
            const t = {
              left: pinRect.left - cRect.left,
              top: pinRect.top - cRect.top,
              right: pinRect.right - cRect.left,
              bottom: pinRect.bottom - cRect.top,
            };
            const touches = !(
              selRight < t.left ||
              selLeft > t.right ||
              selBottom < t.top ||
              selTop > t.bottom
            );
            if (touches) {
              setActiveCardIds((prev) => (prev[targetId] ? prev : { ...prev, [targetId]: true }));
            }
          }
        });
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      setIsMarqueeDragging(false);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Cursor tracking hairline update on canvas
  const handleCanvasMouseMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isIntroComplete) return;
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const curX = Math.max(0, Math.min(rect.width, Math.round(e.clientX - rect.left)));
    const curY = Math.max(0, Math.min(rect.height, Math.round(e.clientY - rect.top)));
    setCursorPos({ x: curX, y: curY });
    if (!isMarqueeDragging && !draggingPaperId) {
      setHudCoords({ x: curX, y: curY });
    }
  };

  // Toggle single extraction card
  const toggleCard = (id: string, e: React.MouseEvent) => {
    if (!isIntroComplete) return;
    e.stopPropagation();
    setActiveCardIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      ref={canvasRef}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasMouseMove}
      className={`w-full flex-1 relative flex flex-col items-center justify-end px-4 pt-10 md:pt-14 pb-3 md:pb-4 select-none ${
        isIntroComplete ? 'cursor-crosshair' : 'cursor-default'
      } overflow-hidden touch-none`}
    >
      {/* Architectural Projection Dashed Lines (Drawn Pen Physics) */}
      <div className="canvas-line-proj-h absolute top-[26%] left-0 right-0 border-t border-dashed border-[#E96C3F]/25 pointer-events-none origin-left" />
      <div className="canvas-line-proj-h absolute bottom-[24%] left-0 right-0 border-t border-dashed border-[#20251F]/15 pointer-events-none origin-left" />
      <div className="canvas-line-proj-v absolute top-0 bottom-0 left-[12%] border-l border-dashed border-[#20251F]/15 pointer-events-none hidden md:block origin-top" />
      <div className="canvas-line-proj-v absolute top-0 bottom-0 right-[12%] border-r border-dashed border-[#20251F]/15 pointer-events-none hidden md:block origin-top" />

      {/* Main Drafting Desk Anchor: Holds all independent papers */}
      <div className="hero-doc-frame relative max-w-4xl w-full h-[320px] sm:h-[370px] md:h-[420px] lg:h-[460px] flex items-center justify-center mt-auto mb-2 md:mb-3">
        {PAPERS_CONFIG.map((cfg) => {
          const state = papersState[cfg.id] || {
            x: 0,
            y: 0,
            rotation: cfg.defaultRotation,
            zIndex: cfg.defaultZIndex,
          };
          const isThisDragging = draggingPaperId === cfg.id;
          const PaperComponent = cfg.component;

          // Compute absolute transform: default position + user drag delta
          const totalX = cfg.defaultX + state.x;
          const totalY = cfg.defaultY + state.y;

          return (
            <div
              key={cfg.id}
              data-paper-id={cfg.id}
              data-z-index={cfg.defaultZIndex}
              onPointerDown={(e) => handlePaperPointerDown(cfg.id, e)}
              style={{
                transform: `translate3d(${totalX}px, ${totalY}px, 0) rotate(${state.rotation}deg)`,
                zIndex: state.zIndex,
                cursor: !isIntroComplete ? 'default' : isThisDragging ? 'grabbing' : 'grab',
              }}
              className={`paper-item absolute will-change-transform ${
                cfg.widthClasses
              } ${cfg.heightClasses} ${
                isThisDragging ? 'scale-[1.02] ring-1 ring-[#E96C3F]/40' : ''
              }`}
            >
              <div
                className={`paper-card-inner w-full h-full will-change-transform transition-shadow duration-150 ${
                  isThisDragging ? 'shadow-2xl' : 'shadow-lg hover:shadow-xl'
                }`}
              >
                {/* The Crisp Vector/DOM Paper */}
                <PaperComponent />

                {/* Embedded Subtle OCR Marker (if this paper has a target) */}
                {cfg.ocrTarget && (
                  <div
                    ref={(el) => {
                      targetPinRefs.current[cfg.ocrTarget!.id] = el;
                    }}
                    style={{
                      left: `${cfg.ocrTarget.pinX}%`,
                      top: `${cfg.ocrTarget.pinY}%`,
                    }}
                    className="ocr-marker absolute -translate-x-1/2 -translate-y-1/2 z-30"
                  >
                    {/* Subtle Minimalist Drafting Crosshair Pin */}
                    <button
                      type="button"
                      onClick={(e) => toggleCard(cfg.ocrTarget!.id, e)}
                      title={`Scan ${cfg.ocrTarget.label}`}
                      className="group relative p-1 transition-all duration-200 cursor-pointer focus:outline-none flex items-center justify-center hover:scale-125"
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 flex items-center justify-center ${
                          activeCardIds[cfg.ocrTarget.id]
                            ? 'border-[#E96C3F] bg-[#E96C3F]/20 shadow-[0_0_8px_rgba(233,108,63,0.5)]'
                            : 'border-[#20251F]/35 bg-[#FFFDF7]/70 group-hover:border-[#E96C3F] group-hover:bg-[#E96C3F]/15'
                        }`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full transition-colors ${
                            activeCardIds[cfg.ocrTarget.id] ? 'bg-[#E96C3F]' : 'bg-[#20251F]/50 group-hover:bg-[#E96C3F]'
                          }`}
                        />
                      </div>
                    </button>

                    {/* Extraction Popover Card */}
                    {activeCardIds[cfg.ocrTarget.id] && (
                      <div
                        className={`ocr-card absolute ${
                          cfg.ocrTarget.popoverDirection === 'top'
                            ? 'bottom-full mb-2 right-0'
                            : 'top-full mt-2 right-0 sm:left-0 sm:right-auto'
                        } w-56 sm:w-64 bg-[#E96C3F] text-[#FFFDF7] p-2.5 shadow-drafting-sm border border-[#20251F] font-mono-industrial text-left animate-in fade-in zoom-in-95 duration-150 z-40`}
                      >
                        <div className="flex items-center justify-between pb-1 border-b border-[#FFFDF7]/25 text-[8px] font-bold tracking-[0.14em] uppercase text-[#FFFDF7]/85">
                          <span>{cfg.ocrTarget.fieldCode} {cfg.ocrTarget.label}</span>
                          <button
                            type="button"
                            onClick={(e) => toggleCard(cfg.ocrTarget!.id, e)}
                            className="hover:text-white p-0.5 text-xs font-bold leading-none cursor-pointer"
                            title="Close tag"
                          >
                            &times;
                          </button>
                        </div>
                        <div className="mt-1 text-xs sm:text-sm font-black tracking-tight leading-snug break-words">
                          {cfg.ocrTarget.textValue}
                        </div>
                        <div className="mt-1 text-[8px] tracking-[0.05em] uppercase text-[#FFFDF7]/90 leading-tight">
                          {cfg.ocrTarget.meta}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mouse Tracking Drafting Hairlines */}
      {cursorPos && (
        <>
          <div
            className="absolute left-0 right-0 border-t border-[#20251F]/10 pointer-events-none z-10 hidden sm:block"
            style={{ top: cursorPos.y }}
          />
          <div
            className="absolute top-0 bottom-0 border-l border-[#20251F]/10 pointer-events-none z-10 hidden sm:block"
            style={{ left: cursorPos.x }}
          />
        </>
      )}

      {/* Orange Click-and-Drag Marquee Selection Box */}
      {isMarqueeDragging && dragStart && dragCurrent && (
        <div
          className="absolute border border-[#E96C3F] pointer-events-none z-30"
          style={{
            left: Math.min(dragStart.x, dragCurrent.x),
            top: Math.min(dragStart.y, dragCurrent.y),
            width: Math.abs(dragCurrent.x - dragStart.x),
            height: Math.abs(dragCurrent.y - dragStart.y),
            background: 'radial-gradient(circle at center, rgba(233,108,63,0.18) 0%, rgba(233,108,63,0.06) 100%)',
          }}
        >
          <span className="absolute bottom-1 right-1 font-mono-industrial text-[8px] font-bold text-[#E96C3F] bg-[#F3EFE3] px-1 border border-[#E96C3F]/40 select-none">
            X: {Math.abs(dragCurrent.x - dragStart.x)}PX Y: {Math.abs(dragCurrent.y - dragStart.y)}PX
          </span>
        </div>
      )}

      {/* Bottom HUD: Coordinates & Dynamic Industrial Hint (Zero Buttons!) */}
      <div className="canvas-hud absolute bottom-2.5 left-4 sm:left-6 right-4 sm:right-6 z-10 flex items-center justify-between font-mono-industrial text-[8px] md:text-[9px] font-bold tracking-[0.1em] text-[#20251F]/50 uppercase select-none pointer-events-none">
        <div className="flex items-center gap-3">
          <span>X: {hudCoords.x}PX &bull; Y: {hudCoords.y}PX</span>
          <span className="hidden md:inline text-[#20251F]/30">|</span>
          <span className="hidden md:inline text-[#20251F]/40">
            DRAG ANY PAPER TO REPOSITION &bull; DRAG CANVAS TO SCAN
          </span>
        </div>
      </div>
    </div>
  );
};
