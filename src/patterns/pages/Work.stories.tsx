import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { expectSharpImages } from '../../testing/behavioral';
import WorkIntro from '../WorkIntro/WorkIntro';
import SectionIndex from '../SectionIndex/SectionIndex';
import Heading from '../../components/Heading/Heading';
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
        <div style={{ display: 'grid', rowGap: 'var(--spacing-4)' }}>
          <SectionIndex index="01" label="Featured" />
          <Heading tier="section" as="h2" id="work-featured">
            Featured
          </Heading>
        </div>
        <FeaturedCase {...featured} />
      </section>
      <section aria-labelledby="work-selected" style={{ display: 'grid', rowGap: 'var(--spacing-8)' }}>
        <div style={{ display: 'grid', rowGap: 'var(--spacing-4)' }}>
          <SectionIndex index="02" label="Selected work" />
          <Heading tier="section" as="h2" id="work-selected">
            Selected work
          </Heading>
        </div>
        <CaseGrid items={grid} label="Selected work" />
      </section>
      <section aria-labelledby="work-studies" style={{ display: 'grid', rowGap: 'var(--spacing-8)' }}>
        <div style={{ display: 'grid', rowGap: 'var(--spacing-4)' }}>
          <SectionIndex index="03" label="Pattern studies" />
          <Heading tier="section" as="h2" id="work-studies">
            Pattern studies
          </Heading>
        </div>
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
    /* section titles are real h2s; the SectionIndex above each stays a p */
    await expect(canvas.getAllByRole('heading', { level: 2 })).toHaveLength(3);
    await expect(canvas.getAllByRole('link')).toHaveLength(4);
  },
};
