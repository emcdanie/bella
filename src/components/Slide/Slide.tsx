import React, { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './Slide.module.css';

export interface SlideProps {
  /** The slide's name, spoken by a reader ("Slide 3: Health and drift"). */
  label: string;
  /** What the slide holds. Stacked top to bottom with 24 between; parts bring their own sizes. */
  children?: ReactNode;
  /** Centre the content on both axes (a title or an ask). Default false: content starts at the top. */
  centered?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Slide (gap named in the deck plan, 23 Nov 2026): one 16:9 slide. It is drawn at its own design size,
 * 1280 by 720, and scaled down to the space it is given, so a slide reads the same in the stage, the
 * all-slides grid and a thumbnail. The 16 px floor applies at the design size, as ScaledFrame does.
 * It owns the frame only: a card edge, the surface, and 64 of padding. What goes in is BELLA parts.
 */
export default function Slide({ label, children, centered = false, className, style }: SlideProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!frame || !canvas) return;
    const apply = () => {
      const w = canvas.offsetWidth;
      if (w > 0) setScale(frame.clientWidth / w);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(frame);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={frameRef}
      className={[styles.frame, className].filter(Boolean).join(' ')}
      style={style}
      role="group"
      aria-roledescription="slide"
      aria-label={label}
      data-bella-component="slide"
    >
      <div
        ref={canvasRef}
        className={[styles.canvas, centered ? styles.centered : ''].filter(Boolean).join(' ')}
        style={{ '--slide-scale': scale ?? 1, visibility: scale == null ? 'hidden' : 'visible' } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}
