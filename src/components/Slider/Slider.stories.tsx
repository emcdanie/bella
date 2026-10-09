import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import Slider, { type SliderProps } from './Slider';
import cssRaw from './Slider.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();
const contract = (componentContract as any).component?.slider?.$extensions?.bella ?? {};

function Live(props: Omit<SliderProps, 'value' | 'onChange'> & { start: number }) {
  const { start, ...rest } = props;
  const [v, setV] = useState(start);
  return (
    <div style={{ maxWidth: 420 }}>
      <Slider {...rest} value={v} onChange={setV} />
      <span data-testid="value" hidden>
        {v}
      </span>
    </div>
  );
}

const meta: Meta<typeof Slider> = {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
};
export default meta;

type Story = StoryObj<typeof Slider>;

/** A tunable number with its value beside it. */
export const Default: Story = {
  render: () => <Live label="Padding" unit="px" min={8} max={32} start={20} />,
};

/** Marks where a rule lives: min height, under BELLA's 44px floor. */
export const WithMarks: Story = {
  render: () => (
    <Live
      label="Min height"
      unit="px"
      min={16}
      max={64}
      start={40}
      marks={[
        { value: 24, label: 'WCAG 2.5.8' },
        { value: 44, label: 'BELLA floor' },
      ]}
      hint="Was 44px in the contract."
    />
  ),
};

/** The disabled state: the track, thumb and field are all inert. */
export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Slider label="Padding" unit="px" min={8} max={32} value={20} onChange={() => {}} disabled />
    </div>
  ),
};

/** Behavioral suite: 44px target, arrow keys, the unit read out, the value field in sync. */
export const Behavior: Story = {
  render: () => <Live label="Ring width" unit="px" min={1} max={6} start={3} marks={[{ value: 2, label: 'visible minimum' }]} />,
  play: async ({ canvas, canvasElement, step }) => {
    const range = canvas.getByRole('slider', { name: 'Ring width' }) as HTMLInputElement;
    const field = canvas.getByRole('spinbutton', { name: 'Ring width, value in px' }) as HTMLInputElement;
    await step('a native range, labelled, at least 44px tall, value read out with its unit', async () => {
      expect(range.type).toBe('range');
      expect(range.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
      expect(range.getAttribute('aria-valuetext')).toBe('3px');
      expect(range.getAttribute('aria-describedby')).toBeTruthy();
    });
    await step('the browser moves a native range on arrow keys; a change moves the field with it', async () => {
      range.focus();
      expect(document.activeElement).toBe(range);
      // synthetic key events do not run the browser's range default, so set the value the way a key press does
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(range, '2');
      range.dispatchEvent(new Event('input', { bubbles: true }));
      expect(canvasElement.querySelector('[data-testid=value]')?.textContent).toBe('2');
      expect(field.value).toBe('2');
      expect(range.getAttribute('aria-valuetext')).toBe('2px');
    });
    await step('typing in the field moves the slider, clamped to the range', async () => {
      await userEvent.clear(field);
      await userEvent.type(field, '9');
      expect(range.value).toBe('6');
    });
  },
};
