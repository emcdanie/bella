import React, { type CSSProperties } from 'react';
import Icon, { type IconName } from '../Icon/Icon';
import StatusDot, { type StatusDotProps } from '../StatusDot/StatusDot';
import { type StatusSquareProps } from '../StatusSquare/StatusSquare';
import IconWell from '../IconWell/IconWell';
import styles from './TreeItem.module.css';

export type TreeItemKind = 'group' | 'item' | 'folder' | 'branch' | 'status';

export interface TreeItemProps {
  /** Figma "Label". */
  label: string;
  /** Figma "Count". A number after the label (group and status rows). */
  count?: string | number;
  /** Figma "Show count". */
  showCount?: boolean;
  /** Figma "Needs work". The attention dot at the end of a group or item row (StatusDot, spoken "needs work"). */
  needsWork?: boolean;
  /** Figma "Line below". Branch rows: the tree's spine runs on to the next row. Off on the last branch. */
  lineBelow?: boolean;
  /**
   * Figma "kind". group: a chevron, a bold label and a count. item: a nested
   * row with its icon. folder: a project (Folder icon, chevron at the end).
   * branch: a branch under an open folder (spine and tick, then an Icon
   * well, sm, in the status tone, and the label; published 21 Nov). status: a run status (StatusDot, label, count).
   */
  kind?: TreeItemKind;
  /** Figma "open". group and folder: whether its rows show (aria-expanded). */
  open?: boolean;
  /** Figma "current". The row you are on: light-blue fill, bold ink label (aria-current="page"). */
  current?: boolean;
  /** branch: the status, drawn as Figma's nested Icon well (sm) in its tone and glyph. */
  status?: StatusSquareProps['status'];
  /** status: the StatusDot tone (Figma exposes the nested StatusDot). */
  tone?: StatusDotProps['tone'];
  /** item: its icon (Figma draws ViewGrid). */
  icon?: IconName;
  /** Renders a link. Without it the row is a button. */
  href?: string;
  onClick?: () => void;
  /** Extra classes on the root. */
  className?: string;
  style?: CSSProperties;
}

/**
 * One row of the project tree (Figma "Tree item", read 19 Nov 2026).
 * Figma's `state` (default, hover, focus) is CSS, not a prop. Every row is
 * 44 tall and the whole row is the target.
 */
/* branch status as Figma's Icon well, sm (Project panel 1168:96060, published 21 Nov): the tone's
   wash with a 16 glyph in the tone's ink; the word is its accessible name */
const BRANCH: Record<NonNullable<StatusSquareProps['status']>, { tone: 'error' | 'warning' | 'info' | 'success'; icon: IconName; word: string }> = {
  failed: { tone: 'error', icon: 'WarningCircle', word: 'failed' },
  waiting: { tone: 'warning', icon: 'Clock', word: 'waiting' },
  working: { tone: 'info', icon: 'RefreshDouble', word: 'working' },
  passed: { tone: 'success', icon: 'Check', word: 'passed' },
};

export default function TreeItem({
  label,
  count,
  showCount = count != null,
  needsWork = false,
  lineBelow = true,
  kind = 'group',
  open = false,
  current = false,
  status = 'passed',
  tone = 'attention',
  icon = 'ViewGrid',
  href,
  onClick,
  className,
  style,
}: TreeItemProps) {
  const counted = (kind === 'group' || kind === 'status') && showCount && count != null;
  const content = (
    <>
      {kind === 'group' ? <Icon name={open ? 'NavArrowDown' : 'NavArrowRight'} size="md" className={styles.subtle} /> : null}
      {kind === 'item' ? <Icon name={icon} size="md" /> : null}
      {kind === 'folder' ? <Icon name="Folder" size="md" /> : null}
      {kind === 'branch' ? <IconWell size="sm" tone={BRANCH[status].tone} icon={BRANCH[status].icon} label={BRANCH[status].word} /> : null}
      {/* every status dot shows its halo (Project panel, 21 Nov publish: "status dots have a halo") */}
      {kind === 'status' ? <StatusDot tone={tone} /> : null}
      <span className={styles.label}>{label}</span>
      {counted ? <span className={kind === 'status' ? styles.total : styles.count}>{count}</span> : null}
      {needsWork && (kind === 'group' || kind === 'item') ? (
        <StatusDot tone="attention" showWash={false} label="needs work" showLabel={false} />
      ) : null}
      {kind === 'folder' ? (
        <Icon name="NavArrowDown" size="sm" className={[styles.subtle, open ? styles.flip : ''].filter(Boolean).join(' ')} />
      ) : null}
    </>
  );
  const expandable = kind === 'group' || kind === 'folder';
  const controlProps = {
    className: [styles.row, styles[kind]].join(' '),
    'aria-current': current ? ('page' as const) : undefined,
    'aria-expanded': expandable ? open : undefined,
    onClick,
  };
  const control = href ? (
    <a href={href} {...controlProps}>
      {content}
    </a>
  ) : (
    <button type="button" {...controlProps}>
      {content}
    </button>
  );
  return (
    <div
      className={[styles.root, kind === 'branch' && lineBelow ? styles.lineBelow : '', className].filter(Boolean).join(' ')}
      style={style}
      data-bella-component="tree-item"
    >
      {kind === 'branch' ? <span className={styles.leader} aria-hidden="true" /> : null}
      {control}
    </div>
  );
}
