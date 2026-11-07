import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import PageOutline from './PageOutline';
import cssRaw from './PageOutline.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['page-outline']?.$extensions?.bella ?? {};

const items = [
  { id: 'outline-about', label: 'About' },
  { id: 'outline-usage', label: 'Usage' },
  { id: 'outline-states', label: 'States', level: 3 as const },
  { id: 'outline-code', label: 'Code' },
];

const meta: Meta<typeof PageOutline> = {
  title: 'Components/PageOutline',
  component: PageOutline,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: { items: { control: false }, onNavigate: { control: false }, className: { control: false } },
  args: { items },
};
export default meta;

type Story = StoryObj<typeof PageOutline>;

const Page = (args: any) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 'var(--spacing-6)', alignItems: 'start' }}>
    <div style={{ display: 'grid', gap: 'var(--spacing-4)', color: 'var(--color-semantic-text-body)' }}>
      {items.map((it) => (
        <section key={it.id} aria-labelledby={it.id}>
          <h2 id={it.id} style={{ margin: 0, fontSize: 'var(--typography-font-size-lg)', color: 'var(--color-semantic-text-primary)' }}>
            {it.label}
          </h2>
          <p style={{ margin: 0 }}>A section of the page.</p>
        </section>
      ))}
    </div>
    <PageOutline {...args} />
  </div>
);

/** At rest, a marker of lines; opened, a list to jump. Esc closes and returns focus. */
export const Default: Story = {
  render: Page,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const toggle = c.getByRole('button', { name: /On this page/ });
    await expect(toggle.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await expect(toggle.getAttribute('aria-expanded')).toBe('false');
    await userEvent.click(toggle);
    await expect(toggle.getAttribute('aria-expanded')).toBe('true');
    await expect(c.getAllByRole('link')).toHaveLength(4);
    await userEvent.keyboard('{Escape}');
    await expect(toggle.getAttribute('aria-expanded')).toBe('false');
  },
};
