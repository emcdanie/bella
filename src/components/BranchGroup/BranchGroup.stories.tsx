import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import BranchGroup from './BranchGroup';
import MapLeaf from '../MapLeaf/MapLeaf';
import cssRaw from './BranchGroup.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['branch-group']?.$extensions?.bella ?? {};

const meta: Meta<typeof BranchGroup> = {
  title: 'Components/Data/BranchGroup',
  component: BranchGroup,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens, a11y: contract.a11y } },
  argTypes: { hue: { control: 'inline-radio' }, onToggle: { control: false }, children: { control: false }, className: { control: false }, style: { control: false } },
  args: { name: 'Sources', count: 2, hue: 'pink', open: false },
};
export default meta;
type Story = StoryObj<typeof BranchGroup>;

export const Playground: Story = {};

const Steps = () => (
  <>
    <MapLeaf name="Tokens" state="ok" status="Healthy" detail="407 CSS variables" />
    <MapLeaf name="Figma" state="attention" status="Needs you" detail="0 of 3 paths live" />
  </>
);

/** Stages on a phone: one open at a time, a plus or minus at the right, a colour bar at the left. */
export const OneOpenAtATime: Story = {
  render: () => {
    const [open, setOpen] = useState(0);
    const names = [['Sources', 'pink'], ['Checks', 'navy'], ['Gate', 'ochre'], ['Ship', 'stone']] as const;
    return (
      <div style={{ inlineSize: '20rem', display: 'grid', gap: 'var(--spacing-8)', padding: 'var(--spacing-16)' }}>
        {names.map(([n, hue], i) => (
          <BranchGroup key={n} name={n} hue={hue} count={2} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)}>
            <Steps />
          </BranchGroup>
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const heads = () => Array.from(canvasElement.querySelectorAll<HTMLButtonElement>('[data-bella-component="branch-group"] > button'));
    await expect(heads()[0]).toHaveAttribute('aria-expanded', 'true');
    await expect(canvasElement.querySelectorAll('[data-bella-component="map-leaf"]')).toHaveLength(2);
    await userEvent.click(heads()[1]);
    await expect(heads()[0]).toHaveAttribute('aria-expanded', 'false');
    await expect(heads()[1]).toHaveAttribute('aria-expanded', 'true');
    await expect(canvasElement.querySelectorAll('[data-bella-component="map-leaf"]')).toHaveLength(2);
    await expect(heads()[0].getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    await expect(getComputedStyle(canvasElement.querySelector('[data-bella-component="branch-group"]')!).borderInlineStartWidth).toBe('4px');
  },
};
