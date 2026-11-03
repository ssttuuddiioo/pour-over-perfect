import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useCircleTransition, circleSize } from '../context/CircleTransitionContext';
import Navigation from './shared/Navigation';

// Photos from the gallery set between the paragraphs they illustrate
const PHOTO_ALT: Record<number, string> = {
  1: 'A rider and bike at the start of the bikepacking race',
  6: 'Two men looking out over the valley at dusk',
  28: 'Raking coffee on raised drying beds in a greenhouse',
  9: 'A sack of green coffee in a shipping box',
  14: 'An Origen bag with an orange circle, held over a crosswalk from a bike',
  20: 'An older man with a cane standing among drying tarps at the farm',
  22: 'A woman serving coffee on a porch',
  42: 'A white coffee flower among dark leaves',
};

// One photo full width (tall ones capped in height), or two side by side
const StoryPhotos: React.FC<{ photos: number[] }> = ({ photos }) => (
  <div className={`!my-12 ${photos.length > 1 ? 'grid grid-cols-2 gap-3 md:gap-4 items-start' : ''}`}>
    {photos.map((n) => (
      <img
        key={n}
        src={`/photo-final/large/${n}.jpg`}
        alt={PHOTO_ALT[n] ?? ''}
        loading="lazy"
        className={photos.length > 1 ? 'block w-full h-auto' : 'block w-auto max-w-full h-auto max-h-[75vh]'}
      />
    ))}
  </div>
);

const OrigenStoryPage: React.FC = () => {
  const { circleRef, circlePosition } = useCircleTransition();
  const circleMousePos = useRef({ x: 0, y: 0 });
  const circleTargetPos = useRef({ x: 0, y: 0 });
  const circleIsPinned = useRef(false);
  const circlePinnedPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!circleRef.current) return;
    // Same size as on every other page, phones included
    gsap.set(circleRef.current, { width: circleSize(), height: circleSize() });
    // Skip circle animation on mobile — no cursor to follow
    if (window.innerWidth < 768) return;

    gsap.set(circleRef.current, {
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

        circlePosition.current.x = circleTargetPos.current.x;
        circlePosition.current.y = circleTargetPos.current.y;
      }
      frameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('click', onClick);
    frameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      cancelAnimationFrame(frameId);
    };
  }, [circleRef]);

  return (
    <div className="editorial-page editorial-page--balanced min-h-screen bg-[#1a1aff] text-white px-12 py-16 relative">
      <Navigation variant="homepage" />

      {/* Content layer — above circle */}
      <div className="relative" style={{ zIndex: 20 }}>

      {/* Header — phones only; on desktop the big "Origen" in the menu is the heading */}
      <h1 className="text-4xl mb-16 pt-12 md:hidden">
        Origen
      </h1>

      {/* Two column layout — farm details + story */}
      <div className="editorial-grid grid grid-cols-1 gap-12 text-base md:text-[1.0625rem] lg:text-[1.1875rem] leading-relaxed">

        {/* Left — at a glance; stays put on desktop while the story scrolls */}
        <div className="editorial-aside space-y-6">
          <div className="space-y-0.5">
            <p>Charal&aacute;, Santander, Colombia &bull; 1900masl</p>
            <p>Grown by Oscar Castro at Finca Bellavista</p>
          </div>

          <p>Roasted at <a href="https://www.multimodalroasting.com/" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70 transition-opacity">Multimodal</a></p>

          <p className="italic">
            Three new coffees, coming soon
          </p>

          <hr className="border-white/40 !mt-10" />
        </div>

        {/* Right — story at a readable measure, centred in whatever room is left so
            the space either side of it stays even on wide screens */}
        <div className="space-y-6 md:leading-[1.6] md:max-w-[36rem] md:mx-auto">
          <p>
            Our coffee is from Charal&aacute;, a quiet town in Colombia&rsquo;s
            eastern Andes. I found myself there by chance two
            years ago &ndash; I was born in Bogot&aacute; but grew up in the
            States, and had taken on a 1,000-kilometer bikepacking
            race across the country&rsquo;s cordilleras as a way to see
            more. By day three, I was exhausted &ndash; physically,
            emotionally, completely. I turned in my tracker,
            withdrew from the race, and rolled into Charal&aacute;, spent.
          </p>

          <StoryPhotos photos={[1]} />

          <p>
            The next afternoon, on a whim, I asked my hostel
            manager if he knew anybody with a coffee farm. He
            made a phone call, and a few hours later, Oscar Castro
            pulled up in his pickup truck. We spent the next forty
            minutes rattling up unpaved roads, climbing out above
            town, to Finca Bellavista.
          </p>

          <StoryPhotos photos={[6]} />

          <p>
            He showed me every corner of the operation: the rows
            of drying beds, the processing area, the particular slope
            where the soil drained best. His pride in the work, and
            in the land itself, had a solidity to it.
          </p>

          <StoryPhotos photos={[28]} />

          <p>
            I rode back to Bogot&aacute; at my own pace, thinking about
            how to bring his coffee to New York. A year (and
            endless WhatsApp voice notes later), a small lot arrived
            at my apartment, the beans still encased in parchment.
            I hulled it entirely by hand in Brooklyn, roasted it at
            Multimodal in Queens, and sold twenty bags to friends
            and family. I delivered every local order on my bike.
          </p>

          <StoryPhotos photos={[9, 14]} />

          <p>
            In October 2025, I went back to the farm, this time with
            my grandparents. My grandfather is from the
            Santander region himself, an agriculturist who spent
            his career traveling all of Colombia. He and Oscar
            walked the farm together with ease, trading stories
            about soil and seasons.
          </p>

          <StoryPhotos photos={[20, 22]} />

          <p>
            Every trip back to Colombia offers more than I know
            how to return. This project is one small way of carrying
            that generosity outward.
          </p>

          <StoryPhotos photos={[42]} />

          <p>
            Thank you for trying it.<br />
            <a href="https://yopablo.com" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70 transition-opacity">Pablo</a>
          </p>
        </div>
      </div>

      </div>
    </div>
  );
};

export default OrigenStoryPage;
