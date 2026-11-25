import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import ToolColumn, { ZOOM_STEPS } from './ToolColumn';
import cssRaw from './ToolColumn.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['tool-column']?.$extensions?.bella ?? {};

const meta: Meta<typeof ToolColumn> = {
  title: 'Components/Actions/ToolColumn',
  component: ToolColumn,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    onZoomChange: { control: false },
    onFit: { control: false },
    onDarkChange: { control: false },
    onMarkUpChange: { control: false },
    onCompareChange: { control: false },
    className: { control: false },
    style: { control: false },
  },
  args: { defaultZoom: 200, showZoom: true },
  render: (args) => (
    <div style={{ padding: 'var(--spacing-24)', paddingInlineEnd: 'var(--spacing-80)', paddingBlockEnd: 'var(--spacing-48)', background: 'var(--color-background-subtle)', display: 'inline-block' }}>
      <ToolColumn {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof ToolColumn>;

const bar = (el: HTMLElement) => el.querySelector('[role="toolbar"]') as HTMLElement;
const btn = (el: HTMLElement, name: string) => el.querySelector(`button[aria-label="${name}"]`) as HTMLButtonElement;

/** The Figma column: zoom in, fit, zoom out, a divider, then light or dark, mark up and compare; the readout "200%" under it. */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const tb = bar(canvasElement);
    await step('a vertical toolbar named View tools with six tools, each named', async () => {
      await expect(tb).toHaveAttribute('aria-orientation', 'vertical');
      await expect(tb).toHaveAccessibleName('View tools');
      const names = Array.from(tb.querySelectorAll('button')).map((b) => b.getAttribute('aria-label'));
      await expect(names).toEqual(['Zoom in', 'Fit', 'Zoom out', 'Light or dark', 'Mark up', 'Compare']);
    });
    await step('every tool is a 44 target, the column corner is 16, the readout says 200%', async () => {
      for (const b of Array.from(tb.querySelectorAll('button'))) {
        const r = b.getBoundingClientRect();
        await expect(Math.round(r.width)).toBeGreaterThanOrEqual(44);
        await expect(Math.round(r.height)).toBeGreaterThanOrEqual(44);
      }
      await expect(getComputedStyle(tb).borderTopLeftRadius).toBe('16px');
      await expect(canvasElement.querySelector('[role="status"]')).toHaveTextContent('200%');
    });
    await step('a divider sits between the groups', async () => {
      await expect(tb.querySelector('[role="separator"]')).not.toBeNull();
    });
  },
};

/** Zoom in and out walk the steps 25 to 400; the readout follows; Fit tells the stage. */
export const ZoomSteps: Story = {
  render: () => {
    const [z, setZ] = useState(100);
    const [fits, setFits] = useState(0);
    return (
      <div style={{ padding: 'var(--spacing-24)', paddingInlineEnd: 'var(--spacing-80)', paddingBlockEnd: 'var(--spacing-48)', display: 'inline-block' }}>
        <ToolColumn zoom={z} onZoomChange={setZ} onFit={() => { setFits((n) => n + 1); setZ(100); }} />
        <span data-testid="fits" style={{ fontFamily: 'var(--typography-subtext-font-family)' }}>fit {fits}</span>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const readout = () => canvasElement.querySelector('[role="status"]')!.textContent;
    await expect(readout()).toBe('100%');
    await userEvent.click(btn(canvasElement, 'Zoom in'));
    await waitFor(() => expect(readout()).toBe('150%'));
    await userEvent.click(btn(canvasElement, 'Zoom in'));
    await userEvent.click(btn(canvasElement, 'Zoom in'));
    await userEvent.click(btn(canvasElement, 'Zoom in'));
    await userEvent.click(btn(canvasElement, 'Zoom in'));
    await waitFor(() => expect(readout()).toBe('400%'));
    for (let i = 0; i < ZOOM_STEPS.length + 1; i++) await userEvent.click(btn(canvasElement, 'Zoom out'));
    await waitFor(() => expect(readout()).toBe('25%'));
    await userEvent.click(btn(canvasElement, 'Fit'));
    await waitFor(() => expect(readout()).toBe('100%'));
    await expect(canvasElement.querySelector('[data-testid="fits"]')).toHaveTextContent('fit 1');
  },
};

/** One tab stop; the arrow keys, Home and End move focus between the tools (roving tabindex). */
export const RovingFocus: Story = {
  play: async ({ canvasElement, step }) => {
    const tb = bar(canvasElement);
    const buttons = Array.from(tb.querySelectorAll('button'));
    await step('only one tool is a tab stop', async () => {
      await waitFor(() => expect(buttons.filter((b) => b.tabIndex === 0)).toHaveLength(1));
    });
    await step('Down, Up, End and Home move focus and the tab stop with it', async () => {
      buttons[0].focus();
      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() => expect(document.activeElement).toBe(buttons[1]));
      await expect(buttons[1].tabIndex).toBe(0);
      await expect(buttons[0].tabIndex).toBe(-1);
      await userEvent.keyboard('{End}');
      await waitFor(() => expect(document.activeElement).toBe(buttons[5]));
      await userEvent.keyboard('{ArrowUp}');
      await waitFor(() => expect(document.activeElement).toBe(buttons[4]));
      await userEvent.keyboard('{Home}');
      await waitFor(() => expect(document.activeElement).toBe(buttons[0]));
    });
    await step('+ and - zoom, from the keyboard', async () => {
      const readout = canvasElement.querySelector('[role="status"]')!;
      await userEvent.keyboard('+');
      await waitFor(() => expect(readout).toHaveTextContent('300%'));
      await userEvent.keyboard('-');
      await waitFor(() => expect(readout).toHaveTextContent('200%'));
    });
  },
};

