import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCircleTransition } from '../context/CircleTransitionContext';
import { supabase } from '../lib/supabase';
import { formatTime } from '../utils/brewingCalculations';
import { CoffeeSettings } from '../types/brewing';
import { useBrewTimer } from '../hooks/useBrewTimer';
import AppleStylePicker from './AppleStylePicker';
import Navigation from './shared/Navigation';

gsap.registerPlugin(ScrollTrigger);

const HomePage: React.FC = () => {
  const { circleRef } = useCircleTransition();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Story slides state
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const storyContainerRef = useRef<HTMLDivElement>(null);
  const storyImagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const storyTextsRef = useRef<(HTMLDivElement | null)[]>([]);

  const storySlides = [
    { src: '/photo-final/01.png', text: 'February 11, 2024, at the start of Transcordilleras, completely unaware of what it takes to traverse the Andes mountains in 7 days.' },
    { src: '/photo-final/02.png', text: 'The sunset I saw before riding into Charala, not knowing what new adventure awaited.' },
    { src: '/photo-final/03.png', text: 'I turned in my tracker and withdrew from the race. Without a plan I decided to stay in town for a bit. Charalá, Santander is a quiet town nestled in Colombia\'s eastern Andes mountains, known for its rich coffee and a spirit of resilience that lingers in the land and its people.' },
    { src: '/photo-final/04.png', text: 'So much coffee being traded in the town square' },
    { src: '/photo-final/05.png', text: 'Oscar and his family with a recent harvest on his farm Bellavista' },
    { src: '/photo-final/06.png', text: 'Bellavista, sits at 1,900 meters above sea level, where Oscar works a few hectares of land with his family and neighbors, pooling coffee and banana harvests to sell in town.' },
    { src: '/photo-final/07.png', text: 'I was lucky enough to see the flowering of the coffee plant, which lasts only a few days, the flowers then wither and fall off after pollination before cherries begin to grow' },
    { src: '/photo-final/08.png', text: 'After visiting Oscar, I rode back to Bogotá at my own pace, stopping to take in the views. This is in Villa de Leyva!' },
    { src: '/photo-final/09.png', text: 'In March 2025 (a full harvest and half later, and a year after my visit to Bellavista), I shipped a small amount form Oscar\'s farm to my apartment in Brooklyn.' },
    { src: '/photo-final/10.jpeg', text: 'The coffee came with it\'s parchment on! Which is rare and there is virtually no equipment to hull coffee in the US so we had to do it all by hand, what an experience!' },
    { src: '/photo-final/11.png', text: 'I found an amazing community based roaster in Queens called Multimodal that supports smaller roasters and enthusiasts with the resources to make a great cup' },
    { src: '/photo-final/12.png', text: 'After a small roast I was able to sell about 20 bags to friends and family.' },
    { src: '/photo-final/13.png', text: 'Than branding is as minimalist as possible to focus on the coffee itself and its origin while being as transparent as possible' },
    { src: '/photo-final/14.png', text: 'The first packages being sent out to friends in all corners of the country. LA, SF, Seattle, Atlanta, and Miami' },
    { src: '/photo-final/15.png', text: 'For orders in NY I hand delivered on my bike, completing a full circle!' },
  ];

  // Timer state
  const [coffeeSettings, setCoffeeSettings] = useState<CoffeeSettings>(() => {
    const savedSettings = localStorage.getItem('coffeeSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return {
          amount: 18.0,
          ratio: (parsed.ratio >= 1 && parsed.ratio <= 50) ? parsed.ratio : 16.5,
          bloomRatio: parsed.bloomRatio || 2
        };
      } catch (e) {
        // Silently fallback to defaults
      }
    }
    return { amount: 18.0, ratio: 16.5, bloomRatio: 2 };
  });
  const [grindSize, setGrindSize] = useState(6);
  const [showNotesTooltip, setShowNotesTooltip] = useState(false);

  const {
    elapsed,
    currentStep,
    isRunning,
    isFinished,
    showBrewTimer,
    stepSequence,
    stepEndTimes,
    totalTime,
    brewingTimings,
    start: handleStartBrew,
    pause: handleTimerPause,
    resume: handleTimerStart,
    done: handleTimerDone,
  } = useBrewTimer({ coffeeSettings, grindSize });

  useEffect(() => {
    localStorage.setItem('coffeeSettings', JSON.stringify(coffeeSettings));
  }, [coffeeSettings]);

  // Handle email subscription
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Save email to Supabase
      const { error } = await supabase
        .from('origen emails')
        .insert([{ email: email }]);

      if (error) {
        alert('There was an error subscribing. Please try again.');
        return;
      }

      setSubmitted(true);
      setEmail(''); // Clear the input
    } catch (error) {
      alert('There was an error subscribing. Please try again.');
    }
  };


  // Story slide animation
  const animateToSlide = useCallback((index: number) => {
    storyImagesRef.current.forEach((img, imgIndex) => {
      if (img) {
        const slideIndex = imgIndex < storySlides.length ? imgIndex : imgIndex - storySlides.length;
        gsap.to(img, { opacity: slideIndex === index ? 1 : 0, duration: 0.6, ease: 'power2.out' });
      }
    });
    storyTextsRef.current.forEach((text, textIndex) => {
      if (text) {
        const slideIndex = textIndex < storySlides.length ? textIndex : textIndex - storySlides.length;
        gsap.to(text, { opacity: slideIndex === index ? 1 : 0, y: slideIndex === index ? 0 : 10, duration: 0.6, ease: 'power2.out' });
      }
    });
    // Also grow the cursor-following circle as slides advance
    if (circleRef.current) {
      const progress = index / (storySlides.length - 1);
      const homeSize = sectionConfigs[0].size;
      const targetSize = sectionConfigs[1].size; // grow toward coffee section size
      const homeScale = sectionConfigs[0].scale;
      const targetScale = sectionConfigs[1].scale;
      const size = homeSize + (targetSize - homeSize) * progress;
      const cursorScale = homeScale + (targetScale - homeScale) * progress;
      gsap.to(circleRef.current, {
        width: size,
        height: size,
        scale: cursorScale,
        duration: 0.8,
        ease: 'power2.out'
      });
    }
  }, [storySlides.length]);

  useEffect(() => { animateToSlide(currentStoryIndex); }, [currentStoryIndex, animateToSlide]);

  const showNextStory = useCallback(() => {
    setCurrentStoryIndex(prev => (prev === storySlides.length - 1 ? 0 : prev + 1));
  }, [storySlides.length]);

  const showPrevStory = useCallback(() => {
    setCurrentStoryIndex(prev => (prev === 0 ? storySlides.length - 1 : prev - 1));
  }, [storySlides.length]);

  const changeStory = (index: number) => {
    if (index === currentStoryIndex) return;
    setCurrentStoryIndex(index);
  };

  // Initialize story ref arrays
  useEffect(() => {
    storyImagesRef.current = new Array(storySlides.length * 2).fill(null);
    storyTextsRef.current = new Array(storySlides.length * 2).fill(null);
  }, []);






  
  // Pinning refs for coffee section
  const coffeeSectionRef = useRef<HTMLElement>(null);
  const coffeeTextRef = useRef<HTMLDivElement>(null);
  
  // Pinning refs for buy section
  const buySectionRef = useRef<HTMLElement>(null);
  const buyTextRef = useRef<HTMLDivElement>(null);


  // Reset to landing page: scroll to top, restore circle
  const resetToLanding = () => {
    setActiveSection('home');
    // Smooth scroll to the top/landing
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Restore circle to initial state
    if (circleRef.current) {
      const initialConfig = sectionConfigs[0];
      gsap.set(circleRef.current, {
        width: initialConfig.size,
        height: initialConfig.size,
        scale: initialConfig.scale,
        position: 'fixed',
        left: '50%',
        top: '50%',
        xPercent: -50,
        yPercent: -50,
        transform: 'translate(-50%, -50%)',
        transformOrigin: 'center center',
        zIndex: 30,
        opacity: 1,
        visibility: 'visible',
        display: 'flex'
      });
    }
  };

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // For coffee section, account for the pinning offset
      if (sectionId === 'coffee') {
        const rect = element.getBoundingClientRect();
        const currentScrollY = window.scrollY;
        const targetScrollY = currentScrollY + rect.top + 100; // +100px to match "top -100px" trigger
        
        window.scrollTo({
          top: targetScrollY,
          behavior: 'smooth'
        });
      } else {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Section configurations for circle animation - 1.5x larger
  const sectionConfigs = [
    { id: 'home', size: 840, scale: 0.2 },
    { id: 'coffee', size: 840, scale: 0.333 },
    { id: 'buy', size: 840, scale: 0.467 },
    { id: 'timer', size: 840, scale: 0.6 }
  ];

  // Mouse tracking state
  const mousePosition = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });
  const isPinned = useRef(false);
  const pinnedPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!circleRef.current) return;
    
    // Common initialization function - always center and make immediately visible
    const initializeCircle = () => {
      const firstConfig = sectionConfigs[0];
      gsap.set(circleRef.current, {
        // Size and scale - start at landing size
        width: firstConfig.size,
        height: firstConfig.size,
        scale: firstConfig.scale,
        // Positioning - FIXED in center
        position: "fixed",
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        transform: "translate(-50%, -50%)",
        transformOrigin: "center center",
        // Layer positioning - above page content (z-20)
        zIndex: 30,
        // Performance optimizations
        force3D: true,
        willChange: "transform, width, height",
        backfaceVisibility: "hidden",
        perspective: 1000,
        // Ensure immediate visibility
        opacity: 1,
        visibility: "visible",
        display: "flex"
      });
    };
    
    // Initialize circle immediately to prevent white screen
    initializeCircle();
    
    // Mouse tracking - smooth follow effect
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPinned.current) {
        mousePosition.current = {
          x: e.clientX,
          y: e.clientY
        };
      }
    };

    // Click to toggle pin/unpin circle position
    const handleClick = (e: MouseEvent) => {
      if (isPinned.current) {
        // Unpin - circle will start following mouse again
        isPinned.current = false;
      } else {
        // Pin at current click location
        isPinned.current = true;
        pinnedPosition.current = {
          x: e.clientX,
          y: e.clientY
        };
        targetPosition.current = { ...pinnedPosition.current };
        mousePosition.current = { ...pinnedPosition.current };
      }
    };

    // Smooth animation loop for mouse following
    const animateCirclePosition = () => {
      if (!circleRef.current) return;
      
      // Lerp (linear interpolation) for smooth following
      const lerp = (start: number, end: number, factor: number) => {
        return start + (end - start) * factor;
      };
      
      // Use pinned position if pinned, otherwise follow mouse
      const targetX = isPinned.current ? pinnedPosition.current.x : mousePosition.current.x;
      const targetY = isPinned.current ? pinnedPosition.current.y : mousePosition.current.y;
      
      // Smoothly interpolate towards target position
      targetPosition.current.x = lerp(targetPosition.current.x, targetX, isPinned.current ? 1 : 0.1);
      targetPosition.current.y = lerp(targetPosition.current.y, targetY, isPinned.current ? 1 : 0.1);
      
      // Fade circle opacity based on vertical position: 100% at top, 0% at 50% down
      const yFraction = targetPosition.current.y / window.innerHeight;
      const circleOpacity = yFraction >= 0.5 ? 0 : 1 - (yFraction / 0.5);

      // Apply position with offset to keep circle centered on cursor
      gsap.set(circleRef.current, {
        left: targetPosition.current.x,
        top: targetPosition.current.y,
        xPercent: -50,
        yPercent: -50,
        opacity: circleOpacity
      });

      requestAnimationFrame(animateCirclePosition);
    };
    
    // Start mouse tracking
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    const animationFrame = requestAnimationFrame(animateCirclePosition);
    
    // Initialize target position to center of screen
    targetPosition.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
    mousePosition.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
    
    // Set up progressive circle resizing based on scroll position
    // Uses element-position-based mapping so sections of different heights
    // (e.g. the tall story-scroll section) don't distort the circle animation.
    const updateCircleFromScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;

      let currentConfig = sectionConfigs[0];
      let nextConfig = sectionConfigs[Math.min(1, sectionConfigs.length - 1)];
      let sectionProgress = 0;

      for (let i = 0; i < sectionConfigs.length; i++) {
        const el = document.getElementById(sectionConfigs[i].id);
        const nextEl = i < sectionConfigs.length - 1
          ? document.getElementById(sectionConfigs[i + 1].id)
          : null;
        if (!el) continue;

        const elTop = el.offsetTop;
        const elBottom = nextEl ? nextEl.offsetTop : totalHeight;

        if (scrollY >= elTop && scrollY < elBottom) {
          currentConfig = sectionConfigs[i];
          nextConfig = sectionConfigs[Math.min(i + 1, sectionConfigs.length - 1)];
          sectionProgress = Math.min((scrollY - elTop) / Math.max(elBottom - elTop, 1), 1);
          break;
        }
      }

      // If scrolled past all sections, use the last config
      if (scrollY >= totalHeight) {
        currentConfig = sectionConfigs[sectionConfigs.length - 1];
        nextConfig = currentConfig;
        sectionProgress = 1;
      }

      const size = gsap.utils.interpolate(currentConfig.size, nextConfig.size, sectionProgress);
      const scale = gsap.utils.interpolate(currentConfig.scale, nextConfig.scale, sectionProgress);

      gsap.set(circleRef.current, {
        width: size,
        height: size,
        scale: scale,
        force3D: true
      });
    };

    ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: updateCircleFromScroll,
      onRefresh: updateCircleFromScroll
    });

    // Set up section detection for navigation
    sectionConfigs.forEach((config) => {
      const element = document.getElementById(config.id);
      if (!element) return;

      ScrollTrigger.create({
        trigger: element,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          setActiveSection(config.id);
        },
        onEnterBack: () => {
          setActiveSection(config.id);
        }
      });
    });

    // Set up content animations for desktop
    sectionConfigs.forEach((config) => {
      const element = document.getElementById(config.id);
      if (!element) return;

      const content = element.querySelectorAll('.section-content');
      if (content.length > 0) {
        gsap.fromTo(content, 
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start: "top 60%",
              end: "top 40%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    });

    // Initialize with first section
    setActiveSection('home');
    
    // Set up pinning for coffee section (desktop only)
    const isMobile = window.innerWidth < 768;
    if (coffeeSectionRef.current && coffeeTextRef.current && !isMobile) {
      ScrollTrigger.create({
        trigger: coffeeSectionRef.current,
        start: "top -100px",
        end: "bottom bottom",
        pin: coffeeTextRef.current,
        pinSpacing: false
      });
    }

    // Set up pinning for buy section (desktop only)
    if (buySectionRef.current && buyTextRef.current && !isMobile) {
      ScrollTrigger.create({
        trigger: buySectionRef.current,
        start: "top -100px",
        end: "bottom bottom",
        pin: buyTextRef.current,
        pinSpacing: false
      });
    }

    // Ensure ScrollTrigger corrects the initial size immediately
    gsap.delayedCall(0.01, () => {
      ScrollTrigger.refresh();
    });

    return () => {
      // Cleanup mouse tracking
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrame);
      
      // Cleanup ScrollTriggers
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Global Escape to reset
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        resetToLanding();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Sections */}
      <div className="scroll-smooth">
        {/* Story Landing Section */}
        <section id="home">
          <div ref={storyContainerRef} className="relative w-full bg-white overflow-hidden">

            {/* Desktop Layout */}
            <div className="hidden md:grid w-full grid-cols-2 gap-0 pt-20">
              {/* Left Side - Tick marks + Image */}
              <div className="relative bg-white p-12" style={{ paddingLeft: '140px', minHeight: '70vh' }}>
                {/* Vertical tick marks - centered between left edge and image */}
                <div className="absolute top-0 bottom-0 flex flex-col items-center justify-center" style={{ left: '70px' }}>
                  <div className="flex flex-col items-center gap-3">
                    {storySlides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => changeStory(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`transition-all duration-300 ${
                          idx === currentStoryIndex
                            ? 'bg-orange-500 w-2.5 h-2.5'
                            : 'bg-gray-300 hover:bg-gray-400 w-1.5 h-4'
                        }`}
                        style={{ borderRadius: idx === currentStoryIndex ? '50%' : '1px' }}
                      />
                    ))}
                  </div>
                </div>
                {storySlides.map((slide, index) => (
                  <div
                    key={index}
                    ref={el => { storyImagesRef.current[index] = el; }}
                    className="absolute"
                    style={{ top: '80px', right: '80px', bottom: '80px', left: '140px', opacity: index === 0 ? 1 : 0 }}
                  >
                    <img src={slide.src} alt={`story image ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                  </div>
                ))}
              </div>

              {/* Right Side - Content */}
              <div className="relative bg-white flex flex-col justify-center" style={{ paddingLeft: '48px', paddingRight: '48px' }}>
                {/* Text Content */}
                <div className="relative" style={{ minHeight: '300px', marginTop: '200px' }}>
                  {storySlides.map((slide, index) => (
                    <div
                      key={index}
                      ref={el => { storyTextsRef.current[index] = el; }}
                      className="absolute inset-x-0"
                      style={{ opacity: index === 0 ? 1 : 0 }}
                    >
                      <p className="text-black leading-relaxed max-w-xl" style={{ fontSize: '21pt', lineHeight: '29pt' }}>
                        {slide.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Prev/Next Controls - bottom right */}
                <div className="absolute bottom-8 right-12 flex items-center space-x-2">
                  <button onClick={showPrevStory} aria-label="Previous slide" className="font-bold text-black border border-black px-3 py-1 hover:bg-black hover:text-white transition-all duration-200 uppercase tracking-wide" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                    PREV
                  </button>
                  <button onClick={showNextStory} aria-label="Next slide" className="font-bold text-black border border-black px-3 py-1 hover:bg-black hover:text-white transition-all duration-200 uppercase tracking-wide" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                    NEXT
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden w-full flex flex-col pt-20" style={{ minHeight: '80vh' }}>
              {/* Image Section */}
              <div className="relative bg-white px-6 py-3 flex-1">
                {storySlides.map((slide, index) => (
                  <div
                    key={index}
                    ref={el => { storyImagesRef.current[storySlides.length + index] = el; }}
                    className="absolute inset-6"
                    style={{ opacity: index === 0 ? 1 : 0 }}
                  >
                    <img src={slide.src} alt={`story image ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                  </div>
                ))}
              </div>

              {/* Bottom Section - Circle + Text + Controls */}
              <div className="bg-white px-6 pb-6">
                <div className="py-6" />

                <div className="relative mb-6 px-2" style={{ minHeight: '140px' }}>
                  {storySlides.map((slide, index) => (
                    <div
                      key={index}
                      ref={el => { storyTextsRef.current[storySlides.length + index] = el; }}
                      className="absolute inset-x-2 inset-y-0"
                      style={{ opacity: index === 0 ? 1 : 0 }}
                    >
                      <p className="text-black leading-relaxed text-center" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                        {slide.text}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    <button onClick={showPrevStory} aria-label="Previous slide" className="font-bold text-black border border-black px-3 py-2 hover:bg-black hover:text-white transition-all duration-200 uppercase tracking-wide" style={{ fontSize: '9pt', lineHeight: '13pt' }}>
                      PREV
                    </button>
                    <button onClick={showNextStory} aria-label="Next slide" className="font-bold text-black border border-black px-3 py-2 hover:bg-black hover:text-white transition-all duration-200 uppercase tracking-wide" style={{ fontSize: '9pt', lineHeight: '13pt' }}>
                      NEXT
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {storySlides.map((_, idx) => (
                      <button key={idx} onClick={() => changeStory(idx)} aria-label={`Go to slide ${idx + 1}`} className={`w-3 h-3 rounded-full transition-all ${idx === currentStoryIndex ? 'bg-orange-500' : 'bg-gray-300 hover:bg-gray-400'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Fixed Navigation at Top */}
        <Navigation onScrollToSection={scrollToSection} variant="homepage" />

        {/* Spacer between story and coffee */}
        <section className="w-full" style={{ height: '100px' }}>
        </section>

        {/* Coffee Section */}
        <section ref={coffeeSectionRef} id="coffee" className="text-black relative pt-20 md:min-h-[300vh]">
          <div ref={coffeeTextRef} className="w-full min-h-screen md:min-h-screen flex flex-col items-start justify-center px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 mb-12 md:mb-0" style={{ zIndex: 2 }}>
            <div className="max-w-4xl w-full relative text-left" style={{ zIndex: 2 }}>
              <div className="text-black leading-relaxed space-y-4 sm:space-y-6 md:space-y-8">
                <div className="section-content" style={{ lineHeight: '14pt' }}>
                  {/* Title and Description Box */}
                  <div className="border border-black mb-6 p-4 sm:p-5 md:p-6">
                    <h2 className="font-bold uppercase tracking-wide text-left mb-3 sm:mb-4 text-xs sm:text-sm">
                      NOTES
                    </h2>
                    <p className="text-black text-xs sm:text-sm leading-relaxed">
                      Delicate florals, orchard-fruit sweetness, crisp clean finish. Sourced and roasted by Origen at Multimodal, a collective-oriented shared-roaster in New York.
                    </p>
                  </div>

                  {/* Coffee Information Grid - Responsive */}
                  <div className="grid gap-0 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    
                    {/* Producer Card */}
                    <div className="border border-black p-4 sm:p-5">
                      <h3 className="font-bold uppercase tracking-wide text-left mb-3 sm:mb-4 text-xs sm:text-sm">
                        PRODUCER
                      </h3>
                      <div className="space-y-2">
                        <p className="text-black text-xs sm:text-sm">
                          <span className="font-bold">Oscar Castro</span>
                        </p>
                        <p className="text-black text-xs sm:text-sm">
                          Finca Bellavista
                        </p>
                        <p className="text-black text-xs sm:text-sm">
                          Charalá, Santander, Colombia
                        </p>
                        <p className="text-black text-xs sm:text-sm">
                          Altitude: 1,900 MASL
                        </p>
                      </div>
                    </div>

                    {/* Variety Card */}
                    <div className="border border-black sm:border-l-0 border-t-0 sm:border-t p-4 sm:p-5">
                      <h3 className="font-bold uppercase tracking-wide text-left mb-3 sm:mb-4 text-xs sm:text-sm">
                        VARIETY & PROCESS
                      </h3>
                      <div className="space-y-2">
                        <p className="text-black text-xs sm:text-sm">
                          <span className="font-bold">Castillo</span>
                        </p>
                        <p className="text-black text-xs sm:text-sm">
                          Washed
                        </p>
                        <p className="text-black text-xs sm:text-sm">
                          Fermented 36 hours
                        </p>
                    </div>
                  </div>

                    {/* Harvest & Lot Card */}
                    <div className="border border-black md:border-l-0 border-t-0 p-4 sm:p-5">
                      <h3 className="font-bold uppercase tracking-wide text-left mb-3 sm:mb-4 text-xs sm:text-sm">
                        HARVEST & LOT
                      </h3>
                      <div className="space-y-2">
                        <p className="text-black text-xs sm:text-sm">
                          <span className="font-bold">May 2025</span>
                        </p>
                        <p className="text-black text-xs sm:text-sm">
                          <span className="font-bold">50kg</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Supply Chain Card */}
                  <div className="border border-black border-t-0 p-4 sm:p-5 md:p-6">
                    <h3 className="font-bold uppercase tracking-wide text-left mb-4 sm:mb-6 text-xs sm:text-sm">
                      SUPPLY CHAIN
                    </h3>
                    <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4">
                      <div className="space-y-1">
                        <p className="font-medium uppercase tracking-widest text-black text-xs">
                          FARM
                        </p>
                        <p className="text-black text-xs sm:text-sm">
                          <span className="font-bold">Bellavista</span>
                        </p>
                        <p className="text-black text-xs sm:text-sm">
                          <span className="font-bold">$448.55</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium uppercase tracking-widest text-black text-xs">
                          MILL AND EXPORT
                        </p>
                        <p className="text-black text-xs sm:text-sm">
                          <span className="font-bold">Cafe Semilla</span>
                        </p>
                        <p className="text-black text-xs sm:text-sm">
                          <span className="font-bold">$400</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium uppercase tracking-widest text-black text-xs">
                          PACKAGING
                        </p>
                        <p className="text-black text-xs sm:text-sm">
                          <span className="font-bold">-</span>
                        </p>
                        <p className="text-black text-xs sm:text-sm">
                          <span className="font-bold">TBD</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium uppercase tracking-widest text-black text-xs">
                          COGS
                        </p>
                        <p className="text-black text-xs sm:text-sm">
                          <span className="font-bold">Total</span>
                        </p>
                        <p className="text-black text-xs sm:text-sm">
                          <span className="font-bold">TBD</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Buy Section */}
        <section ref={buySectionRef} id="buy" className="text-black relative pt-20 md:min-h-[300vh]">
          {/* Pinned content container */}
          <div ref={buyTextRef} className="w-full min-h-screen md:min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-12 mb-12 md:mb-0 relative" style={{ zIndex: 2 }}>
            <div className="max-w-6xl w-full relative">
              <div className="grid gap-0 grid-cols-1 md:grid-cols-2" style={{ height: 'auto', minHeight: '50vh' }}>
                
                {/* Subscribe Section - Left */}
                <div className="border border-black flex flex-col justify-center p-6 sm:p-8 md:p-10">
                  <div>
                    <p className="text-black mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base md:text-lg">
                      Get added to the list, and we'll reach out when the roast is ready for pre-order.
                    </p>
                    
                    {!submitted ? (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="w-full px-0 py-3 sm:py-4 placeholder-gray-500 text-black bg-transparent border-0 border-b-2 border-black focus:border-black focus:outline-none focus:ring-0 text-base sm:text-lg"
                          />
                        </div>
                        <button
                          type="submit"
                          className="font-bold text-black border-2 border-black px-6 sm:px-8 py-2 sm:py-3 hover:bg-black hover:text-white transition-all duration-200 uppercase tracking-wide text-xs sm:text-sm"
                        >
                          Subscribe
                        </button>
                      </form>
                    ) : (
                      <div className="py-4">
                        <p className="text-black text-base sm:text-lg">
                          <span className="font-bold">Thanks for subscribing!</span> We'll keep you updated.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Image - Right - Hidden on mobile */}
                <div className="hidden md:flex border border-black border-l-0 items-center justify-center p-8">
                  <img 
                    src="/photos/31.jpeg" 
                    alt="Coffee Package"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timer Section */}
        <section id="timer" className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-20 bg-white relative" style={{ marginTop: '20vh' }}>
          <div className="w-full max-w-[430px] mx-auto">
            {!showBrewTimer ? (
              // Timer Configuration
              <main className="flex-1 space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-xs text-black">Target Time</span>
                    <div className="h-12 w-full flex items-center justify-center rounded-lg bg-gray-100">
                      <span className="text-2xl font-normal text-black">{formatTime(brewingTimings.totalTime)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-xs text-black">Target Water</span>
                    <div className="h-12 w-full flex items-center justify-center rounded-lg bg-gray-100">
                      <span className="text-2xl font-normal text-black">{Math.round(coffeeSettings.amount * coffeeSettings.ratio)}g</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10 pb-1 px-2">
                  <div className="flex flex-col items-center">
                    <AppleStylePicker value={coffeeSettings.amount} onChange={(amount) => setCoffeeSettings(prev => ({ ...prev, amount }))} isDarkMode={false} label="Coffee (g)" />
                  </div>
                  <div className="flex flex-col items-center">
                    <AppleStylePicker value={coffeeSettings.ratio} onChange={(ratio) => setCoffeeSettings(prev => ({ ...prev, ratio }))} isDarkMode={false} label="Ratio" />
                  </div>
                </div>

                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-black">Grind Size</span>
                    <span className="text-sm text-black">{grindSize.toFixed(1)}</span>
                  </div>
                  <div className="w-full relative">
                    <div className="absolute w-full -top-3 flex justify-between">
                      {Array.from({ length: 11 }, (_, i) => (
                        <div key={i + 1} className="flex flex-col items-center">
                          <div className="w-px h-2 bg-gray-500" />
                          <span className="text-xs mt-1 text-gray-500">{i + 1}</span>
                        </div>
                      ))}
                    </div>
                    <div className="w-full relative h-1 mt-6">
                      <div className="w-full h-1 rounded-full transition-all duration-150 ease-out" style={{ background: `linear-gradient(to right, #ff6700 0%, #ff6700 ${(grindSize - 1) * 10}%, #d1d5db ${(grindSize - 1) * 10}%, #d1d5db 100%)` }}/>
                      <input type="range" min="1" max="11" step="0.1" value={grindSize} onChange={(e) => setGrindSize(Number(e.target.value))} className="absolute top-0 w-full h-4 -mt-1.5 appearance-none cursor-pointer bg-transparent simple-slider" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <button 
                      onClick={() => {
                        setShowNotesTooltip(true);
                        setTimeout(() => setShowNotesTooltip(false), 2000);
                      }} 
                      className="h-12 w-full flex items-center justify-center rounded-lg transition-colors hover:opacity-80 bg-gray-100"
                    >
                      <span className="text-2xl font-normal text-black">Notes</span>
                    </button>
                    {showNotesTooltip && (
                      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-3 rounded whitespace-nowrap">
                        Feature coming soon
                      </div>
                    )}
                  </div>
                  <button onClick={handleStartBrew} className="h-12 w-full flex items-center justify-center rounded-lg transition-colors hover:opacity-80 bg-gray-100">
                    <span className="text-2xl font-normal text-black">Ready</span>
                  </button>
                </div>
              </main>
            ) : (
              // Active Brewing Timer
              <div className="flex flex-col w-full">
                {/* Top Info Bar */}
                <div className="flex justify-between items-end mb-6 w-full">
                  <div className="flex flex-col items-start">
                    <div className="text-xs uppercase tracking-wider text-gray-400">Target time</div>
                    <div className="text-2xl font-light mt-1 text-black">{formatTime(totalTime)}</div>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="text-xs uppercase tracking-wider text-gray-400">Time left</div>
                    <div className="text-2xl font-light mt-1 text-black">{formatTime(Math.ceil(Math.max(0, totalTime - elapsed)))}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-xs uppercase tracking-wider text-gray-400">Current step</div>
                    <div className="text-2xl font-light mt-1 text-black">{Math.ceil(Math.max(0, (stepEndTimes[currentStep] || 0) - elapsed))}s</div>
                  </div>
                </div>

                {/* Step List */}
                <div className="relative overflow-y-auto mb-12" style={{ minHeight: 206, maxHeight: 'calc(100vh - 400px)' }}>
                  <div className="space-y-1">
                    {stepSequence.slice(0, -1).map((step, index) => {
                      const isActive = index === currentStep;
                      const isCompleted = elapsed >= (stepEndTimes[index] || 0);
                      const stepStart = index === 0 ? 0 : stepEndTimes[index - 1];
                      const stepEnd = stepEndTimes[index] || 0;
                      const stepDuration = Math.max(0, stepEnd - stepStart);
                      const stepElapsed = Math.max(0, elapsed - stepStart);
                      const stepProgress = stepDuration > 0 ? Math.min((stepElapsed / stepDuration) * 100, 100) : 0;
                      const targetWeight = step.water.includes('Pour to') ? step.water.replace('Pour to ', '') : '';
                      
                      return (
                        <div
                          key={index}
                          className={`py-3 px-3 rounded-lg transition-all ${
                            isActive ? 'bg-orange-50 border border-orange-500' : ''
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span style={{ color: isCompleted ? 'rgba(0,0,0,0.5)' : '#000', fontWeight: isActive ? 600 : 400 }}>
                              {step.label}
                            </span>
                            <span style={{ color: isCompleted ? 'rgba(0,0,0,0.5)' : '#000', fontWeight: isActive ? 600 : 400 }}>
                              {targetWeight || `${Math.round(stepDuration)}s`}
                            </span>
                          </div>
                          {index < stepSequence.length - 2 && isActive && !isCompleted && (
                            <div className="relative w-full mt-2 h-[2px] bg-gray-200 rounded">
                              <div 
                                className="absolute top-0 h-[2px] bg-orange-500 rounded transition-all duration-100"
                                style={{ width: `${stepProgress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex w-full justify-between gap-4">
                  <button onClick={handleTimerDone} className="py-3 px-8 flex-1 rounded-full text-base font-medium transition-colors text-black hover:bg-gray-50 bg-gray-100">
                    Done
                  </button>
                  <button 
                    onClick={isRunning ? handleTimerPause : handleTimerStart} 
                    className="py-3 px-8 flex-1 rounded-full text-base font-medium transition-colors text-black hover:bg-gray-50 bg-gray-100"
                    disabled={isFinished}
                  >
                    {isRunning ? 'Pause' : 'Start'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>



      {/* Footer */}
      <footer className="relative z-40 py-8 px-4 sm:px-6 text-center">
        <a 
          href="https://yopablo.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-gray-600 hover:text-black transition-colors duration-200 hover:underline"
        >
          Origen is a new project by Pablo Gnecco
        </a>
      </footer>
    </div>
  );
};

export default HomePage; 