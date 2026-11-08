import React from 'react';
import Avatar, { type AvatarProps } from '../Avatar/Avatar';
import styles from './AvatarStack.module.css';

export interface AvatarStackMember {
  name: string;
  src?: string;
  /** CSS colour value for the lane or role colour. Applied as background when no image. */
  laneColor?: string;
  /** CSS colour value for the ring. Overrides --component-avatar-default-ring-color when set. */
  ringColor?: string;
  /** When false, the disc shows the lane colour with no initials (Option A). Default true. */
  showInitials?: boolean;
}

export interface AvatarStackProps {
  /** The members to show, left-to-right. Each slides -8px under the previous. */
  members: AvatarStackMember[];
  /** Avatar size step. */
  size?: AvatarProps['size'];
  /** Background colour of the surface the stack sits on. Used for the separating ring. Defaults to --color-semantic-surface. */
  surfaceColor?: string;
  /** Max members to render before showing a +N overflow disc. */
  max?: number;
  className?: string;
}

/**
 * Overlapping Avatars with a separating ring in the column surface colour.
 * Extends Avatar; see component-contract:avatar-stack.
 */
export default function AvatarStack({
  members,
  size = 'sm',
  surfaceColor,
  max,
  className,
}: AvatarStackProps) {
  const shown = max ? members.slice(0, max) : members;
  const overflow = max && members.length > max ? members.length - max : 0;

  const ringStyle = surfaceColor ? ({ '--avatar-stack-ring': surfaceColor } as React.CSSProperties) : undefined;

  return (
    <span
      className={[styles.stack, className].filter(Boolean).join(' ')}
      style={ringStyle}
      role="group"
      aria-label={members.map((m) => m.name).join(', ')}
      data-bella-component="avatar-stack"
    >
      {shown.map((m) => {
        const memberStyle: React.CSSProperties = {};
        if (m.laneColor) memberStyle.background = m.laneColor;
        if (m.ringColor) (memberStyle as Record<string, string>)['--component-avatar-default-ring-color'] = m.ringColor;
        return (
          <Avatar
            key={m.name}
            name={m.name}
            src={m.src}
            size={size}
            ring={!!m.ringColor}
            showInitials={m.showInitials}
            className={[styles.item, m.ringColor ? styles.itemRinged : ''].filter(Boolean).join(' ')}
            style={Object.keys(memberStyle).length ? memberStyle : undefined}
          />
        );
      })}
      {overflow > 0 && (
        <span className={[styles.item, styles.overflow].join(' ')} data-size={size} aria-label={`and ${overflow} more`}>
          +{overflow}
        </span>
      )}
    </span>
  );
}
