import React, { useMemo, useState, type ReactNode } from 'react';
import { Prism, normalizeTokens } from 'prism-react-renderer';
import Icon from '../Icon/Icon';
import Tooltip from '../Tooltip/Tooltip';
import Pin from '../Pin/Pin';
import styles from './CodeBlock.module.css';

export interface CodeBlockProps {
  /** The code, as text. */
  code: string;
  /** Its language; "diff" marks added and removed lines. */
  language?: 'jsx' | 'tsx' | 'javascript' | 'json' | 'css' | 'markup' | 'diff' | 'plain';
  /** A title over the code, such as its file path. */
  title?: string;
  /** Shows line numbers. */
  lineNumbers?: boolean;
  /** Shows the Copy icon button. */
  copy?: boolean;
  /** Figma Code line kind (483:31): marks lines by number (1-based). current = the line being read, a
   * background/default wash; lit = the line a Tour step points at, a 2px border/focus outline with a red
   * numbered Pin at its end (the Pin number matches the Tour step). */
  lineMarks?: CodeLineMark[];
  /** Extra classes on the block. */
  className?: string;
}

export interface CodeLineMark {
  line: number;
  kind: 'current' | 'lit';
  /** lit only: the number on its Pin, the Tour step's number ("01"). */
  pin?: ReactNode;
}

// Prism's token types, to BELLA's syntax classes (colours are tokens, never inline)
const KIND: Record<string, string> = {
  keyword: 'keyword', boolean: 'number', number: 'number', string: 'string', char: 'string', 'template-string': 'string',
  comment: 'comment', prolog: 'comment', function: 'function', 'class-name': 'tag', tag: 'tag', selector: 'tag',
  'attr-name': 'attr', property: 'attr', 'attr-value': 'string', punctuation: 'punct', operator: 'punct',
};
const kindOf = (types: string[]) => {
  for (let i = types.length - 1; i >= 0; i--) if (KIND[types[i]]) return KIND[types[i]];
  return '';
};

/**
 * Code as an editor shows it: syntax colour by class, line numbers,
 * line, long lines wrapped, and one Copy. Diffs mark added and removed lines
 * with + and − as well as a wash, so colour is never the only signal.
 */
export default function CodeBlock({ code, language = 'jsx', title, lineNumbers = true, copy = true, lineMarks, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const lines = useMemo(() => {
    const text = code.replace(/\n$/, '');
    if (language === 'diff' || language === 'plain' || !Prism.languages[language]) {
      return text.split('\n').map((l) => [{ types: ['plain'], content: l }]);
    }
    return normalizeTokens(Prism.tokenize(text, Prism.languages[language]) as never);
  }, [code, language]);
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 2000);
    }
  };
  return (
    <figure className={[styles.block, className].filter(Boolean).join(' ')} data-bella-component="code-block">
      {title || copy ? (
        <figcaption className={styles.bar}>
          <span className={styles.title}>{title}</span>
          {copy ? (
            <Tooltip label={copied ? 'Copied' : copyFailed ? 'Copy failed' : 'Copy'}>
              <button type="button" className={styles.copy} aria-label={title ? `Copy ${title}` : 'Copy'} onClick={doCopy}>
                <Icon name="Copy" size="sm" />
              </button>
            </Tooltip>
          ) : null}
        </figcaption>
      ) : null}
      <pre className={styles.pre} tabIndex={0} aria-label={title ? `${title}, code` : 'Code'}>
        <code>
          {lines.map((line, i) => {
            const first = line.map((t) => t.content).join('').charAt(0);
            const mark = language === 'diff' ? (first === '+' ? styles.add : first === '-' ? styles.del : '') : '';
            const lm = lineMarks?.find((m) => m.line === i + 1);
            return (
              <span
                key={i}
                className={[styles.line, mark, lm ? styles[lm.kind] : ''].filter(Boolean).join(' ')}
                data-kind={lm?.kind}
              >
                {lineNumbers ? (
                  <span className={styles.n} aria-hidden="true">
                    {i + 1}
                  </span>
                ) : null}
                <span className={styles.text}>
                  {line.map((t, k) => (
                    <span key={k} className={styles[kindOf(t.types)] || undefined}>
                      {t.content}
                    </span>
                  ))}
                  {lm?.kind === 'lit' && lm.pin != null ? null : '\n'}
                </span>
                {lm?.kind === 'lit' && lm.pin != null ? (
                  <>
                    {/* The Pin is the Tour step's marker; read as words, not as the disc. */}
                    <span className={styles.pin} aria-hidden="true">
                      <Pin number={lm.pin} variant="red" pinStyle="solid" />
                    </span>
                    <span className={styles.srOnly}>{`, step ${lm.pin}`}</span>
                    {'\n'}
                  </>
                ) : null}
              </span>
            );
          })}
        </code>
      </pre>
      <span className={styles.srOnly} aria-live="polite">
        {copied ? 'Copied' : copyFailed ? 'Copy failed' : ''}
      </span>
    </figure>
  );
}
