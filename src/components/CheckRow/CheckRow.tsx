import React, { type CSSProperties, type ReactNode } from 'react';
import ListRow from '../ListRow/ListRow';
import IconWell from '../IconWell/IconWell';
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
  /** Figma "status". pass: Icon well success with CheckCircle, success bar. fail: Icon well warning with WarningCircle, attention bar, and the text button. */
  status?: 'pass' | 'fail';
  /** List item Text stack "Title": the check. */
  title: ReactNode;
  /** List item Text stack "Subtitle": what is missing. Missing = off. */
  subtitle?: ReactNode;
  /** List item "Value": the count ("42/44"). */
  value: ReactNode;
  /** Progress "Fill · value", 0 to 100. */
  fill: number;
  /** Progress "Target · target", 0 to 100. Missing = no target mark. */
  target?: number;
  /** List item "Text button" label (fail only): "Add stories". */
  actionLabel?: string;
  /** What the text button does. */
  onAction?: () => void;
  /** The row's element: li inside a ListRowGroup (default), div elsewhere. */
  as?: 'li' | 'div';
  className?: string;
  style?: CSSProperties;
}

/**
 * One health check across all components. A configuration of List item
 * (ListRow), never its own drawing: Left = Icon well, Middle = title and
 * what is missing, then the text button underneath (fail), Right = the
 * count, Below = the Progress bar with its target.
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
      iconWell={<IconWell icon={pass ? 'CheckCircle' : 'WarningCircle'} tone={pass ? 'success' : 'warning'} />}
      title={title}
      description={subtitle}
      textButton={
        !pass && onAction ? (
          <Button variant="tertiary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : undefined
      }
      value={value}
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
