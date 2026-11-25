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

function Harness({ startOpen = false, side, size, withFooter = false, status, tall = false }: { startOpen?: boolean; side?: 'left' | 'right' | 'bottom'; size?: 'sm' | 'lg'; withFooter?: boolean; status?: string; tall?: boolean }) {
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

/** footerNote (23 Nov 2026): the helper text at the left of the footer's row, the action at the right edge of the
 * same row, primary last. It wraps under itself, never under the button. */
export const WithFooterNote: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        label="Gaps"
        side="right"
        size="lg"
        status="12 parts BELLA can't give yet"
        footerNote="Opens the plan to build them; nothing runs until you approve it."
        footer={
          <Button variant="primary" onClick={() => setOpen(false)}>
            Plan the build
          </Button>
        }
      >
        <NavList label="Sections" groups={GROUPS} onToggle={() => {}} />
      </Drawer>
    );
  },
  play: async () => {
    const dialog = document.querySelector('dialog[open]') as HTMLElement;
    const note = within(dialog).getByText(/nothing runs until you approve it/);
    const button = within(dialog).getByRole('button', { name: 'Plan the build' });
    await expect(note).toBeVisible();
    // one row: the note and the button share a line, the button at the right edge
    const n = note.getBoundingClientRect();
    const b = button.getBoundingClientRect();
    await expect(n.right).toBeLessThanOrEqual(b.left);
    await expect(Math.abs((n.top + n.bottom) / 2 - (b.top + b.bottom) / 2)).toBeLessThan(b.height / 2);
  },
};

/** Header and footer stay put, only the body scrolls (23 Nov 2026), with short content and with long content that
 *  holds absolutely placed screen-reader text (as Progress has): the footer's bottom is the drawer's bottom edge and
 *  the drawer itself never scrolls. */
