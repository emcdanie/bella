import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import SectionNav from './SectionNav';
import cssRaw from './SectionNav.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['section-nav']?.$extensions?.bella ?? {};

const items = [
  { href: '#today', label: 'Today' },
  { href: '#components', label: 'Components', current: true },
  { href: '#foundations', label: 'Foundations' },
  { href: '#playground', label: 'Playground' },
  { href: '#projects', label: 'Projects' },
  { href: '#history', label: 'History' },
  { href: '#health', label: 'Health' },
];

const meta: Meta<typeof SectionNav> = {
  title: 'Components/SectionNav',
  component: SectionNav,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: { items: { control: false }, onNavigate: { control: false }, className: { control: false } },
  args: { items, label: 'Sections' },
};
export default meta;

type Story = StoryObj<typeof SectionNav>;

/** The top bar's sections: the current one by weight and a line, every link a 44px target. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole('navigation', { name: 'Sections' });
    const links = within(nav).getAllByRole('link');
    await expect(links).toHaveLength(7);
    await expect(links[1].getAttribute('aria-current')).toBe('page');
    for (const l of links) await expect(l.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  },
};
