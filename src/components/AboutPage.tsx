import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useCircleTransition } from '../context/CircleTransitionContext';
import Navigation from './shared/Navigation';

const AboutPage: React.FC = () => {
  const { circleRef, circlePosition } = useCircleTransition();
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
      left: circlePosition.current.x,
      top: circlePosition.current.y,
      xPercent: -50,
      yPercent: -50,
      transformOrigin: 'center center',
      zIndex: 10,
      force3D: true,
      willChange: 'transform, width, height',
      backfaceVisibility: 'hidden',
      perspective: 1000,
      opacity: 1,
      visibility: 'visible',
      display: 'flex',
    });

    const cx = circlePosition.current.x;
    const cy = circlePosition.current.y;
    circleTargetPos.current = { x: cx, y: cy };
    circleMousePos.current = { x: cx, y: cy };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMouseMove = (e: MouseEvent) => {
      if (!circleIsPinned.current) {
        circleMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('nav')) return;
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

        circlePosition.current.x = circleTargetPos.current.x;
        circlePosition.current.y = circleTargetPos.current.y;
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
  }, [circleRef, circlePosition]);

  return (
    <div className="min-h-screen bg-white px-6 py-20">
      <Navigation variant="homepage" />

      <div className="max-w-lg mx-auto pt-24 md:pt-32">
        <h1 className="text-4xl md:text-5xl text-black mb-16 md:mb-24">Origen</h1>

        <div className="text-[#1a1a5e] text-sm md:text-base leading-relaxed space-y-6">
        <p>
          This coffee is from Charal&aacute;, a quiet town in Colombia&rsquo;s
          eastern Andes. I found myself there by chance two
          years ago &ndash; I was born in Bogot&aacute; but grew up in the
          States, and had taken on a 1,000-kilometer bikepacking
          race across the country&rsquo;s cordilleras as a way to see
          more. By day three, I was exhausted &ndash; physically,
          emotionally, completely. I turned in my tracker,
          withdrew from the race, and rolled into Charal&aacute;, spent.
        </p>

        <p>
          The next afternoon, on a whim, I asked my hostel
          manager if he knew anybody with a coffee farm. He
          made a phone call, and a few hours later, Oscar Castro
          pulled up in his pickup truck. We spent the next forty
          minutes rattling up unpaved roads, climbing out above
          town, to Finca Bellavista.
        </p>

        <p>
          He showed me every corner of the operation: the rows
          of drying beds, the processing area, the particular slope
          where the soil drained best. His pride in the work, and
          in the land itself, had a solidity to it.
        </p>

        <p>
          I rode back to Bogot&aacute; at my own pace, thinking about
          how to bring his coffee to New York. A year (and
          endless WhatsApp voice notes later), a small lot arrived
          at my apartment, the beans still encased in parchment.
          I hulled it entirely by hand in Brooklyn, roasted it at
          Multimodal in Queens, and sold twenty bags to friends
          and family. I delivered every local order on my bike.
        </p>

        <p>
          In October 2025, I went back to the farm, this time with
          my grandparents. My grandfather is from the
          Santander region himself, an agriculturist who spent
          his career traveling all of Colombia. He and Oscar
          walked the farm together with ease, trading stories
          about soil and seasons.
        </p>

        <p>
          Every trip back to Colombia offers more than I know
          how to return. This project is one small way of carrying
          that generosity outward.
        </p>

        <p>
          Thank you for trying it.<br />
          Pablo
        </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
