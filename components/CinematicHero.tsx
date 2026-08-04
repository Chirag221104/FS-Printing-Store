  'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from './CinematicHero.module.css';

const TOTAL_FRAMES = 300;

const getFramePath = (index: number) => {
  const num = String(index + 1).padStart(3, '0'); // Frames start from 001
  return `/part1/ezgif-frame-${num}.png`;
};

export default function CinematicHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const scrollHandlerAttached = useRef(false);
  const canvasReady = useRef(false);
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [fullyLoaded, setFullyLoaded] = useState(false);

  // Draw a specific frame on canvas (only if that frame's image is loaded)
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clamped = Math.max(0, Math.min(frameIndex, TOTAL_FRAMES - 1));
    const img = imagesRef.current[clamped];
    if (img && img.complete && img.naturalWidth > 0) {
      // Set canvas size from image on first draw
      if (!canvasReady.current) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvasReady.current = true;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Start scroll-driven animation — called once first frame is ready
  const startScrollAnimation = useCallback(() => {
    if (scrollHandlerAttached.current) return;
    scrollHandlerAttached.current = true;

    const section = sectionRef.current;
    if (!section) return;

    drawFrame(0);

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Use window.scrollY to start the animation instantly when scrolling from the top of the page
      const scrolled = window.scrollY;
      const scrollableDistance = sectionHeight - viewportHeight;

      const progress = Math.min(Math.max(scrolled / scrollableDistance, 0), 1);
      targetFrameRef.current = Math.floor(progress * (TOTAL_FRAMES - 1));
    };

    // Smooth lerp loop
    const lerp = () => {
      const target = targetFrameRef.current;
      const current = currentFrameRef.current;
      const ease = 0.08; // Lower value = smoother, lazier lag behind scroll
      const next = current + (target - current) * ease;

      const rounded = Math.round(next);
      if (rounded !== Math.round(current)) {
        drawFrame(rounded);
      }

      currentFrameRef.current = next;
      rafRef.current = requestAnimationFrame(lerp);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // set initial position
    rafRef.current = requestAnimationFrame(lerp);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawFrame]);

  // Preload all frames — show canvas as soon as first frame loads
  useEffect(() => {
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    let loadedCount = 0;
    let firstLoaded = false;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i + 1); // frames are 1-indexed
      img.onload = () => {
        loadedCount++;
        setLoadProgress(Math.floor((loadedCount / TOTAL_FRAMES) * 100));

        // As soon as the FIRST frame is ready, show canvas and start animation
        if (!firstLoaded && i === 0) {
          firstLoaded = true;
          setFirstFrameReady(true);
        }

        if (loadedCount === TOTAL_FRAMES) {
          setFullyLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        setLoadProgress(Math.floor((loadedCount / TOTAL_FRAMES) * 100));
        if (loadedCount === TOTAL_FRAMES) {
          setFullyLoaded(true);
        }
      };
      images[i] = img;
    }

    imagesRef.current = images; // assign immediately so drawFrame can access them

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Start scroll handler as soon as first frame is ready
  useEffect(() => {
    if (!firstFrameReady) return;
    const cleanup = startScrollAnimation();
    return cleanup;
  }, [firstFrameReady, startScrollAnimation]);

  const showLoadingOverlay = !fullyLoaded && !firstFrameReady;

  return (
    <section ref={sectionRef} className={styles.cinematicSection}>
      <div className={styles.stickyContainer}>
        {showLoadingOverlay && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingContent}>
              <div className={styles.loaderRing}>
                <div className={styles.loaderInner} />
              </div>
              <p className={styles.loadingText}>Crafting the Experience</p>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${loadProgress}%` }} />
              </div>
              <span className={styles.progressText}>{loadProgress}%</span>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className={`${styles.canvas} ${firstFrameReady ? styles.canvasVisible : ''}`}
        />

        <div className={styles.gradientOverlay} />

        <div className={styles.tagline}>
          <span className={styles.taglineAccent}>From Thread to Product</span>
          <span className={styles.taglineSeparator}>—</span>
          <span>We Print Your Ideas Into Reality</span>
        </div>
      </div>
    </section>
  );
}
