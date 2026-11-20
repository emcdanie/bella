import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { expectTouchTarget } from '../../testing/behavioral';
import Tabs, { tabPanelProps, type TabsItem } from './Tabs';
import tabsCssRaw from './Tabs.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((tabsCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const tabsContract = (componentContract as any).component?.tabs?.$extensions?.bella ?? {};

const meta: Meta<typeof Tabs> = {
  title: 'Components/Actions/Tabs',
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

function Harness({ tabs, idBase, label }: { tabs: TabsItem[]; idBase: string; label: string }) {
  const [value, setValue] = useState(tabs[0].id);
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', maxWidth: 560 }}>
      <Tabs tabs={tabs} value={value} onChange={setValue} label={label} idBase={idBase} />
      {tabs.map((t) => (
        <div key={t.id} {...tabPanelProps(idBase, t.id, t.id === value)}>
          <p style={{ margin: 0 }}>The {t.label} panel.</p>
        </div>
      ))}
    </div>
  );
}

/** Plain tabs: the selected tab is the light-blue fill, a bold ink label and the 2px ink bar. */
export const Default: Story = {
  render: () => <Harness tabs={WORKSPACES} idBase="ws" label="Workspaces" />,
};

/** With run state: the StatusDot part (running info, idle neutral), and the state is also spoken. */
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

    await step('keyboard focus draws the focus-ring token (4px)', async () => {
      const cs = getComputedStyle(bella);
      expect(cs.outlineStyle).toBe('solid');
      expect(parseFloat(cs.outlineWidth)).toBe(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--focus-ring-width')));
    });

    await step('touch target: 44px minimum per tab', async () => {
      expectTouchTarget(bella);
    });
  },
};

const COUNTED = [
  { id: 'needs', label: 'Needs you', count: 4, icon: 'Clock' as const },
  { id: 'running', label: 'Running', count: 2, icon: 'Play' as const },
  { id: 'done', label: 'Done', count: 12, icon: 'CheckCircle' as const },
];

/** count and icon (BellaComponents, 11 Nov 2026): a quiet pill after the
 * label, spoken after it ("Needs you, 4"); the glyph is decorative. */
export const WithCount: Story = {
  render: () => <Harness tabs={COUNTED} idBase="counted" label="Work" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('tab', { name: /^Needs you\s*,\s*4$/ })).toHaveAttribute('aria-selected', 'true');
  },
};

const THEMES = ['chip-light', 'chip-dark'] as const;

const SHELL = [
  { id: 'work', label: 'Work', count: 4 },
  { id: 'runs', label: 'Runs', status: 'running' as const },
  { id: 'branches', label: 'Branches', status: 'idle' as const },
  { id: 'library', label: 'Library', icon: 'Book' as const },
];

/** Figma's Tab variants in Chip light and Chip dark: selected, status running and idle, count, icon. Hover and focus are CSS. */
export const ChipThemes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
      {THEMES.map((theme) => (
        <div key={theme} data-theme={theme} style={{ padding: 'var(--spacing-24) var(--spacing-32)', background: 'var(--color-background-surface)', color: 'var(--color-content-default)' }}>
          <Harness tabs={SHELL} idBase={`shell-${theme}`} label="Project views" />
        </div>
      ))}
    </div>
  ),
};

const WORK_PANEL = [
  { id: 'chat', label: 'Chat', count: 3 },
  { id: 'sessions', label: 'Sessions', count: 6 },
  { id: 'changes', label: 'Changes', count: 12 },
  { id: 'checks', label: 'Checks', count: 5 },
  { id: 'notes', label: 'Notes', count: 2 },
];

/** At 375 (the Work panel's tab row, 21 Nov): the row scrolls and snaps, so a tab comes to rest whole at the
 * start edge; the start fade covers only that tab's empty side, never a label or a count Tag. */
export const NarrowWithCounts: Story = {
  render: () => (
    <div style={{ inlineSize: 'calc(var(--spacing-80) * 4 + var(--spacing-48) + var(--spacing-8) - var(--spacing-32))' }}>
      <Harness tabs={WORK_PANEL} idBase="narrow" label="Work panel" />
    </div>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    const list = canvasElement.querySelector('[role="tablist"]') as HTMLElement;
    /* a tab that crosses the start edge may show only its own empty side (16), never its label or count */
    const side = parseFloat(getComputedStyle(list.querySelector('[role="tab"]')!).paddingInlineEnd);
    const clearOfFade = () => {
      const l = list.getBoundingClientRect();
      for (const tab of list.querySelectorAll<HTMLElement>('[role="tab"]')) {
        const r = tab.getBoundingClientRect();
        if (r.left < l.left - 0.5 && r.right - l.left > side + 0.5) return `${tab.textContent} rests cut at the start edge`;
      }
      return null;
    };
    await step('the row scrolls at this width', async () => {
      await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
    });
    await step('More tabs: the row rests with no tab half under the fade', async () => {
      await userEvent.click(await waitFor(() => canvas.getByRole('button', { name: 'More tabs' })));
      await waitFor(() => expect(list.scrollLeft).toBeGreaterThan(0), { timeout: 2000 });
      await new Promise((r) => setTimeout(r, 600));
      await expect(list.scrollLeft).toBeGreaterThan(0);
      await expect(clearOfFade()).toBeNull();
    });
    await step('a swipe that stops mid-tab snaps to a whole tab', async () => {
      list.scrollTo({ left: 150, behavior: 'instant' as ScrollBehavior });
      await new Promise((r) => setTimeout(r, 600));
      await expect(list.scrollLeft).toBeGreaterThan(0);
      await expect(clearOfFade()).toBeNull();
    });
  },
};
