import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionTitle } from './TokenSheet';

const meta: Meta = {
  title: 'Foundations/Typography',
};
export default meta;

const ramp = [
  { token: '5xl', label: 'Display, 56px' },
  { token: '4xl', label: 'Heading-1, 40px' },
  { token: '3xl', label: 'Heading-2, 32px (section floor)' },
  { token: '2xl', label: 'Heading-3, 24px (Unique display floor)' },
  { token: 'xl', label: 'Card title, 20px / 700' },
  { token: 'lg', label: 'Lead, 18px' },
  { token: 'base', label: 'Body, 16px (floor)' },
  { token: 'sm', label: 'Eyebrow / caption, 14px' },
  { token: 'tag', label: 'Tag, 13px (hard floor)' },
];

export const Ramp: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>The ramp</SectionTitle>
      <div
        style={{
          background: 'var(--color-semantic-surface)',
          border: '1px solid var(--color-semantic-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-6)',
        }}
      >
        {ramp.map(({ token, label }) => (
          <div
            key={token}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              gap: 'var(--spacing-5)',
              padding: 'var(--spacing-3) 0',
              borderBottom: '1px solid var(--color-semantic-border-subtle)',
            }}
          >
            <span
              style={{
                width: 220,
                flexShrink: 0,
                fontSize: 'var(--typography-font-size-tag)',
                color: 'var(--color-semantic-text-secondary)',
                letterSpacing: 'var(--typography-letter-spacing-wide)',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontSize: `var(--typography-font-size-${token})`,
                fontWeight: ['5xl', '4xl', '3xl', '2xl', 'xl'].includes(token) ? 700 : 400,
                letterSpacing: ['5xl', '4xl', '3xl', '2xl', 'xl'].includes(token)
                  ? 'var(--typography-letter-spacing-normal)'
                  : undefined,
                lineHeight: 'var(--typography-line-height-snug)',
              }}
            >
              Design systems, made on purpose
            </span>
          </div>
        ))}
      </div>
      <p style={{ maxWidth: '60ch', marginTop: 'var(--spacing-5)', color: 'var(--color-semantic-text-secondary)' }}>
        Two faces, locked: Unique (700, display only, never below 24px) and Geist
        (everything else). This preview renders the ramp in the body face. Unique
        and Geist ship vendored in this Storybook as woff2, the same files
        consumers load.
      </p>
    </div>
  ),
};

export const Eyebrow: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Eyebrow treatment</SectionTitle>
      <div
        style={{
          fontSize: 'var(--typography-font-size-sm)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 'var(--typography-letter-spacing-wider)',
          color: 'var(--color-semantic-text-secondary)',
        }}
      >
        Caps and tracking, not a third face
      </div>
    </div>
  ),
};

const specimen = {
  title: 'Design systems, made on purpose',
  body:
    'BELLA keeps the work editorial and deliberate. Tokens carry every decision, so a change lands once and every surface that reads it follows. The body face is Geist at 16px, set for long reading.',
};

const trackingColumns = [
  { label: 'Before: letter-spacing.normal (0)', tracking: 'var(--typography-letter-spacing-normal)' },
  { label: 'After: letter-spacing.body (-0.01em)', tracking: 'var(--typography-letter-spacing-body)' },
];

/** Body amendment, 2026-09-22. Only Geist body text moves; the Geist title
 * above it and every Unique heading keep their tracking. */
export const BodyTrackingBeforeAfter: StoryObj = {
  name: 'Body tracking, before / after',
  render: () => (
    <div>
      <SectionTitle>Body tracking, before and after</SectionTitle>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 32ch), 1fr))',
          gap: 'var(--spacing-5)',
        }}
      >
        {trackingColumns.map(({ label, tracking }) => (
          <div
            key={label}
            style={{
              background: 'var(--color-semantic-surface-card)',
              border: '1px solid var(--color-semantic-border-faint)',
              borderRadius: 'var(--radius-card)',
              padding: 'var(--spacing-6)',
            }}
          >
            <p
              style={{
                margin: '0 0 var(--spacing-4)',
                fontSize: 'var(--typography-font-size-tag)',
                color: 'var(--color-semantic-text-secondary)',
                letterSpacing: 'var(--typography-letter-spacing-wide)',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </p>
            <p
              style={{
                margin: '0 0 var(--spacing-3)',
                fontSize: 'var(--typography-font-size-xl)',
                fontWeight: 700,
                lineHeight: 'var(--typography-line-height-snug)',
                letterSpacing: 'var(--typography-letter-spacing-normal)',
              }}
            >
              {specimen.title}
            </p>
            <p style={{ margin: 0, maxWidth: '60ch', letterSpacing: tracking }}>{specimen.body}</p>
          </div>
        ))}
      </div>
      <p style={{ maxWidth: '60ch', marginTop: 'var(--spacing-5)', color: 'var(--color-semantic-text-secondary)' }}>
        Body only. The 20px card title stays at zero, Unique keeps letter-spacing.hero
        (0.04em, never negative), and the 32px section and 20px card-title floors are
        unchanged. Sizes stay on the ramp.
      </p>
    </div>
  ),
};
