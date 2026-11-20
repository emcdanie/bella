import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import CodeBlock from './CodeBlock';
import cssRaw from './CodeBlock.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();
const contract = (componentContract as any).component?.['code-block']?.$extensions?.bella ?? {};

const meta: Meta<typeof CodeBlock> = {
  title: 'Components/Data/CodeBlock',
  component: CodeBlock,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens, a11y: contract.a11y } },
  argTypes: { className: { control: false } },
  args: {
    title: 'Copy me',
    language: 'jsx',
    code: "import { Button } from 'bella';\n\n<Button variant=\"primary\" onClick={save}>Save changes</Button>\n// one primary per view: the rest are secondary\n<Button variant=\"secondary\">Cancel</Button>",
  },
};
export default meta;

type Story = StoryObj<typeof CodeBlock>;

/** JSX with line numbers and Copy. */
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
    title: 'tokens/figma/semantic/chip-light.json',
    language: 'diff',
    code: ' "page-outline": {\n-  "line-current": "{color.semantic.text-primary}"\n+  "line-current": "{color.chip-ui.action-deep}"\n }',
  },
};

/** A long line wraps instead of scrolling sideways. */
export const LongLine: Story = {
  args: {
    title: 'Narrow frame',
    language: 'json',
    code: '{ "description": "Buttons with real hierarchy: two colour treatments, three tiers, one primary per view. Labels are 16px, sentence case." }',
  },
  render: (args) => (
    <div style={{ maxWidth: 'calc(var(--spacing-80) * 4)' }}>
      <CodeBlock {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const pre = canvasElement.querySelector('pre') as HTMLElement;
    await expect(pre.scrollWidth).toBeLessThanOrEqual(pre.clientWidth);
  },
};

/** Line marks (Figma Code line 483:31): kind=current is the line being read, a grey wash; kind=lit is
 * the line a Tour step points at, a 2px focus-blue outline with the red Pin whose number matches the step. */
export const LineMarks: Story = {
  args: {
    title: 'Button.module.css',
    language: 'css',
    code: '.button {\n  min-height: var(--spacing-44);\n  border-radius: var(--border-radius-lg);\n  outline-offset: var(--focus-ring-offset);\n}',
    lineMarks: [
      { line: 2, kind: 'current' },
      { line: 4, kind: 'lit', pin: '01' },
    ],
  },
  play: async ({ canvasElement }) => {
    const lit = canvasElement.querySelector('[data-kind="lit"]') as HTMLElement;
    const plain = canvasElement.querySelectorAll('code > span')[0] as HTMLElement;
    await expect(canvasElement.querySelector('[data-kind="current"]')).not.toBeNull();
    // 36 tall: the 32 Pin plus the 2px outline above and below
    await expect(Math.round(lit.getBoundingClientRect().height)).toBe(36);
    // the lit line's text keeps the same left edge as the other lines
    const textLeft = (el: HTMLElement) => (el.children[1] as HTMLElement).getBoundingClientRect().left;
    await expect(textLeft(lit)).toBe(textLeft(plain));
    // the pin is read as words
    await expect(lit.textContent).toContain('step 01');
  },
};
