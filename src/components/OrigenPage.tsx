import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCircleTransition } from '../context/CircleTransitionContext';

gsap.registerPlugin(ScrollTrigger);

const OrigenPage: React.FC = () => {
  const { circleRef } = useCircleTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!circleRef.current || !containerRef.current) return;

    // OrigenPage manages its own circle animation
    const animateCircle = () => {
      gsap.to(circleRef.current, {
        width: 480,
        height: 480,
        scale: 1.0,
        duration: 0.8,
        ease: "power2.out"
      });
    };

    // Initialize circle animation
    animateCircle();

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [circleRef]);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen w-full bg-white relative overflow-hidden"
    >
      {/* Background text - appears above circle (z-2) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <h1 className="text-8xl md:text-9xl font-bold text-black opacity-5 select-none">
          ORIGEN
        </h1>
      </div>

      {/* Main content - appears above circle (z-2) */}
      <div className="relative z-10 p-8 md:p-16">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="content-fade mb-12 text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-black mb-4">
              Origen
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the origins of exceptional coffee. Each bean tells a story of terroir, 
              craftsmanship, and the pursuit of perfection.
            </p>
          </div>

          {/* Additional content */}
          <div className="content-fade text-center">
            <div className="max-w-4xl mx-auto">
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-8">
                From the highlands of Colombia to the volcanic slopes of Guatemala, 
                every cup begins with a seed, nurtured by soil, sun, and the skilled 
                hands of farmers who understand that great coffee is both art and science.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-black mb-3">Altitude</h3>
                  <p className="text-gray-600">1,200 - 2,000 meters above sea level</p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-black mb-3">Harvest</h3>
                  <p className="text-gray-600">Hand-picked at peak ripeness</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrigenPage; 