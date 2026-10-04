import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { expectTouchTarget } from '../../testing/behavioral';
import Tabs, { tabPanelProps } from './Tabs';
import tabsCssRaw from './Tabs.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((tabsCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const tabsContract = (componentContract as any).component?.tabs?.$extensions?.bella ?? {};

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: tabsContract.a11y },
  },
  argTypes: {
    tabs: { control: false },
    value: { control: false },
    onChange: { control: false },
    label: { control: 'text' },
    idBase: { control: false },
    className: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

const WORKSPACES = [
  { id: 'health', label: 'Health' },
  { id: 'ask', label: 'Ask' },
  { id: 'library', label: 'Library' },
];

const TERMINALS = [
  { id: 'bella', label: 'BELLA', status: 'running' as const },
  { id: 'chip', label: 'CHIP', status: 'idle' as const },
  { id: 'site', label: 'Portfolio', status: 'idle' as const },
];

function Harness({ tabs, idBase, label }: { tabs: typeof WORKSPACES; idBase: string; label: string }) {
  const [value, setValue] = useState(tabs[0].id);
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-4)', maxWidth: 560 }}>
      <Tabs tabs={tabs} value={value} onChange={setValue} label={label} idBase={idBase} />
      {tabs.map((t) => (
        <div key={t.id} {...tabPanelProps(idBase, t.id, t.id === value)}>
          <p style={{ margin: 0 }}>The {t.label} panel.</p>
        </div>
      ))}
    </div>
  );
}

/** Plain tabs: the selected tab is ink text over a 2px ink bar. */
export const Default: Story = {
  render: () => <Harness tabs={WORKSPACES} idBase="ws" label="Workspaces" />,
};

/** With run state: the dot is a fill or a ring, and the state is also spoken. */
export const WithStatus: Story = {
  render: () => <Harness tabs={TERMINALS} idBase="term" label="Terminals" />,
};

/** Behavioral suite: one tab stop, arrows and Home/End move and select,
 * aria-selected and aria-controls in the tree, panels follow, 44px targets. */
export const Behavior: Story = {
  render: () => <Harness tabs={TERMINALS} idBase="beh" label="Terminals" />,
  play: async ({ canvas, step }) => {
    const [bella, chip, site] = canvas.getAllByRole('tab');

    await step('one tab stop: only the selected tab is tabbable', async () => {
      expect(bella).toHaveAttribute('aria-selected', 'true');
      expect(bella).toHaveAttribute('tabindex', '0');
      expect(chip).toHaveAttribute('tabindex', '-1');
    });

    await step('each tab controls its panel, the panel is labelled by its tab', async () => {
      const panel = canvas.getByRole('tabpanel');
      expect(bella).toHaveAttribute('aria-controls', panel.id);
      expect(panel).toHaveAttribute('aria-labelledby', bella.id);
    });

    await step('the run state is in the name, not only the dot', async () => {
      expect(canvas.getByRole('tab', { name: /^BELLA\s*, running$/ })).toBe(bella);
    });

    await step('ArrowRight moves focus and selection; the panel follows', async () => {
      bella.focus();
      await userEvent.keyboard('{ArrowRight}');
      await waitFor(() => {
        expect(chip).toHaveAttribute('aria-selected', 'true');
        expect(document.activeElement).toBe(chip);
        expect(canvas.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', chip.id);
      });
    });

    await step('End jumps to the last tab, ArrowRight wraps to the first', async () => {
      await userEvent.keyboard('{End}');
      await waitFor(() => expect(site).toHaveAttribute('aria-selected', 'true'));
      await userEvent.keyboard('{ArrowRight}');
      await waitFor(() => expect(bella).toHaveAttribute('aria-selected', 'true'));
    });

    await step('keyboard focus draws the 3px ring', async () => {
      const cs = getComputedStyle(bella);
      expect(cs.outlineStyle).toBe('solid');
      expect(parseFloat(cs.outlineWidth)).toBe(3);
    });

    await step('touch target: 44px minimum per tab', async () => {
      expectTouchTarget(bella);
    });
  },
};
