import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import TopBar from './TopBar';
import SearchField from '../SearchField/SearchField';
import Button from '../Button/Button';
import Avatar from '../Avatar/Avatar';
import Tooltip from '../Tooltip/Tooltip';
import cssRaw from './TopBar.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['top-bar']?.$extensions?.bella ?? {};

const meta: Meta<typeof TopBar> = {
  title: 'Components/Layout/TopBar',
  component: TopBar,
  parameters: {
    layout: 'fullscreen',
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  args: { placeParent: 'CHIP', placeCurrent: 'Work', showPlace: true, placeParentHref: '#chip' },
  argTypes: {
    search: { control: false },
    right: { control: false },
    onPlaceParent: { control: false },
    className: { control: false },
    style: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof TopBar>;

/* The published Top bar (Figma 1168:95226): Place, then Search field, Notifications and the Avatar */
const Bar = (props: React.ComponentProps<typeof TopBar>) => (
  <TopBar
    {...props}
    search={<SearchField />}
    right={
      <>
        <Tooltip label="Notifications">
          <Button variant="tertiary" size="md" iconOnly icon="Bell" ariaLabel="Notifications" />
        </Tooltip>
        <Avatar size="sm" name="Dara" src="/avatars/dara.png" />
      </>
    }
  />
);

/** "CHIP › Work" on the left; search beside the bell on the right, over the page ground, in the toolbar theme (the visual audit shoots every theme). */
export const Default: Story = {
  render: (args) => (
    <div style={{ background: 'var(--color-background-default)', paddingBlockEnd: 'var(--spacing-24)' }}>
      <Bar {...args} />
    </div>
  ),
};

/** Show place off: the right group alone, still at the right edge. */
export const NoPlace: Story = {
  args: { showPlace: false },
  render: Default.render,
};

/** Behavior: 68 tall; Place is a breadcrumb nav with the current page marked; search is a search landmark
 * on the right, beside the bell, no wider than 420; Tab runs parent, search, bell; 44 targets. */
export const Behavior: Story = {
  render: (args) => <Bar {...args} />,
  play: async ({ canvasElement, step }) => {
    const c = within(canvasElement);
    const bar = canvasElement.querySelector('[data-bella-component="top-bar"]') as HTMLElement;

    await step('68 tall', async () => {
      await expect(Math.round(bar.getBoundingClientRect().height)).toBe(68);
    });

    await step('Place: a breadcrumb, the parent a link, the current page marked', async () => {
      const crumb = c.getByRole('navigation', { name: 'Breadcrumb' });
      const current = within(crumb).getByText('Work');
      await expect(current).toHaveAttribute('aria-current', 'page');
      await expect(Number(getComputedStyle(current).fontWeight)).toBe(600);
      await expect(within(crumb).getByRole('link', { name: 'CHIP' })).toBeInTheDocument();
      await expect(crumb.textContent).toContain('›');
    });

    await step('search sits on the right, before the bell, at most 420 wide', async () => {
      const search = c.getByRole('search');
      const bell = c.getByRole('button', { name: 'Notifications' });
      const crumb = c.getByRole('navigation', { name: 'Breadcrumb' });
      await expect(search.getBoundingClientRect().left).toBeGreaterThan(crumb.getBoundingClientRect().right);
      await expect(search.getBoundingClientRect().right).toBeLessThan(bell.getBoundingClientRect().left);
      await expect(Math.round(search.getBoundingClientRect().width)).toBeLessThanOrEqual(420);
    });

    await step('Tab order: parent, search, bell; each a 44 target', async () => {
      (document.activeElement as HTMLElement | null)?.blur();
      const link = c.getByRole('link', { name: 'CHIP' });
      const box = c.getByRole('searchbox');
      const bell = c.getByRole('button', { name: 'Notifications' });
      for (const el of [link, box, bell]) {
        await userEvent.tab();
        await expect(document.activeElement).toBe(el);
      }
      await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
      await expect(bell.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    });
  },
};
