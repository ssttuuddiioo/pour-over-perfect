import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
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
  // Gallery / Lightbox state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeAlbumIndex, setActiveAlbumIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isImageFadingIn, setIsImageFadingIn] = useState(true);
  const [circleHitRect, setCircleHitRect] = useState<DOMRect | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  type Photo = { src: string; alt: string; text?: string };
  type Album = { title: string; cover: Photo; images: Photo[] };

  const basePhotos: Photo[] = [
    { src: '/photos/1.JPG', alt: 'Coffee photo 1', text: 'Hand-picked cherries at peak ripeness.' },
    { src: '/photos/2.JPG', alt: 'Coffee photo 2', text: 'Sorting and selection for quality.' },
    { src: '/photos/4.JPG', alt: 'Coffee photo 4', text: 'Washing and soaking for clarity.' },
    { src: '/photos/5.JPG', alt: 'Coffee photo 5', text: 'Drying under indirect sunlight.' },
    { src: '/photos/6.jpg', alt: 'Coffee photo 6', text: 'Resting parchment coffee before milling.' }
  ];

  // Simple demo albums using existing assets
  const albums: Album[] = [
    { title: 'Harvest', cover: basePhotos[0], images: basePhotos },
    { title: 'Drying', cover: basePhotos[2], images: basePhotos },
    { title: 'Milling', cover: basePhotos[3], images: basePhotos.slice().reverse() }
  ];

  // Story slides (left image, right text)
  const storySlides: { src: string; text: string }[] = [
    { src: '/photo-final/01.png', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae lectus id lorem tristique hendrerit.' },
    { src: '/photo-final/02.png', text: 'Suspendisse potenti. Sed aliquet, nibh in ultrices lacinia, lorem metus placerat arcu, vitae suscipit lectus lacus in dolor.' },
    { src: '/photo-final/03.png', text: 'Curabitur auctor, arcu nec convallis convallis, sapien dolor efficitur est, vel vulputate nunc est ac est.' },
    { src: '/photo-final/04.png', text: 'Mauris dignissim, augue ac pretium rutrum, odio massa tempus arcu, nec tempus risus tortor id arcu.' },
    { src: '/photo-final/05.png', text: 'Vivamus sed varius elit. Fusce faucibus ultrices ex nec porttitor. Nulla facilisi.' },
    { src: '/photo-final/06.png', text: 'Pellentesque non felis quis nibh fermentum tristique. Nam vulputate lectus id quam convallis, a vulputate arcu consequat.' },
    { src: '/photo-final/07.png', text: 'Aenean ut lectus enim. Donec finibus, augue eu tincidunt tincidunt, purus lacus gravida nulla, a dictum metus augue sed nisi.' },
    { src: '/photo-final/08.png', text: 'Etiam vitae fermentum arcu, nec hendrerit arcu. Vestibulum id purus nec odio venenatis iaculis.' },
    { src: '/photo-final/09.png', text: 'Ut consectetur nisl sed dolor imperdiet, vitae laoreet velit ultricies. Integer vitae felis nec ex sagittis porttitor.' },
    { src: '/photo-final/10.jpeg', text: 'Praesent et tortor nec risus sodales sollicitudin. Sed tristique commodo sem ut vehicula.' },
    { src: '/photo-final/11.png', text: 'Donec euismod, justo quis venenatis tempus, mauris urna laoreet nunc, et finibus elit odio in arcu.' },
    { src: '/photo-final/12.png', text: 'Sed nec velit diam. Proin quis faucibus urna. Integer lorem ante, egestas et orci sit amet, euismod tempus mi.' },
    { src: '/photo-final/13.png', text: 'Cras sit amet mauris id risus bibendum pretium. Pellentesque non hendrerit elit.' },
    { src: '/photo-final/14.png', text: 'Morbi bibendum ipsum vel lacus dapibus, a finibus neque ultrices. Nulla vitae erat quis sapien malesuada laoreet.' },
    { src: '/photo-final/15.png', text: 'Quisque gravida, arcu ac aliquet scelerisque, erat risus vestibulum nisl, ac consequat elit turpis id libero.' }
  ];

  const showPrevStory = () => setCurrentStoryIndex((i) => (i - 1 + storySlides.length) % storySlides.length);
  const showNextStory = () => setCurrentStoryIndex((i) => (i + 1) % storySlides.length);

  const openGallery = () => setIsGalleryOpen(true);
  const closeGallery = () => {
    setIsGalleryOpen(false);
    setIsLightboxOpen(false);
  };
  const openLightbox = (albumIndex: number, index: number) => {
    setActiveAlbumIndex(albumIndex);
    setLightboxIndex(index);
    setIsImageFadingIn(false);
    // allow DOM to apply opacity-0, then fade in
    requestAnimationFrame(() => setIsImageFadingIn(true));
    setIsLightboxOpen(true);
  };
  const closeLightbox = () => setIsLightboxOpen(false);
  const showPrev = () => {
    setIsImageFadingIn(false);
    setTimeout(() => {
      const total = albums[activeAlbumIndex].images.length;
      setLightboxIndex((prev) => (prev - 1 + total) % total);
      setIsImageFadingIn(true);
    }, 120);
  };
  const showNext = () => {
    setIsImageFadingIn(false);
    setTimeout(() => {
      const total = albums[activeAlbumIndex].images.length;
      setLightboxIndex((prev) => (prev + 1) % total);
      setIsImageFadingIn(true);
    }, 120);
  };
  
  // Pinning refs for origen section
  const origenSectionRef = useRef<HTMLElement>(null);
  const origenTextRef = useRef<HTMLDivElement>(null);
  
  // Pinning refs for coffee section
  const coffeeSectionRef = useRef<HTMLElement>(null);
  const coffeeTextRef = useRef<HTMLDivElement>(null);
  
  // Pinning refs for story section
  const storySectionRef = useRef<HTMLElement>(null);
  const storyContentRef = useRef<HTMLDivElement>(null);
  
  
 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString(),
      });
      
      if (response.ok) {
        setSubmitted(true);
        setEmail(''); // Clear the email field
      } else {
        console.error('Form submission failed');
        // Still show success message for UX, but log error
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Still show success message for UX, but log error
      setSubmitted(true);
    }
  };

  // Reset to landing page: close gallery/lightbox, scroll to top, restore circle
  const resetToLanding = () => {
    setIsLightboxOpen(false);
    setIsGalleryOpen(false);
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

  // Section configurations for circle animation - responsive values
  const sectionConfigs = [
    { id: 'home', size: 360, scale: 0.8 },
    { id: 'origen', size: 560, scale: 1.2 },
    { id: 'coffee', size: 650, scale: 1.3 },
    { id: 'story', size: 700, scale: 1.4 },
    { id: 'buy', size: 750, scale: 1.5 }
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
        
        // Normal circle animation for all sections
        
        
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

    // Pin Story section (like others)
    if (storySectionRef.current && storyContentRef.current) {
      const storyTrigger = ScrollTrigger.create({
        trigger: storySectionRef.current,
        start: "top -100px",
        end: "bottom 80%",
        pin: storyContentRef.current,
        pinSpacing: false
      });
      console.log('🎯 STORY SCROLLTRIGGER CREATED:', {
        trigger: storySectionRef.current,
        start: storyTrigger.start,
        end: storyTrigger.end,
        pin: storyContentRef.current
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

    // Attach click handler to circle to open gallery (only on home page)
    const circleEl = circleRef.current;
    const handleCircleClick = () => {
      openGallery();
    };
    circleEl?.addEventListener('click', handleCircleClick);

    return () => {
      const allTriggers = ScrollTrigger.getAll();
      console.log('🧹 CLEANUP SCROLLTRIGGERS:', {
        triggerCount: allTriggers.length,
        triggerIds: allTriggers.map(t => t.vars.id || 'unnamed')
      });
      allTriggers.forEach(trigger => trigger.kill());
      circleEl?.removeEventListener('click', handleCircleClick);
    };
  }, []);

  // Lock background scroll when overlay/lightbox open
  useEffect(() => {
    const shouldLock = isGalleryOpen || isLightboxOpen;
    if (shouldLock) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isGalleryOpen, isLightboxOpen]);

  // Keyboard navigation for fullscreen lightbox + global Escape to reset
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isLightboxOpen && e.key === 'ArrowLeft') {
        e.preventDefault();
        showPrev();
      } else if (isLightboxOpen && e.key === 'ArrowRight') {
        e.preventDefault();
        showNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        resetToLanding();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLightboxOpen]);

  // Click proxy over the orange circle so it is always clickable above text
  useEffect(() => {
    if (!circleRef.current) return;
    let rafId: number | null = null;
    const updateRect = () => {
      if (!circleRef.current) return;
      const rect = circleRef.current.getBoundingClientRect();
      setCircleHitRect(rect);
    };
    const onScrollOrResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateRect);
    };
    updateRect();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    const ro = new ResizeObserver(onScrollOrResize);
    ro.observe(circleRef.current);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      ro.disconnect();
    };
  }, [circleRef]);

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
              onClick={() => scrollToSection('story')}
              className={`text-sm sm:text-base md:text-lg font-medium transition-opacity ${
                activeSection === 'story' 
                  ? 'text-black underline' 
                  : 'text-black hover:opacity-70 hover:underline'
              }`}
            >
              story
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
                    Charalá, Santander is a quiet town nestled in Colombia's eastern Andes, known for its rugged mountains, local markets, and a pace that invites you to slow down. I ended up there by chance, exhausted, sunburnt, and one-third of the way through Transcordilleras, a 1,000-kilometer bikepacking race with over 20,000 meters of climbing. I wasn't ready. Not mentally, not physically. By day three, I handed in my tracker and decided to ride back to Bogota on my own terms.
                  </p>
                  <p className="section-content text-sm sm:text-base leading-relaxed">
                    I stayed behind as the other riders left. Over lunch, I asked the hostel manager if he knew any coffee producers. He made a call. A few hours later, Oscar Castro pulled up in his pickup and invited me to visit his farm.
                  </p>
                  <p className="section-content text-sm sm:text-base leading-relaxed">
                    Oscar's farm, Bellavista, sits at 1,900 MASL above Charalá. He works a few hectares of land alongside his family and neighbors, also family, pooling their harvests to sell in town. The variety is Castillo, a hardy hybrid that thrives at altitude. It's delicate, floral, sweet, with notes of soft orchard fruit and a structured, clean finish.
                  </p>
                  <p className="section-content text-sm sm:text-base leading-relaxed">
                    This coffee was grown, harvested, sourced, exported, roasted, and packed through small, independent efforts.
                  </p>
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
                <p className="section-content text-sm sm:text-base leading-relaxed">
                  This coffee was grown and hulled by Oscar Castro in Charalá. Unlike most coffees, which pass through several hands before it reaches a cup, this one skipped a few of those. Oscar handled both production and milling; we purchased directly, managed export and import independently, roasted, and packaged in New York. It's a vertically streamlined approach built on trust, transparency, and shared effort.
                </p>
                
                <div className="section-content">
                  {/* Producer and Variety in Two Columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
                    {/* Producer */}
                    <div className="space-y-2 sm:space-y-3">
                      <h3 className="font-medium text-base sm:text-lg">Producer</h3>
                      <div className="text-sm sm:text-base space-y-1 sm:space-y-2">
                        <p>Oscar Castro</p>
                        <p>Finca Bellavista</p>
                        <p>Charalá, Santander, Colombia</p>
                        <p>Altitude: 1,900 MASL</p>
                      </div>
                    </div>

                    {/* Variety */}
                    <div className="space-y-2 sm:space-y-3">
                      <h3 className="font-medium text-base sm:text-lg">Variety</h3>
                      <div className="text-sm sm:text-base">
                        <p className="font-medium mb-2 sm:mb-3">Castillo</p>
                      </div>
                    </div>
                  </div>

                  {/* Harvest & Lot */}
                  <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    <h3 className="font-medium text-base sm:text-lg">Harvest & Lot</h3>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xs sm:max-w-md">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Harvest Date</p>
                        <p className="text-sm sm:text-base">May 2025</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Lot Size</p>
                        <p className="text-sm sm:text-base">50kg</p>
                      </div>
                    </div>
                  </div>

                  {/* Supply Chain - Clean Left-Justified Layout */}
                  <div className="mt-6 sm:mt-8 lg:mt-10">
                    <h3 className="font-medium text-base sm:text-lg mb-3 sm:mb-4 lg:mb-6">Supply Chain</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6">
                      <div className="text-left space-y-1">
                        <h4 className="font-medium text-sm text-gray-600">Farm Gate</h4>
                        <p className="text-sm sm:text-base">$448.55 USD</p>
                      </div>
                      <div className="text-left space-y-1">
                        <h4 className="font-medium text-sm text-gray-600">FOB - FOT</h4>
                        <p className="text-sm sm:text-base">$95</p>
                      </div>
                      <div className="text-left space-y-1">
                        <h4 className="font-medium text-sm text-gray-600">Buyer</h4>
                        <p className="text-sm sm:text-base">Origen</p>
                      </div>
                      <div className="text-left space-y-1">
                        <h4 className="font-medium text-sm text-gray-600">Exporter</h4>
                        <p className="text-sm sm:text-base">Origen</p>
                      </div>
                      <div className="text-left space-y-1">
                        <h4 className="font-medium text-sm text-gray-600">Importer</h4>
                        <p className="text-sm sm:text-base">Origen</p>
                      </div>
                      <div className="text-left space-y-1">
                        <h4 className="font-medium text-sm text-gray-600">Roaster</h4>
                        <p className="text-sm sm:text-base">Origen / Multimodal</p>
                      </div>
                      <div className="text-left space-y-1 col-span-2 sm:col-span-1">
                        <h4 className="font-medium text-sm text-gray-600">COGS</h4>
                        <p className="text-sm sm:text-base">$/kg</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section (left image, right text) */}
        <section ref={storySectionRef} id="story" className="text-black relative pt-20" style={{ height: '300vh' }}>
          <div ref={storyContentRef} className="w-full h-screen grid grid-cols-1 md:grid-cols-12 items-center px-4 sm:px-6 py-6 sm:py-8 z-40">
            {/* Left: Image */}
            <div className="md:col-span-7 flex items-center justify-center pr-0 md:pr-6 lg:pr-10">
              <img
                key={currentStoryIndex}
                src={storySlides[currentStoryIndex].src}
                alt={`story image ${currentStoryIndex + 1}`}
                className="w-full h-auto max-h-[70vh] object-contain rounded-md shadow-sm"
              />
            </div>
            {/* Right: Text with arrows */}
            <div className="md:col-span-5 pl-0 md:pl-6 lg:pl-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl sm:text-2xl font-medium">story</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={showPrevStory}
                    aria-label="Previous slide"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={showNextStory}
                    aria-label="Next slide"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              <p className="text-sm sm:text-base leading-relaxed section-content">
                {storySlides[currentStoryIndex].text}
              </p>
              <div className="text-xs text-gray-500 mt-3">{currentStoryIndex + 1} / {storySlides.length}</div>
            </div>
          </div>
        </section>

        {/* Buy Section */}
        <section id="buy" className="min-h-screen text-black flex flex-col items-center justify-center px-4 sm:px-6 md:pl-32 lg:pl-28 xl:pl-24 md:pr-8 lg:pr-12 xl:pr-16 py-6 sm:py-8 relative pt-20">
          <div className="max-w-4xl w-full relative z-40 text-left">
            <div className="text-black leading-relaxed space-y-4 sm:space-y-6 md:space-y-8">
              <p className="section-content text-sm sm:text-base leading-relaxed">
                The next roast will be a small one, about 50kg. Drop your email to stay in the loop, and we'll let you know when pre-order is open a few days before the next roast.
              </p>

              <div className="section-content">
                <div className="mt-6 sm:mt-8 lg:mt-10">
                  <h3 className="font-medium text-base sm:text-lg mb-3 sm:mb-4 lg:mb-6">Get notified when available</h3>
                  {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                      <div>
                        <input
                          type="email"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="w-full px-0 py-2 text-sm sm:text-base placeholder-gray-500 text-black bg-transparent border-0 border-b border-gray-300 focus:border-black focus:outline-none focus:ring-0"
                        />
                      </div>
                      <button
                        type="submit"
                        className="text-left text-sm sm:text-base font-medium text-black hover:opacity-70 transition-all duration-200 underline self-start py-2 active:scale-95"
                      >
                        Sign Up
                      </button>
                    </form>
                  ) : (
                    <div className="text-left py-4">
                      <p className="text-sm sm:text-base text-gray-600">Thanks for signing up! We'll let you know as soon as the next roast is ready.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Invisible click proxy over the orange circle. Sits above content but below nav. */}
      {circleHitRect && !isGalleryOpen && (
        <button
          aria-label="Open photo gallery"
          onClick={openGallery}
          className="fixed"
          style={{
            left: `${circleHitRect.left}px`,
            top: `${circleHitRect.top}px`,
            width: `${circleHitRect.width}px`,
            height: `${circleHitRect.height}px`,
            borderRadius: '9999px',
            zIndex: 45,
            background: 'transparent',
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
        />
      )}

      {/* Gallery Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-white transition-opacity duration-300 ${
          isGalleryOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isGalleryOpen}
      >
        <div className="absolute inset-0 overflow-y-auto">
          <div className="sticky top-0 flex justify-end p-4 md:p-6 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-10">
            <button
              aria-label="Close gallery"
              onClick={closeGallery}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700"
            >
              <X size={18} />
            </button>
          </div>
          <div className="w-full max-w-none mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
            <h2 className="text-lg md:text-xl font-medium text-black mb-4">Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
              {albums.map((album, aIdx) => (
                <button
                  key={album.title}
                  onClick={() => openLightbox(aIdx, 0)}
                  className="group text-left"
                >
                  <div className="relative w-full overflow-hidden rounded-md bg-gray-100">
                    <img
                      src={album.cover.src}
                      alt={album.cover.alt}
                      className="block w-full h-auto transition-transform duration-300 group-hover:scale-[1.01]"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-2 text-sm text-gray-700">{album.title}</div>
                </button>
              ))}
            </div>
            <div className="h-12" />
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {isGalleryOpen && (
        <div
          className={`fixed inset-0 z-40 bg-white transition-opacity duration-300 ${
            isLightboxOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden={!isLightboxOpen}
        >
          {/* Fullscreen lightbox */}
          <div className="absolute inset-0">
            {/* Close */}
            <div className="absolute top-4 right-4 z-[46]">
              <button
                aria-label="Close image"
                onClick={closeLightbox}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow"
              >
                <X size={18} />
              </button>
            </div>

            {/* Two-column layout: large photo left with arrows, text right */}
            <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-12">
              {/* Left: Image with arrows */}
              <div className="relative md:col-span-8 flex items-center justify-center px-4 sm:px-6 md:px-10 py-10 sm:py-12 md:py-16">
                <img
                  key={`${activeAlbumIndex}-${lightboxIndex}`}
                  src={albums[activeAlbumIndex].images[lightboxIndex].src}
                  alt={albums[activeAlbumIndex].images[lightboxIndex].alt}
                  className={`block max-w-full max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-10rem)] md:max-h-[calc(100vh-12rem)] w-auto h-auto object-contain transition-opacity duration-300 ${
                    isImageFadingIn ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                {/* Arrows beside image within the left pane */}
                <div className="pointer-events-none absolute inset-y-0 left-4 right-4 flex items-center justify-between">
                  <button
                    onClick={showPrev}
                    aria-label="Previous photo"
                    className="pointer-events-auto inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/85 border border-gray-300 text-gray-700 hover:bg-white"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={showNext}
                    aria-label="Next photo"
                    className="pointer-events-auto inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/85 border border-gray-300 text-gray-700 hover:bg-white"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Right: Title and description */}
              <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-gray-200 p-6 md:p-10 overflow-y-auto flex items-center">
                <div className="w-full">
                  <div className="text-xs text-gray-500 mb-3">{lightboxIndex + 1} / {albums[activeAlbumIndex].images.length}</div>
                  <h3 className="text-xl md:text-2xl font-medium text-black mb-2">{albums[activeAlbumIndex].title}</h3>
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">{albums[activeAlbumIndex].images[lightboxIndex].text}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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