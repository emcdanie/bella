import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import Step, { StepDay, type StepState } from './Step';
import StatusDot from '../StatusDot/StatusDot';
import cssRaw from './Step.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.step?.$extensions?.bella ?? {};

/* The theme toolbar picks the theme (audit:visual shoots all four). */
const Themed = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: 'var(--spacing-24)',
      background: 'var(--color-background-surface)',
      borderRadius: 'var(--border-radius-12)',
      display: 'grid',
      gap: 'var(--spacing-24)',
    }}
  >
    {children}
  </div>
);

const ROW: React.CSSProperties = { display: 'flex', margin: 0, padding: 0 };
const LIST: React.CSSProperties = { display: 'flex', flexDirection: 'column', margin: 0, padding: 0, maxInlineSize: '30rem' };

const PIPE = [
  ['Trigger: Contrast check', 'Found 9 components with no pair.'],
  ['Claude runs the script', 'Added 9 pairs, one commit.'],
  ['The gate', '5 of 5 checks passed.'],
  ['You', 'Accept, or Undo.'],
] as const;

const Pipeline = ({ states }: { states: StepState[] }) => (
  <ol style={ROW}>
    {PIPE.map(([title, detail], i) => (
      <Step key={title} layout="horizontal" state={states[i]} title={title} detail={detail} showConnector={i < PIPE.length - 1} />
    ))}
  </ol>
);

const meta: Meta<typeof Step> = {
  title: 'Components/Data/Step',
  component: Step,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    state: { control: 'inline-radio' },
    layout: { control: 'inline-radio' },
    className: { control: false },
    style: { control: false },
    icon: { control: false },
    tag: { control: false },
  },
  args: { title: 'Draw the component', detail: 'Working now. Comes back to Ready with Accept or Undo.', state: 'current', layout: 'vertical', showConnector: true, showLineAbove: false, selected: false },
  render: (args) => (
    <ol style={args.layout === 'horizontal' ? { ...ROW, maxInlineSize: '16rem' } : LIST}>
      <Step {...args} />
    </ol>
  ),
};
export default meta;

type Story = StoryObj<typeof Step>;

export const Playground: Story = {};

/** The "Not again" step row in each page state: suggested, running, your call, kept. */
export const Horizontal: Story = {
  render: () => (
    <Themed>
      <Pipeline states={['pending', 'pending', 'pending', 'pending']} />
      <Pipeline states={['done', 'current', 'pending', 'pending']} />
      <Pipeline states={['done', 'done', 'done', 'current']} />
      <Pipeline states={['done', 'done', 'done', 'done']} />
    </Themed>
  ),
  play: async ({ canvasElement, step }) => {
    await step('horizontal: 12 on every side, the connector stops 12 short (21 Nov publish)', async () => {
      const row = canvasElement.querySelector('li [class*="row"]') as HTMLElement;
      const cs = getComputedStyle(row);
      await expect([cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft]).toEqual(['12px', '12px', '12px', '12px']);
    });
  },
};

/** Vertical activity list (History): line above / connector join row to row, the state word, time, selected. */
export const Vertical: Story = {
  render: () => (
    <Themed>
      <ol style={LIST}>
        <Step state="done" title="Pairs added" detail="9 pairs, one commit." tag="Done" time="10:02" />
        <Step state="current" showLineAbove title="The gate" detail="Working now." tag="Now" time="10:04" />
        <Step state="pending" showLineAbove showConnector={false} title="You" detail="Accept, or Undo." time="10:05" />
      </ol>
      <ol style={LIST}>
        <Step state="done" selected title="Selected · done" detail="Opens its record." time="09:40" onSelect={() => {}} />
        <Step state="current" selected showLineAbove title="Selected · current" detail="Opens its record." time="09:41" onSelect={() => {}} />
        <Step state="pending" selected showLineAbove showConnector={false} title="Selected · pending" detail="Opens its record." time="09:42" onSelect={() => {}} />
      </ol>
    </Themed>
  ),
  play: async ({ canvasElement, step }) => {
    await step('the current step\'s line is solid, a pending one dashed (21 Nov publish)', async () => {
      const current = canvasElement.querySelector('li[aria-current="step"]') as HTMLElement;
      const line = current.querySelector('[data-bella-component="map-line"]') as HTMLElement;
      await expect(line.getAttribute('data-variant') ?? line.className).not.toMatch(/dash/);
    });
  }
};

