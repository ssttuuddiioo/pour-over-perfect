import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { generateBrewPlan } from '../utils/brewingCalculations';

// Register the GSAP plugins once at module load.
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const FrontPage: React.FC = () => {
  const navigate = useNavigate();
  const [isBrewTimerActive, setIsBrewTimerActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepTimeRemaining, setStepTimeRemaining] = useState(0);
  const [currentBrewPlan, setCurrentBrewPlan] = useState<any>(null);
  const [showText, setShowText] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const smoothWrapperRef = useRef<HTMLDivElement>(null);
  const smoothContentRef = useRef<HTMLDivElement>(null);
  const stepTextRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Minimum size to accommodate text (roughly 300px to fit "bloom 25s 30g")
  const TEXT_TRIGGER_SIZE = 300;

  const handleAboutClick = () => {
    // Trigger slow scroll to reveal "It all started here"
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

  // Load cached brewing settings for the easter egg
  const getCachedBrewingSettings = () => {
    try {
      const savedSettings = localStorage.getItem('coffeeSettings');
      
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        return {
          coffeeAmount: (parsed.amount >= 1 && parsed.amount <= 50) ? parsed.amount : 15,
          waterRatio: (parsed.ratio >= 1 && parsed.ratio <= 50) ? parsed.ratio : 15,
          grindSize: 6 // Default grind size as it's not persisted
        };
      }
    } catch (e) {
      console.error('Error loading cached settings:', e);
    }
    
    // Default values if no cached settings
    return {
      coffeeAmount: 15,
      waterRatio: 15,
      grindSize: 6
    };
  };

  const handleCloseTimer = () => {
    window.location.reload();
  };

  // Get brewing plan from cached settings
  const getBrewingPlan = () => {
    const settings = getCachedBrewingSettings();
    return generateBrewPlan({
      dose: settings.coffeeAmount,
      ratio: settings.waterRatio,
      grindSize: settings.grindSize
    });
  };

  const handleCircleClick = () => {
    if (!isBrewTimerActive) {
      startBrewTimer();
    }
  };

  const startBrewTimer = () => {
    if (!circleRef.current) return;
    
    // By pausing ScrollSmoother, we don't need to kill the main scroll animation anymore.
    // ScrollTrigger.getAll().forEach(st => st.kill());
    gsap.killTweensOf(circleRef.current);
    
    // Reset circle to base size
    gsap.set(circleRef.current, {
      width: 60,
      height: 60,
      scale: 1
    });
    
    setIsBrewTimerActive(true);
    setCurrentStepIndex(0);
    setShowText(false);
    
    const brewPlan = getBrewingPlan();
    setCurrentBrewPlan(brewPlan);
    setStepTimeRemaining(brewPlan.steps[0]?.duration || 0);
    
    createBrewTimeline(brewPlan);
    startStepTimer(brewPlan);
    
    // Show text after 1 second
    setTimeout(() => {
      setShowText(true);
      // Wait for React to render the text element, then fade it in
      setTimeout(() => {
        if (stepTextRef.current) {
          gsap.fromTo(stepTextRef.current, 
            { opacity: 0 },
            { opacity: 1, duration: 0.6, ease: "power2.out" }
          );
        }
      }, 50); // Small delay to ensure DOM is updated
    }, 1000);
  };

  const createBrewTimeline = (brewPlan: any) => {
    if (!circleRef.current) return;
    
    const isDesktop = window.innerWidth >= 768;
    const maxSize = isDesktop ? window.innerHeight * 0.8 : window.innerWidth * 0.8;
    
    // Create a smooth timeline
    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(() => resetTimer(), 500); // Small delay before reset
      }
    });

    brewPlan.steps.forEach((step: any, index: number) => {
      const isPourStep = step.label.includes('Pour');
      const isBloom = step.label === 'Bloom';
      const isRest = step.label === 'Rest';
      const isDrawdown = step.label === 'Drawdown';
      
      if (isBloom) {
        // Special handling for bloom: 
        // First 15s: scale up to full size
        // Last 15s: scale down but never below TEXT_TRIGGER_SIZE
        const bloomDuration = step.duration;
        const halfBloom = bloomDuration / 2;
        
        // Scale up during first half (pouring water)
        tl.to(circleRef.current, {
          width: maxSize,
          height: maxSize,
          duration: halfBloom,
          ease: "power1.out"
        })
        // Scale down during second half but never below TEXT_TRIGGER_SIZE
        .to(circleRef.current, {
          width: TEXT_TRIGGER_SIZE,
          height: TEXT_TRIGGER_SIZE,
          duration: halfBloom,
          ease: "power1.in"
        });
        
      } else if (isPourStep) {
        // Pour steps: scale up for pouring
        tl.to(circleRef.current, {
          width: maxSize,
          height: maxSize,
          duration: Math.max(step.duration, 0.5),
          ease: "power1.out"
        });
        
      } else if (isRest) {
        // Rest periods: scale down but never below TEXT_TRIGGER_SIZE
        tl.to(circleRef.current, {
          width: TEXT_TRIGGER_SIZE,
          height: TEXT_TRIGGER_SIZE,
          duration: Math.max(step.duration, 0.5),
          ease: "power1.in"
        });
        
              } else if (isDrawdown) {
          // Final drawdown: return to original size (hide text first)
          tl.to(circleRef.current, {
            width: 60,
            height: 60,
            duration: Math.max(step.duration, 1.0),
            ease: "power2.inOut",
            onStart: function() {
              // Fade out text when scaling down to original size
              if (stepTextRef.current) {
                gsap.to(stepTextRef.current, {
                  opacity: 0,
                  duration: 0.4,
                  ease: "power2.in",
                  onComplete: function() {
                    setShowText(false);
                  }
                });
              } else {
                setShowText(false);
              }
            }
          });
        
      } else {
        // Default case: maintain TEXT_TRIGGER_SIZE
        tl.to(circleRef.current, {
          width: TEXT_TRIGGER_SIZE,
          height: TEXT_TRIGGER_SIZE,
          duration: Math.max(step.duration, 0.5),
          ease: "power2.inOut"
        });
      }
    });
  };

  const startStepTimer = (brewPlan: any) => {
    let currentStep = 0;
    let timeRemaining = brewPlan.steps[0]?.duration || 0;
    
    timerRef.current = setInterval(() => {
      timeRemaining -= 0.1;
      setStepTimeRemaining(Math.max(0, timeRemaining));
      
      if (timeRemaining <= 0) {
        currentStep++;
        if (currentStep < brewPlan.steps.length) {
          setCurrentStepIndex(currentStep);
          timeRemaining = brewPlan.steps[currentStep]?.duration || 0;
          setStepTimeRemaining(timeRemaining);
          
          // Fade in new step text smoothly
          if (stepTextRef.current && showText) {
            gsap.fromTo(stepTextRef.current, 
              { opacity: 0.5 },
              { opacity: 1, duration: 0.4, ease: "power2.out" }
            );
          }
        } else {
          // Timer complete
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          // Reset to base state after completion
          setTimeout(() => {
            resetTimer();
          }, 1000);
        }
      }
    }, 100);
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsBrewTimerActive(false);
    setCurrentStepIndex(0);
    setStepTimeRemaining(0);
    setCurrentBrewPlan(null);
    
    // Fade out text if it's showing
    if (showText && stepTextRef.current) {
      gsap.to(stepTextRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: function() {
          setShowText(false);
        }
      });
    } else {
      setShowText(false);
    }
    
    if (circleRef.current) {
      // Kill any ongoing animations
      gsap.killTweensOf(circleRef.current);
      
      gsap.to(circleRef.current, {
        width: 60,
        height: 60,
        duration: 0.8,
        ease: "power2.out"
      });
    }
    
    // Text will hide automatically via showText state
    
    // Re-enable scroll animations by triggering useEffect
    setTimeout(() => {
      // This will cause the useEffect to re-run and set up scroll animations again
      if (circleRef.current) {
        gsap.set(circleRef.current, {
          width: 60,
          height: 60,
          scale: 1
        });
      }
    }, 100);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (circleRef.current) {
        gsap.killTweensOf(circleRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const smoother = ScrollSmoother.get();
    if (smoother) {
      smoother.paused(isBrewTimerActive);
    }
  }, [isBrewTimerActive]);

  useEffect(() => {
    if (!containerRef.current || !circleRef.current || !contentRef.current || !navRef.current || !smoothWrapperRef.current || !smoothContentRef.current) return;

    // This effect should only run once to set up and tear down the main scroll animation.
    // We will pause/unpause the smoother instead of killing it.
    // if (isBrewTimerActive) return;

    // Clear any existing scroll triggers
    ScrollTrigger.getAll().forEach(st => st.kill());

    // Enable scrolling for this page - now with improved overflow handling
    document.body.style.overflow = 'visible';
    document.body.style.position = 'static';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'visible';
    document.documentElement.style.height = 'auto';

    // Reset circle to base state
    gsap.set(circleRef.current, {
      width: 60,
      height: 60,
      scale: 1
    });

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
          end: window.innerWidth < 768 ? '+=150%' : '+=200%' // Mobile responsive
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
          {/* Pinned Navigation - Corner Layout */}
          <nav ref={navRef} className="fixed inset-0 z-30 pointer-events-none">
            {/* Top Left */}
            <button 
              onClick={handleAboutClick}
              className="absolute top-3 left-3 p-3 text-base font-medium text-black hover:text-[#ff6700] transition-colors pointer-events-auto touch-manipulation"
              style={{ marginTop: 'env(safe-area-inset-top, 0)', marginLeft: 'env(safe-area-inset-left, 0)' }}
            >
              origen
            </button>
            
            {/* Top Right */}
            <Link 
              to="/coffee"
              className="absolute top-3 right-3 p-3 text-base font-medium text-black hover:text-[#ff6700] transition-colors pointer-events-auto touch-manipulation"
              style={{ marginTop: 'env(safe-area-inset-top, 0)', marginRight: 'env(safe-area-inset-right, 0)' }}
            >
              coffee
            </Link>
            
            {/* Bottom Left */}
            <Link 
              to="/timer"
              className="absolute bottom-3 left-3 p-3 text-base font-medium text-black hover:text-[#ff6700] transition-colors pointer-events-auto touch-manipulation"
              style={{ marginBottom: 'env(safe-area-inset-bottom, 0)', marginLeft: 'env(safe-area-inset-left, 0)' }}
            >
              timer
            </Link>
            
            {/* Bottom Right */}
            <Link 
              to="/about"
              className="absolute bottom-3 right-3 p-3 text-base font-medium text-black hover:text-[#ff6700] transition-colors pointer-events-auto touch-manipulation"
              style={{ marginBottom: 'env(safe-area-inset-bottom, 0)', marginRight: 'env(safe-area-inset-right, 0)' }}
            >
              about
            </Link>
          </nav>

          {/* Expanding Orange Circle - Clickable Easter Egg */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              ref={circleRef}
              className="rounded-full bg-[#FF6700] flex items-center justify-center relative cursor-pointer transition-colors duration-200 pointer-events-auto"
              style={{ width: 60, height: 60 }}
              onClick={handleCircleClick}
              title="Click for a brewing surprise..."
            >
              {/* Step Text - positioned in center of circle */}
              {isBrewTimerActive && currentBrewPlan && showText && (
                <div 
                  ref={stepTextRef}
                  className="absolute inset-0 flex items-center justify-center text-white font-medium pointer-events-none"
                >
                  <div className="flex items-center justify-center space-x-3 md:space-x-4">
                    {/* Step name */}
                    <div className="text-sm md:text-lg lowercase">
                      {currentBrewPlan.steps[currentStepIndex]?.label?.toLowerCase() || 'step'}
                    </div>
                    
                    {/* Countdown timer */}
                    <div className="text-sm md:text-lg">
                      {Math.ceil(stepTimeRemaining)}s
                    </div>
                    
                    {/* Water amount */}
                    <div className="text-sm md:text-lg">
                      {(() => {
                        const currentStep = currentBrewPlan.steps[currentStepIndex];
                        if (!currentStep) return '0g';
                        
                        // Calculate water amount for this specific step
                        const prevStep = currentStepIndex > 0 ? currentBrewPlan.steps[currentStepIndex - 1] : null;
                        const stepWater = currentStep.targetWater - (prevStep?.targetWater || 0);
                        return `${stepWater}g`;
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Close button for the timer */}
          {isBrewTimerActive && (
            <button
              onClick={handleCloseTimer}
              className="fixed bottom-6 z-30 text-black text-base font-medium transition-colors hover:opacity-70"
              style={{
                left: '50%',
                transform: 'translateX(-50%)',
                mixBlendMode: 'difference',
                filter: 'invert(1)',
              }}
              aria-label="Close timer"
            >
              x
            </button>
          )}

          {/* Story Content - Revealed After Full Orange */}
          <div 
            ref={contentRef} 
            className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 px-6 pointer-events-none"
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