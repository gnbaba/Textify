import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    title: 'AI-Powered Precision',
    description: 'Reads documents, messy receipts, and stylized logos flawlessly using advanced optical character recognition.',
    iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    title: 'Cloud Synchronization',
    description: 'Your extractions are saved to your secure personal account instantly. Access them from any device, anywhere.',
    iconPath: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
  },
  {
    title: 'Real-time Session Feed',
    description: 'Organized like a chat thread. Stack multiple scans in one place and scroll through your extraction history effortlessly.',
    iconPath: 'M4 6h16M4 10h16M4 14h16M4 18h16',
  },
  {
    title: 'One-Click Copy',
    description: 'Instantly copy your extracted data to your clipboard for easy pasting into emails, documents, or code editors.',
    iconPath: 'M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3',
  },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Upload Image',
    description: 'Tap to snap a photo or drag and drop any graphic into the workspace.',
    iconPath: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
  },
  {
    step: '2',
    title: 'AI Extraction',
    description: 'Our advanced OCR engine instantly scans and digitizes your text with high precision.',
    iconPath: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
  },
  {
    step: '3',
    title: 'Sync & Use',
    description: 'Copy the text to your clipboard or let it automatically save to your secure cloud feed.',
    iconPath: 'M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3',
  }
];

const PRICING_TIERS = [
  {
    title: 'Guest Pass',
    price: '0',
    isPro: false,
    features: ['10 Free Scans Total', 'No Account Required', 'Standard Processing Speed'],
    buttonText: 'Try as Guest',
  },
  {
    title: 'Registered User',
    price: '0',
    isPro: true,
    features: ['Infinite Daily Scans', 'Permanent Cloud Storage', 'Real-time Session Feed', 'Access to Graphic Mode OCR'],
    buttonText: 'Sign in with Google',
  },
];

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (domRef.current) observer.unobserve(domRef.current);
        }
      });
    }, { threshold: 0.1 });

    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out will-change-transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const FeatureCard = ({ title, description, iconPath }: { title: string, description: string, iconPath: string }) => (
  <div className="bg-[#FFF3D5]/30 p-6 md:p-8 rounded-xl border border-[#4D694E]/10 hover:shadow-md transition-shadow h-full relative z-10">
    <div className="w-12 h-12 bg-[#4D694E] text-[#FFF3D5] rounded-full flex items-center justify-center mb-6 shadow-sm">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
      </svg>
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-[#4D694E]/80 leading-relaxed text-sm md:text-base">{description}</p>
  </div>
);

const StepCard = ({ step, title, description, iconPath }: typeof HOW_IT_WORKS[0]) => (
  <div className="relative flex flex-col items-center text-center p-4 md:p-6 h-full">
    <div className="w-14 h-14 md:w-16 md:h-16 bg-white text-[#4D694E] rounded-2xl border-2 border-[#4D694E]/20 flex items-center justify-center mb-6 shadow-sm relative z-10 hover:scale-105 transition-transform">
      <svg className="w-7 h-7 md:w-8 md:h-8 text-[#4D694E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
      </svg>
      <div className="absolute -top-3 -right-3 bg-[#4D694E] text-[#FFF3D5] text-xs font-extrabold w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center shadow-md border-2 border-[#FFF3D5]">
        {step}
      </div>
    </div>
    <h3 className="text-xl font-bold mb-2 md:mb-3">{title}</h3>
    <p className="text-[#4D694E]/80 leading-relaxed text-sm md:text-base">{description}</p>
  </div>
);

const PricingCard = ({ tier }: { tier: typeof PRICING_TIERS[0] }) => (
  <div className={`bg-white rounded-xl p-6 md:p-8 border w-full flex flex-col relative h-full ${tier.isPro ? 'border-2 border-[#4D694E] shadow-xl transform md:-translate-y-4 mt-6 md:mt-0' : 'border-[#4D694E]/20 shadow-sm'}`}>
    {tier.isPro && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#4D694E] text-[#FFF3D5] px-4 py-1 rounded-full text-xs md:text-sm font-bold tracking-wide shadow-sm whitespace-nowrap">
        Recommended
      </div>
    )}
    <h3 className="text-xl md:text-2xl font-bold mb-2">{tier.title}</h3>
    <div className="text-3xl md:text-4xl font-extrabold mb-6">${tier.price}<span className="text-base md:text-lg text-[#4D694E]/60 font-medium">/mo</span></div>
    <ul className="space-y-3 md:space-y-4 mb-8 flex-grow">
      {tier.features.map((feature, idx) => (
        <li key={idx} className="flex items-center space-x-3 text-sm md:text-base">
          <svg className="w-5 h-5 text-[#4D694E] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className={`text-[#4D694E]/80 ${tier.isPro ? 'font-medium' : ''}`}>{feature}</span>
        </li>
      ))}
    </ul>
    <Link to="/app" className={`w-full block text-center py-3 rounded-full font-bold transition-colors shadow-sm hover:shadow-md text-sm md:text-base ${tier.isPro ? 'bg-[#4D694E] text-[#FFF3D5] hover:bg-[#3a4f3b]' : 'bg-[#FFF3D5] text-[#4D694E] border border-[#4D694E]/20 hover:bg-[#f5e5be]'}`}>
      {tier.buttonText}
    </Link>
  </div>
);

