import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import IconRail from './IconRail';
import NavItem from '../NavItem/NavItem';
import BrandWordmark from '../BrandWordmark/BrandWordmark';
import cssRaw from './IconRail.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['icon-rail']?.$extensions?.bella ?? {};


const meta: Meta<typeof IconRail> = {
  title: 'Components/Layout/IconRail',
  component: IconRail,
  parameters: {
    layout: 'fullscreen',
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: { children: { control: false }, end: { control: false }, logo: { control: false }, className: { control: false }, style: { control: false } },
};
export default meta;

type Story = StoryObj<typeof IconRail>;

/* Story stand-ins: the registry has no Home or Settings glyph yet, so
   ViewGrid and MoreHoriz hold those places here. */
const Places = () => (
  <>
    <NavItem iconOnly label="Home" icon="Home" />
    <NavItem iconOnly label="Projects" icon="Folder" current />
    <NavItem iconOnly label="Not again" icon="Book" />
    <NavItem iconOnly label="Team" icon="Group" />
    <NavItem iconOnly label="System map" icon="Map" />
  </>
);

/** The rail in the template's 72 column (story frame only). One rail, one
 * "Main" landmark; the theme toolbar picks the theme (audit:visual shoots all four). */
export const Default: Story = {
  render: () => (
    <div style={{ inlineSize: 72, blockSize: 640, background: 'var(--color-background-default)' }}>
      <IconRail end={<NavItem iconOnly label="Settings" icon="Settings" />}>
        <Places />
      </IconRail>
    </div>
  ),
};

/** Behavior: one navigation landmark, the CHIP mark named once, every place named by its label. */
export const Behavior: Story = {
  render: () => (
    <div style={{ inlineSize: 72, blockSize: 640 }}>
      <IconRail end={<NavItem iconOnly label="Settings" icon="Settings" />}>
        <Places />
      </IconRail>
    </div>
  ),
  play: async ({ canvas }) => {
    expect(canvas.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(canvas.getAllByRole('img', { name: 'CHIP' })).toHaveLength(1);
    for (const name of ['Home', 'Projects', 'Not again', 'Team', 'System map', 'Settings']) {
      expect(canvas.getByRole('button', { name })).toBeInTheDocument();
    }
  },
};

/** logo (CHIP, 24 Nov 2026): the whole CHIP logotype at the top, in the rail's width less 8 a side, where CHIP's rule
 * is the logotype, never the mark alone. Still one CHIP image, named once. */
export const WithLogotype: Story = {
  render: () => (
    <div style={{ inlineSize: 72, blockSize: 640, background: 'var(--color-background-default)' }}>
      <IconRail
        logo={<span style={{ display: 'block', inlineSize: 'calc(var(--spacing-48) + var(--spacing-8))' }}><BrandWordmark word="CHIP" variant="logotype" size="full-bleed" /></span>}
        end={<NavItem iconOnly label="Settings" icon="Settings" />}
      >
        <Places />
      </IconRail>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    expect(canvas.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    const logo = canvasElement.querySelector('[data-bella-component="icon-rail"] > span') as HTMLElement;
    expect(Math.round(logo.getBoundingClientRect().width)).toBeLessThanOrEqual(72);
    expect(canvasElement.querySelectorAll('[data-bella-logotype]')).toHaveLength(1);
  },
};
