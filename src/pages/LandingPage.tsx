import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkle,
  CloudArrowUp,
  ListBullets,
  Copy,
  Check,
  UploadSimple,
  Lightning,
  ArrowRight,
  LockKey,
  ShieldCheck,
  EnvelopeSimple,
  ArrowUpRight,
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
} from '@phosphor-icons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

// -- Data --

const FEATURES = [
  {
    id: 'SYS-01',
    title: 'AI-Powered Precision',
    description: 'Reads documents, messy receipts, and stylized logos flawlessly using advanced optical character recognition.',
  },
  {
    id: 'SYS-02',
    title: 'Cloud Synchronization',
    description: 'Your extractions are saved to your secure personal account instantly. Access them from any device, anywhere.',
  },
  {
    id: 'SYS-03',
    title: 'Real-time Session Feed',
    description: 'Organized like a chat thread. Stack multiple scans in one place and scroll through your extraction history effortlessly.',
  },
  {
    id: 'SYS-04',
    title: 'One-Click Copy',
    description: 'Instantly copy your extracted data to your clipboard for easy pasting into emails, documents, or code editors.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Upload Image',
    description: 'Tap to snap a photo or drag and drop any graphic into the workspace.',
    icon: UploadSimple,
    ref: 'PROC-A',
  },
  {
    step: '02',
    title: 'AI Extraction',
    description: 'Our advanced OCR engine instantly scans and digitizes your text with high precision.',
    icon: Lightning,
    ref: 'PROC-B',
  },
  {
    step: '03',
    title: 'Sync & Use',
    description: 'Copy the text to your clipboard or let it automatically save to your secure cloud feed.',
    icon: CloudArrowUp,
    ref: 'PROC-C',
  },
];

const PRICING_TIERS = [
  {
    title: 'Guest Pass',
    price: '0',
    isPro: false,
    features: ['10 Free Scans Total', 'No Account Required', 'Standard Processing Speed'],
    buttonText: 'Try as Guest',
    ref: 'TIER-A',
  },
  {
    title: 'Registered User',
    price: '0',
    isPro: true,
    features: ['Infinite Daily Scans', 'Permanent Cloud Storage', 'Real-time Session Feed', 'Access to Graphic Mode OCR'],
    buttonText: 'Sign in with Google',
    ref: 'TIER-B',
  },
];

const LEGAL_CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    body: "Textify is built with privacy at its core. When you scan an image, the Optical Character Recognition (OCR) process happens entirely locally inside your browser. We never upload, save, or view your original images. If you choose to log in, your extracted text is securely encrypted and stored in your private Cloud Firestore database, accessible only by you.",
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
  'PRECISION OCR',
  'LOCAL PROCESSING',
  'ZERO UPLOADS',
  'PRIVACY FIRST',
  'CLOUD SYNC',
  'ONE-CLICK COPY',
  'REAL-TIME FEED',
];

// Terminal typing text lines
const TERMINAL_OUTPUT_LINES = ['INVOICE NO: #983421', 'TOTAL DUE: USD $1,250.00'];
const SCAN_BAR_WIDTHS = [72, 88, 48, 66];

// -- Component --

