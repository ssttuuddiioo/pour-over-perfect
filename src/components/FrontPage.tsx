import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

// Register the GSAP plugins once at module load.
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

interface FrontPageProps {
  onTimer: () => void;
  onCoffee: () => void;
  onAbout: () => void;
}

const FrontPage: React.FC<FrontPageProps> = ({ onTimer, onCoffee, onAbout }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const smoothWrapperRef = useRef<HTMLDivElement>(null);
  const smoothContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !circleRef.current || !contentRef.current || !navRef.current || !smoothWrapperRef.current || !smoothContentRef.current) return;

    // Enable scrolling for this page only
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';

    const ctx = gsap.context(() => {
      // Initialize ScrollSmoother
      const smoother = ScrollSmoother.create({
        wrapper: smoothWrapperRef.current,
        content: smoothContentRef.current,
        smooth: 0.8,
        effects: true,
        normalizeScroll: true
      });

      // Create timeline pinned to the container
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: window.innerWidth < 768 ? '+=150%' : '+=200%', // Mobile responsive
          onUpdate: (self) => {
            // Fade out nav as we approach full orange
            if (self.progress > 0.7) {
              gsap.set(navRef.current, { pointerEvents: 'none' });
            } else {
              gsap.set(navRef.current, { pointerEvents: 'auto' });
            }
          }
        }
      });

      // Phase 1: Dot scales from 60px to edge-to-edge (0% → 50%)
      // Use the larger viewport dimension to maintain perfect circle
      const maxDimension = Math.max(window.innerWidth, window.innerHeight);
      tl.fromTo(
        circleRef.current,
        { width: 60, height: 60 },
        { 
          width: maxDimension * 1.5, 
          height: maxDimension * 1.5, 
          duration: 0.5,
          ease: 'power2.out'
        }
      )
      // Phase 2: Nav fades out as orange takes over (40% → 70%)
      .to(navRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.inOut'
      }, 0.4)
      // Phase 3: Content fades in and drifts up (70% → 100%)
      .fromTo(contentRef.current, 
        { 
          opacity: 0, 
          y: 60 
        },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.3,
          ease: 'power2.out'
        }, 0.7
      );

    }, containerRef);

    return () => {
      ctx.revert();
      // Restore original scroll-disabled state when leaving this page
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.height = '100vh';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100vh';
    };
  }, []);

    return (
    <div ref={smoothWrapperRef} id="smooth-wrapper" style={{ height: '300vh' }}>
      <div ref={smoothContentRef} id="smooth-content">
        <section ref={containerRef} className="relative h-screen bg-white">
          {/* Pinned Navigation - Corner Layout */}
          <nav ref={navRef} className="fixed inset-0 z-20 p-12 pointer-events-none">
                    {/* Top Left */}
        <button 
          onClick={onAbout}
          className="absolute top-6 left-6 text-base font-medium text-black hover:text-[#ff6700] transition-colors pointer-events-auto"
        >
          about
        </button>
        
        {/* Top Right */}
        <button 
          onClick={onCoffee}
          className="absolute top-6 right-6 text-base font-medium text-black hover:text-[#ff6700] transition-colors pointer-events-auto"
        >
          buy coffee
        </button>
        
        {/* Bottom Left */}
        <button 
          onClick={onTimer}
          className="absolute bottom-6 left-6 text-base font-medium text-black hover:text-[#ff6700] transition-colors pointer-events-auto"
        >
          pour perfect
        </button>
        
        {/* Bottom Right */}
        <button className="absolute bottom-6 right-6 text-base font-medium text-black hover:text-[#ff6700] transition-colors pointer-events-auto">
          contact
        </button>
          </nav>

          {/* Expanding Orange Circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              ref={circleRef}
              className="rounded-full bg-[#FF6700]"
              style={{ width: 60, height: 60 }}
            />
          </div>

          {/* Story Content - Revealed After Full Orange */}
          <div 
            ref={contentRef} 
            className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 px-6"
            style={{ opacity: 0 }}
          >
            {/* Placeholder Image */}
            <div className="w-32 h-32 mb-8 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-xs text-white/70">Image</span>
            </div>
            
                    {/* Tagline */}
        <h1 className="text-lg md:text-2xl font-bold text-center mb-4 leading-tight">
          It all started here
        </h1>
            
            <p className="text-lg md:text-xl text-center max-w-2xl leading-relaxed opacity-90">
              From a small farm in Charalá, Santander to your cup. 
              Every bean tells the story of Colombian coffee excellence.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FrontPage; 