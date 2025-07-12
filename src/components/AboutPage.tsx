import React, { useEffect, useRef } from 'react';
import { useCircleTransition } from '../context/CircleTransitionContext';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

const AboutPage: React.FC = () => {
  const { navigateWithTransition } = useCircleTransition();
  const navigate = useNavigate();
  const navRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-6 relative">
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
            className="p-3 text-base font-medium text-[#ff6700] transition-colors pointer-events-auto touch-manipulation"
          >
            about
          </button>
          
          {/* coffee */}
          <button 
            onClick={() => handleNavigateWithFade('/coffee')}
            className="p-3 text-base font-medium text-black hover:text-[#ff6700] transition-colors pointer-events-auto touch-manipulation"
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

      {/* Content positioned to work with circle on the left */}
      <div ref={contentRef} className="max-w-2xl relative z-40" style={{ marginLeft: '560px', marginRight: '2rem' }}>
        <div className="text-lg md:text-xl lg:text-2xl text-black leading-relaxed space-y-6">
          <p>
            Charalá, Santander is known for its stunning mountains, adventure activities, traditional cuisine, and a quiet rhythm that invites you to stay awhile.
          </p>
          
          <p>
            I found myself in Charalá after a grueling bikepacking race across the Andes. The race, Transcordilleras, spans about 1,000 kilometers with over 20,000 meters of climbing. It was insane. I only made it through a third of it. I wasn't ready mentally or physically, I was too used to the flatness of New York and wanting to stop at every mountain bend to take in the vista. On the third day of the race I turned in my tracker and decided to take my time, a theme that has carried us to the words on this page. I continued my bike ride moving with intention, noticing where I am, and letting the road unfold on its own terms.
          </p>
          
          <p>
            After the other riders moved on in the morning, I stayed. I went to the local market and saw a bit of coffee commerce, and over lunch I casually asked the hostel manager if he knew any coffee producers. Miguel called a friend, and soon enough Oscar Castro rolled down from his farm in his pickup and we drove right back up together.
          </p>
          
          <p>
            Oscar's farm, Bellavista, sits above Charalá at 1900 MASL. He's got about xxhectares that he works with his family and neighbors, also family, pooling their harvests to sell collectively in town.
          </p>
          
          <p>
            The coffee is Castillo, a hybrid variety known for its resilience at high altitudes. In this lot, it's floral and sweet, with soft orchard fruit character, bright but not citric, and a clean, structured finish. Drying took place under 'poco sol' soft, and indirect sun, allowing for a gradual finish that preserves nuance and clarity in the cup.
          </p>
          
          <p>
            This coffee was grown, sourced, exported, roasted, and packed through a small independent processes. But it hasn't been a solo effort. I've leaned on family for shipping support, and in New York I've found a generous coffee community and a shared roasting space where I've been learning every step of the way. Shout out to MultiModal and Paolo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 