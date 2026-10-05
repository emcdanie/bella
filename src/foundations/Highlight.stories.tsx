import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import styles from './Highlight.module.css';

/* Highlight (Elleta, 2026-10-05): "I wanted those texts to be the ochre,
 * since technically they change when you hover them." A linked phrase, or
 * the part of a picture it points at, lit on hover, focus or pin. The lit
 * state is the ochre wash (color.semantic.highlight-wash) PLUS a 2px edge
 * (highlight-edge: underline for text, outline for a picture target), and
 * the text stays ink (highlight-text): never colour alone. The audit runs
 * every story in light, dark and warm. */

const meta: Meta = {
  title: 'Foundations/Highlight',
};
export default meta;
type Story = StoryObj;

const STATES = ['rest', 'hover', 'focus', 'pinned'] as const;

/** The four states, side by side: a phrase and its picture target. Hover,
 * focus and pinned look the same on purpose: one lit state. */
export const States: Story = {
  render: () => (
    <div className={styles.row}>
      {STATES.map((s) => (
        <div key={s} className={styles.specimen}>
          <p className={styles.prose}>
            The{' '}
            <span className={`${styles.phrase} ${s === 'rest' ? '' : styles.lit}`} data-state={s}>
              focus ring
            </span>{' '}
            sits 3px outside the plate.
          </p>
          <div className={styles.picture} role="img" aria-label={`Picture target, ${s}`}>
            <div className={`${styles.target} ${s === 'rest' ? '' : styles.lit}`} />
          </div>
          <p className={styles.label}>{s}</p>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const phrases = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-state]'));
    await step('lit = wash + 2px edge, text stays ink; rest has neither', async () => {
      const root = getComputedStyle(document.documentElement);
      const [rest, ...lit] = phrases;
      expect(getComputedStyle(rest).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      for (const p of lit) {
        const cs = getComputedStyle(p);
        expect(cs.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
        expect(cs.textDecorationThickness).toBe(root.getPropertyValue('--border-width-medium').trim());
      }
    });
  },
};

function Live() {
  const [pinned, setPinned] = useState(false);
  const [lit, setLit] = useState(false);
  const on = lit || pinned;
  return (
    <div className={styles.specimen} style={{ maxWidth: '24rem' }}>
      <p className={styles.prose}>
        Hover, focus or pin{' '}
        <button
          type="button"
          className={styles.phrase}
          aria-pressed={pinned}
          onClick={() => setPinned((v) => !v)}
          onMouseEnter={() => setLit(true)}
          onMouseLeave={() => setLit(false)}
          onFocus={() => setLit(true)}
          onBlur={() => setLit(false)}
          style={{ font: 'inherit', border: 0, padding: 0, cursor: 'pointer' }}
        >
          the target
        </button>{' '}
        to light the part of the picture it points at.
      </p>
      <div className={styles.picture} role="img" aria-label={on ? 'Picture, target lit' : 'Picture'}>
        <div className={`${styles.target} ${on ? styles.lit : ''}`} data-testid="target" />
      </div>
    </div>
  );
}

/** Live: the phrase drives the target. Pin toggles with aria-pressed. */
export const Behavior: Story = {
  render: () => <Live />,
  play: async ({ canvas, step }) => {
    const phrase = canvas.getByRole('button', { name: 'the target' });
    const target = canvas.getByTestId('target');
    await step('hover lights the target; leaving clears it', async () => {
      await userEvent.hover(phrase);
      expect(target.className).toMatch(/lit/);
      await userEvent.unhover(phrase);
      expect(target.className).not.toMatch(/lit/);
    });
    await step('pin holds it lit, and says so', async () => {
      await userEvent.click(phrase);
      await userEvent.unhover(phrase);
      phrase.blur();
      expect(phrase).toHaveAttribute('aria-pressed', 'true');
      expect(target.className).toMatch(/lit/);
      await userEvent.click(phrase);
      phrase.blur();
      expect(phrase).toHaveAttribute('aria-pressed', 'false');
    });
  },
};
