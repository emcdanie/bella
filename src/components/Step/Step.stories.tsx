import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import Step, { StepDay, type StepState } from './Step';
import Tag from '../Tag/Tag';
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
};

/** Vertical activity list (History): line above / connector join row to row, tag, time, selected. */
export const Vertical: Story = {
  render: () => (
    <Themed>
      <ol style={LIST}>
        <Step state="done" title="Pairs added" detail="9 pairs, one commit." tag={<Tag tone="success">Merged</Tag>} time="10:02" />
        <Step state="current" showLineAbove title="The gate" detail="Working now." tag={<Tag tone="attention">Waiting</Tag>} time="10:04" />
        <Step state="pending" showLineAbove showConnector={false} title="You" detail="Accept, or Undo." time="10:05" />
      </ol>
      <ol style={LIST}>
        <Step state="done" selected title="Selected · done" detail="Opens its record." time="09:40" onSelect={() => {}} />
        <Step state="current" selected showLineAbove title="Selected · current" detail="Opens its record." time="09:41" onSelect={() => {}} />
        <Step state="pending" selected showLineAbove showConnector={false} title="Selected · pending" detail="Opens its record." time="09:42" onSelect={() => {}} />
      </ol>
    </Themed>
  ),
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
      <Step number={2} state="done" title="Draw the part" tag={<Tag tone="success">Merged</Tag>} showLineAbove time="09:58" />
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
      <Step kind="merged" title="Merge chip/fix-llms-txt" tag={<Tag tone="success">Merged</Tag>} showLineAbove showConnector={false} time="10:36" />
    </ol>
  ),
};
