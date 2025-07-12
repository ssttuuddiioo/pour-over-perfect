import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { generateBrewPlan } from '../utils/brewingCalculations';

const CalmPage: React.FC = () => {
  const [isBrewTimerActive, setIsBrewTimerActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepTimeRemaining, setStepTimeRemaining] = useState(0);
  const [currentBrewPlan, setCurrentBrewPlan] = useState<any>(null);
  const [showText, setShowText] = useState(false);
  
  const circleRef = useRef<HTMLDivElement>(null);
  const stepTextRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Minimum size to accommodate text (roughly 300px to fit "bloom 25s 30g")
  const TEXT_TRIGGER_SIZE = 300;

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
        scale: 1,
        duration: 1.0,
        ease: "power2.inOut"
      });
    }
  };

  // Initialize circle on mount
  useEffect(() => {
    if (circleRef.current) {
      gsap.set(circleRef.current, {
        width: 480,
        height: 480,
        scale: 1
      });
    }
  }, []);

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

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-white">
      <div className="text-center space-y-8">
        <h1 className="text-2xl font-bold text-black mb-8">Calm</h1>
        
        {/* Brewing Circle */}
        <div className="relative">
          <div
            ref={circleRef}
            className="rounded-full bg-[#FF6700] flex items-center justify-center relative cursor-pointer transition-colors duration-200 mx-auto"
            style={{ width: 480, height: 480 }}
            onClick={handleCircleClick}
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
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 text-black text-base font-medium transition-colors hover:opacity-70"
            aria-label="Close timer"
          >
            x
          </button>
        )}

        <p className="text-lg text-gray-600 max-w-md">
          Click the circle to start a brewing timer based on your saved settings.
        </p>

        <Link 
          to="/" 
          className="inline-block text-sm text-gray-600 hover:text-black underline"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default CalmPage; 