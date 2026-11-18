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
          gap: 'var(--spacing-8)',
          background: 'var(--color-background-surface)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--border-radius-12)',
          padding: 'var(--spacing-20)',
        }}
      >
        {leavesUnder(primitive, 'spacing').map((leaf) => (
          <div key={leaf.path} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-16)' }}>
            <span style={{ width: 220, fontSize: 'var(--typography-label-default-font-size)', color: 'var(--color-content-body)' }}>
              {leaf.path}
            </span>
            <div style={{ width: leaf.value, height: 16, background: 'var(--color-background-accent-1)', borderRadius: 'var(--border-radius-4)' }} />
            <span style={{ fontSize: 'var(--typography-label-default-font-size)', color: 'var(--color-content-body)' }}>{leaf.value}</span>
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
      <div style={{ display: 'flex', gap: 'var(--spacing-20)', flexWrap: 'wrap' }}>
        {leavesUnder(primitive, 'border.radius').map((leaf) => (
          <div key={leaf.path} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 96,
                height: 96,
                background: 'var(--color-background-surface)',
                border: '1px solid var(--color-border-default)',
                borderRadius: `var(${leaf.cssVar})`,
              }}
            />
            <div style={{ fontSize: 'var(--typography-label-default-font-size)', marginTop: 'var(--spacing-8)', color: 'var(--color-content-body)' }}>
              {leaf.path.replace('border.radius.', '')} · {leaf.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};
