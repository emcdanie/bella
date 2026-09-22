import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { leavesUnder, primitive, SectionTitle, TokenTable } from './TokenSheet';
import Eyebrow from '../components/Eyebrow/Eyebrow';
import Button from '../components/Button/Button';
import { usePlayOnce } from '../patterns/Diagrams/usePlayOnce';
import styles from './Motion.module.css';

const meta: Meta = {
  title: 'Foundations/Motion',
};
export default meta;

const note: React.CSSProperties = { maxWidth: '60ch', color: 'var(--color-semantic-text-secondary)' };

function Specimens() {
  const { ref, armed, playing, run, replay } = usePlayOnce<HTMLDivElement>();
  const cls = [styles.specimens, armed ? styles.armed : '', playing ? styles.play : ''].filter(Boolean).join(' ');
  return (
    <div style={{ display: 'grid', rowGap: 'var(--spacing-4)' }}>
      <div ref={ref} key={run} className={cls} data-bella-reveal>
        <div className={styles.specimen}>
          <div className={styles.stage}>
            <span className={styles.line} />
          </div>
          <p className={styles.label}>draw · 900ms · easing.draw</p>
        </div>
        <div className={styles.specimen}>
          <div className={styles.stage}>
            <span className={`${styles.chip} ${styles.c1} ${styles.pop}`} />
          </div>
          <p className={styles.label}>pop · 450ms · easing.pop</p>
        </div>
        <div className={styles.specimen}>
          <div className={`${styles.stage} ${styles.stagger}`}>
            <span className={`${styles.chip} ${styles.c1}`} />
            <span className={`${styles.chip} ${styles.c2}`} />
            <span className={`${styles.chip} ${styles.c3}`} />
          </div>
          <p className={styles.label}>stagger · 120 to 200ms</p>
        </div>
      </div>
      <div>
        <Button variant="secondary" shape="pill" onClick={replay} ariaLabel="Replay the motion specimens">
          Replay
        </Button>
      </div>
    </div>
  );
}

/** Diagram motion (style unify, 2026-09-22): draw, pop, stagger. Plays once
 * when in view, then holds; reduced motion shows the finished frame. */
export const Diagram: StoryObj = {
  render: () => (
    <div>
      <Eyebrow>Foundations · motion</Eyebrow>
      <SectionTitle>Drawn once, then still</SectionTitle>
      <p style={note}>
        Motion lives in diagrams only. Lines draw, elements pop, steps stagger, and
        then everything holds. It plays once when it scrolls into view. Under reduced
        motion you see the finished frame. The pop overshoot is for these reveals
        only, never hover or state changes.
      </p>
      <Specimens />
      <SectionTitle>Tokens</SectionTitle>
      <TokenTable
        label="Motion tokens"
        leaves={[
          ...leavesUnder(primitive, 'motion.duration'),
          ...leavesUnder(primitive, 'motion.easing'),
          ...leavesUnder(primitive, 'motion.stagger'),
        ]}
      />
    </div>
  ),
};
