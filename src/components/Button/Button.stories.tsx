import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import {
  expectKeyboardOperable,
  expectVisibleFocus,
  expectTouchTarget,
} from '../../testing/behavioral';
import Button from './Button';
import Icon from '../Icon/Icon';
import buttonCssRaw from './Button.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

/* Tokens consumed: extracted live from the committed stylesheet, so the
 * docs list cannot drift from the code. Buttons carry no trace ring (Card
 * only), so the trace recipe is no longer part of this list. */
const consumedTokens = Array.from(
  new Set(
    (buttonCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) =>
      m.slice('var('.length)
    )
  )
)
  .sort();

const buttonContract = (componentContract as any).component?.button?.$extensions?.bella ?? {};

/* The autodocs page follows the Card template: description verbatim from
 * the committed TSDoc via docgen, curated controls, tokens consumed and
 * a11y notes from the contract. */
const meta: Meta<typeof Button> = {
  title: 'Components/Actions/Button',
  component: Button,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: {
      tokens: consumedTokens,
      a11y: buttonContract.a11y,
    },
  },
  argTypes: {
    variant: { control: 'inline-radio' },
    shape: { control: 'inline-radio' },
    href: { control: 'text' },
    ariaLabel: { control: 'text' },
    disabled: { control: 'boolean' },
    type: { control: false },
    onClick: { control: false },
    linkComponent: { control: false },
    className: { control: false },
    children: { control: false },
  },
  args: {
    variant: 'secondary',
    shape: 'default',
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

/** The three tiers, one row: primary plate, secondary outline, tertiary text. */
export const Tiers: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-20)', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary" onClick={() => {}}>
        Read the case
      </Button>
      <Button variant="secondary" onClick={() => {}}>
        See the system
      </Button>
      <Button variant="tertiary" onClick={() => {}}>
        All work
      </Button>
    </div>
  ),
};

/** Every tier in default and disabled. Hover and focus-visible roll the
 * label (never lift); active presses the primary down a little; reduced motion is
 * colour only. Live states, exercised by the Behavior story and the
 * rest-state assertions. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-20)' }}>
      {(['primary', 'secondary', 'tertiary'] as const).map((tier) => (
        <div
          key={tier}
          style={{ display: 'flex', gap: 'var(--spacing-20)', alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Button variant={tier} onClick={() => {}}>
            {tier}
          </Button>
          <Button variant={tier} onClick={() => {}} disabled>
            {tier} disabled
          </Button>
        </div>
      ))}
    </div>
  ),
};

/** Shape: every tier shares border/radius/lg by default (8 in Chip, the pill in BELLA); `shape="pill"`
 * rounds the ends fully. The label still reads once: the rolling copy is
 * aria-hidden. */
export const Shape: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-20)' }}>
      {(['default', 'pill'] as const).map((shape) => (
        <div
          key={shape}
          style={{ display: 'flex', gap: 'var(--spacing-20)', alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Button variant="primary" shape={shape} onClick={() => {}}>
            Let's talk
          </Button>
          <Button variant="secondary" shape={shape} onClick={() => {}}>
            See the system
          </Button>
          <Button variant="tertiary" shape={shape} onClick={() => {}}>
            All work
          </Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('pill: fully rounded; default: border/radius/lg; name read once', async () => {
      const [square, pill] = canvas.getAllByRole('button', { name: "Let's talk" });
      expect(pill).toHaveAccessibleName("Let's talk");
      // Figma Button 26:320 binds border/radius/lg: 8 in Chip, the pill in
      // BELLA (where the two shapes therefore look the same)
      const probe = document.createElement('div');
      probe.style.borderRadius = 'var(--border-radius-lg)';
      square.parentElement!.append(probe);
      const lg = getComputedStyle(probe).borderTopLeftRadius;
      probe.remove();
      expect(getComputedStyle(square).borderTopLeftRadius).toBe(lg);
      expect(parseFloat(getComputedStyle(pill).borderTopLeftRadius)).toBeGreaterThanOrEqual(pill.getBoundingClientRect().height / 2);
    });
  },
};

/** One height: every tier, shape and state is a 44px box (the touch
 * target), so a tertiary "Cancel" beside a primary "Save changes" shares
 * one row (2026-10-05: tertiary rendered 50, secondary and Combobox 46 in
 * Figma). Contract test: rest, hover, focus and disabled, both shapes. */
export const OneHeight: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-20)' }}>
      {(['default', 'pill'] as const).map((shape) => (
        <div
          key={shape}
          style={{ display: 'flex', gap: 'var(--spacing-20)', alignItems: 'flex-start', flexWrap: 'wrap' }}
        >
          {(['tertiary', 'secondary', 'primary'] as const).map((tier) => (
            <React.Fragment key={tier}>
              <Button variant={tier} shape={shape} onClick={() => {}}>
                {tier === 'tertiary' ? 'Cancel' : 'Save changes'}
              </Button>
              <Button variant={tier} shape={shape} onClick={() => {}} disabled>
                Disabled
              </Button>
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas, step }) => {
    const buttons = canvas.getAllByRole('button');
    const heights = () => buttons.map((b) => b.getBoundingClientRect().height);
    await step('rest: every box is 44', async () => {
      expect(buttons).toHaveLength(12);
      for (const h of heights()) expect(h).toBe(44);
    });
    await step('hover and focus keep 44', async () => {
      for (const b of buttons.filter((x) => !(x as HTMLButtonElement).disabled)) {
        await userEvent.hover(b);
        expect(b.getBoundingClientRect().height).toBe(44);
        b.focus();
        expect(b.getBoundingClientRect().height).toBe(44);
        await userEvent.unhover(b);
        b.blur();
      }
    });
  },
};

/** Anchor rendering: one link, external opens a new tab. */
export const AsLink: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-20)', alignItems: 'center' }}>
      <Button variant="primary" href="#work">
        Internal link
      </Button>
      <Button variant="secondary" href="https://elleta.design">
        External link
      </Button>
    </div>
  ),
};

function BehaviorHarness() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-20)', alignItems: 'center' }}>
      <Button variant="primary" onClick={() => setCount((c) => c + 1)} ariaLabel="Send message">
        Send
      </Button>
      <span data-testid="activation-count">{String(count)}</span>
    </div>
  );
}

