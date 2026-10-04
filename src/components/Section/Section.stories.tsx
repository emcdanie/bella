import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Section from './Section';
import Card from '../Card/Card';
import ActionChip from '../ActionChip/ActionChip';
import cssRaw from './Section.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();
const contract = (componentContract as any).component?.section?.$extensions?.bella ?? {};

const meta: Meta<typeof Section> = {
  title: 'Components/Section',
  component: Section,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  args: {
    id: 'usage',
    heading: 'Usage',
    lede: 'What OBI answered this week and where: from BELLA data, a local model, or the cloud.',
    children: (
      <Card>
        <p style={{ margin: 0 }}>109 answers this week: data 33, local 72, cloud 4.</p>
      </Card>
    ),
  },
};
export default meta;

type Story = StoryObj<typeof Section>;

/** Heading, lede, body. */
export const Default: Story = {};

/** Small actions beside the heading. */
export const WithActions: Story = {
  args: { actions: <ActionChip onClick={() => {}}>Ask OBI for /usage</ActionChip> },
};

/** Two sections in a row: the section space between them, nothing else. */
export const Stack: Story = {
  render: () => (
    <div>
      <Section id="readiness" heading="Readiness map" lede="The ten-station inspection, pointed at BELLA.">
        <Card>
          <p style={{ margin: 0 }}>90 of 100, the mean of 4 measured stations.</p>
        </Card>
      </Section>
      <Section id="failures" heading="Open failures">
        <Card>
          <p style={{ margin: 0 }}>BrandWordmark: no story.</p>
        </Card>
      </Section>
    </div>
  ),
};

/** Behavioral suite: a section named by its h2, the h2 at the section floor, the anchor id on the section. */
export const Behavior: Story = {
  play: async ({ canvasElement, canvas, step }) => {
    const section = canvasElement.querySelector('section') as HTMLElement;
    await step('a region named by its heading', async () => {
      expect(canvas.getByRole('region', { name: 'Usage' })).toBe(section);
    });
    await step('the h2 is on the section tier, 34px floor (type lock)', async () => {
      const h2 = section.querySelector('h2') as HTMLElement;
      expect(parseFloat(getComputedStyle(h2).fontSize)).toBeGreaterThanOrEqual(34);
    });
    await step('the id is on the section, so an On this page link lands on it', async () => {
      expect(section.id).toBe('usage');
    });
  },
};
