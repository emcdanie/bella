import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, waitFor } from 'storybook/test';
import FloatingPanel from './FloatingPanel';
import Button from '../Button/Button';
import ChatBubble from '../ChatBubble/ChatBubble';
import Input from '../Input/Input';
import ProgressRing from '../ProgressRing/ProgressRing';
import cssRaw from './FloatingPanel.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';
import reduceMotion from '../shared/reduceMotion';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['floating-panel']?.$extensions?.bella ?? {};

/* the approved sample: the Terminal's steps and composer, as the Drawer holds them */
const TerminalBody = () => {
  const [v, setV] = useState('');
  const row = (state: 'done' | 'running' | 'waiting', title: string, meta: string, extra?: { value: number; total: number }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-8)' }}>
      <ProgressRing state={state} size="sm" decorative {...extra} />
      <div>
        <div style={{ color: 'var(--color-content-default)' }}>{title}</div>
        <div data-bella-meta style={{ fontFamily: 'var(--typography-subtext-font-family)', fontSize: 'var(--typography-font-size-14)', lineHeight: 'var(--size-20)', color: 'var(--color-content-subtle)' }}>
          {meta}
        </div>
      </div>
    </div>
  );
  return (
    <>
      <ChatBubble side="sent" tail>
        Make the tag sit centred over the dashed line, on B.
      </ChatBubble>
      {row('done', 'Centred the Tag on the marker', 'Progress.tsx · 1 file')}
      {row('running', 'Running the gate', '3 of 5 checks', { value: 3, total: 5 })}
      {row('waiting', 'Show B before and after', 'Waiting')}
      <Input label="Ask" labelPosition="inline" value={v} onChange={setV} placeholder="Add a step, or ask what it is doing" />
    </>
  );
};

/* Stories start at the 16 edge the panel never goes inside: under a loaded full run the panel is sometimes pulled
 * to that edge by a transient resize, and a start at 40 then made its pictures differ run to run. */
const meta: Meta<typeof FloatingPanel> = {
  title: 'Components/Layout/FloatingPanel',
  component: FloatingPanel,
  /* the entrance lift is timing: every story renders under reduced motion, so its pictures are taken at rest */
  beforeEach: reduceMotion,
  parameters: {
    layout: 'fullscreen',
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    children: { control: false },
    onDock: { control: false },
    onClose: { control: false },
    onAction: { control: false },
    onMove: { control: false },
    defaultPosition: { control: false },
    className: { control: false },
    style: { control: false },
  },
  args: { title: 'Terminal', status: 'Working', actionLabel: 'Stop' },
};
export default meta;

type Story = StoryObj<typeof FloatingPanel>;

/** A page with a button that detaches the Terminal: opens with focus on the title bar, docks or closes with focus back on the button. */
const Page = (args: React.ComponentProps<typeof FloatingPanel> & { docked?: string[] }) => {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  return (
    <div style={{ minBlockSize: '100dvh', padding: 'var(--spacing-24)', background: 'var(--color-background-subtle)', color: 'var(--color-content-body)', boxSizing: 'border-box' }}>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Detach terminal
      </Button>
      <p data-testid="log" style={{ fontFamily: 'var(--typography-subtext-font-family)' }}>
        {log.join(',')}
      </p>
      {open ? (
        <FloatingPanel
          {...args}
          onDock={() => {
            setLog((l) => [...l, 'dock']);
            setOpen(false);
          }}
          onClose={() => {
            setLog((l) => [...l, 'close']);
            setOpen(false);
          }}
          onAction={() => setLog((l) => [...l, 'stop'])}
        >
          <TerminalBody />
        </FloatingPanel>
      ) : null}
    </div>
  );
};

