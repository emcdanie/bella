import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import Link from './Link';

const meta: Meta<typeof Link> = {
  title: 'Components/Link',
  component: Link,
  args: { href: '#case', children: 'Read the case' },
};
export default meta;
type Story = StoryObj<typeof Link>;

/** Ink with an underline. */
export const Default: Story = {};

/** Inside body copy, where it lives. */
export const InBody: Story = {
  render: () => (
    <p style={{ maxWidth: '60ch', fontSize: 'var(--typography-font-size-body)' }}>
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
          ['focus', '3px ochre ring, 3px offset'],
          ['active / disabled / error', 'not a Link state'],
        ].map(([state, note]) => (
          <tr key={state}>
            <td style={{ padding: 'var(--spacing-3) var(--spacing-5) var(--spacing-3) 0', fontFamily: 'var(--typography-font-family-mono)', fontSize: 'var(--typography-font-size-mono)', color: 'var(--color-semantic-text-secondary)' }}>
              {state}
            </td>
            <td style={{ padding: 'var(--spacing-3) var(--spacing-5) var(--spacing-3) 0' }}>
              {state.includes('/') ? 'n/a' : <Link href={`#${state}`}>Read the case</Link>}
            </td>
            <td style={{ padding: 'var(--spacing-3) 0', color: 'var(--color-semantic-text-secondary)', fontSize: 'var(--typography-font-size-sm)' }}>
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
    await step('keyboard focus draws the 3px ring with a 3px offset', async () => {
      await userEvent.tab();
      const cs = getComputedStyle(link);
      await expect(cs.outlineStyle).toBe('solid');
      await expect(parseFloat(cs.outlineWidth)).toBe(3);
      await expect(parseFloat(cs.outlineOffset)).toBe(3);
    });
  },
};
