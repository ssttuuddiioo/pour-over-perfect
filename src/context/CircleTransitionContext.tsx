import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import DebugOverlay, { AnimationConfig } from '../components/DebugOverlay'; // Corrected import path

// Circle animation states for different pages
export type CircleMode = 'front' | 'timer' | 'coffee' | 'contact' | 'calm' | 'origen';

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
  animationConfigs: Record<CircleMode, AnimationConfig>;
  updateAnimationConfig: (mode: CircleMode, newConfig: Partial<AnimationConfig>) => void;
  saveAnimationConfigs: () => void;
  exportAnimationConfigs: () => void;
  resetAnimationConfigs: () => void;
}

export const CircleTransitionContext = createContext<CircleTransitionContextType | undefined>(undefined);

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

export const CircleTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const circleRef = useRef<HTMLDivElement>(null);
  const searchParams = new URLSearchParams(location.search);
  const isDebug = searchParams.get('debug') === 'true';
  
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
      case '/contact': return 'contact';
      case '/calm': return 'calm';
      case '/origen': return 'origen';
      default: return 'front';
    }
  };

  // SCROLL-BASED CIRCLE CONFIGURATION - Used for scroll navigation
  const getDefaultAnimationConfigs = (): Record<CircleMode, AnimationConfig> => {
    const baseConfig = {
      "left": "50%",
      "top": "50%",
      "xPercent": -50,
      "yPercent": -50,
      "x": 0,
      "y": 0,
      "duration": 0.6,
      "ease": "power2.out"
    };

    return {
      "front": {
        ...baseConfig,
        "width": 240,
        "height": 240,
        "scale": 0.5
      },
      "origen": {
        ...baseConfig,
        "width": 384,
        "height": 384,
        "scale": 0.8
      },
      "coffee": {
        ...baseConfig,
        "width": 576,
        "height": 576,
        "scale": 1.2
      },
      "contact": {
        ...baseConfig,
        "width": 480,
        "height": 480,
        "scale": 1
      },
      "calm": {
        ...baseConfig,
        "width": 480,
        "height": 480,
        "scale": 1
      },
      "timer": {
        ...baseConfig,
        "width": 480,
        "height": 480,
        "scale": 1
      }
    };
  };

  const [animationConfigs, setAnimationConfigs] = useState<Record<CircleMode, AnimationConfig>>(() => {
    const savedConfigs = localStorage.getItem('animationConfigs');
    // Only load from localStorage if we are in debug mode.
    if (isDebug && savedConfigs) {
      try {
        const parsed = JSON.parse(savedConfigs);
        // Basic validation to ensure we're not loading corrupted data.
        if (typeof parsed === 'object' && parsed !== null && 'front' in parsed) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse animation configs from localStorage", e);
        // Fallback to defaults if parsing fails
      }
    }
    return getDefaultAnimationConfigs();
  });

  const updateAnimationConfig = (mode: CircleMode, newConfig: Partial<AnimationConfig>) => {
    setAnimationConfigs(prev => ({
      ...prev,
      [mode]: { ...prev[mode], ...newConfig },
    }));
  };

  const saveAnimationConfigs = () => {
    localStorage.setItem('animationConfigs', JSON.stringify(animationConfigs));
    alert('Animation configs saved to local storage for this session.');
  };

  const exportAnimationConfigs = () => {
    const currentMode = getCircleModeFromPath(location.pathname);
    const configToExport = { [currentMode]: animationConfigs[currentMode] };
    const jsonString = JSON.stringify(configToExport, null, 2);
    const exportString = `// Settings for: ${currentMode}\n${jsonString}`;
    
    navigator.clipboard.writeText(exportString).then(() => {
      alert(`Animation config for "${currentMode}" page copied to clipboard.`);
    }, (err) => {
      console.error('Could not copy config: ', err);
      alert('Failed to copy config. See console for error.');
    });
  };

  const resetAnimationConfigs = () => {
    if (window.confirm('Are you sure you want to delete your saved settings and revert to the codebase defaults?')) {
      localStorage.removeItem('animationConfigs');
      window.location.reload();
    }
  };

  const getAnimationConfig = (mode: CircleMode) => {
    return animationConfigs[mode] || getDefaultAnimationConfigs()[mode];
  };

  // DISABLED for scroll navigation - ScrollNavigator handles animations
  const animateCircle = (mode: CircleMode, onComplete?: () => void) => {
    if (!circleRef.current) return;

    // Only animate for timer page or debug mode
    if (location.pathname === '/timer' || isDebug) {
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
    } else {
      // For scroll navigation, just update state
      setCircleState(prev => ({ ...prev, mode, isTransitioning: false }));
      onComplete?.();
    }
  };

  const navigateWithTransition = (path: string) => {
    navigate(path);
  };

  const setCircleMode = (mode: CircleMode) => {
    setCircleState(prev => ({ ...prev, mode }));
  };

  // Handle timer page visibility and mode updates
  useEffect(() => {
    const newMode = getCircleModeFromPath(location.pathname);

    if (location.pathname === '/timer') {
      // Keep circle visible on timer page for navigation
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

    // Update mode for all pages
    if (newMode !== circleState.mode) {
      setCircleState(prev => ({ ...prev, mode: newMode }));
    }
  }, [location.pathname]);

  // Debug mode: Apply config changes without animation
  useEffect(() => {
    if (circleRef.current && !circleState.isTransitioning && isDebug) {
      const currentMode = getCircleModeFromPath(location.pathname);

      if (currentMode === 'timer') {
        return;
      }

      const config = getAnimationConfig(currentMode);

      // Set position immediately without animation - even in debug mode
      gsap.set(circleRef.current, {
        ...config
      });
    }
  }, [animationConfigs, location.pathname, circleState.isTransitioning, isDebug]);

  // Initialize circle position on mount with scroll-friendly configuration
  useEffect(() => {
    if (circleRef.current) {
      const initialMode = getCircleModeFromPath(location.pathname);
      const config = getAnimationConfig(initialMode);
      
      // Set static position immediately for scroll navigation
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
      setCircleMode,
      animationConfigs,
      updateAnimationConfig,
      saveAnimationConfigs,
      exportAnimationConfigs,
      resetAnimationConfigs,
    }}>
      {children}
    </CircleTransitionContext.Provider>
  );
}; 