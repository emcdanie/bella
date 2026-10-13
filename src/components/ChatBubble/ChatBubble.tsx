import React, { type ReactNode } from 'react';
import styles from './ChatBubble.module.css';

export interface ChatBubbleProps {
  /** Which side the bubble sits on. Sent = right, received = left. */
  side: 'sent' | 'received';
  /** Round the tail corner (bottom-right for sent, bottom-left for received). True on the last bubble in a run. */
  tail?: boolean;
  /** text: normal; ask: question-style (same visual, different semantics); big-emoji: oversized, transparent fill; image: constrained image slot. */
  kind?: 'text' | 'ask' | 'big-emoji' | 'image';
  /** Tapback emoji, rendered above the bubble corner. */
  tapback?: string;
  /** Children: the bubble's content. */
  children: ReactNode;
  /** Action chips rendered below the text, inside the bubble. */
  actions?: ReactNode;
  /** For big-emoji kind: describe the emoji for assistive tech. */
  emojiLabel?: string;
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
  children,
  actions,
  emojiLabel,
  className,
}: ChatBubbleProps) {
  const isSent = side === 'sent';
  const isBig = kind === 'big-emoji';

  const bubbleCls = [
    styles.bubble,
    isSent ? styles.sent : styles.received,
    tail ? (isSent ? styles.tailSent : styles.tailReceived) : '',
    isBig ? styles.bigEmoji : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={[styles.row, isSent ? styles.rowSent : styles.rowReceived, className]
        .filter(Boolean)
        .join(' ')}
      data-bella-component="chat-bubble"
    >
      <div
        className={bubbleCls}
        role={isBig && emojiLabel ? 'img' : undefined}
        aria-label={isBig && emojiLabel ? emojiLabel : undefined}
      >
        {isBig ? <span aria-hidden="true">{children}</span> : children}
        {actions && <div className={styles.actions}>{actions}</div>}
        {tapback && (
          <span className={[styles.tapback, isSent ? styles.tapbackSent : styles.tapbackReceived].join(' ')} aria-hidden="true">
            {tapback}
          </span>
        )}
      </div>
    </div>
  );
}
