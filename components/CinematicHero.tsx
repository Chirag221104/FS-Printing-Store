'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './CinematicHero.module.css';

const TOTAL_FRAMES = 240;

const getFramePath = (index: number) => {
  const num = String(index).padStart(3, '0');
  return `/products/ezgif-frame-${num}.jpg`;
};

export default function CinematicHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // Preload all frames
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedCount++;
        setLoadProgress(Math.floor((loadedCount / TOTAL_FRAMES) * 100));
        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = images;
          setLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        setLoadProgress(Math.floor((loadedCount / TOTAL_FRAMES) * 100));
      };
      images.push(img);
    }
  }, []);

  // Draw a specific frame on canvas
  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clamped = Math.max(0, Math.min(frameIndex, TOTAL_FRAMES - 1));
    const img = imagesRef.current[clamped];
    if (img && img.complete) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  };

  // Scroll-driven animation with smooth interpolation
  useEffect(() => {
    if (!loaded) return;

    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    // Set canvas resolution from first image
    const firstImg = imagesRef.current[0];
    if (firstImg) {
      canvas.width = firstImg.naturalWidth;
      canvas.height = firstImg.naturalHeight;
    }

    drawFrame(0);

    // Update target frame on scroll — maps scroll position within the section to frame index
    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      // -rect.top = how many pixels we've scrolled past the top of the section
      // scrollableDistance = total scrollable range within the section before it unsticks
      const scrolled = -rect.top;
      const scrollableDistance = sectionHeight - viewportHeight;
      
      // Clamp progress between 0 and 1
      const progress = Math.min(Math.max(scrolled / scrollableDistance, 0), 1);
      
      targetFrameRef.current = Math.floor(progress * (TOTAL_FRAMES - 1));
    };

    // Smooth lerp animation loop — runs independently of scroll events
    const lerp = () => {
      const target = targetFrameRef.current;
      const current = currentFrameRef.current;

      // Ease toward target (higher = snappier response to scroll)
      const ease = 0.25;
      const next = current + (target - current) * ease;

      // Only redraw if we moved enough
      const rounded = Math.round(next);
      if (rounded !== Math.round(current)) {
        drawFrame(rounded);
      }

      currentFrameRef.current = next;
      rafRef.current = requestAnimationFrame(lerp);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    rafRef.current = requestAnimationFrame(lerp);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [loaded]);

  return (
    <section ref={sectionRef} className={styles.cinematicSection}>
      <div className={styles.stickyContainer}>
        {!loaded && (
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
          className={`${styles.canvas} ${loaded ? styles.canvasVisible : ''}`}
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
