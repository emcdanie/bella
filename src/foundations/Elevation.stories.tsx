import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionTitle } from './TokenSheet';

const meta: Meta = {
  title: 'Foundations/Elevation',
};
export default meta;

/* the Figma effect styles (tokens/figma/shadow.json), in Figma's order */
const chips = ['sm', 'md', 'lg', 'hover', 'soft', 'card-rest', 'card-ink', 'ui-ink', 'key-resting', 'key-pressed', 'card-rest-dark', 'card-ink-dark', 'ui-ink-dark'];

function Chip({ name }: { name: string }) {
  return (
    <div
      style={{
        background: 'var(--color-background-surface)',
        borderRadius: 'var(--border-radius-12)',
        padding: 'var(--spacing-24) var(--spacing-16)',
        textAlign: 'center',
        fontSize: 'var(--typography-label-default-font-size)',
        letterSpacing: 'var(--typography-letter-spacing-0)',
        color: 'var(--color-content-body)',
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--spacing-20)' }}>
        {chips.map((n) => (
          <Chip key={n} name={n} />
        ))}
      </div>
    </div>
  ),
};
