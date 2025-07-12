import React, { useState, useEffect, useRef } from 'react';
import { useCircleTransition } from '../context/CircleTransitionContext';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

const CoffeePage: React.FC = () => {
  const { navigateWithTransition } = useCircleTransition();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const handleNavigateWithFade = (to: string) => {
    // Fade out content only (keep navigation visible)
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          navigateWithTransition(to);
        }
      });
    } else {
      navigateWithTransition(to);
    }
  };

  useEffect(() => {
    if (contentRef.current) {
      // Start content invisible (navigation stays visible)
      gsap.set(contentRef.current, { opacity: 0, y: 20 });
      
      // Fade in content after circle transition completes
      gsap.to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.9 // Wait for circle transition to complete
      });
    }

    // Cleanup function
    return () => {
      if (contentRef.current) {
        gsap.killTweensOf(contentRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white text-black relative overflow-hidden">
      {/* Left Side Navigation */}
      <nav ref={navRef} className="fixed left-0 top-0 h-full z-50 pointer-events-none">
        <div className="h-full flex flex-col justify-between py-8 pl-3" style={{ marginLeft: 'env(safe-area-inset-left, 0)' }}>
          {/* origen */}
          <button 
            onClick={() => handleNavigateWithFade('/')}
            className="p-3 text-base font-medium text-black hover:text-[#ff6700] transition-colors pointer-events-auto touch-manipulation"
          >
            origen
          </button>
          
          {/* about */}
          <button 
            onClick={() => handleNavigateWithFade('/about')}
            className="p-3 text-base font-medium text-black hover:text-[#ff6700] transition-colors pointer-events-auto touch-manipulation"
          >
            about
          </button>
          
          {/* coffee */}
          <button 
            onClick={() => handleNavigateWithFade('/coffee')}
            className="p-3 text-base font-medium text-[#ff6700] transition-colors pointer-events-auto touch-manipulation"
          >
            coffee
          </button>
          
          {/* timer */}
          <button 
            onClick={() => navigate('/timer')}
            className="p-3 text-base font-medium text-black hover:text-[#ff6700] transition-colors pointer-events-auto touch-manipulation"
          >
            timer
          </button>
        </div>
      </nav>

            {/* All content wrapped in contentRef */}
      <div ref={contentRef}>
        {/* Centered Headline */}
        <div className="pt-16 pb-8 text-center relative z-40">
          <p className="text-lg text-gray-700 leading-relaxed max-w-md mx-auto">
            The next roast will yield ~300 bags (250g each) from Oscar Castro's high-altitude micro-lot in Charalá, Santander.
          </p>
        </div>
      </div>

      {/* Form Content Inside Circle - Outside contentRef so it doesn't fade */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pb-16 pointer-events-none">
        <div className="text-center text-white px-8 pointer-events-none">
          <div className="max-w-md mx-auto space-y-6 pointer-events-auto">
            <p className="text-lg leading-relaxed">
              Sign up to get notified right before the next roast.<br />
              NYC orders will include optional free bike delivery!
            </p>
            
            {submitted ? (
              <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
                <p className="text-white font-semibold mb-2">You're on the list!</p>
                <p className="text-white text-sm opacity-90">
                  We'll notify you as soon as the next roast drop is ready.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-transparent border-2 border-white rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-white"
                  style={{ fontSize: '16px' }} // Prevent zoom on iOS
                />
                <button
                  type="submit"
                  className="w-full px-6 py-4 rounded-lg border-2 border-white text-white font-medium hover:bg-white hover:text-[#ff6700] transition-all duration-300"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoffeePage; 