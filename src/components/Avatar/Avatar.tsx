import React, { type CSSProperties } from 'react';
import styles from './Avatar.module.css';

export interface AvatarProps {
  /** Image source. Without one the initials of `name` render instead. */
  src?: string;
  /**
   * Alternative text for the image. Leave it unset for the common case,
   * where the avatar sits beside the person's written name and repeating
   * it would announce twice; the image is then decorative and `name` still
   * supplies the initials fallback.
   */
  alt?: string;
  /**
   * Who this is. Required: it produces the initials when there is no image,
   * and names the fallback for assistive tech. An avatar without a name is
   * an empty disc, which is a bug, not a state.
   */
  name: string;
  /** Step from the avatar ramp: sm 32, md 48, lg 80. */
  size?: 'sm' | 'md' | 'lg';
  /** Accent ring, separated from the disc by a gap of ground. A rest state, never a hover one. */
  ring?: boolean;
  /** Extra classes on the root. */
  className?: string;
  style?: CSSProperties;
}

/** First letters of the first two words, so "Elleta McDaniel" reads EM. */
const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();

/**
 * A person or entity as a circle. An image when there is one, the initials
 * of the name when there is not, never an empty grey disc.
 */
export default function Avatar({
  src,
  alt,
  name,
  size = 'md',
  ring = false,
  className,
  style,
}: AvatarProps) {
  const cls = [styles.avatar, styles[size], ring ? styles.ring : '', className]
    .filter(Boolean)
    .join(' ');

  /* With an image the img element carries the accessible name (or is
     decorative when alt is empty). Without one the root becomes the image:
     it is labelled with the full name and the initials are hidden, so it
     announces once, as the person, never as two stray letters. */
  return (
    <span
      className={cls}
      style={style}
      data-bella-component="avatar"
      role={src ? undefined : 'img'}
      aria-label={src ? undefined : name}
    >
      {src ? (
        <img className={styles.image} src={src} alt={alt ?? ''} />
      ) : (
        <span aria-hidden="true">{initialsOf(name)}</span>
      )}
    </span>
  );
}