/** History row: the whole row is a button, aria-pressed follows selected. */
export const Behavior: Story = {
  render: () => {
    const Demo = () => {
      const [sel, setSel] = useState(false);
      return (
        <ol style={LIST}>
          <Step state="done" title="Pairs added" detail="9 pairs, one commit." selected={sel} onSelect={() => setSel(!sel)} />
        </ol>
      );
    };
    return <Demo />;
  },
  play: async ({ canvas, step }) => {
    await step('row is one button, toggles pressed', async () => {
      const btn = canvas.getByRole('button');
      expect(btn).toHaveAttribute('aria-pressed', 'false');
      await userEvent.click(btn);
      expect(btn).toHaveAttribute('aria-pressed', 'true');
    });
  },
};

/** Figma 20 Nov: Show number (Not again's four steps): done = check, current = the number in a ring, pending = the number. Step day heads a day with the line running through; a hidden tag keeps the row height. */
export const NumbersAndDays: Story = {
  render: () => (
    <ol style={{ margin: 0, padding: 0, inlineSize: 'calc(var(--spacing-48) * 8)', background: 'var(--color-background-surface)' }}>
      <StepDay>14 Nov</StepDay>
      <Step number={1} state="done" title="Name the gap" showLineAbove time="09:40" />
      <Step number={2} state="done" title="Draw the part" tag="Done" showLineAbove time="09:58" />
      <StepDay>15 Nov</StepDay>
      <Step number={3} state="current" title="Check it on the stage" detail="Working now." showLineAbove time="10:02" />
      <Step number={4} state="pending" title="Ship it" showLineAbove showConnector={false} />
    </ol>
  ),
};

/** History kinds (CHIP History flow, 21 Nov): one deeper wash per kind with an
 * ink glyph, so the list is not all green; green only for Merged. */
export const HistoryKinds: Story = {
  render: () => (
    <ol style={{ margin: 0, padding: 0, inlineSize: 'calc(var(--spacing-48) * 12)', background: 'var(--color-background-surface)' }}>
      <StepDay>18 Nov</StepDay>
      <Step kind="tokens" title="tokens: Foundations export, Lexend, parts on role font tokens" detail="Re-exported from the published Foundations." showLineAbove time="21:33" />
      <StepDay>9 Nov</StepDay>
      <Step kind="code" title="DSDS lists every component with code" detail="Button: ariaHaspopup for a button that opens a dialog." showLineAbove time="14:34" />
      <StepDay>8 Nov</StepDay>
      <Step kind="visual" title="brand: shared look is the default" detail="The default now matches what both products share." showLineAbove time="14:58" />
      <Step kind="fix" title="Review fixes for the chat parts" detail="Tails and meta on the bubbles." showLineAbove time="10:20" />
      <Step kind="docs" title="Rules: Figma first, code follows" detail="Docs" showLineAbove time="10:24" />
      <Step kind="tooling" title="Save the week's work before backup" detail="Tooling" showLineAbove time="10:28" />
      <Step kind="decision" title="History kinds get ink glyphs" detail="Decision" showLineAbove time="10:30" />
      <Step kind="merged" title="Merge chip/fix-llms-txt" tag="Merged" showLineAbove showConnector={false} time="10:36" />
    </ol>
  ),
};

/** Title line (22 Nov, her pick B): the title at 600 with the time beside
 * it after a dot, the state's dot and word on the right edge. A long title wraps and
 * takes the dot and time with it; timeUnderTitle puts the time on its own
 * line. Time is a meta line: Geist Mono 14 on a 20 line. */
