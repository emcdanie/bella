import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionTitle } from './TokenSheet';

const meta: Meta = {
  title: 'Foundations/Elevation',
};
export default meta;

const chips = [
  'soft', 'layered', 'card-default', 'card-elevated', 'sm', 'md', 'lg', 'hover',
];
const lock = ['orb', 'orb-raised', 'orb-selected', 'nav-bar', 'key-resting', 'key-hover', 'key-pressed'];

function Chip({ name }: { name: string }) {
  return (
    <div
      style={{
        background: 'var(--color-semantic-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-6) var(--spacing-4)',
        textAlign: 'center',
        fontSize: 'var(--typography-font-size-tag)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--typography-letter-spacing-wide)',
        color: 'var(--color-semantic-text-secondary)',
        boxShadow: `var(--shadow-${name})`,
      }}
    >
      shadow.{name}
    </div>
  );
}

export const Shadows: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Shadow specimens</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--spacing-5)' }}>
        {chips.map((n) => (
          <Chip key={n} name={n} />
        ))}
      </div>
      <SectionTitle>The elevation lock (orb / keycap / nav)</SectionTitle>
      <p style={{ maxWidth: '60ch', color: 'var(--color-semantic-text-secondary)' }}>
        Token lock 2026-07-17: one light source, upper-left. The depth IS the
        system, do not flatten.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--spacing-5)', marginTop: 'var(--spacing-5)' }}>
        {lock.map((n) => (
          <Chip key={n} name={n} />
        ))}
      </div>
    </div>
  ),
};
