import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionTitle } from './TokenSheet';
import Heading from '../components/Heading/Heading';
import Eyebrow from '../components/Eyebrow/Eyebrow';

const meta: Meta = {
  title: 'Foundations/Typography',
};
export default meta;

const specimenText = 'Clean and easy to read';

const meta13: React.CSSProperties = {
  fontFamily: 'var(--typography-font-family-mono)',
  fontSize: 'var(--typography-font-size-mono)',
  letterSpacing: 'var(--typography-letter-spacing-mono)',
  fontFeatureSettings: 'var(--typography-font-feature-mono)',
  color: 'var(--color-semantic-text-secondary)',
};

/* a fixed label column that wraps above the sample at narrow widths */
const row: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  columnGap: 'var(--spacing-6)',
  rowGap: 'var(--spacing-2)',
  alignItems: 'baseline',
  padding: 'var(--spacing-5) 0',
  borderTop: '1px solid var(--color-semantic-border-subtle)',
};

/* The ramp (style unify, 2026-09-22): Geist in three cuts plus Mono, and
 * Unique as the wordmark only. Every sample reads its tokens. */
const ramp: { label: string; sample: React.ReactNode }[] = [
  {
    label: 'Display · 300 · 40 to 76 · -0.035em',
    sample: (
      <Heading tier="page" as="p">
        {specimenText}
      </Heading>
    ),
  },
  {
    label: 'Section h2 · 300 · 32 to 44 · -0.03em',
    sample: (
      <Heading tier="section" as="p">
        {specimenText}
      </Heading>
    ),
  },
  {
    label: 'Title · 500 · 20 · -0.015em',
    sample: (
      <span
        style={{
          fontSize: 'var(--typography-font-size-xl)',
          fontWeight: 'var(--typography-font-weight-medium)',
          letterSpacing: 'var(--typography-letter-spacing-title)',
        }}
      >
        Structure and systems
      </span>
    ),
  },
  {
    label: 'Body · 400 · 17 · -0.01em',
    sample: (
      <span style={{ fontSize: 'var(--typography-font-size-body)', letterSpacing: 'var(--typography-letter-spacing-body)' }}>
        Body copy for long reading. Muted grey for anything secondary.
      </span>
    ),
  },
  {
    label: 'Base · 400 · 16 (the floor)',
    sample: <span style={{ fontSize: 'var(--typography-font-size-base)' }}>Existing consumers stay at 16px.</span>,
  },
  {
    label: 'Meta · Geist Mono 400 · 13 · ss09',
    sample: <span style={meta13}>2024 to 2026 · B2B travel platform</span>,
  },
  {
    label: 'Wordmark · Unique 700 · 24+ only',
    sample: (
      <span
        style={{
          fontFamily: 'var(--typography-font-family-wordmark)',
          fontWeight: 'var(--typography-font-weight-bold)',
          fontSize: 'var(--typography-font-size-2xl)',
          letterSpacing: 'var(--typography-letter-spacing-hero)',
        }}
      >
        BELLA
      </span>
    ),
  },
];

export const Ramp: StoryObj = {
  render: () => (
    <div>
      <Eyebrow>Foundations · type</Eyebrow>
      <SectionTitle>Two weights do the work</SectionTitle>
      <div style={{ borderBottom: '1px solid var(--color-semantic-border-subtle)' }}>
        {ramp.map(({ label, sample }) => (
          <div key={label} style={row}>
            <span style={{ ...meta13, flex: '0 0 34ch', maxWidth: '100%' }}>{label}</span>
            <div style={{ flex: '1 1 20ch', minWidth: 0 }}>{sample}</div>
          </div>
        ))}
      </div>
      <p style={{ maxWidth: '60ch', marginTop: 'var(--spacing-5)', color: 'var(--color-semantic-text-secondary)' }}>
        Geist Light for every heading, Geist 500 for titles, Geist 400 for body, Geist
        Mono for eyebrows and meta labels. Unique is the wordmark and nothing else. All
        faces ship vendored in this Storybook as woff2, the same files consumers load.
      </p>
    </div>
  ),
};

/** The eyebrow: Geist Mono, not tracked caps. */
export const Eyebrows: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', rowGap: 'var(--spacing-8)' }}>
      <div style={{ display: 'grid', rowGap: 'var(--spacing-4)' }}>
        <Eyebrow>02 · Decisions</Eyebrow>
        <Heading tier="section" as="h2">
          Decide once, and let it travel.
        </Heading>
      </div>
      <div style={{ display: 'grid', rowGap: 'var(--spacing-4)' }}>
        <Eyebrow variant="ink">Part B · case study page</Eyebrow>
        <Heading tier="section" as="h2">
          The system is the agreements, not the library.
        </Heading>
      </div>
    </div>
  ),
};

const bodyText =
  'BELLA keeps the work editorial and deliberate. Tokens carry every decision, so a change lands once and every surface that reads it follows. Body copy is Geist at 17px, set for long reading.';

const trackingColumns = [
  { label: 'Before: letter-spacing.normal (0)', tracking: 'var(--typography-letter-spacing-normal)' },
  { label: 'After: letter-spacing.body (-0.01em)', tracking: 'var(--typography-letter-spacing-body)' },
];

/** Body amendment, 2026-09-22. Only Geist body text moves; the title above
 * it keeps letter-spacing.title. */
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
            <p style={{ ...meta13, margin: '0 0 var(--spacing-4)' }}>{label}</p>
            <p
              style={{
                margin: '0 0 var(--spacing-3)',
                fontSize: 'var(--typography-font-size-xl)',
                fontWeight: 'var(--typography-font-weight-medium)',
                lineHeight: 'var(--typography-line-height-snug)',
                letterSpacing: 'var(--typography-letter-spacing-title)',
              }}
            >
              Design systems, made on purpose
            </p>
            <p style={{ margin: 0, maxWidth: '60ch', fontSize: 'var(--typography-font-size-body)', letterSpacing: tracking }}>
              {bodyText}
            </p>
          </div>
        ))}
      </div>
      <p style={{ maxWidth: '60ch', marginTop: 'var(--spacing-5)', color: 'var(--color-semantic-text-secondary)' }}>
        Body only. Titles take letter-spacing.title, headings take the display and h2
        tracking, and Unique (the wordmark) keeps letter-spacing.hero, never negative.
      </p>
    </div>
  ),
};
