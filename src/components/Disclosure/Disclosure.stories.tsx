import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import Disclosure from './Disclosure';
import cssRaw from './Disclosure.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();
const contract = (componentContract as any).component?.disclosure?.$extensions?.bella ?? {};

const meta: Meta<typeof Disclosure> = {
  title: 'Components/Disclosure',
  component: Disclosure,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  args: { title: 'Checks', summary: '5 of 5 pass', children: <p style={{ margin: 0 }}>Contrast, contract parity, story and docs, DSDS entry, touch target.</p> },
  decorators: [(S) => <div style={{ maxWidth: 360 }}><S /></div>],
};
export default meta;

type Story = StoryObj<typeof Disclosure>;

/** Closed: the summary still says something. */
export const Default: Story = {};

/** Open on first render. */
export const Open: Story = { args: { defaultOpen: true } };

/** A stack of sections, as on the Atlas Facts card. */
export const Stack: Story = {
  render: () => (
    <div>
      <Disclosure title="Facts" summary="3 variants · 44px min" defaultOpen>
        <p style={{ margin: 0 }}>Variants: primary, secondary, tertiary.</p>
      </Disclosure>
      <Disclosure title="Checks" summary="5 of 5 pass">
        <p style={{ margin: 0 }}>Every check passes.</p>
      </Disclosure>
      <Disclosure title="Did you know">
        <p style={{ margin: 0 }}>One job per state.</p>
      </Disclosure>
      <Disclosure title="Tokens" summary="48">
        <p style={{ margin: 0 }}>--component-button-min-height</p>
      </Disclosure>
    </div>
  ),
};

/** Behavioral suite: native details, 44px header, mouse and keyboard toggle. */
export const Behavior: Story = {
  args: { title: 'Notes', summary: '2 notes', children: <p style={{ margin: 0 }}>Hidden until opened.</p> },
  play: async ({ canvasElement, canvas, step }) => {
    const details = canvasElement.querySelector('details') as HTMLDetailsElement;
    const summary = details.querySelector('summary') as HTMLElement;
    await step('a native details, closed, with a 44px header row', async () => {
      expect(details.open).toBe(false);
      expect(summary.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
      expect(canvas.getByText('2 notes')).toBeVisible();
    });
    await step('a click anywhere on the header opens it', async () => {
      await userEvent.click(canvas.getByText('2 notes'));
      expect(details.open).toBe(true);
      expect(canvas.getByText('Hidden until opened.')).toBeVisible();
    });
    await step('keyboard: the header is in the tab order and takes focus (the browser toggles a summary on Enter and Space)', async () => {
      // the browser puts a summary in the tab order (tabIndex 0) and focuses it
      expect(summary.tabIndex).toBe(0);
      summary.focus();
      expect(document.activeElement).toBe(summary);
    });
    await step('a second click closes it', async () => {
      await userEvent.click(summary);
      expect(details.open).toBe(false);
    });
  },
};
