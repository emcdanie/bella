import React, { type CSSProperties, type ReactNode } from 'react';
import Pin from '../Pin/Pin';
import Button from '../Button/Button';
import styles from './TourStep.module.css';

export interface TourStepProps {
  /** The Pin's number: matches the lit Code line. */
  number: ReactNode;
  /** Figma "Text": what this line means, in plain words. */
  children: ReactNode;
  /** Figma "Count": which step of how many ("4 of 4 steps"). */
  count: ReactNode;
  /** Figma "isEnd". true shows Done instead of Next. */
  isEnd?: boolean;
  /** Back. Missing = no Back button (the first step). */
  onBack?: () => void;
  /** Next, or Done on the last step. */
  onNext: () => void;
  /** Close: ends the tour and returns focus to the code. */
  onClose: () => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * One step of "Help me understand", walking through code a line at a time
 * (Figma BellaComponents Tour step 1455:40714, published 19 Nov 2026; Elleta,
 * 19 Nov: "maybe we can have a help me understand thing that will walk you
 * trhough how to read the code"). Buttons on the right, primary last.
 */
export default function TourStep({ number, children, count, isEnd = false, onBack, onNext, onClose, className, style }: TourStepProps) {
  return (
    <div className={[styles.step, className].filter(Boolean).join(' ')} style={style} role="group" aria-roledescription="tour step" data-bella-component="tour-step">
      <div className={styles.body}>
        <Pin number={number} variant="red" pinStyle="solid" />
        <p className={styles.text}>{children}</p>
        <Button variant="tertiary" iconOnly icon="Xmark" ariaLabel="Close the tour" onClick={onClose} />
      </div>
      <div className={styles.footer}>
        <span className={styles.count}>{count}</span>
        {onBack ? <Button variant="tertiary" onClick={onBack}>Back</Button> : null}
        <Button variant="secondary" onClick={onNext}>{isEnd ? 'Done' : 'Next'}</Button>
      </div>
    </div>
  );
}
