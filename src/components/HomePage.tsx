import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCircleTransition } from '../context/CircleTransitionContext';
import { supabase } from '../lib/supabase';
import { calculateBrewTiming, formatTime } from '../utils/brewingCalculations';
import { CoffeeSettings } from '../types/brewing';
import AppleStylePicker from './AppleStylePicker';

gsap.registerPlugin(ScrollTrigger);

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { circleRef } = useCircleTransition();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [currentSlide, setCurrentSlide] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  
  // Slideshow images for Origen section
  const slideshowImages = [
    '/photos/1.JPG',
    '/photos/2.JPG',
    '/photos/4.JPG',
    '/photos/5.JPG',
    '/photos/6.jpg',
    '/photos/01.JPG',
    '/photos/02.jpg',
    '/photos/03.JPG',
    '/photos/04.jpg',
    '/photos/05.JPG',
  ];

  // Timer state
  const loadSavedSettings = () => {
    const savedSettings = localStorage.getItem('coffeeSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return {
          amount: 18.0, // Always set to 18g
          ratio: (parsed.ratio >= 1 && parsed.ratio <= 50) ? parsed.ratio : 16.5,
          bloomRatio: parsed.bloomRatio || 2
        };
      } catch (e) {
        console.error('Error loading saved settings:', e);
      }
    }
    return { amount: 18.0, ratio: 16.5, bloomRatio: 2 };
  };

  const [coffeeSettings, setCoffeeSettings] = useState<CoffeeSettings>(loadSavedSettings);
  const [grindSize, setGrindSize] = useState(6);
  const [showBrewTimer, setShowBrewTimer] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showNotesTooltip, setShowNotesTooltip] = useState(false);

  const brewingTimings = calculateBrewTiming(
    grindSize, 
    coffeeSettings.amount, 
    coffeeSettings.ratio, 
    coffeeSettings.bloomRatio
  );

  const stepSequence = [
    { label: 'Bloom', water: `Pour to ${brewingTimings.bloomWater}g`, duration: brewingTimings.bloomDuration },
    { label: 'First Pour', water: `Pour to ${brewingTimings.firstPourTarget}g`, duration: brewingTimings.firstPourDuration },
    { label: 'Rest', water: 'Let it steep', duration: brewingTimings.restDuration },
    { label: 'Second Pour', water: `Pour to ${brewingTimings.secondPourTarget}g`, duration: brewingTimings.secondPourDuration },
    { label: 'Rest', water: 'Let it steep', duration: brewingTimings.secondRestDuration },
    { label: 'Third Pour', water: `Pour to ${brewingTimings.thirdPourTarget}g`, duration: brewingTimings.thirdPourDuration },
    { label: 'Drawdown', water: 'Let coffee drip', duration: brewingTimings.drawdownDuration },
    { label: 'Finish', water: 'Enjoy your coffee!', duration: 0 }
  ];

  const stepEndTimes = stepSequence.reduce((acc, step, i) => {
    acc.push((acc[i - 1] || 0) + step.duration);
    return acc;
  }, [] as number[]);

  const totalTime = stepEndTimes[stepEndTimes.length - 1] || 0;
  const isFinished = elapsed >= totalTime;

  const softChimeUrl = 'https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b9b6b2.mp3';

  useEffect(() => {
    if (isRunning && !isFinished) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          const newElapsed = prev + 0.1;
          const newCurrentStep = stepEndTimes.findIndex(endTime => newElapsed < endTime);
          const actualNewStep = newCurrentStep === -1 ? stepSequence.length - 1 : newCurrentStep;
          
          if (actualNewStep !== currentStep) {
            const completedStepIndex = actualNewStep - 1;
            const completedStep = stepSequence[completedStepIndex];
            const isPourStep = completedStep && (completedStep.label.includes('Pour') || completedStep.label.includes('Bloom'));
            if (isPourStep && completedStepIndex >= 0) {
              try {
                const audio = new Audio(softChimeUrl);
                audio.volume = 0.3;
                audio.play().catch(() => {});
              } catch (error) {}
              if ('vibrate' in navigator) navigator.vibrate(100);
            }
          }
          
          setCurrentStep(actualNewStep);
          
          if (newElapsed >= totalTime) {
            setIsRunning(false);
            return totalTime;
          }
          
          return newElapsed;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isFinished, totalTime, stepEndTimes.length, stepSequence.length, currentStep]);

  const handleStartBrew = () => {
    setElapsed(0);
    setCurrentStep(0);
    setIsRunning(true);
    setShowBrewTimer(true);
  };

  const handleTimerPause = () => setIsRunning(false);
  const handleTimerStart = () => setIsRunning(true);
  const handleTimerReset = () => {
    setIsRunning(false);
    setElapsed(0);
    setCurrentStep(0);
  };
  const handleTimerDone = () => {
    setShowBrewTimer(false);
    handleTimerReset();
  };

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
        console.error('Error saving email:', error);
        alert('There was an error subscribing. Please try again.');
        return;
      }

      console.log('Email submitted successfully:', email);
      setSubmitted(true);
      setEmail(''); // Clear the input
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('There was an error subscribing. Please try again.');
    }
  };


  // Load Shopify Buy Button Script
  useEffect(() => {
    console.log('HomePage useEffect running - loading Shopify script');
    
    const loadShopifyScript = () => {
      const scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
      
      if (window.ShopifyBuy) {
        if (window.ShopifyBuy.UI) {
          initShopify();
        } else {
          loadScript();
        }
      } else {
        loadScript();
      }

      function loadScript() {
        const script = document.createElement('script');
        script.async = true;
        script.src = scriptURL;
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
        script.onload = initShopify;
      }

      function initShopify() {
        // Check if already initialized
        if (shopifyInitialized.current) {
          console.log('Shopify already initialized, skipping');
          return;
        }
        
        // Check if product already exists
        const existingProduct = document.getElementById('product-component-1755456622817');
        if (existingProduct && existingProduct.children.length > 0) {
          console.log('Shopify product already loaded, skipping initialization');
          shopifyInitialized.current = true;
          return;
        }

        console.log('Initializing Shopify product...');
        shopifyInitialized.current = true;
        
        const client = window.ShopifyBuy.buildClient({
          domain: 'origintrip.myshopify.com',
          storefrontAccessToken: '53c69845a25fb79cfddf04b0e87c308d',
        });
        
        window.ShopifyBuy.UI.onReady(client).then(function (ui) {
          // Clear any existing content first
          const productNode = document.getElementById('product-component-1755456622817');
          if (productNode) {
            productNode.innerHTML = '';
          }
          
          console.log('Creating Shopify product component...');
          ui.createComponent('product', {
            id: '8791679238356',
            node: productNode,
            moneyFormat: '%24%7B%7Bamount%7D%7D',
            options: {
              "product": {
                "contents": {
                  "img": true,
                  "title": true,
                  "price": true,
                  "button": false
                },
                "styles": {
                  "product": {
                    "@media (min-width: 601px)": {
                      "max-width": "100%",
                      "margin-left": "0px",
                      "margin-bottom": "0px"
                    }
                  },
                  "img": {
                    "cursor": "pointer"
                  },
                  "title": {
                    "cursor": "pointer"
                  },
                  "price": {
                    "cursor": "pointer"
                  }
                },
                "text": {
                  "button": "Buy now"
                }
              },
              "productSet": {
                "styles": {
                  "products": {
                    "@media (min-width: 601px)": {
                      "margin-left": "-20px"
                    }
                  }
                }
              },
              "modalProduct": {
                "contents": {
                  "img": false,
                  "imgWithCarousel": true,
                  "button": false,
                  "buttonWithQuantity": true
                },
                "styles": {
                  "product": {
                    "@media (min-width: 601px)": {
                      "max-width": "100%",
                      "margin-left": "0px",
                      "margin-bottom": "0px"
                    }
                  },
                  "button": {
                    "font-weight": "bold",
                    ":hover": {
                      "background-color": "#000000"
                    },
                    "background-color": "#000000",
                    ":focus": {
                      "background-color": "#000000"
                    },
                    "border-radius": "40px",
                    "padding-left": "58px",
                    "padding-right": "58px"
                  }
                },
                "text": {
                  "button": "Add to cart"
                }
              },
              "option": {},
              "cart": {
                "styles": {
                  "button": {
                    "font-weight": "bold",
                    ":hover": {
                      "background-color": "#000000"
                    },
                    "background-color": "#000000",
                    ":focus": {
                      "background-color": "#000000"
                    },
                    "border-radius": "40px"
                  }
                },
                "text": {
                  "total": "Subtotal",
                  "button": "Checkout"
                }
              },
              "toggle": {
                "styles": {
                  "toggle": {
                    "font-weight": "bold",
                    "background-color": "#000000",
                    ":hover": {
                      "background-color": "#000000"
                    },
                    ":focus": {
                      "background-color": "#000000"
                    }
                  }
                }
              }
            },
          }).then(function(component) {
            console.log('Shopify product component created successfully');
            
            // Add click handler to the product image and details
            setTimeout(() => {
              const productElement = document.getElementById('product-component-1755456622817');
              if (productElement) {
                const productImage = productElement.querySelector('img');
                const productTitle = productElement.querySelector('[data-element="product.title"]');
                const productPrice = productElement.querySelector('[data-element="product.price"]');
                
                [productImage, productTitle, productPrice].forEach(element => {
                  if (element) {
                    element.style.cursor = 'pointer';
                    element.addEventListener('click', () => {
                      // Get the buy button and click it
                      const buyButton = document.querySelector('#buy-button-custom');
                      if (buyButton) {
                        buyButton.click();
                      } else {
                        // Fallback: open Shopify checkout directly
                        component.node.dispatchEvent(new Event('click', { bubbles: true }));
                      }
                    });
                  }
                });
              }
            }, 1000);
          });
        });
      }
    };

    loadShopifyScript();
    
    // Cleanup function
    return () => {
      console.log('HomePage cleanup - clearing Shopify product');
      const productNode = document.getElementById('product-component-1755456622817');
      if (productNode) {
        productNode.innerHTML = '';
      }
    };
  }, []);








  
  // Pinning refs for origen section
  const origenSectionRef = useRef<HTMLElement>(null);
  const origenTextRef = useRef<HTMLDivElement>(null);
  
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
        zIndex: 1,
        opacity: 1,
        visibility: 'visible',
        display: 'flex'
      });
    }
  };

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    console.log('🚀 NAV CLICK:', { sectionId, currentScrollY: window.scrollY });
    
    const element = document.getElementById(sectionId);
    if (element) {
      // For origen and coffee sections, account for the pinning offset
      if (sectionId === 'origen' || sectionId === 'coffee') {
        const rect = element.getBoundingClientRect();
        const currentScrollY = window.scrollY;
        const targetScrollY = currentScrollY + rect.top + 100; // +100px to match "top -100px" trigger
        
        console.log('🎯 NAV SCROLL DEBUG:', {
          sectionId,
          elementTop: rect.top,
          currentScrollY,
          targetScrollY,
          offset: 100,
          elementHeight: rect.height,
          windowHeight: window.innerHeight
        });
        
        window.scrollTo({
          top: targetScrollY,
          behavior: 'smooth'
        });
      } else {
        console.log('🎯 NAV SCROLL NORMAL:', {
          sectionId,
          elementTop: element.getBoundingClientRect().top,
          currentScrollY: window.scrollY
        });
        
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      console.warn('❌ NAV ERROR: Element not found for sectionId:', sectionId);
    }
  };

  // Section configurations for circle animation - 1.5x larger
  const sectionConfigs = [
    { id: 'home', size: 378, scale: 0.84 },
    { id: 'origen', size: 588, scale: 1.26 },
    { id: 'coffee', size: 682.5, scale: 1.365 },
    { id: 'buy', size: 787.5, scale: 1.575 },
    { id: 'timer', size: 840, scale: 1.68 }
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
      const initialConfig = sectionConfigs[0];
      gsap.set(circleRef.current, {
        // Size and scale
        width: initialConfig.size,
        height: initialConfig.size,
        scale: initialConfig.scale,
        // Positioning - FIXED in center
        position: "fixed",
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        transform: "translate(-50%, -50%)",
        transformOrigin: "center center",
        // Layer positioning
        zIndex: 1,
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

    // Click to pin/unpin circle position
    const handleClick = (e: MouseEvent) => {
      isPinned.current = true;
      pinnedPosition.current = {
        x: e.clientX,
        y: e.clientY
      };
      targetPosition.current = { ...pinnedPosition.current };
      mousePosition.current = { ...pinnedPosition.current };
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
      
      // Apply position with offset to keep circle centered on cursor
      gsap.set(circleRef.current, {
        left: targetPosition.current.x,
        top: targetPosition.current.y,
        xPercent: -50,
        yPercent: -50
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
    const totalSections = sectionConfigs.length;
    
    // Create a master ScrollTrigger that spans the entire page
        ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: self => {
        const progress = self.progress;
        const sectionIndex = Math.floor(progress * (totalSections - 1));
        const sectionProgress = (progress * (totalSections - 1)) - sectionIndex;
        
        // Debug scroll and progress values
        console.log('📊 SCROLL DEBUG:', {
          scrollY: window.scrollY,
          progress: progress.toFixed(4),
          sectionIndex,
          sectionProgress: sectionProgress.toFixed(4),
          totalSections
        });
        
        // Note: Circle fade for buy section is handled by specific trigger below
        
        // Get current and next section configs
        const currentConfig = sectionConfigs[sectionIndex];
        const nextConfig = sectionConfigs[Math.min(sectionIndex + 1, totalSections - 1)];
        
        // Interpolate between current and next section
        const size = gsap.utils.interpolate(currentConfig.size, nextConfig.size, sectionProgress);
        const scale = gsap.utils.interpolate(currentConfig.scale, nextConfig.scale, sectionProgress);
        
        console.log('🎯 CIRCLE ANIMATION:', {
          currentSection: currentConfig.id,
          nextSection: nextConfig.id,
          size: size.toFixed(1),
          scale: scale.toFixed(3),
          sectionProgress: sectionProgress.toFixed(3)
        });
        
        gsap.set(circleRef.current, {
          width: size,
          height: size,
          scale: scale,
          // Only scale, never move position
          force3D: true
        });
      },
      onRefresh: self => {
        // Ensure initial state is correct on refresh
        const progress = self.progress;
        const sectionIndex = Math.floor(progress * (totalSections - 1));
        const sectionProgress = (progress * (totalSections - 1)) - sectionIndex;
        
        // Normal circle animation for all sections
        
        
        const currentConfig = sectionConfigs[sectionIndex];
        const nextConfig = sectionConfigs[Math.min(sectionIndex + 1, totalSections - 1)];
        
        const size = gsap.utils.interpolate(currentConfig.size, nextConfig.size, sectionProgress);
        const scale = gsap.utils.interpolate(currentConfig.scale, nextConfig.scale, sectionProgress);
        
        gsap.set(circleRef.current, {
          width: size,
          height: size,
          scale: scale,
          // Only scale, never move position
          force3D: true
        });
      }
    });

    // Set up section detection for navigation
    sectionConfigs.forEach((config) => {
      const element = document.getElementById(config.id);
      if (!element) return;

      ScrollTrigger.create({
        trigger: element,
        start: "top center",
        end: "bottom center",
        onEnter: (self) => {
          console.log('🎯 SECTION ENTER:', {
            sectionId: config.id,
            scrollY: window.scrollY,
            progress: self.progress.toFixed(4),
            start: self.start,
            end: self.end,
            elementRect: element.getBoundingClientRect()
          });
          setActiveSection(config.id);
        },
        onEnterBack: (self) => {
          console.log('🎯 SECTION ENTER BACK:', {
            sectionId: config.id,
            scrollY: window.scrollY,
            progress: self.progress.toFixed(4),
            start: self.start,
            end: self.end,
            elementRect: element.getBoundingClientRect()
          });
          setActiveSection(config.id);
        },
        onLeave: (self) => {
          console.log('🎯 SECTION LEAVE:', {
            sectionId: config.id,
            scrollY: window.scrollY,
            progress: self.progress.toFixed(4),
            direction: self.direction
          });
        },
        onLeaveBack: (self) => {
          console.log('🎯 SECTION LEAVE BACK:', {
            sectionId: config.id,
            scrollY: window.scrollY,
            progress: self.progress.toFixed(4),
            direction: self.direction
          });
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
    
    // Set up pinning for origen section
    if (origenSectionRef.current && origenTextRef.current) {
      const origenTrigger = ScrollTrigger.create({
        trigger: origenSectionRef.current,
        start: "top -100px",
        end: "bottom bottom",
        pin: origenTextRef.current,
        pinSpacing: false,
        onEnter: (self) => {
          console.log('📌 ORIGEN PIN ENTER:', {
            scrollY: window.scrollY,
            progress: self.progress.toFixed(4),
            start: self.start,
            end: self.end,
            direction: self.direction,
            isActive: self.isActive
          });
        },
        onLeave: (self) => {
          console.log('📌 ORIGEN PIN LEAVE:', {
            scrollY: window.scrollY,
            progress: self.progress.toFixed(4),
            start: self.start,
            end: self.end,
            direction: self.direction,
            isActive: self.isActive
          });
        },
        onEnterBack: (self) => {
          console.log('📌 ORIGEN PIN ENTER BACK:', {
            scrollY: window.scrollY,
            progress: self.progress.toFixed(4),
            start: self.start,
            end: self.end,
            direction: self.direction,
            isActive: self.isActive
          });
        },
        onLeaveBack: (self) => {
          console.log('📌 ORIGEN PIN LEAVE BACK:', {
            scrollY: window.scrollY,
            progress: self.progress.toFixed(4),
            start: self.start,
            end: self.end,
            direction: self.direction,
            isActive: self.isActive
          });
        },
        onUpdate: (self) => {
          console.log('📌 ORIGEN PIN UPDATE:', {
            scrollY: window.scrollY,
            progress: self.progress.toFixed(4),
            velocity: self.getVelocity(),
            direction: self.direction
          });
        }
      });
      
      console.log('🎯 ORIGEN SCROLLTRIGGER CREATED:', {
        trigger: origenSectionRef.current,
        start: origenTrigger.start,
        end: origenTrigger.end,
        pin: origenTextRef.current
      });


    }

    // Set up pinning for coffee section
    if (coffeeSectionRef.current && coffeeTextRef.current) {
      const coffeeTrigger = ScrollTrigger.create({
        trigger: coffeeSectionRef.current,
        start: "top -100px",
        end: "bottom bottom",
        pin: coffeeTextRef.current,
        pinSpacing: false,
        onEnter: (self) => {
          console.log('☕ COFFEE PIN ENTER:', {
            scrollY: window.scrollY,
            progress: self.progress.toFixed(4),
            start: self.start,
            end: self.end,
            direction: self.direction,
            isActive: self.isActive
          });
        },
        onLeave: (self) => {
          console.log('☕ COFFEE PIN LEAVE:', {
            scrollY: window.scrollY,
            progress: self.progress.toFixed(4),
            start: self.start,
            end: self.end,
            direction: self.direction,
            isActive: self.isActive
          });
        },
        onEnterBack: (self) => {
          console.log('☕ COFFEE PIN ENTER BACK:', {
            scrollY: window.scrollY,
            progress: self.progress.toFixed(4),
            start: self.start,
            end: self.end,
            direction: self.direction,
            isActive: self.isActive
          });
        },
        onLeaveBack: (self) => {
          console.log('☕ COFFEE PIN LEAVE BACK:', {
            scrollY: window.scrollY,
            progress: self.progress.toFixed(4),
            start: self.start,
            end: self.end,
            direction: self.direction,
            isActive: self.isActive
          });
        },
        onUpdate: (self) => {
          console.log('☕ COFFEE PIN UPDATE:', {
            scrollY: window.scrollY,
            progress: self.progress.toFixed(4),
            velocity: self.getVelocity(),
            direction: self.direction
          });
        }
      });
      
      console.log('🎯 COFFEE SCROLLTRIGGER CREATED:', {
        trigger: coffeeSectionRef.current,
        start: coffeeTrigger.start,
        end: coffeeTrigger.end,
        pin: coffeeTextRef.current
      });
    }

    // Set up pinning for buy section
    if (buySectionRef.current && buyTextRef.current) {
      const buyTrigger = ScrollTrigger.create({
        trigger: buySectionRef.current,
        start: "top -100px",
        end: "bottom bottom",
        pin: buyTextRef.current,
        pinSpacing: false,
        onEnter: (self) => {
          console.log('🛒 BUY PIN ENTER:', {
            scrollY: window.scrollY,
            progress: self.progress.toFixed(4),
            start: self.start,
            end: self.end,
            direction: self.direction,
            isActive: self.isActive
          });
        },
        onLeave: (self) => {
          console.log('🛒 BUY PIN LEAVE:', {
            scrollY: window.scrollY,
            progress: self.progress.toFixed(4),
            start: self.start,
            end: self.end,
            direction: self.direction
          });
        },
        onUpdate: (self) => {
          console.log('🛒 BUY PIN UPDATE:', {
            scrollY: window.scrollY,
            progress: self.progress.toFixed(4),
            velocity: self.getVelocity(),
            direction: self.direction
          });
        }
      });
      
      console.log('🎯 BUY SCROLLTRIGGER CREATED:', {
        trigger: buySectionRef.current,
        start: buyTrigger.start,
        end: buyTrigger.end,
        pin: buyTextRef.current
      });
    }

    // Ensure ScrollTrigger corrects the initial size immediately
    gsap.delayedCall(0.01, () => {
      console.log('🔄 SCROLLTRIGGER REFRESH:', {
        scrollY: window.scrollY,
        allTriggers: ScrollTrigger.getAll().length,
        windowHeight: window.innerHeight,
        documentHeight: document.body.scrollHeight
      });
      ScrollTrigger.refresh();
    });

    // Timer section removed - circle stays visible throughout homepage

    return () => {
      // Cleanup mouse tracking
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrame);
      
      // Cleanup ScrollTriggers
      const allTriggers = ScrollTrigger.getAll();
      console.log('🧹 CLEANUP SCROLLTRIGGERS:', {
        triggerCount: allTriggers.length,
        triggerIds: allTriggers.map(t => t.vars.id || 'unnamed')
      });
      allTriggers.forEach(trigger => trigger.kill());
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
        {/* Home Section - Only the circle */}
        <section id="home" className="min-h-screen flex items-center justify-center relative">
          {/* Only the circle - clean and minimal */}
        </section>

        {/* Fixed Navigation at Top */}
        <nav 
          ref={navRef}
          className="fixed top-0 left-0 right-0 z-50 py-6"
        >
          <div className="flex justify-center items-center gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20">
            <button
              onClick={() => scrollToSection('origen')}
              className="text-lg sm:text-xl font-bold text-black hover:opacity-70 transition-opacity"
            >
              Origen
            </button>
            <button
              onClick={() => scrollToSection('coffee')}
              className="text-lg sm:text-xl font-bold text-black hover:opacity-70 transition-opacity"
            >
              Coffee
            </button>
            <button
              onClick={() => scrollToSection('buy')}
              className="text-lg sm:text-xl font-bold text-black hover:opacity-70 transition-opacity"
            >
              Buy
            </button>
            <button
              onClick={() => scrollToSection('timer')}
              className="text-lg sm:text-xl font-bold text-black hover:opacity-70 transition-opacity"
            >
              Timer
            </button>
          </div>
        </nav>

                {/* Origen Section */}
        <section ref={origenSectionRef} id="origen" className="text-black relative pt-20" style={{ minHeight: '300vh' }}>
          {/* Pinned text container */}
          <div ref={origenTextRef} className="w-full min-h-screen flex items-center justify-between px-4 sm:px-8 py-12 sm:py-16 relative" style={{ zIndex: 2 }}>
            <div className="w-full flex flex-col md:flex-row items-start justify-between gap-8 md:gap-12">
              {/* Left side - Slideshow */}
              <div className="w-full md:w-auto md:ml-0 lg:ml-8 xl:ml-12 relative flex-shrink-0">
                <div className="flex flex-col">
                  <div className="relative w-full max-w-[350px] mx-auto md:mx-0 md:w-[420px] lg:w-[480px] aspect-[3/4] overflow-hidden">
                    <img 
                      src={slideshowImages[currentSlide]} 
                      alt={`Slide ${currentSlide + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Navigation arrows - beneath image */}
                  <div className="flex items-center justify-center gap-8 mt-4">
                    <button
                      onClick={() => setCurrentSlide((prev) => (prev === 0 ? slideshowImages.length - 1 : prev - 1))}
                      className="hover:opacity-60 transition-opacity"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="w-8 h-8 text-black" strokeWidth={1.5} />
                    </button>
                    
                    {/* Slide indicators */}
                    <div className="flex gap-2">
                      {slideshowImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            index === currentSlide ? 'bg-black w-4' : 'bg-black bg-opacity-30'
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setCurrentSlide((prev) => (prev === slideshowImages.length - 1 ? 0 : prev + 1))}
                      className="hover:opacity-60 transition-opacity"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="w-8 h-8 text-black" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right side text content */}
              <div className="w-full md:w-auto md:max-w-[500px] lg:max-w-[550px] md:mr-0 lg:mr-8 xl:mr-12 flex items-center mt-8 md:mt-0">
                <div className="text-black leading-relaxed space-y-4 sm:space-y-5">
                  <p className="section-content text-sm sm:text-base leading-relaxed">
                    Origen began with a chance encounter in the mountains of Colombia. While attempting the Transcordilleras bikepacking race through the eastern Andes, I found myself exhausted in Charalá, Santander, a quiet town known for its resilient spirit and exceptional coffee.
                  </p>
                  <p className="section-content text-sm sm:text-base leading-relaxed">
                    A simple question to a hostel manager led me to Oscar Castro's farm, Bellavista, perched at 1,900 meters above sea level. What started as a farm visit became a direct relationship with the families who grow our coffee.
                  </p>
                  <p className="section-content text-sm sm:text-base leading-relaxed">
                    Our first harvest came from Oscar and his neighbors' pooled crop. Castillo variety beans, delicate and floral with notes of soft orchard fruit and a structured, clean finish. The coffee arrived in New York still in parchment, which meant hulling every bean by hand. What could have been outsourced became an education in the labor behind every cup.
                  </p>
                  <p className="section-content text-sm sm:text-base leading-relaxed">
                    Origen is about slowing down: experiencing Colombia through its coffee, understanding the work that goes into each harvest, and building direct relationships with the people who make it possible. We're a small operation learning as we go, committed to keeping waste minimal and connections meaningful.
                  </p>
                  <p className="section-content text-sm sm:text-base leading-relaxed">
                    From farm to roast to your cup, every batch tells the story of where it came from.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coffee Section */}
        <section ref={coffeeSectionRef} id="coffee" className="text-black relative pt-20" style={{ minHeight: '300vh' }}>
          <div ref={coffeeTextRef} className="w-full min-h-screen flex flex-col items-start justify-center px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16" style={{ zIndex: 2 }}>
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
        <section ref={buySectionRef} id="buy" className="text-black relative pt-20" style={{ minHeight: '300vh' }}>
          {/* Pinned content container */}
          <div ref={buyTextRef} className="w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-12 relative" style={{ zIndex: 2 }}>
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