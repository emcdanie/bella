import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Kbd from './Kbd';
import kbdCssRaw from './Kbd.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((kbdCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const kbdContract = (componentContract as any).component?.kbd?.$extensions?.bella ?? {};

const meta: Meta<typeof Kbd> = {
  title: 'Components/Kbd',
  component: Kbd,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: kbdContract.a11y },
  },
  argTypes: {
    keys: { control: false },
    label: { control: 'text' },
    className: { control: false },
  },
  args: { keys: ['⌘', 'K'], label: 'Command K' },
};
export default meta;

type Story = StoryObj<typeof Kbd>;

/** One combination: symbol keys carry a spoken label. */
export const Default: Story = {};

/** A shortcut legend, the shape CHIP's help menu uses, on the panel surface. */
export const Legend: Story = {
  render: () => (
    <dl
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 'var(--spacing-3) var(--spacing-5)',
        alignItems: 'center',
        margin: 0,
        maxWidth: 420,
        padding: 'var(--spacing-5)',
        background: 'var(--color-semantic-surface-card)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {[
        [['⌘', 'K'], 'Command K', 'Search'],
        [['⌘', '\\'], 'Command backslash', 'Hide or show the sidebar'],
        [['⌥', '1'], 'Option 1', 'First workspace'],
        [['Esc'], undefined, 'Close'],
      ].map(([keys, label, what]) => (
        <React.Fragment key={what as string}>
          <dt>
            <Kbd keys={keys as string[]} label={label as string | undefined} />
          </dt>
          <dd style={{ margin: 0 }}>{what as string}</dd>
        </React.Fragment>
      ))}
    </dl>
  ),
};

/** Not a control: no role, no tab stop. A label replaces symbol glyphs in the tree. */
export const Behavior: Story = {
  render: () => (
    <p style={{ margin: 0 }}>
      Press <Kbd keys={['⌘', 'K']} label="Command K" /> or <Kbd keys={['Esc']} />.
    </p>
  ),
  play: async ({ canvasElement, step }) => {
    const [labelled, plain] = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="kbd"]')
    );

    await step('semantic kbd, never focusable or a button', async () => {
      expect(labelled.tagName).toBe('KBD');
      expect(labelled.querySelectorAll('button, [tabindex]')).toHaveLength(0);
    });

    await step('a labelled combo hides its glyphs and reads the label', async () => {
      expect(labelled.querySelector('[aria-hidden="true"]')?.textContent).toBe('⌘K');
      expect(labelled.textContent).toContain('Command K');
    });

    await step('an unlabelled combo reads its keys as written', async () => {
      expect(plain.querySelector('[aria-hidden="true"]')).toBeNull();
      expect(plain.textContent).toBe('Esc');
    });

    await step('Mono at the 16px floor (type lock)', async () => {
      const cs = getComputedStyle(labelled.querySelector('kbd kbd') as HTMLElement);
      expect(parseFloat(cs.fontSize)).toBe(16);
    });
  },
};
