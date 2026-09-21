import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { expectSharpImages } from '../../testing/behavioral';
import WorkIntro from '../WorkIntro/WorkIntro';
import SectionIndex from '../SectionIndex/SectionIndex';
import FeaturedCase from '../FeaturedCase/FeaturedCase';
import CaseGrid from '../CaseGrid/CaseGrid';
import BeforeAfterFrame from '../BeforeAfterFrame/BeforeAfterFrame';
import { featured, filterCaption, filterStudy, grid, intro } from '../fixtures';

/* The Work page, composed from BELLA only: no markup here but the page's
 * own landmarks and the vertical rhythm between patterns. */
function WorkPage() {
  return (
    <main style={{ display: 'grid', rowGap: 'var(--spacing-20)' }}>
      <WorkIntro {...intro} />
      <section aria-labelledby="work-featured" style={{ display: 'grid', rowGap: 'var(--spacing-8)' }}>
        <SectionIndex index="01" label="Featured" id="work-featured" />
        <FeaturedCase {...featured} />
      </section>
      <section aria-labelledby="work-selected" style={{ display: 'grid', rowGap: 'var(--spacing-8)' }}>
        <SectionIndex index="02" label="Selected work" id="work-selected" />
        <CaseGrid items={grid} label="Selected work" />
      </section>
      <section aria-labelledby="work-studies" style={{ display: 'grid', rowGap: 'var(--spacing-8)' }}>
        <SectionIndex index="03" label="Pattern studies" id="work-studies" />
        <BeforeAfterFrame states={filterStudy} label="Filters study: screen state" caption={filterCaption} />
      </section>
    </main>
  );
}

const meta: Meta<typeof WorkPage> = {
  title: 'Pages/Work',
  component: WorkPage,
  tags: ['!autodocs'],
};
export default meta;
type Story = StoryObj<typeof WorkPage>;

/** WorkIntro, 01 Featured (B2B travel), 02 the grid (Code First, Drift,
 * CHIP), 03 pattern studies. Real copy from the site's content. */
export const Work: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expectSharpImages(canvasElement);
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    await expect(canvas.getAllByRole('link')).toHaveLength(4);
  },
};
