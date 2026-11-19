import React, { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import Menu, { MenuItem, MenuDivider } from './Menu';
import Button from '../Button/Button';
import cssRaw from './Menu.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.menu?.$extensions?.bella ?? {};

/** Figma's example: the actions on one task card. */
const Items = () => (
  <>
    <MenuItem icon="Eye" label="Open" />
    <MenuItem icon="Copy" label="Copy link" />
    <MenuItem icon="ArrowRight" label="Move to lane" />
    <MenuDivider />
    <MenuItem icon="XmarkCircle" label="Remove from board" tone="danger" />
  </>
);

const meta: Meta<typeof Menu> = {
  title: 'Components/Actions/Menu',
  component: Menu,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    className: { control: false },
    style: { control: false },
    children: { control: false },
    onClose: { control: false },
  },
  args: { label: 'Actions for Figma check', autoFocus: false },
  render: (args) => (
    <div style={{ padding: 'var(--spacing-24)', background: 'var(--color-background-default)', display: 'flex' }}>
      <Menu {...args} style={{ inlineSize: 'calc(var(--spacing-80) * 3)' }}>
        <Items />
      </Menu>
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof Menu>;

export const Playground: Story = {};

/** Opens from a "…" button; Esc closes and focus goes back to the button. */
function Opener() {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLDivElement>(null);
  const close = () => {
    setOpen(false);
    btn.current?.querySelector('button')?.focus();
  };
  return (
    <div style={{ padding: 'var(--spacing-24)', display: 'grid', gap: 'var(--spacing-8)', justifyItems: 'start' }}>
      <div ref={btn}>
        <Button variant="secondary" iconOnly icon="MoreHoriz" ariaLabel="More actions" onClick={() => setOpen(true)} />
      </div>
      {open ? (
        <Menu label="More actions" onClose={close} style={{ inlineSize: 'calc(var(--spacing-80) * 3)' }}>
          <Items />
        </Menu>
      ) : null}
    </div>
  );
}

export const Behavior: Story = {
  render: () => <Opener />,
  play: async ({ canvas, step }) => {
    const trigger = canvas.getByRole('button', { name: 'More actions' });
    await step('opens with focus on the first item', async () => {
      await userEvent.click(trigger);
      await expect(canvas.getByRole('menu', { name: 'More actions' })).toBeVisible();
      await expect(canvas.getByRole('menuitem', { name: 'Open' })).toHaveFocus();
    });
    await step('arrows move, End jumps to the last', async () => {
      await userEvent.keyboard('{ArrowDown}');
      await expect(canvas.getByRole('menuitem', { name: 'Copy link' })).toHaveFocus();
      await userEvent.keyboard('{End}');
      await expect(canvas.getByRole('menuitem', { name: 'Remove from board' })).toHaveFocus();
      await userEvent.keyboard('{ArrowDown}');
      await expect(canvas.getByRole('menuitem', { name: 'Open' })).toHaveFocus();
    });
    await step('every item is 44 tall', async () => {
      for (const item of canvas.getAllByRole('menuitem')) {
        await expect(item.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
      }
    });
    await step('Esc closes and focus returns to the button', async () => {
      await userEvent.keyboard('{Escape}');
      await expect(canvas.queryByRole('menu')).toBeNull();
      await expect(trigger).toHaveFocus();
    });
  },
};
