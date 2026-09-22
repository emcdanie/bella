import type { Meta, StoryObj } from '@storybook/react-vite';
import WorkIntro from './WorkIntro';
import { intro } from '../fixtures';

const meta: Meta<typeof WorkIntro> = {
  title: 'Patterns/WorkIntro',
  component: WorkIntro,
  args: intro,
  argTypes: { accent: { control: 'text' }, after: { control: 'text' }, statement: { control: 'text' }, practice: { control: 'text' } },
};
export default meta;
type Story = StoryObj<typeof WorkIntro>;

/** Southleft's "<WORK>" opening: label, statement h1 across the width,
 * practice paragraph, proof panel beside it. */
export const WithProof: Story = {};

/** No proof panel: the paragraph keeps its measure; nothing reflows. */
export const StatementOnly: Story = { args: { proof: undefined } };