/** Behavioral suite from src/testing/behavioral.ts: keyboard, focus,
 * touch target, states. */
export const Behavior: Story = {
  render: () => <BehaviorHarness />,
  play: async ({ canvas, step }) => {
    const button = canvas.getByRole('button', { name: 'Send message' });

    await step('keyboard: Tab reaches, Enter/Space activate', async () => {
      await expectKeyboardOperable(button, () =>
        Number(canvas.getByTestId('activation-count').textContent ?? 0)
      );
    });

    await step('focus: visible ring', async () => {
      await expectVisibleFocus(button);
    });

    await step('touch target: 44px minimum', async () => {
      expectTouchTarget(button);
    });

    await step('roll: the label copy is aria-hidden, never read twice', async () => {
      const copies = button.querySelectorAll('[aria-hidden="true"]');
      expect(copies).toHaveLength(1);
      expect(copies[0].textContent).toBe('Send');
    });

    await step('states: accessible name, single interactive element', async () => {
      expect(button).toHaveAccessibleName('Send message');
      expect(canvas.queryAllByRole('button')).toHaveLength(1);
      expect(canvas.queryAllByRole('link')).toHaveLength(0);
    });
  },
};

/** Brand refresh (2026-09-22): the ring means focus only, hover is a
 * small shift per tier, and there is no accent colour at rest. */
