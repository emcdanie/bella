import React, { useId } from 'react';
import styles from './ScoreStrip.module.css';

export interface ScoreCell {
  /** Short label under the figure (`"A11y"`). */
  label: string;
  /** Full name, spoken instead of the short label (`"Accessibility"`). Defaults to label. */
  name?: string;
  /** 0 to 100, or null when the station is self-assessed rather than measured. */
  value: number | null;
}

export type ScoreBand = 'strong' | 'mid' | 'low' | 'self';

/** The bands, highest first. A score at or above `min` falls in the band. */
export const SCORE_BANDS: { band: Exclude<ScoreBand, 'self'>; min: number; word: string }[] = [
  { band: 'strong', min: 80, word: 'sturdy' },
  { band: 'mid', min: 60, word: 'drifting' },
  { band: 'low', min: 0, word: 'check engine' },
];

export function scoreBand(value: number | null): ScoreBand {
  if (value === null) return 'self';
  return (SCORE_BANDS.find((b) => value >= b.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1]).band;
}

const word = (band: ScoreBand) =>
  band === 'self' ? 'self-assessed' : SCORE_BANDS.find((b) => b.band === band)!.word;

export interface ScoreStripProps {
  /** The system being scored. */
  name: string;
  /** One line on what it is, set as a Mono label. */
  kind?: string;
  /** Overall score, 0 to 100, or null when it is self-assessed. */
  score: number | null;
  /** One cell per station, in a fixed order across strips. */
  cells: ScoreCell[];
  /** Heading level for the system name; match the outline it sits in. */
  as?: 'h2' | 'h3' | 'h4';
  /** Extra classes on the root. */
  className?: string;
}

/**
 * One system's readiness: an overall score and a strip of station scores,
 * banded sturdy, drifting or check engine. Measured and self-assessed are
 * told apart in text, never by fill alone.
 */
export default function ScoreStrip({ name, kind, score, cells, as: Tag = 'h3', className }: ScoreStripProps) {
  const id = useId();
  const overall = scoreBand(score);
  return (
    <section
      aria-labelledby={`${id}-name`}
      className={[styles.strip, className].filter(Boolean).join(' ')}
      data-bella-component="score-strip"
    >
      <div className={styles.id}>
        <Tag id={`${id}-name`} className={styles.name}>
          {name}
        </Tag>
        {kind ? <p className={styles.kind}>{kind}</p> : null}
        <p className={styles.overall}>
          {score === null ? (
            <span className={styles.selfWord}>Self-assessed</span>
          ) : (
            <>
              <span className={styles.score}>{score}</span>
              <span className={styles.of}> / 100</span>
              <span className={styles.srOnly}>, {word(overall)}</span>
            </>
          )}
        </p>
        {score !== null ? (
          <div className={styles.track} aria-hidden="true">
            <span className={styles.fill} style={{ inlineSize: `${Math.max(0, Math.min(100, score))}%` }} />
          </div>
        ) : null}
      </div>
      <ul
        className={styles.cells}
        aria-label={`${name} stations`}
        style={{ '--cells': cells.length } as React.CSSProperties}
      >
        {cells.map((c) => {
          const band = scoreBand(c.value);
          return (
            <li key={c.label} className={styles.cell} data-band={band}>
              <span className={styles.value} aria-hidden="true">
                {c.value === null ? 'self' : c.value}
              </span>
              <span className={styles.label} aria-hidden="true">
                {c.label}
              </span>
              <span className={styles.srOnly}>
                {c.name ?? c.label}:{' '}
                {c.value === null ? 'self-assessed' : `${c.value} of 100, ${word(band)}`}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** The band key, as a real list. Render once beside a set of strips. */
export function ScoreLegend({ className }: { className?: string }) {
  return (
    <ul className={[styles.legend, className].filter(Boolean).join(' ')} aria-label="Score bands">
      {SCORE_BANDS.map((b, i) => (
        <li key={b.band}>
          <span className={styles.swatch} data-band={b.band} aria-hidden="true" />
          {i === 0 ? `${b.min} to 100` : `${b.min} to ${SCORE_BANDS[i - 1].min - 1}`}, {b.word}
        </li>
      ))}
      <li>
        <span className={styles.swatch} data-band="self" aria-hidden="true" />
        self, self-assessed
      </li>
    </ul>
  );
}
