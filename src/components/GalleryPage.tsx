import React, { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { useCircleTransition } from '../context/CircleTransitionContext';
import Navigation from './shared/Navigation';

// Layout positions for 29 tiles in a 2800×3600 coordinate space
// Scattered with 120–350px gaps, mixed sizes
const LAYOUT_DATA = [
  // Row 1
  { x: 100, y: 80, w: 570, h: 390 },
  { x: 1020, y: 120, w: 360, h: 270 },
  { x: 1780, y: 60, w: 480, h: 450 },
  { x: 2660, y: 100, w: 390, h: 300 },
  { x: 3450, y: 70, w: 600, h: 420 },
  { x: 4450, y: 120, w: 330, h: 256 },
  // Row 2
  { x: 120, y: 1020, w: 420, h: 300 },
  { x: 940, y: 940, w: 600, h: 450 },
  { x: 1940, y: 1000, w: 330, h: 420 },
  { x: 2670, y: 960, w: 510, h: 360 },
  { x: 3580, y: 1020, w: 390, h: 286 },
  { x: 4370, y: 940, w: 450, h: 390 },
  // Row 3
  { x: 60, y: 1920, w: 510, h: 376 },
  { x: 970, y: 1960, w: 390, h: 480 },
  { x: 1760, y: 2020, w: 570, h: 390 },
  { x: 2730, y: 1940, w: 300, h: 240 },
  { x: 3430, y: 1900, w: 480, h: 420 },
  { x: 4310, y: 1960, w: 420, h: 330 },
  // Row 4
  { x: 140, y: 2880, w: 600, h: 420 },
  { x: 1140, y: 2980, w: 360, h: 270 },
  { x: 1900, y: 2900, w: 450, h: 510 },
  { x: 2750, y: 2820, w: 390, h: 300 },
  { x: 3540, y: 2880, w: 540, h: 390 },
  // Row 5
  { x: 100, y: 3860, w: 450, h: 330 },
  { x: 950, y: 3820, w: 570, h: 420 },
  { x: 1920, y: 3920, w: 330, h: 256 },
  { x: 2650, y: 3840, w: 510, h: 390 },
  { x: 3580, y: 3880, w: 390, h: 300 },
  { x: 4370, y: 3840, w: 450, h: 360 },
];

const ORIGINAL_SIZE = { w: 5100, h: 4400 };

const PHOTO_SOURCES = Array.from({ length: 28 }, (_, i) => `/photo-final/web/${i + 1}.jpg`);

interface PhotoMeta {
  id: number;
  title: string;
  blurb: string;
}

interface TileItem {
  el: HTMLDivElement | null;
  x: number;
  y: number;
  w: number;
  h: number;
  extraX: number;
  extraY: number;
  ease: number;
  src: string;
  photoIndex: number;
}

const GalleryPage: React.FC = () => {
  const { circleRef, circlePosition } = useCircleTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTitleRef = useRef<HTMLDivElement>(null);
  const detailTitleRef = useRef<HTMLDivElement>(null);
  const detailBlurbRef = useRef<HTMLDivElement>(null);
  const arrowLeftRef = useRef<HTMLButtonElement>(null);
  const arrowRightRef = useRef<HTMLButtonElement>(null);
  const activeItemRef = useRef<TileItem | null>(null);
  const currentSlideRef = useRef(0);
  const isZoomed = useRef(false);
  const isCentering = useRef(false);
  const itemsRef = useRef<TileItem[]>([]);
  const tileSizeRef = useRef({ w: 0, h: 0 });
  const winRef = useRef({ w: 0, h: 0 });
  const photoMetaRef = useRef<PhotoMeta[]>([]);

  // Scroll state
  const scrollRef = useRef({
    current: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    last: { x: 0, y: 0 },
    ease: 0.07,
  });

  // Mouse state (normalized 0–1 for parallax)
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  // Idle drift — picks up from last mouse movement direction
  const idleRef = useRef({
    velocityX: 0.3,  // initial gentle drift
    velocityY: 0.15,
    lastMouseX: 0,
    lastMouseY: 0,
    idleTimer: null as number | null,
    isIdle: true,
    blend: 0,
  });

  // Drag state
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    scrollX: 0,
    scrollY: 0,
  });

  // Orange circle state
  const circleMousePos = useRef({ x: 0, y: 0 });
  const circleTargetPos = useRef({ x: 0, y: 0 });
  const circleIsPinned = useRef(false);
  const circlePinnedPos = useRef({ x: 0, y: 0 });

  // Load photo metadata
  useEffect(() => {
    fetch('/photo-final/web/photo-content.json')
      .then((res) => res.json())
      .then((data: PhotoMeta[]) => {
        photoMetaRef.current = data;
      })
      .catch(() => {});
  }, []);

  const showHoverTitle = useCallback((title: string) => {
    const el = hoverTitleRef.current;
    if (!el || isZoomed.current) return;
    el.textContent = title;
    gsap.killTweensOf(el);
    gsap.to(el, { opacity: 1, duration: 0.3, ease: 'sine.out' });
  }, []);

  const hideHoverTitle = useCallback(() => {
    const el = hoverTitleRef.current;
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.to(el, { opacity: 0, duration: 0.3, ease: 'sine.out' });
  }, []);

  const showArrows = useCallback(() => {
    const l = arrowLeftRef.current;
    const r = arrowRightRef.current;
    if (l) gsap.fromTo(l, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'sine.out', delay: 0.2 });
    if (r) gsap.fromTo(r, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'sine.out', delay: 0.2 });
  }, []);

  const hideArrows = useCallback(() => {
    const l = arrowLeftRef.current;
    const r = arrowRightRef.current;
    if (l) gsap.to(l, { opacity: 0, duration: 0.3, ease: 'sine.in' });
    if (r) gsap.to(r, { opacity: 0, duration: 0.3, ease: 'sine.in' });
  }, []);

  const showDetail = useCallback((meta: PhotoMeta) => {
    const titleEl = detailTitleRef.current;
    const blurbEl = detailBlurbRef.current;
    if (!titleEl || !blurbEl) return;
    titleEl.textContent = meta.title;
    blurbEl.textContent = meta.blurb;
    gsap.killTweensOf(titleEl);
    gsap.killTweensOf(blurbEl);
    gsap.fromTo(titleEl, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'sine.out' });
    gsap.fromTo(blurbEl, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'sine.out', delay: 0.15 });
    showArrows();
  }, [showArrows]);

  const hideDetail = useCallback(() => {
    const titleEl = detailTitleRef.current;
    const blurbEl = detailBlurbRef.current;
    if (!titleEl || !blurbEl) return;
    gsap.killTweensOf(titleEl);
    gsap.killTweensOf(blurbEl);
    gsap.to(titleEl, { opacity: 0, duration: 0.3, ease: 'sine.in' });
    gsap.to(blurbEl, { opacity: 0, duration: 0.3, ease: 'sine.in' });
    hideArrows();
  }, [hideArrows]);

  const navigateSlide = useCallback((direction: 1 | -1) => {
    if (!isZoomed.current || !activeItemRef.current) return;
    const next = (currentSlideRef.current + direction + PHOTO_SOURCES.length) % PHOTO_SOURCES.length;
    const titleEl = detailTitleRef.current;
    const blurbEl = detailBlurbRef.current;
    const item = activeItemRef.current;
    if (!titleEl || !blurbEl || !item?.el) return;

    // Fade out title + blurb + image
    const img = item.el.querySelector('img');
    gsap.to([titleEl, blurbEl], {
      opacity: 0, duration: 0.25, ease: 'sine.in',
      onComplete: () => {
        // Swap content
        if (img) img.src = PHOTO_SOURCES[next];
        item.photoIndex = next;
        item.src = PHOTO_SOURCES[next];
        currentSlideRef.current = next;
        const meta = photoMetaRef.current[next];
        titleEl.textContent = meta?.title || `Photo ${next + 1}`;
        blurbEl.textContent = meta?.blurb || '';
        // Fade back in
        gsap.to([titleEl, blurbEl], { opacity: 1, duration: 0.35, ease: 'sine.out' });
      },
    });
  }, []);

  const buildGrid = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    winRef.current = { w: winW, h: winH };

    // Scale tile area to viewport width, maintain aspect ratio
    const baseTileW = winW;
    const baseTileH = winW * (ORIGINAL_SIZE.h / ORIGINAL_SIZE.w);
    const scaleX = baseTileW / ORIGINAL_SIZE.w;
    const scaleY = baseTileH / ORIGINAL_SIZE.h;

    // Clear existing
    container.innerHTML = '';
    itemsRef.current = [];

    // Scale base items
    const baseItems = LAYOUT_DATA.map((d, i) => ({
      src: PHOTO_SOURCES[i % PHOTO_SOURCES.length],
      photoIndex: i % PHOTO_SOURCES.length,
      x: d.x * scaleX,
      y: d.y * scaleY,
      w: d.w * scaleX,
      h: d.h * scaleY,
    }));

    // 2x2 duplication for infinite wrapping
    const repsX = [0, baseTileW];
    const repsY = [0, baseTileH];

    baseItems.forEach((base) => {
      repsX.forEach((offsetX) => {
        repsY.forEach((offsetY) => {
          const el = document.createElement('div');
          el.className = 'item';
          el.dataset.photoIndex = String(base.photoIndex);
          el.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: ${base.w}px;
            will-change: transform;
            cursor: pointer;
          `;

          const imgWrap = document.createElement('div');
          imgWrap.style.cssText = `
            width: ${base.w}px;
            height: ${base.h}px;
            overflow: hidden;
            position: relative;
          `;

          const img = document.createElement('img');
          img.src = base.src;
          img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            will-change: transform;
            transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          `;
          img.loading = 'eager';

          imgWrap.appendChild(img);

          // Caption — sits below image, slides out on hover
          el.appendChild(imgWrap);

          // Hover events for title display
          el.addEventListener('mouseenter', () => {
            const meta = photoMetaRef.current[base.photoIndex];
            if (meta) showHoverTitle(meta.title);
          });
          el.addEventListener('mouseleave', () => {
            hideHoverTitle();
          });

          container.appendChild(el);

          itemsRef.current.push({
            el,
            x: base.x + offsetX,
            y: base.y + offsetY,
            w: base.w,
            h: base.h,
            extraX: 0,
            extraY: 0,
            ease: Math.random() * 0.5 + 0.5,
            src: base.src,
            photoIndex: base.photoIndex,
          });
        });
      });
    });

    // Double tile size for the 2x2 grid
    tileSizeRef.current = { w: baseTileW * 2, h: baseTileH * 2 };

    // Reset scroll
    const scroll = scrollRef.current;
    scroll.current.x = scroll.target.x = scroll.last.x = -winW * 0.1;
    scroll.current.y = scroll.target.y = scroll.last.y = -winH * 0.1;

    // Reset extra offsets
    itemsRef.current.forEach((item) => {
      item.extraX = 0;
      item.extraY = 0;
    });
  }, [showHoverTitle, hideHoverTitle]);

  useEffect(() => {
    buildGrid();

    // Initialize circle
    if (circleRef.current) {
      gsap.set(circleRef.current, {
        width: 840,
        height: 840,
        scale: 0.6,
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
    }

    // --- Event Handlers ---

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isZoomed.current || isCentering.current) return;
      const factor = 0.4;
      scrollRef.current.target.x -= e.deltaX * factor;
      scrollRef.current.target.y -= e.deltaY * factor;
    };

    const onMouseDown = (e: MouseEvent) => {
      if (isZoomed.current || isCentering.current) return;
      if ((e.target as HTMLElement).closest('nav')) return;
      dragRef.current.isDragging = true;
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
      dragRef.current.scrollX = scrollRef.current.target.x;
      dragRef.current.scrollY = scrollRef.current.target.y;
      document.documentElement.classList.add('dragging');
    };

    const onMouseUp = () => {
      dragRef.current.isDragging = false;
      document.documentElement.classList.remove('dragging');
    };

    const onMouseMove = (e: MouseEvent) => {
      // Normalized mouse for parallax
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = e.clientY / window.innerHeight;

      // Track velocity for idle drift
      const idle = idleRef.current;
      const dx = e.clientX - idle.lastMouseX;
      const dy = e.clientY - idle.lastMouseY;
      idle.lastMouseX = e.clientX;
      idle.lastMouseY = e.clientY;

      // Capture direction as a gentle drift speed
      if (dx | dy) {
        const invMag = 0.4 / (Math.abs(dx) + Math.abs(dy) || 1);
        idle.velocityX = dx * invMag;
        idle.velocityY = dy * invMag;
      }

      // Reset idle timer
      idle.isIdle = false;
      if (idle.idleTimer !== null) clearTimeout(idle.idleTimer);
      idle.idleTimer = window.setTimeout(() => {
        idle.isIdle = true;
      }, 800);

      // Drag
      if (dragRef.current.isDragging) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        scrollRef.current.target.x = dragRef.current.scrollX + dx;
        scrollRef.current.target.y = dragRef.current.scrollY + dy;
      }

      // Circle tracking
      if (!circleIsPinned.current) {
        circleMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const openSpotlight = (item: TileItem) => {
      if (!item.el || isZoomed.current || isCentering.current) return;
      activeItemRef.current = item;
      isCentering.current = true;

      // Hide hover title immediately
      hideHoverTitle();

      // Step 1: Calculate scroll needed to center the clicked tile
      const rect = item.el.getBoundingClientRect();
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const deltaX = centerX - (rect.left + rect.width / 2);
      const deltaY = centerY - (rect.top + rect.height / 2);

      const scroll = scrollRef.current;

      // Animate both current and target together so the render loop
      // moves all tiles smoothly via their transforms
      const proxy = { x: scroll.current.x, y: scroll.current.y };
      gsap.to(proxy, {
        x: scroll.current.x + deltaX,
        y: scroll.current.y + deltaY,
        duration: 0.8,
        ease: 'sine.inOut',
        onUpdate: () => {
          scroll.current.x = proxy.x;
          scroll.target.x = proxy.x;
          scroll.last.x = proxy.x;
          scroll.current.y = proxy.y;
          scroll.target.y = proxy.y;
          scroll.last.y = proxy.y;
        },
        onComplete: () => {
          isCentering.current = false;
          isZoomed.current = true;

          // Step 2: Zoom the tile, fade out others
          if (item.el) {
            gsap.to(item.el, {
              scale: 4,
              duration: 0.7,
              ease: 'sine.out',
            });
          }
          itemsRef.current.forEach((other) => {
            if (other.el && other !== item) {
              gsap.to(other.el, { opacity: 0, duration: 0.5, ease: 'sine.out' });
            }
          });

          // Step 3: Show title + blurb + arrows after fade
          currentSlideRef.current = item.photoIndex;
          const meta = photoMetaRef.current[item.photoIndex];
          if (meta) {
            setTimeout(() => showDetail(meta), 500);
          }
        },
      });
    };

    const closeSpotlight = () => {
      const item = activeItemRef.current;
      if (!item?.el) return;

      // Hide detail text first
      hideDetail();

      // After detail fades, restore tiles
      setTimeout(() => {
        // Zoom back to 1x
        if (item.el) {
          gsap.to(item.el, {
            scale: 1,
            duration: 0.7,
            ease: 'sine.inOut',
          });
        }

        // Fade all others back in
        itemsRef.current.forEach((other) => {
          if (other.el && other !== item) {
            gsap.to(other.el, { opacity: 1, duration: 0.5, ease: 'sine.inOut' });
          }
        });

        activeItemRef.current = null;
        isZoomed.current = false;
      }, 300);
    };

    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('nav')) return;
      if ((e.target as HTMLElement).closest('.detail-arrow')) return;

      // Close spotlight if zoomed
      if (isZoomed.current) {
        closeSpotlight();
        return;
      }

      // Check if clicked on a tile
      const tileEl = (e.target as HTMLElement).closest('.item');
      if (tileEl) {
        const clickedItem = itemsRef.current.find((it) => it.el === tileEl);
        if (clickedItem) {
          openSpotlight(clickedItem);
          return;
        }
      }

      // Otherwise pin/unpin circle
      if (circleIsPinned.current) {
        circleIsPinned.current = false;
      } else {
        circleIsPinned.current = true;
        circlePinnedPos.current = { ...circleMousePos.current };
        circleTargetPos.current = { ...circlePinnedPos.current };
      }
    };

    // Keyboard navigation for slideshow
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isZoomed.current) return;
      if (e.key === 'ArrowRight') navigateSlide(1);
      else if (e.key === 'ArrowLeft') navigateSlide(-1);
      else if (e.key === 'Escape') closeSpotlight();
    };

    // Touch support
    const onTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('nav')) return;
      const touch = e.touches[0];
      dragRef.current.isDragging = true;
      dragRef.current.startX = touch.clientX;
      dragRef.current.startY = touch.clientY;
      dragRef.current.scrollX = scrollRef.current.target.x;
      dragRef.current.scrollY = scrollRef.current.target.y;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragRef.current.isDragging) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragRef.current.startX;
      const dy = touch.clientY - dragRef.current.startY;
      scrollRef.current.target.x = dragRef.current.scrollX + dx;
      scrollRef.current.target.y = dragRef.current.scrollY + dy;
    };

    const onTouchEnd = () => {
      dragRef.current.isDragging = false;
    };

    // --- Render Loop ---

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    let frameId: number;

    const render = () => {
      const scroll = scrollRef.current;
      const win = winRef.current;
      const tile = tileSizeRef.current;

      // When centering, GSAP drives scroll directly — skip lerp but still update tile positions
      // When zoomed, freeze everything
      if (!isCentering.current && !isZoomed.current) {
        // Idle drift — gently push scroll when mouse is idle
        const idle = idleRef.current;
        if (idle.isIdle && !dragRef.current.isDragging) {
          // Smoothly ramp up drift with a blend factor
          idle.blend = Math.min((idle.blend || 0) + 0.005, 1);
          scroll.target.x += idle.velocityX * idle.blend;
          scroll.target.y += idle.velocityY * idle.blend;
        } else {
          idle.blend = 0;
        }

        // Normal lerp scroll
        scroll.current.x += (scroll.target.x - scroll.current.x) * scroll.ease;
        scroll.current.y += (scroll.target.y - scroll.current.y) * scroll.ease;
      }

      // Scroll delta for velocity-based parallax
      const dx = scroll.current.x - scroll.last.x;
      const dy = scroll.current.y - scroll.last.y;

      // Lerp mouse for smooth parallax
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update tiles
      const zoomed = isZoomed.current;
      const activeEl = activeItemRef.current?.el;
      const isMobileView = win.w < 768;
      itemsRef.current.forEach((item) => {
        if (!item.el) return;

        // Parallax: on mobile skip mouse-position component (no cursor)
        const parX = 3 * dx * item.ease + (isMobileView ? 0 : (mx - 0.5) * item.w * 0.15);
        const parY = 3 * dy * item.ease + (isMobileView ? 0 : (my - 0.5) * item.h * 0.15);

        const posX = item.x + scroll.current.x + item.extraX + parX;
        const posY = item.y + scroll.current.y + item.extraY + parY;

        // Infinite wrapping
        if (!zoomed) {
          if (posX > win.w) item.extraX -= tile.w;
          if (posX + item.w < 0) item.extraX += tile.w;
          if (posY > win.h) item.extraY -= tile.h;
          if (posY + item.h < 0) item.extraY += tile.h;
        }

        const finalX = item.x + scroll.current.x + item.extraX + parX;
        const finalY = item.y + scroll.current.y + item.extraY + parY;

        // Skip DOM write for tiles fully offscreen (±200px buffer)
        if (!zoomed &&
            (finalX + item.w < -200 || finalX > win.w + 200 ||
             finalY + item.h < -200 || finalY > win.h + 200)) {
          return;
        }

        // When zoomed, let GSAP control scale on the active item
        if (zoomed && item.el === activeEl) {
          gsap.set(item.el, { x: finalX, y: finalY });
        } else {
          item.el.style.transform = `translate(${finalX}px, ${finalY}px)`;
        }
      });

      scroll.last.x = scroll.current.x;
      scroll.last.y = scroll.current.y;

      // Circle follow — skip on mobile (no cursor)
      if (circleRef.current && win.w >= 768) {
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

        // Sync to shared context so other pages can pick up position
        circlePosition.current.x = circleTargetPos.current.x;
        circlePosition.current.y = circleTargetPos.current.y;
      }

      frameId = requestAnimationFrame(render);
    };

    // Bind events
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('click', onClick);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', buildGrid);

    frameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', buildGrid);
      cancelAnimationFrame(frameId);
    };
  }, [circleRef, buildGrid, showDetail, hideDetail, hideHoverTitle, navigateSlide]);

  return (
    <div className="fixed inset-0 overflow-hidden cursor-grab active:cursor-grabbing select-none" style={{ background: 'transparent' }}>
      <Navigation variant="homepage" />
      <div ref={containerRef} className="w-full h-full relative" style={{ zIndex: 20 }} />

      {/* Slideshow arrows — positioned halfway between image and canvas edge */}
      <button
        ref={arrowLeftRef}
        className="detail-arrow"
        onClick={() => navigateSlide(-1)}
        style={{
          position: 'fixed',
          left: '12.5%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0,
          zIndex: 30,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.5rem',
          color: '#000',
          padding: '10px',
        }}
      >
        &larr;
      </button>
      <button
        ref={arrowRightRef}
        className="detail-arrow"
        onClick={() => navigateSlide(1)}
        style={{
          position: 'fixed',
          right: '12.5%',
          top: '50%',
          transform: 'translate(50%, -50%)',
          opacity: 0,
          zIndex: 30,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.5rem',
          color: '#000',
          padding: '10px',
        }}
      >
        &rarr;
      </button>
    </div>
  );
};

export default GalleryPage;