/** Light or dark, Mark up and Compare are toggles: on = pressed, and Light or dark swaps its glyph. */
export const Toggles: Story = {
  render: () => {
    const [dark, setDark] = useState(false);
    const [mark, setMark] = useState(false);
    const [cmp, setCmp] = useState(false);
    return (
      <div style={{ padding: 'var(--spacing-24)', paddingInlineEnd: 'var(--spacing-80)', display: 'inline-block' }}>
        <ToolColumn dark={dark} onDarkChange={setDark} markUp={mark} onMarkUpChange={setMark} compare={cmp} onCompareChange={setCmp} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    for (const name of ['Light or dark', 'Mark up', 'Compare']) {
      const b = btn(canvasElement, name);
      await expect(b).toHaveAttribute('aria-pressed', 'false');
      await userEvent.click(b);
      await waitFor(() => expect(b).toHaveAttribute('aria-pressed', 'true'));
    }
    await expect(btn(canvasElement, 'Zoom in')).not.toHaveAttribute('aria-pressed');
  },
};

/** Each tool names itself in a Tooltip on the right, on hover and on keyboard focus. */
export const Tooltips: Story = {
  play: async ({ canvasElement }) => {
    const b = btn(canvasElement, 'Zoom in');
    b.focus();
    const tip = await waitFor(() => {
      const t = b.closest('[data-bella-component="tooltip"]')!.querySelector('[class*="tip"]') as HTMLElement;
      expect(t.hidden).toBe(false);
      return t;
    });
    await expect(tip).toHaveTextContent('Zoom in');
    await expect(tip.className).toMatch(/right/);
  },
};

/** The readout can be left out. */
export const NoReadout: Story = {
  args: { showZoom: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[role="status"]')).toBeNull();
  },
};

/** View tools only (Playground picks and Needs you, Workbench A, 23 Nov 2026): zoom in, fit, zoom out; no divider. */
export const ViewOnly: Story = {
  args: { tools: 'view', defaultZoom: 100 },
  play: async ({ canvasElement }) => {
    const names = Array.from(canvasElement.querySelectorAll('button')).map((b) => b.getAttribute('aria-label'));
    if (names.join() !== 'Zoom in,Fit,Zoom out') throw new Error(`view tools: ${names.join()}`);
    if (canvasElement.querySelector('[role="separator"]')) throw new Error('a view-only column has no divider');
  },
};

/** Horizontal, for a phone: the tools in a row, arrow keys left and right. */
export const Horizontal: Story = {
  args: { tools: 'view', orientation: 'horizontal', defaultZoom: 100 },
  play: async ({ canvasElement }) => {
    const bar = canvasElement.querySelector('[role="toolbar"]') as HTMLElement;
    if (bar.getAttribute('aria-orientation') !== 'horizontal') throw new Error('not horizontal');
    const [a, b] = Array.from(bar.querySelectorAll('button')).map((el) => el.getBoundingClientRect());
    if (!(b.left > a.left && Math.abs(b.top - a.top) < 2)) throw new Error('tools are not in a row');
  },
};