/** The approved sample, open: title bar with grip, Terminal, Working, Stop, Dock and Close, and the drawer's content in the body. */
export const WithSampleContent: Story = {
  render: (args) => (
    <div style={{ minBlockSize: '100dvh', background: 'var(--color-background-subtle)' }}>
      <FloatingPanel {...args} defaultPosition={{ x: 16, y: 16 }} onDock={() => {}} onClose={() => {}}>
        <TerminalBody />
      </FloatingPanel>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const panel = canvasElement.querySelector('[data-bella-component="floating-panel"]') as HTMLElement;
    await step('a non-modal dialog named by its title, 400 wide, card corner', async () => {
      await expect(panel).toHaveAttribute('role', 'dialog');
      await expect(panel).toHaveAttribute('aria-modal', 'false');
      await expect(panel).toHaveAccessibleName('Terminal');
      await expect(Math.round(panel.getBoundingClientRect().width)).toBe(400);
    });
    await step('every control in the title bar is a 44 target with a name', async () => {
      for (const name of ['Stop', 'Dock Terminal', 'Close Terminal']) {
        const b = panel.querySelector(`button[aria-label="${name}"]`) ?? Array.from(panel.querySelectorAll('button')).find((x) => (x.textContent ?? '').startsWith(name));
        await expect(b).not.toBeNull();
        const r = (b as HTMLElement).getBoundingClientRect();
        await expect(Math.round(r.height)).toBeGreaterThanOrEqual(44);
        await expect(Math.round(r.width)).toBeGreaterThanOrEqual(44);
      }
    });
    await step('the title bar is focusable and says how to move it', async () => {
      const handle = panel.querySelector('[data-testid="floating-panel-handle"]') as HTMLElement;
      await expect(handle.tabIndex).toBe(0);
      await expect(handle).toHaveAccessibleDescription('Arrow keys move it, Esc docks it');
    });
  },
};

/** Arrow keys on the focused title bar move it 8 a press, Shift 40, and it never leaves the screen (16 from the edge). */
export const MovesWithArrowKeys: Story = {
  render: (args) => <Page {...args} />,
  play: async ({ canvasElement, step }) => {
    await userEvent.click(Array.from(canvasElement.querySelectorAll('button')).find((b) => (b.textContent ?? '').startsWith('Detach'))!);
    const panel = await waitFor(() => {
      const p = canvasElement.querySelector('[data-bella-component="floating-panel"]') as HTMLElement;
      expect(p).not.toBeNull();
      return p;
    });
    const handle = panel.querySelector('[data-testid="floating-panel-handle"]') as HTMLElement;
    await step('focus moves into the title bar on open', async () => {
      await waitFor(() => expect(document.activeElement).toBe(handle));
    });
    await step('Left moves it 8, Shift + Left moves it 40', async () => {
      const x0 = panel.getBoundingClientRect().left;
      await userEvent.keyboard('{ArrowLeft}');
      await waitFor(() => expect(Math.round(x0 - panel.getBoundingClientRect().left)).toBe(8));
      await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
      await waitFor(() => expect(Math.round(x0 - panel.getBoundingClientRect().left)).toBe(48));
    });
    await step('it is kept on screen: pushed past every edge it stops 16 in', async () => {
      for (let i = 0; i < 40; i++) await userEvent.keyboard('{Shift>}{ArrowLeft}{ArrowUp}{/Shift}');
      await waitFor(() => {
        const r = panel.getBoundingClientRect();
        expect(Math.round(r.left)).toBe(16);
        expect(Math.round(r.top)).toBe(16);
      });
      for (let i = 0; i < 80; i++) await userEvent.keyboard('{Shift>}{ArrowRight}{ArrowDown}{/Shift}');
      await waitFor(() => {
        const r = panel.getBoundingClientRect();
        expect(Math.round(window.innerWidth - r.right)).toBe(16);
        expect(Math.round(window.innerHeight - r.bottom)).toBe(16);
      });
    });
  },
};

