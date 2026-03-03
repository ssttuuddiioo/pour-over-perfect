import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { StorySlide } from '../data/storySlides';

const IMAGE_BUFFER = 5;
const PADDING = 100;

interface StoryScrollProps {
  slides: StorySlide[];
}

const StoryScroll: React.FC<StoryScrollProps> = ({ slides }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cursorSide, setCursorSide] = useState<'left' | 'right' | null>(null);
  const isAnimating = useRef(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    for (let i = 0; i <= Math.min(IMAGE_BUFFER, slides.length - 1); i++) initial.add(i);
    return initial;
  });

  const preloadAround = useCallback((index: number) => {
    setLoadedImages(prev => {
      const next = new Set(prev);
      let changed = false;
      for (let i = Math.max(0, index - IMAGE_BUFFER); i <= Math.min(slides.length - 1, index + IMAGE_BUFFER); i++) {
        if (!next.has(i)) { next.add(i); changed = true; }
      }
      return changed ? next : prev;
    });
  }, [slides.length]);

  // Animate to a specific slide index
  const goToSlide = useCallback((newIndex: number) => {
    if (isAnimating.current || newIndex < 0 || newIndex >= slides.length || newIndex === currentIndex) return;
    isAnimating.current = true;
    preloadAround(newIndex);

    const oldImgEl = imageRefs.current[currentIndex];
    const newImgEl = imageRefs.current[newIndex];
    const oldTextEl = textRefs.current[currentIndex];
    const newTextEl = textRefs.current[newIndex];

    const tl = gsap.timeline({
      onComplete: () => {
        // Snap old image off after new one is visible
        if (oldImgEl) gsap.set(oldImgEl, { opacity: 0, scale: 1 });
        isAnimating.current = false;
      }
    });

    // New image fades in on top of old (old stays at opacity 1 underneath)
    if (newImgEl) {
      gsap.set(newImgEl, { opacity: 0, scale: 1 });
      tl.to(newImgEl, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0);
    }

    // Ken Burns on new image
    if (newImgEl) {
      tl.to(newImgEl, { scale: 1.03, duration: 4, ease: 'none' }, 0);
    }

    // Old text out
    if (oldTextEl) {
      tl.to(oldTextEl, { opacity: 0, y: -15, duration: 0.3, ease: 'power2.in' }, 0);
    }

    // New text in
    if (newTextEl) {
      gsap.set(newTextEl, { opacity: 0, y: 20 });
      tl.to(newTextEl, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.25);
    }

    setCurrentIndex(newIndex);
  }, [currentIndex, slides.length, preloadAround]);

  // Click handler — left half = prev, right half = next
  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      goToSlide(currentIndex - 1);
    } else {
      goToSlide(currentIndex + 1);
    }
  }, [currentIndex, goToSlide]);

  // Track cursor side for arrow cursor
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    setCursorSide(x < rect.width / 2 ? 'left' : 'right');
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCursorSide(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
      if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, goToSlide]);

  // Initialize first slide
  useEffect(() => {
    imageRefs.current.forEach((el, i) => {
      if (el) gsap.set(el, { opacity: i === 0 ? 1 : 0, scale: 1 });
    });
    textRefs.current.forEach((el, i) => {
      if (el) gsap.set(el, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 20 });
    });
  }, []);

  const cursorStyle = cursorSide === 'left'
    ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' fill=\'white\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z\'/%3E%3C/svg%3E") 16 16, pointer'
    : cursorSide === 'right'
    ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' fill=\'white\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z\'/%3E%3C/svg%3E") 16 16, pointer'
    : undefined;

  return (
    <section id="story-scroll" className="relative w-full" style={{ padding: PADDING }}>
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden bg-black rounded-lg"
        style={{ height: `calc(100vh - ${PADDING * 2}px)`, cursor: cursorStyle }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Image layers — stacked, higher index on top */}
        {slides.map((slide, i) => (
          <div
            key={i}
            ref={(el) => { imageRefs.current[i] = el; }}
            className="absolute inset-0 will-change-[opacity,transform]"
            style={{ opacity: i === 0 ? 1 : 0, zIndex: i }}
          >
            {loadedImages.has(i) ? (
              <img
                src={slide.src}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-black" />
            )}
          </div>
        ))}

        {/* Gradient scrim */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none"
          style={{ zIndex: slides.length }}
        />

        {/* Text layers */}
        {slides.map((slide, i) => (
          <div
            key={i}
            ref={(el) => { textRefs.current[i] = el; }}
            className="absolute bottom-0 left-0 right-0 p-8 md:p-12 pb-12 md:pb-16 will-change-[opacity,transform] pointer-events-none"
            style={{ opacity: i === 0 ? 1 : 0, zIndex: slides.length + 1 }}
          >
            <p className="text-white text-lg md:text-2xl lg:text-3xl max-w-2xl leading-relaxed font-light">
              {slide.text}
            </p>
          </div>
        ))}

        {/* Slide counter */}
        <div
          className="absolute bottom-8 right-8 md:bottom-12 md:right-12 text-white/50 text-sm font-light tabular-nums pointer-events-none"
          style={{ zIndex: slides.length + 2 }}
        >
          {currentIndex + 1} / {slides.length}
        </div>
      </div>
    </section>
  );
};

export default StoryScroll;
