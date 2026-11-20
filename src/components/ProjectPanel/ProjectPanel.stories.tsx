import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import ProjectPanel from './ProjectPanel';
import ClientSwitcher from '../ClientSwitcher/ClientSwitcher';
import TreeItem from '../TreeItem/TreeItem';
import Drawer from '../Drawer/Drawer';
import cssRaw from './ProjectPanel.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['project-panel']?.$extensions?.bella ?? {};

const meta: Meta<typeof ProjectPanel> = {
  title: 'Components/Layout/ProjectPanel',
  component: ProjectPanel,
  parameters: {
    layout: 'fullscreen',
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: { switcher: { control: false }, projects: { control: false }, status: { control: false }, className: { control: false }, style: { control: false } },
};
export default meta;

type Story = StoryObj<typeof ProjectPanel>;

/** The template's content, as Figma fills it. */
const Filled = () => (
  <ProjectPanel
    switcher={<ClientSwitcher name="BELLA" caption="Design system" />}
    projects={
      <>
        <TreeItem kind="folder" label="CHIP" open current />
        <TreeItem kind="branch" label="main" status="passed" />
        <TreeItem kind="branch" label="chip/theme" status="working" />
        <TreeItem kind="branch" label="chip-button-page" status="waiting" />
        <TreeItem kind="branch" label="fix-llms-txt" status="failed" lineBelow={false} />
        <TreeItem kind="folder" label="BELLA" />
        <TreeItem kind="folder" label="elleta.design" />
      </>
    }
    status={
      <>
        <TreeItem kind="status" label="Needs you" tone="attention" count={4} />
        <TreeItem kind="status" label="Claude" tone="info" count={2} />
        <TreeItem kind="status" label="Gate" tone="neutral" count={1} />
        <TreeItem kind="status" label="Ready" tone="success" count={3} />
      </>
    }
  />
);

/** In the template's 264 column (story frame only). One panel, one landmark;
 * the theme toolbar picks the theme (audit:visual shoots all four). */
export const Default: Story = {
  render: () => (
    <div style={{ inlineSize: 264, blockSize: 780, background: 'var(--color-background-surface)' }}>
      <Filled />
    </div>
  ),
};

/** Behavior: one complementary landmark, two labelled sections. */
export const Behavior: Story = {
  render: () => (
    <div style={{ inlineSize: 264, blockSize: 780 }}>
      <Filled />
    </div>
  ),
  play: async ({ canvas }) => {
    expect(canvas.getByRole('complementary', { name: 'Projects and status' })).toBeInTheDocument();
    expect(canvas.getByRole('region', { name: 'Projects' })).toBeInTheDocument();
    expect(canvas.getByRole('region', { name: 'Status' })).toBeInTheDocument();
  },
};

/** flush in the phone Projects drawer (21 Nov: "this is broken.."): no grey box inside the white
 * drawer, "Projects" said once (the drawer's title), the plain one-line client switcher on top. */
export const InDrawer: Story = {
  render: () => (
    <Drawer open onClose={() => {}} label="Projects">
      <ProjectPanel
        flush
        switcher={<ClientSwitcher variant="plain" name="BELLA" />}
        projects={
          <>
            <TreeItem kind="folder" label="CHIP" open current />
            <TreeItem kind="branch" label="main" status="passed" />
            <TreeItem kind="branch" label="fix-llms-txt" status="failed" lineBelow={false} />
            <TreeItem kind="folder" label="BELLA" />
          </>
        }
        status={
          <>
            <TreeItem kind="status" label="Needs you" tone="attention" count={4} />
            <TreeItem kind="status" label="Ready" tone="success" count={3} />
          </>
        }
      />
    </Drawer>
  ),
  play: async ({ step }) => {
    const dialog = document.querySelector('dialog[data-bella-component="drawer"]') as HTMLElement;
    const panel = dialog.querySelector('[data-bella-component="project-panel"]') as HTMLElement;
    await step('flush: no fill, padding or edge of its own', async () => {
      const cs = getComputedStyle(panel);
      await expect(cs.backgroundColor).toBe('rgba(0, 0, 0, 0)');
      await expect(cs.paddingTop).toBe('0px');
      await expect(cs.boxShadow).toBe('none');
    });
    await step('"Projects" is shown once, as the drawer title', async () => {
      const shown = [...dialog.querySelectorAll('h2')].filter((h) => h.textContent === 'Projects' && h.getBoundingClientRect().width > 1);
      await expect(shown.length).toBe(1);
    });
  },
};
