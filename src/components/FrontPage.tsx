import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin once at module load.
gsap.registerPlugin(ScrollTrigger);

/**
 * FrontPage – A simple scroll-driven landing section.
 *
 * The page starts completely white, with a small 20 px diameter circle (#FF6700)
 * in the centre of the viewport. As the user scrolls down, GSAP smoothly scales
 * the circle up (driven by ScrollTrigger). The container is given extra height
 * so that there is room to scroll and experience the animation.
 */

interface FrontPageProps {
  onTimer: () => void;
  onCoffee: () => void;
}

const FrontPage: React.FC<FrontPageProps> = ({ onTimer, onCoffee }) => {
  const circleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!circleRef.current || !containerRef.current) return;

    // We use a GSAP context to ensure animations are properly cleaned up when
    // React unmounts the component.
    const ctx = gsap.context(() => {
      gsap.fromTo(
        circleRef.current,
        { width: 20, height: 20 },
        {
          width: 400,
          height: 400,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: '+=100%', // animation lasts for the first viewport-length of scroll
            scrub: true,
          },
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[200vh] overflow-hidden bg-white">
      {/* Viewport-sized frame to keep the circle centred on load */}
      <div className="relative h-screen w-full flex items-center justify-center">
        {/* Animated circle */}
        <div
          ref={circleRef}
          className="rounded-full bg-[#FF6700] pointer-events-none"
          style={{ width: 20, height: 20 }}
        />

        {/* Action buttons fixed near the bottom of the first viewport */}
        <div className="absolute inset-x-0 bottom-10 flex justify-center gap-4">
          <button
            onClick={onTimer}
            className="px-6 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-[#ff6700] transition-colors"
          >
            Timer
          </button>
          <button
            onClick={onCoffee}
            className="px-6 py-2 rounded-full border border-black text-black text-sm font-medium hover:bg-[#ff6700] hover:text-white transition-colors"
          >
            Coffee
          </button>
        </div>
      </div>
    </section>
  );
};

export default FrontPage; 