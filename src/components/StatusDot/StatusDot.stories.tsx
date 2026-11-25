import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import Button from '../Button/Button';
import StatusDot from './StatusDot';
import cssRaw from './StatusDot.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['status-dot']?.$extensions?.bella ?? {};

const THEMES = ['chip-light', 'chip-dark'] as const;

/** One surface per Chip theme; dark comes from the token modes, never a variant. */
const Themed = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
    {THEMES.map((theme) => (
      <div
        key={theme}
        data-theme={theme}
        style={{
          padding: 'var(--spacing-20)',
          background: 'var(--color-background-surface)',
          borderRadius: 'var(--border-radius-12)',
          display: 'flex',
          gap: 'var(--spacing-16)',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {children}
      </div>
    ))}
  </div>
);

const meta: Meta<typeof StatusDot> = {
  title: 'Components/Data/StatusDot',
  component: StatusDot,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    tone: { control: 'inline-radio' },
    mark: { control: 'inline-radio' },
    label: { control: 'text' },
    className: { control: false },
    style: { control: false },
  },
  args: { label: 'Done', tone: 'success', mark: 'dot', showLabel: true, showDot: true, showWash: true },
};
export default meta;

type Story = StoryObj<typeof StatusDot>;

export const Playground: Story = {};

const TONES = [
  ['success', 'Done'],
  ['info', 'In progress'],
  ['attention', 'For review'],
  ['danger', 'Broken'],
  ['neutral', 'Not started'],
] as const;

/** Every tone, with wash and bare, plus the check mark, in Chip light and Chip dark. */
export const AllTones: Story = {
  render: () => (
    <Themed>
      {TONES.map(([tone, word]) => (
        <StatusDot key={tone} tone={tone} label={word} />
      ))}
      {TONES.map(([tone, word]) => (
        <StatusDot key={`bare-${tone}`} tone={tone} label={word} showWash={false} />
      ))}
      <StatusDot tone="success" mark="check" label="Passed" />
      <StatusDot tone="danger" label="Dot only" showLabel={false} />
    </Themed>
  ),
};

/** Not a control; the word stays the accessible name when hidden. */
export const Behavior: Story = {
  render: () => <StatusDot tone="danger" label="Broken" showLabel={false} />,
  play: async ({ canvas, step }) => {
    await step('non-interactive, word still readable by assistive tech', async () => {
      expect(canvas.queryAllByRole('button')).toHaveLength(0);
      expect(canvas.getByText('Broken')).toBeInTheDocument();
    });
  },
};

function ChangeDemo() {
  const [passing, setPassing] = React.useState(false);
  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-24)', alignItems: 'center', padding: 'var(--spacing-24)' }}>
      <StatusDot tone={passing ? 'success' : 'danger'} label={passing ? 'Passing' : 'Failing'} />
      <Button variant="secondary" size="sm" onClick={() => setPassing((p) => !p)}>
        Change status
      </Button>
    </div>
  );
}

/** A status change (rule "Motion that shows what happened", item 7): the colour fades to the new tone
 * and the halo grows out once. Nothing moves on first paint. Reduced motion: the new colour at once. */
export const StatusChange: Story = {
  render: () => <ChangeDemo />,
  play: async ({ canvasElement, canvas, step }) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pulse = () => canvasElement.querySelector('[data-bella-pulse]') as HTMLElement | null;
    await step('first paint: no ring', async () => {
      await expect(pulse()).toBeNull();
    });
    await step(reduced ? 'reduced motion: the new word and colour, no ring' : 'a change grows the halo once', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Change status' }));
      await expect(canvas.getByText('Passing')).toBeInTheDocument();
      if (reduced) return;
      const p = pulse()!;
      await expect(getComputedStyle(p).animationName).toMatch(/haloGrow/);
      await expect(getComputedStyle(p).animationIterationCount).toBe('1');
      await Promise.all(p.getAnimations().map((a) => a.finished));
      await waitFor(() => expect(Number(getComputedStyle(p).opacity)).toBe(0));
    });
  },
};
