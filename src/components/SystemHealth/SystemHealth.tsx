import React, { type CSSProperties, type ReactNode } from 'react';
import IconWell from '../IconWell/IconWell';
import Icon from '../Icon/Icon';
import StatusDot from '../StatusDot/StatusDot';
import useCountTo, { formatDiff } from '../shared/useCountTo';
import styles from './SystemHealth.module.css';

export interface SystemHealthFail {
  /** Figma Fail row "Name". The check that fails. */
  name: ReactNode;
  /** Figma Fail row "Number". How many fail. */
  count: ReactNode;
  /** Figma Fail row "Of total". What the number counts ("of 44 parts"). */
  ofTotal: ReactNode;
  /** The row opens the failing list: a link. */
  href?: string;
  /** The row opens the failing list: a button. Ignored when `href` is set. */
  onOpen?: () => void;
}

export interface SystemHealthProps {
  /** Figma "Title". */
  title?: ReactNode;
  /** Figma "Subtitle". */
  subtitle?: ReactNode;
  /** Gauge "Value": the share that passes, 0 to 100. Lights that share of the 40 ticks. */
  value: number;
  /** Gauge "Status": the word under the number ("Healthy"). */
  status: ReactNode;
  /** The target tick, 0 to 100 (Figma: 90, the blue tick). */
  target?: number;
  /** Figma "Passed": the count in words under the arc ("251 of 264 pass"). */
  passed: ReactNode;
  /** Figma "Why": what healthy means, and what still fails. */
  why?: ReactNode;
  /** Figma "Failing checks": one Fail row each. */
  failing?: SystemHealthFail[];
  className?: string;
  style?: CSSProperties;
}

/* Gauge geometry, measured from the published Figma "Gauge" (283 x 174):
   40 ticks over 220 degrees around (141.5, 126.5), each from radius 87.5 to
   116.5 with a 6 round-capped stroke; the target tick runs 83.5 to 121.5 at 10. */
const TICKS = 40;
const SWEEP = 220;
const START = 90 + SWEEP / 2; // 200 degrees: the low end, bottom left

/** The angle of tick i in degrees, counter-clockwise from the right (220 degrees, low end bottom left). */
function tickAngle(i: number) {
  return START - (i * SWEEP) / (TICKS - 1);
}

/* A tick is a round-ended bar: its length includes both caps (stroke / 2 each
   side), placed from the centre and turned to its angle. Units are the
   Figma gauge's px, scaled to the card by the --u unit in CSS. */
function tickStyle(i: number, r0: number, r1: number, w: number): CSSProperties {
  return {
    ['--a' as string]: `${-tickAngle(i)}deg`,
    ['--r0' as string]: r0 - w / 2,
    ['--len' as string]: r1 - r0 + w,
    ['--w' as string]: w,
  };
}

/**
 * System health card (Chip): icon well and title, subtitle, a segmented arc
 * gauge of 40 ticks with the value and status centred over it, the scale row
 * (Low, the count, High), why, and the failing checks as rows that open them.
 * Decided 18 Nov: "It becomes the System health part in the library".
 */
export default function SystemHealth({
  title = 'System health',
  subtitle = 'Component checks that pass',
  value,
  status,
  target = 90,
  passed,
  why,
  failing = [],
  className,
  style,
}: SystemHealthProps) {
  const pct = Math.max(0, Math.min(100, value));
  /* Chart motion (22 Nov): when the gauge first shows, the ticks light one
   * after another from Low to the score while the number counts up, over
   * motion/duration/450 on motion/easing/out. A new score fills or empties
   * tick by tick from the old score to the new one and the difference shows
   * once under the number. Reduced motion: the end state at once.
   * aria-valuenow is the real score throughout. */
  const count = useCountTo(pct, { from: 0 });
  const lit = Math.round((count.shown / 100) * TICKS);
  const targetIndex = Math.round((Math.max(0, Math.min(100, target)) / 100) * TICKS);
  const valueText = `${pct}%, ${typeof status === 'string' ? status : ''}`.replace(/, $/, '');

  return (
    <section className={[styles.card, className].filter(Boolean).join(' ')} style={style} data-bella-reveal="">
      <div className={styles.heading}>
        <div className={styles.titleRow}>
          <IconWell icon="Activity" tone="success" />
          <h2 className={styles.title}>{title}</h2>
        </div>
        {subtitle != null ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>

      <div className={styles.gaugeBlock}>
        <div
          className={styles.gauge}
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-valuetext={valueText}
          aria-label={typeof title === 'string' ? title : 'System health'}
        >
          <div className={styles.arc} aria-hidden="true">
            {Array.from({ length: TICKS }, (_, i) => {
              const n = i + 1;
              if (n === targetIndex) {
                return <span key={i} className={styles.target} style={tickStyle(i, 83.5, 121.5, 10)} />;
              }
              const tone = n > lit ? styles.off : styles.on;
              return <span key={i} className={[styles.tick, tone].join(' ')} style={tickStyle(i, 87.5, 116.5, 6)} />;
            })}
          </div>
          <div className={styles.value} aria-hidden="true">
            <span className={styles.number}>
              {Math.round(count.shown)}%
              {count.diff ? (
                <span key={count.changeKey} className={styles.diff}>
                  {formatDiff(count.diff)}
                </span>
              ) : null}
            </span>
            <span className={styles.status}>{status}</span>
          </div>
        </div>
        <div className={styles.scale}>
          <span className={styles.end}>Low</span>
          <span className={styles.passed}>{passed}</span>
          <span className={styles.end}>High</span>
        </div>
      </div>

      {why != null || failing.length > 0 ? (
        <div className={styles.details}>
          {why != null ? <p className={styles.why}>{why}</p> : null}
          {failing.length > 0 ? (
            <ul className={styles.fails}>
              {failing.map((f, i) => {
                const inner = (
                  <>
                    <StatusDot tone="attention" showLabel={false} />
                    {/* name and count wrap as one group: the count sits beside the name, or under it when
                        both do not fit, so a long name keeps its word groups (Health at 1100, 21 Nov) */}
                    <span className={styles.label}>
                      <span className={styles.name}>{f.name}</span>
                      <span className={styles.count}>
                        <span className={styles.countNumber}>{f.count}</span> <span className={styles.ofTotal}>{f.ofTotal}</span>
                      </span>
                    </span>
                    {f.href != null || f.onOpen != null ? (
                      <span className={styles.arrow} aria-hidden="true">
                        <Icon name="ArrowUpRight" size="md" />
                      </span>
                    ) : null}
                  </>
                );
                return (
                  <li key={i}>
                    {f.href != null ? (
                      <a className={[styles.row, styles.open].join(' ')} href={f.href}>{inner}</a>
                    ) : f.onOpen != null ? (
                      <button type="button" className={[styles.row, styles.open].join(' ')} onClick={f.onOpen}>{inner}</button>
                    ) : (
                      <div className={styles.row}>{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
