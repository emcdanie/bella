import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import ScoreTile from './ScoreTile';
import cssRaw from './ScoreTile.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof ScoreTile> = {
  title: 'Components/Data/ScoreTile',
  component: ScoreTile,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
  args: { label: 'All 10 jobs · AGENTS.md', value: 79.3, tone: 'attention', word: 'behind by 6.2' },
};
export default meta;
type Story = StoryObj<typeof ScoreTile>;

export const Playground: Story = {};

/** Audit reports' four scores, two by two: the base neutral, AGENTS.md tinted by ahead or behind with its word.
 * A tile is a toggle; picking one marks it with the brand edge and announces it as pressed. */
export const Scores: Story = {
  render: () => {
    const [pick, setPick] = useState<string | null>(null);
    const tile = (k: string, label: string, value: number, tone: 'neutral' | 'success' | 'attention', word: string) => (
      <ScoreTile label={label} value={value} tone={tone} word={word} selected={pick === k} onSelect={() => setPick(pick === k ? null : k)} />
    );
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--spacing-16)', padding: 'var(--spacing-24)', maxInlineSize: '40rem' }}>
        {tile('a', 'All 10 jobs · No file', 85.5, 'neutral', 'the base')}
        {tile('b', 'All 10 jobs · AGENTS.md', 79.3, 'attention', 'behind by 6.2')}
        {tile('c', 'The 8 jobs · No file', 86.1, 'neutral', 'the base')}
        {tile('d', 'The 8 jobs · AGENTS.md', 87.8, 'success', 'ahead by 1.7')}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const tile = c.getByRole('button', { name: /All 10 jobs · AGENTS.md/ });
    await expect(tile).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(tile);
    await expect(tile).toHaveAttribute('aria-pressed', 'true');
    // every tile carries its word, so colour is never the only cue
    await expect(canvasElement.querySelectorAll('[data-bella-component="status-dot"]').length).toBe(4);
  },
};
