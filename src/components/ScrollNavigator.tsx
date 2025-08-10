import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useCircleTransition } from '../context/CircleTransitionContext';
import FrontPage from './FrontPage';
import OrigenPage from './OrigenPage';
import AboutPage from './AboutPage';
import CoffeePage from './CoffeePage';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

interface ScrollSection {
  id: string;
  path: string;
  component: React.ReactNode;
  circleScale: number;
  circleSize: number;
}

const ScrollNavigator: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { circleRef } = useCircleTransition();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Define the scroll sections in order
  const sections: ScrollSection[] = [
    {
      id: 'home',
      path: '/',
      component: <FrontPage />,
      circleScale: 0.5,
      circleSize: 240
    },
    {
      id: 'origen',
      path: '/origen',
      component: <OrigenPage />,
      circleScale: 0.8,
      circleSize: 384
    },
    {
      id: 'about',
      path: '/about',
      component: <AboutPage />,
      circleScale: 1.2,
      circleSize: 576
    },
    {
      id: 'buy',
      path: '/coffee',
      component: <CoffeePage />,
      circleScale: 1.5,
      circleSize: 720
    }
  ];

  // Get current section index from URL
  const getCurrentSectionIndex = () => {
    const index = sections.findIndex(section => section.path === location.pathname);
    return index !== -1 ? index : 0;
  };

  // Handle scroll to section
  const scrollToSection = (index: number) => {
    if (scrollContainerRef.current && sectionsRef.current[index]) {
      setIsScrolling(true);
      
      gsap.to(scrollContainerRef.current, {
        scrollTo: { y: sectionsRef.current[index], offsetY: 0 },
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
          setIsScrolling(false);
        }
      });
    }
  };

  // Handle circle animation
  const animateCircle = (section: ScrollSection, progress: number = 1) => {
    if (!circleRef.current) return;

    const targetSize = section.circleSize * progress;
    const targetScale = section.circleScale * progress;

    gsap.to(circleRef.current, {
      width: targetSize,
      height: targetSize,
      scale: targetScale,
      duration: 0.6,
      ease: "power2.out"
    });
  };

  // Handle URL navigation from external sources
  useEffect(() => {
    const targetIndex = getCurrentSectionIndex();
    if (targetIndex !== currentSection) {
      setCurrentSection(targetIndex);
      scrollToSection(targetIndex);
      animateCircle(sections[targetIndex]);
    }
  }, [location.pathname]);

  // Setup scroll triggers
  useEffect(() => {
    if (!scrollContainerRef.current || !circleRef.current) return;

    const container = scrollContainerRef.current;
    const circle = circleRef.current;
    
    // Kill existing scroll triggers
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    // Create scroll triggers for each section
    sections.forEach((section, index) => {
      const element = sectionsRef.current[index];
      if (!element) return;

      ScrollTrigger.create({
        trigger: element,
        start: "top center",
        end: "bottom center",
        scroller: container,
        onEnter: () => {
          if (!isScrolling) {
            setCurrentSection(index);
            navigate(section.path, { replace: true });
            
            // Special handling for OrigenPage - let it manage its own circle animation
            if (section.id !== 'origen') {
              animateCircle(section);
            }
            
            // Fade in current section content
            gsap.fromTo(element.querySelectorAll('.content-fade'), 
              { opacity: 0, y: 20 }, 
              { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }
            );
          }
        },
        onLeave: () => {
          // Fade out section content
          gsap.to(element.querySelectorAll('.content-fade'), 
            { opacity: 0.6, duration: 0.4 }
          );
        },
        onEnterBack: () => {
          if (!isScrolling) {
            setCurrentSection(index);
            navigate(section.path, { replace: true });
            
            // Special handling for OrigenPage - let it manage its own circle animation
            if (section.id !== 'origen') {
              animateCircle(section);
            }
            
            // Fade in current section content
            gsap.fromTo(element.querySelectorAll('.content-fade'), 
              { opacity: 0, y: 20 }, 
              { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }
            );
          }
        }
      });

      // Create smooth circle scaling during scroll
      ScrollTrigger.create({
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scroller: container,
        onUpdate: (self) => {
          if (!isScrolling) {
            const progress = self.progress;
            const prevSection = sections[Math.max(0, index - 1)];
            const nextSection = sections[Math.min(sections.length - 1, index + 1)];
            
            // Interpolate circle size and scale based on scroll progress
            if (progress < 0.5) {
              // Transitioning from previous section
              const t = progress * 2;
              const size = gsap.utils.interpolate(prevSection.circleSize, section.circleSize, t);
              const scale = gsap.utils.interpolate(prevSection.circleScale, section.circleScale, t);
              
              gsap.set(circle, { width: size, height: size, scale });
            } else {
              // Transitioning to next section
              const t = (progress - 0.5) * 2;
              const size = gsap.utils.interpolate(section.circleSize, nextSection.circleSize, t);
              const scale = gsap.utils.interpolate(section.circleScale, nextSection.circleScale, t);
              
              gsap.set(circle, { width: size, height: size, scale });
            }
          }
        }
      });
    });

    // Initialize circle for current section
    animateCircle(sections[currentSection]);

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [currentSection, isScrolling]);

  // Handle navigation clicks
  const handleNavClick = (index: number) => {
    if (index === currentSection) return;
    
    setCurrentSection(index);
    navigate(sections[index].path);
    scrollToSection(index);
    animateCircle(sections[index]);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Fixed Navigation */}
      <nav className="fixed left-0 top-0 h-full z-50 pointer-events-none">
        <div className="h-full flex flex-col justify-center px-8 space-y-8" style={{ marginLeft: 'env(safe-area-inset-left, 0)' }}>
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => handleNavClick(index)}
              className={`text-2xl font-medium transition-all duration-300 pointer-events-auto touch-manipulation ${
                currentSection === index 
                  ? 'text-black underline' 
                  : 'text-black hover:opacity-70 hover:underline'
              }`}
            >
              {section.id === 'buy' ? 'buy' : section.id}
            </button>
          ))}
          
          {/* Timer link - separate from scroll navigation */}
          <button 
            onClick={() => navigate('/timer')}
            className="text-2xl font-medium text-black hover:opacity-70 hover:underline transition-opacity pointer-events-auto touch-manipulation"
          >
            timer
          </button>
        </div>
      </nav>

      {/* Scrollable Content */}
      <div 
        ref={scrollContainerRef}
        className="w-full h-full overflow-y-auto scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        {sections.map((section, index) => (
          <div
            key={section.id}
            ref={el => sectionsRef.current[index] = el!}
            className="min-h-screen w-full relative"
          >
            <div className="content-fade w-full h-full">
              {section.component}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollNavigator; 