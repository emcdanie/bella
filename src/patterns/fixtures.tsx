import React from 'react';
import ScaledFrame from '../components/ScaledFrame/ScaledFrame';
import Tag from '../components/Tag/Tag';
import StatusPill from '../components/StatusPill/StatusPill';
import type { CaseGridItem } from './CaseGrid/CaseGrid';
import type { FeaturedCaseProps } from './FeaturedCase/FeaturedCase';
import type { BeforeAfterState } from './BeforeAfterFrame/BeforeAfterFrame';

/* Story fixtures for the Work patterns. Copy is lifted from the site repo's
 * content (content/case-studies, lib/workLibrary.ts, lib/copy.ts, Hero),
 * read-only, 2026-09-21. Images live in .storybook/public/work and are
 * referenced relative, so the published Storybook (a subpath) resolves them.
 * Every raster is at least 2x the width it renders at on a 1440 page. */

/** A live BELLA specimen for the cover slot: real components, real tokens,
 * no interactives (it sits inside a card link). Flips with [data-theme]. */
export function LiveSpecimen() {
  const swatch = (token: string) => (
    <span
      key={token}
      style={{
        display: 'block',
        height: 'var(--spacing-20)',
        borderRadius: 'var(--radius-lg)',
        background: `var(${token})`,
        border: '1px solid var(--color-semantic-border-faint)',
      }}
    />
  );
  return (
    <div
      style={{
        height: '100%',
        boxSizing: 'border-box',
        padding: 'var(--spacing-20)',
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr',
        rowGap: 'var(--spacing-10)',
        /* the page ground, so the specimen reads as a cover, not as body */
        background: 'var(--color-semantic-background)',
        color: 'var(--color-semantic-text-primary)',
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
        <StatusPill variant="accent">On system</StatusPill>
        <StatusPill variant="success">Gate green</StatusPill>
        <StatusPill variant="info">Synced</StatusPill>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--typography-font-size-6xl)',
          fontWeight: 'var(--typography-font-weight-bold)',
          lineHeight: 'var(--typography-line-height-tight)',
        }}
      >
        Tokens, components, governance.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--spacing-4)', alignContent: 'end' }}>
        {[
          '--color-semantic-background',
          '--color-semantic-surface-card',
          '--color-semantic-surface-inset',
          '--color-semantic-accent',
          '--color-semantic-text-primary',
        ].map(swatch)}
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
          {['color.semantic', 'spacing', 'radius.card', 'motion.lift'].map((t) => (
            <Tag key={t} variant="accent">{t}</Tag>
          ))}
        </div>
      </div>
    </div>
  );
}

export const liveCover = (
  <ScaledFrame title="BELLA specimen: status pills, a type sample, the semantic swatches">
    <LiveSpecimen />
  </ScaledFrame>
);

export const img = (src: string, width: number, height: number) => (
  <img src={src} alt="" width={width} height={height} loading="lazy" />
);

/* ── Work page content ─────────────────────────────────────────────── */

export const intro = {
  label: 'Work',
  statement: 'AI-enabled design',
  accent: 'systems',
  after: '.',
  practice:
    'Tokens, components, and the governance that keeps them from drifting. I read code and work with engineers directly.',
  proof: [
    { figure: '5+', label: 'booking verticals on one token set' },
    { figure: 'From zero', label: 'a first design system, to production' },
    { figure: 'Parity', label: 'Figma and Storybook, one source' },
  ],
};

/** B2B travel: the decision-support case (site: content/case-studies/
 * _archive/filters-decision-support-system.ts). */
export const featured: FeaturedCaseProps = {
  kicker: 'UX Strategy · 2024-25',
  title: 'Travel Booking',
  impact:
    'Search, filtering and results as one decision flow for a multi-vertical B2B travel platform, with policy visible on every result.',
  tags: ['Interaction Design', 'Search UX', 'Cognitive UX', 'B2B Travel'],
  href: '#case-studies/filters-decision-support-system',
  cover: img('work/travel-cover.png', 2560, 1600),
};

export const grid: CaseGridItem[] = [
  {
    kicker: 'Design Systems · 2024-25',
    title: 'Code First',
    impact: 'Figma ⇄ Storybook parity; tokens aligned across the stack',
    tags: ['Design Systems', 'Design Tokens', 'Component Libraries', 'Accessibility'],
    href: '#case-studies/brad-frost',
    cover: img('work/code-first-cover.png', 1760, 1040),
  },
  {
    kicker: 'Complex SaaS · 2024-26',
    title: 'From Drift to Foundation',
    impact: 'First design system from zero; tokens wired to production across 5+ verticals',
    tags: ['Design Systems', 'Design Tokens', 'Accessibility', 'Design System Governance'],
    href: '#case-studies/design-system-transformation',
    cover: <img src="work/drift-cover.svg" alt="" width={800} height={500} />,
  },
  {
    kicker: 'AI + Design Systems · 2026',
    title: 'CHIP',
    impact:
      'The agent watches, catches drift, drafts, and waits for approval; my own systems scored in public',
    tags: ['AI-enabled Design', 'Design System Governance', 'Design Systems', 'Accessibility'],
    href: '#case-studies/chip',
    cover: img('work/chip-cover.png', 2000, 1250),
  },
];

/** The filters pattern study: the recreated before and after screens
 * (site: public/demos/case-study-visuals, captured at 2x). */
export const filterStudy: BeforeAfterState[] = [
  {
    id: 'before',
    label: 'Before',
    src: 'work/filters-before.png',
    alt: 'Flight results with nine filter groups stacked in the left rail, each styled differently, beside four result rows.',
    width: 2560,
    height: 1600,
    markers: [
      { x: 1.5, y: 20, note: 'Price range is two raw inputs: no visible range, no feedback on what it excludes.' },
      { x: 17, y: 32, note: 'Departure time uses rounded chips with emoji icons.' },
      { x: 20, y: 46, note: 'Return time solves the same job with square chips and a different selected state.' },
      { x: 12, y: 60, note: 'Stops adds a third selected style: solid black.' },
      { x: 98.5, y: 13, note: 'Nothing says how many filters are active or what they removed.' },
    ],
  },
  {
    id: 'after',
    label: 'After',
    src: 'work/filters-after.png',
    alt: 'Discover Flights with a filter rail that shows three filters applied, a price range read-out, one chip style and checkboxes, beside a result count and cards.',
    width: 2560,
    height: 1600,
    markers: [
      { x: 13, y: 22, note: 'Active filter count, always visible: 3 filters applied.' },
      { x: 12, y: 44, note: 'The range reads back in words, so the constraint is legible.' },
      { x: 23, y: 55, note: 'One chip style for every single-choice filter.' },
      { x: 4.5, y: 80, note: 'Multi-select becomes checkboxes: the control says what it does.' },
      { x: 32, y: 19, note: 'A live result count answers what the filters left.' },
    ],
  },
];

export const filterCaption =
  'Recreated concept, not the production UI. The filters study: equal-weight controls before, one decision flow after.';
