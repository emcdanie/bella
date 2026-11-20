import React, { type CSSProperties, type ElementType, type ReactNode } from 'react';
import TextStack from '../TextStack/TextStack';
import Trailing, { type TrailingIcon } from '../Trailing/Trailing';
import { useChangeKey } from '../shared/useCountTo';
import styles from './ListRow.module.css';

export interface ListRowProps {
  /** What the item is. Figma Text stack "Title". */
  title: ReactNode;
  /** One line of why it matters. Figma Text stack "Subtitle" in the zoned row. */
  description?: ReactNode;

  /* Figma zones (List item, re-sync 19 Nov 2026). Passing `layout` or any
   * zone prop renders the zoned row; without them the row is the original
   * work-list row below, unchanged. A missing slot = the zone off. */

  /** Figma "layout". stacked: zones sit on the title line, text column stacks. inline: one line, every zone centred. */
  layout?: 'stacked' | 'inline';
  /** Figma state=selected. Light blue, never pink. Hover, pressed and focus come from the row being a target (`href` / `onClick`). */
  selected?: boolean;
  /** Figma "Left" › "↳ Icon well". An IconWell. */
  iconWell?: ReactNode;
  /** Figma "Left" › "↳ Pin" (published 19 Nov). A Pin on the title line (anatomy lists). */
  pin?: ReactNode;
  /** Figma "Middle" › Subtitle in the subtext face (Geist Mono in Chip): short meta, a code or a date ("OK #184 · 15 Oct"). Sentences go in `description` (Lexend, her y23 answer). */
  meta?: ReactNode;
  /** Figma "Left" › "↳ Status dot". A StatusDot. */
  statusDot?: ReactNode;
  /** Figma "Left" › "↳ Avatar". An Avatar. */
  avatar?: ReactNode;
  /** Figma Text stack "Overline". */
  overline?: ReactNode;
  /** Figma Text stack "Body". */
  body?: ReactNode;
  /** Figma "Middle" › "↳ Tag". A Tag. */
  tag?: ReactNode;
  /** Figma "Indent" (21 Nov publish): a child row (↳), set in by the indent before its bar and text. */
  indent?: boolean;
  /** Figma Left "Swatch" (21 Nov publish): a 24 square of this colour (a token, e.g. var(--color-background-brand)), for colour roles. */
  swatch?: string;
  /** Figma "Middle" › "↳ Text button". A Button tertiary sm. */
  textButton?: ReactNode;
  /** Figma "Middle" › "Lead" › "↳ Status bar" (20 Nov): a 4-wide rounded bar the height of the text, 12 from it, in a Tag tone. Use it instead of the icon well, not with it. It also sets her 20 Nov hierarchy: overline 16 subtle, title 20 regular ink, description 16 subtle, all in the reading face (meta stays in the subtext face for times and numbers); the right stack centred, its text button flush right over a `Tag variant="line"`. */
  statusBar?: 'neutral' | 'strong' | 'success' | 'info' | 'attention' | 'danger';
  /** Figma "Right" › "↳ Value" + "↳↳ Value text". Number face, 600. */
  value?: ReactNode;
  /** Figma "Right" › "↳ Value label" (20 Nov): a word in the right column ("Open stories"), body face, 500. Value stays for numbers. */
  valueLabel?: ReactNode;
  /** Figma "Right" › "↳ Right tag" (20 Nov): an outlined Tag under the action, right-aligned. */
  rightTag?: ReactNode;
  /** Figma "Right" › "↳ Sub value" + "↳↳ Sub value text". Subtext face. */
  subValue?: ReactNode;
  /** Figma "Right" › "↳ Action button". An ActionChip or Button; same zone as `action`, wins when both are set. */
  actionButton?: ReactNode;
  /** Figma "Right" › "↳ Switch". A Switch. */
  switch?: ReactNode;
  /** Figma "Trailing". The › (or ↗) Trailing part; the whole row is the target, so pass `href` or `onClick`. */
  trailing?: boolean | TrailingIcon;
  /** Figma "Below" › "↳ Progress". A slot (the Progress part). */
  progress?: ReactNode;
  /** Figma "Below" › "↳ Helper text". A HelperText or a short line. */
  helperText?: ReactNode;
  /** Figma "Below" › "↳ Divider". A 1px line under the row's content. */
  divider?: boolean;
  /** Makes the whole row the target (44+ tall): it opens this. */
  href?: string;
  /** Makes the whole row the target: it does this. */
  onClick?: () => void;
  /** Router link component for `href`; defaults to a plain anchor. */
  linkComponent?: ElementType;
  /** The row's element. `li` (default) inside a list, `div` elsewhere. */
  as?: 'li' | 'div';
  /** The status marker, with a word: a StatusPill. */
  status?: ReactNode;
  /** The one thing to do next: a Button, ActionChip or Link. */
  action?: ReactNode;
  /** Sets the title's level when the page needs one. Defaults to plain text. */
  titleAs?: 'span' | 'h2' | 'h3' | 'h4';
  /** Extra classes on the row. */
  className?: string;
  style?: CSSProperties;
}