export const RingAndHover: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-20)', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary" onClick={() => {}}>Let's talk</Button>
      <Button variant="secondary" onClick={() => {}}>See the work</Button>
      <Button variant="tertiary" onClick={() => {}}>Read the case</Button>
    </div>
  ),
  play: async ({ canvas, step }) => {
    const [primary, secondary, tertiary] = canvas.getAllByRole('button');
    await step('no ring at rest on any tier', async () => {
      for (const b of [primary, secondary, tertiary]) {
        await expect(getComputedStyle(b).outlineStyle).toBe('none');
      }
      await expect(getComputedStyle(primary, '::before').outlineStyle).toBe('none');
    });
    await step('keyboard focus: the focus-ring token (4px, 4px offset)', async () => {
      await userEvent.tab();
      /* primary draws its ring on ::before, sized to the plate */
      const cs = getComputedStyle(primary, '::before');
      await expect(cs.outlineStyle).toBe('solid');
      await expect(parseFloat(cs.outlineWidth)).toBe(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--focus-ring-width')));
      await expect(parseFloat(cs.outlineOffset)).toBe(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--focus-ring-offset')));
      primary.blur();
    });
    /* hover (secondary outline to ink, tertiary fill) is
       verified with a real pointer outside the play function: synthetic
       userEvent.hover never triggers CSS :hover */
  },
};

/* Visual baselines for the keyboard-focused primary (3 Oct 2026). The ring
 * draws on ::before, sized to the plate, so only a capture of the
 * focused state shows whether it sits even on all four sides. */
function focusPrimary(): Story['play'] {
  return async ({ canvas }) => {
    const button = canvas.getByRole('button');
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(button.matches(':focus-visible')).toBe(true);
    /* the ring draws on ::before, sized to the plate */
    const cs = getComputedStyle(button, '::before');
    await expect(cs.outlineStyle).toBe('solid');
    await expect(parseFloat(cs.outlineWidth)).toBe(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--focus-ring-width')));
    await expect(parseFloat(cs.outlineOffset)).toBe(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--focus-ring-offset')));
  };
}

export const FocusedPrimary: Story = {
  parameters: { bella: { snapshotClip: 'focused' } },
  render: () => (
    <Button variant="primary" onClick={() => {}}>
      Send
    </Button>
  ),
  play: focusPrimary(),
};

export const FocusedPrimaryPill: Story = {
  parameters: { bella: { snapshotClip: 'focused' } },
  render: () => (
    <Button variant="primary" shape="pill" onClick={() => {}}>
      Let's talk
    </Button>
  ),
  play: focusPrimary(),
};

/** Three tiers across all three themes: flat ink plate in light/warm;
 * flat near-white plate in dark; secondary outline = ink in light/warm,
 * near-white in dark. (Elleta, 14 Oct 2026) */
export const AllThemes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-20)' }}>
      {(['bella-light', 'bella-dark', 'chip-light', 'chip-dark'] as const).map((theme) => (
        <div
          key={theme}
          data-theme={theme}
          style={{
            display: 'flex',
            gap: 'var(--spacing-16)',
            alignItems: 'center',
            flexWrap: 'wrap',
            padding: 'var(--spacing-16)',
            background: 'var(--color-background-surface)',
            borderRadius: 'var(--border-radius-12)',
          }}
        >
          <span style={{ fontFamily: 'var(--typography-font-family-dm-sans)', fontSize: 'var(--typography-label-default-font-size)', color: 'var(--color-content-subtle)', minWidth: '5rem' }}>{theme}</span>
          <Button variant="primary" onClick={() => {}}>Primary</Button>
          <Button variant="secondary" onClick={() => {}}>Secondary</Button>
          <Button variant="tertiary" onClick={() => {}}>Tertiary</Button>
        </div>
      ))}
    </div>
  ),
};

/** iconOnly (BellaComponents, 11 Nov 2026): a 44px circle holding one Icon,
 * named by ariaLabel, the focus ring round. Pair it with a Tooltip. */
export const IconOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
      <Button variant="secondary" iconOnly ariaLabel="Read everything again" onClick={() => {}}>
        <Icon name="RefreshDouble" />
      </Button>
      <Button variant="secondary" iconOnly ariaLabel="Close" onClick={() => {}}>
        <Icon name="Xmark" />
      </Button>
      <Button variant="secondary" iconOnly ariaLabel="Send" disabled>
        <Icon name="SendDiagonal" />
      </Button>
    </div>
  ),
  play: async ({ canvas }) => {
    const b = canvas.getByRole('button', { name: 'Read everything again' });
    const r = b.getBoundingClientRect();
    await expect(Math.round(r.width)).toBe(44);
    await expect(Math.round(r.height)).toBe(44);
    await expect(getComputedStyle(b).borderTopLeftRadius).toBe(getComputedStyle(b).borderBottomRightRadius);
    await expect(parseFloat(getComputedStyle(b).borderTopLeftRadius)).toBeGreaterThanOrEqual(22);
  },
};

