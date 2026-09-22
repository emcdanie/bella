import React, { type ReactNode } from 'react';
import Button from '../../../components/Button/Button';
import { usePlayOnce } from '../usePlayOnce';
import styles from './FlowDiagram.module.css';

export interface FlowDiagramProps {
  /** The accessible story the picture tells, read in place of the drawing. */
  label?: string;
  /** The three frame labels, left to right (Mono, under the drawing). */
  stages?: [string, string, string];
  /** Optional caption under the panel (Mono, muted). */
  caption?: ReactNode;
  /** Visible label of the replay control. */
  replayLabel?: string;
}

const DEFAULT_LABEL =
  'Three colour tokens appear one at a time. The first travels along a line into a button and fills it, then the button travels on and lands in a page layout, which holds still.';

/**
 * FlowDiagram (style unify, 2026-09-22; ported from the Geist direction
 * study, flow v2). Tokens become components become pages: a fixed
 * 900 x 198 viewBox scaled to fit, every block centred on its frame, 1px
 * ink strokes, colour only in the chip fills, one lavender token travelling
 * the whole way. Plays once when in view, then holds; Replay runs it again;
 * reduced motion shows the finished frame. A named diagram exception to the
 * one-icon-set rule: labelled image, data-bella-diagram.
 */
export default function FlowDiagram({
  label = DEFAULT_LABEL,
  stages = ['tokens', 'components', 'pages'],
  caption,
  replayLabel = 'Replay',
}: FlowDiagramProps) {
  const { ref, armed, playing, run, replay } = usePlayOnce<HTMLDivElement>();
  return (
    <figure className={styles.figure} data-bella-pattern="flow-diagram">
      <div className={styles.panel} ref={ref} data-bella-reveal>
        <svg
          key={run}
          className={[styles.flow, armed ? styles.armed : '', playing ? styles.play : ''].filter(Boolean).join(' ')}
          viewBox="0 36 900 198"
          role="img"
          aria-label={label}
          data-bella-diagram
        >
          {/* frames: 60 | 220 | 60 | 220 | 60 | 220 | 60, centred on y 135.5 */}
          <rect className={`${styles.frame} ${styles.d0}`} pathLength={1} x="60.5" y="50.5" width="220" height="170" rx="14" />
          <rect className={`${styles.frame} ${styles.d1}`} pathLength={1} x="340.5" y="50.5" width="220" height="170" rx="14" />
          <rect className={`${styles.frame} ${styles.d2}`} pathLength={1} x="620.5" y="50.5" width="220" height="170" rx="14" />
          <path className={`${styles.wire} ${styles.w1}`} pathLength={1} d="M280.5 135.5 H340.5" />
          <path className={`${styles.wire} ${styles.w2}`} pathLength={1} d="M560.5 135.5 H620.5" />

          {/* tokens, centred on 170.5 */}
          <g className={`${styles.tok} ${styles.t1}`}>
            <rect className={styles.c1} x="90.5" y="75.5" width="40" height="24" rx="8" />
            <rect className={styles.bar} x="142.5" y="82.5" width="108" height="10" rx="5" />
          </g>
          <g className={`${styles.tok} ${styles.t2}`}>
            <rect className={styles.c2} x="90.5" y="123.5" width="40" height="24" rx="8" />
            <rect className={styles.bar} x="142.5" y="130.5" width="84" height="10" rx="5" />
          </g>
          <g className={`${styles.tok} ${styles.t3}`}>
            <rect className={styles.c3} x="90.5" y="171.5" width="40" height="24" rx="8" />
            <rect className={styles.bar} x="142.5" y="178.5" width="96" height="10" rx="5" />
          </g>

          {/* component, centred on 450.5 */}
          <rect className={`${styles.bar} ${styles.fade}`} x="385.5" y="88.5" width="90" height="10" rx="5" />
          <rect className={`${styles.c1} ${styles.btnFill}`} x="385.5" y="112.5" width="130" height="36" rx="18" />
          <rect className={styles.btnLine} x="385.5" y="112.5" width="130" height="36" rx="18" />
          <text className={styles.btnText} x="450.5" y="131">
            button
          </text>
          <rect className={`${styles.bar} ${styles.fade}`} x="385.5" y="172.5" width="130" height="8" rx="4" />

          {/* page, centred on 730.5 */}
          <rect className={`${styles.bar} ${styles.fade}`} x="650.5" y="80.5" width="110" height="10" rx="5" />
          <rect className={`${styles.card} ${styles.k1}`} pathLength={1} x="650.5" y="102.5" width="74" height="56" rx="8" />
          <rect className={`${styles.card} ${styles.k2}`} pathLength={1} x="736.5" y="102.5" width="74" height="56" rx="8" />
          <rect className={`${styles.c1} ${styles.pill}`} x="650.5" y="172.5" width="70" height="20" rx="10" />

          {/* the travelling token */}
          <circle className={`${styles.c1} ${styles.dot} ${styles.m1}`} cx="280.5" cy="135.5" r="5" />
          <circle className={`${styles.c1} ${styles.dot} ${styles.m2}`} cx="560.5" cy="135.5" r="5" />
        </svg>
        <div className={styles.stages} aria-hidden="true">
          {stages.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
        <div className={styles.replay}>
          <Button variant="secondary" shape="pill" onClick={replay} ariaLabel={`${replayLabel} the flow animation`}>
            {replayLabel}
          </Button>
        </div>
      </div>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
