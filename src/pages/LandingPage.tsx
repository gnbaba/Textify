import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PipelineWorkflowSection } from '../components/landing/PipelineWorkflowSection';
import { HeroDraftingCanvas } from '../components/landing/HeroDraftingCanvas';
import { TriangleFlipBackground } from '../components/landing/TriangleFlipBackground';
import Lenis from 'lenis';
import {
  Sparkle,
  ListBullets,
  Copy,
  Check,
  Lightning,
  ArrowRight,
  ArrowUpRight,
  LockKey,
  CheckCircle,
  ArrowUp,
  X,
  List,
  CursorClick,
  Code,
  Bug,
  Chats,
  GithubLogo,
  BookOpen,
  ShieldCheck,
  Cpu,
  BoundingBox,
  FileText,
  Terminal,
  Crosshair,
  Plus,
  Minus,
  CaretDown,
  ArrowsOut,
  Sliders,
  Receipt,
  Scales,
  Compass,
  IdentificationCard,
} from '@phosphor-icons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

// -- Data --

const PRICING_TIERS = [
  {
    title: 'Ephemeral Sandbox',
    subtitle: 'Zero Account Required • In-Memory WASM Engine',
    price: '$0.00',
    billing: 'FREE TIER',
    badge: 'INSTANT GUEST',
    isPro: false,
    ref: 'TIER_01 • LOCAL_RUNTIME',
    features: [
      '10 In-Memory Scans per Session',
      'Client-Side Tesseract WASM Execution',
      'OpenCV Deskew & Radon Angle Calibration',
      'Structured Clipboard Export (JSON, MD, CSV)',
      'Zero Network Overhead & Zero Cloud Storage',
    ],
    buttonText: 'INITIALIZE AS GUEST →',
  },
  {
    title: 'Authenticated Vault',
    subtitle: 'Google OAuth • Private Cloud Storage',
    price: '$0.00',
    billing: 'OPEN SOURCE COMMUNITY',
    badge: 'RECOMMENDED',
    isPro: true,
    ref: 'TIER_02 • SYNCED_WORKSPACE',
    features: [
      'Infinite Daily High-Resolution Scans',
      'Private Account-Isolated Cloud Storage',
      'Permanent Session Workspace (Pinning & Renaming)',
      'Multi-Format File Downloads & Table Splitting',
      'Community Pull Request & API Roadmap Access',
    ],
    buttonText: 'SIGN IN WITH GOOGLE →',
  },
];

const LEGAL_CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    body: 'Textify is built with privacy at its core. When you scan an image, the Optical Character Recognition (OCR) process happens entirely locally inside your browser by default. We never upload or save your original images unless you explicitly opt in to Gemini Cloud AI enhancement. If you choose to log in, your extracted text is stored in your private account-isolated Cloud Firestore database, encrypted in transit and at rest, accessible only by you.',
  },
  terms: {
    title: 'Terms of Service',
    body: "By using Textify, you agree to use the tool responsibly. This service is provided 'as is' without any warranties. We reserve the right to restrict access to users who attempt to abuse the API, upload malicious files, or overwhelm the platform with automated bot traffic. Please do not use this tool to extract sensitive or illegal information.",
  },
  support: {
    title: 'Support & Contact',
    body: 'Having trouble extracting text or found a bug? Since Textify is a developer project, the best way to get help is by reaching out directly to the creator. You can contact @gnbaba on GitHub for any technical support, issue reporting, or feature requests.',
  },
};

const MARQUEE_ITEMS = [
  { label: 'LOCAL-FIRST PRIVACY', icon: ShieldCheck, color: 'text-[#E96C3F]' },
  { label: 'OPTIONAL CLOUD AI', icon: Cpu, color: 'text-[#214C3A]' },
  { label: 'CANVAS PREPROCESS', icon: BoundingBox, color: 'text-[#E96C3F]' },
  { label: 'SELECTIVE PDF EXPORT', icon: FileText, color: 'text-[#214C3A]' },
  { label: 'TESSERACT WASM', icon: Lightning, color: 'text-[#E96C3F]' },
  { label: 'PRIVACY BY DEFAULT', icon: LockKey, color: 'text-[#214C3A]' },
];

// -- Component --