/** iconOnly focused: the 3px ring follows the circle. */
export const IconOnlyFocused: Story = {
  parameters: { bella: { snapshotClip: 'focused' } },
  render: () => (
    <Button variant="secondary" iconOnly ariaLabel="Read everything again" onClick={() => {}}>
      <Icon name="RefreshDouble" />
    </Button>
  ),
  play: async ({ canvas }) => {
    await userEvent.tab();
    const b = canvas.getByRole('button', { name: 'Read everything again' });
    await expect(b).toHaveFocus();
    const cs = getComputedStyle(b);
    await expect(cs.outlineStyle).toBe('solid');
    await expect(parseFloat(cs.outlineWidth)).toBe(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--focus-ring-width')));
  },
};

/** size="sm": the box height is the Figma token component/button/sm/min-height
 * (44 since the 17 Nov export, "44 tall at every size"; was 36 on 11 Nov), sides
 * spacing/20, every tier, plus an icon circle. The label stays 16px and the tap
 * area stays 44. The test reads the token, so it follows Figma. */
export const Small: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary" size="sm" onClick={() => {}}>
        Read the case
      </Button>
      <Button variant="secondary" size="sm" onClick={() => {}}>
        See the system
      </Button>
      <Button variant="tertiary" size="sm" onClick={() => {}}>
        All work
      </Button>
      <Button variant="secondary" size="sm" iconOnly ariaLabel="Read everything again" onClick={() => {}}>
        <Icon name="RefreshDouble" />
      </Button>
    </div>
  ),
  play: async ({ canvas }) => {
    for (const name of ['Read the case', 'See the system', 'All work', 'Read everything again']) {
      const b = canvas.getByRole('button', { name });
      const box = parseFloat(getComputedStyle(b).getPropertyValue('--size-32'));
      await expect(Math.round(b.getBoundingClientRect().height)).toBe(box);
      await expect(parseFloat(getComputedStyle(b).fontSize)).toBeGreaterThanOrEqual(16);
      // the tap area: the invisible ::after reaches 44 both ways
      await expect(parseFloat(getComputedStyle(b, '::after').height)).toBeGreaterThanOrEqual(44);
      await expect(parseFloat(getComputedStyle(b, '::after').width)).toBeGreaterThanOrEqual(box);
    }
  },
};

/** size="sm" focused: the same 3px ring, 3px offset. */
export const SmallFocused: Story = {
  parameters: { bella: { snapshotClip: 'focused' } },
  render: () => (
    <Button variant="secondary" size="sm" onClick={() => {}}>
      See the system
    </Button>
  ),
  play: async ({ canvas }) => {
    await userEvent.tab();
    const b = canvas.getByRole('button', { name: 'See the system' });
    await expect(b).toHaveFocus();
    await expect(parseFloat(getComputedStyle(b).outlineWidth)).toBe(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--focus-ring-width')));
  },
};

/* Figma re-sync (19 Nov 2026): every variant x size x iconOnly x disabled in
 * Chip light and Chip dark, with the new Label / icon / Leading icon props. */
const CHIP_THEMES = ['chip-light', 'chip-dark'] as const;

export const ChipMatrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
      {CHIP_THEMES.map((theme) => (
        <div key={theme} data-theme={theme} style={{ padding: 'var(--spacing-24)', background: 'var(--color-background-surface)', display: 'grid', gap: 'var(--spacing-16)' }}>
          {(['md', 'sm'] as const).map((size) => (
            <div key={size} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-16)', alignItems: 'center' }}>
              {(['primary', 'secondary', 'tertiary'] as const).map((variant) => (
                <React.Fragment key={variant}>
                  <Button variant={variant} size={size} label="Accept" onClick={() => {}} />
                  <Button variant={variant} size={size} label="Refresh" icon="RefreshDouble" leadingIcon onClick={() => {}} />
                  <Button variant={variant} size={size} iconOnly icon="Xmark" ariaLabel="Close" onClick={() => {}} />
                  <Button variant={variant} size={size} label="Disabled" disabled />
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};

function BusyDemo() {
  const [busy, setBusy] = React.useState(false);
  const [runs, setRuns] = React.useState(0);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-16)', alignItems: 'center', padding: 'var(--spacing-24)' }}>
      <Button
        variant="secondary"
        busy={busy}
        onClick={() => {
          setRuns((n) => n + 1);
          setBusy(true);
        }}
      >
        Check again
      </Button>
      <Button variant="secondary" size="sm" icon="RefreshDouble" leadingIcon busy>
        Test
      </Button>
      <span data-testid="runs" style={{ fontFamily: 'var(--typography-number-font-family)', color: 'var(--color-content-default)' }}>
        {runs} run{runs === 1 ? '' : 's'}
      </span>
    </div>
  );
}

/** busy (rule "Motion that shows what happened", item 1): the job it started is running, so its icon
 * turns and clicks wait. The label stays and never rolls. Reduced motion: the icon holds still. */
export const Busy: Story = {
  render: () => <BusyDemo />,
  play: async ({ canvas, step }) => {
    const check = canvas.getByRole('button', { name: 'Check again' });
    await step('a click starts the job: aria-busy, the icon turns', async () => {
      await userEvent.click(check);
      await expect(check).toHaveAttribute('aria-busy', 'true');
      const turn = check.querySelector('[class*="turn"]') as HTMLElement;
      await expect(turn).not.toBeNull();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      await expect(getComputedStyle(turn).animationName).toMatch(reduced ? /^none$/ : /buttonTurn/);
    });
    await step('while busy, clicks wait', async () => {
      await userEvent.click(check);
      await expect(canvas.getByTestId('runs')).toHaveTextContent('1 run');
    });
  },
};
