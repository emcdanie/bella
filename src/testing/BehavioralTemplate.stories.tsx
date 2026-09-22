import React, { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  expectAriaStates,
  expectKeyboardOperable,
  expectTouchTarget,
  expectVisibleFocus,
} from './behavioral';

/* The behavioral template, proven live. This is NOT a BELLA component — it is
 * a minimal token-styled control that exercises the full test pipeline
 * (interactions + a11y + both-theme snapshots + theme integrity) end to end,
 * so Phase 3 components inherit a known-green harness. Copy this file's shape
 * for every component: one Behavior story running keyboard / focus / states,
 * one story per visual variant. */

function TemplateControl() {
  const count = useRef(0);
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => {
        count.current += 1;
        setPressed((p) => !p);
      }}
      data-activations={count.current}
      style={{
        minHeight: 'var(--spacing-touch-target)',
        padding: 'var(--spacing-3) var(--spacing-5)',
        /* semantic accent pair: the component-button-primary-background /
           -border / -border-radius vars this used were renamed by the keycap
           Button (d8aa3a8) and resolved to nothing (fixed 2026-09-22) */
        background: 'var(--color-semantic-accent)',
        color: 'var(--color-semantic-text-on-accent)',
        border: '1px solid var(--color-semantic-accent)',
        borderRadius: 'var(--radius-lg)',
        fontFamily: 'var(--typography-font-family-body)',
        fontSize: 'var(--typography-font-size-tag)',
        fontWeight: 700,
        letterSpacing: 'var(--typography-letter-spacing-wide)',
        textTransform: 'uppercase',
        cursor: 'pointer',
      }}
    >
      {pressed ? 'Pressed' : 'Press me'}
    </button>
  );
}

const meta: Meta<typeof TemplateControl> = {
  title: 'Testing/Behavioral Template',
  component: TemplateControl,
};
export default meta;

type Story = StoryObj<typeof TemplateControl>;

export const Behavior: Story = {
  play: async ({ canvas, step }) => {
    const button = canvas.getByRole('button');

    await step('touch target ≥ 44px', async () => {
      expectTouchTarget(button);
    });

    await step('keyboard: Tab reaches, Enter/Space activate', async () => {
      await expectKeyboardOperable(button, () =>
        Number(button.getAttribute('data-activations') ?? 0)
      );
    });

    await step('focus: visible indicator', async () => {
      await expectVisibleFocus(button);
    });

    await step('states: aria-pressed reflects state', async () => {
      expectAriaStates(button, {
        pressed: button.getAttribute('aria-pressed') === 'true',
      });
    });
  },
};
