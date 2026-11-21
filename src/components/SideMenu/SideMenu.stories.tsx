import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import SideMenu, { type SideMenuItem } from './SideMenu';
import cssRaw from './SideMenu.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['side-menu']?.$extensions?.bella ?? {};

/* The published Side menu's content (Figma 1709:48082) */
const ITEMS: SideMenuItem[] = [
  { label: 'Search', icon: 'Search' },
  { label: 'Home', href: '#home', icon: 'Home' },
  { label: 'Needs you', href: '#needs-you', icon: 'Bell', badge: 3, current: true },
  { label: 'Not again', href: '#not-again', icon: 'ViewGrid' },
];
const PINNED: SideMenuItem[] = [
  { label: 'Components', href: '#components', icon: 'ViewGrid' },
  { label: 'System map', href: '#system-map', icon: 'Map' },
];
const PROJECTS: SideMenuItem[] = [
  { label: 'CHIP', href: '#chip' },
  { label: 'Site', href: '#site' },
  { label: 'BELLA', href: '#bella' },
];
const FOOT: SideMenuItem[] = [
  { label: 'Team', href: '#team', icon: 'Group' },
  { label: 'Settings', href: '#settings', icon: 'Settings' },
];

const meta: Meta<typeof SideMenu> = {
  title: 'Components/Layout/SideMenu',
  component: SideMenu,
  parameters: {
    layout: 'fullscreen',
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  args: { items: ITEMS, pinned: PINNED, projects: PROJECTS, foot: FOOT, showPinned: true, showProjects: true },
  argTypes: {
    items: { control: false },
    pinned: { control: false },
    projects: { control: false },
    foot: { control: false },
    onNavigate: { control: false },
    onClientClick: { control: false },
    className: { control: false },
    style: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof SideMenu>;

/* the Figma frame is 840 tall: ten 80 steps and a 40 */
const HEIGHT = 'calc(var(--spacing-80) * 10 + var(--spacing-40))';

const Column = (props: React.ComponentProps<typeof SideMenu>) => (
  <div style={{ blockSize: HEIGHT, display: 'flex' }}>
    <SideMenu {...props} />
  </div>
);

/** The published Side menu over the page ground, in the toolbar theme (the visual audit shoots every theme): the plain switcher, Go to,
 * Pinned, Projects, and Team and Settings at the foot. "Needs you" is the page you are on: bold ink, no fill. */
export const Default: Story = {
  render: (args) => (
    <div style={{ background: 'var(--color-background-default)', paddingInlineEnd: 'var(--spacing-32)' }}>
      <Column {...args} />
    </div>
  ),
};

/** Show pinned and Show projects off: Go to, then the foot. */
export const GroupsOff: Story = {
  args: { showPinned: false, showProjects: false },
  render: (args) => (
    <div style={{ background: 'var(--color-background-default)', paddingInlineEnd: 'var(--spacing-32)' }}>
      <Column {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryAllByText('Pinned')).toHaveLength(0);
    await expect(c.queryAllByText('Projects')).toHaveLength(0);
    await expect(c.getByRole('link', { name: 'Team' })).toBeInTheDocument();
  },
};

/** Behavior: a nav landmark named "Main" with lists; the current row is aria-current="page", bold with no
 * fill; Tab runs top to bottom; every row is a 44 target; labels never break; the foot sits at the bottom. */
export const Behavior: Story = {
  render: (args) => (
    <div style={{ background: 'var(--color-background-default)', paddingInlineEnd: 'var(--spacing-32)' }}>
      <Column {...args} />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const c = within(canvasElement);
    const menu = canvasElement.querySelector('[data-bella-component="side-menu"]') as HTMLElement;
    const nav = c.getByRole('navigation', { name: 'Main' });

    await step('232 wide, a nav landmark with labelled lists', async () => {
      await expect(Math.round(menu.getBoundingClientRect().width)).toBe(232);
      await expect(within(nav).getByRole('list', { name: 'Pinned' })).toBeInTheDocument();
      await expect(within(nav).getByRole('list', { name: 'Projects' })).toBeInTheDocument();
    });

    await step('the current page: aria-current, bold ink on the selected light blue in Chip', async () => {
      const current = c.getByRole('link', { name: /Needs you/ });
      await expect(current).toHaveAttribute('aria-current', 'page');
      const root = document.documentElement;
      const was = root.getAttribute('data-theme');
      root.setAttribute('data-theme', 'chip-light');
      try {
        await expect(Number(getComputedStyle(current).fontWeight)).toBeGreaterThanOrEqual(600);
        // after the 150 hover/fill transition settles
        // no fill is the Chip rule; BELLA's own theme keeps its brand fill
        // Chip: the selected light blue, like a selected tab (22 Nov)
        await waitFor(() => expect(getComputedStyle(current).backgroundColor).not.toMatch(/, 0\)$|transparent/));
      } finally {
        if (was) root.setAttribute('data-theme', was);
        else root.removeAttribute('data-theme');
      }
      await expect(canvasElement.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    });

    await step('Tab order runs top to bottom', async () => {
      const order = [/^Switch client: ?BELLA$/, /^Search$/, /^Home$/, /^Needs you ?3$/, /^Not again$/, /^Components$/, /^System map$/, /^CHIP$/, /^Site$/, /^BELLA$/, /^Team$/, /^Settings$/];
      (document.activeElement as HTMLElement | null)?.blur();
      for (const name of order) {
        await userEvent.tab();
        await expect(document.activeElement).toHaveAccessibleName(name);
      }
    });

    await step('every row is a 44 target and every label sits on one line', async () => {
      for (const el of Array.from(menu.querySelectorAll<HTMLElement>('[data-bella-component="nav-item"]'))) {
        // 44 exactly: a label on two lines (2 x 24) would make the row 48
        await expect(Math.round(el.getBoundingClientRect().height)).toBe(44);
      }
    });

    await step('group labels are 16, never smaller', async () => {
      const lbl = c.getByText('Pinned');
      await expect(getComputedStyle(lbl).fontSize).toBe('16px');
    });

    await step('Team and Settings sit at the bottom', async () => {
      const settings = c.getByRole('link', { name: 'Settings' }).getBoundingClientRect();
      const m = menu.getBoundingClientRect();
      await expect(Math.round(m.bottom - settings.bottom)).toBe(24);
    });
  },
};
