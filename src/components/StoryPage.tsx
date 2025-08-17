import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const StoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const textsRef = useRef<(HTMLDivElement | null)[]>([]);
  const circleRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef<number>(0);
  const isScrolling = useRef<boolean>(false);

  const storySlides = [
    {
      src: '/photo-final/01.png',
      text: 'February 11, 2024, at the start of Transcordilleras, completely unaware of what it takes to traverse the Andes mountains in 7 days.'
    },
    {
      src: '/photo-final/02.png',
      text: 'The sunset I saw before riding into Charala, not knowing what new adventure awaited.'
    },
    {
      src: '/photo-final/03.png',
      text: 'I turned in my tracker and withdrew from the race. Without a plan I decided to stay in town for a bit. Charalá, Santander is a quiet town nestled in Colombia\'s eastern Andes mountains, known for its rich coffee and a spirit of resilience that lingers in the land and its people.'
    },
    {
      src: '/photo-final/04.png',
      text: 'So much coffee being traded in the town square'
    },
    {
      src: '/photo-final/05.png',
      text: 'Oscar and his family with a recent harvest on his farm Bellavista'
    },
    {
      src: '/photo-final/06.png',
      text: 'Bellavista, sits at 1,900 meters above sea level, where Oscar works a few hectares of land with his family and neighbors, pooling coffee and banana harvests to sell in town.'
    },
    {
      src: '/photo-final/07.png',
      text: 'I was lucky enough to see the flowering of the coffee plant, which lasts only a few days, the flowers then wither and fall off after pollination before cherries begin to grow'
    },
    {
      src: '/photo-final/08.png',
      text: 'After visiting Oscar, I rode back to Bogotá at my own pace, stopping to take in the views. This is in Villa de Leyva!'
    },
    {
      src: '/photo-final/09.png',
      text: 'In March 2025 (a full harvest and half later, and a year after my visit to Bellavista), I shipped a small amount form Oscar\'s farm to my apartment in Brooklyn.'
    },
    {
      src: '/photo-final/10.jpeg',
      text: 'The coffee came with it\'s parchment on! Which is rare and there is virtually no equipment to hull coffee in the US so we had to do it all by hand, what an experience!'
    },
    {
      src: '/photo-final/11.png',
      text: 'I found an amazing community based roaster in Queens called Multimodal that supports smaller roasters and enthusiasts with the resources to make a great cup'
    },
    {
      src: '/photo-final/12.png',
      text: 'After a small roast I was able to sell about 20 bags to friends and family.'
    },
    {
      src: '/photo-final/13.png',
      text: 'Than branding is as minimalist as possible to focus on the coffee itself and its origin while being as transparent as possible'
    },
    {
      src: '/photo-final/14.png',
      text: 'The first packages being sent out to friends in all corners of the country. LA, SF, Seattle, Atlanta, and Miami'
    },
    {
      src: '/photo-final/15.png',
      text: 'For orders in NY I hand delivered on my bike, completing a full circle!'
    }
  ];

  // Initialize ref arrays to handle both desktop and mobile refs
  useEffect(() => {
    imagesRef.current = new Array(storySlides.length * 2).fill(null); // *2 for desktop and mobile
    textsRef.current = new Array(storySlides.length * 2).fill(null);   // *2 for desktop and mobile
  }, []);

  const animateToSlide = (index: number) => {
    // Smooth GSAP animations for both desktop and mobile
    imagesRef.current.forEach((img, imgIndex) => {
      if (img) {
        const slideIndex = imgIndex < storySlides.length ? imgIndex : imgIndex - storySlides.length;
        gsap.to(img, {
          opacity: slideIndex === index ? 1 : 0,
          duration: 0.6,
          ease: 'power2.out'
        });
      }
    });

    textsRef.current.forEach((text, textIndex) => {
      if (text) {
        const slideIndex = textIndex < storySlides.length ? textIndex : textIndex - storySlides.length;
        gsap.to(text, {
          opacity: slideIndex === index ? 1 : 0,
          y: slideIndex === index ? 0 : 10,
          duration: 0.6,
          ease: 'power2.out'
        });
      }
    });

    // Smooth circle scale animation with enhanced scaling range
    if (circleRef.current) {
      const progress = index / (storySlides.length - 1);
      const scale = 0.4 + (progress * 0.8); // Scale from 0.4 to 1.2 for more dramatic effect
      gsap.to(circleRef.current, {
        scale: scale,
        duration: 0.8,
        ease: 'power2.out'
      });
    }
  };

  // Trigger animations when currentStoryIndex changes
  useEffect(() => {
    animateToSlide(currentStoryIndex);
  }, [currentStoryIndex]);

  const changeStory = (index: number) => {
    if (index === currentStoryIndex) return;
    setCurrentStoryIndex(index);
  };

  const showNextStory = useCallback(() => {
    setCurrentStoryIndex(prevIndex => {
      const nextIndex = prevIndex === storySlides.length - 1 ? 0 : prevIndex + 1;
      return nextIndex;
    });
  }, [storySlides.length]);

  const showPrevStory = useCallback(() => {
    setCurrentStoryIndex(prevIndex => {
      const newIndex = prevIndex === 0 ? storySlides.length - 1 : prevIndex - 1;
      return newIndex;
    });
  }, [storySlides.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Keyboard navigation function
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        showNextStory();
      } else if (event.key === 'ArrowLeft') {
        showPrevStory();
      }
    };

    // Discrete scroll handler - one scroll = one slide change
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      
      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTime.current;
      
      // Much more aggressive throttling to prevent double triggers
      if (timeSinceLastScroll < 800 || isScrolling.current) {
        return;
      }
      
      lastScrollTime.current = now;
      isScrolling.current = true;
      
      // Only trigger on significant scroll movement
      if (Math.abs(event.deltaY) > 30) {
        // Determine scroll direction
        if (event.deltaY > 0) {
          // Scrolling down - next slide
          showNextStory();
        } else {
          // Scrolling up - previous slide
          showPrevStory();
        }
      }
      
      // Reset scrolling flag after animation completes
      setTimeout(() => {
        isScrolling.current = false;
      }, 700);
    };

    // Touch handling for mobile swipe
    let touchStartY = 0;
    let touchStartTime = 0;
    
    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0].clientY;
      touchStartTime = Date.now();
    };
    
    const handleTouchEnd = (event: TouchEvent) => {
      const touchEndY = event.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      const deltaY = touchStartY - touchEndY;
      const deltaTime = touchEndTime - touchStartTime;
      
      // Only register as swipe if it's fast enough and long enough
      if (Math.abs(deltaY) > 50 && deltaTime < 300) {
        event.preventDefault();
        
        if (isScrolling.current) return;
        
        isScrolling.current = true;
        
        if (deltaY > 0) {
          // Swiped up - next slide
          showNextStory();
        } else {
          // Swiped down - previous slide
          showPrevStory();
        }
        
        setTimeout(() => {
          isScrolling.current = false;
        }, 600);
      }
    };

    // Wait for refs to be populated
    const timer = setTimeout(() => {
      // Add event listeners
      document.addEventListener('keydown', handleKeyPress);
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: false });
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyPress);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [showNextStory, showPrevStory]);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full bg-white overflow-hidden">
        
        {/* Desktop Layout */}
        <div className="hidden md:grid w-full h-screen grid-cols-2 gap-0">
          
          {/* Left Side - Image */}
          <div className="relative bg-white p-12">
            {storySlides.map((slide, index) => (
              <div
                key={index}
                ref={el => { 
                  imagesRef.current[index] = el; // Desktop images: 0-14
                }}
                className="absolute inset-12"
                style={{ opacity: index === 0 ? 1 : 0 }}
              >
                <img
                  src={slide.src}
                  alt={`story image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    console.error(`Failed to load image: ${slide.src}`);
                    console.log('Image element:', e.target);
                  }}
                  onLoad={() => {
                    console.log(`Successfully loaded: ${slide.src}`);
                  }}
                />
              </div>
            ))}
          </div>

          {/* Right Side - Orange Circle + Content */}
          <div className="relative bg-white flex flex-col">
            
            {/* Top Navigation */}
            <div className="p-8 pb-4">
              <button
                onClick={() => navigate('/')}
                className="font-bold text-black border border-black px-4 py-2 hover:bg-black hover:text-white transition-all duration-200 uppercase tracking-wide"
                style={{ fontSize: '9pt', lineHeight: '14pt' }}
              >
                ← BACK TO ORIGEN
              </button>
            </div>

            {/* Orange Circle - Centered and aligned with text */}
            <div className="flex-1 flex items-start justify-center pt-8">
              <div 
                ref={circleRef}
                className="rounded-full bg-orange-500"
                style={{ 
                  width: '280px', 
                  height: '280px'
                }}
              />
            </div>

            {/* Text Content - Aligned with Circle */}
            <div className="px-8 pb-4 relative" style={{ minHeight: '200px' }}>
              {storySlides.map((slide, index) => (
                <div
                  key={index}
                  ref={el => { textsRef.current[index] = el; }} // Desktop texts: 0-14
                  className="absolute inset-x-8"
                  style={{ opacity: index === 0 ? 1 : 0 }}
                >
                  <p className="text-black leading-relaxed max-w-lg" style={{ fontSize: '14pt', lineHeight: '22pt' }}>
                    {slide.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom Controls */}
            <div className="px-8 pb-8 space-y-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={showPrevStory}
                  aria-label="Previous slide"
                  className="font-bold text-black border border-black px-3 py-1 hover:bg-black hover:text-white transition-all duration-200 uppercase tracking-wide"
                  style={{ fontSize: '9pt', lineHeight: '14pt' }}
                >
                  PREV
                </button>
                <button
                  onClick={showNextStory}
                  aria-label="Next slide"
                  className="font-bold text-black border border-black px-3 py-1 hover:bg-black hover:text-white transition-all duration-200 uppercase tracking-wide"
                  style={{ fontSize: '9pt', lineHeight: '14pt' }}
                >
                  NEXT
                </button>
              </div>
              
              {/* Dots navigation */}
              <div className="flex flex-wrap gap-1">
                {storySlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => changeStory(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`w-3 h-3 rounded-full transition-all ${
                      idx === currentStoryIndex ? 'bg-orange-500' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden w-full h-screen flex flex-col">
          
          {/* Top Navigation */}
          <div className="p-6 pb-3">
            <button
              onClick={() => navigate('/')}
              className="font-bold text-black border border-black px-3 py-1 hover:bg-black hover:text-white transition-all duration-200 uppercase tracking-wide"
              style={{ fontSize: '8pt', lineHeight: '12pt' }}
            >
              ← BACK
            </button>
          </div>

          {/* Image Section */}
          <div className="relative bg-white px-6 py-3 flex-1">
            {storySlides.map((slide, index) => (
              <div
                key={index}
                ref={el => { imagesRef.current[storySlides.length + index] = el; }} // Mobile images: 15-29
                className="absolute inset-6"
                style={{ opacity: index === 0 ? 1 : 0 }}
              >
                <img
                  src={slide.src}
                  alt={`story image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    console.error(`Failed to load image: ${slide.src}`);
                    console.log('Image element:', e.target);
                  }}
                  onLoad={() => {
                    console.log(`Successfully loaded: ${slide.src}`);
                  }}
                />
              </div>
            ))}
          </div>

          {/* Bottom Section - Circle + Text + Controls */}
          <div className="bg-white px-6 pb-6">
            
            {/* Orange Circle - Better sized for mobile */}
            <div className="flex justify-center py-6">
              <div 
                ref={circleRef}
                className="rounded-full bg-orange-500"
                style={{ 
                  width: '140px', 
                  height: '140px'
                }}
              />
            </div>

            {/* Text Content */}
            <div className="relative mb-6 px-2" style={{ minHeight: '140px' }}>
              {storySlides.map((slide, index) => (
                <div
                  key={index}
                  ref={el => { textsRef.current[storySlides.length + index] = el; }} // Mobile texts: 15-29
                  className="absolute inset-x-2 inset-y-0"
                  style={{ opacity: index === 0 ? 1 : 0 }}
                >
                  <p className="text-black leading-relaxed text-center" style={{ fontSize: '13pt', lineHeight: '20pt' }}>
                    {slide.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={showPrevStory}
                  aria-label="Previous slide"
                  className="font-bold text-black border border-black px-3 py-2 hover:bg-black hover:text-white transition-all duration-200 uppercase tracking-wide"
                  style={{ fontSize: '9pt', lineHeight: '13pt' }}
                >
                  PREV
                </button>
                <button
                  onClick={showNextStory}
                  aria-label="Next slide"
                  className="font-bold text-black border border-black px-3 py-2 hover:bg-black hover:text-white transition-all duration-200 uppercase tracking-wide"
                  style={{ fontSize: '9pt', lineHeight: '13pt' }}
                >
                  NEXT
                </button>
              </div>
              
              {/* Dots navigation */}
              <div className="flex flex-wrap gap-2 justify-center">
                {storySlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => changeStory(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`w-3 h-3 rounded-full transition-all ${
                      idx === currentStoryIndex ? 'bg-orange-500' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
        
    </div>
  );
};

export default StoryPage;