import React, { useEffect, useRef, useState } from 'react';
import Button from '../Button/Button';
import { useReducedMotion } from '../shared/useCountTo';
import styles from './VideoPlayer.module.css';

export interface VideoPlayerProps {
  /** The clip. */
  src: string;
  /** The still: the poster, and what stays on screen when the person wants less motion. Required. */
  poster: string;
  /** Captions (WebVTT). Shown by default; a silent clip needs them. */
  captions?: string;
  /** Language of the captions, as a code. Default "en". */
  captionsLang?: string;
  /** What the clip is, spoken by a reader. */
  label: string;
  /** Start by itself, muted. Ignored (the still waits for a press) when the person wants less motion. Default true. */
  autoPlay?: boolean;
  /** Play again from the start when it ends. Default false. */
  loop?: boolean;
  className?: string;
}

/**
 * Video player (deck plan, 23 Nov 2026): a clip with a visible Play or Pause button, because a native
 * control bar is not BELLA's. Muted and silent by design (a deck clip carries captions, not sound);
 * it autoplays only when the person has not asked for less motion, and otherwise shows the poster.
 * The clip is a 16:9 frame at the width it is given.
 */
export default function VideoPlayer({ src, poster, captions, captionsLang = 'en', label, autoPlay = true, loop = false, className }: VideoPlayerProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (autoPlay && !reduced) {
      v.muted = true;
      v.play().catch(() => setPlaying(false));
    } else {
      v.pause();
    }
  }, [autoPlay, reduced, src]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      if (ended) v.currentTime = 0;
      v.play().catch(() => setPlaying(false));
    } else {
      v.pause();
    }
  };

  return (
    <figure className={[styles.player, className].filter(Boolean).join(' ')} data-bella-component="video-player">
      <video
        ref={ref}
        className={styles.video}
        src={src}
        poster={poster}
        muted
        playsInline
        loop={loop}
        preload="metadata"
        aria-label={label}
        onPlay={() => { setPlaying(true); setEnded(false); }}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setEnded(true); }}
      >
        {captions ? <track kind="captions" src={captions} srcLang={captionsLang} label="Captions" default /> : null}
      </video>
      <figcaption className={styles.controls}>
        <Button variant="secondary" onClick={toggle}>{playing ? 'Pause' : ended ? 'Play again' : 'Play'}</Button>
      </figcaption>
    </figure>
  );
}
