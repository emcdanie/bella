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
    <header style={{ marginBottom: 'var(--spacing-8)' }}>
      <h1>{title}</h1>
      <p
        style={{
          fontSize: 'var(--typography-font-size-lg)',
          lineHeight: 'var(--typography-line-height-normal)',
          color: 'var(--color-semantic-text-secondary)',
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
  background: 'var(--color-semantic-surface)',
  border: '1px solid var(--color-semantic-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--spacing-4) var(--spacing-5)',
};

const dodontLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 'var(--typography-font-size-sm)',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 'var(--typography-letter-spacing-wider)',
  marginBottom: 'var(--spacing-3)',
};

function DoDontList({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 'var(--spacing-5)' }}>
      {items.map((item) => (
        <li
          key={item}
          style={{
            fontSize: 'var(--typography-font-size-base)',
            lineHeight: 'var(--typography-line-height-normal)',
            color: 'var(--color-semantic-text-primary)',
            marginBottom: 'var(--spacing-2)',
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Paired examples. Typographic, not colour-coded: status colours are
 * non-text roles and iris at body scale means interactive, so the labels
 * carry the meaning. */
export function DoDont({ doItems, dontItems }: { doItems: string[]; dontItems: string[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--spacing-5)',
        margin: 'var(--spacing-6) 0',
      }}
    >
      <div style={panelStyle}>
        <span style={{ ...dodontLabelStyle, color: 'var(--color-semantic-text-primary)' }}>Do</span>
        <DoDontList items={doItems} />
      </div>
      <div style={{ ...panelStyle, borderStyle: 'dashed' }}>
        <span style={{ ...dodontLabelStyle, color: 'var(--color-semantic-text-muted)' }}>
          Don&apos;t
        </span>
        <DoDontList items={dontItems} />
      </div>
    </div>
  );
}

/** Inline token reference. Accepts a dotted token path (color.brand.iris)
 * or a CSS custom property (--color-brand-iris). Colour tokens get a live
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
        gap: 'var(--spacing-1)',
        background: 'var(--color-semantic-surface-inset)',
        border: '1px solid var(--color-semantic-border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '1px var(--spacing-2)',
        fontFamily: 'var(--typography-font-family-mono)',
        fontSize: 'var(--typography-font-size-sm)',
        color: 'var(--color-semantic-text-primary)',
        whiteSpace: 'nowrap',
      }}
    >
      {isColor && (
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: 12,
            height: 12,
            borderRadius: 'var(--radius-sm)',
            background: `var(${cssVar})`,
            border: '1px solid var(--color-semantic-border)',
            flexShrink: 0,
          }}
        />
      )}
      {token}
    </code>
  );
}

const sectionHeadStyle: React.CSSProperties = {
  fontSize: 'var(--typography-font-size-xl)',
  fontWeight: 700,
  margin: 'var(--spacing-8) 0 var(--spacing-4)',
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)' }}>
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
              fontSize: 'var(--typography-font-size-base)',
              lineHeight: 'var(--typography-line-height-normal)',
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
