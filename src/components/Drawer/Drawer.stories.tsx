import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import Drawer from './Drawer';
import Button from '../Button/Button';
import NavList from '../NavList/NavList';
import drawerCssRaw from './Drawer.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((drawerCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const drawerContract = (componentContract as any).component?.drawer?.$extensions?.bella ?? {};

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: drawerContract.a11y },
  },
};
export default meta;

type Story = StoryObj<typeof Drawer>;

const GROUPS = [
  {
    label: 'Workspace',
    items: [
      { href: '#health', label: 'Health', current: true },
      { href: '#ask', label: 'Ask' },
      { href: '#specimen', label: 'Specimen' },
    ],
  },
];

function Harness({ startOpen = false, side }: { startOpen?: boolean; side?: 'left' | 'right' }) {
  const [open, setOpen] = useState(startOpen);
  const [closes, setCloses] = useState(0);
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-3)', justifyItems: 'start', minHeight: 'calc(var(--spacing-20) * 5)' }}>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open menu
      </Button>
      <span data-testid="closes">{closes}</span>
      <Drawer
        open={open}
        onClose={() => {
          setOpen(false);
          setCloses((n) => n + 1);
        }}
        label="CHIP"
        side={side}
      >
        <NavList label="Sections" groups={GROUPS} />
      </Drawer>
    </div>
  );
}

/** Closed: only the trigger. Open it to see the panel slide in over the scrim. */
export const Default: Story = {
  render: () => <Harness />,
};

/** Open: the raised panel at the left edge, a hairline edge, the scrim over the page. */
export const Open: Story = {
  render: () => <Harness startOpen />,
};

/** side="right": the same panel from the right edge, for a tool panel. */
export const Right: Story = {
  render: () => <Harness startOpen side="right" />,
};

/** Behavioral suite: a modal dialog named by its title; focus moves in and
 * stays in; Esc, Close and the scrim close it; focus returns to the trigger. */
export const Behavior: Story = {
  render: () => <Harness />,
  play: async ({ canvas, step }) => {
    const trigger = canvas.getByRole('button', { name: 'Open menu' });
    const dialog = () => document.querySelector('dialog[data-bella-component="drawer"]') as HTMLDialogElement;

    await step('opens as a modal dialog named by its title, focus inside', async () => {
      await userEvent.click(trigger);
      await waitFor(() => expect(dialog().open).toBe(true));
      expect(dialog().matches(':modal')).toBe(true);
      expect(dialog()).toHaveAccessibleName('CHIP');
      expect(dialog().contains(document.activeElement)).toBe(true);
    });

    await step('Tab stays inside the drawer', async () => {
      for (let i = 0; i < 6; i++) {
        await userEvent.tab();
        expect(dialog().contains(document.activeElement) || document.activeElement === document.body).toBe(true);
      }
    });

    await step('Esc closes it and focus returns to the trigger', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(dialog().open).toBe(false));
      expect(document.activeElement).toBe(trigger);
      expect(canvas.getByTestId('closes').textContent).toBe('1');
    });

    await step('the Close button closes it', async () => {
      await userEvent.click(trigger);
      await waitFor(() => expect(dialog().open).toBe(true));
      await userEvent.click(dialog().querySelector('button[data-bella-component="button"]')!);
      await waitFor(() => expect(dialog().open).toBe(false));
      expect(document.activeElement).toBe(trigger);
    });

    await step('a click on the scrim closes it', async () => {
      await userEvent.click(trigger);
      await waitFor(() => expect(dialog().open).toBe(true));
      dialog().dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await waitFor(() => expect(dialog().open).toBe(false));
    });
  },
};
