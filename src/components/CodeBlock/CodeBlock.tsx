import React, { useMemo, useState } from 'react';
import { Prism, normalizeTokens } from 'prism-react-renderer';
import Icon from '../Icon/Icon';
import Tooltip from '../Tooltip/Tooltip';
import styles from './CodeBlock.module.css';

export interface CodeBlockProps {
  /** The code, as text. */
  code: string;
  /** Its language; "diff" marks added and removed lines. */
  language?: 'jsx' | 'tsx' | 'javascript' | 'json' | 'css' | 'markup' | 'diff' | 'plain';
  /** A title over the code, such as its file path. */
  title?: string;
  /** A line to mark, counted from 1. */
  currentLine?: number;
  /** Shows line numbers. */
  lineNumbers?: boolean;
  /** Shows the Copy icon button. */
  copy?: boolean;
  /** Extra classes on the block. */
  className?: string;
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
 * Code as an editor shows it: syntax colour by class, line numbers, a marked
 * line, long lines wrapped, and one Copy. Diffs mark added and removed lines
 * with + and − as well as a wash, so colour is never the only signal.
 */
export default function CodeBlock({ code, language = 'jsx', title, currentLine, lineNumbers = true, copy = true, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <figure className={[styles.block, className].filter(Boolean).join(' ')} data-bella-component="code-block">
      {title || copy ? (
        <figcaption className={styles.bar}>
          <span className={styles.title}>{title}</span>
          {copy ? (
            <Tooltip label={copied ? 'Copied' : 'Copy'}>
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
            return (
              <span key={i} className={[styles.line, i + 1 === currentLine ? styles.current : '', mark].filter(Boolean).join(' ')}>
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
                  {'\n'}
                </span>
              </span>
            );
          })}
        </code>
      </pre>
      <span className={styles.srOnly} aria-live="polite">
        {copied ? 'Copied' : ''}
      </span>
    </figure>
  );
}
