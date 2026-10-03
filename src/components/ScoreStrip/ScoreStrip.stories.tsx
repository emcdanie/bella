import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import ScoreStrip, { ScoreLegend, scoreBand, type ScoreCell } from './ScoreStrip';
import stripCssRaw from './ScoreStrip.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((stripCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const stripContract =
  (componentContract as any).component?.['score-strip']?.$extensions?.bella ?? {};

const meta: Meta<typeof ScoreStrip> = {
  title: 'Components/ScoreStrip',
  component: ScoreStrip,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: stripContract.a11y },
  },
  argTypes: {
    name: { control: 'text' },
    kind: { control: 'text' },
    score: { control: { type: 'number', min: 0, max: 100 } },
    cells: { control: false },
    as: { control: false },
    className: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof ScoreStrip>;

const STATIONS: [string, string][] = [
  ['Cov', 'Coverage'],
  ['Best', 'Best practice'],
  ['A11y', 'Accessibility'],
  ['Lang', 'Language'],
  ['Test', 'Testing'],
  ['Orch', 'Orchestration'],
  ['Gov', 'Governance'],
  ['Docs', 'Documentation'],
  ['MRead', 'Machine-readable'],
  ['Agent', 'Agent'],
];

const cells = (values: (number | null)[]): ScoreCell[] =>
  STATIONS.map(([label, name], i) => ({ label, name, value: values[i] }));

const panel = {
  display: 'grid',
  gap: 'var(--spacing-8)',
  maxWidth: 880,
  padding: 'var(--spacing-6)',
  background: 'var(--color-semantic-surface-card)',
  borderRadius: 'var(--radius-lg)',
};

/** One measured system, every band present. */
export const Default: Story = {
  render: () => (
    <div style={panel}>
      <ScoreStrip
        name="BELLA"
        kind="Design system"
        score={84}
        cells={cells([96, 92, 98, 88, 72, 64, 90, 55, 95, null])}
      />
    </div>
  ),
};

/** The readiness map: strips for several systems, self-assessed told apart, and the legend. */
export const ReadinessMap: Story = {
  render: () => (
    <div style={panel}>
      <ScoreStrip name="BELLA" kind="Design system" score={84} cells={cells([96, 92, 98, 88, 72, 64, 90, 55, 95, null])} />
      <ScoreStrip name="Portfolio" kind="Site" score={null} cells={cells([null, null, null, null, null, null, null, null, null, null])} />
      <ScoreLegend />
    </div>
  ),
};

/** The band is spoken with every figure; self-assessed is a word, not a fill. */
export const Behavior: Story = {
  render: () => (
    <ScoreStrip name="BELLA" kind="Design system" score={84} cells={cells([96, 72, 55, null, 80, 79, 60, 59, 100, 0])} />
  ),
  play: async ({ canvas, step }) => {
    await step('a labelled region with a heading', async () => {
      expect(canvas.getByRole('region', { name: 'BELLA' })).toBeTruthy();
      expect(canvas.getByRole('heading', { name: 'BELLA', level: 3 })).toBeTruthy();
    });

    await step('every station is spoken with its full name, value and band', async () => {
      const spoken = canvas
        .getAllByRole('listitem')
        .map((li) => Array.from(li.children).filter((c) => !c.hasAttribute('aria-hidden')).map((c) => c.textContent).join(''));
      expect(spoken).toContain('Coverage: 96 of 100, sturdy');
      expect(spoken).toContain('Best practice: 72 of 100, drifting');
      expect(spoken).toContain('Accessibility: 55 of 100, check engine');
      expect(spoken).toContain('Language: self-assessed');
    });

    await step('band edges: 80 and 60 open their band, 79 and 59 do not', async () => {
      expect([80, 79, 60, 59, 100, 0, null].map(scoreBand)).toEqual([
        'strong', 'mid', 'mid', 'low', 'strong', 'low', 'self',
      ]);
    });
  },
};
