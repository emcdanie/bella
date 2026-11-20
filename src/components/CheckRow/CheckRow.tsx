import React, { type CSSProperties, type ReactNode } from 'react';
import ListRow from '../ListRow/ListRow';
import Progress, { TargetMark } from '../Progress/Progress';
import Tag from '../Tag/Tag';
import Button from '../Button/Button';
import styles from './CheckRow.module.css';

/* ---------------------------------------------------------------------------
 * Check list header: its own Figma part (1168:67724), exported from here.
 * ------------------------------------------------------------------------- */

export interface CheckListHeaderProps {
  /** Figma "Title". */
  title: ReactNode;
  /** Figma Count (Tag) label: the real number of rows shown, never a placeholder. */
  count: number;
  /** Figma "Legend": the target in words ("Target 90%"), beside the target mark the bars use. */
  legend?: ReactNode;
  /** Heading level of the Title. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
  style?: CSSProperties;
}

/** Header for a list of checks: title, count, and at the right the target legend. */
export function CheckListHeader({ title, count, legend, headingLevel = 2, className, style }: CheckListHeaderProps) {
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  return (
    <div className={[styles.header, className].filter(Boolean).join(' ')} style={style} data-bella-component="check-list-header">
      <H className={styles.title}>{title}</H>
      <Tag variant="outline" tone="count">
        {count}
        <span className={styles.srOnly}> {count === 1 ? 'check' : 'checks'}</span>
      </Tag>
      {legend != null ? (
        <span className={styles.legend}>
          <TargetMark className={styles.legendMark} />
          <span className={styles.legendText}>{legend}</span>
        </span>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Check row
 * ------------------------------------------------------------------------- */

export interface CheckRowProps {
  /** Figma "status". pass: success bar fill and the count alone at the right end. fail: attention fill, the count with the action under it. */
  status?: 'pass' | 'fail';
  /** List item Text stack "Title": the check. */
  title: ReactNode;
  /** List item Text stack "Subtitle": what is missing, or "Above the 90% target". Missing = off. */
  subtitle?: ReactNode;
  /** The count ("42/44"), once, at the row's right end in the number face at title size (21 Nov publish). The bar reads it too. */
  value: ReactNode;
  /** @deprecated The status Tag left the published Check row (21 Nov, "yes take it off"); ignored. Removing the prop is a public API change and waits for Elleta. */
  statusLabel?: ReactNode;
  /** Progress "Fill · value", 0 to 100. */
  fill: number;
  /** Progress "Target · target", 0 to 100. Missing = no target mark. */
  target?: number;
  /** The action's label (fail only): "Add stories". It sits at the row's right end, under the count. */
  actionLabel?: string;
  /** What the action does. */
  onAction?: () => void;
  /** The row's element: li inside a ListRowGroup (default), div elsewhere. */
  as?: 'li' | 'div';
  className?: string;
  style?: CSSProperties;
}

/**
 * One health check across all components. A configuration of List item
 * (ListRow), never its own drawing. Figma Check row 793:31331 (published
 * 21 Nov): no status bar and no status Tag, the progress bar is enough
 * (Elleta: "I don't want the status bar on this, it's too much; the
 * progress bar is fine", "yes take it off"). Middle = title 20 regular and
 * what is missing, on the bar's left edge; Right = the count once, Geist
 * Mono bold 20 ("the numbers are too small now"), with the action under it
 * on fail; Below = the Progress bar with its target.
 */
export default function CheckRow({
  status = 'pass',
  title,
  subtitle,
  value,
  fill,
  target,
  actionLabel = 'Add stories',
  onAction,
  as = 'li',
  className,
  style,
}: CheckRowProps) {
  const pass = status === 'pass';
  const words = typeof title === 'string' ? title : undefined;
  return (
    <ListRow
      as={as}
      layout="stacked"
      className={className}
      style={style}
      barHierarchy
      title={title}
      description={subtitle}
      value={<span className={styles.count}>{value}</span>}
      actionButton={
        /* buttons on the right, everywhere (her rule): the action ends the row, under the count */
        !pass && onAction ? (
          <Button variant="tertiary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : undefined
      }
      progress={
        <Progress
          label={words ?? 'Coverage'}
          value={typeof value === 'string' ? value : undefined}
          showLabel={false}
          showTarget={target != null}
          shape="bar"
          tone={pass ? 'success' : 'attention'}
          fill={fill}
          target={target ?? 0}
        />
      }
    />
  );
}
