import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import CodeBlock from './CodeBlock';
import cssRaw from './CodeBlock.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();
const contract = (componentContract as any).component?.['code-block']?.$extensions?.bella ?? {};

const meta: Meta<typeof CodeBlock> = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens, a11y: contract.a11y } },
  argTypes: { className: { control: false } },
  args: {
    title: 'Copy me',
    language: 'jsx',
    currentLine: 3,
    code: "import { Button } from 'bella';\n\n<Button variant=\"primary\" onClick={save}>Save changes</Button>\n// one primary per view: the rest are secondary\n<Button variant=\"secondary\">Cancel</Button>",
  },
};
export default meta;

type Story = StoryObj<typeof CodeBlock>;

/** JSX with a marked line, line numbers and Copy. */
export const Jsx: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: 'Copy Copy me' }).getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await expect(canvasElement.querySelectorAll('code > span').length).toBe(5);
  },
};

/** A diff: + and − lead each changed line, and a wash marks it too. */
export const Diff: Story = {
  args: {
    title: 'tokens/semantic/chip.json',
    language: 'diff',
    currentLine: undefined,
    code: ' "page-outline": {\n-  "line-current": "{color.semantic.text-primary}"\n+  "line-current": "{color.chip-ui.action-deep}"\n }',
  },
};

/** A long line wraps instead of scrolling sideways. */
export const LongLine: Story = {
  args: {
    title: 'Narrow frame',
    language: 'json',
    currentLine: undefined,
    code: '{ "description": "Buttons with real hierarchy: two colour treatments, three tiers, one primary per view. Labels are 16px, sentence case." }',
  },
  render: (args) => (
    <div style={{ maxWidth: 'calc(var(--spacing-20) * 4)' }}>
      <CodeBlock {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const pre = canvasElement.querySelector('pre') as HTMLElement;
    await expect(pre.scrollWidth).toBeLessThanOrEqual(pre.clientWidth);
  },
};
