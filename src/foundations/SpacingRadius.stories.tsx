import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { leavesUnder, primitive, SectionTitle } from './TokenSheet';

const meta: Meta = {
  title: 'Foundations/Spacing & Radius',
};
export default meta;

export const Spacing: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Spacing scale</SectionTitle>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-2)',
          background: 'var(--color-semantic-surface)',
          border: '1px solid var(--color-semantic-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-5)',
        }}
      >
        {leavesUnder(primitive, 'spacing').map((leaf) => (
          <div key={leaf.path} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <span style={{ width: 220, fontSize: 'var(--typography-font-size-tag)', color: 'var(--color-semantic-text-secondary)' }}>
              {leaf.path}
            </span>
            <div style={{ width: leaf.value, height: 16, background: 'var(--color-semantic-accent)', borderRadius: 'var(--radius-sm)' }} />
            <span style={{ fontSize: 'var(--typography-font-size-tag)', color: 'var(--color-semantic-text-secondary)' }}>{leaf.value}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Radius: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Radius</SectionTitle>
      <div style={{ display: 'flex', gap: 'var(--spacing-5)', flexWrap: 'wrap' }}>
        {leavesUnder(primitive, 'radius').map((leaf) => (
          <div key={leaf.path} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 96,
                height: 96,
                background: 'var(--color-semantic-surface)',
                border: '1px solid var(--color-semantic-border)',
                borderRadius: `var(${leaf.cssVar})`,
              }}
            />
            <div style={{ fontSize: 'var(--typography-font-size-tag)', marginTop: 'var(--spacing-2)', color: 'var(--color-semantic-text-secondary)' }}>
              {leaf.path.replace('radius.', '')} · {leaf.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};
