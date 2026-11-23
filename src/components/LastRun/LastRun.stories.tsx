import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import LastRun from './LastRun';
import cssRaw from './LastRun.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();
const contract = (componentContract as any).component?.['last-run']?.$extensions?.bella ?? {};
const THEMES = ['chip-light', 'chip-dark'] as const;

const Themed = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
    {THEMES.map((theme) => (
      <div key={theme} data-theme={theme} style={{ padding: 'var(--spacing-20)', background: 'var(--color-background-default)', borderRadius: 'var(--border-radius-12)', display: 'grid', gap: 'var(--spacing-8)' }}>
        {children}
      </div>
    ))}
  </div>
);

const meta: Meta<typeof LastRun> = {
  title: 'Components/Data/LastRun',
  component: LastRun,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens, a11y: contract.a11y } },
  argTypes: { tone: { control: 'inline-radio' }, className: { control: false }, style: { control: false } },
  args: { when: '09:24', took: '2 s', result: 'nothing new' },
};
export default meta;
type Story = StoryObj<typeof LastRun>;

export const Playground: Story = {};

/** Ran, found something, did not land, never run. */
export const AllStates: Story = {
  render: () => (
    <Themed>
      <LastRun when="09:24" took="2 s" result="nothing new" />
      <LastRun when="09:30" took="5 s" result="2 new" />
      <LastRun tone="failed" when="09:31" result="the gate refused the commit" />
      <LastRun />
    </Themed>
  ),
};

/** A failed stamp says so in words, not only in colour. */
export const Behavior: Story = {
  args: { tone: 'failed', when: '09:31', result: 'the gate refused the commit' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/Did not land/)).toBeInTheDocument();
  },
};