function PinnedFooter({ rows }: { rows: number }) {
  const [open, setOpen] = useState(true);
  return (
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      label={rows > 10 ? 'Long content' : 'Short content'}
      side="right"
      size="lg"
      footerNote="Opens the plan; nothing runs until you approve it."
      footer={<Button variant="primary" onClick={() => setOpen(false)}>Plan the build</Button>}
    >
      <ul style={{ margin: 0, padding: 'var(--spacing-16)', display: 'grid', gap: 'var(--spacing-12)' }}>
        {Array.from({ length: rows }, (_, i) => (
          <li key={i}>
            {`Part ${i + 1}`}
            <span style={{ position: 'absolute', inlineSize: 1, blockSize: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>{`Part ${i + 1}: ${i} differences`}</span>
          </li>
        ))}
      </ul>
    </Drawer>
  );
}
const pinned = async () => {
  const dialog = document.querySelector('dialog[open]') as HTMLDialogElement;
  const body = dialog.querySelector(':scope > [role="region"]') as HTMLElement;
  const footer = body.nextElementSibling as HTMLElement;
  await expect(dialog.scrollHeight).toBeLessThanOrEqual(dialog.clientHeight + 1);
  await expect(Math.abs(footer.getBoundingClientRect().bottom - dialog.getBoundingClientRect().bottom)).toBeLessThan(1.5);
};
/** Her pick A (23 Nov 2026): scrolled halfway, the head casts shadow/md over the content and the footer casts
 *  shadow/md-up; at the top, the head has no shadow. */
export const EdgesWhileScrolled: Story = {
  render: () => <PinnedFooter rows={60} />,
  play: async () => {
    const dialog = document.querySelector('dialog[open]') as HTMLDialogElement;
    const body = dialog.querySelector(':scope > [role="region"]') as HTMLElement;
    const head = dialog.firstElementChild as HTMLElement;
    const footer = body.nextElementSibling as HTMLElement;
    await waitFor(() => expect(getComputedStyle(footer).boxShadow).not.toBe('none'));
    await expect(getComputedStyle(head).boxShadow).toBe('none');
    body.scrollTop = (body.scrollHeight - body.clientHeight) / 2;
    body.dispatchEvent(new Event('scroll'));
    await waitFor(() => expect(getComputedStyle(head).boxShadow).not.toBe('none'));
  },
};
export const FooterPinnedShort: Story = { render: () => <PinnedFooter rows={3} />, play: pinned };
export const FooterPinnedLong: Story = { render: () => <PinnedFooter rows={60} />, play: pinned };

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

function HeadHarness() {
  const [open, setOpen] = useState(true);
  const [log, setLog] = useState('none');
  return (
    <div>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open chat
      </Button>
      <span data-testid="log">{log}</span>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        label="Ask BELLA"
        side="right"
        size="lg"
        subtitle="About Button"
        status="3 messages"
        onBack={() => setLog('back')}
        backLabel="Back to chats"
        action={
          <Button variant="tertiary" onClick={() => setLog('new')}>
            New chat
          </Button>
        }
      >
        <p>The thread goes here.</p>
      </Drawer>
    </div>
  );
}

/** The full head (Figma Drawer Head 172:528): Back at the start, the title with its subtitle and status,
 * the Action ("New chat") before Close, 12 apart. Back, Action and Close together need size="lg": at sm
 * (320) they leave the title about 32 wide. */
export const FullHead: Story = {
  render: () => <HeadHarness />,
  play: async ({ canvasElement, step }) => {
    const dialog = await waitFor(() => within(document.body).getByRole('dialog', { name: 'Ask BELLA' }));
    const d = within(dialog);
    const back = d.getByRole('button', { name: 'Back to chats' });
    const action = d.getByRole('button', { name: 'New chat' });
    const close = d.getByRole('button', { name: 'Close' });
    const title = d.getByRole('heading', { name: 'Ask BELLA' });
    const x = (el: HTMLElement) => el.getBoundingClientRect().left;
    await step('Back, title, Action, Close in that order', async () => {
      await expect(x(back)).toBeLessThan(x(title));
      await expect(x(title)).toBeLessThan(x(action));
      await expect(x(action)).toBeLessThan(x(close));
    });
    await step('the title has its own room: on one line, clear of the action', async () => {
      await expect(title.getBoundingClientRect().right).toBeLessThanOrEqual(x(action));
      await expect(title.getBoundingClientRect().height).toBeLessThan(parseFloat(getComputedStyle(title).lineHeight) * 1.5);
    });
    await step('subtitle sits above the status', async () => {
      const y = (t: string) => d.getByText(t).getBoundingClientRect().top;
      await expect(y('About Button')).toBeLessThan(y('3 messages'));
    });
    await step('Back and Action do their own thing and keep the drawer open', async () => {
      await userEvent.click(back);
      await expect(within(canvasElement).getByTestId('log')).toHaveTextContent('back');
      await userEvent.click(action);
      await expect(within(canvasElement).getByTestId('log')).toHaveTextContent('new');
      await expect(dialog).toHaveAttribute('open');
    });
  },
};

/* side="bottom" is the phone sheet: shown at 390, the width Figma draws it */
const PHONE = { viewport: { value: 'mobile', isRotated: false } };

/* the published sheet's content (Figma Drawer side=bottom): the NavList without its toggle or footer */
function SheetHarness({ startOpen = false, size, withFooter = false }: { startOpen?: boolean; size?: 'sm' | 'lg'; withFooter?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  const [closes, setCloses] = useState(0);
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-12)', justifyItems: 'start' }}>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open projects
      </Button>
      <span data-testid="closes">{closes}</span>
      <Drawer
        open={open}
        onClose={() => {
          setOpen(false);
          setCloses((n) => n + 1);
        }}
        label="Projects"
        side="bottom"
        size={size}
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
        <NavList label="Sections" groups={GROUPS} />
      </Drawer>
    </div>
  );
}

/** side="bottom", size sm (Figma, 22 Nov 2026): the phone sheet hugs its content and rises from the
 * bottom edge, 24 corners on top, the bottom square, a 36 x 4 grab handle, in the toolbar theme. */
export const Bottom: Story = {
  globals: PHONE,
  render: () => (
    <SheetHarness startOpen />
  ),
};

/** side="bottom", size lg: 720 tall (or the window less 48), with a footer and no divider above it. */
export const BottomLarge: Story = {
  globals: PHONE,
  render: () => (
    <SheetHarness startOpen size="lg" withFooter />
  ),
  play: async ({ step }) => {
    const dialog = await waitFor(() => document.querySelector('dialog[open]') as HTMLDialogElement);
    await step('720 tall, or the window less 48', async () => {
      await waitFor(() => expect(Math.round(dialog.getBoundingClientRect().height)).toBe(Math.min(720, window.innerHeight - 48)));
    });
    await step('no divider above the footer', async () => {
      const footer = within(dialog).getByRole('button', { name: 'Apply' }).parentElement as HTMLElement;
      await expect(parseFloat(getComputedStyle(footer).borderTopWidth)).toBe(0);
    });
  },
};

/** Behavior of the sheet: the full width at the bottom edge, top corners 24 and bottom square, the handle
 * 36 x 4 and hidden from screen readers; the same modal dialog, focus trap, Esc and Close as the side drawer. */
export const BottomBehavior: Story = {
  globals: PHONE,
  render: () => (
    <SheetHarness />
  ),
  play: async ({ canvas, step }) => {
    const trigger = canvas.getByRole('button', { name: 'Open projects' });
    const dialog = () => document.querySelector('dialog[data-bella-component="drawer"]') as HTMLDialogElement;

    await step('opens as a modal dialog at the bottom edge, the full width', async () => {
      await userEvent.click(trigger);
      await waitFor(() => expect(dialog().open).toBe(true));
      await expect(dialog().matches(':modal')).toBe(true);
      await expect(dialog()).toHaveAccessibleName('Projects');
      await waitFor(() => expect(Math.round(dialog().getBoundingClientRect().bottom)).toBe(window.innerHeight));
      await expect(Math.round(dialog().getBoundingClientRect().width)).toBe(document.documentElement.clientWidth);
    });

    await step('24 corners on top, the bottom square', async () => {
      const cs = getComputedStyle(dialog());
      await expect(cs.borderTopLeftRadius).toBe('24px');
      await expect(cs.borderTopRightRadius).toBe('24px');
      await expect(cs.borderBottomLeftRadius).toBe('0px');
      await expect(cs.borderBottomRightRadius).toBe('0px');
    });

    await step('the grab handle: 36 x 4, decorative', async () => {
      const handle = dialog().firstElementChild as HTMLElement;
      await expect(handle).toHaveAttribute('aria-hidden', 'true');
      const r = handle.getBoundingClientRect();
      await expect(Math.round(r.width)).toBe(36);
      await expect(Math.round(r.height)).toBe(4);
    });

    await step('Tab stays inside; Close is a 44 target', async () => {
      const close = within(dialog()).getByRole('button', { name: 'Close' });
      await expect(close.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
      for (let i = 0; i < 8; i++) {
        await userEvent.tab();
        await expect(dialog().contains(document.activeElement) || document.activeElement === document.body).toBe(true);
      }
    });

    await step('Esc closes it and focus returns to the trigger', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(dialog().open).toBe(false));
      await waitFor(() => expect(canvas.getByTestId('closes').textContent).toBe('1'));
      await expect(document.activeElement).toBe(trigger);
    });

    await step('the Close button closes it', async () => {
      await userEvent.click(trigger);
      await waitFor(() => expect(dialog().open).toBe(true));
      await userEvent.click(within(dialog()).getByRole('button', { name: 'Close' }));
      await waitFor(() => expect(dialog().open).toBe(false));
      await expect(document.activeElement).toBe(trigger);
    });
  },
};
