import React, { type CSSProperties, type ReactNode } from 'react';
import { usePlayOnce } from '../usePlayOnce';
import styles from './ProcessSteps.module.css';

export interface ProcessStep {
  title: ReactNode;
  body: ReactNode;
}

export interface ProcessStepsProps {
  /** The steps, in order. Numbered 01, 02 ... in Mono. */
  steps: ProcessStep[];
  /** Accessible name for the list. */
  label: string;
  /** Heading level for each step title; the titles are Geist 500 at 20px either way. */
  titleAs?: 'h3' | 'h4';
}

/**
 * ProcessSteps (style unify, 2026-09-22; ported from the Geist direction
 * study, "my process, line version"). No cards, no shadows: a hairline that
 * fills step by step, one dot per step, Mono numbers. A row once its own
 * container reaches 768px (breakpoint.tablet), stacked below. Plays once in
 * view, then holds; the static and reduced-motion render is the finished
 * frame (line full, every dot filled).
 */
export default function ProcessSteps({ steps, label, titleAs: Title = 'h3' }: ProcessStepsProps) {
  const { ref, armed, playing, run } = usePlayOnce<HTMLDivElement>(0.3);
  return (
    <div
      ref={ref}
      className={[styles.container, armed ? styles.armed : '', playing ? styles.play : ''].filter(Boolean).join(' ')}
      style={{ '--n': steps.length } as CSSProperties}
      data-bella-pattern="process-steps"
      data-bella-reveal
    >
      <div className={styles.track} key={run}>
        <span className={styles.progress} aria-hidden="true" />
        <ol className={styles.steps} aria-label={label}>
          {steps.map((s, i) => (
            <li key={i} className={styles.step} style={{ '--i': i } as CSSProperties}>
              {/* before its step fills, the dot is hollow: it paints the page
                  ground to punch through the hairline, so it is marked ground */}
              <span className={styles.dot} aria-hidden="true" data-bella-ground />
              <span className={styles.n}>{String(i + 1).padStart(2, '0')}</span>
              <Title className={styles.title}>{s.title}</Title>
              <p className={styles.body}>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
