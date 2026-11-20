import React, { type ReactNode } from 'react';
import StatusPill from '../StatusPill/StatusPill';
import Icon, { type IconName } from '../Icon/Icon';
import styles from './ChatBubble.module.css';

/* ---------------------------------------------------------------------------
 * Reactions (Figma _Reaction 1455:32658, Reaction bar 1455:33347, Reaction
 * badge 1455:33364, read 21 Nov). Coloured like iMessage (her 19 Nov rule):
 * each reaction its own colour on the bar and on the badge it leaves.
 * ------------------------------------------------------------------------- */

export type ReactionName = 'heart' | 'up' | 'down' | 'haha' | 'bang' | 'question';

const REACTIONS: { name: ReactionName; label: string; icon?: IconName; text?: string }[] = [
  { name: 'heart', label: 'Love', icon: 'Heart' },
  { name: 'up', label: 'Like', icon: 'ThumbsUp' },
  { name: 'down', label: 'Dislike', icon: 'ThumbsDown' },
  { name: 'haha', label: 'Ha ha', icon: 'EmojiTalkingHappy' },
  { name: 'bang', label: 'Emphasise', text: '!!' },
  { name: 'question', label: 'Question', text: '?' },
];

function Glyph({ r, size }: { r: (typeof REACTIONS)[number]; size: 'md' | 'lg' }) {
  return r.icon ? <Icon name={r.icon} size={size} /> : <span className={styles.reactionText}>{r.text}</span>;
}

export interface ReactionBarProps {
  /** The reactions already given (each shows its tone wash). */
  selected?: ReactionName[];
  /** A reaction picked or taken back. */
  onReact?: (name: ReactionName) => void;
  /** Names the bar ("React to BELLA's answer"). */
  label?: string;
  className?: string;
}

/** The six reactions in a pill, 44 targets: pick one to react; a picked one shows its wash and aria-pressed. */
export function ReactionBar({ selected = [], onReact, label = 'React', className }: ReactionBarProps) {
  return (
    <div className={[styles.reactionBar, className].filter(Boolean).join(' ')} role="group" aria-label={label} data-bella-component="reaction-bar">
      {REACTIONS.map((r) => (
        <button
          key={r.name}
          type="button"
          className={styles.reaction}
          data-reaction={r.name}
          aria-pressed={selected.includes(r.name)}
          aria-label={r.label}
          onClick={() => onReact?.(r.name)}
        >
          <Glyph r={r} size="lg" />
        </button>
      ))}
    </div>
  );
}

/** The badge a reaction leaves on a bubble: its glyphs in their colours, and a count over one each. */
function ReactionBadge({ reactions, count, side }: { reactions: ReactionName[]; count?: number; side: 'sent' | 'received' }) {
  const shown = REACTIONS.filter((r) => reactions.includes(r.name));
  const words = shown.map((r) => r.label).join(', ');
  return (
    <span className={[styles.reactionBadge, side === 'sent' ? styles.badgeSent : styles.badgeReceived].join(' ')} role="img" aria-label={`Reactions: ${words}${count && count > shown.length ? `, ${count} in all` : ''}`}>
      {shown.map((r) => (
        <span key={r.name} className={styles.badgeGlyph} data-reaction={r.name} aria-hidden="true">
          <Glyph r={r} size="md" />
        </span>
      ))}
      {count && count > shown.length ? <span className={styles.badgeCount} aria-hidden="true">{count}</span> : null}
      <span className={styles.burst} aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={styles.spark} style={{ '--i': i } as React.CSSProperties} />
        ))}
      </span>
    </span>
  );
}

