import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Icon from './Icon';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const iconContract =
  (componentContract as any).component?.icon?.$extensions?.bella ?? {};

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: {
      tokens: ['--icon-sm', '--icon-md', '--icon-lg', '--icon-stroke'],
      a11y: iconContract.a11y,
    },
  },
  argTypes: {
    name: { control: 'select', options: ['ViewGrid', 'Map', 'Table', 'NavArrowDown'] },
    size: { control: 'inline-radio' },
    label: { control: 'text' },
    className: { control: false },
    style: { control: false },
  },
  args: { name: 'ViewGrid', size: 'md' },
};
export default meta;

type Story = StoryObj<typeof Icon>;

/** The registry at the three token sizes, in the context ink. */
export const Registry: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
          <Icon name="ViewGrid" size={size} />
          <Icon name="Map" size={size} />
          <Icon name="Table" size={size} />
          <Icon name="NavArrowDown" size={size} />
        </div>
      ))}
    </div>
  ),
};

/** Decorative by default; a label makes it meaningful. Always currentColor. */
export const Behavior: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
      <Icon name="Map" size="md" />
      <Icon name="Map" size="md" label="Map view" />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    await step('decorative by default: aria-hidden, no role', async () => {
      const decorative = canvasElement.querySelector('svg[aria-hidden="true"]');
      expect(decorative).not.toBeNull();
      expect(decorative).not.toHaveAttribute('role');
    });

    await step('labelled: role=img with the accessible name', async () => {
      const meaningful = canvasElement.querySelector('svg[role="img"]');
      expect(meaningful).toHaveAttribute('aria-label', 'Map view');
    });

    await step('always currentColor', async () => {
      const svg = canvasElement.querySelector('svg')!;
      expect(svg.getAttribute('stroke')).toBe('currentColor');
    });
  },
};
