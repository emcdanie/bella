import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { expectVisibleFocus, expectTouchTarget } from '../../testing/behavioral';
import Input from './Input';
import inputCssRaw from './Input.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((inputCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const inputContract =
  (componentContract as any).component?.input?.$extensions?.bella ?? {};

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: inputContract.a11y },
  },
  argTypes: {
    label: { control: 'text' },
    error: { control: 'text' },
    hint: { control: 'text' },
    multiline: { control: 'boolean' },
    type: { control: false },
    value: { control: false },
    onChange: { control: false },
    placeholder: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    id: { control: false },
    className: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

/** The full state matrix: default, hint, required, disabled, error, and
 * the multiline textarea. The error tint waits for the status ladder;
 * until then the state is ink and structure, recorded. */
export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-6)', maxWidth: 420 }}>
      <Input label="Name" value="" onChange={() => {}} placeholder="Elleta McDaniel" />
      <Input
        label="Email"
        type="email"
        value=""
        onChange={() => {}}
        hint="Used only to reply."
        required
      />
      <Input label="Company" value="ctrl_alt_design" onChange={() => {}} disabled />
      <Input
        label="Email"
        type="email"
        value="not-an-email"
        onChange={() => {}}
        error="Enter a valid email address."
        required
      />
      <Input
        label="Message"
        value=""
        onChange={() => {}}
        multiline
        placeholder="What are you building?"
      />
    </div>
  ),
};

function FormHarness() {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);
  const error = touched && value.length < 2 ? 'Tell me your name.' : undefined;
  return (
    <div style={{ maxWidth: 420 }} onBlur={() => setTouched(true)}>
      <Input
        label="Name"
        value={value}
        onChange={setValue}
        error={error}
        required
        name="name"
        autoComplete="name"
      />
    </div>
  );
}

/** Behavioral suite: real label wiring, honest error semantics, focus
 * ring, touch target. */
export const Behavior: Story = {
  render: () => <FormHarness />,
  play: async ({ canvas, step }) => {
    const field = canvas.getByLabelText(/name/i) as HTMLInputElement;

    await step('label is real: for/id wiring resolves the field', async () => {
      expect(field.tagName).toBe('INPUT');
    });

    await step('autoComplete and name reach the DOM (contact-form contract)', async () => {
      expect(field).toHaveAttribute('autocomplete', 'name');
      expect(field).toHaveAttribute('name', 'name');
    });

    await step('error is honest: aria-invalid + role=alert, described-by wired', async () => {
      field.focus();
      field.blur();
      await waitFor(() => {
        expect(field).toHaveAttribute('aria-invalid', 'true');
        const alert = canvas.getByRole('alert');
        expect(alert.textContent).toContain('Tell me your name.');
        expect(field.getAttribute('aria-describedby')).toContain(alert.id);
      });
    });

    await step('typing clears the error live', async () => {
      field.focus();
      // set value the React way so the controlled input updates
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )!.set!;
      setter.call(field, 'Elleta');
      field.dispatchEvent(new Event('input', { bubbles: true }));
      await waitFor(() => {
        expect(field).not.toHaveAttribute('aria-invalid');
        expect(canvas.queryAllByRole('alert')).toHaveLength(0);
      });
    });

    await step('focus: visible ring; touch target holds', async () => {
      await expectVisibleFocus(field);
      expectTouchTarget(field);
    });
  },
};
