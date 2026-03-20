import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

// Circle animation states for different pages
export type CircleMode = 'front' | 'timer' | 'coffee' | 'contact' | 'calm' | 'origen' | 'gallery';

interface AnimationConfig {
  width: number;
  height: number;
  scale: number;
  left: string;
  top: string;
  xPercent: number;
  yPercent: number;
  x: number;
  y: number;
  duration: number;
  ease: string;
}

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

export const CircleTransitionContext = createContext<CircleTransitionContextType | undefined>(undefined);

export const useCircleTransition = () => {
  const context = useContext(CircleTransitionContext);
  if (!context) {
    throw new Error('useCircleTransition must be used within a CircleTransitionProvider');
  }
  return context;
};

export const CircleTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      case '/': return 'gallery';
      case '/home': return 'front';
      case '/timer': return 'timer';
      case '/coffee': return 'coffee';
      case '/contact': return 'contact';
      case '/calm': return 'calm';
      case '/origen': return 'origen';
      default: return 'front';
    }
  };

  // Circle animation configurations
  const getAnimationConfig = (mode: CircleMode): AnimationConfig => {
    const baseConfig = {
      left: "50%",
      top: "50%",
      xPercent: -50,
      yPercent: -50,
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    };

    const configs: Record<CircleMode, AnimationConfig> = {
      gallery: { ...baseConfig, width: 240, height: 240, scale: 0.5 },
      front: { ...baseConfig, width: 240, height: 240, scale: 0.5 },
      origen: { ...baseConfig, width: 384, height: 384, scale: 0.8 },
      coffee: { ...baseConfig, width: 576, height: 576, scale: 1.2 },
      contact: { ...baseConfig, width: 480, height: 480, scale: 1 },
      calm: { ...baseConfig, width: 480, height: 480, scale: 1 },
      timer: { ...baseConfig, width: 480, height: 480, scale: 1 }
    };

    return configs[mode];
  };

  const navigateWithTransition = (path: string) => {
    navigate(path);
  };

  const setCircleMode = (mode: CircleMode) => {
    setCircleState(prev => ({ ...prev, mode }));
  };

  // Handle page visibility and mode updates
  useEffect(() => {
    const newMode = getCircleModeFromPath(location.pathname);

    if (location.pathname === '/timer') {
      if (circleRef.current) {
        gsap.set(circleRef.current, { opacity: 1, pointerEvents: 'auto' });
      }
      setCircleState(prev => ({ ...prev, isVisible: true, mode: 'timer' }));
    } else if (!circleState.isVisible) {
      if (circleRef.current) {
        gsap.set(circleRef.current, { opacity: 1, pointerEvents: 'auto' });
      }
      setCircleState(prev => ({ ...prev, isVisible: true }));
    }

    if (newMode !== circleState.mode) {
      setCircleState(prev => ({ ...prev, mode: newMode }));
    }
  }, [location.pathname]);

  // Initialize circle position on mount
  useEffect(() => {
    if (circleRef.current) {
      const initialMode = getCircleModeFromPath(location.pathname);
      const config = getAnimationConfig(initialMode);
      
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
