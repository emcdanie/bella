import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './ScaledFrame.module.css';

export interface ScaledFrameProps {
  /** Accessible name for the frame (the iframe title, or the specimen's image name). */
  title: string;
  /**
   * A live specimen rendered in the same document at its design size, then
   * scaled. It inherits [data-theme] and the BELLA tokens directly, so it
   * flips with the page and needs no theme plumbing.
   */
  children?: ReactNode;
  /** An embedded page instead of a live specimen. Ignored when children are set. */
  src?: string;
  /** Intrinsic design width the canvas is laid out at. */
  designWidth?: number;
  /** Intrinsic design height the canvas is laid out at. */
  designHeight?: number;
  /**
   * Interactive frames take pointer and keyboard input. Non-interactive
   * frames are for viewing only: inert, out of the tab order.
   */
  interactive?: boolean;
  /** Fires when an embedded page (src) has loaded. */
  onLoad?: () => void;
  /** Extra classes on the frame. */
  className?: string;
}

/**
 * THE scaled frame, ported from the portfolio (2026-09-21): the full canvas
 * renders at its intrinsic design size and scales down to the container.
 * No internal scrolling, no cropping, at any width.
 *
 * Theme: live children read the BELLA tokens through [data-theme] like
 * everything else on the page. An embedded page (src) gets the current
 * [data-theme] mirrored over postMessage ({ type: "theme" }); the portfolio's
 * ?theme= query param is gone.
 */
export default function ScaledFrame({
  title,
  children,
  src,
  designWidth = 1280,
  designHeight = 800,
  interactive = false,
  onLoad,
  className,
}: ScaledFrameProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState<number | null>(null);
  const live = children != null;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = () => setScale(el.clientWidth / designWidth);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [designWidth]);

  const postTheme = () => {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    frameRef.current?.contentWindow?.postMessage({ type: 'theme', theme }, '*');
  };
  useEffect(() => {
    if (live) return;
    const obs = new MutationObserver(postTheme);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, [live]);

  const canvasStyle = {
    width: `${designWidth}px`,
    height: `${designHeight}px`,
    transform: scale === null ? undefined : `scale(${scale})`,
    visibility: scale === null ? ('hidden' as const) : ('visible' as const),
  };

  return (
    <div
      ref={wrapRef}
      className={[styles.frame, className].filter(Boolean).join(' ')}
      style={{ aspectRatio: `${designWidth} / ${designHeight}` }}
      data-bella-component="scaled-frame"
    >
      {live ? (
        <div
          className={[styles.canvas, interactive ? '' : styles.static].filter(Boolean).join(' ')}
          style={canvasStyle}
          role={interactive ? 'group' : 'img'}
          aria-label={title}
          inert={!interactive}
        >
          {children}
        </div>
      ) : (
        <iframe
          ref={frameRef}
          src={src}
          title={title}
          loading="lazy"
          onLoad={() => {
            postTheme();
            onLoad?.();
          }}
          tabIndex={interactive ? undefined : -1}
          className={[styles.canvas, styles.iframe, interactive ? '' : styles.static]
            .filter(Boolean)
            .join(' ')}
          style={canvasStyle}
          allow={interactive ? 'fullscreen' : undefined}
          allowFullScreen={interactive || undefined}
        />
      )}
    </div>
  );
}
