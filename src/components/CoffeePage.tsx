import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useCircleTransition } from '../context/CircleTransitionContext';

const CoffeePage: React.FC = () => {
  const { circleRef } = useCircleTransition();
  const circleMousePos = useRef({ x: 0, y: 0 });
  const circleTargetPos = useRef({ x: 0, y: 0 });
  const circleIsPinned = useRef(false);
  const circlePinnedPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!circleRef.current) return;

    gsap.set(circleRef.current, {
      width: 840,
      height: 840,
      scale: 0.2,
      position: 'fixed',
      left: '50%',
      top: '50%',
      xPercent: -50,
      yPercent: -50,
      transformOrigin: 'center center',
      zIndex: 30,
      force3D: true,
      willChange: 'transform, width, height',
      backfaceVisibility: 'hidden',
      perspective: 1000,
      opacity: 1,
      visibility: 'visible',
      display: 'flex',
    });

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    circleTargetPos.current = { x: cx, y: cy };
    circleMousePos.current = { x: cx, y: cy };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMouseMove = (e: MouseEvent) => {
      if (!circleIsPinned.current) {
        circleMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a')) return;
      if (circleIsPinned.current) {
        circleIsPinned.current = false;
      } else {
        circleIsPinned.current = true;
        circlePinnedPos.current = { ...circleMousePos.current };
        circleTargetPos.current = { ...circlePinnedPos.current };
      }
    };

    let frameId: number;
    const animate = () => {
      if (circleRef.current) {
        const targetX = circleIsPinned.current ? circlePinnedPos.current.x : circleMousePos.current.x;
        const targetY = circleIsPinned.current ? circlePinnedPos.current.y : circleMousePos.current.y;
        circleTargetPos.current.x = lerp(circleTargetPos.current.x, targetX, circleIsPinned.current ? 1 : 0.1);
        circleTargetPos.current.y = lerp(circleTargetPos.current.y, targetY, circleIsPinned.current ? 1 : 0.1);

        gsap.set(circleRef.current, {
          left: circleTargetPos.current.x,
          top: circleTargetPos.current.y,
          xPercent: -50,
          yPercent: -50,
          opacity: 1,
        });
      }
      frameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    frameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      cancelAnimationFrame(frameId);
    };
  }, [circleRef]);

  return (
    <div className="min-h-screen bg-[#1a1aff] text-white">
      <div className="max-w-6xl mx-auto px-8 md:px-16 py-12 md:py-16">

        {/* Header */}
        <h1 className="text-4xl md:text-5xl mb-24 md:mb-32">
          Origen
        </h1>

        {/* Two column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">

          {/* Left column — specs */}
          <div className="space-y-8">
            <div className="space-y-1 text-base md:text-lg leading-relaxed">
              <p>Charal&aacute;, Santander, Colombia &bull; 1900masl</p>
              <p>Castillo &bull; Hand-picked, fermented 36 hours,</p>
              <p>dried on raised beds</p>
            </div>

            <p className="text-base md:text-lg">
              Roasted at Multimodal
            </p>

            <p className="italic text-base md:text-lg leading-relaxed text-white">
              Delicate florals and chamomile, orchard fruits
              with raisin sweetness, and a crisp, clean finish
            </p>
          </div>

          {/* Right column — narrative */}
          <div className="space-y-12 text-base md:text-lg leading-relaxed">
            <p>
              Oscar Castro grows coffee at 1,900 meters above sea
              level in Charal&aacute;, Santander, a quiet town in
              Colombia&rsquo;s eastern Andes. He works a few hectares
              alongside his family and neighbors, pooling their
              harvests together. This lot is from the April 2025
              harvest.
            </p>

            <p>
              Castillo is a hardy hybrid that thrives at altitude &ndash;
              resilient in the field and delicate in the cup. These
              beans were hand-picked and sorted at Finca
              Bellavista, fermented for 36 hours, and dried on
              raised beds on the farm before being hulled and
              exported by Semilla Caf&eacute; in Bogot&aacute;.
            </p>

            <p>
              We paid Oscar $8.69/kg for 50kg of the coffee in
              parchment in June, 2025 &ndash; about 15% above the global
              commodity price that season. Hulling, milling, and
              export added $8.88/kg. Packaging added $0.35/kg.
              Total cost: $17.92/kg.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoffeePage;
