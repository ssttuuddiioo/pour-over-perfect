import React, { useEffect, useRef, useState } from 'react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  // Improved scroll function that accounts for mobile navigation
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        // Account for mobile navigation height (approximately 80px)
        const navHeight = 80;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Section configurations for circle animation
  const sectionConfigs = [
    { id: 'home', size: window.innerWidth <= 768 ? 200 : 360, scale: window.innerWidth <= 768 ? 0.5 : 0.8 },
    { id: 'origen', size: window.innerWidth <= 768 ? 300 : 560, scale: window.innerWidth <= 768 ? 0.7 : 1.2 },
    { id: 'coffee', size: window.innerWidth <= 768 ? 400 : 650, scale: window.innerWidth <= 768 ? 0.9 : 1.3 },
    { id: 'buy', size: window.innerWidth <= 768 ? 720 : 750, scale: window.innerWidth <= 768 ? 1.5 : 1.5 }
  ];

  useEffect(() => {
    if (!circleRef.current) return;

    // Detect mobile device
    const isMobile = window.innerWidth <= 768;
    
    // Smooth mobile experience with 60fps circle animation
    if (isMobile) {
      // Set up section detection for navigation
      sectionConfigs.forEach((config) => {
        const element = document.getElementById(config.id);
        if (!element) return;

        ScrollTrigger.create({
          trigger: element,
          start: "top center",
          end: "bottom center",
          refreshPriority: -1,
          onEnter: () => setActiveSection(config.id),
          onEnterBack: () => setActiveSection(config.id),
        });
      });

      // Smooth circle animation with interpolation for mobile
      const createSmoothCircleAnimation = () => {
        const totalSections = sectionConfigs.length;
        
        ScrollTrigger.create({
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.1, // Very smooth scrub for mobile
          refreshPriority: -1,
          onUpdate: self => {
            const progress = self.progress;
            const sectionIndex = Math.floor(progress * (totalSections - 1));
            const sectionProgress = (progress * (totalSections - 1)) - sectionIndex;
            
            // Get current and next section configs
            const currentConfig = sectionConfigs[sectionIndex];
            const nextConfig = sectionConfigs[Math.min(sectionIndex + 1, totalSections - 1)];
            
            // Smooth interpolation between sections
            const size = gsap.utils.interpolate(currentConfig.size, nextConfig.size, sectionProgress);
            const scale = gsap.utils.interpolate(currentConfig.scale, nextConfig.scale, sectionProgress);
            
            // Use gsap.set for immediate updates with hardware acceleration
            gsap.set(circleRef.current, {
              width: size,
              height: size,
              scale: scale,
              force3D: true,
              transformOrigin: "center center",
              willChange: "transform, width, height" // Optimize for animations
            });
          }
        });
      };

      // Initialize smooth animation
      createSmoothCircleAnimation();
      
      // Initialize circle for mobile with hardware acceleration
      gsap.set(circleRef.current, {
        width: sectionConfigs[0].size,
        height: sectionConfigs[0].size,
        scale: sectionConfigs[0].scale,
        force3D: true,
        transformOrigin: "center center",
        willChange: "transform, width, height"
      });

      return () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    }

    // Desktop experience with full animations
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
        
        // Get current and next section configs
        const currentConfig = sectionConfigs[sectionIndex];
        const nextConfig = sectionConfigs[Math.min(sectionIndex + 1, totalSections - 1)];
        
        // Interpolate between current and next section
        const size = gsap.utils.interpolate(currentConfig.size, nextConfig.size, sectionProgress);
        const scale = gsap.utils.interpolate(currentConfig.scale, nextConfig.scale, sectionProgress);
        
        gsap.set(circleRef.current, {
          width: size,
          height: size,
          scale: scale
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
        onEnter: () => setActiveSection(config.id),
        onEnterBack: () => setActiveSection(config.id),
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
    gsap.set(circleRef.current, {
      width: sectionConfigs[0].size,
      height: sectionConfigs[0].size,
      scale: sectionConfigs[0].scale,
      transformOrigin: "center center"
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Fixed Navigation - Left side on desktop, bottom on mobile */}
      {/* Desktop Navigation - Left side */}
      <nav className="hidden md:block fixed left-0 top-0 h-full z-50 pointer-events-none">
        <div className="h-full flex flex-col justify-center px-2 sm:px-4 md:px-6 lg:px-8 space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8" style={{ marginLeft: 'env(safe-area-inset-left, 0)' }}>
          <button
            onClick={() => scrollToSection('home')}
            className={`text-base sm:text-lg md:text-xl lg:text-2xl font-medium transition-opacity pointer-events-auto text-left ${
              activeSection === 'home' 
                ? 'text-black underline' 
                : 'text-black hover:opacity-70 hover:underline'
            }`}
          >
            home
          </button>
          <button
            onClick={() => scrollToSection('origen')}
            className={`text-base sm:text-lg md:text-xl lg:text-2xl font-medium transition-opacity pointer-events-auto text-left ${
              activeSection === 'origen' 
                ? 'text-black underline' 
                : 'text-black hover:opacity-70 hover:underline'
            }`}
          >
            origen
          </button>
          <button
            onClick={() => scrollToSection('coffee')}
            className={`text-base sm:text-lg md:text-xl lg:text-2xl font-medium transition-opacity pointer-events-auto text-left ${
              activeSection === 'coffee' 
                ? 'text-black underline' 
                : 'text-black hover:opacity-70 hover:underline'
            }`}
          >
            coffee
          </button>
          <button
            onClick={() => scrollToSection('buy')}
            className={`text-base sm:text-lg md:text-xl lg:text-2xl font-medium transition-opacity pointer-events-auto text-left ${
              activeSection === 'buy' 
                ? 'text-black underline' 
                : 'text-black hover:opacity-70 hover:underline'
            }`}
          >
            buy
          </button>
          <button
            onClick={() => navigate('/timer')}
            className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-black hover:opacity-70 hover:underline transition-opacity pointer-events-auto text-left"
          >
            timer
          </button>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom with improved styling */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center py-3 px-4 safe-area-bottom">
          <button
            onClick={() => scrollToSection('home')}
            className={`text-sm font-medium transition-all duration-200 py-2 px-1 rounded ${
              activeSection === 'home' 
                ? 'text-black underline' 
                : 'text-gray-600 hover:text-black active:scale-95'
            }`}
          >
            home
          </button>
          <button
            onClick={() => scrollToSection('origen')}
            className={`text-sm font-medium transition-all duration-200 py-2 px-1 rounded ${
              activeSection === 'origen' 
                ? 'text-black underline' 
                : 'text-gray-600 hover:text-black active:scale-95'
            }`}
          >
            origen
          </button>
          <button
            onClick={() => scrollToSection('coffee')}
            className={`text-sm font-medium transition-all duration-200 py-2 px-1 rounded ${
              activeSection === 'coffee' 
                ? 'text-black underline' 
                : 'text-gray-600 hover:text-black active:scale-95'
            }`}
          >
            coffee
          </button>
          <button
            onClick={() => scrollToSection('buy')}
            className={`text-sm font-medium transition-all duration-200 py-2 px-1 rounded ${
              activeSection === 'buy' 
                ? 'text-black underline' 
                : 'text-gray-600 hover:text-black active:scale-95'
            }`}
          >
            buy
          </button>
          <button
            onClick={() => navigate('/timer')}
            className="text-sm font-medium text-gray-600 hover:text-black transition-all duration-200 py-2 px-1 rounded active:scale-95"
          >
            timer
          </button>
        </div>
      </nav>

      {/* Sections */}
      <div className="scroll-smooth">
        {/* Home Section */}
        <section id="home" className="min-h-screen flex items-center justify-center relative pb-20 md:pb-0">
          <div className="text-center">
            {/* Minimal home section - just the circle and navigation */}
          </div>
        </section>

        {/* Origen Section */}
        <section id="origen" className="min-h-screen text-black flex items-center justify-end relative pb-20 md:pb-8">
          <div className="max-w-2xl w-full flex items-center justify-end px-4 sm:px-6 md:px-16 lg:px-20 xl:px-24 py-6 sm:py-8 relative z-40">
            <div className="max-w-2xl text-sm sm:text-base md:text-lg text-black leading-relaxed space-y-3 sm:space-y-4 md:space-y-6">
              <p className="section-content">
                Charalá, Santander is a quiet town nestled in Colombia's eastern Andes, known for its rugged mountains, local markets, and a pace that invites you to slow down. I ended up there by chance, exhausted, sunburnt, and one-third of the way through Transcordilleras, a 1,000-kilometer bikepacking race with over 20,000 meters of climbing. I wasn't ready. Not mentally, not physically. By day three, I handed in my tracker and decided to ride back to Bogota on my own terms.
              </p>
              <p className="section-content">
                I stayed behind as the other riders left. Over lunch, I asked the hostel manager if he knew any coffee producers. He made a call. A few hours later, Oscar Castro pulled up in his pickup and invited me to visit his farm.
              </p>
              <p className="section-content">
                Oscar's farm, Bellavista, sits at 1,900 MASL above Charalá. He works a few hectares of land alongside his family and neighbors, also family, pooling their harvests to sell in town. The variety is Castillo, a hardy hybrid that thrives at altitude. It's delicate, floral, sweet, with notes of soft orchard fruit and a structured, clean finish.
              </p>
              <p className="section-content">
                This coffee was grown, harvested, sourced, exported, roasted, and packed through small, independent efforts. I'm still learning as I go leaning on a generous coffee community in New York with shared tools like the roasting at MultiModal.
              </p>
            </div>
          </div>
        </section>

        {/* Coffee Section */}
        <section id="coffee" className="min-h-screen text-black flex flex-col items-start justify-center px-4 sm:px-6 md:pl-40 lg:pl-26 xl:pl-100 pr-4 sm:pr-6 md:pr-16 lg:pr-24 xl:pr-32 py-6 sm:py-8 pb-20 md:pb-8 relative">
          <div className="max-w-2xl w-full relative z-40 text-left">
            <div className="text-black leading-relaxed space-y-4 sm:space-y-6 md:space-y-8">
              <p className="section-content text-sm sm:text-base leading-relaxed">
                This lot was grown and milled on-site by Oscar Castro in Charalá, Colombia. Unlike most coffees, which pass through several stages before roasting, this one stayed close to the ground. Oscar handled both production and milling; we purchased directly, managed export and import independently, and roasted in New York. It's a vertically streamlined process built on trust, transparency, and shared effort.
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

                  {/* Variety & Process */}
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="font-medium text-base sm:text-lg">Variety & Process</h3>
                    <div className="text-sm sm:text-base">
                      <p className="font-medium mb-2 sm:mb-3">Castillo (Washed)</p>
                      <ul className="space-y-1 text-sm sm:text-base">
                        <li>• Hand-picked at peak ripeness</li>
                        <li>• Fermented overnight</li>
                        <li>• Washed the following morning</li>
                        <li>• Dried under indirect sun</li>
                        <li>• Milled on-farm by producer</li>
                      </ul>
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
        </section>

        {/* Buy Section - Improved mobile experience */}
        <section id="buy" className="min-h-screen text-black flex flex-col items-center justify-center px-4 sm:px-6 md:pl-32 lg:pl-28 xl:pl-24 md:pr-8 lg:pr-12 xl:pr-16 py-6 sm:py-8 pb-24 md:pb-8 relative">
          <div className="max-w-sm w-full text-left relative z-40">
            <div className="section-content mb-6 sm:mb-8">
              <p className="text-sm sm:text-base lg:text-lg text-black mb-4 sm:mb-6 leading-relaxed">
                The next roast will be a small one, about 50kg. So they'll sell fast. Drop your email to stay in the loop, and we'll let you pre-order once we have everything in order.
              </p>
              
              {/* Improved email form */}
              <div className="section-content">
                {!submitted ? (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-transparent border-0 border-b border-black px-0 py-3 text-sm sm:text-base focus:outline-none focus:border-b-2 placeholder-gray-500 transition-all"
                      placeholder="your@email.com"
                    />
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
        </section>
      </div>
    </div>
  );
};

export default HomePage; 