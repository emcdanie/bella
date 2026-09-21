import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import CaseMeta from './CaseMeta';
import SectionHeader from '../../components/SectionHeader/SectionHeader';

const meta: Meta<typeof CaseMeta> = {
  title: 'Patterns/CaseMeta',
  component: CaseMeta,
  argTypes: { children: { control: false } },
};
export default meta;
type Story = StoryObj<typeof CaseMeta>;

const p = (t: string) => <p>{t}</p>;

/** The case template: facts sticky on the left, the body in the order
 * Challenge / Objectives / Actions / Milestones (the laurenbasser.site
 * structure), Results kept last. Copy: the B2B travel case. */
export const CaseTemplate: Story = {
  args: {
    items: [
      { label: 'Role', value: 'Lead Product Designer' },
      { label: 'Team', value: 'Engineering, Product' },
      { label: 'Timeline', value: '2024-2025, embedded' },
      { label: 'Scope', value: 'Search UX, filtering systems, results architecture, constraint messaging' },
    ],
    children: (
      <>
        <SectionHeader heading="Challenge" layout="stacked" lead="Capability without clarity is just a different kind of friction.">
          {p('Nine filter controls, all at equal visual weight, with no sense of which ones matter for the decision at hand. Filtering had been designed as data exposure, not decision support.')}
        </SectionHeader>
        <SectionHeader heading="Objectives" layout="stacked">
          {p('Search, filters and results had been built as three features by different teams. Users experienced them as one decision flow. Make the product behave like one.')}
        </SectionHeader>
        <SectionHeader heading="Actions" layout="stacked">
          {p('Search and filtering as one flow. Policy as a visible dimension of every result. Filter state continuously visible, so experimenting is safe to undo.')}
        </SectionHeader>
        <SectionHeader heading="Milestones" layout="stacked">
          {p('Early exploration of search patterns, then filter interaction experiments, then the integrated decision system with comparison and policy awareness.')}
        </SectionHeader>
        <SectionHeader heading="Results" layout="stacked">
          {p('Duplicated filter components consolidated into a smaller set of flexible building blocks, and a reusable filtering pattern with a consistent contract across the product.')}
        </SectionHeader>
      </>
    ),
  },
};
