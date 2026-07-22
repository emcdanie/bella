#!/usr/bin/env node
/* audit:quality, docs leg. The test-runner covers every story; this script
 * covers every docs page against a running (static) Storybook:
 *   - no em or en dashes in rendered doc content (.sbdocs-content)
 *   - nothing below the 13px hard floor
 *   - Unique never below 24px
 *   - no pure-white solid fills
 *   - no colour literals in inline styles (token specimens opt out with
 *     data-bella-specimen)
 * Scope note: the long-form 16px rule runs on stories only. Docs pages embed
 * Storybook's own docs chrome (the args table renders at its 13-14px
 * metadata tier), which BELLA treats as exempt metadata, not body text.
 *
 * Usage: node scripts/audit-quality-docs.mjs [http://127.0.0.1:6006]
 */

import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://127.0.0.1:6006';

const index = await (await fetch(`${base}/index.json`)).json();
const docs = Object.values(index.entries).filter((e) => e.type === 'docs');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

let failed = false;
for (const entry of docs) {
  await page.goto(`${base}/iframe.html?viewMode=docs&id=${entry.id}`, {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(400);

  const fails = await page.evaluate(() => {
    const out = [];
    const root = document.querySelector('.sbdocs-content') ?? document.body;

    const text = root.innerText ?? '';
    const dash = text.match(/[—–]/);
    if (dash) {
      const i = text.indexOf(dash[0]);
      out.push(
        `em/en dash: "...${text.slice(Math.max(0, i - 30), i + 30).replace(/\n/g, ' ')}..."`
      );
    }

    /* one icon set: inline <svg> outside the Icon component fails; the
       Icon svg carries data-bella-icon, Storybook chrome is exempt */
    for (const svg of root.querySelectorAll('svg')) {
      if (svg.hasAttribute('data-bella-icon')) continue;
      /* Storybook chrome: docblock UI, canvas toolbars, and the heading
         permalink anchors (fragment links) it injects beside every h2+ */
      if (svg.closest('button, [class*="docblock"], .sbdocs-preview, a[href^="#"]')) continue;
      out.push(`inline <svg> outside the Icon component: ${(svg.outerHTML ?? '').slice(0, 80)}`);
    }

    for (const el of root.querySelectorAll('*')) {
      const own = Array.from(el.childNodes)
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent ?? '')
        .join('')
        .trim();
      const cs = getComputedStyle(el);
      /* Storybook's own docs chrome renders at its sizes, not BELLA's; the
         floors bind BELLA content. Chrome = any button (BELLA doc content
         renders none; Show code / Copy are Storybook's), the docblock-*
         family (args table, source panels), and canvas toolbars. */
      const sbChrome = el.closest(
        'button, [class*="docblock"], .sbdocs-preview'
      );
      if (own && !sbChrome) {
        const size = parseFloat(cs.fontSize);
        if (size < 13) out.push(`text below 13px (${size}px): "${own.slice(0, 40)}"`);
        if (/\bUnique\b/.test(cs.fontFamily) && size < 24)
          out.push(`Unique below 24px (${size}px): "${own.slice(0, 40)}"`);
      }
      if (el.closest('[data-bella-specimen]')) continue;
      if (cs.backgroundColor === 'rgb(255, 255, 255)')
        out.push(`pure white fill on <${el.tagName.toLowerCase()}>`);
      const inline = el.getAttribute('style');
      if (
        inline &&
        /(?:^|;)\s*(?:background|background-color|color|border|border-color|box-shadow|fill|stroke|outline)[^;]*?(#[0-9a-fA-F]{3,8}\b|rgba?\()/.test(
          inline
        )
      )
        out.push(
          `colour literal in inline style on <${el.tagName.toLowerCase()}>: "${inline.slice(0, 80)}"`
        );
    }
    return out;
  });

  if (fails.length > 0) {
    failed = true;
    console.error(`[audit:quality] docs ${entry.id}:\n  - ${fails.join('\n  - ')}`);
  }
}

await browser.close();
if (failed) {
  process.exit(1);
}
console.log(`audit:quality docs: ${docs.length} pages clean`);
