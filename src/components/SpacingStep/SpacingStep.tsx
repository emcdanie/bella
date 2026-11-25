import React, { type CSSProperties } from 'react';
import styles from './SpacingStep.module.css';

export type SpacingStepStep = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 'touch';

export interface SpacingStepProps {
  /** Figma "step": the spacing step; the bar is drawn at the token's real size. */
  step: SpacingStepStep;
  /** Figma "Value": the size in words. Defaults to the step's px ("16px"; touch "44px"). */
  value?: string;
  /** Pink bar that grows in from zero when it scrolls into view (CHIP Foundations). Still under reduced motion. */
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
}

const PX: Record<string, number> = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 20: 80, touch: 44 };

/**
 * One spacing step drawn at its real size: the bar is the token (Figma
 * BellaComponents "Spacing step" 796:8518, read 19 Nov 2026). Use: the spacing
 * ramp on CHIP Foundations.
 */
export default function SpacingStep({ step, value, animated, className, style }: SpacingStepProps) {
  const px = PX[String(step)];
  return (
    <div className={[styles.row, animated && styles.animated, className].filter(Boolean).join(' ')} style={style} data-bella-component="spacing-step">
      <span className={styles.step}>{step}</span>
      <span className={[styles.bar, styles[`s${px}` as keyof typeof styles]].join(' ')} aria-hidden="true" />
      <span className={styles.value}>{value ?? `${px}px`}</span>
    </div>
  );
}