export interface ChatBubbleProps {
  /** Which side the bubble sits on. Sent = right, received = left. */
  side: 'sent' | 'received';
  /** Figma "Show tail": the iMessage tail at the bottom corner on the speaker's side (bottom-right sent, bottom-left received). True on the last bubble in a run. */
  tail?: boolean;
  /**
   * text: normal; ask: a question waiting on the reader, headed by an
   * attention StatusPill; draft: an unsent reply, a dashed outline on the
   * surface with a quiet label (ask and draft per BellaComponents, 11 Nov
   * 2026); big-emoji: oversized, transparent fill; image: constrained image slot.
   */
  kind?: 'text' | 'ask' | 'draft' | 'big-emoji' | 'image';
  /** The words heading an ask or draft bubble. Defaults: "Waiting on you" (ask), "Draft" (draft). */
  kindLabel?: string;
  /** Tapback emoji, rendered above the bubble corner (older; prefer reactions). */
  tapback?: string;
  /** The reactions on this message, as the coloured Reaction badge on its corner. It pops on with a small burst. */
  reactions?: ReactionName[];
  /** How many reactions in all, when more people reacted than glyphs shown. */
  reactionCount?: number;
  /** Children: the bubble's content. */
  children: ReactNode;
  /** Action chips rendered below the text, inside the bubble. */
  actions?: ReactNode;
  /** For big-emoji kind: describe the emoji for assistive tech. */
  emojiLabel?: string;
  /** Colour disc (24px) pinned to the bottom-left of a received bubble. Aria-hidden. Shows speaker identity in a multi-lane thread. */
  disc?: string;
  /** Speaker name label displayed above the first bubble of a received run. Uses BELLA's label size. */
  senderName?: string;
  /** Extra classes on the root row. */
  className?: string;
}

/**
 * A single message bubble. Geometry and motion values from the-bar-source.html;
 * every value resolves through a BELLA token. See component-contract:chat-bubble.
 */
export default function ChatBubble({
  side,
  tail = false,
  kind = 'text',
  tapback,
  reactions,
  reactionCount,
  children,
  actions,
  emojiLabel,
  disc,
  senderName,
  kindLabel,
  className,
}: ChatBubbleProps) {
  const isSent = side === 'sent';
  const isBig = kind === 'big-emoji';
  const isImage = kind === 'image';
  const isAsk = kind === 'ask';
  const isDraft = kind === 'draft';

  const bubbleCls = [
    styles.bubble,
    isSent ? styles.sent : styles.received,
    tail ? (isSent ? styles.tailSent : styles.tailReceived) : '',
    isBig ? styles.bigEmoji : '',
    isImage ? styles.image : '',
    isDraft ? styles.draft : '',
  ]
    .filter(Boolean)
    .join(' ');

  const hasDisc = !isSent && !!disc;

  return (
    <div
      className={[
        styles.row,
        isSent ? styles.rowSent : styles.rowReceived,
        hasDisc ? styles.rowReceivedWithDisc : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-bella-component="chat-bubble"
      data-bella-reveal=""
    >
      {senderName && !isSent && (
        <span className={styles.senderName}>{senderName}</span>
      )}
      <div
        className={bubbleCls}
        role={isBig && emojiLabel ? 'img' : undefined}
        aria-label={isBig && emojiLabel ? emojiLabel : undefined}
      >
        {isAsk ? (
          <span className={styles.kindHead}>
            <StatusPill variant="attention">{kindLabel ?? 'Waiting on you'}</StatusPill>
          </span>
        ) : null}
        {isDraft ? <span className={styles.draftLabel}>{kindLabel ?? 'Draft'}</span> : null}
        {isBig ? <span aria-hidden="true">{children}</span> : children}
        {actions && <div className={styles.actions}>{actions}</div>}
        {reactions && reactions.length > 0 ? <ReactionBadge reactions={reactions} count={reactionCount} side={side} /> : null}
        {tapback && (
          <span className={[styles.tapback, isSent ? styles.tapbackSent : styles.tapbackReceived].join(' ')} aria-hidden="true">
            {tapback}
            {/* the small burst as the reaction lands (iMessage, 19 Nov): six dots fly out once */}
            <span className={styles.burst}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={styles.spark} style={{ '--i': i } as React.CSSProperties} />
              ))}
            </span>
          </span>
        )}
      </div>
      {hasDisc && (
        <span
          className={styles.disc}
          style={{ background: disc }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
