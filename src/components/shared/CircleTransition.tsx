import React, { useEffect, useRef } from 'react';
import { useCircleTransition } from '../../context/CircleTransitionContext';

interface CircleTransitionProps {
  children?: React.ReactNode;
  className?: string;
}

// Circles trailing the lead one: each eases toward the one ahead of it, so the
// trail only shows while the lead circle moves and tucks underneath when it stops.
// Clicking empty space in the gallery rotates which color leads (circleColorShift).
const CIRCLE_COLORS = ['#FF6700', '#39FF14', '#1A1AFF']; // orange, bright green, Origen blue
const TRAIL_FOLLOW = [0.2, 0.2];

const colorAt = (shift: number, i: number) => CIRCLE_COLORS[(shift + i) % CIRCLE_COLORS.length];

const CircleTransition: React.FC<CircleTransitionProps> = ({ className = '' }) => {
  const { circleRef, circleColorShift } = useCircleTransition();
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const trail = TRAIL_FOLLOW.map(() => ({ x: 0, y: 0, size: 0 }));
    let wasHidden = true;
    let shownShift = -1;
    let frameId: number;

    const tick = () => {
      const lead = circleRef.current;
      const hidden = !lead || lead.style.display === 'none' || Number(lead.style.opacity || 0) === 0;

      // Recolor when the order changes (the CSS transition fades it)
      const shift = circleColorShift.current;
      if (lead && shift !== shownShift) {
        lead.style.backgroundColor = colorAt(shift, 0);
        trailRefs.current.forEach((el, i) => {
          if (el) el.style.backgroundColor = colorAt(shift, i + 1);
        });
        shownShift = shift;
      }

      if (lead && !hidden) {
        // Wherever the pages have put the lead circle, including its scale
        const rect = lead.getBoundingClientRect();
        const target = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, size: rect.width };

        trail.forEach((dot, i) => {
          const ahead = i === 0 ? target : trail[i - 1];
          const t = wasHidden ? 1 : TRAIL_FOLLOW[i]; // snap into place when the circle reappears
          dot.x += (ahead.x - dot.x) * t;
          dot.y += (ahead.y - dot.y) * t;
          dot.size += (ahead.size - dot.size) * t;

          const el = trailRefs.current[i];
          if (!el) return;
          el.style.display = 'block';
          el.style.zIndex = lead.style.zIndex || '1';
          el.style.width = `${dot.size}px`;
          el.style.height = `${dot.size}px`;
          el.style.transform = `translate3d(${dot.x - dot.size / 2}px, ${dot.y - dot.size / 2}px, 0)`;
        });
      } else {
        trailRefs.current.forEach((el) => {
          if (el) el.style.display = 'none';
        });
      }

      wasHidden = hidden;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [circleRef, circleColorShift]);

  return (
    <>
      {/* Trail first, last-to-first, so it paints underneath the lead circle */}
      {TRAIL_FOLLOW.map((_, r) => {
        const i = TRAIL_FOLLOW.length - 1 - r;
        return (
          <div
            key={i}
            ref={(el) => { trailRefs.current[i] = el; }}
            className="fixed rounded-full"
            style={{
              backgroundColor: colorAt(circleColorShift.current, i + 1),
              transition: 'background-color 0.3s ease',
              pointerEvents: 'none',
              position: 'fixed',
              left: 0,
              top: 0,
              display: 'none',
              willChange: 'transform',
            }}
          />
        );
      })}
      <div
        ref={circleRef}
        className={`fixed rounded-full ${className}`}
        style={{
          // Drawn in the starting color so the first frame doesn't fade from orange
          backgroundColor: colorAt(circleColorShift.current, 0),
          transition: 'background-color 0.3s ease',
          pointerEvents: 'none',
          zIndex: 1,
          position: 'fixed',
          left: 0,
          top: 0,
          opacity: 0,
          transformOrigin: 'center center',
          margin: 0,
          padding: 0,
        }}
      />
    </>
  );
};

export default CircleTransition;