export const LandingPage = () => {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [infoModalType, setInfoModalType] = useState<'privacy' | 'terms' | 'support' | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  const heroRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLElement>(null);
  const metricsRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const processRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);
  const openSourceRef = useRef<HTMLElement>(null);
  const ctaBannerRef = useRef<HTMLElement>(null);

  // Element refs for targeted animations
  const metricValueRefs = useRef<(HTMLDivElement | null)[]>([]);
  const terminalOutputRef = useRef<HTMLDivElement>(null);
  const scanBarRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ctaButtonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleCopyText = () => {
    navigator.clipboard.writeText('INVOICE #983421 — TOTAL DUE: USD $1,250.00');
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

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

  // GSAP — Hero entrance animation
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Metadata line fades in from left
      tl.fromTo('.hero-metadata', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6 });

      // h1 lines cascade in from bottom
      tl.fromTo('.hero-headline-line', {
        opacity: 0,
        y: 60,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
      }, '-=0.2');

      // Subtext fades in
      tl.fromTo('.hero-subtext', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.1');

      // CTA buttons slide up with spring
      tl.fromTo('.hero-cta-btn', {
        opacity: 0,
        y: 30,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.4)',
      }, '-=0.2');

      // Terminal mockup scales in
      tl.fromTo('.hero-terminal', {
        opacity: 0,
        scale: 0.85,
      }, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'power2.out',
      }, '-=0.5');

      // Floating geometric shapes fade in
      tl.fromTo('.hero-geo-shape', {
        opacity: 0,
        scale: 0,
      }, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(2)',
      }, '-=0.6');

      // ── Terminal scan bar width animation ──
      // Start after terminal appears
      const scanTl = gsap.timeline({ delay: 0.3 });
      scanBarRefs.current.forEach((bar, i) => {
        if (!bar) return;
        scanTl.fromTo(
          bar,
          { width: '0%' },
          { width: `${SCAN_BAR_WIDTHS[i]}%`, duration: 0.4, ease: 'power2.inOut' },
          i * 0.12,
        );
      });

      // ── Terminal typing effect — after scan bars ──
      scanTl.call(() => {
        if (!terminalOutputRef.current) return;
        const outputEl = terminalOutputRef.current;
        const fullText = TERMINAL_OUTPUT_LINES.join('\n');
        const typingObj = { length: 0 };

        gsap.to(typingObj, {
          length: fullText.length,
          duration: 1.4,
          ease: 'none',
          onUpdate: () => {
            const shown = fullText.substring(0, Math.round(typingObj.length));
            const lines = shown.split('\n');
            outputEl.innerHTML = lines
              .map((l) => l + '<span class="inline-block w-[1px] h-[13px] bg-[#4D694E] ml-0.5 align-middle" style="animation: blink-cursor 0.7s step-end infinite"></span>')
              .join('<br/>');
          },
          onComplete: () => {
            // Remove trailing cursors, keep clean text
            outputEl.innerHTML = TERMINAL_OUTPUT_LINES.join('<br/>');
          },
        });
      });

      // ── Floating shapes continuous rotation ──
      gsap.to('.hero-geo-1', { rotation: 360, duration: 20, repeat: -1, ease: 'none' });
      gsap.to('.hero-geo-2', { rotation: -360, duration: 28, repeat: -1, ease: 'none' });
      gsap.to('.hero-geo-3', { rotation: 360, duration: 24, repeat: -1, ease: 'none' });

      // ── Floating shapes parallax on scroll ──
      gsap.to('.hero-geo-1', {
        y: -80,
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1 },
      });
      gsap.to('.hero-geo-2', {
        y: -120,
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1 },
      });
      gsap.to('.hero-geo-3', {
        y: -50,
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1 },
      });
    },
    { scope: heroRef },
  );

  // GSAP — Infinite Marquee Ticker
  useGSAP(
    () => {
      if (!marqueeRef.current) return;
      const inner = marqueeRef.current.querySelector('.marquee-inner');
      gsap.to(inner, {
        xPercent: -50,
        repeat: -1,
        duration: 25,
        ease: 'none',
      });
    },
    { scope: marqueeRef }
  );

  // GSAP — Metrics count-up animation
  useGSAP(
    () => {
      if (!metricsRef.current) return;

      // 99.8% — count from 0.0
      const metA = metricValueRefs.current[0];
      if (metA) {
        const counter = { value: 0 };
        gsap.to(counter, {
          value: 99.8,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: metA,
            start: 'top 85%',
            once: true,
          },
          onUpdate: () => {
            metA.textContent = counter.value.toFixed(1) + '%';
          },
        });
      }

      // < 1s — fade in with scale bounce
      const metB = metricValueRefs.current[1];
      if (metB) {
        gsap.fromTo(metB,
          { opacity: 0, scale: 0.5 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: 'back.out(2)',
            delay: 0.3,
            scrollTrigger: {
              trigger: metB,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }

      // 100% — count from 0
      const metC = metricValueRefs.current[2];
      if (metC) {
        const counter = { value: 0 };
        gsap.to(counter, {
          value: 100,
          duration: 1.8,
          ease: 'power2.out',
          delay: 0.6,
          scrollTrigger: {
            trigger: metC,
            start: 'top 85%',
            once: true,
          },
          onUpdate: () => {
            metC.textContent = Math.round(counter.value) + '%';
          },
        });
      }
    },
    { scope: metricsRef },
  );

  // GSAP — Feature cards staggered scroll reveal
  useGSAP(
    () => {
      if (!featuresRef.current) return;

      const cards = featuresRef.current.querySelectorAll('.feature-card');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 85%',
            once: true,
          },
          onComplete: () => {
            // Icon scale bounce after cards reveal
            const icons = featuresRef.current?.querySelectorAll('.feature-icon-box');
            if (icons) {
              gsap.fromTo(
                icons,
                { scale: 0.6 },
                {
                  scale: 1,
                  duration: 0.4,
                  stagger: 0.12,
                  ease: 'back.out(3)',
                }
              );
            }
          },
        }
      );
    },
    { scope: featuresRef },
  );

  // GSAP — Process steps sequential animation
  useGSAP(
    () => {
      if (!processRef.current) return;

      const steps = processRef.current.querySelectorAll('.process-step');
      const watermarks = processRef.current.querySelectorAll('.process-watermark');
      const microVisuals = processRef.current.querySelectorAll('.process-micro-visual');

      // Steps slide in from left
      gsap.fromTo(
        steps,
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: processRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );

      // Watermark numbers scale down dramatically
      gsap.fromTo(
        watermarks,
        { scale: 2.0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: processRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );

      // Micro-visuals animate in after parent
      gsap.fromTo(
        microVisuals,
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.2,
          delay: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: processRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );
    },
    { scope: processRef },
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
    { scope: pricingRef },
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

      tl.fromTo(header, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
        .fromTo(desc, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
        .fromTo(btns, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)' }, '-=0.2')
        .fromTo(cards, { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out' }, '-=0.2');
    },
    { scope: openSourceRef },
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
    { scope: ctaBannerRef },
  );

  const marqueeText = MARQUEE_ITEMS.map((t) => t + '  ///  ').join('');
  const doubledMarquee = marqueeText + marqueeText;

  return (
    <main className="overflow-x-hidden w-full max-w-full relative min-h-[100dvh] bg-[#FFF3D5] text-[#4D694E] selection:bg-[#4D694E] selection:text-[#FFF3D5]">
      {/* Ambient overlays */}
      <div className="fixed inset-0 noise-bg pointer-events-none z-[1]" />
      <div className="fixed inset-0 halftone-overlay pointer-events-none z-[1]" />

      {/* Dynamic Telemetry Background Stream */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.03] select-none">
        {/* Telemetry nodes drifting */}
        <div className="absolute top-[14%] left-[4%] font-mono-industrial text-[10px] tracking-[0.1em] uppercase animate-telemetry-slow">
          OCR_BUFFER::READY [X:14, Y:52]
        </div>
        <div className="absolute top-[28%] left-[78%] font-mono-industrial text-[10px] tracking-[0.1em] uppercase animate-telemetry-medium">
          TESSERACT_WORKER::ACTIVE [PID: 492]
        </div>
        <div className="absolute top-[42%] left-[3%] font-mono-industrial text-[10px] tracking-[0.1em] uppercase animate-telemetry-slow">
          Document.IngestMultipart(size &lt; 20MB)
        </div>
        <div className="absolute top-[56%] left-[82%] font-mono-industrial text-[10px] tracking-[0.1em] uppercase animate-telemetry-medium">
          BLOCK_REORDERING::dnd-kit::INITIALIZED
        </div>
        <div className="absolute top-[68%] left-[6%] font-mono-industrial text-[10px] tracking-[0.1em] uppercase animate-telemetry-slow">
          LOCAL_SANDBOX_SECURE::TRUE (No data leaves local runtime)
        </div>
        <div className="absolute top-[82%] left-[76%] font-mono-industrial text-[10px] tracking-[0.1em] uppercase animate-telemetry-medium">
          JSON_PAYLOAD_STRUCTURED [CONFIDENCE: 99.8%]
        </div>
        <div className="absolute top-[92%] left-[4%] font-mono-industrial text-[10px] tracking-[0.1em] uppercase animate-telemetry-slow">
          SYNC_PIPELINE::ACTIVE [FIREBASE_FIRESTORE]
        </div>
        <div className="absolute top-[21%] left-[80%] border border-dashed border-[#4D694E] w-32 h-16 animate-telemetry-slow" />
        <div className="absolute top-[48%] left-[7%] border border-dashed border-[#4D694E] w-24 h-24 animate-telemetry-medium" />
        <div className="absolute top-[75%] left-[84%] border border-dashed border-[#4D694E] w-40 h-10 animate-telemetry-slow" />
        <div className="absolute top-[35%] left-[12%] font-mono-industrial text-[10px] tracking-[0.1em] uppercase animate-telemetry-medium">
          UTF8_CHAR_STREAM::DECODED
        </div>
        <div className="absolute top-[62%] left-[70%] font-mono-industrial text-[10px] tracking-[0.1em] uppercase animate-telemetry-slow">
          EXPORT_PIPELINE::DOWNLOAD_JSON
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          NAV — Fixed top bar, hard edges, bordered
          ═══════════════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFF3D5] border-b-2 border-[#4D694E]">
        <nav className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1 cursor-pointer focus:outline-none bg-transparent border-0 p-0 text-left"
            aria-label="Refresh Page"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/New_Textify.png" alt="Textify" className="w-full h-full object-contain" />
            </div>
            <span className="font-mono-industrial text-[11px] font-bold tracking-[0.1em] uppercase">
              TEXTIFY<sup className="text-[8px] ml-0.5">&reg;</sup>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase">
            <span className="text-[#4D694E]/30">///</span>
            <a href="#features" className="px-3 py-1 border border-transparent hover:border-[#4D694E] transition-colors">[ FEATURES ]</a>
            <a href="#process" className="px-3 py-1 border border-transparent hover:border-[#4D694E] transition-colors">[ PROCESS ]</a>
            <a href="#pricing" className="px-3 py-1 border border-transparent hover:border-[#4D694E] transition-colors">[ TIERS ]</a>
            <Link to="/docs" className="px-3 py-1 border border-transparent hover:border-[#4D694E] transition-colors">[ DOCS ]</Link>
            <span className="text-[#4D694E]/30">///</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/app"
              replace
              className="btn-magnetic bg-[#4D694E] text-[#FFF3D5] px-4 py-1.5 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase hover:bg-[#3a4f3b] active:scale-[0.97] transition-all border-2 border-[#4D694E] flex items-center gap-1.5"
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
            >
              GET STARTED <span className="text-[#FFF3D5]/50">&gt;&gt;&gt;</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 md:hidden border border-[#4D694E]/30 hover:border-[#4D694E] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" weight="bold" /> : <List className="w-5 h-5" weight="bold" />}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="bg-[#FFF3D5] border-b-2 border-[#4D694E] p-5 flex flex-col gap-0 font-mono-industrial text-[11px] font-bold tracking-[0.1em] uppercase">
            {[
              { label: 'FEATURES', href: '#features' },
              { label: 'PROCESS', href: '#process' },
              { label: 'TIERS', href: '#pricing' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 border-b border-[#4D694E]/15 hover:text-[#3a4f3b]"
              >
                [ {item.label} ]
              </a>
            ))}
            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 border-b border-[#4D694E]/15 hover:text-[#3a4f3b]"
            >
              [ DOCS ]
            </Link>
            <Link
              to="/app"
              replace
              className="bg-[#4D694E] text-[#FFF3D5] text-center py-3 mt-3 font-bold active:scale-[0.97] transition-transform"
            >
              GET STARTED &gt;&gt;&gt;
            </Link>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════
          HERO — Massive type, asymmetric split, technical metadata
          ═══════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[92dvh] pt-14 flex items-center z-10 border-b-2 border-[#4D694E]">
        {/* Floating geometric shapes */}
        <div className="hero-geo-shape hero-geo-1 w-16 h-16 border-2 border-[#4D694E]/10 top-[18%] left-[8%] z-0" />
        <div className="hero-geo-shape hero-geo-2 w-10 h-10 border-2 border-[#4D694E]/8 rounded-full top-[35%] right-[12%] z-0" />
        <div className="hero-geo-shape hero-geo-3 w-12 h-12 border-2 border-dashed border-[#4D694E]/6 top-[65%] left-[15%] z-0 rotate-45" />

        <div className="max-w-[1400px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center py-12 md:py-16">
          {/* Left: Copy */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Technical metadata line */}
            <div className="hero-metadata font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase text-[#4D694E]/50 flex items-center gap-3 flex-wrap will-change-transform">
              <span>SYS.STATUS: <samp className="text-[#4D694E]">ACTIVE</samp></span>
              <span className="text-[#4D694E]/20">///</span>
              <span>REV 2.4</span>
              <span className="text-[#4D694E]/20">///</span>
              <span>UNIT / TX-OCR</span>
            </div>

            {/* Massive headline — each line is a separate span for GSAP stagger */}
            <h1
              className="uppercase font-black leading-[0.88] tracking-[-0.04em] text-[#4D694E]"
              style={{ fontSize: 'clamp(3rem, 8vw, 8rem)' }}
            >
              <span className="hero-headline-line block will-change-transform">CONVERT</span>
              <span className="hero-headline-line block will-change-transform">IMAGES TO</span>
              <span className="hero-headline-line block will-change-transform">EDITABLE</span>
              <span className="hero-headline-line block will-change-transform">TEXT.</span>
            </h1>

            {/* Subtext in monospace */}
            <p className="hero-subtext font-mono-industrial text-[11px] md:text-[12px] font-semibold tracking-[0.05em] uppercase text-[#4D694E]/65 max-w-md leading-[1.5] will-change-transform">
              EXTRACT TEXT FROM DOCUMENTS, RECEIPTS, AND GRAPHICS.
              LOCAL PROCESSING, CLOUD SYNC, ONE-CLICK COPY.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-3 pt-2">
              <Link
                to="/app"
                replace
                className="hero-cta-btn btn-magnetic bg-[#4D694E] text-[#FFF3D5] px-6 py-3 font-mono-industrial text-[11px] font-bold tracking-[0.1em] uppercase hover:bg-[#3a4f3b] active:scale-[0.97] transition-colors border-2 border-[#4D694E] flex items-center gap-2 will-change-transform"
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
              >
                GET STARTED <ArrowRight className="w-4 h-4" weight="bold" />
              </Link>
              <a
                href="#features"
                className="hero-cta-btn btn-border-expand border-2 border-[#4D694E] text-[#4D694E] px-6 py-3 font-mono-industrial text-[11px] font-bold tracking-[0.1em] uppercase active:scale-[0.97] transition-colors relative z-[1] will-change-transform"
              >
                SEE FEATURES
              </a>
            </div>
          </div>

          {/* Right: Mockup Terminal */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="hero-terminal relative w-full max-w-[380px] bg-[#FFF3D5] border-2 border-[#4D694E] flex flex-col overflow-hidden select-none will-change-transform shadow-[8px_8px_0px_0px_#4D694E]">
              {/* Scan line */}
              <div
                className="absolute left-0 w-full h-[2px] bg-[#4D694E]/40 z-20 pointer-events-none"
                style={{ animation: 'scan-sweep 3.5s ease-in-out infinite' }}
              />

              {/* Terminal header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b-2 border-[#4D694E] bg-[#4D694E] text-[#FFF3D5]">
                <span className="font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase">
                  &lt; TEXTIFY WORKSPACE &gt;
                </span>
                <span className="font-mono-industrial text-[8px] font-bold tracking-[0.1em] text-[#FFF3D5]/50">
                  REV 2.4
                </span>
              </div>

              {/* Scan zone */}
              <div className="p-4 flex-1 flex flex-col justify-between min-h-[240px] relative">
                <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#4d694e_1px,transparent_1px)] [background-size:8px_8px]" />

                <div className="relative z-10 flex items-center justify-between font-mono-industrial text-[8px] font-bold tracking-[0.15em] uppercase text-[#4D694E]/40">
                  <span>+ INPUT BUFFER</span>
                  <span className="text-[#4D694E] bg-[#4D694E]/10 px-2 py-0.5 border border-[#4D694E]/20">SCANNING</span>
                </div>

                {/* Scan bars — width animated by GSAP */}
                <div className="relative z-10 flex flex-col gap-2 mt-5">
                  {SCAN_BAR_WIDTHS.map((_, i) => {
                    const opacities = ['', '/60', '/35', '/20'];
                    return (
                      <div
                        key={i}
                        ref={(el) => { scanBarRefs.current[i] = el; }}
                        className={`h-3 bg-[#4D694E]${opacities[i]}`}
                        style={{ width: '0%' }}
                      />
                    );
                  })}
                </div>

                {/* Output block — typing effect */}
                <div className="relative z-10 mt-auto border-2 border-[#4D694E] p-3 bg-[#FFF3D5]">
                  <div className="font-mono-industrial text-[8px] font-bold tracking-[0.15em] uppercase text-[#4D694E]/35 mb-1.5">
                    &gt;&gt;&gt; EXTRACTED OUTPUT:
                  </div>
                  <div
                    ref={terminalOutputRef}
                    className="font-mono-industrial text-[11px] font-bold text-[#4D694E] leading-relaxed tracking-[0.03em]"
                  />
                </div>
              </div>

              {/* Terminal footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-[#4D694E]/30 font-mono-industrial text-[8px] font-bold tracking-[0.1em] uppercase text-[#4D694E]/40">
                <span className="flex items-center gap-1">
                  <LockKey className="w-3 h-3" weight="bold" /> LOCAL MODE
                </span>
                <span>CONN: SECURE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          MARQUEE TICKER — Industrial scrolling tape
          ═══════════════════════════════════════════════════════ */}
      <section ref={marqueeRef} className="w-full bg-[#4D694E] text-[#FFF3D5] py-2.5 overflow-hidden relative z-10 scanlines flex">
        <div className="marquee-inner flex whitespace-nowrap font-mono-industrial text-[10px] font-bold tracking-[0.2em] uppercase w-max">
          <div>{marqueeText}</div>
          <div>{marqueeText}</div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          METRICS — Bordered grid compartments
          ═══════════════════════════════════════════════════════ */}
      <section ref={metricsRef} className="w-full border-b-2 border-[#4D694E] relative z-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-3">
          {[
            { value: '99.8%', label: 'OCR ACCURACY', ref: 'MET-A' },
            { value: '< 1s', label: 'EXTRACTION SPEED', ref: 'MET-B' },
            { value: '100%', label: 'LOCAL PRIVACY', ref: 'MET-C' },
          ].map((m, idx) => (
            <div
              key={m.ref}
              className={`text-center py-8 px-4 ${idx < 2 ? 'border-r-2 border-[#4D694E]' : ''}`}
            >
              <div
                ref={(el) => { metricValueRefs.current[idx] = el; }}
                className="font-black tracking-[-0.03em] leading-none text-[#4D694E] will-change-transform"
                style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
              >
                {idx === 0 ? '0.0%' : idx === 2 ? '0%' : m.value}
              </div>
              <div className="font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase text-[#4D694E]/40 mt-2">
                {m.label}
              </div>
              <div className="font-mono-industrial text-[7px] font-bold tracking-[0.1em] text-[#4D694E]/20 mt-1">
                {m.ref}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES — Swiss Industrial Print grid
          ═══════════════════════════════════════════════════════ */}
      <section ref={featuresRef} id="features" className="py-20 md:py-28 max-w-[1400px] mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="flex items-end justify-between border-b-2 border-[#4D694E] pb-4 mb-8">
          <div>
            <div className="font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase text-[#4D694E]/35 mb-2">
              CAPABILITIES /// OVERVIEW
            </div>
            <h2
              className="uppercase font-black leading-[0.9] tracking-[-0.04em]"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3.5rem)' }}
            >
              SYSTEM<br />CAPABILITIES
            </h2>
          </div>
          <div className="font-mono-industrial text-[8px] font-bold tracking-[0.1em] text-[#4D694E]/25 text-right hidden md:block">
            TOTAL MODULES: 04<br />
            STATUS: OPERATIONAL
          </div>
        </div>

        {/* Feature grid — Standalone cards with gaps and neobrutalist shadows */}
        <div className="feature-grid grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature, idx) => {
            const isInverted = idx === 1;
            const icons = [Sparkle, CloudArrowUp, ListBullets, Copy];
            const Icon = icons[idx];

            return (
              <div
                key={feature.id}
                className={`feature-card p-6 md:p-8 border-2 border-[#4D694E] flex flex-col justify-between min-h-[240px] relative group will-change-transform transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1 ${
                  isInverted
                    ? 'bg-[#4D694E] text-[#FFF3D5] shadow-[6px_6px_0px_0px_rgba(77,105,78,0.25)] hover:shadow-[8px_8px_0px_0px_rgba(77,105,78,0.35)]'
                    : 'bg-transparent text-[#4D694E] shadow-[6px_6px_0px_0px_#4D694E] hover:shadow-[8px_8px_0px_0px_#4D694E]'
                }`}
              >
                {/* Crosshair at top-left */}
                <span className={`absolute top-2 left-2 font-mono-industrial text-[10px] ${isInverted ? 'text-[#FFF3D5]/15' : 'text-[#4D694E]/10'}`}>+</span>

                <div>
                  {/* ID + Icon row */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`feature-icon-box w-10 h-10 border-2 flex items-center justify-center will-change-transform ${isInverted ? 'border-[#FFF3D5]/40 text-[#FFF3D5]' : 'border-[#4D694E] text-[#4D694E]'}`}>
                      <Icon className="w-5 h-5" weight="bold" />
                    </div>
                    <span className={`font-mono-industrial text-[9px] font-bold tracking-[0.15em] ${isInverted ? 'text-[#FFF3D5]/30' : 'text-[#4D694E]/25'}`}>
                      {feature.id}
                    </span>
                  </div>

                  <h3 className="text-lg md:text-xl font-black uppercase tracking-[-0.02em] mb-2">
                    {feature.title}
                  </h3>
                  <p className={`font-mono-industrial text-[10px] md:text-[11px] font-semibold tracking-[0.03em] leading-[1.5] uppercase ${isInverted ? 'text-[#FFF3D5]/65' : 'text-[#4D694E]/55'}`}>
                    {feature.description}
                  </p>
                </div>

                {/* Feature-specific micro-visual */}
                <div className={`mt-6 border-2 p-3 ${isInverted ? 'border-[#FFF3D5]/20 bg-[#FFF3D5]/5' : 'border-[#4D694E]/15 bg-[#4D694E]/[0.02]'}`}>
                  {idx === 0 && (
                    <div className="flex flex-col gap-1">
                      <div className="h-2 w-[65%] bg-[#4D694E]/20" />
                      <div className="h-2 w-[82%] bg-[#4D694E]/15" />
                      <div className="h-2 w-[40%] bg-[#4D694E]/10" />
                    </div>
                  )}
                  {idx === 1 && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 border border-dashed border-[#FFF3D5]/25 animate-[spin_12s_linear_infinite] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-[#FFF3D5]/40" />
                      </div>
                      <span className="font-mono-industrial text-[8px] font-bold tracking-[0.1em] text-[#FFF3D5]/35 uppercase">SYNC: ACTIVE /// LATENCY: 12MS</span>
                    </div>
                  )}
                  {idx === 2 && (
                    <div className="space-y-1">
                      {['receipt_06.png  ///  $14.80', 'flyer_note.jpg  ///  "SAVE 20%"'].map((line) => (
                        <div key={line} className="font-mono-industrial text-[9px] font-bold tracking-[0.05em] text-[#4D694E]/50">{line}</div>
                      ))}
                    </div>
                  )}
                  {idx === 3 && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 font-mono-industrial text-[8px] font-bold tracking-[0.05em] text-[#4D694E]/40 truncate border border-[#4D694E]/10 px-2 py-1.5 bg-[#FFF3D5]">
                        INV #983421 — $1,250.00
                      </div>
                      <button
                        onClick={handleCopyText}
                        className="bg-[#4D694E] text-[#FFF3D5] px-3 py-1.5 font-mono-industrial text-[8px] font-bold tracking-[0.1em] uppercase flex items-center gap-1 active:scale-[0.95] transition-transform flex-shrink-0 border border-[#4D694E]"
                      >
                        {copiedText ? (
                          <><Check className="w-3 h-3" weight="bold" /> COPIED</>
                        ) : (
                          <><CursorClick className="w-3 h-3" weight="bold" /> COPY</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PROCESS — Industrial stepped protocol
          ═══════════════════════════════════════════════════════ */}
      <section ref={processRef} id="process" className="py-20 md:py-28 border-y-2 border-[#4D694E] relative z-10">
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Section header */}
          <div className="flex items-end justify-between border-b-2 border-[#4D694E] pb-4 mb-8">
            <div>
              <div className="font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase text-[#4D694E]/35 mb-2">
                OPERATIONAL PROTOCOL /// WORKFLOW
              </div>
              <h2
                className="uppercase font-black leading-[0.9] tracking-[-0.04em]"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 3.5rem)' }}
              >
                HOW IT<br />WORKS
              </h2>
            </div>
            <div className="font-mono-industrial text-[8px] font-bold tracking-[0.1em] text-[#4D694E]/25 text-right hidden md:block">
              STEPS: 03<br />
              SEQ: LINEAR
            </div>
          </div>

          {/* Steps grid — Standalone cards with gaps and shadows */}
          <div className="process-grid grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.ref}
                  className="process-step p-6 md:p-8 border-2 border-[#4D694E] bg-transparent flex flex-col justify-between min-h-[260px] relative will-change-transform shadow-[6px_6px_0px_0px_#4D694E] transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_#4D694E]"
                >
                  {/* Large watermark number */}
                  <span
                    className="process-watermark absolute top-3 right-4 font-black leading-none text-[#4D694E]/[0.04] select-none pointer-events-none will-change-transform"
                    style={{ fontSize: 'clamp(4rem, 8vw, 8rem)' }}
                  >
                    {step.step}
                  </span>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-10 h-10 border-2 border-[#4D694E] flex items-center justify-center">
                        <Icon className="w-5 h-5" weight="bold" />
                      </div>
                      <span className="font-mono-industrial text-[8px] font-bold tracking-[0.15em] text-[#4D694E]/25">{step.ref}</span>
                    </div>

                    <h3 className="text-base md:text-lg font-black uppercase tracking-[-0.02em] mb-2">
                      {step.title}
                    </h3>
                    <p className="font-mono-industrial text-[10px] font-semibold tracking-[0.03em] leading-[1.5] uppercase text-[#4D694E]/55">
                      {step.description}
                    </p>
                  </div>

                  {/* Step micro-visual */}
                  <div className="process-micro-visual mt-6 border-2 border-[#4D694E]/15 p-3 relative z-10 will-change-transform">
                    {idx === 0 && (
                      <div className="border border-dashed border-[#4D694E]/20 px-4 py-2 flex items-center gap-2 justify-center">
                        <UploadSimple className="w-4 h-4 text-[#4D694E]/50" weight="bold" />
                        <span className="font-mono-industrial text-[8px] font-bold tracking-[0.1em] text-[#4D694E]/45 uppercase">SELECT FILE</span>
                      </div>
                    )}
                    {idx === 1 && (
                      <div className="flex items-center gap-2">
                        <Lightning className="w-4 h-4 text-[#4D694E] animate-pulse" weight="fill" />
                        <div className="flex-1 space-y-1">
                          <div className="h-1.5 w-[70%] bg-[#4D694E]/15" />
                          <div className="h-1.5 w-[45%] bg-[#4D694E]/10" />
                        </div>
                      </div>
                    )}
                    {idx === 2 && (
                      <div className="flex gap-2">
                        <div className="border border-[#4D694E]/15 px-3 py-1 font-mono-industrial text-[8px] font-bold tracking-[0.1em] flex items-center gap-1">
                          <Copy className="w-3 h-3" weight="bold" /> COPY
                        </div>
                        <div className="bg-[#4D694E] text-[#FFF3D5] px-3 py-1 font-mono-industrial text-[8px] font-bold tracking-[0.1em] flex items-center gap-1">
                          <CloudArrowUp className="w-3 h-3" weight="bold" /> SYNC
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PRICING — Compartmentalized access tiers
          ═══════════════════════════════════════════════════════ */}
      <section ref={pricingRef} id="pricing" className="py-20 md:py-28 max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="flex items-end justify-between border-b-2 border-[#4D694E] pb-4 mb-8">
          <div>
            <div className="font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase text-[#4D694E]/35 mb-2">
              ACCESS CONTROL /// TIERS
            </div>
            <h2
              className="uppercase font-black leading-[0.9] tracking-[-0.04em]"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3.5rem)' }}
            >
              100% FREE.<br />OPEN SOURCE.
            </h2>
          </div>
        </div>

        <div className="pricing-grid grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl" style={{ perspective: '800px' }}>
          {PRICING_TIERS.map((tier, idx) => (
            <div
              key={tier.ref}
              className={`pricing-card p-6 md:p-8 border-2 border-[#4D694E] flex flex-col justify-between min-h-[300px] relative will-change-transform transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1 ${
                tier.isPro
                  ? 'bg-[#4D694E] text-[#FFF3D5] shadow-[6px_6px_0px_0px_rgba(77,105,78,0.25)] hover:shadow-[8px_8px_0px_0px_rgba(77,105,78,0.35)]'
                  : 'bg-transparent text-[#4D694E] shadow-[6px_6px_0px_0px_#4D694E] hover:shadow-[8px_8px_0px_0px_#4D694E]'
              }`}
            >
              {/* Crosshair */}
              <span className={`absolute top-2 left-2 font-mono-industrial text-[10px] ${tier.isPro ? 'text-[#FFF3D5]/15' : 'text-[#4D694E]/10'}`}>+</span>

              {tier.isPro && (
                <div className="absolute top-4 right-4 border border-[#FFF3D5]/30 px-2 py-0.5 font-mono-industrial text-[8px] font-bold tracking-[0.15em] uppercase text-[#FFF3D5]/60">
                  &lt; RECOMMENDED &gt;
                </div>
              )}

              <div>
                <div className={`font-mono-industrial text-[8px] font-bold tracking-[0.15em] mb-4 ${tier.isPro ? 'text-[#FFF3D5]/30' : 'text-[#4D694E]/25'}`}>
                  {tier.ref}
                </div>
                <h3 className="pricing-title text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-[-0.03em] mb-6 mt-1 will-change-transform">
                  {tier.title}
                </h3>

                <div className={`border-t-2 pt-4 mb-6 ${tier.isPro ? 'border-[#FFF3D5]/15' : 'border-[#4D694E]/15'}`}>
                  {tier.features.map((feature, fIdx) => (
                    <div key={fIdx} className="pricing-feature-item flex items-start gap-2 mb-2.5 will-change-transform">
                      <span className={`font-mono-industrial text-[10px] font-bold ${tier.isPro ? 'text-[#FFF3D5]/40' : 'text-[#4D694E]/30'}`}>&gt;</span>
                      <span className={`font-mono-industrial text-[10px] md:text-[11px] font-semibold tracking-[0.03em] uppercase ${tier.isPro ? 'text-[#FFF3D5]/70' : 'text-[#4D694E]/65'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/app"
                replace
                className={`w-full block text-center py-3 font-mono-industrial text-[11px] font-bold tracking-[0.1em] uppercase active:scale-[0.97] transition-all border-2 ${
                  tier.isPro
                    ? 'bg-[#FFF3D5] text-[#4D694E] border-[#FFF3D5] hover:bg-[#FFF3D5]/90'
                    : 'bg-[#4D694E] text-[#FFF3D5] border-[#4D694E] hover:bg-[#3a4f3b]'
                }`}
              >
                {tier.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          OPEN SOURCE COMMUNITY — Privacy by default, utility by design
          ═══════════════════════════════════════════════════════ */}
      <section ref={openSourceRef} id="open-source" className="py-20 md:py-28 max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="os-header border-b-2 border-[#4D694E] pb-4 mb-8">
          <div className="font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase text-[#4D694E]/35 mb-2">
            COMMUNITY INDEX /// SOURCE CODE
          </div>
          <h2
            className="uppercase font-black leading-[0.9] tracking-[-0.04em] text-[#4D694E]"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3.5rem)' }}
          >
            Privacy by default,<br />utility by design.
          </h2>
        </div>

        <p className="os-desc font-mono-industrial text-[11px] md:text-[12px] font-semibold tracking-[0.03em] leading-[1.6] uppercase text-[#4D694E]/65 max-w-2xl mb-8">
          Textify is open source and dedicated to making browser-based document extraction secure and lightweight. Explore the code, run it completely offline, or connect your own cloud archive.
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-16 relative z-10">
          <a
            href="https://github.com/gnbaba/Textify"
            target="_blank"
            rel="noopener noreferrer"
            className="os-btn btn-magnetic bg-[#4D694E] text-[#FFF3D5] px-6 py-3 font-mono-industrial text-[11px] font-bold tracking-[0.1em] uppercase hover:bg-[#3a4f3b] active:scale-[0.97] transition-colors border-2 border-[#4D694E] flex items-center gap-2 relative z-10"
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
          >
            <GithubLogo className="w-5 h-5" weight="bold" />
            View on GitHub
          </a>
          <Link
            to="/docs"
            className="os-btn btn-border-expand border-2 border-[#4D694E] text-[#4D694E] px-6 py-3 font-mono-industrial text-[11px] font-bold tracking-[0.1em] uppercase active:scale-[0.97] transition-colors flex items-center gap-2 relative z-10"
          >
            <BookOpen className="w-5 h-5" weight="bold" />
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
            className="os-card p-6 md:p-8 border-2 border-[#4D694E] bg-transparent flex flex-col justify-between min-h-[220px] text-left relative group transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1 shadow-[6px_6px_0px_0px_#4D694E] hover:shadow-[8px_8px_0px_0px_#4D694E]"
          >
            <span className="absolute top-2 left-2 font-mono-industrial text-[10px] text-[#4D694E]/10">+</span>
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono-industrial text-[9px] font-bold tracking-[0.15em] text-[#4D694E]/40">[01 / CODE]</span>
                <Code className="w-5 h-5 text-[#4D694E]/50 group-hover:text-[#4D694E] group-hover:scale-110 transition-all duration-300" weight="bold" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-[#4D694E]">Code Contributions</h3>
              <p className="font-mono-industrial text-[10px] md:text-[11px] font-semibold tracking-[0.03em] leading-[1.5] uppercase text-[#4D694E]/55">
                Help improve the AI models, OCR pipeline, or UI. Pull requests of all sizes are welcome from the community.
              </p>
            </div>
            <div className="mt-4 font-mono-industrial text-[9px] font-bold text-[#4D694E]/40 group-hover:text-[#4D694E] transition-colors flex items-center gap-1.5 w-full">
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
            className="os-card p-6 md:p-8 border-2 border-[#4D694E] bg-transparent flex flex-col justify-between min-h-[220px] text-left relative group transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1 shadow-[6px_6px_0px_0px_#4D694E] hover:shadow-[8px_8px_0px_0px_#4D694E]"
          >
            <span className="absolute top-2 left-2 font-mono-industrial text-[10px] text-[#4D694E]/10">+</span>
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono-industrial text-[9px] font-bold tracking-[0.15em] text-[#4D694E]/40">[02 / BUG]</span>
                <Bug className="w-5 h-5 text-[#4D694E]/50 group-hover:text-[#4D694E] group-hover:scale-110 transition-all duration-300" weight="bold" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-[#4D694E]">Report Bugs</h3>
              <p className="font-mono-industrial text-[10px] md:text-[11px] font-semibold tracking-[0.03em] leading-[1.5] uppercase text-[#4D694E]/55">
                Found an issue? Open a GitHub issue with details to help track and fix bugs as the project moves toward a stable release.
              </p>
            </div>
            <div className="mt-4 font-mono-industrial text-[9px] font-bold text-[#4D694E]/40 group-hover:text-[#4D694E] transition-colors flex items-center gap-1.5 w-full">
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
            className="os-card p-6 md:p-8 border-2 border-[#4D694E] bg-transparent flex flex-col justify-between min-h-[220px] text-left relative group transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1 shadow-[6px_6px_0px_0px_#4D694E] hover:shadow-[8px_8px_0px_0px_#4D694E]"
          >
            <span className="absolute top-2 left-2 font-mono-industrial text-[10px] text-[#4D694E]/10">+</span>
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono-industrial text-[9px] font-bold tracking-[0.15em] text-[#4D694E]/40">[03 / CHAT]</span>
                <Chats className="w-5 h-5 text-[#4D694E]/50 group-hover:text-[#4D694E] group-hover:scale-110 transition-all duration-300" weight="bold" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-[#4D694E]">Share Feedback</h3>
              <p className="font-mono-industrial text-[10px] md:text-[11px] font-semibold tracking-[0.03em] leading-[1.5] uppercase text-[#4D694E]/55">
                Share thoughts on how you're using Textify. Feedback directly influences the project roadmap and the features built next.
              </p>
            </div>
            <div className="mt-4 font-mono-industrial text-[9px] font-bold text-[#4D694E]/40 group-hover:text-[#4D694E] transition-colors flex items-center gap-1.5 w-full">
              TRANSMIT INSIGHTS <ArrowRight className="w-3.5 h-3.5" weight="bold" />
            </div>
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA BANNER — Heavy utilitarian block
          ═══════════════════════════════════════════════════════ */}
      <section ref={ctaBannerRef} className="border-y-2 border-[#4D694E] relative z-10 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 py-16 md:py-20 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="cta-text-block md:col-span-8 will-change-transform">
            <div className="font-mono-industrial text-[9px] font-bold tracking-[0.15em] uppercase text-[#4D694E]/35 mb-3">
              INITIALIZE /// WORKSPACE
            </div>
            <h2
              className="uppercase font-black leading-[0.88] tracking-[-0.04em]"
              style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
            >
              READY TO EXTRACT<br />TEXT FROM ANY IMAGE?
            </h2>
            <p className="font-mono-industrial text-[10px] md:text-[11px] font-semibold tracking-[0.03em] leading-[1.5] uppercase text-[#4D694E]/50 max-w-lg mt-4">
              EXPERIENCE LAYOUT-AWARE OCR PROCESSING DIRECTLY IN YOUR BROWSER. CLEAN, PRIVATE, AND CLOUD SYNCED.
            </p>
          </div>
          <div className="md:col-span-4 flex md:justify-end">
            <Link
              to="/app"
              replace
              ref={ctaButtonRef}
              className="btn-magnetic bg-[#4D694E] text-[#FFF3D5] px-8 py-4 font-mono-industrial text-[11px] font-bold tracking-[0.1em] uppercase hover:bg-[#3a4f3b] active:scale-[0.97] transition-colors border-2 border-[#4D694E] flex items-center gap-2 will-change-transform"
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
            >
              GET STARTED <ArrowRight className="w-4 h-4" weight="bold" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER — Dense monospace metadata
          ═══════════════════════════════════════════════════════ */}
      <footer className="w-full bg-[#FFF3D5] py-8 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase">
          <div className="md:col-span-4 flex flex-col gap-2">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-0.5 cursor-pointer focus:outline-none bg-transparent border-0 p-0 text-left"
              aria-label="Refresh Page"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <img src="/New_Textify.png" alt="Textify" className="w-full h-full object-contain" />
              </div>
              <span className="font-black tracking-tight text-sm normal-case">Textify<sup className="text-[7px]">&reg;</sup></span>
            </button>
            <p className="text-[8px] text-[#4D694E]/40 tracking-[0.05em] max-w-xs leading-[1.6]">
              A PRIVACY-FIRST BROWSER-BASED OCR TOOL FOR DIGITIZING DOCUMENT TEXT INSTANTLY.
            </p>
          </div>

          <div className="md:col-span-5 flex flex-wrap gap-4 justify-start md:justify-center text-[9px] text-[#4D694E]/50">
            {(['privacy', 'terms', 'support'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setInfoModalType(type)}
                className="hover:text-[#4D694E] transition-colors"
              >
                [ {type === 'privacy' ? 'PRIVACY' : type === 'terms' ? 'TERMS' : 'SUPPORT'} ]
              </button>
            ))}
          </div>

          <div className="md:col-span-3 text-left md:text-right flex flex-col gap-0.5 text-[8px] text-[#4D694E]/35">
            <div>&copy; {new Date().getFullYear()} TEXTIFY INC.</div>
            <div>BUILT BY @GNBABA</div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════
          INFO MODAL — Industrial panel
          ═══════════════════════════════════════════════════════ */}
      {infoModalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4D694E]/40 px-4">
          <div className="bg-[#FFF3D5] w-full max-w-md overflow-hidden border-2 border-[#4D694E]">
            <div className="bg-[#4D694E] text-[#FFF3D5] px-5 py-2.5 flex items-center justify-between font-mono-industrial text-[10px] font-bold tracking-[0.15em] uppercase">
              <span>&lt; {LEGAL_CONTENT[infoModalType].title.toUpperCase()} &gt;</span>
              <button
                onClick={() => setInfoModalType(null)}
                className="hover:text-[#FFF3D5]/70 transition-colors"
              >
                <X className="w-4 h-4" weight="bold" />
              </button>
            </div>
            <div className="p-6">
              <p className="font-mono-industrial text-[10px] md:text-[11px] font-semibold tracking-[0.03em] leading-[1.6] uppercase text-[#4D694E]/70 mb-6">
                {LEGAL_CONTENT[infoModalType].body}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setInfoModalType(null)}
                  className="bg-[#4D694E] text-[#FFF3D5] px-5 py-2 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase active:scale-[0.97] transition-all border-2 border-[#4D694E] hover:bg-[#3a4f3b]"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          OPEN SOURCE MODALS — Interactive dialogue panels
          ═══════════════════════════════════════════════════════ */}
      {activeOsModal === 'code' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4D694E]/40 px-4">
          <div className="bg-[#FFF3D5] w-full max-w-lg overflow-hidden border-2 border-[#4D694E]">
            <div className="bg-[#4D694E] text-[#FFF3D5] px-5 py-2.5 flex items-center justify-between font-mono-industrial text-[10px] font-bold tracking-[0.15em] uppercase">
              <span>&lt; CODE CONTRIBUTIONS &gt;</span>
              <button
                onClick={() => setActiveOsModal(null)}
                className="hover:text-[#FFF3D5]/70 transition-colors"
              >
                <X className="w-4 h-4" weight="bold" />
              </button>
            </div>
            <div className="p-6">
              <p className="font-mono-industrial text-[10px] md:text-[11px] font-semibold tracking-[0.03em] leading-[1.6] uppercase text-[#4D694E]/70 mb-4">
                We welcome community contributions. Clone the workspace locally to begin development, customize OCR parameters, or tweak layout details.
              </p>

              <div className="bg-[#4D694E] text-[#FFF3D5] p-3 font-mono-industrial text-[10px] md:text-[11px] font-bold mb-6 flex items-center justify-between border border-[#4D694E] select-all">
                <span>git clone https://github.com/gnbaba/Textify.git</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('git clone https://github.com/gnbaba/Textify.git');
                    setCopiedCloneCmd(true);
                    setTimeout(() => setCopiedCloneCmd(false), 2000);
                  }}
                  className="text-[#FFF3D5]/75 hover:text-[#FFF3D5] flex-shrink-0 ml-2"
                  title="Copy clone command"
                >
                  {copiedCloneCmd ? <Check className="w-4 h-4" weight="bold" /> : <Copy className="w-4 h-4" weight="bold" />}
                </button>
              </div>

              <div className="space-y-3 font-mono-industrial text-[10px] uppercase text-[#4D694E]/60 mb-6">
                <div>1. Fork the repository and build a topic branch.</div>
                <div>2. Standardize features to follow architectural directions.</div>
                <div>3. Open a pull request targeting the main line.</div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setActiveOsModal(null)}
                  className="bg-[#4D694E] text-[#FFF3D5] px-5 py-2 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase active:scale-[0.97] transition-all border-2 border-[#4D694E] hover:bg-[#3a4f3b]"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeOsModal === 'bug' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4D694E]/40 px-4">
          <div className="bg-[#FFF3D5] w-full max-w-md overflow-hidden border-2 border-[#4D694E]">
            <div className="bg-[#4D694E] text-[#FFF3D5] px-5 py-2.5 flex items-center justify-between font-mono-industrial text-[10px] font-bold tracking-[0.15em] uppercase">
              <span>&lt; REPORT BUGS &gt;</span>
              <button
                onClick={() => setActiveOsModal(null)}
                className="hover:text-[#FFF3D5]/70 transition-colors"
              >
                <X className="w-4 h-4" weight="bold" />
              </button>
            </div>
            <div className="p-6">
              {bugSubmitted ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-[#4D694E] mx-auto mb-3" weight="bold" />
                  <h4 className="font-black uppercase text-base text-[#4D694E] mb-1">Issue Recorded</h4>
                  <p className="font-mono-industrial text-[9px] md:text-[10px] uppercase text-[#4D694E]/60 max-w-xs mx-auto leading-relaxed">
                    Bug report successfully filed in sandbox environment. You can copy this details for a GitHub ticket.
                  </p>
                  <button
                    onClick={() => setActiveOsModal(null)}
                    className="mt-6 bg-[#4D694E] text-[#FFF3D5] px-5 py-2 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase active:scale-[0.97] transition-all border-2 border-[#4D694E] hover:bg-[#3a4f3b]"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setBugSubmitted(true); }} className="space-y-4">
                  <p className="font-mono-industrial text-[10px] uppercase text-[#4D694E]/50 mb-2 leading-relaxed">
                    Explain the error substrate so the maintainer index can evaluate and reconstruct code behaviors.
                  </p>
                  <div>
                    <label className="block font-mono-industrial text-[8px] font-bold tracking-[0.1em] uppercase text-[#4D694E]/60 mb-1">Issue title</label>
                    <input
                      type="text"
                      required
                      value={bugTitle}
                      onChange={(e) => setBugTitle(e.target.value)}
                      className="w-full bg-white border-2 border-[#4D694E] p-2 font-mono-industrial text-[10px] focus:outline-none focus:bg-[#4D694E]/5 text-[#4D694E]"
                      placeholder="e.g. OCR fails on low-contrast graphics"
                    />
                  </div>
                  <div>
                    <label className="block font-mono-industrial text-[8px] font-bold tracking-[0.1em] uppercase text-[#4D694E]/60 mb-1">Bug explanation</label>
                    <textarea
                      required
                      rows={3}
                      value={bugDesc}
                      onChange={(e) => setBugDesc(e.target.value)}
                      className="w-full bg-white border-2 border-[#4D694E] p-2 font-mono-industrial text-[10px] focus:outline-none focus:bg-[#4D694E]/5 text-[#4D694E] resize-none"
                      placeholder="Input error logs, layout conditions, or browser version..."
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveOsModal(null)}
                      className="border-2 border-[#4D694E]/40 text-[#4D694E]/60 px-5 py-2 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase active:scale-[0.97] transition-all hover:border-[#4D694E] hover:text-[#4D694E]"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="bg-[#4D694E] text-[#FFF3D5] px-5 py-2 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase active:scale-[0.97] transition-all border-2 border-[#4D694E] hover:bg-[#3a4f3b]"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4D694E]/40 px-4">
          <div className="bg-[#FFF3D5] w-full max-w-md overflow-hidden border-2 border-[#4D694E]">
            <div className="bg-[#4D694E] text-[#FFF3D5] px-5 py-2.5 flex items-center justify-between font-mono-industrial text-[10px] font-bold tracking-[0.15em] uppercase">
              <span>&lt; SHARE FEEDBACK &gt;</span>
              <button
                onClick={() => setActiveOsModal(null)}
                className="hover:text-[#FFF3D5]/70 transition-colors"
              >
                <X className="w-4 h-4" weight="bold" />
              </button>
            </div>
            <div className="p-6">
              {feedbackSubmitted ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-[#4D694E] mx-auto mb-3" weight="bold" />
                  <h4 className="font-black uppercase text-base text-[#4D694E] mb-1">Feedback Logged</h4>
                  <p className="font-mono-industrial text-[9px] md:text-[10px] uppercase text-[#4D694E]/60 max-w-xs mx-auto leading-relaxed">
                    Thank you. Feedback directly influences the project roadmap and features built next.
                  </p>
                  <button
                    onClick={() => setActiveOsModal(null)}
                    className="mt-6 bg-[#4D694E] text-[#FFF3D5] px-5 py-2 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase active:scale-[0.97] transition-all border-2 border-[#4D694E] hover:bg-[#3a4f3b]"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setFeedbackSubmitted(true); }} className="space-y-4">
                  <p className="font-mono-industrial text-[10px] uppercase text-[#4D694E]/50 mb-2 leading-relaxed">
                    Share ratings and comments on how we can make Textify document scraping more optimal.
                  </p>
                  <div>
                    <label className="block font-mono-industrial text-[8px] font-bold tracking-[0.1em] uppercase text-[#4D694E]/60 mb-2">experience quality</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'awesome', label: 'AWESOME' },
                        { id: 'good', label: 'GOOD' },
                        { id: 'work', label: 'NEEDS WORK' }
                      ].map((rating) => (
                        <button
                          key={rating.id}
                          type="button"
                          onClick={() => setFeedbackRating(rating.id as any)}
                          className={`py-2 border-2 text-[8px] font-mono-industrial font-bold uppercase transition-all ${
                            feedbackRating === rating.id
                              ? 'bg-[#4D694E] text-[#FFF3D5] border-[#4D694E]'
                              : 'bg-white text-[#4D694E] border-[#4D694E]/30 hover:border-[#4D694E]'
                          }`}
                        >
                          {rating.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block font-mono-industrial text-[8px] font-bold tracking-[0.1em] uppercase text-[#4D694E]/60 mb-1">insights & suggestions</label>
                    <textarea
                      required
                      rows={3}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full bg-white border-2 border-[#4D694E] p-2 font-mono-industrial text-[10px] focus:outline-none focus:bg-[#4D694E]/5 text-[#4D694E] resize-none"
                      placeholder="e.g. Really love the local OCR model performance, maybe support tabular extraction formatting..."
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveOsModal(null)}
                      className="border-2 border-[#4D694E]/40 text-[#4D694E]/60 px-5 py-2 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase active:scale-[0.97] transition-all hover:border-[#4D694E] hover:text-[#4D694E]"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="bg-[#4D694E] text-[#FFF3D5] px-5 py-2 font-mono-industrial text-[10px] font-bold tracking-[0.1em] uppercase active:scale-[0.97] transition-all border-2 border-[#4D694E] hover:bg-[#3a4f3b]"
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
        className={`fixed bottom-6 right-6 z-50 p-2.5 bg-[#4D694E] text-[#FFF3D5] border-2 border-[#4D694E] hover:bg-[#3a4f3b] active:scale-[0.95] transition-all duration-300 ${
          showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <ArrowUp className="w-4 h-4" weight="bold" />
      </button>
    </main>
  );
};