/** Dragging the title bar moves it, and a drop past the edge stops 16 in. */
export const DragsByTheTitleBar: Story = {
  render: (args) => <Page {...args} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(Array.from(canvasElement.querySelectorAll('button')).find((b) => (b.textContent ?? '').startsWith('Detach'))!);
    const panel = await waitFor(() => {
      const p = canvasElement.querySelector('[data-bella-component="floating-panel"]') as HTMLElement;
      expect(p).not.toBeNull();
      return p;
    });
    const handle = panel.querySelector('[data-testid="floating-panel-handle"]') as HTMLElement;
    const r0 = panel.getBoundingClientRect();
    const h = handle.getBoundingClientRect();
    const sx = h.left + 10;
    const sy = h.top + 10;
    await fireEvent.pointerDown(handle, { clientX: sx, clientY: sy, button: 0, pointerId: 1 });
    await fireEvent.pointerMove(handle, { clientX: sx - 100, clientY: sy - 60, pointerId: 1 });
    await waitFor(() => expect(Math.round(r0.left - panel.getBoundingClientRect().left)).toBe(100));
    await fireEvent.pointerMove(handle, { clientX: -500, clientY: -500, pointerId: 1 });
    await fireEvent.pointerUp(handle, { pointerId: 1 });
    await waitFor(() => {
      const r = panel.getBoundingClientRect();
      expect(Math.round(r.left)).toBe(16);
      expect(Math.round(r.top)).toBe(16);
    });
  },
};

/** Esc docks it and focus goes back to the button that opened it; Close does the same. */
export const EscDocksAndReturnsFocus: Story = {
  render: (args) => <Page {...args} />,
  play: async ({ canvasElement, step }) => {
    const opener = Array.from(canvasElement.querySelectorAll('button')).find((b) => (b.textContent ?? '').startsWith('Detach'))! as HTMLElement;
    await userEvent.click(opener);
    await waitFor(() => expect(canvasElement.querySelector('[data-bella-component="floating-panel"]')).not.toBeNull());
    await step('Esc docks it', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(canvasElement.querySelector('[data-bella-component="floating-panel"]')).toBeNull());
      await expect(canvasElement.querySelector('[data-testid="log"]')).toHaveTextContent('dock');
    });
    await step('focus is back on the opener', async () => {
      await waitFor(() => expect(document.activeElement).toBe(opener));
    });
    await step('Close closes it and returns focus too; Stop only stops', async () => {
      await userEvent.click(opener);
      const panel = await waitFor(() => {
        const p = canvasElement.querySelector('[data-bella-component="floating-panel"]') as HTMLElement;
        expect(p).not.toBeNull();
        return p;
      });
      await userEvent.click(Array.from(panel.querySelectorAll('button')).find((b) => (b.textContent ?? '').startsWith('Stop'))!);
      await expect(canvasElement.querySelector('[data-testid="log"]')).toHaveTextContent('dock,stop');
      await expect(canvasElement.querySelector('[data-bella-component="floating-panel"]')).not.toBeNull();
      await userEvent.click(panel.querySelector('button[aria-label="Close Terminal"]')!);
      await waitFor(() => expect(canvasElement.querySelector('[data-bella-component="floating-panel"]')).toBeNull());
      await waitFor(() => expect(document.activeElement).toBe(opener));
      await expect(canvasElement.querySelector('[data-testid="log"]')).toHaveTextContent('dock,stop,close');
    });
  },
};

/** Without a status or an action the title bar keeps only the title, Dock and Close. */
export const TitleOnly: Story = {
  args: { status: undefined, actionLabel: undefined, title: 'Notes' },
  render: (args) => (
    <div style={{ minBlockSize: '100dvh', background: 'var(--color-background-subtle)' }}>
      <FloatingPanel {...args} defaultPosition={{ x: 16, y: 16 }} onDock={() => {}} onClose={() => {}}>
        <p style={{ margin: 0 }}>Nothing running.</p>
      </FloatingPanel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector('[data-bella-component="floating-panel"]') as HTMLElement;
    await expect(panel.querySelectorAll('button')).toHaveLength(2);
    await expect(panel.querySelector('[data-bella-component="status-dot"]')).toBeNull();
    await expect(panel).toHaveAccessibleName('Notes');
  },
};
