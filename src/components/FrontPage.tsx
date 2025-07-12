import React, { useEffect, useRef, useState } from 'react';
import { useCircleTransition } from '../context/CircleTransitionContext';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

// Register the GSAP plugins once at module load.
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const FrontPage: React.FC = () => {
  const { navigateWithTransition, circleRef } = useCircleTransition();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const smoothWrapperRef = useRef<HTMLDivElement>(null);
  const smoothContentRef = useRef<HTMLDivElement>(null);
  const [showOrigenText, setShowOrigenText] = useState(false);

  const handleNavigateWithFade = (to: string) => {
    // Clean up any ongoing animations before transitioning (keep navigation visible)
    if (circleRef.current) {
      gsap.killTweensOf(circleRef.current);
    }
    navigateWithTransition(to);
  };

  const handleAboutClick = () => {
    // Trigger slow scroll to reveal content
    const targetScroll = window.innerHeight * 2;
    const startScroll = window.scrollY;
    const distance = targetScroll - startScroll;
    const duration = 3000; // 3 seconds
    const startTime = performance.now();
    
    const smoothScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      window.scrollTo(0, startScroll + distance * easeOut);
      
      if (progress < 1) {
        requestAnimationFrame(smoothScroll);
      }
    };
    
    requestAnimationFrame(smoothScroll);
  };

  useEffect(() => {
    if (!containerRef.current || !contentRef.current || !navRef.current || !smoothWrapperRef.current || !smoothContentRef.current || !circleRef.current) return;

    // Clear any existing scroll triggers
    ScrollTrigger.getAll().forEach(st => st.kill());

    // Enable scrolling for this page
    document.body.style.overflow = 'visible';
    document.body.style.position = 'static';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'visible';
    document.documentElement.style.height = 'auto';

    const ctx = gsap.context(() => {
      // Let CircleTransitionContext handle positioning

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
          end: window.innerWidth < 768 ? '+=150%' : '+=200%' // Mobile responsive
        }
      });

      // Phase 1: Circle scales from 480px to full screen (0% → 50%)
      const maxDimension = Math.max(window.innerWidth, window.innerHeight);
      tl.to(circleRef.current, {
        width: maxDimension * 1.5,
        height: maxDimension * 1.5,
        duration: 0.5,
        ease: 'power2.out'
      })
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
      // Kill all animations targeting the circle specifically
      if (circleRef.current) {
        gsap.killTweensOf(circleRef.current);
      }
      // Reset to default state when leaving this page
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    };
  }, []);

  return (
    <div ref={smoothWrapperRef} id="smooth-wrapper" style={{ height: '300vh' }}>
      <div ref={smoothContentRef} id="smooth-content">
        <section ref={containerRef} className="relative h-screen bg-white">
          {/* Pinned Navigation - Left Side Vertical Layout */}
          <nav ref={navRef} className="fixed left-0 top-0 h-full z-50 pointer-events-none">
            <div className="h-full flex flex-col justify-between py-8 pl-3" style={{ marginLeft: 'env(safe-area-inset-left, 0)' }}>
              {/* origen */}
              <div className="relative">
                <button 
                  onClick={handleAboutClick}
                  onMouseEnter={() => setShowOrigenText(true)}
                  onMouseLeave={() => setShowOrigenText(false)}
                  className="p-3 text-base font-medium text-black hover:text-[#ff6700] transition-colors pointer-events-auto touch-manipulation"
                >
                  origen
                </button>
                
                {/* Hover Text */}
                <div 
                  className={`absolute top-full left-0 mt-4 w-[40rem] max-w-2xl text-black text-base font-medium leading-relaxed pointer-events-none transition-opacity duration-300 z-50 ${
                    showOrigenText ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <p>
                    This lot was grown and milled on-site by Oscar Castro in Charalá, Colombia. Unlike most coffees, which pass through several stages before roasting, this one stayed close to the ground. Oscar handled both production and milling; we purchased directly, managed export and import independently, and roasted in New York. It's a vertically streamlined process built on trust, transparency, and shared effort.
                  </p>
                </div>
              </div>
              
              {/* about */}
              <button 
                onClick={() => handleNavigateWithFade('/about')}
                className="p-3 text-base font-medium text-black hover:text-[#ff6700] transition-colors pointer-events-auto touch-manipulation"
              >
                about
              </button>
              
              {/* coffee */}
              <button 
                onClick={() => handleNavigateWithFade('/coffee')}
                className="p-3 text-base font-medium text-black hover:text-[#ff6700] transition-colors pointer-events-auto touch-manipulation"
              >
                coffee
              </button>
              
              {/* timer */}
              <button 
                onClick={() => navigate('/timer')}
                className="p-3 text-base font-medium text-black hover:text-[#ff6700] transition-colors pointer-events-auto touch-manipulation"
              >
                timer
              </button>
            </div>
          </nav>

          {/* Content - Revealed After Full Orange */}
          <div 
            ref={contentRef} 
            className="absolute inset-0 flex flex-col items-center justify-center text-white z-40 px-6 pointer-events-none"
            style={{ opacity: 0 }}
          >
            {/* Simple paragraph instead of timeline */}
            <div className="text-center max-w-2xl">
              <p className="text-lg md:text-xl leading-relaxed">
                Welcome to the world of pour-over perfection. This is where coffee meets precision, 
                where every gram matters, and where your morning ritual becomes an art form. 
                Discover the tools, techniques, and passion that transform simple beans into extraordinary experiences.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FrontPage; 