export const LandingPage = () => {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#FFF3D5] font-sans tracking-tight text-[#4D694E] selection:bg-[#4D694E] selection:text-[#FFF3D5] overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="relative z-20 w-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 md:w-8 md:h-8 text-[#4D694E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-xl md:text-2xl font-extrabold tracking-tighter">Textify</span>
        </div>

        <div className="hidden md:flex items-center space-x-8 font-medium">
          <a href="#features" className="hover:text-[#3a4f3b] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#3a4f3b] transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-[#3a4f3b] transition-colors">Tiers</a>
        </div>
        <Link to="/app" className="bg-[#4D694E] text-[#FFF3D5] px-4 md:px-6 py-2 md:py-2.5 rounded-full font-bold hover:bg-[#3a4f3b] transition-all shadow-sm hover:shadow-md text-sm md:text-base">
          Get Started
        </Link>
      </nav>

      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, rgba(77, 105, 78, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(77, 105, 78, 0.15) 1px, transparent 1px)', backgroundSize: '4rem 4rem', WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)', maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-24 text-center flex flex-col items-center">
          <FadeIn delay={0}>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 md:mb-6 leading-tight bg-gradient-to-br from-[#4D694E] to-[#2c3c2d] bg-clip-text text-transparent px-2">
              Convert Images to <br className="hidden sm:block" /> Editable Text Instantly.
            </h1>
          </FadeIn>
          
          <FadeIn delay={150}>

            <p className="text-base sm:text-lg md:text-xl text-[#4D694E]/80 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed bg-[#FFF3D5]/80 backdrop-blur-sm rounded-2xl py-2 px-3 md:px-4">
              The AI-powered OCR platform for documents, receipts, and graphics. Extract, save to the cloud, and organize in real-time.
            </p>
          </FadeIn>
          
          <FadeIn delay={300}>
            <Link to="/app" className="bg-[#4D694E] text-[#FFF3D5] text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-full font-bold hover:bg-[#3a4f3b] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center space-x-2 md:space-x-3">
              <span>Start Extracting for Free</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </FadeIn>

          {/* Hero Graphic */}
          <FadeIn delay={450}>
            <div className="mt-12 md:mt-16 w-full max-w-3xl mx-auto bg-white rounded-xl shadow-xl border border-[#4D694E]/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
              <div className="w-32 h-32 md:w-48 md:h-48 bg-[#FFF3D5] rounded-xl border-2 border-dashed border-[#4D694E]/30 flex items-center justify-center relative overflow-hidden">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-[#4D694E]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div className="flex md:hidden flex-row items-center text-[#4D694E]/50 rotate-90 my-2">
                <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </div>

              <div className="hidden md:flex flex-col items-center text-[#4D694E]/50">
                <svg className="w-10 h-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </div>

              <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-xl border border-[#4D694E]/10 shadow-inner p-3 md:p-4 flex flex-col gap-2 md:gap-3 justify-center">
                <div className="h-2 md:h-3 w-3/4 bg-[#4D694E]/20 rounded-full"></div>
                <div className="h-2 md:h-3 w-full bg-[#4D694E]/20 rounded-full"></div>
                <div className="h-2 md:h-3 w-5/6 bg-[#4D694E]/20 rounded-full"></div>
                <div className="h-2 md:h-3 w-full bg-[#4D694E]/20 rounded-full"></div>
                <div className="h-2 md:h-3 w-2/3 bg-[#4D694E]/20 rounded-full"></div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="w-full bg-white py-12 md:py-24 border-y border-[#4D694E]/10 relative">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <FadeIn>
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">Everything you need to digitize text.</h2>
              <p className="text-[#4D694E]/70 text-base md:text-lg max-w-2xl mx-auto">Built for speed, accuracy, and seamless organization.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {FEATURES.map((feature, idx) => (
              <FadeIn key={idx} delay={idx * 150}>
                <FeatureCard {...feature} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-12 md:py-24 bg-[#FFF3D5] relative">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <FadeIn>
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">How it works</h2>
              <p className="text-[#4D694E]/70 text-base md:text-lg max-w-2xl mx-auto">From messy image to organized text in three simple steps.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
            <div className="hidden md:block absolute top-14 left-1/6 right-1/6 h-0.5 bg-[#4D694E]/10 z-0"></div>
            {HOW_IT_WORKS.map((stepData, idx) => (
              <FadeIn key={idx} delay={idx * 200}>
                <StepCard {...stepData} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full bg-white py-12 md:py-24 border-t border-[#4D694E]/10 relative">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <FadeIn>
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">100% Free. No credit cards ever.</h2>
              <p className="text-[#4D694E]/70 text-base md:text-lg">Start scanning immediately, or create an account for infinite access.</p>
            </div>
          </FadeIn>
          <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-8 max-w-4xl mx-auto">
            {PRICING_TIERS.map((tier, idx) => (
              <FadeIn key={idx} delay={idx * 200}>
                <PricingCard tier={tier} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#FFF3D5] border-t border-[#4D694E]/10 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-[#4D694E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-lg md:text-xl font-extrabold tracking-tighter">Textify</span>
          </div>
          <div className="flex space-x-4 md:space-x-6 text-xs md:text-sm font-medium text-[#4D694E]/70">
            <Link to="/" className="hover:text-[#4D694E] transition-colors">Privacy</Link>
            <Link to="/" className="hover:text-[#4D694E] transition-colors">Terms</Link>
            <Link to="/" className="hover:text-[#4D694E] transition-colors">Support</Link>
          </div>
          <div className="text-xs md:text-sm text-[#4D694E]/50 text-center">
            &copy; {new Date().getFullYear()} Textify Inc. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Smooth Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 p-3 md:p-4 rounded-full bg-[#4D694E] text-[#FFF3D5] shadow-xl border-2 border-[#FFF3D5] hover:bg-[#3a4f3b] hover:-translate-y-1 transition-all duration-300 ease-in-out ${
          showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
        </svg>
      </button>

    </div>
  );
};