import React, { type ReactNode } from 'react';
import Slide from '../Slide/Slide';
import Eyebrow from '../Eyebrow/Eyebrow';
import Heading from '../Heading/Heading';
import styles from './TitleSlide.module.css';

export interface TitleSlideProps {
  /** The slide's name for a reader. Defaults to the title when it is plain text. */
  label?: string;
  /** The label above the title ("CHIP for BELLA"). */
  eyebrow?: ReactNode;
  /** The title, the one big line. */
  title: ReactNode;
  /** One sentence under the title. */
  lead?: ReactNode;
  /** A foot line: who, where, the date. Muted. */
  footer?: ReactNode;
  className?: string;
}

/**
 * Title slide (deck plan, 23 Nov 2026): the first or the last slide. Eyebrow, the hero title (82),
 * one lead sentence, and a foot line, centred on a Slide. Composes Eyebrow, Heading and Slide only.
 */
export default function TitleSlide({ label, eyebrow, title, lead, footer, className }: TitleSlideProps) {
  return (
    <Slide label={label ?? (typeof title === 'string' ? title : 'Title slide')} centered className={className}>
      {eyebrow ? <Eyebrow variant="ink">{eyebrow}</Eyebrow> : null}
      <Heading tier="hero" as="h2">{title}</Heading>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
      {footer ? <p className={styles.footer}>{footer}</p> : null}
    </Slide>
  );
}
