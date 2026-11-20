import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { expectVisibleFocus, expectTouchTarget } from '../../testing/behavioral';
import Input from './Input';
import Button from '../Button/Button';
import inputCssRaw from './Input.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((inputCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const inputContract =
  (componentContract as any).component?.input?.$extensions?.bella ?? {};

const meta: Meta<typeof Input> = {
  title: 'Components/Inputs/Input',
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
    <div style={{ display: 'grid', gap: 'var(--spacing-24)', maxWidth: 420 }}>
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

    await step('the single-line field is 44 (Figma 20 Nov: min spacing/44)', async () => {
      expect(field.getBoundingClientRect().height).toBe(44);
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

    await step('error is not colour alone: danger edge, icon and danger message', async () => {
      // Figma splits the error colour: the edge is border/utility/error, the words content/utility/error (7:1)
      const colourOf = (v: string) => {
        const probe = document.createElement('span');
        probe.style.color = `var(${v})`;
        document.body.append(probe);
        const c = getComputedStyle(probe).color;
        probe.remove();
        return c;
      };
      const alert = canvas.getByRole('alert');
      expect(getComputedStyle(field).borderTopColor).toBe(colourOf('--color-border-utility-error'));
      expect(getComputedStyle(alert).color).toBe(colourOf('--color-content-utility-error'));
      const icon = alert.querySelector('svg');
      expect(icon).not.toBeNull();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
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

    await step('focus: the shared focus-ring token (4px, 4px offset)', async () => {
      field.focus();
      const cs = getComputedStyle(field);
      expect(cs.outlineStyle).toBe('solid');
      expect(parseFloat(cs.outlineWidth)).toBe(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--focus-ring-width')));
      expect(parseFloat(cs.outlineOffset)).toBe(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--focus-ring-offset')));
    });

    await step('focus: visible ring; touch target holds', async () => {
      await expectVisibleFocus(field);
      expectTouchTarget(field);
    });
  },
};

/** Figma "Leading icon" and "Send button" (19 Nov 2026): the Team page's
 * composer. The Send button is the small primary icon-only Button (32 plate,
 * 44 hit area, Figma 20 Nov) inside the
 * field; Enter sends too. Without these props the field is unchanged. */
function Composer() {
  const [value, setValue] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', maxWidth: '40rem' }}>
      <Input
        label="Reply"
        value={value}
        onChange={setValue}
        placeholder="Write a reply"
        leadingIcon="ChatBubbleEmpty"
        onSend={() => {
          if (value.trim()) setSent((s) => [...s, value]);
          setValue('');
        }}
        sendLabel="Send reply"
      />
      {/* the play test reads this count; it is not part of the composer */}
      <p data-testid="sent" hidden>{sent.length}</p>
    </div>
  );
}

export const WithSend: Story = {
  render: () => <Composer />,
  play: async ({ canvas, userEvent, step }) => {
    await step('the Send button is named: a 32 plate with a 44 hit area', async () => {
      const send = canvas.getByRole('button', { name: 'Send reply' });
      expect(send.getBoundingClientRect().height).toBe(32);
      expect(parseFloat(getComputedStyle(send, '::after').height)).toBeGreaterThanOrEqual(44);
    });
    await step('Enter sends', async () => {
      await userEvent.type(canvas.getByLabelText('Reply'), 'Looks right{Enter}');
      await expect(canvas.getByTestId('sent')).toHaveTextContent('1');
    });
  },
};

/** Field corners (library round 6, Elleta 21 Nov: "it should be like the others"): every field takes
 * border/radius/lg, the same corner as Button, 8 in Chip. */
export const FieldCorners: Story = {
  render: () => (
    <div data-probe="" style={{ borderRadius: 'var(--border-radius-lg)' }}>
      <Input label="Name" value="" onChange={() => {}} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const probe = canvasElement.querySelector('[data-probe]') as HTMLElement;
    const field = canvasElement.querySelector('input')!.closest('[class*="field"]') as HTMLElement ?? canvasElement.querySelector('input')!;
    await expect(getComputedStyle(field).borderTopLeftRadius).toBe(getComputedStyle(probe).borderTopLeftRadius);
  },
};

/** Menu slot (Figma Input 149:107): a control at the start of the field, the model picker here, then a
 * 1×24 divider in border/strong before the text; Send at the end. */
export const WithMenu: Story = {
  render: () => {
    const [v, setV] = useState('');
    return (
      <div style={{ maxInlineSize: 'calc(var(--spacing-80) * 7)' }}>
        <Input
          label="Message"
          value={v}
          onChange={setV}
          placeholder="Ask about BELLA"
          menu={<Button variant="tertiary" size="sm" label="Sonnet" icon="NavArrowDown" ariaLabel="Model: Sonnet" />}
          onSend={() => {}}
        />
      </div>
    );
  },
  play: async ({ canvasElement, canvas, step }) => {
    const input = canvas.getByRole('textbox', { name: 'Message' });
    const model = canvas.getByRole('button', { name: 'Model: Sonnet' });
    const divider = canvasElement.querySelector('[class*="divider"]') as HTMLElement;
    await step('menu, then divider, then the text', async () => {
      await expect(model.getBoundingClientRect().right).toBeLessThanOrEqual(divider.getBoundingClientRect().left);
      await expect(divider.getBoundingClientRect().right).toBeLessThanOrEqual(input.getBoundingClientRect().left);
    });
    await step('the divider is 1×24', async () => {
      await expect(Math.round(divider.getBoundingClientRect().width)).toBe(1);
      await expect(Math.round(divider.getBoundingClientRect().height)).toBe(24);
    });
    await step('the menu control keeps its 44 target (the sm plate is 32; its target is the 44 around it)', async () => {
      const r = model.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      for (const [dx, dy] of [[-21, 0], [21, 0], [0, -21], [0, 21]]) {
        await expect(model.contains(document.elementFromPoint(cx + dx, cy + dy))).toBe(true);
      }
    });
  },
};
