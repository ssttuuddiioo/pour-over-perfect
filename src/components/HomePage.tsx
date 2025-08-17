import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCircleTransition } from '../context/CircleTransitionContext';

gsap.registerPlugin(ScrollTrigger);

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { circleRef } = useCircleTransition();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Handle email subscription
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the email to your backend
    console.log('Email submitted:', email);
    setSubmitted(true);
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

  // Section configurations for circle animation - responsive values (30% smaller)
  const sectionConfigs = [
    { id: 'home', size: 252, scale: 0.56 },
    { id: 'origen', size: 392, scale: 0.84 },
    { id: 'coffee', size: 455, scale: 0.91 },
    { id: 'story', size: 490, scale: 0.98 },
    { id: 'buy', size: 525, scale: 1.05 }
  ];

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
        end: "bottom 80%",
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
        end: "bottom 80%",
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

    // (scrolly section removed)



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

    // Specific trigger for buy section circle fade - prevents double circles
    ScrollTrigger.create({
      trigger: "#buy",
      start: "top 85%", // Start fading when buy section approaches
      end: "bottom 15%", // Keep faded until completely past buy section
      onEnter: () => {
        console.log('🛒 Buy section approaching - fading out main circle (buy image has its own circle)');
        gsap.to(circleRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.out"
        });
      },
      onLeave: () => {
        console.log('🛒 Completely past buy section - fading in main circle');
        gsap.to(circleRef.current, {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out"
        });
      },
      onEnterBack: () => {
        console.log('🛒 Re-entering buy section from below - fading out main circle');
        gsap.to(circleRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.out"
        });
      },
      onLeaveBack: () => {
        console.log('🛒 Leaving buy section upward - fading in main circle');
        gsap.to(circleRef.current, {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out"
        });
      }
    });

    return () => {
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
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm border-b border-gray-200">
        <div className="flex justify-center items-center py-4 px-4 sm:px-6">
          <div className="flex space-x-4 sm:space-x-6 md:space-x-8 lg:space-x-10">
            <button
              onClick={() => {
                resetToLanding();
              }}
              className={`text-sm sm:text-base md:text-lg font-medium transition-opacity ${
                activeSection === 'home' 
                  ? 'text-black underline' 
                  : 'text-black hover:opacity-70 hover:underline'
              }`}
            >
              home
            </button>
            <button
              onClick={() => scrollToSection('origen')}
              className={`text-sm sm:text-base md:text-lg font-medium transition-opacity ${
                activeSection === 'origen' 
                  ? 'text-black underline' 
                  : 'text-black hover:opacity-70 hover:underline'
              }`}
            >
              origen
            </button>
            <button
              onClick={() => scrollToSection('coffee')}
              className={`text-sm sm:text-base md:text-lg font-medium transition-opacity ${
                activeSection === 'coffee' 
                  ? 'text-black underline' 
                  : 'text-black hover:opacity-70 hover:underline'
              }`}
            >
              coffee
            </button>
            <button
              onClick={() => scrollToSection('buy')}
              className={`text-sm sm:text-base md:text-lg font-medium transition-opacity ${
                activeSection === 'buy' 
                  ? 'text-black underline' 
                  : 'text-black hover:opacity-70 hover:underline'
              }`}
            >
              buy
            </button>
            <button
              onClick={() => navigate('/timer')}
              className="text-sm sm:text-base md:text-lg font-medium text-black hover:opacity-70 hover:underline transition-opacity"
            >
              timer
            </button>
          </div>
        </div>
      </nav>

      {/* Sections */}
      <div className="scroll-smooth">
        {/* Home Section */}
        <section id="home" className="min-h-screen flex items-center justify-center relative pt-20">
          <div className="text-center">
            {/* Minimal home section - just the circle and navigation */}
          </div>
        </section>

                {/* Origen Section */}
        <section ref={origenSectionRef} id="origen" className="text-black relative pt-20" style={{ height: '300vh' }}>
          {/* Pinned text container */}
          <div ref={origenTextRef} className="w-full h-screen flex flex-col items-start justify-center px-4 sm:px-6 md:pr-8 lg:pr-12 xl:pr-16 pl-4 sm:pl-6 py-6 sm:py-8 relative" style={{ zIndex: 2 }}>
            {/* Right side text content */}
            <div className="w-full md:pl-[66.67%] lg:pl-[66.67%] xl:pl-[66.67%]">
              <div className="max-w-4xl w-full relative text-left">
                <div className="text-black leading-relaxed space-y-4 sm:space-y-6 md:space-y-8">
                  <p className="section-content text-sm sm:text-base leading-relaxed">
                    Charalá, Santander is a quiet town nestled in Colombia's eastern Andes, known for its rugged mountains, local markets, and a pace that invites you to slow down. I ended up there by chance, exhausted, sunburnt, and one-third of the way through Transcordilleras, a 1,000-kilometer bikepacking race with over 20,000 meters of climbing. I wasn't ready. Not mentally, not physically. By day three, I handed in my tracker and decided I would ride back to Bogota at my own pace.
                  </p>
                  <p className="section-content text-sm sm:text-base leading-relaxed">
                    As the other riders left in the morning I stayed behind to plan my new adventure. Over lunch, I randomly asked the hostel manager, Miguel if he knew any coffee producers. He made a call and few hours later, Oscar Castro pulled up in his pickup and invited me to visit his farm.
                  </p>
                  <p className="section-content text-sm sm:text-base leading-relaxed">
                    Oscar's farm, Bellavista, lives in a stead-spring valley 1,900m above sea level. Oscar works a few hectares of land with his family and neighbors, also family, pooling their harvests (coffee and banana) to sell in town. 
                  </p>
                  <br />
                  <button
                    onClick={() => navigate('/story')}
                    className="section-content font-bold text-black underline hover:opacity-70 transition-opacity duration-200 text-sm sm:text-base"
                  >
                    See full story
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coffee Section */}
        <section ref={coffeeSectionRef} id="coffee" className="text-black relative pt-20" style={{ height: '300vh' }}>
          <div ref={coffeeTextRef} className="w-full h-screen flex flex-col items-start justify-center px-4 sm:px-6 md:pl-40 lg:pl-26 xl:pl-100 pr-4 sm:pr-6 md:pr-8 lg:pr-12 xl:pr-16 py-6 sm:py-12 z-40">
            <div className="max-w-4xl w-full relative z-40 text-left">
              <div className="text-black leading-relaxed space-y-4 sm:space-y-6 md:space-y-8">
                <div className="section-content" style={{ lineHeight: '14pt' }}>
                  {/* Title and Description Box */}
                  <div className="border border-black mb-6" style={{ padding: '20px' }}>
                    <h2 className="font-bold uppercase tracking-wide text-left mb-4" style={{ fontSize: '14pt', lineHeight: '14pt', paddingTop: '0', paddingBottom: '0' }}>
                      NOTES
                    </h2>
                    <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                      Delicate florals, orchard-fruit sweetness, crisp clean finish. Sourced and roasted by Origen at Multimodal, a collective-oriented shared-roaster in New York.
                    </p>
                  </div>

                  {/* Coffee Information Grid - Fixed Width Columns */}
                  <div className="grid gap-0" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    
                    {/* Producer Card */}
                    <div className="border border-black" style={{ padding: '20px' }}>
                      <h3 className="font-bold uppercase tracking-wide text-left mb-4" style={{ fontSize: '14pt', lineHeight: '14pt', paddingTop: '0', paddingBottom: '0' }}>
                        PRODUCER
                      </h3>
                      <div style={{ lineHeight: '14pt' }}>
                        <p className="text-black mb-3" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold">Oscar Castro</span>
                        </p>
                        <p className="text-black mb-3" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          Finca Bellavista
                        </p>
                        <p className="text-black mb-3" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          Charalá, Santander, Colombia
                        </p>
                        <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          Altitude: 1,900 MASL
                        </p>
                      </div>
                    </div>

                    {/* Variety Card */}
                    <div className="border border-black border-l-0" style={{ padding: '20px' }}>
                      <h3 className="font-bold uppercase tracking-wide text-left mb-4" style={{ fontSize: '14pt', lineHeight: '14pt', paddingTop: '0', paddingBottom: '0' }}>
                        VARIETY & PROCESS
                      </h3>
                      <div style={{ lineHeight: '14pt' }}>
                        <p className="text-black mb-3" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold">Castillo</span>
                        </p>
                        <p className="text-black mb-3" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          Washed
                        </p>
                        <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          Fermented 36 hours
                        </p>
                    </div>
                  </div>

                    {/* Harvest & Lot Card */}
                    <div className="border border-black border-l-0" style={{ padding: '20px' }}>
                      <h3 className="font-bold uppercase tracking-wide text-left mb-4" style={{ fontSize: '14pt', lineHeight: '14pt', paddingTop: '0', paddingBottom: '0' }}>
                        HARVEST & LOT
                      </h3>
                      <div style={{ lineHeight: '14pt' }}>
                        <p className="text-black mb-3" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold">May 2025</span>
                        </p>
                        <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold">50kg</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Supply Chain Card */}
                  <div className="border border-black border-t-0" style={{ padding: '20px' }}>
                    <h3 className="font-bold uppercase tracking-wide text-left mb-4" style={{ fontSize: '14pt', lineHeight: '14pt', paddingTop: '0', paddingBottom: '0' }}>
                      SUPPLY CHAIN
                    </h3>
                    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(8, 1fr)', lineHeight: '14pt' }}>
                      <div>
                        <p className="font-medium uppercase tracking-widest text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          FARM
                        </p>
                        <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold">Bellavista</span>
                        </p>
                        <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold">$448.55</span>
                        </p>
                      </div>
                      <div>
                        <p className="font-medium uppercase tracking-widest text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          MILL
                        </p>
                        <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold">Cafe Semilla</span>
                        </p>
                        <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold">$TBD</span>
                        </p>
                      </div>
                      <div>
                        <p className="font-medium uppercase tracking-widest text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          FOB
                        </p>
                        <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold">FedEx</span>
                        </p>
                        <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold">$95</span>
                        </p>
                      </div>
                      <div>
                        <p className="font-medium uppercase tracking-widest text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          BUYER
                        </p>
                        <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold">Origen</span>
                        </p>
                        <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold">$TBD</span>
                        </p>
                      </div>
                      <div>
                        <p className="font-medium uppercase tracking-widest text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          EXPORTER
                        </p>
                        <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold">Origen</span>
                        </p>
                        <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold">$TBD</span>
                        </p>
                      </div>
                      <div>
                        <p className="font-medium uppercase tracking-widest text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          IMPORTER
                        </p>
                        <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold">Origen</span>
                        </p>
                        <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold">$TBD</span>
                        </p>
                      </div>
                      <div>
                        <p className="font-medium uppercase tracking-widest text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          ROASTING
                        </p>
                        <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold">Multimodal</span>
                        </p>
                        <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold">$TBD</span>
                        </p>
                      </div>
                      <div>
                        <p className="font-medium uppercase tracking-widest text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          COGS
                        </p>
                        <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold">$/kg</span>
                        </p>
                        <p className="text-black" style={{ fontSize: '9pt', lineHeight: '14pt' }}>
                          <span className="font-bold"></span>
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
        <section id="buy" className="text-black relative pt-20" style={{ height: '300vh' }}>
          <div className="w-full h-screen flex flex-col items-end justify-center px-4 sm:px-6 md:pr-40 lg:pr-26 xl:pr-100 pl-4 sm:pl-6 md:pl-8 lg:pl-12 xl:pl-16 py-6 sm:py-12 z-40">
            <div className="max-w-4xl w-full relative z-40 text-left">
              <div className="text-black leading-relaxed space-y-4 sm:space-y-6 md:space-y-8">
                <div className="section-content" style={{ lineHeight: '14pt' }}>
                  {/* Product Grid - Two Column Layout */}
                  <div className="grid gap-0" style={{ gridTemplateColumns: '1fr 1fr', height: '60vh' }}>
                    
                    {/* Details Section - Left */}
                    <div className="border border-black flex flex-col" style={{ padding: '30px' }}>
                      <div className="flex-1">
                        <h3 className="font-bold uppercase tracking-wide text-left mb-6" style={{ fontSize: '16pt', lineHeight: '20pt' }}>
                          Details
                        </h3>
                        <div style={{ lineHeight: '18pt' }}>
                          <p className="text-black mb-4" style={{ fontSize: '11pt', lineHeight: '18pt' }}>
                            <span className="font-bold">Castillo</span> variety from Finca Bellavista
                          </p>
                          <p className="text-black mb-4" style={{ fontSize: '11pt', lineHeight: '18pt' }}>
                            Washed process, fermented 36 hours
                          </p>
                          <p className="text-black mb-4" style={{ fontSize: '11pt', lineHeight: '18pt' }}>
                            Charalá, Santander, Colombia
                          </p>
                          <p className="text-black mb-6" style={{ fontSize: '11pt', lineHeight: '18pt' }}>
                            Delicate florals, orchard-fruit sweetness, crisp clean finish
                          </p>
                        </div>
                      </div>

                      {/* Subscribe Form */}
                      <div className="mt-auto">
                        <h4 className="font-bold uppercase tracking-wide text-left mb-4" style={{ fontSize: '12pt', lineHeight: '16pt' }}>
                          Subscribe to stay in the loop
                        </h4>
                        <p className="text-black mb-6" style={{ fontSize: '11pt', lineHeight: '18pt' }}>
                            We'll let you know a few days before the next roast so you can pre-order
                          </p>
                        {!submitted ? (
                          <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                              <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full px-0 py-2 placeholder-gray-500 text-black bg-transparent border-0 border-b border-black focus:border-black focus:outline-none focus:ring-0"
                                style={{ fontSize: '10pt', lineHeight: '14pt' }}
                              />
                            </div>
                            <button
                              type="submit"
                              className="font-bold text-black border border-black px-4 py-2 hover:bg-black hover:text-white transition-all duration-200 uppercase tracking-wide"
                              style={{ fontSize: '9pt', lineHeight: '12pt' }}
                            >
                              Subscribe
                            </button>
                          </form>
                        ) : (
                          <div className="text-left py-4">
                            <p className="text-black" style={{ fontSize: '10pt', lineHeight: '14pt' }}>
                              <span className="font-bold">Thanks for subscribing!</span> We'll keep you updated.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Image Section - Right */}
                    <div className="border border-black border-l-0 flex flex-col" style={{ padding: '30px' }}>
                      {/* Product Image Area */}
                      <div className="flex-1 flex items-center justify-center bg-white mb-6">
                        <img 
                          src="/photos/31.jpeg" 
                          alt="Colombian Coffee"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      
                      {/* Bottom Label */}
                      <div className="text-center mt-auto">
                        <p className="text-black font-medium" style={{ fontSize: '14pt', lineHeight: '18pt' }}>
                          Roast date: TBC
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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