export const TimeUnderTitle: Story = {
  render: () => (
    <Themed>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-24)', alignItems: 'flex-start' }}>
        <ol style={{ ...LIST, inlineSize: 'calc(var(--spacing-80) * 6)' }} data-testid="wide">
          <Step state="done" title="Pairs added" detail="9 pairs, one commit." time="10:02" tag="Done" showConnector={false} />
        </ol>
        <ol style={{ ...LIST, inlineSize: 'calc(var(--spacing-80) * 3.5)' }} data-testid="narrow">
          <Step state="done" title="Merge the reading fixes" detail="9 pairs, one commit." time="10:02" showConnector={false} />
        </ol>
        <ol style={{ ...LIST, inlineSize: 'calc(var(--spacing-80) * 6)' }} data-testid="forced">
          <Step state="current" timeUnderTitle title="The gate" detail="Working now." time="10:04" showConnector={false} />
        </ol>
      </div>
    </Themed>
  ),
  play: async ({ canvas, step }) => {
    const times = (list: HTMLElement) => Array.from(list.querySelectorAll<HTMLElement>('[data-bella-meta]:not([aria-hidden])'));
    await step('wide: the time is on the title line, after the title; the state dot and word are on the right edge', async () => {
      const wide = canvas.getByTestId('wide');
      const [t] = times(wide);
      const titleBox = canvas.getByText('Pairs added').getBoundingClientRect();
      await expect(t.getBoundingClientRect().left).toBeGreaterThan(titleBox.right);
      await expect(Math.abs(t.getBoundingClientRect().bottom - titleBox.bottom)).toBeLessThanOrEqual(4);
      const tag = within(wide).getByText('Done').closest('[data-bella-component="status-dot"]') as HTMLElement;
      const row = wide.querySelector('li')!.getBoundingClientRect();
      await expect(tag.getBoundingClientRect().left).toBeGreaterThan(t.getBoundingClientRect().right);
      await expect(row.right - tag.getBoundingClientRect().right).toBeLessThanOrEqual(13);
    });
    await step('narrow: the time is shown once and never squeezes the title', async () => {
      const ts = times(canvas.getByTestId('narrow'));
      await expect(ts).toHaveLength(1);
      await expect(ts[0].getBoundingClientRect().width).toBeGreaterThan(0);
    });
    await step('forced: under the title at any width', async () => {
      const ts = times(canvas.getByTestId('forced'));
      await expect(ts).toHaveLength(1);
      await expect(ts[0].getBoundingClientRect().top).toBeGreaterThanOrEqual(canvas.getByText('The gate').getBoundingClientRect().bottom - 1);
    });
    await step('meta line 14 on 20 in the subtext face; title 600', async () => {
      const t = times(canvas.getByTestId('wide'))[0];
      await expect(getComputedStyle(t).fontSize).toBe('14px');
      await expect(getComputedStyle(t).lineHeight).toBe('20px');
      await expect(getComputedStyle(canvas.getByText('The gate')).fontWeight).toBe('600');
    });
  },
};

/** state=failed (22 Nov, Figma audit): a step that ran and did not pass, such as a failed gate. The
 * danger Icon well with the Xmark, title and detail in ink, no working tint. A long title wraps between
 * words and never truncates; her B title line stays (title 600, "· time" after it, the state word on the right). */
export const Failed: Story = {
  render: () => (
    <Themed>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-24)', alignItems: 'flex-start' }}>
        <ol style={{ ...LIST, inlineSize: 'calc(var(--spacing-80) * 3.5)' }} data-testid="vertical">
          <Step state="done" title="Undone: Give agents BELLA's component list (llms.txt)" detail="Reverted by decided10:02" />
          <Step state="current" showLineAbove title="The gate" detail="Gate: 4 of 5 passed. Colour contrast failed." time="10:02" />
          <Step state="failed" showLineAbove title="The gate failed on main" detail="Gate: 4 of 5 passed. Colour contrast failed." time="10:02" />
          <Step state="pending" showLineAbove showConnector={false} title="Publish BellaComponents" detail="Waiting on you" time="10:02" />
        </ol>
        <ol style={ROW} data-testid="horizontal">
          <Step layout="horizontal" state="failed" title="The gate" detail="Colour contrast failed." showConnector={false} />
        </ol>
      </div>
    </Themed>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    const failed = canvas.getByText('The gate failed on main').closest('li') as HTMLElement;
    await step('the marker is the error Icon well with the Xmark', async () => {
      const well = failed.querySelector<HTMLElement>('[data-bella-component="icon-well"]')!;
      await expect(well).toBeInTheDocument();
      await expect(well.className).toMatch(/error/);
    });
    await step('title and detail in ink, no working tint', async () => {
      const ink = getComputedStyle(canvas.getByText('The gate failed on main')).color;
      const detail = failed.querySelector<HTMLElement>('[class*="detail"]')!;
      await expect(getComputedStyle(detail).color).toBe(ink);
      const row = failed.querySelector<HTMLElement>('[class*="row"]')!;
      await expect(getComputedStyle(row).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      await expect(failed).not.toHaveAttribute('aria-current');
    });
    await step('a long title wraps between words, never cut', async () => {
      const title = canvas.getByText("Undone: Give agents BELLA's component list (llms.txt)");
      await expect(title.scrollWidth).toBeLessThanOrEqual(title.clientWidth);
      await expect(getComputedStyle(title).textOverflow).not.toBe('ellipsis');
      await expect(title.getBoundingClientRect().height).toBeGreaterThan(24);
      const range = document.createRange();
      range.selectNodeContents(title);
      const lines = new Set(Array.from(range.getClientRects()).map((r) => Math.round(r.top)));
      await expect(lines.size).toBeGreaterThan(1);
    });
    await step('horizontal failed: Xmark well, no connector', async () => {
      const h = canvasElement.querySelector('[data-testid="horizontal"] li') as HTMLElement;
      await expect(h.querySelector('[data-bella-component="icon-well"]')!.className).toMatch(/error/);
    });
  },
};

