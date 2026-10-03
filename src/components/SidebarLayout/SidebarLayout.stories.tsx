import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import SidebarLayout from './SidebarLayout';
import Card from '../Card/Card';
import NavList from '../NavList/NavList';
import cssRaw from './SidebarLayout.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();
const contract = (componentContract as any).component?.['sidebar-layout']?.$extensions?.bella ?? {};

const onThisPage = (
  <NavList
    label="On this page"
    groups={[
      {
        label: 'On this page',
        items: [
          { href: '#overview', label: 'Overview', current: true },
          { href: '#readiness', label: 'Readiness map' },
          { href: '#usage', label: 'Usage' },
        ],
      },
    ]}
  />
);

const body = (
  <Card>
    <p style={{ margin: 0 }}>The content column: sections, cards, the reader.</p>
  </Card>
);

const meta: Meta<typeof SidebarLayout> = {
  title: 'Components/SidebarLayout',
  component: SidebarLayout,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  args: { aside: onThisPage, asideLabel: 'On this page', children: body },
};
export default meta;

type Story = StoryObj<typeof SidebarLayout>;

/** Aside and content: 3 and 9 of 12 when the layout is 1200px or wider. */
export const Default: Story = {};

/** Aside, content and a rail (the Docs reader): 3, 6 and 3. */
export const WithRail: Story = {
  args: {
    rail: (
      <Card>
        <p style={{ margin: 0 }}>Status: In progress · Plan · 3 Oct</p>
      </Card>
    ),
    railLabel: 'About this doc',
  },
};

/** At a narrow width everything stacks: aside, content, rail. */
export const Narrow: Story = {
  args: { ...WithRail.args },
  decorators: [(S) => <div style={{ maxWidth: 360 }}><S /></div>],
};

/** Behavioral suite: named landmarks in source order, the rail beside the content when wide, stacked when narrow. */
export const Behavior: Story = {
  args: { ...WithRail.args },
  render: (args) => (
    <div>
      <div data-testid="wide" style={{ width: 1240 }}>
        <SidebarLayout {...args} />
      </div>
      <div data-testid="narrow" style={{ width: 360 }}>
        <SidebarLayout {...args} aside={<Card><p style={{ margin: 0 }}>Library</p></Card>} asideLabel="Library" railLabel="Facts" />
      </div>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const wide = canvasElement.querySelector('[data-testid=wide]') as HTMLElement;
    const narrow = canvasElement.querySelector('[data-testid=narrow]') as HTMLElement;
    const parts = (root: HTMLElement) => {
      const [aside, rail] = root.querySelectorAll('aside');
      return { aside, rail, content: aside.nextElementSibling as HTMLElement };
    };
    await step('aside and rail are complementary landmarks with their own names', async () => {
      const { aside, rail } = parts(wide);
      expect(aside.getAttribute('aria-label')).toBe('On this page');
      expect(rail.getAttribute('aria-label')).toBe('About this doc');
    });
    await step('wide: aside, content and rail side by side, left to right', async () => {
      const { aside, content, rail } = parts(wide);
      const a = aside.getBoundingClientRect(), c = content.getBoundingClientRect(), r = rail.getBoundingClientRect();
      expect(a.right).toBeLessThanOrEqual(c.left);
      expect(c.right).toBeLessThanOrEqual(r.left);
      expect(Math.round(a.top)).toBe(Math.round(c.top));
    });
    await step('narrow: one column, in source order', async () => {
      const { aside, content, rail } = parts(narrow);
      const a = aside.getBoundingClientRect(), c = content.getBoundingClientRect(), r = rail.getBoundingClientRect();
      expect(a.bottom).toBeLessThanOrEqual(c.top);
      expect(c.bottom).toBeLessThanOrEqual(r.top);
      expect(getComputedStyle(aside).position).toBe('static');
    });
  },
};
