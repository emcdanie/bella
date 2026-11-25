import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import Link from './Link';
import linkCssRaw from './Link.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((linkCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const linkContract = (componentContract as any).component?.link?.$extensions?.bella ?? {};

const meta: Meta<typeof Link> = {
  title: 'Components/Actions/Link',
  component: Link,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: linkContract.a11y },
  },
  args: { href: '#case', children: 'Read the case' },
};
export default meta;
type Story = StoryObj<typeof Link>;

/** Ink with an underline. */
export const Default: Story = {};

/** Inside body copy, where it lives. */
export const InBody: Story = {
  render: () => (
    <p style={{ maxWidth: '60ch', fontSize: 'var(--typography-body-default-font-size)' }}>
      The system started as <Link href="#drift">a side project</Link>, then moved to every product
      team. The <Link href="https://github.com/emcdanie/bella" external>source is on GitHub</Link>.
    </p>
  ),
};

/** The states the contract names: default, hover, visited, focus. Link has
 * no active, disabled or error state; a link that cannot be followed is not
 * a link. */
export const StateMatrix: Story = {
  render: () => (
    <table style={{ borderCollapse: 'collapse' }}>
      <tbody>
        {[
          ['default', 'ink, 1px underline'],
          ['hover', 'ink, 2px underline'],
          ['visited', 'ink (no colour change)'],
          ['focus', '4px focus ring, 4px offset'],
          ['active / disabled / error', 'not a Link state'],
        ].map(([state, note]) => (
          <tr key={state}>
            <td style={{ padding: 'var(--spacing-12) var(--spacing-20) var(--spacing-12) 0', fontFamily: 'var(--typography-font-family-geist-mono)', fontSize: 'var(--typography-font-size-16)', color: 'var(--color-content-body)' }}>
              {state}
            </td>
            <td style={{ padding: 'var(--spacing-12) var(--spacing-20) var(--spacing-12) 0' }}>
              {state.includes('/') ? 'n/a' : <Link href={`#${state}`}>Read the case</Link>}
            </td>
            <td style={{ padding: 'var(--spacing-12) 0', color: 'var(--color-content-body)', fontSize: 'var(--typography-font-size-18)' }}>
              {note}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

export const Behavior: Story = {
  play: async ({ canvas, step }) => {
    const link = canvas.getByRole('link', { name: 'Read the case' });
    await step('ink with a 1px underline at rest', async () => {
      const cs = getComputedStyle(link);
      await expect(cs.textDecorationLine).toContain('underline');
      await expect(parseFloat(cs.textDecorationThickness)).toBe(1);
    });
    /* hover is verified with a real pointer outside the play function:
       userEvent.hover dispatches synthetic events, which never trigger CSS
       :hover, so an assertion here could not fail honestly */
    await step('keyboard focus draws the focus-ring token (4px, 4px offset)', async () => {
      await userEvent.tab();
      const cs = getComputedStyle(link);
      await expect(cs.outlineStyle).toBe('solid');
      await expect(parseFloat(cs.outlineWidth)).toBe(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--focus-ring-width')));
      await expect(parseFloat(cs.outlineOffset)).toBe(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--focus-ring-offset')));
    });
  },
};
