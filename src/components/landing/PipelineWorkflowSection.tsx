import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { VectorSubstrateCard } from './VectorSubstrateCard';
import {
  Crosshair,
  BoundingBox,
  ShieldCheck,
  Check,
  Copy,
  Terminal,
  UploadSimple,
  LockKey,
  FileText,
} from '@phosphor-icons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export const PipelineWorkflowSection: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const runtimeSectionRef = useRef<HTMLElement>(null);

  // Section 1: Pinned Document Sandbox Assembly states
  const [sandboxProgress, setSandboxProgress] = useState<number>(0);
  const [activeMode, setActiveMode] = useState<'document' | 'graphic'>('document');
  const [demoLoaded, setDemoLoaded] = useState<boolean>(false);

  // Section 2: Dual Platform Spotlight states (unpinned natural flow)
  const [copiedCliCmd, setCopiedCliCmd] = useState<boolean>(false);
  const [activeRuntimeIndex, setActiveRuntimeIndex] = useState<0 | 1>(0);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);

  // Section 3: 4-Stage Autonomous Pipeline Refs & Kinetic Motion
  const pipelineSectionRef = useRef<HTMLElement>(null);

  const stage1Ref = useRef<HTMLDivElement>(null);
  const stage1LineWrapperRef = useRef<HTMLDivElement>(null);
  const stage1LineRef = useRef<HTMLDivElement>(null);
  const stage1BarWrapperRef = useRef<HTMLDivElement>(null);
  const stage1BarRef = useRef<HTMLDivElement>(null);
  const stage1DocRef = useRef<HTMLDivElement>(null);
  const stage1CalloutRef = useRef<HTMLDivElement>(null);

  const stage2Ref = useRef<HTMLDivElement>(null);
  const stage2LineWrapperRef = useRef<HTMLDivElement>(null);
  const stage2LineRef = useRef<HTMLDivElement>(null);
  const stage2BarWrapperRef = useRef<HTMLDivElement>(null);
  const stage2BarRef = useRef<HTMLDivElement>(null);
  const stage2DocRef = useRef<HTMLDivElement>(null);
  const stage2RayRef = useRef<HTMLDivElement>(null);
  const stage2CalloutRef = useRef<HTMLDivElement>(null);

  const stage3Ref = useRef<HTMLDivElement>(null);
  const stage3LineWrapperRef = useRef<HTMLDivElement>(null);
  const stage3LineRef = useRef<HTMLDivElement>(null);
  const stage3BarWrapperRef = useRef<HTMLDivElement>(null);
  const stage3BarRef = useRef<HTMLDivElement>(null);
  const stage3MaskRef = useRef<HTMLDivElement>(null);
  const stage3HandleRef = useRef<HTMLDivElement>(null);
  const stage3CalloutRef = useRef<HTMLDivElement>(null);

  const stage4Ref = useRef<HTMLDivElement>(null);
  const stage4LineWrapperRef = useRef<HTMLDivElement>(null);
  const stage4LineRef = useRef<HTMLDivElement>(null);
  const stage4BarWrapperRef = useRef<HTMLDivElement>(null);
  const stage4BarRef = useRef<HTMLDivElement>(null);
  const stage4HeaderRef = useRef<HTMLDivElement>(null);
  const stage4TotalRef = useRef<HTMLDivElement>(null);
  const stage4CalloutRef = useRef<HTMLDivElement>(null);

  // Active stage tracking for exclusive single-active line & bar presence
  const activeStageRef = useRef<number | null>(null);

  // Pre-allocated quickTo functions for 120fps stutter-free mouse tracking
  const quickToMapRef = useRef<{
    [key: number]: {
      lineY: (y: number) => void;
      barY: (y: number) => void;
    };
  }>({});

  // Global mouse coordinates in viewport & evaluation flag
  const mousePosRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const isEvaluatingRef = useRef<boolean>(false);

  const getStageWrappers = (index: number) => {
    switch (index) {
      case 0:
        return { line: stage1LineWrapperRef.current, bar: stage1BarWrapperRef.current };
      case 1:
        return { line: stage2LineWrapperRef.current, bar: stage2BarWrapperRef.current };
      case 2:
        return { line: stage3LineWrapperRef.current, bar: stage3BarWrapperRef.current };
      case 3:
        return { line: stage4LineWrapperRef.current, bar: stage4BarWrapperRef.current };
      default:
        return { line: null, bar: null };
    }
  };

  const evaluateActiveStage = () => {
    const mouse = mousePosRef.current;
    const sectionEl = pipelineSectionRef.current;
    if (!mouse || !sectionEl) return;

    const sectionRect = sectionEl.getBoundingClientRect();
    const isInsideSection =
      mouse.clientY >= sectionRect.top - 20 &&
      mouse.clientY <= sectionRect.bottom + 20 &&
      mouse.clientX >= sectionRect.left - 40 &&
      mouse.clientX <= sectionRect.right + 40;

    if (!isInsideSection) {
      if (activeStageRef.current !== null) {
        const prev = getStageWrappers(activeStageRef.current);
        if (prev.line && prev.bar) {
          gsap.to([prev.line, prev.bar], {
            opacity: 0,
            duration: 0.2,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
        activeStageRef.current = null;
      }
      return;
    }

    const stageEls = [
      stage1Ref.current,
      stage2Ref.current,
      stage3Ref.current,
      stage4Ref.current,
    ];

    let targetStageIndex: number | null = null;
    let targetClampedY = 0;

    for (let i = 0; i < stageEls.length; i++) {
      const el = stageEls[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();

      if (mouse.clientY >= rect.top && mouse.clientY <= rect.bottom) {
        targetStageIndex = i;
        const centerY = rect.top + rect.height / 2;
        const deltaY = mouse.clientY - centerY;
        const maxDeltaY = Math.max(30, rect.height / 2 - 56);
        targetClampedY = Math.max(-maxDeltaY, Math.min(maxDeltaY, deltaY));
        break;
      }
    }

    if (targetStageIndex === null) {
      if (activeStageRef.current !== null) {
        const prev = getStageWrappers(activeStageRef.current);
        if (prev.line && prev.bar) {
          gsap.to([prev.line, prev.bar], {
            opacity: 0,
            duration: 0.2,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
        activeStageRef.current = null;
      }
      return;
    }

    if (activeStageRef.current !== targetStageIndex) {
      activeStageRef.current = targetStageIndex;
      const current = getStageWrappers(targetStageIndex);
      if (!current.line || !current.bar) return;

      // Immediately fade out all other stages so ONLY this active stage is visible
      [0, 1, 2, 3].forEach((idx) => {
        if (idx !== targetStageIndex) {
          const other = getStageWrappers(idx);
          if (other.line && other.bar) {
            gsap.to([other.line, other.bar], {
              opacity: 0,
              duration: 0.15,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          }
        }
      });

      // Position line & bar at entry cursor Y while transparent, so it emerges at the line without flying from center
      gsap.set([current.line, current.bar], { y: targetClampedY, force3D: true });
      if (quickToMapRef.current[targetStageIndex]) {
        quickToMapRef.current[targetStageIndex].lineY(targetClampedY);
        quickToMapRef.current[targetStageIndex].barY(targetClampedY);
      }

      gsap.to([current.line, current.bar], {
        opacity: 1,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    } else {
      // Continuing motion in active stage: smoothly follow cursor via quickTo
      if (quickToMapRef.current[targetStageIndex]) {
        quickToMapRef.current[targetStageIndex].lineY(targetClampedY);
        quickToMapRef.current[targetStageIndex].barY(targetClampedY);
      }
    }
  };

  const scheduleEvaluation = () => {
    if (isEvaluatingRef.current) return;
    isEvaluatingRef.current = true;
    requestAnimationFrame(() => {
      evaluateActiveStage();
      isEvaluatingRef.current = false;
    });
  };

  // GSAP — Scroll-driven Pinned Vector Assembly Scrub (#process)
  useGSAP(
    () => {
      if (!containerRef.current) return;

      const pinTrigger = ScrollTrigger.create({
        id: 'pipeline-pinned',
        trigger: containerRef.current,
        pin: true,
        pinSpacing: true,
        start: 'top top',
        end: '+=4200',
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: (self) => {
          setSandboxProgress(self.progress);
        },
      });

      return () => {
        pinTrigger.kill();
      };
    },
    { scope: containerRef },
  );

  // GSAP — Scroll-driven Mode Tracker for Natural Scroll (#runtime-modes)
  useGSAP(
    () => {
      if (!card2Ref.current) return;

      const runtimeTrigger = ScrollTrigger.create({
        id: 'runtime-modes-trigger',
        trigger: card2Ref.current,
        start: 'top 55%',
        end: 'bottom 45%',
        onEnter: () => setActiveRuntimeIndex(1),
        onLeaveBack: () => setActiveRuntimeIndex(0),
      });

      return () => {
        runtimeTrigger.kill();
      };
    },
    { scope: runtimeSectionRef },
  );

  // GSAP — Scroll-driven Kinetic Loop Scrub & Smooth Entrance (#pipeline-stages)
  useGSAP(
    () => {
      // Initialize opacity & create zero-allocation quickTo tweens for 120fps tracking
      [0, 1, 2, 3].forEach((idx) => {
        const w = getStageWrappers(idx);
        if (w.line && w.bar) {
          gsap.set([w.line, w.bar], { opacity: 0, force3D: true });
          const lineY = gsap.quickTo(w.line, 'y', {
            duration: 0.16,
            ease: 'power2.out',
            force3D: true,
          });
          const barY = gsap.quickTo(w.bar, 'y', {
            duration: 0.16,
            ease: 'power2.out',
            force3D: true,
          });
          quickToMapRef.current[idx] = { lineY, barY };
        }
      });

      // Mobile/touch-only fallback: on devices without mouse hover, reveal active stage on scroll
      const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;
      if (isTouch) {
        [0, 1, 2, 3].forEach((idx) => {
          const stageEl = [stage1Ref.current, stage2Ref.current, stage3Ref.current, stage4Ref.current][idx];
          if (!stageEl) return;

          ScrollTrigger.create({
            trigger: stageEl,
            start: 'top 55%',
            end: 'bottom 45%',
            onEnter: () => {
              [0, 1, 2, 3].forEach((i) => {
                const w = getStageWrappers(i);
                if (w.line && w.bar) {
                  gsap.to([w.line, w.bar], {
                    opacity: i === idx ? 1 : 0,
                    y: 0,
                    duration: 0.35,
                    ease: 'power2.out',
                    overwrite: 'auto',
                  });
                }
              });
            },
            onEnterBack: () => {
              [0, 1, 2, 3].forEach((i) => {
                const w = getStageWrappers(i);
                if (w.line && w.bar) {
                  gsap.to([w.line, w.bar], {
                    opacity: i === idx ? 1 : 0,
                    y: 0,
                    duration: 0.35,
                    ease: 'power2.out',
                    overwrite: 'auto',
                  });
                }
              });
            },
            onLeave: () => {
              const w = getStageWrappers(idx);
              if (w.line && w.bar) {
                gsap.to([w.line, w.bar], {
                  opacity: 0,
                  y: 0,
                  duration: 0.25,
                  ease: 'power2.out',
                  overwrite: 'auto',
                });
              }
            },
            onLeaveBack: () => {
              const w = getStageWrappers(idx);
              if (w.line && w.bar) {
                gsap.to([w.line, w.bar], {
                  opacity: 0,
                  y: 0,
                  duration: 0.25,
                  ease: 'power2.out',
                  overwrite: 'auto',
                });
              }
            },
          });
        });
      }

      // Stage 1: Ingest (Kinetic diagram build-up)
      if (stage1Ref.current) {
        const tl1 = gsap.timeline({
          scrollTrigger: {
            trigger: stage1Ref.current,
            start: 'top 80%',
            end: 'bottom 35%',
            scrub: 0.6,
          },
        });

        if (stage1DocRef.current) {
          tl1.fromTo(stage1DocRef.current, { y: 28, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, ease: 'power2.out' }, 0);
        }
        tl1.fromTo('.stage1-pin', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.05, ease: 'back.out(2)' }, 0.1);
        tl1.fromTo('.stage1-hull-line', { strokeDashoffset: 500 }, { strokeDashoffset: 0, ease: 'power1.inOut' }, 0.15);
        if (stage1CalloutRef.current) {
          tl1.fromTo(stage1CalloutRef.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, ease: 'back.out(1.5)' }, 0.35);
        }
      }

      // Stage 2: Radon Deskew (Live affine rotation from +12.5deg -> 0.00deg orthogonal)
      if (stage2Ref.current) {
        const tl2 = gsap.timeline({
          scrollTrigger: {
            trigger: stage2Ref.current,
            start: 'top 80%',
            end: 'bottom 35%',
            scrub: 0.8,
          },
        });

        if (stage2DocRef.current) {
          tl2.fromTo(
            stage2DocRef.current,
            { rotate: 12.5, skewX: -4, opacity: 0, scale: 0.96 },
            { rotate: 0, skewX: 0, opacity: 1, scale: 1, ease: 'power2.out' },
            0
          );
        }
        if (stage2RayRef.current) {
          tl2.fromTo(stage2RayRef.current, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, ease: 'power1.inOut' }, 0.2);
        }
        tl2.fromTo('.stage2-corner-marker', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, stagger: 0.05, ease: 'back.out(1.5)' }, 0.3);
        if (stage2CalloutRef.current) {
          tl2.fromTo(stage2CalloutRef.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, ease: 'back.out(1.5)' }, 0.45);
        }
      }

      // Stage 3: Threshold & WASM (Split slider sweep unmasking binarized text and neural tokens)
      if (stage3Ref.current) {
        const tl3 = gsap.timeline({
          scrollTrigger: {
            trigger: stage3Ref.current,
            start: 'top 80%',
            end: 'bottom 35%',
            scrub: 0.8,
          },
        });

        if (stage3MaskRef.current) {
          tl3.fromTo(stage3MaskRef.current, { width: '20%' }, { width: '80%', ease: 'power1.inOut' }, 0);
        }
        if (stage3HandleRef.current) {
          tl3.fromTo(stage3HandleRef.current, { left: '20%' }, { left: '80%', ease: 'power1.inOut' }, 0);
        }
        tl3.fromTo('.stage3-token-box', { opacity: 0, y: 8, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, stagger: 0.08, ease: 'back.out(1.5)' }, 0.15);
        if (stage3CalloutRef.current) {
          tl3.fromTo(stage3CalloutRef.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, ease: 'back.out(1.5)' }, 0.4);
        }
      }

      // Stage 4: Structure (Table rows cascade, total locks, callout card springs in)
      if (stage4Ref.current) {
        const tl4 = gsap.timeline({
          scrollTrigger: {
            trigger: stage4Ref.current,
            start: 'top 80%',
            end: 'bottom 35%',
            scrub: 0.8,
          },
        });

        if (stage4HeaderRef.current) {
          tl4.fromTo(stage4HeaderRef.current, { y: -16, opacity: 0 }, { y: 0, opacity: 1, ease: 'power1.out' }, 0);
        }
        tl4.fromTo('.stage4-table-row', { opacity: 0, x: -16 }, { opacity: 1, x: 0, stagger: 0.08, ease: 'power1.out' }, 0.1);
        if (stage4TotalRef.current) {
          tl4.fromTo(stage4TotalRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, ease: 'power2.out' }, 0.35);
        }
        if (stage4CalloutRef.current) {
          tl4.fromTo(stage4CalloutRef.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, ease: 'back.out(1.5)' }, 0.45);
        }
      }

      // Global viewport pointer tracking + passive scroll synchronization
      const handlePointerMove = (e: PointerEvent) => {
        mousePosRef.current = { clientX: e.clientX, clientY: e.clientY };
        scheduleEvaluation();
      };

      const handleScroll = () => {
        if (mousePosRef.current) {
          scheduleEvaluation();
        }
      };

      const handlePointerLeaveWindow = () => {
        mousePosRef.current = null;
        scheduleEvaluation();
      };

      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('scroll', handleScroll, { passive: true });
      document.addEventListener('mouseleave', handlePointerLeaveWindow);

      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('mouseleave', handlePointerLeaveWindow);
        if (isEvaluatingRef.current) {
          isEvaluatingRef.current = false;
        }
      };
    },
    { scope: pipelineSectionRef }
  );

  const handleScrollToCard = (index: 0 | 1) => {
    setActiveRuntimeIndex(index);
    const target = index === 0 ? card1Ref.current : card2Ref.current;
    if (!target) return;

    if (typeof window !== 'undefined' && (window as any).__lenis) {
      (window as any).__lenis.scrollTo(target, { offset: -90, duration: 0.8 });
    } else if (typeof window !== 'undefined') {
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Dynamic transformation calculations
  // Title 1: "RIGHT INSIDE YOUR BROWSER" (0.00 to 0.18)
  // Starts with opacity 0 before pinning so it never awkwardly peeks or cuts off while scrolling through previous cards
  let title1Opacity = 0;
  let title1Scale = 0.96;
  let title1Y = 16;

  if (sandboxProgress > 0 && sandboxProgress <= 0.05) {
    const fadeT = sandboxProgress / 0.05;
    title1Opacity = fadeT;
    title1Scale = 0.96 + 0.04 * fadeT;
    title1Y = (1 - fadeT) * 16;
  } else if (sandboxProgress > 0.05 && sandboxProgress <= 0.12) {
    title1Opacity = 1;
    title1Scale = 1;
    title1Y = 0;
  } else if (sandboxProgress > 0.12 && sandboxProgress <= 0.18) {
    const exitT = (sandboxProgress - 0.12) / 0.06;
    title1Opacity = Math.max(0, 1 - exitT);
    title1Scale = 1 - 0.03 * exitT;
    title1Y = -12 * exitT;
  }

  // Title 2: "FOR EVERY COMPLEX DOCUMENT" (0.16 to 0.36)
  let title2Opacity = 0;
  let title2Scale = 0.97;
  let title2Y = 16;

  if (sandboxProgress >= 0.16 && sandboxProgress <= 0.22) {
    const fadeT = (sandboxProgress - 0.16) / 0.06;
    title2Opacity = fadeT;
    title2Scale = 0.97 + 0.03 * fadeT;
    title2Y = (1 - fadeT) * 16;
  } else if (sandboxProgress > 0.22 && sandboxProgress <= 0.30) {
    title2Opacity = 1;
    title2Scale = 1;
    title2Y = 0;
  } else if (sandboxProgress > 0.30 && sandboxProgress <= 0.36) {
    const exitT = (sandboxProgress - 0.30) / 0.06;
    title2Opacity = Math.max(0, 1 - exitT);
    title2Scale = 1 - 0.03 * exitT;
    title2Y = -12 * exitT;
  }

  // Vector Substrate Card begins assembling after Title 2 exits (sandboxProgress >= 0.36)
  const cardAssemblyProgress = Math.min(1, Math.max(0, (sandboxProgress - 0.36) / 0.64));
  const cardContainerOpacity =
    sandboxProgress < 0.35 ? 0 : Math.min(1, (sandboxProgress - 0.35) / 0.03);

  // Card internal assembly progress (Stages 1 to 3 completed by 0.60)
  const cardProgress = Math.min(1, cardAssemblyProgress / 0.60);

  // Stage 4: Split & Staggered Cascade of the Right Editorial Column (0.55 to 0.95)
  const splitProgress = Math.min(1, Math.max(0, (cardAssemblyProgress - 0.55) / 0.40));
  const isExpanded = splitProgress > 0.1;

  // On desktop, card smoothly glides from center to left by 240px
  const cardShiftFactor = Math.sin((Math.min(1, splitProgress / 0.40) * Math.PI) / 2);
  const cardTranslateX = cardShiftFactor * 240;

  // Right column container opacity and horizontal slide from right (+32px to 0px)
  const rightColAlpha = Math.min(1, splitProgress / 0.20);
  const rightColTranslateX = (1 - Math.sin((Math.min(1, splitProgress / 0.45) * Math.PI) / 2)) * 32;

  // Helper for staggered cascaded entrance ("one by one")
  const getStaggerStyle = (start: number, end: number) => {
    if (splitProgress <= start) {
      return {
        opacity: 0,
        transform: 'translateY(16px)',
        pointerEvents: 'none' as const,
      };
    }
    if (splitProgress >= end) {
      return {
        opacity: 1,
        transform: 'translateY(0px)',
        pointerEvents: 'auto' as const,
      };
    }
    const t = (splitProgress - start) / (end - start);
    const ease = Math.sin((t * Math.PI) / 2);
    return {
      opacity: ease,
      transform: `translateY(${(1 - ease) * 16}px)`,
      pointerEvents: t > 0.5 ? ('auto' as const) : ('none' as const),
    };
  };

  const handleCopyCliCmd = () => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText('npx @textify/cli watch ./scans --out ./structured --format=json').catch(() => {
          /* ignore */
        });
      }
    } catch {
      // ignore clipboard error in restricted headless environments
    }
    setCopiedCliCmd(true);
    setTimeout(() => setCopiedCliCmd(false), 2000);
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          SECTION 1: PINNED INTERACTIVE DOCUMENT SANDBOX ASSEMBLY
          ═══════════════════════════════════════════════════════ */}
      <section
        ref={containerRef}
        id="process"
        data-section="pipeline"
        className="relative w-full bg-[#F3EFE3] border-b border-[#20251F]/20 h-screen max-h-[1080px] min-h-[700px] flex flex-col justify-center overflow-hidden z-20"
      >
        {/* Drafting Perimeter Borders */}
        <div className="absolute inset-0 pointer-events-none z-30">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#20251F]/20" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#20251F]/20" />
          <div className="absolute top-0 bottom-0 left-4 md:left-8 w-[1px] bg-[#20251F]/10" />
          <div className="absolute top-0 bottom-0 right-4 md:right-8 w-[1px] bg-[#20251F]/10" />
          <span className="absolute top-2.5 left-6 md:left-10 text-[11px] font-mono font-light text-[#20251F]/40 select-none">+</span>
          <span className="absolute top-2.5 right-6 md:right-10 text-[11px] font-mono font-light text-[#20251F]/40 select-none">+</span>
          <span className="absolute bottom-2.5 left-6 md:left-10 text-[11px] font-mono font-light text-[#20251F]/40 select-none">+</span>
          <span className="absolute bottom-2.5 right-6 md:right-10 text-[11px] font-mono font-light text-[#20251F]/40 select-none">+</span>
        </div>

        {/* Central Kinetic Viewport Anchor */}
        <div className="w-full max-w-[1440px] mx-auto flex items-center justify-center relative px-4 sm:px-8 overflow-hidden min-h-[560px]">
          {/* Note: The broken dashed perimeter line was excised per Picture 2 */}

          {/* ═════════════════════════════════════════════════
              TITLE 1: "RIGHT INSIDE YOUR BROWSER"
              ═════════════════════════════════════════════════ */}
          <div
            style={{
              opacity: title1Opacity,
              transform: `scale(${title1Scale}) translateY(${title1Y}px)`,
              pointerEvents: title1Opacity > 0.1 ? 'auto' : 'none',
            }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 will-change-transform z-20"
          >
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase text-[#20251F] tracking-[-0.04em] leading-[0.95] max-w-5xl">
              Right inside<br />your browser
            </h2>
          </div>

          {/* ═════════════════════════════════════════════════
              TITLE 2: "FOR EVERY COMPLEX DOCUMENT"
              ═════════════════════════════════════════════════ */}
          <div
            style={{
              opacity: title2Opacity,
              transform: `scale(${title2Scale}) translateY(${title2Y}px)`,
              pointerEvents: title2Opacity > 0.1 ? 'auto' : 'none',
            }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 will-change-transform z-20"
          >
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase text-[#20251F] tracking-[-0.04em] leading-[0.95] max-w-5xl">
              For every<br />complex document
            </h2>
          </div>

          {/* ═════════════════════════════════════════════════
              ASSEMBLED WORKSPACE & SPLIT HERO LAYOUT
              Left: Single Progressive Vector Substrate Card (glides smoothly from center to left)
              Right: Editorial Feature Column (Smoothly Cascades One by One)
              ═════════════════════════════════════════════════ */}
          <div
            style={{
              opacity: cardContainerOpacity,
              pointerEvents: cardContainerOpacity > 0.1 ? 'auto' : 'none',
            }}
            className="relative w-full max-w-6xl mx-auto flex items-center justify-center z-20"
          >
            {/* PROGRESSIVE VECTOR SUBSTRATE CARD CONTAINER */}
            <div
              style={{
                transform: `translateX(-${cardTranslateX}px)`,
              }}
              className="w-full max-w-[620px] flex justify-center will-change-transform flex-shrink-0"
            >
              <VectorSubstrateCard
                progress={cardProgress}
                activeMode={activeMode}
                setActiveMode={setActiveMode}
                demoLoaded={demoLoaded}
                setDemoLoaded={setDemoLoaded}
                isExpanded={isExpanded}
              />
            </div>

            {/* EDITORIAL FEATURE COLUMN (Anchored to right, staggered cascade) */}
            <div
              style={{
                opacity: rightColAlpha,
                transform: `translateX(${rightColTranslateX}px)`,
                pointerEvents: splitProgress > 0.7 ? 'auto' : 'none',
              }}
              className="hidden lg:flex absolute right-0 xl:right-4 flex-col justify-center w-[440px] space-y-6 font-mono-industrial select-none pl-6 xl:pl-10 border-l border-[#20251F]/15 will-change-transform"
            >
              <div>
                <div
                  style={getStaggerStyle(0.06, 0.26)}
                  className="text-[9px] font-bold tracking-[0.2em] text-[#20251F]/50 uppercase mb-2 will-change-transform"
                >
                  YOUR CLIENT DATA. YOUR DEVICE. AIR-GAPPED.
                </div>
                <h2
                  style={getStaggerStyle(0.18, 0.38)}
                  className="text-3xl xl:text-4xl font-black uppercase text-[#20251F] tracking-tight leading-[1.05] will-change-transform"
                >
                  RUN OCR NATIVELY<br />IN YOUR BROWSER
                </h2>
                <p
                  style={getStaggerStyle(0.30, 0.50)}
                  className="text-[12px] sm:text-[13px] leading-relaxed text-[#20251F]/70 font-sans mt-3 will-change-transform"
                >
                  Textify executes deterministic optical character recognition inside your browser's private WebAssembly sandbox. It reads complex document layouts, deskews angles, and isolates tables without transmitting confidential bytes.
                </p>
              </div>

              {/* Feature Checklist Rows (Staggered One-by-One) */}
              <div className="space-y-3 pt-4 border-t border-[#20251F]/15">
                {[
                  { text: 'Works with Invoices, Receipts, NDAs, Identity Cards.', tag: 'MULTI-DOC', range: [0.42, 0.60] },
                  { text: 'OpenCV Radon deskew aligns skewed angles to 0.00°.', tag: 'RADON', range: [0.50, 0.68] },
                  { text: 'Adaptive OTSU binarization recovers faint thermal ink.', tag: 'OTSU', range: [0.58, 0.76] },
                  { text: 'Direct RFC-8259 JSON, Markdown, and CSV serialization.', tag: 'RFC-8259', range: [0.66, 0.84] },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    style={getStaggerStyle(row.range[0], row.range[1])}
                    className="flex items-center justify-between py-2 border-b border-[#20251F]/10 text-[10px] text-[#20251F] will-change-transform"
                  >
                    <span className="font-semibold text-[#20251F]/90">{row.text}</span>
                    <span className="ml-2 px-1.5 py-0.5 bg-[#20251F]/5 text-[#214C3A] font-bold text-[8px] uppercase">
                      [{row.tag}]
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={getStaggerStyle(0.76, 0.94)}
                className="pt-2 will-change-transform"
              >
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#214C3A] text-[#FFFDF7] text-[10px] font-bold uppercase tracking-[0.14em] hover:bg-[#18382b] transition-colors shadow-drafting-sm cursor-pointer"
                >
                  <span>LAUNCH APP WORKSPACE</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2: DUAL PLATFORM SPOTLIGHT (#runtime-modes)
          Continuous Natural Flow: Left Sticky Info • Right Stacked Modals
          ═══════════════════════════════════════════════════════ */}
      <section
        ref={runtimeSectionRef}
        id="runtime-modes"
        data-section="runtime-modes"
        className="relative w-full bg-[#F3EFE3] border-b border-[#20251F]/20 pt-20 md:pt-28 pb-32 md:pb-48 z-20"
      >
        {/* Drafting Perimeter Borders */}
        <div className="absolute inset-0 pointer-events-none z-30">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#20251F]/20" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#20251F]/20" />
          <div className="absolute top-0 bottom-0 left-4 md:left-8 w-[1px] bg-[#20251F]/10" />
          <div className="absolute top-0 bottom-0 right-4 md:right-8 w-[1px] bg-[#20251F]/10" />
          <span className="absolute top-2.5 left-6 md:left-10 text-[11px] font-mono font-light text-[#20251F]/40 select-none">+</span>
          <span className="absolute top-2.5 right-6 md:right-10 text-[11px] font-mono font-light text-[#20251F]/40 select-none">+</span>
          <span className="absolute bottom-2.5 left-6 md:left-10 text-[11px] font-mono font-light text-[#20251F]/40 select-none">+</span>
          <span className="absolute bottom-2.5 right-6 md:right-10 text-[11px] font-mono font-light text-[#20251F]/40 select-none">+</span>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-16 items-start relative z-20">
          {/* ═════════════════════════════════════════════════
              LEFT COLUMN: Sticky Dynamic Headline & Info Panel
              ═════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 sticky top-20 md:top-24 xl:top-28 self-start space-y-5">
            {/* Mode Indicator & Navigation Tabs */}
            <div className="flex items-center justify-between pb-4 border-b border-[#20251F]/15">
              <div className="font-mono-industrial text-[9px] font-bold tracking-[0.2em] uppercase text-[#20251F]/50 flex items-center gap-2">
                <span className="text-[#E96C3F]">[{activeRuntimeIndex === 0 ? '01' : '02'}]</span>
                <span>DUAL RUNTIME ARCHITECTURE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleScrollToCard(0)}
                  className={`px-2.5 py-1 font-mono-industrial text-[9px] font-bold uppercase tracking-[0.14em] border transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeRuntimeIndex === 0
                      ? 'bg-[#214C3A] text-[#FFFDF7] border-[#214C3A] shadow-drafting-sm'
                      : 'bg-[#FFFDF7] text-[#20251F]/60 border-[#20251F]/20 hover:border-[#20251F]/50'
                  }`}
                >
                  <span className={activeRuntimeIndex === 0 ? 'text-[#FFFDF7]' : 'text-[#214C3A]'}>[01]</span>
                  <span>WASM</span>
                </button>
                <button
                  onClick={() => handleScrollToCard(1)}
                  className={`px-2.5 py-1 font-mono-industrial text-[9px] font-bold uppercase tracking-[0.14em] border transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeRuntimeIndex === 1
                      ? 'bg-[#20251F] text-[#FFFDF7] border-[#20251F] shadow-drafting-sm'
                      : 'bg-[#FFFDF7] text-[#20251F]/60 border-[#20251F]/20 hover:border-[#20251F]/50'
                  }`}
                >
                  <span className={activeRuntimeIndex === 1 ? 'text-[#E96C3F]' : 'text-[#20251F]/50'}>[02]</span>
                  <span>CLI</span>
                </button>
              </div>
            </div>

            {/* Dynamic Content Panel (Smooth transition between Web and CLI modes) */}
            {activeRuntimeIndex === 0 ? (
              <div className="space-y-5 transition-opacity duration-300">
                <div className="flex items-center gap-2 text-[9px] font-mono-industrial font-bold uppercase tracking-[0.16em] text-[#214C3A]">
                  <span className="w-2 h-2 rounded-full bg-[#214C3A] animate-pulse" />
                  <span>MODE 01 ACTIVE &bull; EPHEMERAL IN-BROWSER WASM</span>
                </div>

                <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black uppercase text-[#20251F] tracking-[-0.03em] leading-[0.95]">
                  Client-Side<br />Web Runtime
                </h2>

                <p className="font-mono-industrial text-[11px] sm:text-[12px] text-[#20251F]/70 leading-relaxed uppercase max-w-md">
                  A private in-memory OCR environment executing multithreaded WebAssembly workers right inside your browser tab. Drop any image or scan for instant optical extraction with zero server calls.
                </p>

                <div className="p-4 bg-[#FFFDF7] border border-[#20251F]/20 shadow-drafting-sm space-y-2.5 font-mono-industrial text-[10px]">
                  <div className="flex justify-between border-b border-[#20251F]/10 pb-1.5">
                    <span className="text-[#20251F]/60">SANDBOX ENVIRONMENT:</span>
                    <span className="font-bold text-[#20251F]">CLIENT BROWSER (LOCAL WASM)</span>
                  </div>
                  <div className="flex justify-between border-b border-[#20251F]/10 pb-1.5">
                    <span className="text-[#20251F]/60">EXTERNAL NETWORK PAYLOAD:</span>
                    <span className="font-bold text-[#214C3A]">0.00 BYTES TRANSMITTED</span>
                  </div>
                  <div className="flex justify-between border-b border-[#20251F]/10 pb-1.5">
                    <span className="text-[#20251F]/60">EXECUTION THREADS:</span>
                    <span className="font-bold text-[#20251F]">4 PARALLEL WEBWORKERS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#20251F]/60">EXTRACTION LATENCY:</span>
                    <span className="font-bold text-[#20251F]">&lt; 350 MS / PAGE</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/app"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#214C3A] text-[#FFFDF7] font-mono-industrial text-[10px] font-bold uppercase tracking-[0.14em] hover:bg-[#18382b] transition-colors shadow-drafting-sm cursor-pointer"
                  >
                    <span>OPEN WEB WORKSPACE</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-5 transition-opacity duration-300">
                <div className="flex items-center gap-2 text-[9px] font-mono-industrial font-bold uppercase tracking-[0.16em] text-[#E96C3F]">
                  <span className="w-2 h-2 rounded-full bg-[#E96C3F] animate-pulse" />
                  <span>MODE 02 ACTIVE &bull; HEADLESS BATCH DAEMON</span>
                </div>

                <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black uppercase text-[#20251F] tracking-[-0.03em] leading-[0.95]">
                  Headless Batch<br />CLI Engine
                </h2>

                <p className="font-mono-industrial text-[11px] sm:text-[12px] text-[#20251F]/70 leading-relaxed uppercase max-w-md">
                  Watch local document folders, process incoming invoice drops in the background, and output validated JSON schemas or Markdown tables to local storage via pure terminal execution.
                </p>

                <div className="p-4 bg-[#FFFDF7] border border-[#20251F]/20 shadow-drafting-sm space-y-2.5 font-mono-industrial text-[10px]">
                  <div className="flex justify-between border-b border-[#20251F]/10 pb-1.5">
                    <span className="text-[#20251F]/60">RUNTIME TARGET:</span>
                    <span className="font-bold text-[#20251F]">NODE.JS / LINUX / MACOS CLI</span>
                  </div>
                  <div className="flex justify-between border-b border-[#20251F]/10 pb-1.5">
                    <span className="text-[#20251F]/60">THROUGHPUT RATE:</span>
                    <span className="font-bold text-[#E96C3F]">~120 PAGES / MINUTE</span>
                  </div>
                  <div className="flex justify-between border-b border-[#20251F]/10 pb-1.5">
                    <span className="text-[#20251F]/60">DESKEW & HOMOGRAPHY:</span>
                    <span className="font-bold text-[#20251F]">OPENCV RADON NATIVE MATRIX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#20251F]/60">AUTOMATION TRIGGER:</span>
                    <span className="font-bold text-[#20251F]">RECURSIVE FS FOLDER WATCHER</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/docs"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#20251F] text-[#FFFDF7] font-mono-industrial text-[10px] font-bold uppercase tracking-[0.14em] hover:bg-[#151914] transition-colors shadow-drafting-sm cursor-pointer"
                  >
                    <span>VIEW CLI DOCUMENTATION</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ═════════════════════════════════════════════════
              RIGHT COLUMN: Scrolling Modals Track (Vertically Stacked)
              ═════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-24 md:space-y-36 pb-24 md:pb-36">
            {/* MODAL 1: CLIENT-SIDE WEB RUNTIME (Top Card) */}
            <div
              ref={card1Ref}
              id="runtime-card-web"
              className="relative p-6 md:p-8 border border-[#20251F]/20 bg-[#FFFDF7] shadow-drafting-sm flex flex-col justify-between"
            >
              <span className="corner-crosshair top-3 left-3 text-[10px] font-mono">+</span>
              <span className="corner-crosshair top-3 right-3 text-[10px] font-mono">+</span>
              <span className="corner-crosshair bottom-3 left-3 text-[10px] font-mono">+</span>
              <span className="corner-crosshair bottom-3 right-3 text-[10px] font-mono">+</span>

              <div>
                {/* Header & Sandbox URL bar */}
                <div className="flex items-center justify-between pb-3 border-b border-[#20251F]/15 font-mono-industrial text-[9px] font-bold uppercase tracking-[0.16em]">
                  <span className="text-[#214C3A] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#214C3A]" />
                    [01] WEBASSEMBLY WORKER POOL
                  </span>
                  <span className="bg-[#214C3A] text-[#FFFDF7] px-2 py-0.5">IN-BROWSER WASM</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[#20251F]/10 font-mono-industrial text-[8px] text-[#20251F]/60">
                  <div className="flex items-center gap-2">
                    <LockKey className="w-3 h-3 text-[#214C3A]" />
                    <span className="font-mono text-[#20251F]/80">app.textify.dev/workspace</span>
                  </div>
                  <span className="text-[#214C3A] font-bold">[AIR-GAPPED PROTOCOL]</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#20251F] mt-4 mb-3">
                  Ephemeral Browser Sandbox
                </h3>

                {/* 4 WebWorker Thread Allocation Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 font-mono-industrial text-[9px]">
                  <div className="p-2.5 bg-[#20251F]/[0.03] border border-[#20251F]/10">
                    <div className="flex items-center justify-between text-[#20251F]/50 font-bold mb-1">
                      <span>WORKER 01</span>
                      <span className="text-[#214C3A] font-bold">[ACTIVE]</span>
                    </div>
                    <div className="font-bold text-[#20251F]">RADON HOMOGRAPHY</div>
                    <div className="text-[8px] text-[#20251F]/60 font-mono mt-0.5">&theta; = 0.00&deg; orthogonal warp</div>
                  </div>

                  <div className="p-2.5 bg-[#20251F]/[0.03] border border-[#20251F]/10">
                    <div className="flex items-center justify-between text-[#20251F]/50 font-bold mb-1">
                      <span>WORKER 02</span>
                      <span className="text-[#214C3A] font-bold">[ACTIVE]</span>
                    </div>
                    <div className="font-bold text-[#20251F]">OTSU BINARIZER</div>
                    <div className="text-[8px] text-[#20251F]/60 font-mono mt-0.5">contrast normalized 100%</div>
                  </div>

                  <div className="p-2.5 bg-[#20251F]/[0.03] border border-[#20251F]/10">
                    <div className="flex items-center justify-between text-[#20251F]/50 font-bold mb-1">
                      <span>WORKER 03</span>
                      <span className="text-[#214C3A] font-bold">[ACTIVE]</span>
                    </div>
                    <div className="font-bold text-[#20251F]">TESSERACT 5.0 LSTM</div>
                    <div className="text-[8px] text-[#20251F]/60 font-mono mt-0.5">48 glyph tokens parsed</div>
                  </div>

                  <div className="p-2.5 bg-[#20251F]/[0.03] border border-[#20251F]/10">
                    <div className="flex items-center justify-between text-[#20251F]/50 font-bold mb-1">
                      <span>WORKER 04</span>
                      <span className="text-[#214C3A] font-bold">[ACTIVE]</span>
                    </div>
                    <div className="font-bold text-[#20251F]">SCHEMA SERIALIZER</div>
                    <div className="text-[8px] text-[#20251F]/60 font-mono mt-0.5">RFC-8259 JSON in memory</div>
                  </div>
                </div>

                {/* Technical Spec Matrix */}
                <div className="space-y-1.5 bg-[#20251F]/[0.03] p-3.5 border border-[#20251F]/10 font-mono-industrial text-[9px]">
                  <div className="flex justify-between border-b border-[#20251F]/10 pb-1">
                    <span className="text-[#20251F]/60">MEMORY FOOTPRINT:</span>
                    <span className="font-bold text-[#20251F]">~18.4 MB IN-MEMORY BUFFER</span>
                  </div>
                  <div className="flex justify-between border-b border-[#20251F]/10 pb-1">
                    <span className="text-[#20251F]/60">SANDBOX HEAP:</span>
                    <span className="font-bold text-[#214C3A]">ISOLATED WEBASSEMBLY HEAP (4 THREADS)</span>
                  </div>
                  <div className="flex justify-between border-b border-[#20251F]/10 pb-1">
                    <span className="text-[#20251F]/60">EGRESS TRAFFIC:</span>
                    <span className="font-bold text-[#E96C3F]">0.00 BYTES EXTERNAL (AIR-GAPPED)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#20251F]/60">EXPORT SCHEMAS:</span>
                    <span className="font-bold text-[#20251F]">RFC-8259 JSON, MARKDOWN, CSV</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-[#20251F]/15 flex items-center justify-between">
                <span className="font-mono-industrial text-[9px] font-bold text-[#20251F]/60 uppercase">
                  LATENCY: &lt; 350 MS / PAGE
                </span>
                <Link
                  to="/app"
                  className="bg-[#214C3A] text-[#FFFDF7] px-4 py-2 font-mono-industrial text-[9px] font-bold tracking-[0.12em] uppercase hover:bg-[#19392c] transition-colors flex items-center gap-1.5 cursor-pointer shadow-drafting-sm"
                >
                  <span>OPEN WEB WORKSPACE</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* MODAL 2: HEADLESS BATCH CLI ENGINE (Bottom Card) */}
            <div
              ref={card2Ref}
              id="runtime-card-cli"
              className="relative p-6 md:p-8 border border-[#20251F]/20 bg-[#20251F] text-[#FFFDF7] shadow-drafting-sm flex flex-col justify-between"
            >
              <span className="corner-crosshair top-3 left-3 text-[10px] font-mono text-[#FFFDF7]/30">+</span>
              <span className="corner-crosshair top-3 right-3 text-[10px] font-mono text-[#FFFDF7]/30">+</span>
              <span className="corner-crosshair bottom-3 left-3 text-[10px] font-mono text-[#FFFDF7]/30">+</span>
              <span className="corner-crosshair bottom-3 right-3 text-[10px] font-mono text-[#FFFDF7]/30">+</span>

              <div>
                {/* Header & Daemon status */}
                <div className="flex items-center justify-between pb-3 border-b border-[#FFFDF7]/15 font-mono-industrial text-[9px] font-bold uppercase tracking-[0.16em]">
                  <span className="text-[#E96C3F] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E96C3F]" />
                    [02] LOCAL DAEMON RUNTIME
                  </span>
                  <span className="bg-[#FFFDF7]/15 text-[#FFFDF7] px-2 py-0.5 font-mono">PID: 49102 [WATCHING]</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[#FFFDF7]/10 font-mono text-[8px] text-[#FFFDF7]/60">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3 h-3 text-[#E96C3F]" />
                    <span>textify-daemon@localhost: ~/scans</span>
                  </div>
                  <span className="text-[#E96C3F] font-bold">[RECURSIVE FS LISTENER]</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#FFFDF7] mt-4 mb-3">
                  Automated Directory Daemon
                </h3>

                {/* Directory Pipeline Flow Visualizer */}
                <div className="p-3 bg-[#151914] border border-[#FFFDF7]/15 font-mono text-[9px] mb-4 space-y-1.5">
                  <div className="text-[#FFFDF7]/50 text-[8px] font-bold uppercase tracking-wider border-b border-[#FFFDF7]/10 pb-1">
                    DIRECTORY PIPELINE FLOW &bull; /HOME/USER/SCANS/
                  </div>
                  <div className="flex items-center justify-between text-[#D9E4CB]">
                    <span>├── 📄 INV-2023-0814.pdf</span>
                    <span className="text-[#E96C3F] text-[8px]">[Radon Affine] &rarr; .json (0.24s)</span>
                  </div>
                  <div className="flex items-center justify-between text-[#D9E4CB]">
                    <span>├── 📄 CONTRACT_NDA.tiff</span>
                    <span className="text-[#214C3A] text-[8px]">[OTSU Binarize] &rarr; .json (0.31s)</span>
                  </div>
                  <div className="flex items-center justify-between text-[#FFFDF7]/60">
                    <span>└── 📄 RECEIPT_9921.png</span>
                    <span className="text-[#FFFDF7]/40 text-[8px]">[WASM LSTM] &rarr; in queue</span>
                  </div>
                </div>

                {/* Copyable Terminal Snippet */}
                <div className="bg-[#151914] p-4 border border-[#FFFDF7]/15 font-mono text-[9px] space-y-2 relative">
                  <div className="flex items-center justify-between text-[#FFFDF7]/50 border-b border-[#FFFDF7]/10 pb-1 text-[8px]">
                    <span>BASH &bull; AIR-GAPPED ETL PIPELINE</span>
                    <button
                      onClick={handleCopyCliCmd}
                      className="text-[#E96C3F] hover:text-[#FFFDF7] flex items-center gap-1 font-bold cursor-pointer"
                    >
                      {copiedCliCmd ? <Check className="w-3 h-3 text-[#E96C3F]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCliCmd ? 'COPIED' : 'COPY COMMAND'}</span>
                    </button>
                  </div>
                  <div className="text-[#D9E4CB] font-bold">
                    $ npx @textify/cli watch ./scans --out ./structured --format=json
                  </div>
                  <div className="text-[#FFFDF7]/60 text-[8px] leading-relaxed">
                    [DAEMON] Monitoring ./scans &bull; 4 worker threads initialized<br />
                    [QUEUE] 12 documents detected &bull; Radon deskew pass active<br />
                    [EXPORT] 12/12 JSON schemas serialized to disk (0 errors)
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-[#FFFDF7]/15 flex items-center justify-between">
                <span className="font-mono-industrial text-[9px] font-bold text-[#FFFDF7]/60 uppercase">
                  THROUGHPUT: ~120 PAGES / MIN
                </span>
                <Link
                  to="/docs"
                  className="bg-[#FFFDF7] text-[#20251F] px-4 py-2 font-mono-industrial text-[9px] font-bold tracking-[0.12em] uppercase hover:bg-[#F3EFE3] transition-colors flex items-center gap-1.5 cursor-pointer shadow-drafting-sm"
                >
                  <span>VIEW CLI DOCS</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3: AUTONOMOUS OCR EXECUTION LOOP (#pipeline-stages)
          Heron-style 4-Stage Kinetic Loop: Ingest • Deskew • Threshold • Structure
          ═════════════════════════════════════════════════ */}
      <section
        ref={pipelineSectionRef}
        id="pipeline-stages"
        className="py-20 md:py-28 max-w-[1440px] mx-auto px-6 md:px-12 border-b border-[#20251F]/20 relative z-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#20251F]/20 pb-6 mb-12">
          <div>
            <div className="font-mono-industrial text-[9px] font-bold tracking-[0.2em] uppercase text-[#20251F]/50 mb-2 flex items-center gap-2">
              <span className="text-[#E96C3F]">[ 03 ]</span>
              <span>CORE OCR PIPELINE &bull; DETERMINISTIC EXECUTION</span>
            </div>
            <h2
              className="uppercase font-black leading-[0.92] tracking-[-0.04em] text-[#20251F]"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.8rem)' }}
            >
              Built to Reconstruct<br />What Scanners Destroy.
            </h2>
          </div>
          <p className="mt-4 md:mt-0 font-mono-industrial text-[11px] md:text-[12px] font-normal leading-relaxed uppercase text-[#20251F]/70 max-w-md">
            Traditional OCR dumps unsegmented string soup. Textify isolates physical document geometry through a deterministic 4-stage pipeline directly in memory.
          </p>
        </div>

        {/* 4-Stage Alternating Zig-Zag Stream */}
        <div className="space-y-24 md:space-y-36 lg:space-y-44">
          {/* ───────────────────────────────────────────────────────────
              STAGE 1: INGEST (Visual Left • Action Bar Right)
              ─────────────────────────────────────────────────────────── */}
          <div
            ref={stage1Ref}
            className="relative min-h-[420px] lg:min-h-[480px] flex items-center"
          >
            {/* Continuous Heron 1px Orange Hairline running full width */}
            <div
              ref={stage1LineWrapperRef}
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none z-0 will-change-transform opacity-0"
            >
              <div
                ref={stage1LineRef}
                className="w-full h-[1px] bg-[#E96C3F]/50 relative origin-center will-change-transform"
              >
                <span className="w-2 h-2 bg-[#E96C3F] absolute left-0 -top-[3.5px]" />
                <span className="w-2 h-2 bg-[#E96C3F] absolute right-0 -top-[3.5px]" />
              </div>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              {/* Visual Canvas (Cols 1-6) - De-boxed Floating Blueprint */}
              <div className="lg:col-span-6 relative min-h-[360px] md:min-h-[400px] flex items-center justify-center overflow-hidden">
                {/* Subtle Drafting Blueprint Grid */}
                <div
                  className="absolute inset-0 opacity-[0.05] pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #20251F 1px, transparent 1px), linear-gradient(to bottom, #20251F 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                  }}
                />

                {/* Corner Registration Crosshairs */}
                <span className="absolute top-2 left-2 font-mono text-[9px] text-[#20251F]/40 select-none">+ [0,0]</span>
                <span className="absolute top-2 right-2 font-mono text-[9px] text-[#20251F]/40 select-none">+ [1,0]</span>
                <span className="absolute bottom-2 left-2 font-mono text-[9px] text-[#20251F]/40 select-none">+ [0,1]</span>
                <span className="absolute bottom-2 right-2 font-mono text-[9px] text-[#20251F]/40 select-none">+ [1,1]</span>

                {/* Central Diagram: Tilted Document with Keystoning & Corner Crosshairs */}
                <div className="relative z-10 my-4 flex items-center justify-center">
                  <div
                    ref={stage1DocRef}
                    className="relative w-64 sm:w-72 h-44 bg-[#F5F2EA] border border-[#20251F]/40 shadow-drafting-sm p-4 will-change-transform"
                    style={{ transform: 'rotate(12.5deg) skewX(-4deg)' }}
                  >
                    {/* Simulated Text Lines on Substrate */}
                    <div className="space-y-2 opacity-50">
                      <div className="h-2 w-28 bg-[#20251F]" />
                      <div className="h-1.5 w-44 bg-[#20251F]" />
                      <div className="h-1.5 w-36 bg-[#20251F]" />
                      <div className="pt-2 flex gap-2">
                        <div className="h-1.5 w-16 bg-[#20251F]" />
                        <div className="h-1.5 w-16 bg-[#20251F]" />
                      </div>
                    </div>

                    {/* SVG Convex Hull Outline connecting corner pins */}
                    <svg
                      className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] pointer-events-none z-10"
                      viewBox="0 0 300 190"
                    >
                      <polygon
                        points="8,8 292,8 292,182 8,182"
                        fill="none"
                        stroke="#E96C3F"
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                        className="stage1-hull-line"
                        style={{ strokeDasharray: 500, strokeDashoffset: 500 }}
                      />
                    </svg>

                    {/* 4 Corner Pin Crosshairs */}
                    <span className="stage1-pin absolute -top-2 -left-2 w-4 h-4 rounded-full border border-[#E96C3F] bg-[#FFFDF7] flex items-center justify-center text-[7px] font-mono text-[#E96C3F] font-bold z-20">
                      +
                    </span>
                    <span className="stage1-pin absolute -top-2 -right-2 w-4 h-4 rounded-full border border-[#E96C3F] bg-[#FFFDF7] flex items-center justify-center text-[7px] font-mono text-[#E96C3F] font-bold z-20">
                      +
                    </span>
                    <span className="stage1-pin absolute -bottom-2 -right-2 w-4 h-4 rounded-full border border-[#E96C3F] bg-[#FFFDF7] flex items-center justify-center text-[7px] font-mono text-[#E96C3F] font-bold z-20">
                      +
                    </span>
                    <span className="stage1-pin absolute -bottom-2 -left-2 w-4 h-4 rounded-full border border-[#E96C3F] bg-[#FFFDF7] flex items-center justify-center text-[7px] font-mono text-[#E96C3F] font-bold z-20">
                      +
                    </span>
                  </div>

                  {/* Heron-Style Orange Callout Card */}
                  <div
                    ref={stage1CalloutRef}
                    className="absolute right-0 sm:-right-4 bottom-0 bg-[#E96C3F] text-[#FFFDF7] p-3 shadow-drafting-sm font-mono text-[9px] max-w-[210px] z-20 border border-[#E96C3F] will-change-transform"
                    style={{ transformOrigin: 'bottom right' }}
                  >
                    <div className="flex items-center justify-between font-bold border-b border-[#FFFDF7]/30 pb-1 mb-1">
                      <span>KEYSTONE SKEW</span>
                      <span className="text-[8px] opacity-80">[x]</span>
                    </div>
                    <div className="font-bold text-[10px]">θ = +12.50° ANGULAR SKEW</div>
                    <div className="text-[8px] opacity-90 mt-0.5">4 Hull Corners Registered in WASM</div>
                  </div>
                </div>
              </div>

              {/* Action Bar (Cols 7-12) - Centered directly on orange hairline */}
              <div
                ref={stage1BarWrapperRef}
                className="lg:col-span-6 font-mono-industrial will-change-transform opacity-0 pointer-events-none select-none"
              >
                <div
                  ref={stage1BarRef}
                  className="bg-[#20251F] text-[#FFFDF7] border border-[#20251F] h-12 md:h-14 px-5 flex items-center justify-between shadow-drafting-sm will-change-transform"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E96C3F] animate-pulse" />
                    <span className="font-black text-xs sm:text-sm tracking-widest text-[#FFFDF7] uppercase">
                      [01] INGEST
                    </span>
                  </div>
                  <span className="font-mono text-[10px] sm:text-xs text-[#FFFDF7]/85 tracking-wide text-right">
                    Calculates 4-point convex boundary hull directly in client memory
                  </span>
                  <span className="w-2 h-2 bg-[#E96C3F] shrink-0 ml-3" />
                </div>
              </div>
            </div>
          </div>

          {/* ───────────────────────────────────────────────────────────
              STAGE 2: RADON DESKEW (Action Bar Left • Visual Right)
              ─────────────────────────────────────────────────────────── */}
          <div
            ref={stage2Ref}
            className="relative min-h-[420px] lg:min-h-[480px] flex items-center"
          >
            {/* Continuous Heron 1px Orange Hairline running full width */}
            <div
              ref={stage2LineWrapperRef}
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none z-0 will-change-transform opacity-0"
            >
              <div
                ref={stage2LineRef}
                className="w-full h-[1px] bg-[#E96C3F]/50 relative origin-center will-change-transform"
              >
                <span className="w-2 h-2 bg-[#E96C3F] absolute left-0 -top-[3.5px]" />
                <span className="w-2 h-2 bg-[#E96C3F] absolute right-0 -top-[3.5px]" />
              </div>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              {/* Action Bar (Cols 1-6) - Centered directly on orange hairline */}
              <div
                ref={stage2BarWrapperRef}
                className="lg:col-span-6 font-mono-industrial order-2 lg:order-1 will-change-transform opacity-0 pointer-events-none select-none"
              >
                <div
                  ref={stage2BarRef}
                  className="bg-[#20251F] text-[#FFFDF7] border border-[#20251F] h-12 md:h-14 px-5 flex items-center justify-between shadow-drafting-sm will-change-transform"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E96C3F] animate-pulse" />
                    <span className="font-black text-xs sm:text-sm tracking-widest text-[#FFFDF7] uppercase">
                      [02] RADON DESKEW
                    </span>
                  </div>
                  <span className="font-mono text-[10px] sm:text-xs text-[#FFFDF7]/85 tracking-wide text-right">
                    Affine homography warps tilted document angles to 0.00° orthogonal
                  </span>
                  <span className="w-2 h-2 bg-[#E96C3F] shrink-0 ml-3" />
                </div>
              </div>

              {/* Visual Canvas (Cols 7-12) - De-boxed Floating Blueprint */}
              <div className="lg:col-span-6 relative min-h-[360px] md:min-h-[400px] flex items-center justify-center overflow-hidden order-1 lg:order-2">
                {/* Subtle Drafting Blueprint Grid */}
                <div
                  className="absolute inset-0 opacity-[0.05] pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #20251F 1px, transparent 1px), linear-gradient(to bottom, #20251F 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                  }}
                />

                {/* Corner Registration Crosshairs */}
                <span className="absolute top-2 left-2 font-mono text-[9px] text-[#20251F]/40 select-none">+ [0,0]</span>
                <span className="absolute top-2 right-2 font-mono text-[9px] text-[#20251F]/40 select-none">+ [1,0]</span>
                <span className="absolute bottom-2 left-2 font-mono text-[9px] text-[#20251F]/40 select-none">+ [0,1]</span>
                <span className="absolute bottom-2 right-2 font-mono text-[9px] text-[#20251F]/40 select-none">+ [1,1]</span>

                {/* Central Diagram: Orthogonal Rectified Substrate with Alignment Rays */}
                <div className="relative z-10 my-4 flex items-center justify-center">
                  <div
                    ref={stage2DocRef}
                    className="relative w-64 sm:w-72 h-44 bg-[#F5F2EA] border-2 border-[#20251F] shadow-drafting-sm p-4 will-change-transform"
                    style={{ transformOrigin: 'center center' }}
                  >
                    {/* Horizontal Text Alignment Guideline Ray */}
                    <div
                      ref={stage2RayRef}
                      className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-[#E96C3F] z-10 origin-left will-change-transform"
                    />

                    <div className="space-y-2 opacity-70">
                      <div className="h-2 w-32 bg-[#20251F]" />
                      <div className="h-1.5 w-48 bg-[#20251F]" />
                      <div className="h-1.5 w-40 bg-[#20251F]" />
                      <div className="pt-2 flex justify-between">
                        <div className="h-1.5 w-20 bg-[#20251F]" />
                        <div className="h-1.5 w-12 bg-[#214C3A]" />
                      </div>
                    </div>

                    {/* Corner Orthogonal Markers */}
                    <span className="stage2-corner-marker absolute top-1 left-1 text-[8px] font-mono font-bold text-[#20251F]">┌</span>
                    <span className="stage2-corner-marker absolute top-1 right-1 text-[8px] font-mono font-bold text-[#20251F]">┐</span>
                    <span className="stage2-corner-marker absolute bottom-1 right-1 text-[8px] font-mono font-bold text-[#20251F]">┘</span>
                    <span className="stage2-corner-marker absolute bottom-1 left-1 text-[8px] font-mono font-bold text-[#20251F]">└</span>
                  </div>

                  {/* Heron-Style Dark Callout Card */}
                  <div
                    ref={stage2CalloutRef}
                    className="absolute left-0 sm:-left-4 bottom-0 bg-[#20251F] text-[#FFFDF7] p-3 shadow-drafting-sm font-mono text-[9px] max-w-[220px] z-20 border border-[#FFFDF7]/20 will-change-transform"
                    style={{ transformOrigin: 'bottom left' }}
                  >
                    <div className="flex items-center justify-between font-bold border-b border-[#FFFDF7]/20 pb-1 mb-1">
                      <span>RADON HOMOGRAPHY</span>
                      <span className="text-[8px] text-[#D9E4CB] font-bold">[✓] 0.00°</span>
                    </div>
                    <div className="text-[#FFFDF7]/90 leading-tight">
                      &bull; Δθ = -12.50° WARP APPLIED<br />
                      &bull; BICUBIC RESAMPLING: ZERO SHEAR<br />
                      &bull; ORTHOGONAL AXIS: STABILIZED
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ───────────────────────────────────────────────────────────
              STAGE 3: THRESHOLD & WASM (Visual Left • Action Bar Right)
              ─────────────────────────────────────────────────────────── */}
          <div
            ref={stage3Ref}
            className="relative min-h-[420px] lg:min-h-[480px] flex items-center"
          >
            {/* Continuous Heron 1px Orange Hairline running full width */}
            <div
              ref={stage3LineWrapperRef}
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none z-0 will-change-transform opacity-0"
            >
              <div
                ref={stage3LineRef}
                className="w-full h-[1px] bg-[#E96C3F]/50 relative origin-center will-change-transform"
              >
                <span className="w-2 h-2 bg-[#E96C3F] absolute left-0 -top-[3.5px]" />
                <span className="w-2 h-2 bg-[#E96C3F] absolute right-0 -top-[3.5px]" />
              </div>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              {/* Visual Canvas (Cols 1-6) - De-boxed Floating Blueprint */}
              <div className="lg:col-span-6 relative min-h-[360px] md:min-h-[400px] flex items-center justify-center overflow-hidden">
                {/* Subtle Drafting Blueprint Grid */}
                <div
                  className="absolute inset-0 opacity-[0.05] pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #20251F 1px, transparent 1px), linear-gradient(to bottom, #20251F 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                  }}
                />

                {/* Corner Registration Crosshairs */}
                <span className="absolute top-2 left-2 font-mono text-[9px] text-[#20251F]/40 select-none">+ [0,0]</span>
                <span className="absolute top-2 right-2 font-mono text-[9px] text-[#20251F]/40 select-none">+ [1,0]</span>
                <span className="absolute bottom-2 left-2 font-mono text-[9px] text-[#20251F]/40 select-none">+ [0,1]</span>
                <span className="absolute bottom-2 right-2 font-mono text-[9px] text-[#20251F]/40 select-none">+ [1,1]</span>

                {/* Central Diagram: Dynamic Split Slider Comparison */}
                <div className="relative z-10 my-4 flex items-center justify-center">
                  <div className="relative w-64 sm:w-72 h-44 border border-[#20251F]/30 shadow-drafting-sm overflow-hidden select-none bg-[#EAE5D6]">
                    {/* Background Underlayer: Raw Thermal Substrate */}
                    <div className="w-full h-full p-4 relative">
                      <div className="text-[7px] font-mono text-[#20251F]/40 font-bold uppercase mb-2">
                        RAW THERMAL SUBSTRATE (LOW CONTRAST)
                      </div>
                      <div className="space-y-2 opacity-25">
                        <div className="h-2 w-28 bg-[#20251F]" />
                        <div className="h-1.5 w-44 bg-[#20251F]" />
                        <div className="h-1.5 w-36 bg-[#20251F]" />
                        <div className="h-1.5 w-24 bg-[#20251F]" />
                      </div>
                    </div>

                    {/* Foreground Reveal Mask Layer (Dynamic width) */}
                    <div
                      ref={stage3MaskRef}
                      className="absolute inset-y-0 left-0 bg-[#FFFDF7] border-r-2 border-[#E96C3F] overflow-hidden z-10 will-change-[width]"
                      style={{ width: '25%' }}
                    >
                      <div className="w-64 sm:w-72 h-44 p-4 relative">
                        <div className="text-[7px] font-mono text-[#214C3A] font-bold uppercase mb-2">
                          OTSU BINARIZED &bull; LSTM EXTRACTED
                        </div>
                        <div className="space-y-2">
                          <div className="stage3-token-box border border-[#E96C3F] px-1.5 py-0.5 inline-block text-[7px] font-mono font-bold text-[#E96C3F] bg-[#E96C3F]/5">
                            [TOK: "INVOICE"] 99.8%
                          </div>
                          <div className="flex gap-2">
                            <div className="stage3-token-box border border-[#214C3A] px-1.5 py-0.5 text-[7px] font-mono font-bold text-[#214C3A] bg-[#214C3A]/5">
                              [VAL: "€5,565.00"] 99.9%
                            </div>
                            <div className="stage3-token-box border border-[#20251F] px-1.5 py-0.5 text-[7px] font-mono font-bold text-[#20251F] bg-[#20251F]/5">
                              [TAX: 20%]
                            </div>
                          </div>
                          <div className="stage3-token-box border border-[#214C3A] px-1.5 py-0.5 inline-block text-[7px] font-mono font-bold text-[#214C3A] bg-[#214C3A]/5">
                            [VENDOR: "ARKHITECTURA"]
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Vertical Slider Handle */}
                    <div
                      ref={stage3HandleRef}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#E96C3F] text-[#FFFDF7] text-[8px] font-mono px-1 py-0.5 shadow-drafting-sm z-20 cursor-ew-resize will-change-[left]"
                      style={{ left: '25%' }}
                    >
                      &#8644;
                    </div>
                  </div>

                  {/* Heron-Style Orange Callout Card */}
                  <div
                    ref={stage3CalloutRef}
                    className="absolute right-0 sm:-right-4 bottom-0 bg-[#E96C3F] text-[#FFFDF7] p-3 shadow-drafting-sm font-mono text-[9px] max-w-[210px] z-20 border border-[#E96C3F] will-change-transform"
                    style={{ transformOrigin: 'bottom right' }}
                  >
                    <div className="flex items-center justify-between font-bold border-b border-[#FFFDF7]/30 pb-1 mb-1">
                      <span>ADAPTIVE OTSU</span>
                      <span className="text-[8px] opacity-80">[x]</span>
                    </div>
                    <div className="font-bold text-[10px]">99.82% CONFIDENCE SCORE</div>
                    <div className="text-[8px] opacity-90 mt-0.5">48 Glyph Tokens Mapped via WASM</div>
                  </div>
                </div>
              </div>

              {/* Action Bar (Cols 7-12) - Centered directly on orange hairline */}
              <div
                ref={stage3BarWrapperRef}
                className="lg:col-span-6 font-mono-industrial will-change-transform opacity-0 pointer-events-none select-none"
              >
                <div
                  ref={stage3BarRef}
                  className="bg-[#20251F] text-[#FFFDF7] border border-[#20251F] h-12 md:h-14 px-5 flex items-center justify-between shadow-drafting-sm will-change-transform"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E96C3F] animate-pulse" />
                    <span className="font-black text-xs sm:text-sm tracking-widest text-[#FFFDF7] uppercase">
                      [03] THRESHOLD & WASM
                    </span>
                  </div>
                  <span className="font-mono text-[10px] sm:text-xs text-[#FFFDF7]/85 tracking-wide text-right">
                    Adaptive OTSU binarization recovers faint ink for multithreaded LSTM
                  </span>
                  <span className="w-2 h-2 bg-[#E96C3F] shrink-0 ml-3" />
                </div>
              </div>
            </div>
          </div>

          {/* ───────────────────────────────────────────────────────────
              STAGE 4: STRUCTURE (Action Bar Left • Visual Right)
              ─────────────────────────────────────────────────────────── */}
          <div
            ref={stage4Ref}
            className="relative min-h-[420px] lg:min-h-[480px] flex items-center"
          >
            {/* Continuous Heron 1px Orange Hairline running full width */}
            <div
              ref={stage4LineWrapperRef}
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none z-0 will-change-transform opacity-0"
            >
              <div
                ref={stage4LineRef}
                className="w-full h-[1px] bg-[#E96C3F]/50 relative origin-center will-change-transform"
              >
                <span className="w-2 h-2 bg-[#E96C3F] absolute left-0 -top-[3.5px]" />
                <span className="w-2 h-2 bg-[#E96C3F] absolute right-0 -top-[3.5px]" />
              </div>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              {/* Action Bar (Cols 1-6) - Centered directly on orange hairline */}
              <div
                ref={stage4BarWrapperRef}
                className="lg:col-span-6 font-mono-industrial order-2 lg:order-1 will-change-transform opacity-0 pointer-events-none select-none"
              >
                <div
                  ref={stage4BarRef}
                  className="bg-[#20251F] text-[#FFFDF7] border border-[#20251F] h-12 md:h-14 px-5 flex items-center justify-between shadow-drafting-sm will-change-transform"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E96C3F] animate-pulse" />
                    <span className="font-black text-xs sm:text-sm tracking-widest text-[#FFFDF7] uppercase">
                      [04] STRUCTURE
                    </span>
                  </div>
                  <span className="font-mono text-[10px] sm:text-xs text-[#FFFDF7]/85 tracking-wide text-right">
                    Deterministic spatial parser serializes isolated tables to RFC-8259 schemas
                  </span>
                  <span className="w-2 h-2 bg-[#E96C3F] shrink-0 ml-3" />
                </div>
              </div>

              {/* Visual Canvas (Cols 7-12) - De-boxed Floating Blueprint */}
              <div className="lg:col-span-6 relative min-h-[360px] md:min-h-[400px] flex items-center justify-center overflow-hidden order-1 lg:order-2">
                {/* Subtle Drafting Blueprint Grid */}
                <div
                  className="absolute inset-0 opacity-[0.05] pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #20251F 1px, transparent 1px), linear-gradient(to bottom, #20251F 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                  }}
                />

                {/* Corner Registration Crosshairs */}
                <span className="absolute top-2 left-2 font-mono text-[9px] text-[#20251F]/40 select-none">+ [0,0]</span>
                <span className="absolute top-2 right-2 font-mono text-[9px] text-[#20251F]/40 select-none">+ [1,0]</span>
                <span className="absolute bottom-2 left-2 font-mono text-[9px] text-[#20251F]/40 select-none">+ [0,1]</span>
                <span className="absolute bottom-2 right-2 font-mono text-[9px] text-[#20251F]/40 select-none">+ [1,1]</span>

                {/* Central Diagram: Structured Layout Isolation Mesh */}
                <div className="relative z-10 my-4 flex items-center justify-center w-full">
                  <div className="bg-[#F5F2EA] border border-[#20251F]/30 p-3 shadow-drafting-sm space-y-2 font-mono text-[8px] max-w-[340px] w-full">
                    {/* Header KV Mesh */}
                    <div
                      ref={stage4HeaderRef}
                      className="p-2 bg-[#FFFDF7] border border-[#E96C3F] flex justify-between items-center will-change-transform"
                    >
                      <span className="text-[#E96C3F] font-bold">[KEY_VALUE]</span>
                      <span className="text-[#20251F]">INV-2023-0814 &bull; 14 OCT 2023</span>
                    </div>

                    {/* Table Row Mesh with sequentially animated rows */}
                    <div className="p-2 bg-[#FFFDF7] border border-[#214C3A] space-y-1">
                      <div className="text-[#214C3A] font-bold flex justify-between border-b border-[#214C3A]/20 pb-0.5">
                        <span>[TABLE: 4 ROWS ISOLATED]</span>
                        <span>EUR €</span>
                      </div>
                      <div className="stage4-table-row flex justify-between text-[#20251F]/80 will-change-transform">
                        <span>01 Arch. Services</span>
                        <span className="font-bold">1,250.00</span>
                      </div>
                      <div className="stage4-table-row flex justify-between text-[#20251F]/80 will-change-transform">
                        <span>02 Drafting Materials</span>
                        <span className="font-bold">450.00</span>
                      </div>
                      <div className="stage4-table-row flex justify-between text-[#20251F]/80 will-change-transform">
                        <span>03 Blueprint Prints</span>
                        <span className="font-bold">630.00</span>
                      </div>
                      <div className="stage4-table-row flex justify-between text-[#20251F]/80 will-change-transform">
                        <span>04 Consulting Hours</span>
                        <span className="font-bold">2,800.00</span>
                      </div>
                    </div>

                    {/* Summary Total Mesh */}
                    <div
                      ref={stage4TotalRef}
                      className="p-2 bg-[#20251F] text-[#FFFDF7] flex justify-between items-center font-bold will-change-transform"
                    >
                      <span className="text-[#E96C3F]">[TOTAL DUE]</span>
                      <span>€5,565.00</span>
                    </div>
                  </div>

                  {/* Heron-Style Dark Callout Card */}
                  <div
                    ref={stage4CalloutRef}
                    className="absolute right-0 sm:-right-4 bottom-0 bg-[#20251F] text-[#FFFDF7] p-3 shadow-drafting-sm font-mono text-[9px] max-w-[210px] z-20 border border-[#FFFDF7]/20 will-change-transform"
                    style={{ transformOrigin: 'bottom right' }}
                  >
                    <div className="flex items-center justify-between font-bold border-b border-[#FFFDF7]/20 pb-1 mb-1">
                      <span>SCHEMA ISOLATION</span>
                      <span className="text-[8px] text-[#D9E4CB] font-bold">[✓] VALIDATED</span>
                    </div>
                    <div className="text-[#FFFDF7]/90 leading-tight">
                      &bull; SCHEMA: FINANCIAL_INVOICE_V1<br />
                      &bull; 4 ROWS ISOLATED DETERMINISTICALLY<br />
                      &bull; 0 EXTERNAL BYTES TRANSMITTED
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
