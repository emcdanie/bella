import React, { type ReactNode } from 'react';
import {
  Title,
  Description,
  Primary,
  Controls,
  Stories,
  useOf,
} from '@storybook/addon-docs/blocks';

/* Shared building blocks for the doc pages. Tokens only: every colour,
 * space, and radius is a semantic or primitive custom property, so the
 * blocks flip with [data-theme] like everything else. The page anatomy
 * these implement is recorded at the end of the Governance page. */

/** H1 + one-paragraph standfirst. Every doc page opens with this. */
export function PageIntro({ title, children }: { title: string; children: ReactNode }) {
  return (
    <header style={{ marginBottom: 'var(--spacing-32)' }}>
      <h1>{title}</h1>
      <p
        style={{
          fontSize: 'var(--typography-font-size-22)',
          lineHeight: 'var(--typography-line-height-150)',
          color: 'var(--color-content-body)',
          maxWidth: '65ch',
          margin: 0,
        }}
      >
        {children}
      </p>
    </header>
  );
}

const panelStyle: React.CSSProperties = {
  background: 'var(--color-background-surface)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-12)',
  padding: 'var(--spacing-16) var(--spacing-20)',
};

const dodontLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 'var(--typography-font-size-18)',
  fontWeight: 700,
  letterSpacing: 'var(--typography-letter-spacing-0)',
  marginBottom: 'var(--spacing-12)',
};

function DoDontList({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 'var(--spacing-20)' }}>
      {items.map((item) => (
        <li
          key={item}
          style={{
            fontSize: 'var(--typography-body-default-font-size)',
            lineHeight: 'var(--typography-line-height-150)',
            color: 'var(--color-content-default)',
            marginBottom: 'var(--spacing-8)',
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Paired examples. Typographic, not colour-coded: status colours are
 * non-text roles and the accent is a fill, so the labels carry the
 * meaning. */
export function DoDont({ doItems, dontItems }: { doItems: string[]; dontItems: string[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--spacing-20)',
        margin: 'var(--spacing-24) 0',
      }}
    >
      <div style={panelStyle}>
        <span style={{ ...dodontLabelStyle, color: 'var(--color-content-default)' }}>Do</span>
        <DoDontList items={doItems} />
      </div>
      <div style={{ ...panelStyle, borderStyle: 'dashed' }}>
        <span style={{ ...dodontLabelStyle, color: 'var(--color-content-subtle)' }}>
          Don&apos;t
        </span>
        <DoDontList items={dontItems} />
      </div>
    </div>
  );
}

/** Inline token reference. Accepts a dotted token path (color.brand.ochre)
 * or a CSS custom property (--color-brand-ochre-300). Colour tokens get a live
 * swatch driven by the token's own custom property, so it flips with the
 * theme. */
export function TokenChip({ token }: { token: string }) {
  const cssVar = token.startsWith('--') ? token : '--' + token.replace(/\./g, '-');
  const isColor = token.startsWith('color.') || token.startsWith('--color');
  return (
    <code
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--spacing-4)',
        background: 'var(--color-background-subtle)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--border-radius-4)',
        padding: '1px var(--spacing-8)',
        fontFamily: 'var(--typography-font-family-dm-sans)',
        fontSize: 'var(--typography-font-size-18)',
        color: 'var(--color-content-default)',
        whiteSpace: 'nowrap',
      }}
    >
      {isColor && (
        <span
          aria-hidden="true"
          data-bella-specimen
          style={{
            display: 'inline-block',
            width: 12,
            height: 12,
            borderRadius: 'var(--border-radius-4)',
            background: `var(${cssVar})`,
            border: '1px solid var(--color-border-strong)',
            flexShrink: 0,
          }}
        />
      )}
      {token}
    </code>
  );
}

const sectionHeadStyle: React.CSSProperties = {
  fontSize: 'var(--typography-font-size-22)',
  fontWeight: 700,
  margin: 'var(--spacing-32) 0 var(--spacing-16)',
};

/** The component autodocs template (page anatomy, Governance page):
 * description verbatim from the committed source, live primary story, props
 * table, tokens consumed, a11y notes, then the remaining stories. Later
 * components opt in with parameters.docs.page and parameters.bellaDocs. */
export function ComponentDocsPage() {
  const resolved = useOf<'meta'>('meta');
  const parameters =
    resolved.type === 'meta' ? (resolved.preparedMeta?.parameters ?? {}) : {};
  const bellaDocs = (parameters.bellaDocs ?? {}) as { tokens?: string[]; a11y?: string };
  return (
    <>
      <Title />
      <Description />
      <Primary />
      <Controls />
      {bellaDocs.tokens && bellaDocs.tokens.length > 0 && (
        <>
          <h3 style={sectionHeadStyle}>Tokens consumed</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-8)' }}>
            {bellaDocs.tokens.map((t) => (
              <TokenChip key={t} token={t} />
            ))}
          </div>
        </>
      )}
      {bellaDocs.a11y && (
        <>
          <h3 style={sectionHeadStyle}>Accessibility</h3>
          <p
            style={{
              fontSize: 'var(--typography-body-default-font-size)',
              lineHeight: 'var(--typography-line-height-150)',
              maxWidth: '70ch',
            }}
          >
            {bellaDocs.a11y}
          </p>
        </>
      )}
      <Stories />
    </>
  );
}
