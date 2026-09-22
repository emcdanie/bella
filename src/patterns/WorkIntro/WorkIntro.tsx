import React, { type ReactNode } from 'react';
import Heading from '../../components/Heading/Heading';
import Card from '../../components/Card/Card';
import Eyebrow from '../../components/Eyebrow/Eyebrow';
import styles from './WorkIntro.module.css';

export interface WorkIntroProps {
  /** The page label, set as the Mono eyebrow above the statement. */
  label: string;
  /** The statement h1. It takes the full width of the intro. */
  statement: ReactNode;
  /** One accent segment after the statement. */
  accent?: ReactNode;
  /** Text after the accent (e.g. a full stop). */
  after?: ReactNode;
  /** The practice paragraph: two lines at wide widths. */
  practice: ReactNode;
  /** Optional side proof panel: confirmed lines, rendered verbatim. No
   * derived or paraphrased figures. */
  proof?: ReactNode[];
  /** Accessible name for the proof panel. */
  proofLabel?: string;
}

/**
 * WorkIntro (Work patterns, 2026-09-21; restyled by the style unify,
 * 2026-09-22): a Mono eyebrow, a Geist Light statement h1 on the hero tier
 * with the muted half-line accent, a 20px muted practice paragraph,
 * and an optional proof panel beside it (a static Card: it never lifts).
 */
export default function WorkIntro({
  label,
  statement,
  accent,
  after,
  practice,
  proof,
  proofLabel = 'Proof',
}: WorkIntroProps) {
  return (
    <header className={styles.container} data-bella-pattern="work-intro">
      <div className={styles.intro}>
        <Eyebrow>{label}</Eyebrow>
        <Heading tier="hero" as="h1" accent={accent} after={after} className={styles.statement}>
          {statement}
        </Heading>
        <div className={[styles.row, proof?.length ? styles.withProof : ''].filter(Boolean).join(' ')}>
          <p className={styles.practice}>{practice}</p>
          {proof?.length ? (
            <Card className={styles.proof}>
              <ul className={styles.proofList} aria-label={proofLabel}>
                {proof.map((line, i) => (
                  <li key={i} className={styles.proofLine}>
                    {line}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </header>
  );
}
