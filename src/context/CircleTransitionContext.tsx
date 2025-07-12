import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

// Circle animation states for different pages
export type CircleMode = 'front' | 'timer' | 'coffee' | 'about' | 'contact' | 'calm';

interface CircleState {
  mode: CircleMode;
  isTransitioning: boolean;
  isVisible: boolean;
}

interface CircleTransitionContextType {
  circleState: CircleState;
  circleRef: React.RefObject<HTMLDivElement>;
  navigateWithTransition: (to: string) => void;
  setCircleMode: (mode: CircleMode) => void;
}

const CircleTransitionContext = createContext<CircleTransitionContextType | undefined>(undefined);

export const useCircleTransition = () => {
  const context = useContext(CircleTransitionContext);
  if (!context) {
    throw new Error('useCircleTransition must be used within a CircleTransitionProvider');
  }
  return context;
};

interface CircleTransitionProviderProps {
  children: ReactNode;
}

export const CircleTransitionProvider: React.FC<CircleTransitionProviderProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const circleRef = useRef<HTMLDivElement>(null);
  
  const [circleState, setCircleState] = useState<CircleState>({
    mode: 'front',
    isTransitioning: false,
    isVisible: true
  });

  // Map routes to circle modes
  const getCircleModeFromPath = (path: string): CircleMode => {
    switch (path) {
      case '/': return 'front';
      case '/timer': return 'timer';
      case '/coffee': return 'coffee';
      case '/about': return 'about';
      case '/contact': return 'contact';
      case '/calm': return 'calm';
      default: return 'front';
    }
  };

  // Animation configurations for each mode
  const getAnimationConfig = (mode: CircleMode) => {
    const maxDimension = Math.max(window.innerWidth, window.innerHeight);
    
    switch (mode) {
      case 'front':
        return {
          width: 480,
          height: 480,
          left: '50%',
          top: '50%',
          scale: 1,
          xPercent: -50,
          yPercent: -50,
          x: 0,
          y: 0,
          duration: 0.8,
          ease: 'power2.out'
        };
      case 'timer':
        return {
          width: 200,
          height: 200,
          left: window.innerWidth - 120,
          top: 120,
          scale: 1,
          xPercent: -50,
          yPercent: -50,
          x: 0,
          y: 0,
          duration: 0.8,
          ease: 'power2.out'
        };
      case 'coffee':
        return {
          width: Math.max(window.innerWidth, window.innerHeight) * .4,
          height: Math.max(window.innerWidth, window.innerHeight) * .4,
          left: '50%',
          top: window.innerHeight * 0.85,
          scale: 3,
          xPercent: -50,
          yPercent: 30,
          x: 0,
          y: 0,
          duration: 0.8,
          ease: 'power2.out'
        };
      case 'about':
        return {
          width: 816,
          height: 816,
          left: window.innerWidth * 0.08,
          top: '50%',
          scale: 1,
          xPercent: 0,
          yPercent: -50,
          x: 0,
          y: 0,
          duration: 0.8,
          ease: 'power2.out'
        };
      case 'contact':
      case 'calm':
        return {
          width: maxDimension * 1.2,
          height: maxDimension * 1.2,
          left: '50%',
          top: '50%',
          scale: 1,
          xPercent: -50,
          yPercent: -50,
          x: 0,
          y: 0,
          duration: 0.8,
          ease: 'power2.out'
        };
      default:
        return {
          width: 480,
          height: 480,
          left: '50%',
          top: '50%',
          scale: 1,
          xPercent: -50,
          yPercent: -50,
          x: 0,
          y: 0,
          duration: 0.8,
          ease: 'power2.out'
        };
    }
  };

  const animateCircle = (mode: CircleMode, onComplete?: () => void) => {
    if (!circleRef.current) return;

    const config = getAnimationConfig(mode);
    
    setCircleState(prev => ({ ...prev, isTransitioning: true }));
    
    gsap.to(circleRef.current, {
      ...config,
      onComplete: () => {
        setCircleState(prev => ({ 
          ...prev, 
          mode, 
          isTransitioning: false 
        }));
        onComplete?.();
      }
    });
  };

  const navigateWithTransition = (to: string) => {
    const newMode = getCircleModeFromPath(to);
    
    // Prevent re-animation if already in the target mode
    if (newMode === circleState.mode) {
      navigate(to);
      return;
    }
    
    // Start transition
    animateCircle(newMode, () => {
      // Navigate after animation
      navigate(to);
    });
  };

  const setCircleMode = (mode: CircleMode) => {
    if (mode !== circleState.mode) {
      animateCircle(mode);
    }
  };

  // Update circle mode when location changes
  useEffect(() => {
    const newMode = getCircleModeFromPath(location.pathname);

    if (location.pathname === '/timer') {
      if (circleRef.current) {
        gsap.set(circleRef.current, { opacity: 0, pointerEvents: 'none' });
      }
      setCircleState(prev => ({ ...prev, isVisible: false, mode: 'timer' }));
      return;
    } else if (!circleState.isVisible) {
      if (circleRef.current) {
        gsap.set(circleRef.current, { opacity: 1, pointerEvents: 'auto' });
      }
      setCircleState(prev => ({ ...prev, isVisible: true }));
    }

    if (newMode !== circleState.mode && !circleState.isTransitioning) {
      animateCircle(newMode);
    }
  }, [location.pathname]);

  // Initialize circle position on mount
  useEffect(() => {
    if (circleRef.current) {
      const initialMode = getCircleModeFromPath(location.pathname);
      const config = getAnimationConfig(initialMode);
      
      // Use a small delay to ensure DOM is ready
      setTimeout(() => {
        if (circleRef.current) {
          gsap.set(circleRef.current, {
            width: config.width,
            height: config.height,
            left: config.left,
            top: config.top,
            x: config.x,
            y: config.y,
            xPercent: config.xPercent,
            yPercent: config.yPercent,
            scale: config.scale
          });
          
          setCircleState(prev => ({ ...prev, mode: initialMode }));
        }
      }, 100);
    }
  }, []);

  return (
    <CircleTransitionContext.Provider value={{
      circleState,
      circleRef,
      navigateWithTransition,
      setCircleMode
    }}>
      {children}
    </CircleTransitionContext.Provider>
  );
}; 