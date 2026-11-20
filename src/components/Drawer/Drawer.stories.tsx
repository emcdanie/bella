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

function Harness({ startOpen = false, side, size, withFooter = false, status, tall = false }: { startOpen?: boolean; side?: 'left' | 'right'; size?: 'sm' | 'lg'; withFooter?: boolean; status?: string; tall?: boolean }) {
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
        size={size}
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
        {tall ? <div aria-hidden="true" style={{ blockSize: 'calc(var(--spacing-80) * 20)' }} /> : null}
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

/** size="lg" (CHIP · Dashboard Flow 12, a session's run and the terminal): 640 from a 768 window, the
 * full width on a phone. A body that scrolls is a named region: Tab reaches it, it shows BELLA's ring
 * (4 wide, drawn inside so the panel never clips it) and the arrow keys scroll it. */
export const Large: Story = {
  render: () => <Harness size="lg" withFooter tall />,
  play: async ({ canvas, step }) => {
    const dialog = () => document.querySelector('dialog[data-bella-component="drawer"]') as HTMLDialogElement;
    await userEvent.click(canvas.getByRole('button', { name: 'Open menu' }));
    await waitFor(() => expect(dialog().open).toBe(true));
    await step('640 from a 768 window, else the full width', async () => {
      const w = dialog().getBoundingClientRect().width;
      const vw = document.documentElement.clientWidth;
      await expect(Math.round(w)).toBe(window.innerWidth >= 768 ? Math.min(640, vw) : Math.round(window.innerWidth));
    });
    await step('the scrolling body is a named region with BELLA\'s ring', async () => {
      const body = within(dialog()).getByRole('region', { name: 'Navigation: content' });
      await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
      body.focus();
      const cs = getComputedStyle(body);
      await expect(parseFloat(cs.outlineWidth)).toBe(4);
      await expect(parseFloat(cs.outlineOffset)).toBe(-8);
    });
    await step('Tab reaches the scrolling body, so the keyboard can scroll it', async () => {
      const body = within(dialog()).getByRole('region', { name: 'Navigation: content' });
      within(dialog()).getByRole('button', { name: 'Close' }).focus();
      for (let i = 0; i < 12 && document.activeElement !== body; i++) await userEvent.tab();
      await expect(document.activeElement).toBe(body);
    });
  },
};

/** A long title (CHIP's fix drawer): Close lines up with the title's first line, and the first group
 * starts 24 under the title block (rule 10), as between groups. */
export const LongTitle: Story = {
  render: () => (
    <Drawer open onClose={() => {}} side="right" label="Give agents BELLA's component list (llms.txt)" status="Needs you · opened 2 min ago">
      <NavList label="Sections" groups={GROUPS} onToggle={() => {}} />
    </Drawer>
  ),
  play: async ({ step }) => {
    const dialog = document.querySelector('dialog[open]') as HTMLElement;
    const title = dialog.querySelector('h2') as HTMLElement;
    const close = within(dialog).getByRole('button', { name: 'Close' });
    await step('Close is centred on the title\'s first line', async () => {
      const t = title.getBoundingClientRect();
      const lineH = parseFloat(getComputedStyle(title).lineHeight);
      const c = close.getBoundingClientRect();
      await expect(Math.abs(c.top + c.height / 2 - (t.top + lineH / 2))).toBeLessThan(2);
    });
    await step('24 from the title block to the first group', async () => {
      const block = title.parentElement!.getBoundingClientRect();
      const body = within(dialog).getByRole('region', { name: /content/ });
      const first = body.firstElementChild!.getBoundingClientRect();
      await expect(Math.round(first.top - block.bottom)).toBe(24);
    });
  },
};
