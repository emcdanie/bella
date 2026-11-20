import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import Drawer from './Drawer';
import Button from '../Button/Button';
import NavList from '../NavList/NavList';
import drawerCssRaw from './Drawer.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((drawerCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const drawerContract = (componentContract as any).component?.drawer?.$extensions?.bella ?? {};

const meta: Meta<typeof Drawer> = {
  title: 'Components/Layout/Drawer',
  component: Drawer,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: drawerContract.a11y },
  },
};
export default meta;

type Story = StoryObj<typeof Drawer>;

/* The published Drawer's sample content (Figma 172:622): the NavList with two groups and a footer. */
const GROUPS = [
  {
    label: 'Workspace',
    items: [
      { href: '#overview', label: 'Overview', icon: 'ViewGrid' as const },
      { href: '#components', label: 'Components', icon: 'Table' as const, badge: 18, current: true },
      { href: '#map', label: 'Map', icon: 'Map' as const },
    ],
  },
  {
    label: 'Library',
    items: [
      { href: '#search', label: 'Search', icon: 'Search' as const },
      { href: '#resources', label: 'Resources', icon: 'ArrowUpRight' as const, badge: 6 },
    ],
  },
];

function Harness({ startOpen = false, side, withFooter = false, status }: { startOpen?: boolean; side?: 'left' | 'right'; withFooter?: boolean; status?: string }) {
  const [open, setOpen] = useState(startOpen);
  const [closes, setCloses] = useState(0);
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-12)', justifyItems: 'start', minHeight: 'calc(var(--spacing-80) * 5)' }}>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open menu
      </Button>
      <span data-testid="closes">{closes}</span>
      <Drawer
        open={open}
        onClose={() => {
          setOpen(false);
          setCloses((n) => n + 1);
        }}
        label="Navigation"
        side={side}
        status={status}
        footer={
          withFooter ? (
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Reset
              </Button>
              <Button variant="primary" onClick={() => setOpen(false)}>
                Apply
              </Button>
            </>
          ) : undefined
        }
      >
        <NavList label="Sections" groups={GROUPS} onToggle={() => {}} footer="BELLA v0.4.0" />
      </Drawer>
    </div>
  );
}

/** Closed: only the trigger. Open it to see the panel slide in over the scrim. */
export const Default: Story = {
  render: () => <Harness />,
};

/** Open: the raised panel at the left edge, a hairline edge, the scrim over the page. */
export const Open: Story = {
  render: () => <Harness startOpen />,
};

/** side="right": the same panel from the right edge, for a tool panel. */
export const Right: Story = {
  render: () => <Harness startOpen side="right" />,
};

/** Behavioral suite: a modal dialog named by its title; focus moves in and
 * stays in; Esc, Close and the scrim close it; focus returns to the trigger. */
export const Behavior: Story = {
  render: () => <Harness />,
  play: async ({ canvas, step }) => {
    const trigger = canvas.getByRole('button', { name: 'Open menu' });
    const dialog = () => document.querySelector('dialog[data-bella-component="drawer"]') as HTMLDialogElement;

    await step('opens as a modal dialog named by its title, focus inside', async () => {
      await userEvent.click(trigger);
      await waitFor(() => expect(dialog().open).toBe(true));
      expect(dialog().matches(':modal')).toBe(true);
      expect(dialog()).toHaveAccessibleName('Navigation');
      expect(dialog().contains(document.activeElement)).toBe(true);
    });

    await step('Tab stays inside the drawer', async () => {
      for (let i = 0; i < 6; i++) {
        await userEvent.tab();
        expect(dialog().contains(document.activeElement) || document.activeElement === document.body).toBe(true);
      }
    });

    await step('Esc closes it and focus returns to the trigger', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(dialog().open).toBe(false));
      await waitFor(() => expect(canvas.getByTestId('closes').textContent).toBe('1'));
      expect(document.activeElement).toBe(trigger);
    });

    await step('the Close button closes it', async () => {
      await userEvent.click(trigger);
      await waitFor(() => expect(dialog().open).toBe(true));
      await userEvent.click(dialog().querySelector('button[data-bella-component="button"]')!);
      await waitFor(() => expect(dialog().open).toBe(false));
      await waitFor(() => expect(canvas.getByTestId('closes').textContent).toBe('2'));
      expect(document.activeElement).toBe(trigger);
    });

    await step('a click on the scrim closes it', async () => {
      await userEvent.click(trigger);
      await waitFor(() => expect(dialog().open).toBe(true));
      dialog().dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await waitFor(() => expect(dialog().open).toBe(false));
    });
  },
};

/** footer (BellaComponents, 11 Nov 2026): actions pinned under the body,
 * above a hairline. At most one primary. */
export const WithFooter: Story = {
  render: () => <Harness startOpen withFooter status="Checks ran 2 min ago" />,
  play: async () => {
    const dialog = document.querySelector('dialog[open]') as HTMLElement;
    await expect(within(dialog).getByRole('button', { name: 'Apply' })).toBeVisible();
  },
};

/** Goes as it came (rule "Motion that shows what happened", item 8): Close slides the panel back to
 * its edge and fades the scrim, once, then the dialog closes and focus returns. Reduced motion: it
 * closes at once. */
export const SlidesOut: Story = {
  render: () => <Harness />,
  play: async ({ canvas, step }) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const trigger = canvas.getByRole('button', { name: 'Open menu' });
    const dialog = () => document.querySelector('dialog[data-bella-component="drawer"]') as HTMLDialogElement;
    await userEvent.click(trigger);
    await waitFor(() => expect(dialog().open).toBe(true));
    await step(reduced ? 'reduced motion: Close closes at once' : 'Close slides it out before it closes', async () => {
      await userEvent.click(dialog().querySelector('button[data-bella-component="button"]')!);
      if (!reduced) {
        await expect(dialog().dataset.closing).toBe('true');
        await expect(getComputedStyle(dialog()).animationName).toMatch(/drawerOut/);
      }
      await waitFor(() => expect(dialog().open).toBe(false));
      await expect(dialog().dataset.closing).toBeUndefined();
      await expect(document.activeElement).toBe(trigger);
    });
  },
};