export const LandingPage = () => {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [infoModalType, setInfoModalType] = useState<'privacy' | 'terms' | 'support' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [isIntroComplete, setIsIntroComplete] = useState<boolean>(false);
  const isIntroCompleteRef = useRef<boolean>(false);
  const lastScrollYRef = useRef(0);

  // Open Source Section states
  const [activeOsModal, setActiveOsModal] = useState<'code' | 'bug' | 'feedback' | null>(null);
  const [bugTitle, setBugTitle] = useState('');
  const [bugDesc, setBugDesc] = useState('');
  const [bugSubmitted, setBugSubmitted] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<'awesome' | 'good' | 'work' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [copiedCloneCmd, setCopiedCloneCmd] = useState(false);

  // Section refs for GSAP scoping
  const headerRef = useRef<HTMLElement>(null);
  const headerEyeRef = useRef<HTMLImageElement>(null);
  const headerWordRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroLowerPanelRef = useRef<HTMLDivElement>(null);
  const heroHeadlineRef = useRef<HTMLHeadingElement>(null);
  const heroParagraphRef = useRef<HTMLParagraphElement>(null);
  const heroBeltRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);
  const openSourceRef = useRef<HTMLElement>(null);
  const ctaBannerRef = useRef<HTMLElement>(null);
  const ctaButtonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    (window as any).__lenis = lenis;
    (window as any).__ScrollTrigger = ScrollTrigger;

    // Lock smooth wheel/touch scrolling until intro animation completes
    if (!isIntroCompleteRef.current) {
      lenis.stop();
    }

    lenis.on('scroll', ScrollTrigger.update);
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    const handleScroll = (e?: any) => {
      const currentScrollY = typeof e?.scroll === 'number' ? e.scroll : window.scrollY;
      setShowTopBtn(currentScrollY > 400);

      // Smooth architectural header hide when scrolling down past hero, reveal on scroll up
      if (currentScrollY <= 220) {
        setIsHeaderVisible(true);
      } else if (e?.direction === 1) {
        setIsHeaderVisible(false);
      } else if (e?.direction === -1) {
        setIsHeaderVisible(true);
      } else {
        const diff = currentScrollY - lastScrollYRef.current;
        if (diff > 4) {
          setIsHeaderVisible(false);
        } else if (diff < -4) {
          setIsHeaderVisible(true);
        }
      }
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    lenis.on('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      lenis.off('scroll', handleScroll);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Magnetic button hover handler
  const handleMagneticMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, { x: x * 0.25, y: y * 0.25, duration: 0.3, ease: 'power2.out' });
  }, []);

  const handleMagneticLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  }, []);

  // GSAP — Hero Choreographed Sequential Entrance Animation (Drawn Lines & Logo Ignition)
  useGSAP(
    () => {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        isIntroCompleteRef.current = true;
        setIsIntroComplete(true);
        setIsHeaderVisible(true);
        return;
      }

      // 1. Strict Scroll Lock during entrance playback
      if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);

      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.stop();
      }
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      // 2. Query target DOM nodes
      const headerBottomLine = headerRef.current?.querySelector('.header-bottom-line');
      const headerNavDividers = headerRef.current?.querySelectorAll('.header-nav-divider');
      const headerEye = headerEyeRef.current;
      const headerWord = headerWordRef.current;

      const lowerPanel = heroLowerPanelRef.current;
      const headline = heroHeadlineRef.current;
      const paragraph = heroParagraphRef.current;
      const belt = heroBeltRef.current;

      const projLinesH = heroRef.current?.querySelectorAll('.canvas-line-proj-h');
      const projLinesV = heroRef.current?.querySelectorAll('.canvas-line-proj-v');
      const panelLinesH = heroRef.current?.querySelectorAll('.hero-panel-line-h');
      const panelLineV = heroRef.current?.querySelectorAll('.hero-panel-line-v');

      const deskFrame = heroRef.current?.querySelector('.hero-doc-frame');
      const hud = heroRef.current?.querySelector('.canvas-hud');
      const ocrMarkers = heroRef.current?.querySelectorAll('.ocr-marker');

      // Sort paper items by data-z-index ascending (book -> notebook -> receipt -> shipping -> id -> invoice)
      const paperItems = Array.from(
        heroRef.current?.querySelectorAll<HTMLElement>('.paper-item') || []
      );
      paperItems.sort((a, b) => {
        const zA = Number(a.dataset.zIndex || 0);
        const zB = Number(b.dataset.zIndex || 0);
        return zA - zB;
      });
      const paperInners = paperItems
        .map((item) => item.querySelector('.paper-card-inner'))
        .filter(Boolean);

      // 3. Hardware-composited initial states (Drawn Line pen physics)
      // Horizontal lines start at scaleX: 0
      if (headerBottomLine)
        gsap.set(headerBottomLine, { scaleX: 0, transformOrigin: 'left center' });
      if (projLinesH && projLinesH.length > 0)
        gsap.set(projLinesH, { scaleX: 0, transformOrigin: 'left center' });
      if (panelLinesH && panelLinesH.length > 0)
        gsap.set(panelLinesH, { scaleX: 0, transformOrigin: 'left center' });

      // Vertical lines start at scaleY: 0
      if (headerNavDividers && headerNavDividers.length > 0)
        gsap.set(headerNavDividers, { scaleY: 0, transformOrigin: 'center top' });
      if (projLinesV && projLinesV.length > 0)
        gsap.set(projLinesV, { scaleY: 0, transformOrigin: 'center top' });
      if (panelLineV && panelLineV.length > 0)
        gsap.set(panelLineV, { scaleY: 0, transformOrigin: 'center top' });

      // Brand Logo initial states: eye is resting, word is tucked behind
      if (headerEye) gsap.set(headerEye, { scaleY: 1 });
      if (headerWord) gsap.set(headerWord, { opacity: 0, x: -28 });

      // Desk, HUD, Papers & Lower Typography initial states
      if (lowerPanel) gsap.set(lowerPanel, { opacity: 1 });
      if (headline) gsap.set(headline, { opacity: 0, y: 32 });
      if (paragraph) gsap.set(paragraph, { opacity: 0, y: 22 });
      if (belt) gsap.set(belt, { opacity: 0, y: 15 });
      if (hud) gsap.set(hud, { opacity: 0 });
      if (deskFrame) gsap.set(deskFrame, { opacity: 0 });
      if (ocrMarkers && ocrMarkers.length > 0) gsap.set(ocrMarkers, { opacity: 0 });
      if (paperInners.length > 0) {
        gsap.set(paperInners, { opacity: 0, y: -38, scale: 1.05 });
      }

      // Master Intro Timeline
      const introTl = gsap.timeline({
        onComplete: () => {
          isIntroCompleteRef.current = true;
          setIsIntroComplete(true);

          // Clear inline styles from headerWord so Tailwind group-hover works cleanly
          if (headerWordRef.current) {
            gsap.set(headerWordRef.current, { clearProps: 'transform,opacity' });
          }

          // Unlock scrolling & restore normal interaction
          if (typeof window !== 'undefined' && (window as any).__lenis) {
            (window as any).__lenis.start();
          }
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
          if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
            history.scrollRestoration = 'auto';
          }
        },
      });

      // Header container is visible
      setIsHeaderVisible(true);

      // Phase 1: Architectural Line Drawing (Smooth Pen Motion) (0.0s - 0.95s)
      if (headerBottomLine) {
        introTl.to(headerBottomLine, { scaleX: 1, duration: 0.85, ease: 'power2.inOut' }, 0.05);
      }
      if (headerNavDividers && headerNavDividers.length > 0) {
        introTl.to(
          headerNavDividers,
          { scaleY: 1, duration: 0.65, stagger: 0.08, ease: 'power2.inOut' },
          0.2
        );
      }
      if (projLinesH && projLinesH.length > 0) {
        introTl.to(
          projLinesH,
          { scaleX: 1, duration: 0.9, stagger: 0.1, ease: 'power2.inOut' },
          0.1
        );
      }
      if (projLinesV && projLinesV.length > 0) {
        introTl.to(
          projLinesV,
          { scaleY: 1, duration: 0.75, stagger: 0.08, ease: 'power2.inOut' },
          0.25
        );
      }
      if (panelLinesH && panelLinesH.length > 0) {
        introTl.to(panelLinesH, { scaleX: 1, duration: 0.85, ease: 'power2.inOut' }, 0.15);
      }
      if (panelLineV && panelLineV.length > 0) {
        introTl.to(panelLineV, { scaleY: 1, duration: 0.7, ease: 'power2.inOut' }, 0.35);
      }
      if (deskFrame) {
        introTl.to(deskFrame, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.4);
      }
      if (hud) {
        introTl.to(hud, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.5);
      }

      // Phase 2: Brand Logo Life Ignition (Eye Blink + Word Emergence) (0.95s - 1.65s)
      if (headerEye) {
        // Authentic single eye blink
        introTl.to(headerEye, { scaleY: 0.08, duration: 0.12, ease: 'power2.in' }, 0.95);
        introTl.to(headerEye, { scaleY: 1, duration: 0.14, ease: 'power2.out' }, 1.07);
      }
      if (headerWord) {
        // "TEXTIFY" typography emerges smoothly from behind the eye
        introTl.to(headerWord, { opacity: 1, x: 0, duration: 0.55, ease: 'power2.out' }, 1.18);
      }

      // Phase 3: Sequential Paper Drop (Zero Premature Shadows!) (1.65s - 2.85s)
      if (paperInners.length > 0) {
        introTl.to(
          paperInners,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.44,
            stagger: 0.18,
            ease: 'power2.out',
          },
          1.65
        );
      }
      if (ocrMarkers && ocrMarkers.length > 0) {
        introTl.to(ocrMarkers, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 2.85);
      }

      // Phase 4: Words Below in Slow Motion + Moving Belt (2.75s - 3.65s)
      if (headline) {
        introTl.to(headline, { opacity: 1, y: 0, duration: 0.85, ease: 'power2.out' }, 2.75);
      }
      if (paragraph) {
        introTl.to(paragraph, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' }, 2.95);
      }
      if (belt) {
        introTl.to(belt, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 3.15);
      }

      return () => {
        introTl.kill();
        isIntroCompleteRef.current = true;
        if (typeof window !== 'undefined' && (window as any).__lenis) {
          (window as any).__lenis.start();
        }
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      };
    },
    { scope: heroRef }
  );

  // GSAP — Feature cards staggered scroll reveal & wireframe stroke draw
  useGSAP(
    () => {
      if (!featuresRef.current) return;

      const section = featuresRef.current;
      const cards = section.querySelectorAll('.feature-card');
      const headline = section.querySelector('.features-headline');
      const paragraph = section.querySelector('.features-editorial');

      // Headline entrance
      if (headline && paragraph) {
        gsap.fromTo(
          [headline, paragraph],
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }

      // Card staggered reveal with springy scale & elevation
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.0,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 78%',
            once: true,
          },
        }
      );

      // SVG wireframe paths draw-in on scroll
      const svgPaths = section.querySelectorAll('.wireframe-draw-stroke');
      if (svgPaths.length > 0) {
        gsap.fromTo(
          svgPaths,
          { strokeDashoffset: 400, opacity: 0.2 },
          {
            strokeDashoffset: 0,
            opacity: 1,
            duration: 1.4,
            stagger: 0.04,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              once: true,
            },
          }
        );
      }
    },
    { scope: featuresRef }
  );

  // GSAP — Pricing cards tilt-in reveal
  useGSAP(
    () => {
      if (!pricingRef.current) return;

      const cards = pricingRef.current.querySelectorAll('.pricing-card');
      const titles = pricingRef.current.querySelectorAll('.pricing-title');
      const featureItems = pricingRef.current.querySelectorAll('.pricing-feature-item');

      // Cards tilt in from rotateY
      gsap.fromTo(
        cards,
        { opacity: 0, rotateY: -5 },
        {
          opacity: 1,
          rotateY: 0,
          duration: 0.7,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: pricingRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );

      // Title numbers scale bounce
      gsap.fromTo(
        titles,
        { scale: 0.85, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          stagger: 0.2,
          delay: 0.3,
          ease: 'back.out(2.5)',
          scrollTrigger: {
            trigger: pricingRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );

      // Feature list items cascade
      gsap.fromTo(
        featureItems,
        { opacity: 0, x: -15 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.08,
          delay: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: pricingRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );
    },
    { scope: pricingRef }
  );

  // GSAP — Open Source Section animations
  useGSAP(
    () => {
      if (!openSourceRef.current) return;

      const header = openSourceRef.current.querySelector('.os-header');
      const desc = openSourceRef.current.querySelector('.os-desc');
      const btns = openSourceRef.current.querySelectorAll('.os-btn');
      const cards = openSourceRef.current.querySelectorAll('.os-card');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: openSourceRef.current,
          start: 'top 85%',
          once: true,
        },
      });

      tl.fromTo(
        header,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      )
        .fromTo(
          desc,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          '-=0.3'
        )
        .fromTo(
          btns,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)' },
          '-=0.2'
        )
        .fromTo(
          cards,
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out' },
          '-=0.2'
        );
    },
    { scope: openSourceRef }
  );

  // GSAP — CTA banner parallax + pulse
  useGSAP(
    () => {
      if (!ctaBannerRef.current) return;

      // Text parallax — moves slower than container
      const textBlock = ctaBannerRef.current.querySelector('.cta-text-block');
      if (textBlock) {
        gsap.to(textBlock, {
          y: -30,
          ease: 'none',
          scrollTrigger: {
            trigger: ctaBannerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }

      // CTA button gentle pulse loop
      if (ctaButtonRef.current) {
        gsap.to(ctaButtonRef.current, {
          scale: 1.03,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      // Entrance animation
      gsap.fromTo(
        ctaBannerRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ctaBannerRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );
    },
    { scope: ctaBannerRef }
  );

  return (
    <main className="overflow-x-clip w-full max-w-full relative min-h-[100dvh] bg-[#F3EFE3] text-[#20251F] selection:bg-[#20251F] selection:text-[#FFFDF7]">
      {/* Ambient noise & grid overlays */}
      <div className="fixed inset-0 noise-bg pointer-events-none z-[1]" />
      <div className="fixed inset-0 drafting-grid-bg opacity-30 pointer-events-none z-[1]" />

      {/* ═══════════════════════════════════════════════════════
          NAV — Architectural Hairline Cell Bar
          ═══════════════════════════════════════════════════════ */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 bg-[#F3EFE3]/95 backdrop-blur-sm header-motion ${
          isHeaderVisible ? 'header-motion-visible' : 'header-motion-hidden'
        }`}
      >
        {/* Drawn bottom border hairline (Pen physics) */}
        <div className="header-bottom-line absolute bottom-0 left-0 right-0 border-b border-[#20251F]/20 origin-left pointer-events-none z-30" />

        <nav className="w-full flex items-stretch h-14">
          {/* Logo cell (Open, unboxed brand mark with authentic eye blink on hover) */}
          <div className="flex items-center px-6 sm:px-8 h-full">
            <button
              onClick={() => window.location.reload()}
              className="group relative flex items-center w-[120px] h-10 cursor-pointer focus:outline-none bg-transparent border-0 p-0 text-left select-none"
              aria-label="Textify Home"
            >
              {/* Standalone logo mark (enlarged) with authentic eye blink on hover */}
              <div className="w-[34px] h-[34px] flex items-center justify-center shrink-0 z-10 relative bg-[#F3EFE3]">
                <img
                  ref={headerEyeRef}
                  src="/New_Textify.png"
                  alt="Textify Logo"
                  className="w-full h-full object-contain transition-transform duration-300 group-hover-eye-blink origin-center"
                />
              </div>

              {/* Textify word — smoothly slides into the logo on hover, expands out on leave */}
              <div
                ref={headerWordRef}
                className="absolute left-[34px] top-0 bottom-0 flex items-center overflow-hidden pl-2.5 pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-8 group-hover:opacity-0"
              >
                <span className="font-mono-industrial text-[12px] font-black tracking-[0.14em] uppercase text-[#20251F] whitespace-nowrap">
                  TEXTIFY
                </span>
              </div>
            </button>
          </div>

          {/* Right Navigation & Action Cluster */}
          <div className="flex items-stretch ml-auto">
            {/* Desktop Navigation Boxes — Enclosed architectural cells with smooth flow button hover */}
            <div className="hidden md:flex items-stretch font-mono-industrial text-[10.5px] lg:text-[11px] font-bold tracking-[0.14em] uppercase text-[#20251F]/75">
              {[
                { label: '[ CAPABILITIES ]', href: '#features' },
                { label: '[ PIPELINE ]', href: '#process' },
                { label: '[ TIERS ]', href: '#pricing' },
                { label: '[ DOCS ]', href: '/docs', isLink: true },
              ].map((item) => {
                const content = (
                  <>
                    {/* Architectural vertical hairline divider (drawn from top) */}
                    <div className="header-nav-divider absolute top-0 bottom-0 left-0 border-l border-[#20251F]/20 origin-top pointer-events-none z-30" />

                    {/* Smooth directional flow fill */}
                    <TriangleFlipBackground color="#214C3A" fillColorClass="bg-[#214C3A]" />

                    {/* Centered label: smoothly transitions to paper cream on hover */}
                    <span className="relative z-20 transition-colors duration-500 ease-out group-hover:text-[#F3EFE3] text-center select-none">
                      {item.label}
                    </span>

                    {/* Architectural corner tick mark */}
                    <span
                      className="absolute bottom-1 right-1.5 font-mono text-[7px] text-[#20251F]/25 pointer-events-none select-none transition-colors duration-500 group-hover:text-[#F3EFE3]/40 z-20"
                      aria-hidden="true"
                    >
                      ⌟
                    </span>
                  </>
                );

                const boxClasses =
                  'group relative flex items-center justify-center px-6 md:px-7 lg:px-9 xl:px-10 h-full overflow-hidden select-none min-w-[130px] md:min-w-[145px] lg:min-w-[170px] xl:min-w-[185px] cursor-pointer';

                return item.isLink ? (
                  <Link key={item.label} to={item.href} className={boxClasses}>
                    {content}
                  </Link>
                ) : (
                  <a key={item.label} href={item.href} className={boxClasses}>
                    {content}
                  </a>
                );
              })}
            </div>

            {/* Run Workspace CTA — Resting in forest green, smooth orange flow fill on hover */}
            <Link
              to="/app"
              replace
              className="group relative bg-[#214C3A] text-[#F3EFE3] px-6 lg:px-8 flex items-center justify-center gap-2 font-mono-industrial text-[10.5px] lg:text-[11px] font-bold tracking-[0.14em] uppercase active:scale-[0.98] h-full overflow-hidden select-none min-w-[160px] lg:min-w-[180px]"
            >
              {/* Architectural vertical hairline divider (drawn from top) */}
              <div className="header-nav-divider absolute top-0 bottom-0 left-0 border-l border-[#20251F]/20 origin-top pointer-events-none z-30" />

              {/* Smooth orange flow fill */}
              <TriangleFlipBackground color="#E96C3F" fillColorClass="bg-[#E96C3F]" />
              <span className="relative z-20 flex items-center gap-2 text-[#F3EFE3]">
                RUN WORKSPACE{' '}
                <span className="text-[#F3EFE3]/70 group-hover:translate-x-1 transition-transform duration-300">
                  &rarr;
                </span>
              </span>
              <span
                className="absolute bottom-1 right-1.5 font-mono text-[7px] text-[#F3EFE3]/35 pointer-events-none select-none z-20"
                aria-hidden="true"
              >
                ⌟
              </span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="group relative p-3 md:hidden hover:bg-[#20251F]/5 transition-colors text-[#20251F] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <div className="header-nav-divider absolute top-0 bottom-0 left-0 border-l border-[#20251F]/20 origin-top pointer-events-none z-30 md:hidden" />
              {mobileMenuOpen ? (
                <X className="w-5 h-5" weight="bold" />
              ) : (
                <List className="w-5 h-5" weight="bold" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="bg-[#F3EFE3] border-b border-[#20251F]/20 p-5 flex flex-col font-mono-industrial text-[11px] font-bold tracking-[0.1em] uppercase text-[#20251F]">
            {[
              { label: 'CAPABILITIES', href: '#features' },
              { label: 'PIPELINE', href: '#process' },
              { label: 'TIERS', href: '#pricing' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="group relative py-3 px-4 border-b border-[#20251F]/15 overflow-hidden flex items-center justify-between"
              >
                <TriangleFlipBackground color="#214C3A" fillColorClass="bg-[#214C3A]" />
                <span className="relative z-20 transition-colors duration-400 ease-out group-hover:text-[#F3EFE3]">
                  [ {item.label} ]
                </span>
                <span className="relative z-20 text-[8px] font-mono opacity-40 group-hover:text-[#F3EFE3]">
                  ⌟
                </span>
              </a>
            ))}
            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="group relative py-3 px-4 border-b border-[#20251F]/15 overflow-hidden flex items-center justify-between"
            >
              <TriangleFlipBackground color="#214C3A" fillColorClass="bg-[#214C3A]" />
              <span className="relative z-20 transition-colors duration-400 ease-out group-hover:text-[#F3EFE3]">
                [ DOCS ]
              </span>
              <span className="relative z-20 text-[8px] font-mono opacity-40 group-hover:text-[#F3EFE3]">
                ⌟
              </span>
            </Link>
            <Link
              to="/app"
              replace
              className="group relative bg-[#214C3A] text-[#F3EFE3] text-center py-3 mt-3 font-bold active:scale-[0.98] overflow-hidden"
            >
              <TriangleFlipBackground color="#E96C3F" fillColorClass="bg-[#E96C3F]" />
              <span className="relative z-20 flex items-center justify-center gap-2">
                RUN WORKSPACE &rarr;
              </span>
            </Link>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════
          HERO — Architectural Drafting Canvas & Document Elevation
          ═══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative pt-14 border-b border-[#20251F]/20 bg-[#F3EFE3] overflow-hidden min-h-[100dvh] lg:h-[100dvh] flex flex-col justify-between"
      >
        {/* Main Central Drafting Canvas Area (Modularized Playground) */}
        <HeroDraftingCanvas isIntroComplete={isIntroComplete} />

        {/* Lower Full-Width Split Drafting Grid Panel */}
        <div ref={heroLowerPanelRef} className="w-full shrink-0 bg-[#F3EFE3] relative z-10">
          {/* Drawn top and bottom borders (Pen physics) */}
          <div className="hero-panel-line-h absolute top-0 left-0 right-0 border-t border-[#20251F]/20 origin-left pointer-events-none z-20" />
          <div className="hero-panel-line-h absolute bottom-0 left-0 right-0 border-b border-[#20251F]/20 origin-left pointer-events-none z-20" />

          <div className="w-full grid grid-cols-1 md:grid-cols-12 relative">
            {/* Drawn vertical divider between headline & editorial */}
            <div className="hero-panel-line-v hidden md:block absolute top-0 bottom-0 left-[50%] lg:left-[58.3333%] border-l border-[#20251F]/20 origin-top pointer-events-none z-20" />

            {/* Headline Cell */}
            <div className="hero-split-cell md:col-span-6 lg:col-span-7 p-4 sm:p-5 md:p-6 lg:p-7 flex items-center">
              <h1
                ref={heroHeadlineRef}
                className="text-2xl sm:text-3xl md:text-[2rem] lg:text-[2.45rem] xl:text-[2.85rem] font-black uppercase tracking-[-0.03em] leading-[0.95] text-[#20251F]"
              >
                AN AI OCR ENGINE THAT WORKS
                <br />
                INSIDE YOUR BROWSER
              </h1>
            </div>

            {/* Right Editorial + Integrated Moving Belt Block */}
            <div className="hero-split-cell md:col-span-6 lg:col-span-5 flex flex-col justify-between overflow-hidden relative">
              {/* Drawn horizontal line between paragraph and ticker */}
              <div className="hero-panel-line-h absolute bottom-[44px] left-0 right-0 border-t border-[#20251F]/20 origin-left pointer-events-none z-20" />
              {/* Editorial Paragraph Cell */}
              <div className="p-4 sm:p-5 md:p-6 lg:p-7 flex items-center">
                <p
                  ref={heroParagraphRef}
                  className="font-mono-industrial text-[10.5px] md:text-[11.5px] font-semibold tracking-[0.02em] leading-[1.6] uppercase text-[#20251F]/70"
                >
                  Textify executes WebAssembly Tesseract directly in client memory. Extract and
                  organize document text locally, with optional cloud AI enhancement.
                </p>
              </div>

              {/* Integrated Specification Ticker Tape — Architectural Glide */}
              <div
                ref={heroBeltRef}
                className="w-full bg-transparent py-2.5 overflow-hidden select-none flex relative [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)]"
              >
                <div className="animate-infinite-marquee-slow flex items-center shrink-0">
                  {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
                    <div key={`m1-${idx}`} className="flex items-center gap-2 px-3.5">
                      <item.icon className={`w-3.5 h-3.5 ${item.color} shrink-0`} weight="bold" />
                      <span className="font-mono-industrial text-[9px] font-bold tracking-[0.2em] text-[#20251F] whitespace-nowrap">
                        {item.label}
                      </span>
                      <span className="text-[#E96C3F] font-mono text-[9px] select-none ml-2.5 opacity-70">
                        ✦
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  className="animate-infinite-marquee-slow flex items-center shrink-0"
                  aria-hidden="true"
                >
                  {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
                    <div key={`m2-${idx}`} className="flex items-center gap-2 px-3.5">
                      <item.icon className={`w-3.5 h-3.5 ${item.color} shrink-0`} weight="bold" />
                      <span className="font-mono-industrial text-[9px] font-bold tracking-[0.2em] text-[#20251F] whitespace-nowrap">
                        {item.label}
                      </span>
                      <span className="text-[#E96C3F] font-mono text-[9px] select-none ml-2.5 opacity-70">
                        ✦
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PHASE 4: 4-COLUMN ISOMETRIC FRICTION GRID
          ═══════════════════════════════════════════════════════ */}
      <section
        ref={featuresRef}
        id="features"
        className="w-full border-b border-[#20251F]/20 bg-[#F3EFE3] relative z-10 min-h-screen flex flex-col justify-between"
      >
        <div className="max-w-[1440px] w-full mx-auto flex-1 flex flex-col justify-between">
          {/* Section Headline Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#20251F]/20 px-6 sm:px-8 py-10 md:py-14 border-b border-[#20251F]/20">
            <div className="features-headline lg:col-span-7 pb-6 lg:pb-0 lg:pr-8 flex flex-col justify-center">
              <span className="font-mono-industrial text-[11px] font-bold tracking-[0.2em] uppercase text-[#E96C3F] mb-2.5 block">
                PROBLEMS
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black uppercase tracking-[-0.03em] leading-[0.95] text-[#20251F]">
                Traditional OCR tools fail at real-world documents
              </h2>
            </div>
            <div className="features-editorial lg:col-span-5 pt-6 lg:pt-0 lg:pl-8 flex items-center">
              <p className="text-[14px] sm:text-[15px] font-normal leading-[1.65] text-[#20251F]/80">
                Traditional OCR is rigid and passive. It scrambles smartphone camera angles,
                transmits confidential documents to remote cloud servers, and dumps flat
                unstructured strings that destroy your formatting.
              </p>
            </div>
          </div>

          {/* 4-Column Isometric Drafting Compartments */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-b border-x border-[#20251F]/20 divide-y md:divide-y-0 md:divide-x divide-[#20251F]/20">
            {/* Column 01: SKEWED GEOMETRY */}
            <div className="feature-card flex flex-col justify-between p-6 sm:p-8 xl:p-10 min-h-[540px] lg:min-h-[620px] bg-[#F3EFE3] hover:bg-[#20251F]/[0.02] transition-colors relative group">
              <div className="flex flex-col">
                <div className="flex items-center justify-between pb-3.5 border-b border-dashed border-[#20251F]/20 font-mono-industrial text-[11px] font-bold uppercase tracking-[0.16em]">
                  <span className="feature-card-tag text-[#20251F]">Skewed Angles</span>
                  <span className="text-[#E96C3F]">[01]</span>
                </div>

                {/* Minimalist Isometric Wireframe 01: Perspective Skew & Alignment */}
                <div className="my-8 lg:my-10 h-52 lg:h-64 flex items-center justify-center relative overflow-hidden wireframe-art">
                  <div className="absolute inset-0 drafting-grid-hover pointer-events-none" />
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 200 170"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#20251F] relative z-10"
                  >
                    {/* Base Orthogonal Coordinate Grid (Floor) */}
                    <path
                      d="M25 130 L100 100 L175 130 L100 160 Z"
                      stroke="currentColor"
                      strokeOpacity="0.2"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1="25"
                      y1="130"
                      x2="175"
                      y2="130"
                      stroke="currentColor"
                      strokeOpacity="0.15"
                      strokeWidth="1"
                      strokeDasharray="2 4"
                    />

                    {/* Dropping Corner Projection Chords */}
                    <line
                      x1="38"
                      y1="68"
                      x2="38"
                      y2="125"
                      stroke="#20251F"
                      strokeOpacity="0.25"
                      strokeWidth="1"
                      className="wireframe-dash"
                    />
                    <line
                      x1="162"
                      y1="52"
                      x2="162"
                      y2="125"
                      stroke="#20251F"
                      strokeOpacity="0.25"
                      strokeWidth="1"
                      className="wireframe-dash"
                    />
                    <line
                      x1="100"
                      y1="18"
                      x2="100"
                      y2="100"
                      stroke="#20251F"
                      strokeOpacity="0.25"
                      strokeWidth="1"
                      className="wireframe-dash"
                    />

                    {/* Tilted Isometric Plane (Reacts to Hover with Rotation Leveling) */}
                    <g className="wireframe-angle-rotate">
                      {/* Document Outline Plane */}
                      <path
                        d="M38 68 L100 18 L162 52 L100 102 Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="rgba(243,239,227,0.75)"
                        className="wireframe-draw-stroke"
                      />
                      {/* Internal Text Lines on Document */}
                      <line
                        x1="60"
                        y1="62"
                        x2="120"
                        y2="38"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeOpacity="0.6"
                      />
                      <line
                        x1="65"
                        y1="74"
                        x2="135"
                        y2="46"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeOpacity="0.6"
                      />
                      <line
                        x1="70"
                        y1="86"
                        x2="115"
                        y2="68"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeOpacity="0.6"
                      />

                      {/* Angle Pitch Arc Indicator */}
                      <path
                        d="M135 110 A35 35 0 0 0 160 88"
                        stroke="#E96C3F"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                      <circle cx="162" cy="52" r="3" fill="#E96C3F" className="animate-pulse" />
                    </g>
                  </svg>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed border-[#20251F]/15">
                <h3 className="text-xl sm:text-2xl lg:text-[1.65rem] font-black uppercase tracking-tight leading-[1.08] text-[#20251F] mb-3.5">
                  Every Angle
                  <br />
                  Scrambles Text
                </h3>
                <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#20251F]/75 font-normal">
                  Smartphone camera tilts and perspective skew scramble character reading order
                  before extraction even begins.
                </p>
              </div>
            </div>

            {/* Column 02: CLOUD LEAKS */}
            <div className="feature-card flex flex-col justify-between p-6 sm:p-8 xl:p-10 min-h-[540px] lg:min-h-[620px] bg-[#F3EFE3] hover:bg-[#20251F]/[0.02] transition-colors relative group">
              <div className="flex flex-col">
                <div className="flex items-center justify-between pb-3.5 border-b border-dashed border-[#20251F]/20 font-mono-industrial text-[11px] font-bold uppercase tracking-[0.16em]">
                  <span className="feature-card-tag text-[#20251F]">Cloud Leakage</span>
                  <span className="text-[#E96C3F]">[02]</span>
                </div>

                {/* Minimalist Isometric Wireframe 02: Sandbox Cube & Floating Cloud Sphere */}
                <div className="my-8 lg:my-10 h-52 lg:h-64 flex items-center justify-center relative overflow-hidden wireframe-art">
                  <div className="absolute inset-0 drafting-grid-hover pointer-events-none" />
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 200 170"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#20251F] relative z-10"
                  >
                    {/* Dashed Privacy Boundary Ring */}
                    <ellipse
                      cx="100"
                      cy="85"
                      rx="72"
                      ry="42"
                      stroke="#214C3A"
                      strokeOpacity="0.4"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      className="wireframe-dash"
                    />

                    {/* Detached Cloud Sphere (Elevates on hover) */}
                    <g className="wireframe-sphere-float">
                      <circle
                        cx="100"
                        cy="30"
                        r="16"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="rgba(243,239,227,0.9)"
                        className="wireframe-draw-stroke"
                      />
                      <ellipse
                        cx="100"
                        cy="30"
                        rx="16"
                        ry="6"
                        stroke="currentColor"
                        strokeOpacity="0.4"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      <circle cx="100" cy="30" r="3" fill="#E96C3F" />
                      <line
                        x1="100"
                        y1="46"
                        x2="100"
                        y2="70"
                        stroke="#E96C3F"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                        className="wireframe-dash"
                      />
                    </g>

                    {/* Precision Isometric Client Cube (Local Machine) */}
                    <g>
                      {/* Top Facet */}
                      <path
                        d="M100 70 L145 92 L100 114 L55 92 Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="rgba(243,239,227,0.7)"
                        className="wireframe-draw-stroke"
                      />
                      {/* Left Facet */}
                      <path
                        d="M55 92 V132 L100 154 V114 Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="rgba(32,37,31,0.03)"
                        className="wireframe-draw-stroke"
                      />
                      {/* Right Facet */}
                      <path
                        d="M145 92 V132 L100 154 V114 Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="rgba(32,37,31,0.07)"
                        className="wireframe-draw-stroke"
                      />
                      {/* Internal Isometric Axes */}
                      <line
                        x1="100"
                        y1="114"
                        x2="100"
                        y2="70"
                        stroke="currentColor"
                        strokeOpacity="0.25"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    </g>
                  </svg>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed border-[#20251F]/15">
                <h3 className="text-xl sm:text-2xl lg:text-[1.65rem] font-black uppercase tracking-tight leading-[1.08] text-[#20251F] mb-3.5">
                  Private Data
                  <br />
                  Leaves Machine
                </h3>
                <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#20251F]/75 font-normal">
                  Cloud APIs upload confidential invoices and personal documents to third-party
                  servers, compromising data sovereignty.
                </p>
              </div>
            </div>

            {/* Column 03: CONTRAST FAULTS */}
            <div className="feature-card flex flex-col justify-between p-6 sm:p-8 xl:p-10 min-h-[540px] lg:min-h-[620px] bg-[#F3EFE3] hover:bg-[#20251F]/[0.02] transition-colors relative group">
              <div className="flex flex-col">
                <div className="flex items-center justify-between pb-3.5 border-b border-dashed border-[#20251F]/20 font-mono-industrial text-[11px] font-bold uppercase tracking-[0.16em]">
                  <span className="feature-card-tag text-[#20251F]">Contrast Faults</span>
                  <span className="text-[#E96C3F]">[03]</span>
                </div>

                {/* Minimalist Isometric Wireframe 03: Precision Lens & Document Scan Slice */}
                <div className="my-8 lg:my-10 h-52 lg:h-64 flex items-center justify-center relative overflow-hidden wireframe-art">
                  <div className="absolute inset-0 drafting-grid-hover pointer-events-none" />
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 200 170"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#20251F] relative z-10"
                  >
                    {/* Primary Precision Circular Lens */}
                    <circle
                      cx="100"
                      cy="85"
                      r="66"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="wireframe-draw-stroke group-hover:stroke-[#E96C3F] transition-colors duration-500"
                    />

                    {/* Outer Coordinate Chords */}
                    <path
                      d="M100 19 V151 M34 85 H166"
                      stroke="currentColor"
                      strokeOpacity="0.15"
                      strokeWidth="1"
                      strokeDasharray="2 4"
                    />

                    {/* Isometric Document Plane Inside Lens */}
                    <path
                      d="M65 85 L100 64 L135 85 L100 106 Z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      fill="rgba(243,239,227,0.8)"
                      className="wireframe-draw-stroke"
                    />
                    <line
                      x1="78"
                      y1="82"
                      x2="115"
                      y2="72"
                      stroke="currentColor"
                      strokeOpacity="0.4"
                      strokeWidth="1"
                    />
                    <line
                      x1="85"
                      y1="92"
                      x2="122"
                      y2="82"
                      stroke="currentColor"
                      strokeOpacity="0.4"
                      strokeWidth="1"
                    />

                    {/* Horizontal Scan Threshold Laser Line */}
                    <line
                      x1="25"
                      y1="85"
                      x2="175"
                      y2="85"
                      stroke="#E96C3F"
                      strokeWidth="1.5"
                      className="wireframe-dash"
                    />
                    <circle cx="25" cy="85" r="2.5" fill="#E96C3F" />
                    <circle cx="175" cy="85" r="2.5" fill="#E96C3F" />
                  </svg>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed border-[#20251F]/15">
                <h3 className="text-xl sm:text-2xl lg:text-[1.65rem] font-black uppercase tracking-tight leading-[1.08] text-[#20251F] mb-3.5">
                  Faded Scans
                  <br />
                  Dissolve to Noise
                </h3>
                <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#20251F]/75 font-normal">
                  Thermal register paper and low-contrast mobile scans dissolve critical numbers
                  into unreadable punctuation garbage.
                </p>
              </div>
            </div>

            {/* Column 04: RIGID EXPORTS */}
            <div className="feature-card flex flex-col justify-between p-6 sm:p-8 xl:p-10 min-h-[540px] lg:min-h-[620px] bg-[#F3EFE3] hover:bg-[#20251F]/[0.02] transition-colors relative group">
              <div className="flex flex-col">
                <div className="flex items-center justify-between pb-3.5 border-b border-dashed border-[#20251F]/20 font-mono-industrial text-[11px] font-bold uppercase tracking-[0.16em]">
                  <span className="feature-card-tag text-[#20251F]">Rigid Exports</span>
                  <span className="text-[#E96C3F]">[04]</span>
                </div>

                {/* Minimalist Isometric Wireframe 04: Stacked Planes & Tabular Matrix Separation */}
                <div className="my-8 lg:my-10 h-52 lg:h-64 flex items-center justify-center relative overflow-hidden wireframe-art">
                  <div className="absolute inset-0 drafting-grid-hover pointer-events-none" />
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 200 170"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#20251F] relative z-10"
                  >
                    {/* Lower Base Plane (Unstructured Floor) */}
                    <path
                      d="M35 115 L100 80 L165 115 L100 150 Z"
                      stroke="currentColor"
                      strokeOpacity="0.25"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />

                    {/* Connecting Vertical Column Rays */}
                    <line
                      x1="35"
                      y1="65"
                      x2="35"
                      y2="115"
                      stroke="currentColor"
                      strokeOpacity="0.3"
                      strokeWidth="1"
                      className="wireframe-dash"
                    />
                    <line
                      x1="165"
                      y1="65"
                      x2="165"
                      y2="115"
                      stroke="currentColor"
                      strokeOpacity="0.3"
                      strokeWidth="1"
                      className="wireframe-dash"
                    />
                    <line
                      x1="100"
                      y1="30"
                      x2="100"
                      y2="80"
                      stroke="currentColor"
                      strokeOpacity="0.3"
                      strokeWidth="1"
                      className="wireframe-dash"
                    />
                    <line
                      x1="100"
                      y1="100"
                      x2="100"
                      y2="150"
                      stroke="currentColor"
                      strokeOpacity="0.3"
                      strokeWidth="1"
                      className="wireframe-dash"
                    />

                    {/* Elevated Structured Matrix Plane (Floats Upward on Hover) */}
                    <g className="wireframe-plane-float">
                      {/* Perimeter Frame */}
                      <path
                        d="M35 65 L100 30 L165 65 L100 100 Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="rgba(243,239,227,0.85)"
                        className="wireframe-draw-stroke"
                      />

                      {/* Table Column Dividers */}
                      <line
                        x1="68"
                        y1="48"
                        x2="133"
                        y2="83"
                        stroke="currentColor"
                        strokeOpacity="0.5"
                        strokeWidth="1"
                      />
                      <line
                        x1="133"
                        y1="48"
                        x2="68"
                        y2="83"
                        stroke="currentColor"
                        strokeOpacity="0.5"
                        strokeWidth="1"
                      />

                      {/* Center Accent Matrix Node */}
                      <circle cx="100" cy="65" r="2.5" fill="#E96C3F" />
                    </g>
                  </svg>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed border-[#20251F]/15">
                <h3 className="text-xl sm:text-2xl lg:text-[1.65rem] font-black uppercase tracking-tight leading-[1.08] text-[#20251F] mb-3.5">
                  Flat Dumps
                  <br />
                  Destroy Structure
                </h3>
                <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#20251F]/75 font-normal">
                  Standard OCR dumps unsegmented string soup, discarding tables, spreadsheets, and
                  key-value relationships.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PipelineWorkflowSection />

      {/* ═══════════════════════════════════════════════════════
          PHASE 6: PRICING — Technical Specification Tiers
          ═══════════════════════════════════════════════════════ */}
      <section
        ref={pricingRef}
        id="pricing"
        className="py-20 md:py-28 max-w-[1400px] mx-auto px-6 relative z-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#20251F]/20 pb-5 mb-10">
          <div>
            <div className="font-mono-industrial text-[9px] font-bold tracking-[0.18em] uppercase text-[#20251F]/50 mb-2 flex items-center gap-2">
              <span className="text-[#E96C3F]">[ 04 ]</span>
              <span>SPECIFICATION MATRIX &bull; ACCESS TIERS</span>
            </div>
            <h2
              className="uppercase font-black leading-[0.9] tracking-[-0.04em] text-[#20251F]"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3.5rem)' }}
            >
              100% Client-Side.
              <br />
              Zero Paywalls.
            </h2>
          </div>
          <p className="mt-4 md:mt-0 font-mono-industrial text-[10px] md:text-[11px] font-semibold tracking-[0.03em] leading-[1.6] uppercase text-[#20251F]/60 max-w-md">
            All text translation executes inside your local browser memory via WebAssembly. Both
            tiers are completely free and open source.
          </p>
        </div>

        <div
          className="pricing-grid grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
          style={{ perspective: '800px' }}
        >
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.ref}
              className={`pricing-card p-6 md:p-8 border border-[#20251F]/20 flex flex-col justify-between min-h-[360px] relative will-change-transform transition-all duration-300 hover:border-[#20251F] ${
                tier.isPro
                  ? 'bg-[#FFFDF7] text-[#20251F] shadow-drafting-sm hover:shadow-drafting'
                  : 'bg-[#F3EFE3]/60 text-[#20251F] hover:bg-[#FFFDF7]'
              }`}
            >
              {/* Corner Crosshairs */}
              <span className="absolute top-2 left-2 font-mono-industrial text-[9px] text-[#20251F]/30">
                +
              </span>
              <span className="absolute top-2 right-2 font-mono-industrial text-[9px] text-[#20251F]/30">
                +
              </span>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono-industrial text-[8px] font-bold tracking-[0.16em] uppercase text-[#20251F]/50">
                    {tier.ref}
                  </span>
                  {tier.badge && (
                    <span
                      className={`px-2 py-0.5 font-mono-industrial text-[8px] font-bold tracking-[0.15em] uppercase border ${
                        tier.isPro
                          ? 'bg-[#214C3A] text-[#FFFDF7] border-[#214C3A]'
                          : 'bg-[#20251F]/5 text-[#20251F]/70 border-[#20251F]/20'
                      }`}
                    >
                      {tier.badge}
                    </span>
                  )}
                </div>

                <h3 className="pricing-title text-2xl md:text-3xl font-black uppercase tracking-[-0.03em] mb-1 will-change-transform text-[#20251F]">
                  {tier.title}
                </h3>
                <p className="font-mono-industrial text-[9px] font-semibold uppercase tracking-[0.05em] text-[#20251F]/50 mb-6">
                  {tier.subtitle}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-2 pb-6 border-b border-[#20251F]/15 mb-6">
                  <span className="text-3xl md:text-4xl font-black tracking-tight text-[#20251F]">
                    {tier.price}
                  </span>
                  <span className="font-mono-industrial text-[9px] font-bold tracking-[0.12em] uppercase text-[#20251F]/60">
                    / {tier.billing}
                  </span>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-3 mb-8">
                  {tier.features.map((feature, fIdx) => (
                    <div
                      key={fIdx}
                      className="pricing-feature-item flex items-start gap-2.5 will-change-transform"
                    >
                      <span className="font-mono-industrial text-[10px] font-bold text-[#E96C3F] flex-shrink-0 mt-0.5">
                        &bull;
                      </span>
                      <span className="font-mono-industrial text-[10px] md:text-[11px] font-semibold tracking-[0.02em] uppercase text-[#20251F]/75 leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/app"
                replace
                className={`w-full block text-center py-3.5 font-mono-industrial text-[10px] md:text-[11px] font-bold tracking-[0.12em] uppercase active:scale-[0.98] transition-all cursor-pointer ${
                  tier.isPro
                    ? 'bg-[#214C3A] text-[#FFFDF7] hover:bg-[#183a2b] shadow-drafting-sm'
                    : 'bg-[#20251F] text-[#FFFDF7] hover:bg-[#151914]'
                }`}
              >
                {tier.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PHASE 6: OPEN SOURCE COMMUNITY — Privacy & Utility
          ═══════════════════════════════════════════════════════ */}
      <section
        ref={openSourceRef}
        id="open-source"
        className="py-20 md:py-28 max-w-[1400px] mx-auto px-6 relative z-10 border-t border-[#20251F]/20"
      >
        <div className="os-header border-b border-[#20251F]/20 pb-5 mb-8">
          <div className="font-mono-industrial text-[9px] font-bold tracking-[0.18em] uppercase text-[#20251F]/50 mb-2 flex items-center gap-2">
            <span className="text-[#E96C3F]">[ 05 ]</span>
            <span>COMMUNITY INDEX &bull; SOURCE REPOSITORY</span>
          </div>
          <h2
            className="uppercase font-black leading-[0.9] tracking-[-0.04em] text-[#20251F]"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3.5rem)' }}
          >
            Privacy by default,
            <br />
            utility by design.
          </h2>
        </div>

        <p className="os-desc font-mono-industrial text-[11px] md:text-[12px] font-semibold tracking-[0.03em] leading-[1.6] uppercase text-[#20251F]/70 max-w-2xl mb-8">
          Textify is open source and dedicated to making browser-based document extraction secure,
          deterministic, and lightweight. Explore the code, run it completely offline, or connect
          your own cloud archive.
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-16 relative z-10">
          <a
            href="https://github.com/gnbaba/Textify"
            target="_blank"
            rel="noopener noreferrer"
            className="os-btn btn-magnetic bg-[#214C3A] text-[#FFFDF7] px-6 py-3 font-mono-industrial text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase hover:bg-[#183a2b] active:scale-[0.98] transition-all flex items-center gap-2 relative z-10 cursor-pointer shadow-drafting-sm"
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
          >
            <GithubLogo className="w-4 h-4" weight="bold" />
            View on GitHub
          </a>
          <Link
            to="/docs"
            className="os-btn btn-border-expand border border-[#20251F]/30 bg-transparent text-[#20251F] px-6 py-3 font-mono-industrial text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase hover:bg-[#20251F]/5 active:scale-[0.98] transition-all flex items-center gap-2 relative z-10 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" weight="bold" />
            Documentation
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <button
            onClick={() => {
              setActiveOsModal('code');
              setCopiedCloneCmd(false);
            }}
            className="os-card p-6 md:p-8 border border-[#20251F]/20 bg-[#FFFDF7] flex flex-col justify-between min-h-[220px] text-left relative group transition-all duration-300 hover:border-[#20251F] hover:-translate-y-0.5 shadow-drafting-sm hover:shadow-drafting cursor-pointer"
          >
            <span className="absolute top-2 left-2 font-mono-industrial text-[9px] text-[#20251F]/30">
              +
            </span>
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono-industrial text-[9px] font-bold tracking-[0.15em] text-[#20251F]/50">
                  [01 / CODE]
                </span>
                <Code
                  className="w-5 h-5 text-[#20251F]/40 group-hover:text-[#214C3A] group-hover:scale-110 transition-all duration-300"
                  weight="bold"
                />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-[#20251F]">
                Code Contributions
              </h3>
              <p className="font-mono-industrial text-[10px] md:text-[11px] font-semibold tracking-[0.03em] leading-[1.5] uppercase text-[#20251F]/60">
                Help improve the AI models, OCR pipeline, or UI. Pull requests of all sizes are
                welcome from the community.
              </p>
            </div>
            <div className="mt-4 font-mono-industrial text-[9px] font-bold text-[#20251F]/50 group-hover:text-[#214C3A] transition-colors flex items-center gap-1.5 w-full">
              INITIALIZE CONTRIBUTION <ArrowRight className="w-3.5 h-3.5" weight="bold" />
            </div>
          </button>

          {/* Card 2 */}
          <button
            onClick={() => {
              setActiveOsModal('bug');
              setBugTitle('');
              setBugDesc('');
              setBugSubmitted(false);
            }}
            className="os-card p-6 md:p-8 border border-[#20251F]/20 bg-[#FFFDF7] flex flex-col justify-between min-h-[220px] text-left relative group transition-all duration-300 hover:border-[#20251F] hover:-translate-y-0.5 shadow-drafting-sm hover:shadow-drafting cursor-pointer"
          >
            <span className="absolute top-2 left-2 font-mono-industrial text-[9px] text-[#20251F]/30">
              +
            </span>
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono-industrial text-[9px] font-bold tracking-[0.15em] text-[#20251F]/50">
                  [02 / BUG]
                </span>
                <Bug
                  className="w-5 h-5 text-[#20251F]/40 group-hover:text-[#E96C3F] group-hover:scale-110 transition-all duration-300"
                  weight="bold"
                />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-[#20251F]">
                Report Bugs
              </h3>
              <p className="font-mono-industrial text-[10px] md:text-[11px] font-semibold tracking-[0.03em] leading-[1.5] uppercase text-[#20251F]/60">
                Found an issue? Open a GitHub issue with details to help track and fix bugs as the
                project moves toward a stable release.
              </p>
            </div>
            <div className="mt-4 font-mono-industrial text-[9px] font-bold text-[#20251F]/50 group-hover:text-[#E96C3F] transition-colors flex items-center gap-1.5 w-full">
              SUBMIT ERROR REPORT <ArrowRight className="w-3.5 h-3.5" weight="bold" />
            </div>
          </button>

          {/* Card 3 */}
          <button
            onClick={() => {
              setActiveOsModal('feedback');
              setFeedbackRating(null);
              setFeedbackText('');
              setFeedbackSubmitted(false);
            }}
            className="os-card p-6 md:p-8 border border-[#20251F]/20 bg-[#FFFDF7] flex flex-col justify-between min-h-[220px] text-left relative group transition-all duration-300 hover:border-[#20251F] hover:-translate-y-0.5 shadow-drafting-sm hover:shadow-drafting cursor-pointer"
          >
            <span className="absolute top-2 left-2 font-mono-industrial text-[9px] text-[#20251F]/30">
              +
            </span>
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono-industrial text-[9px] font-bold tracking-[0.15em] text-[#20251F]/50">
                  [03 / CHAT]
                </span>
                <Chats
                  className="w-5 h-5 text-[#20251F]/40 group-hover:text-[#214C3A] group-hover:scale-110 transition-all duration-300"
                  weight="bold"
                />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-[#20251F]">
                Share Feedback
              </h3>
              <p className="font-mono-industrial text-[10px] md:text-[11px] font-semibold tracking-[0.03em] leading-[1.5] uppercase text-[#20251F]/60">
                Share thoughts on how you're using Textify. Feedback directly influences the project
                roadmap and the features built next.
              </p>
            </div>
            <div className="mt-4 font-mono-industrial text-[9px] font-bold text-[#20251F]/50 group-hover:text-[#214C3A] transition-colors flex items-center gap-1.5 w-full">
              TRANSMIT INSIGHTS <ArrowRight className="w-3.5 h-3.5" weight="bold" />
            </div>
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PHASE 6: CTA BANNER — Architectural Ledger Strip
          ═══════════════════════════════════════════════════════ */}
      <section
        ref={ctaBannerRef}
        className="border-y border-[#20251F]/20 bg-[#FFFDF7] relative z-10 overflow-hidden"
      >
        <div className="max-w-[1400px] mx-auto px-6 py-16 md:py-20 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="cta-text-block md:col-span-8 will-change-transform">
            <div className="font-mono-industrial text-[9px] font-bold tracking-[0.18em] uppercase text-[#20251F]/50 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#214C3A] rounded-full" />
              <span>INITIALIZE WORKSPACE &bull; ZERO SERVERS REQUIRED</span>
            </div>
            <h2
              className="uppercase font-black leading-[0.88] tracking-[-0.04em] text-[#20251F]"
              style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
            >
              Ready to extract
              <br />
              text from any image?
            </h2>
            <p className="font-mono-industrial text-[10px] md:text-[11px] font-semibold tracking-[0.03em] leading-[1.6] uppercase text-[#20251F]/60 max-w-lg mt-4">
              Experience layout-aware OCR processing directly in your browser. Clean, private, and
              synced with local memory.
            </p>
          </div>
          <div className="md:col-span-4 flex md:justify-end">
            <Link
              to="/app"
              replace
              ref={ctaButtonRef}
              className="btn-magnetic bg-[#214C3A] text-[#FFFDF7] px-8 py-4 font-mono-industrial text-[11px] font-bold tracking-[0.12em] uppercase hover:bg-[#183a2b] active:scale-[0.98] transition-all flex items-center gap-2 will-change-transform shadow-drafting-sm cursor-pointer"
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
            >
              LAUNCH WORKSPACE <ArrowRight className="w-4 h-4" weight="bold" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PHASE 6: BLUEPRINT WIREFRAME FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer className="w-full bg-[#F3EFE3] border-t border-[#20251F]/20 relative z-10 overflow-hidden">
        {/* Modular Drafting Cell Matrix */}
        <div className="max-w-[1400px] mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8 font-mono-industrial text-[9px] font-bold tracking-[0.1em] uppercase">
          {/* Col 1: Brand & Core Identity (PRESERVED LOGO) */}
          <div className="md:col-span-4 flex flex-col justify-between space-y-4">
            <div>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 cursor-pointer focus:outline-none bg-transparent border-0 p-0 text-left mb-3 group"
                aria-label="Refresh Page"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <img
                    src="/New_Textify.png"
                    alt="Textify"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-black tracking-tight text-base normal-case text-[#20251F] group-hover:text-[#214C3A] transition-colors">
                  Textify<sup className="text-[7px]">&reg;</sup>
                </span>
              </button>
              <p className="text-[9px] text-[#20251F]/60 tracking-[0.04em] max-w-sm leading-[1.6]">
                ARCHITECTURAL DOCUMENT INTELLIGENCE SYSTEM. CLIENT-SIDE WEBASSEMBLY OPTICAL
                RECOGNITION WITH ZERO DATA LEAKAGE.
              </p>
            </div>
            <div className="pt-4 border-t border-[#20251F]/15 flex items-center gap-2 text-[8px] text-[#20251F]/40">
              <span className="w-1 h-1 bg-[#20251F]/30 rounded-full" />
              <span>ISOLATED RUNTIME BUFFER: 100% PRIVATE</span>
            </div>
          </div>

          {/* Col 2: Legal & Compliance Modals */}
          <div className="md:col-span-3 flex flex-col space-y-3">
            <div className="text-[8px] font-bold tracking-[0.18em] text-[#20251F]/40 mb-1">
              [ LEGAL & COMPLIANCE ]
            </div>
            {(['privacy', 'terms', 'support'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setInfoModalType(type)}
                className="group text-left text-[#20251F]/70 hover:text-[#214C3A] transition-colors py-1 border-b border-[#20251F]/10 flex items-center justify-between cursor-pointer"
              >
                <span>
                  [{' '}
                  {type === 'privacy'
                    ? 'PRIVACY POLICY'
                    : type === 'terms'
                      ? 'TERMS OF SERVICE'
                      : 'DIAGNOSTIC SUPPORT'}{' '}
                  ]
                </span>
                <ArrowRight
                  className="w-3.5 h-3.5 text-[#20251F]/50 group-hover:text-[#214C3A] group-hover:translate-x-1 transition-all"
                  weight="bold"
                />
              </button>
            ))}
          </div>

          {/* Col 3: Network & Coordinates */}
          <div className="md:col-span-3 flex flex-col space-y-3">
            <div className="text-[8px] font-bold tracking-[0.18em] text-[#20251F]/40 mb-1">
              [ COORDINATES ]
            </div>
            <a
              href="https://github.com/gnbaba/Textify"
              target="_blank"
              rel="noopener noreferrer"
              className="group text-[#20251F]/70 hover:text-[#214C3A] transition-colors py-1 border-b border-[#20251F]/10 flex items-center justify-between"
            >
              <span>GITHUB REPOSITORY</span>
              <ArrowUpRight
                className="w-3.5 h-3.5 text-[#20251F]/50 group-hover:text-[#214C3A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                weight="bold"
              />
            </a>
            <Link
              to="/docs"
              className="group text-[#20251F]/70 hover:text-[#214C3A] transition-colors py-1 border-b border-[#20251F]/10 flex items-center justify-between"
            >
              <span>TECHNICAL DOCS</span>
              <ArrowRight
                className="w-3.5 h-3.5 text-[#20251F]/50 group-hover:text-[#214C3A] group-hover:translate-x-1 transition-all"
                weight="bold"
              />
            </Link>
            <div className="text-[#20251F]/50 py-1 flex items-center justify-between">
              <span>MAINTAINER</span>
              <span className="text-[8px] text-[#20251F]/70 font-bold">@GNBABA</span>
            </div>
          </div>

          {/* Col 4: Standalone Brand Eye Mark */}
          <div className="md:col-span-2 flex items-center justify-center md:justify-end">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).__lenis) {
                  (window as any).__lenis.scrollTo(0, { duration: 1.2 });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="group relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 cursor-pointer focus:outline-none bg-transparent border-0 p-1"
              aria-label="Scroll to top"
            >
              <img
                src="/New_Textify.png"
                alt="Textify Eye Mark"
                className="w-full h-full object-contain eye-blink-ambient group-hover-eye-blink transition-transform duration-300 drop-shadow-sm select-none"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            </button>
          </div>
        </div>

        {/* Bottom Minimal Copyright Strip */}
        <div className="w-full border-t border-[#20251F]/15 bg-[#F3EFE3] py-3 px-6 flex flex-col sm:flex-row items-center justify-between font-mono-industrial text-[8px] font-bold tracking-[0.14em] uppercase text-[#20251F]/40 gap-2">
          <div>&copy; {new Date().getFullYear()} TEXTIFY INC. ALL RIGHTS RESERVED.</div>
          <div>STANDALONE WEBASSEMBLY DOCUMENT SCRAPING SYSTEM</div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════
          PHASE 6: INFO MODAL — Architectural Drafting Panel
          ═══════════════════════════════════════════════════════ */}
      {infoModalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#20251F]/50 backdrop-blur-sm px-4">
          <div className="bg-[#FFFDF7] w-full max-w-md overflow-hidden border border-[#20251F] shadow-drafting-lg">
            <div className="bg-[#20251F] text-[#FFFDF7] px-5 py-3 flex items-center justify-between font-mono-industrial text-[10px] font-bold tracking-[0.15em] uppercase">
              <span>[ {LEGAL_CONTENT[infoModalType].title.toUpperCase()} ]</span>
              <button
                onClick={() => setInfoModalType(null)}
                className="hover:text-[#E96C3F] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" weight="bold" />
              </button>
            </div>
            <div className="p-6">
              <p className="font-mono-industrial text-[10px] md:text-[11px] font-semibold tracking-[0.03em] leading-[1.6] uppercase text-[#20251F]/75 mb-6">
                {LEGAL_CONTENT[infoModalType].body}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setInfoModalType(null)}
                  className="bg-[#214C3A] text-[#FFFDF7] px-5 py-2 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase active:scale-[0.98] transition-all hover:bg-[#183a2b] cursor-pointer shadow-drafting-sm"
                >
                  DISMISS PANEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          PHASE 6: OPEN SOURCE MODALS — Interactive Dialogue Panels
          ═══════════════════════════════════════════════════════ */}
      {activeOsModal === 'code' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#20251F]/50 backdrop-blur-sm px-4">
          <div className="bg-[#FFFDF7] w-full max-w-lg overflow-hidden border border-[#20251F] shadow-drafting-lg">
            <div className="bg-[#20251F] text-[#FFFDF7] px-5 py-3 flex items-center justify-between font-mono-industrial text-[10px] font-bold tracking-[0.15em] uppercase">
              <span>[ CODE CONTRIBUTIONS & REPO ]</span>
              <button
                onClick={() => setActiveOsModal(null)}
                className="hover:text-[#E96C3F] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" weight="bold" />
              </button>
            </div>
            <div className="p-6">
              <p className="font-mono-industrial text-[10px] md:text-[11px] font-semibold tracking-[0.03em] leading-[1.6] uppercase text-[#20251F]/75 mb-4">
                We welcome community contributions. Clone the repository locally to begin
                development, customize OCR parameters, or tweak layout details.
              </p>

              <div className="bg-[#20251F] text-[#FFFDF7] p-3 font-mono-industrial text-[10px] md:text-[11px] font-bold mb-6 flex items-center justify-between border border-[#20251F] select-all">
                <span>git clone https://github.com/gnbaba/Textify.git</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      'git clone https://github.com/gnbaba/Textify.git'
                    );
                    setCopiedCloneCmd(true);
                    setTimeout(() => setCopiedCloneCmd(false), 2000);
                  }}
                  className="text-[#FFFDF7]/75 hover:text-[#FFFDF7] flex-shrink-0 ml-2 cursor-pointer"
                  title="Copy clone command"
                >
                  {copiedCloneCmd ? (
                    <Check className="w-4 h-4 text-[#D9E4CB]" weight="bold" />
                  ) : (
                    <Copy className="w-4 h-4" weight="bold" />
                  )}
                </button>
              </div>

              <div className="space-y-3 font-mono-industrial text-[10px] uppercase text-[#20251F]/60 mb-6">
                <div>1. Fork the repository and build a topic branch.</div>
                <div>2. Standardize features to follow architectural directions.</div>
                <div>3. Open a pull request targeting the main line.</div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setActiveOsModal(null)}
                  className="bg-[#214C3A] text-[#FFFDF7] px-5 py-2 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase active:scale-[0.98] transition-all hover:bg-[#183a2b] cursor-pointer shadow-drafting-sm"
                >
                  DISMISS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeOsModal === 'bug' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#20251F]/50 backdrop-blur-sm px-4">
          <div className="bg-[#FFFDF7] w-full max-w-md overflow-hidden border border-[#20251F] shadow-drafting-lg">
            <div className="bg-[#20251F] text-[#FFFDF7] px-5 py-3 flex items-center justify-between font-mono-industrial text-[10px] font-bold tracking-[0.15em] uppercase">
              <span>[ REPORT DEFECT / ANOMALY ]</span>
              <button
                onClick={() => setActiveOsModal(null)}
                className="hover:text-[#E96C3F] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" weight="bold" />
              </button>
            </div>
            <div className="p-6">
              {bugSubmitted ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-[#214C3A] mx-auto mb-3" weight="bold" />
                  <h4 className="font-black uppercase text-base text-[#20251F] mb-1">
                    Issue Recorded
                  </h4>
                  <p className="font-mono-industrial text-[9px] md:text-[10px] uppercase text-[#20251F]/60 max-w-xs mx-auto leading-relaxed">
                    Bug report successfully filed in sandbox environment. You can copy these details
                    for a GitHub ticket.
                  </p>
                  <button
                    onClick={() => setActiveOsModal(null)}
                    className="mt-6 bg-[#214C3A] text-[#FFFDF7] px-5 py-2 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase active:scale-[0.98] transition-all hover:bg-[#183a2b] cursor-pointer shadow-drafting-sm"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setBugSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <p className="font-mono-industrial text-[10px] uppercase text-[#20251F]/60 mb-2 leading-relaxed">
                    Explain the error substrate so the maintainer index can evaluate and reconstruct
                    code behaviors.
                  </p>
                  <div>
                    <label className="block font-mono-industrial text-[8px] font-bold tracking-[0.1em] uppercase text-[#20251F]/60 mb-1">
                      Issue title
                    </label>
                    <input
                      type="text"
                      required
                      value={bugTitle}
                      onChange={(e) => setBugTitle(e.target.value)}
                      className="w-full bg-[#F3EFE3]/40 border border-[#20251F]/30 p-2 font-mono-industrial text-[10px] focus:outline-none focus:border-[#20251F] text-[#20251F]"
                      placeholder="e.g. OCR fails on low-contrast graphics"
                    />
                  </div>
                  <div>
                    <label className="block font-mono-industrial text-[8px] font-bold tracking-[0.1em] uppercase text-[#20251F]/60 mb-1">
                      Bug explanation
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={bugDesc}
                      onChange={(e) => setBugDesc(e.target.value)}
                      className="w-full bg-[#F3EFE3]/40 border border-[#20251F]/30 p-2 font-mono-industrial text-[10px] focus:outline-none focus:border-[#20251F] text-[#20251F] resize-none"
                      placeholder="Input error logs, layout conditions, or browser version..."
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveOsModal(null)}
                      className="border border-[#20251F]/30 text-[#20251F]/60 px-5 py-2 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase active:scale-[0.98] transition-all hover:border-[#20251F] hover:text-[#20251F] cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="bg-[#214C3A] text-[#FFFDF7] px-5 py-2 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase active:scale-[0.98] transition-all hover:bg-[#183a2b] cursor-pointer shadow-drafting-sm"
                    >
                      SUBMIT
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {activeOsModal === 'feedback' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#20251F]/50 backdrop-blur-sm px-4">
          <div className="bg-[#FFFDF7] w-full max-w-md overflow-hidden border border-[#20251F] shadow-drafting-lg">
            <div className="bg-[#20251F] text-[#FFFDF7] px-5 py-3 flex items-center justify-between font-mono-industrial text-[10px] font-bold tracking-[0.15em] uppercase">
              <span>[ SHARE INSIGHTS & FEEDBACK ]</span>
              <button
                onClick={() => setActiveOsModal(null)}
                className="hover:text-[#E96C3F] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" weight="bold" />
              </button>
            </div>
            <div className="p-6">
              {feedbackSubmitted ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-[#214C3A] mx-auto mb-3" weight="bold" />
                  <h4 className="font-black uppercase text-base text-[#20251F] mb-1">
                    Feedback Logged
                  </h4>
                  <p className="font-mono-industrial text-[9px] md:text-[10px] uppercase text-[#20251F]/60 max-w-xs mx-auto leading-relaxed">
                    Thank you. Feedback directly influences the project roadmap and features built
                    next.
                  </p>
                  <button
                    onClick={() => setActiveOsModal(null)}
                    className="mt-6 bg-[#214C3A] text-[#FFFDF7] px-5 py-2 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase active:scale-[0.98] transition-all hover:bg-[#183a2b] cursor-pointer shadow-drafting-sm"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setFeedbackSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <p className="font-mono-industrial text-[10px] uppercase text-[#20251F]/60 mb-2 leading-relaxed">
                    Share ratings and comments on how we can make Textify document scraping more
                    optimal.
                  </p>
                  <div>
                    <label className="block font-mono-industrial text-[8px] font-bold tracking-[0.1em] uppercase text-[#20251F]/60 mb-2">
                      experience quality
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'awesome', label: 'AWESOME' },
                        { id: 'good', label: 'GOOD' },
                        { id: 'work', label: 'NEEDS WORK' },
                      ].map((rating) => (
                        <button
                          key={rating.id}
                          type="button"
                          onClick={() =>
                            setFeedbackRating(rating.id as 'awesome' | 'good' | 'work')
                          }
                          className={`py-2 border text-[8px] font-mono-industrial font-bold uppercase transition-all cursor-pointer ${
                            feedbackRating === rating.id
                              ? 'bg-[#214C3A] text-[#FFFDF7] border-[#214C3A]'
                              : 'bg-white text-[#20251F] border-[#20251F]/20 hover:border-[#20251F]'
                          }`}
                        >
                          {rating.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block font-mono-industrial text-[8px] font-bold tracking-[0.1em] uppercase text-[#20251F]/60 mb-1">
                      insights & suggestions
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full bg-[#F3EFE3]/40 border border-[#20251F]/30 p-2 font-mono-industrial text-[10px] focus:outline-none focus:border-[#20251F] text-[#20251F] resize-none"
                      placeholder="e.g. Really love the local OCR model performance, maybe support tabular extraction formatting..."
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveOsModal(null)}
                      className="border border-[#20251F]/30 text-[#20251F]/60 px-5 py-2 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase active:scale-[0.98] transition-all hover:border-[#20251F] hover:text-[#20251F] cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="bg-[#214C3A] text-[#FFFDF7] px-5 py-2 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase active:scale-[0.98] transition-all hover:bg-[#183a2b] cursor-pointer shadow-drafting-sm"
                    >
                      SUBMIT
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Back to top */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 p-2.5 bg-[#214C3A] text-[#FFFDF7] border border-[#20251F]/20 hover:bg-[#183a2b] active:scale-[0.95] transition-all duration-300 shadow-drafting-sm cursor-pointer ${
          showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <ArrowUp className="w-4 h-4" weight="bold" />
      </button>
    </main>
  );
};