export interface ListRowGroupProps {
  /** Accessible name of the list. */
  ariaLabel?: string;
  /** Extra classes on the list's frame. */
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * The list a ListRow sits in. It aligns every row's status, text and action
 * into one set of columns, and stacks them when its own width is narrow.
 */
export function ListRowGroup({ ariaLabel, className, style, children }: ListRowGroupProps) {
  return (
    <div className={[styles.frame, className].filter(Boolean).join(' ')} style={style}>
      <ul className={styles.group} aria-label={ariaLabel}>
        {children}
      </ul>
    </div>
  );
}

/**
 * One item in a work list: a status with a word, a title, one line of why and
 * one action. The action brings its own 44px box.
 */
export default function ListRow(props: ListRowProps) {
  const { title, description, status, action, titleAs = 'span', className, style } = props;
  if (isZoned(props)) return <ZonedRow {...props} />;
  const Title: ElementType = titleAs;
  return (
    <li className={[styles.row, className].filter(Boolean).join(' ')} style={style} data-bella-component="list-row">
      {status != null ? <div className={styles.status}>{status}</div> : null}
      <div className={styles.text}>
        <Title className={styles.title}>{title}</Title>
        {description != null ? <p className={styles.description}>{description}</p> : null}
      </div>
      {action != null ? <div className={styles.action}>{action}</div> : null}
    </li>
  );
}

const ZONE_KEYS = [
  'layout', 'selected', 'iconWell', 'pin', 'meta', 'statusDot', 'avatar', 'overline', 'body', 'tag', 'indent', 'swatch', 'textButton',
  'statusBar', 'value', 'valueLabel', 'rightTag', 'subValue', 'actionButton', 'switch', 'trailing', 'progress', 'helperText', 'divider',
  'href', 'onClick', 'as',
] as const;

function isZoned(p: ListRowProps) {
  return ZONE_KEYS.some((k) => p[k] !== undefined);
}

/** The zoned List item (Figma, 18 Nov): Left · Middle · Right · Trailing on
 * one row, Below under the text column. Only the zones passed render. */
function ZonedRow({
  title,
  description,
  action,
  titleAs = 'span',
  layout = 'stacked',
  selected = false,
  iconWell,
  pin,
  meta,
  statusDot,
  avatar,
  overline,
  body,
  tag,
  indent = false,
  swatch,
  textButton,
  statusBar,
  value,
  valueLabel,
  rightTag,
  subValue,
  actionButton,
  switch: switchSlot,
  trailing,
  progress,
  helperText,
  divider = false,
  href,
  onClick,
  linkComponent: LinkComponent = 'a',
  as: Root = 'li',
  className,
  style,
}: ListRowProps) {
  const right = actionButton ?? action;
  const valueKey = useChangeKey(value);
  const hasLeft = iconWell != null || pin != null || statusDot != null || avatar != null || swatch != null;
  const hasRight = value != null || valueLabel != null || subValue != null || right != null || rightTag != null || switchSlot != null;
  const hasBelow = progress != null || helperText != null || divider;
  const interactive = href != null || onClick != null;
  /* The whole row is the target: the title carries the link or button and
   * its ::after stretches over the row, so actions inside stay their own
   * targets (no nested interactive elements). */
  const titleNode = href != null ? (
    <LinkComponent href={href} className={styles.target}>{title}</LinkComponent>
  ) : onClick != null ? (
    <button type="button" onClick={onClick} className={styles.target}>{title}</button>
  ) : (
    title
  );
  /* Status-bar rows carry her 20 Nov hierarchy on their own spans. */
  const bar = statusBar != null;
  const line = (node: ReactNode, cls: string, on = bar) => (on && node != null ? <span className={cls}>{node}</span> : node);
  const cls = [
    styles.zoned,
    styles[layout],
    interactive ? styles.interactive : '',
    selected ? styles.selected : '',
    statusBar != null ? styles.hasBar : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <Root className={cls} style={style} data-bella-component="list-row" data-bella-layout={layout} aria-current={selected ? 'true' : undefined}>
      {hasLeft ? (
        <div className={styles.left}>
          {iconWell}
          {pin}
          {statusDot}
          {avatar}
          {swatch != null ? <span className={styles.swatch} style={{ background: swatch }} aria-hidden="true" /> : null}
        </div>
      ) : null}
      <div className={styles.body}>
        <div className={styles.content}>
          <div className={styles.middle}>
            <div className={styles.lead}>
            {statusBar != null ? <span className={styles.statusBar} data-tone={statusBar} aria-hidden="true" /> : null}
            {indent ? <span className={styles.indent} aria-hidden="true" /> : null}
            <div className={styles.leadText}>
            <TextStack
              className={styles.stack}
              overline={line(overline, styles.barLabel)}
              title={line(
                titleAs === 'span' ? (
                  titleNode
                ) : (
                  /* TextStack's title is inline, so the level rides on role heading */
                  <span role="heading" aria-level={Number(titleAs.slice(1))}>
                    {titleNode}
                  </span>
                ),
                styles.barTitle,
                /* Figma List item Text stack Title: 20 regular ink on every stacked row (21 Nov) */
                bar || layout === 'stacked',
              )}
              subtitle={
                description != null || meta != null ? (
                  <>
                    {description != null ? <span className={styles.description}>{description}</span> : null}
                    {meta != null ? <span className={styles.meta}>{meta}</span> : null}
                  </>
                ) : undefined
              }
              body={body}
            />
            {/* Figma Text frame (21 Nov publish): the Tag and the text button
                sit with the text, so the status bar runs beside all of them */}
            {tag != null ? <div className={styles.tag}>{tag}</div> : null}
            {textButton != null ? <div className={styles.textButton}>{textButton}</div> : null}
            </div>
            </div>
          </div>
          {hasRight ? (
            <div className={styles.right}>
              {value != null ? (
                <span key={valueKey} className={[styles.value, valueKey ? styles.glow : ''].filter(Boolean).join(' ')}>
                  {value}
                </span>
              ) : null}
              {valueLabel != null ? <span className={styles.valueLabel}>{valueLabel}</span> : null}
              {subValue != null ? <span className={styles.subValue}>{subValue}</span> : null}
              {right != null ? <div className={[styles.lift, styles.actionLine].join(' ')}>{right}</div> : null}
              {rightTag != null ? <div className={styles.lift}>{rightTag}</div> : null}
              {switchSlot != null ? <div className={styles.lift}>{switchSlot}</div> : null}
            </div>
          ) : null}
          {trailing ? <Trailing icon={trailing === true ? undefined : trailing} /> : null}
        </div>
        {hasBelow ? (
          <div className={styles.below}>
            {progress != null ? <div className={styles.lift}>{progress}</div> : null}
            {helperText != null ? <div className={styles.helper}>{helperText}</div> : null}
            {divider ? <hr className={styles.divider} /> : null}
          </div>
        ) : null}
      </div>
    </Root>
  );
}
