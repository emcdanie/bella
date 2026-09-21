import React, { type ReactNode } from 'react';
import Heading from '../../components/Heading/Heading';
import Card from '../../components/Card/Card';
import styles from './WorkIntro.module.css';

export interface WorkIntroProps {
  /** The section label, set in brackets: Work renders "<WORK>". */
  label: string;
  /** The statement h1. It takes the full width of the intro. */
  statement: ReactNode;
  /** One accent segment after the statement. */
  accent?: ReactNode;
  /** Text after the accent (e.g. a full stop). */
  after?: ReactNode;
  /** The practice paragraph: two lines at wide widths. */
  practice: ReactNode;
  /** Optional side proof panel: figures with a short label each. */
  proof?: { figure: string; label: string }[];
  /** Accessible name for the proof panel. */
  proofLabel?: string;
}

/**
 * WorkIntro (Work patterns, 2026-09-21): Southleft's "<WORK>" opening.
 * Bracketed label, a statement h1 on the hero tier so it uses the width, a practice paragraph,
 * and an optional proof panel beside it (a static Card: it never lifts).
 */
export default function WorkIntro({
  label,
  statement,
  accent,
  after,
  practice,
  proof,
  proofLabel = 'In numbers',
}: WorkIntroProps) {
  return (
    <header className={styles.container} data-bella-pattern="work-intro">
      <div className={styles.intro}>
        <p className={styles.label}>
          <span className={styles.bracket} aria-hidden="true">&lt;</span>
          {label}
          <span className={styles.bracket} aria-hidden="true">&gt;</span>
        </p>
        <Heading tier="hero" as="h1" accent={accent} after={after} className={styles.statement}>
          {statement}
        </Heading>
        <div className={[styles.row, proof?.length ? styles.withProof : ''].filter(Boolean).join(' ')}>
          <p className={styles.practice}>{practice}</p>
          {proof?.length ? (
            <Card className={styles.proof}>
              <dl className={styles.figures} aria-label={proofLabel}>
                {proof.map((p) => (
                  <div key={p.label} className={styles.figureRow}>
                    <dt className={styles.figureLabel}>{p.label}</dt>
                    <dd className={styles.figure}>{p.figure}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          ) : null}
        </div>
      </div>
    </header>
  );
}