/** The current marker is ProgressRing (running, md); a numbered step keeps the numbered ring (22 Nov). */
export const CurrentIsTheRing: Story = {
  render: () => (
    <Themed>
      <ol style={LIST}>
        <Step state="done" title="Pairs added" detail="9 pairs, one commit." />
        <Step state="current" showLineAbove title="The gate" detail="Working now." />
      </ol>
      <ol style={LIST}>
        <Step state="current" number={3} title="Numbered step" detail="Keeps the numbered ring." showConnector={false} />
      </ol>
    </Themed>
  ),
  play: async ({ canvasElement, step }) => {
    const items = canvasElement.querySelectorAll<HTMLElement>('li[aria-current="step"]');
    await step('current uses ProgressRing running md, 36 wide, hidden from screen readers', async () => {
      const ring = items[0].querySelector('[data-bella-component="progress-ring"]') as HTMLElement;
      await expect(ring).toHaveAttribute('data-state', 'running');
      await expect(ring).toHaveAttribute('data-size', 'md');
      await expect(ring.getBoundingClientRect().width).toBe(36);
      await expect(ring).toHaveAttribute('aria-hidden', 'true');
    });
    await step('number set keeps the numbered ring', async () => {
      await expect(items[1].querySelector('[data-bella-component="progress-ring"]')).toBeNull();
      await expect(items[1]).toHaveTextContent('3');
    });
  },
};

/** The state's word (25 Nov, CHIP "One status mark: the status dot"): pass the
 * word as `tag` and Step draws it as BELLA's StatusDot in the state's tone,
 * never an outlined Tag. A plan's steps: Done, Now, Left; a failed run: Failed. A status with its own
 * tone passes its own StatusDot. */
export const StateWord: Story = {
  render: () => (
    <Themed>
      <ol style={LIST} data-testid="plan">
        <Step number={1} state="done" title="Read the drift report" tag="Done" />
        <Step number={2} state="current" selected showLineAbove title="Fix the nine parts" tag="Now" />
        <Step number={3} state="pending" showLineAbove title="Run the gate" tag="Left" />
        <Step number={4} state="failed" showLineAbove title="Publish" tag="Failed" />
        <Step state="done" showLineAbove showConnector={false} title="A record on a branch" tag={<StatusDot tone="attention" label="On a branch" />} />
      </ol>
    </Themed>
  ),
  play: async ({ canvas, step }) => {
    const plan = canvas.getByTestId('plan');
    await step('each state word is a StatusDot with its word, no Tag', async () => {
      await expect(plan.querySelectorAll('[data-bella-component="tag"]')).toHaveLength(0);
      const dots = plan.querySelectorAll<HTMLElement>('[data-bella-component="status-dot"]');
      await expect(dots).toHaveLength(5);
      await expect(Array.from(dots).map((d) => d.textContent)).toEqual(['Done', 'Now', 'Left', 'Failed', 'On a branch']);
    });
    await step('the dot takes the state tone: done success, current info, pending neutral, failed danger', async () => {
      const tones = Array.from(plan.querySelectorAll<HTMLElement>('[data-bella-component="status-dot"]')).map((d) => d.className);
      await expect(tones[0]).toMatch(/success/);
      await expect(tones[1]).toMatch(/info/);
      await expect(tones[2]).toMatch(/neutral/);
      await expect(tones[3]).toMatch(/danger/);
    });
    await step('a StatusDot passed as the tag is drawn as given, with its own tone', async () => {
      const tones = Array.from(plan.querySelectorAll<HTMLElement>('[data-bella-component="status-dot"]')).map((d) => d.className);
      await expect(tones[4]).toMatch(/attention/);
    });
  },
};
