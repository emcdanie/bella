import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import StatusDot from './StatusDot';
import cssRaw from './StatusDot.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['status-dot']?.$extensions?.bella ?? {};

const THEMES = ['chip-light', 'chip-dark'] as const;

/** One surface per Chip theme; dark comes from the token modes, never a variant. */
const Themed = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
    {THEMES.map((theme) => (
      <div
        key={theme}
        data-theme={theme}
        style={{
          padding: 'var(--spacing-20)',
          background: 'var(--color-background-surface)',
          borderRadius: 'var(--border-radius-12)',
          display: 'flex',
          gap: 'var(--spacing-16)',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {children}
      </div>
    ))}
  </div>
);

const meta: Meta<typeof StatusDot> = {
  title: 'Components/StatusDot',
  component: StatusDot,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    tone: { control: 'inline-radio' },
    mark: { control: 'inline-radio' },
    label: { control: 'text' },
    className: { control: false },
    style: { control: false },
  },
  args: { label: 'Done', tone: 'success', mark: 'dot', showLabel: true, showDot: true, showWash: true },
};
export default meta;

type Story = StoryObj<typeof StatusDot>;

export const Playground: Story = {};

const TONES = [
  ['success', 'Done'],
  ['info', 'In progress'],
  ['attention', 'For review'],
  ['danger', 'Broken'],
  ['neutral', 'Not started'],
] as const;

/** Every tone, with wash and bare, plus the check mark, in Chip light and Chip dark. */
export const AllTones: Story = {
  render: () => (
    <Themed>
      {TONES.map(([tone, word]) => (
        <StatusDot key={tone} tone={tone} label={word} />
      ))}
      {TONES.map(([tone, word]) => (
        <StatusDot key={`bare-${tone}`} tone={tone} label={word} showWash={false} />
      ))}
      <StatusDot tone="success" mark="check" label="Passed" />
      <StatusDot tone="danger" label="Dot only" showLabel={false} />
    </Themed>
  ),
};

/** Not a control; the word stays the accessible name when hidden. */
export const Behavior: Story = {
  render: () => <StatusDot tone="danger" label="Broken" showLabel={false} />,
  play: async ({ canvas, step }) => {
    await step('non-interactive, word still readable by assistive tech', async () => {
      expect(canvas.queryAllByRole('button')).toHaveLength(0);
      expect(canvas.getByText('Broken')).toBeInTheDocument();
    });
  },
};
