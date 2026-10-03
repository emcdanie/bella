import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Columns from './Columns';
import Card from '../Card/Card';
import cssRaw from './Columns.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();
const contract = (componentContract as any).component?.columns?.$extensions?.bella ?? {};

const cell = (text: string, extra?: string) => (
  <Card key={text}>
    <p style={{ margin: 0 }}>{text}</p>
    {extra ? <p style={{ margin: 0 }}>{extra}</p> : null}
  </Card>
);

const meta: Meta<typeof Columns> = {
  title: 'Components/Columns',
  component: Columns,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  args: { count: 2, children: [cell('3 variants', 'primary, secondary, tertiary'), cell('One job per state')] },
};
export default meta;

type Story = StoryObj<typeof Columns>;

/** Two even columns; the shorter card stretches to the row. */
export const Default: Story = {};

/** Three columns from 1200px of its own width. */
export const Three: Story = {
  args: { count: 3, children: [cell('Components', '28'), cell('Story coverage', '93%'), cell('Gate', 'Green')] },
};

/** A stage beside its facts: 2 to 1. */
export const WideStart: Story = {
  args: { split: 'wide-start', children: [cell('The specimen'), cell('Facts')] },
};

/** Behavioral suite: cards in a row line up; three collapse to two, then one. */
export const Behavior: Story = {
  render: () => (
    <div>
      <div data-testid="w1240" style={{ width: 1240 }}>
        <Columns count={3}>{[cell('A', 'two lines'), cell('B'), cell('C')]}</Columns>
      </div>
      <div data-testid="w900" style={{ width: 900 }}>
        <Columns count={3}>{[cell('A'), cell('B'), cell('C')]}</Columns>
      </div>
      <div data-testid="w360" style={{ width: 360 }}>
        <Columns count={3}>{[cell('A'), cell('B'), cell('C')]}</Columns>
      </div>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const cols = (id: string) => {
      const cards = [...canvasElement.querySelectorAll(`[data-testid=${id}] [data-bella-component=card]`)] as HTMLElement[];
      return new Set(cards.map((c) => Math.round(c.getBoundingClientRect().left))).size;
    };
    await step('1240px: three columns, and the row lines up top and bottom', async () => {
      expect(cols('w1240')).toBe(3);
      const cards = [...canvasElement.querySelectorAll('[data-testid=w1240] [data-bella-component=card]')] as HTMLElement[];
      const bottoms = new Set(cards.map((c) => Math.round(c.getBoundingClientRect().bottom)));
      expect(bottoms.size).toBe(1);
    });
    await step('900px: two columns', async () => expect(cols('w900')).toBe(2));
    await step('360px: one column', async () => expect(cols('w360')).toBe(1));
  },
};
