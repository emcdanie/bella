import React, { type CSSProperties } from 'react';
import styles from './LastRun.module.css';

export interface LastRunProps {
  /** Figma "When". The time it last ran ("09:24", "22 Nov"). Missing with no `result` = "Not run yet". */
  when?: string;
  /** Figma "Took". How long ("2 s", "5 min"). */
  took?: string;
  /** Figma "Result". What it found, in words ("nothing new", "2 new"). */
  result?: string;
  /** Figma "tone". failed says "Did not land" first, in the danger ink; the words carry it, not the colour. */
  tone?: 'default' | 'failed';
  /** Extra classes on the root. */
  className?: string;
  style?: CSSProperties;
}

/**
 * The stamp under any action that can be run again: what, when, how long, what it found, as one line
 * ("Ran 09:24 · 2 s · nothing new"). Numbers in the number face. Not interactive.
 */
export default function LastRun({ when, took, result, tone = 'default', className, style }: LastRunProps) {
  const never = when == null && result == null;
  const lead = tone === 'failed' ? 'Did not land' : 'Ran';
  return (
    <p className={[styles.root, tone === 'failed' ? styles.failed : '', className].filter(Boolean).join(' ')} style={style} data-bella-component="last-run">
      {never ? (
        'Not run yet'
      ) : (
        <>
          {lead}
          {when != null ? <> <span className={styles.num}>{when}</span></> : null}
          {took != null ? <>{' · '}<span className={styles.num}>{took}</span></> : null}
          {result != null ? <>{' · '}{result}</> : null}
        </>
      )}
    </p>
  );
}
