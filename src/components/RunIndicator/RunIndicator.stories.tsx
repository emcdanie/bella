import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import RunIndicator from './RunIndicator';
import cssRaw from './RunIndicator.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();
const contract = (componentContract as any).component?.['run-indicator']?.$extensions?.bella ?? {};
const THEMES = ['chip-light', 'chip-dark'] as const;

const Themed = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
    {THEMES.map((theme) => (
      <div key={theme} data-theme={theme} style={{ padding: 'var(--spacing-20)', background: 'var(--color-background-default)', borderRadius: 'var(--border-radius-12)', display: 'flex', gap: 'var(--spacing-16)', flexWrap: 'wrap', alignItems: 'center' }}>
        {children}
      </div>
    ))}
  </div>
);

const meta: Meta<typeof RunIndicator> = {
  title: 'Components/Data/RunIndicator',
  component: RunIndicator,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens, a11y: contract.a11y } },
  argTypes: { state: { control: 'inline-radio' }, className: { control: false }, style: { control: false }, onOpen: { control: false } },
  args: { state: 'running', title: "Fix CheckRow's drift", stepDone: 2, stepTotal: 7, elapsed: '2:41' },
};
export default meta;
type Story = StoryObj<typeof RunIndicator>;

export const Playground: Story = {};

/** All four states in Chip light and Chip dark. */
export const AllStates: Story = {
  render: () => (
    <Themed>
      <RunIndicator state="idle" />
      <RunIndicator state="running" title="Fix CheckRow's drift" stepDone={2} stepTotal={7} elapsed="2:41" />
      <RunIndicator state="running" count={3} />
      <RunIndicator state="done" title="Fix CheckRow" />
      <RunIndicator state="failed" title="Run all 6 audits" />
    </Themed>
  ),
};

/** The pill opens the list of runs and says whether it is open. */
export const Behavior: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return <RunIndicator state="running" title="Fix CheckRow's drift" stepDone={2} stepTotal={7} elapsed="2:41" onOpen={() => setOpen((o) => !o)} expanded={open} />;
  },
  play: async ({ canvas, step }) => {
    const pill = canvas.getByRole('button', { name: /1 session running: Fix CheckRow's drift, Step 3 of 7, 2:41 so far/ });
    await step('named by the whole sentence, closed', async () => {
      await expect(pill).toHaveAttribute('aria-expanded', 'false');
    });
    await step('a click opens', async () => {
      await userEvent.click(pill);
      await expect(pill).toHaveAttribute('aria-expanded', 'true');
    });
  },
};

/** At the app pane's width (685) and narrower the count's words stay whole; only the title shortens (25 Nov). */
export const NarrowKeepsTheCount: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
      {[42.8, 30, 24].map((rem) => (
        <div key={rem} style={{ inlineSize: `${rem}rem`, display: 'flex' }} data-testid={`w${rem}`}>
          <RunIndicator state="running" count={1} title="Fix CheckRow's drift across every part" stepDone={2} stepTotal={7} elapsed="2:41" onOpen={() => {}} />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    await step('"1 session running" is never cut; only the title gives way', async () => {
      for (const head of Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-bella-text] > span:first-child'))) {
        await expect(head.textContent).toBe('1 session running');
        await expect(head.scrollWidth).toBeLessThanOrEqual(head.clientWidth + 1);
        const pill = head.closest('[data-bella-component="run-indicator"]') as HTMLElement;
        await expect(pill.getBoundingClientRect().right).toBeLessThanOrEqual(pill.parentElement!.getBoundingClientRect().right + 1);
      }
    });
  },
};
