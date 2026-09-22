#!/usr/bin/env node
// Favicon seed picker (brand refresh, 2026-09-22, Elleta): the favicon is the
// pattern E on cream (option 3), and the seed decides which pattern colours
// land under the letter. Picked by measurement, not by eye.
//
// Renders seeds 1..N at 32px in Chromium, reads the pixels under each part of
// the E (top bar, middle bar, bottom bar, stem), and classifies each pixel by
// its nearest pattern colour. A seed PASSES when every part has less than 20%
// cream and a majority of ochre / blue / pink. Among passing seeds the score is
// the strong share, with the middle bar counted double (it is the bar that
// disappears first). Prints the ranking; the pick is locked by hand in
// scripts/build-favicons.mjs (SEED, OFFSET).
//
//   node scripts/score-favicon-seeds.mjs [N=200] [offsetX offsetY]

import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { faviconSvg, faviconLayout } from './build-favicons.mjs';

const N = Number(process.argv[2] ?? 200);
const offset = { x: Number(process.argv[3] ?? 0), y: Number(process.argv[4] ?? 0) };
const PX = 32;

const P = JSON.parse(readFileSync('tokens/bella.json', 'utf8')).primitive.color.pattern;
const palette = Object.fromEntries(Object.entries(P).map(([k, t]) => [k, t.$value]));
const STRONG = ['ground', 'tiger', 'pink']; // ochre, blue, pink

/* the four parts of the E, in 32px device pixels, inset half a pixel so
   antialiased edges are not counted */
const { S, ox, oy, sw, X, Y } = faviconLayout();
const k = PX / S;
const rect = (x0, x1, y0, y1) => ({ x0: (ox + x0) * k + 0.5, x1: (ox + x1) * k - 0.5, y0: (oy + y0) * k + 0.5, y1: (oy + y1) * k - 0.5 });
const PARTS = {
  top: rect(X(10) + sw / 2, X(76), Y(10) - sw / 2, Y(10) + sw / 2),
  middle: rect(X(10) + sw / 2, X(62), Y(66) - sw / 2, Y(66) + sw / 2),
  bottom: rect(X(10) + sw / 2, X(76), Y(90) - sw / 2, Y(90) + sw / 2),
  stem: rect(X(10) - sw / 2, X(10) + sw / 2, Y(10) - sw / 2, Y(90) + sw / 2),
};
const WEIGHT = { top: 1, middle: 2, bottom: 1, stem: 1 };

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<canvas width="32" height="32"></canvas>');

const results = [];
for (let seed = 1; seed <= N; seed++) {
  const svg = faviconSvg(PX, 1, { seed, offset });
  const parts = await page.evaluate(
    async ({ svg, PARTS, palette }) => {
      const img = new Image();
      img.src = 'data:image/svg+xml;base64,' + btoa(svg);
      await img.decode();
      const cv = document.querySelector('canvas');
      const cx = cv.getContext('2d');
      cx.clearRect(0, 0, 32, 32);
      cx.drawImage(img, 0, 0, 32, 32);
      const px = cx.getImageData(0, 0, 32, 32).data;
      const pal = Object.entries(palette).map(([n, h]) => [n, [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))]);
      const out = {};
      for (const [name, r] of Object.entries(PARTS)) {
        const count = {};
        let total = 0;
        for (let y = Math.ceil(r.y0); y < Math.floor(r.y1); y++)
          for (let x = Math.ceil(r.x0); x < Math.floor(r.x1); x++) {
            const i = (y * 32 + x) * 4;
            let best = null;
            let bd = Infinity;
            for (const [n, c] of pal) {
              const d = (px[i] - c[0]) ** 2 + (px[i + 1] - c[1]) ** 2 + (px[i + 2] - c[2]) ** 2;
              if (d < bd) [bd, best] = [d, n];
            }
            count[best] = (count[best] ?? 0) + 1;
            total++;
          }
        out[name] = { count, total };
      }
      return out;
    },
    { svg, PARTS, palette }
  );
  const share = {};
  let pass = true;
  let score = 0;
  let wsum = 0;
  for (const [name, { count, total }] of Object.entries(parts)) {
    const cream = (count.cream ?? 0) / total;
    const strong = STRONG.reduce((a, c) => a + (count[c] ?? 0), 0) / total;
    share[name] = { cream, strong };
    if (cream >= 0.2 || strong <= 0.5) pass = false;
    score += strong * WEIGHT[name];
    wsum += WEIGHT[name];
  }
  results.push({ seed, pass, score: score / wsum, share });
}
await browser.close();

const pct = (v) => `${Math.round(v * 100)}`.padStart(3);
const ranked = results.sort((a, b) => b.pass - a.pass || b.score - a.score);
console.log(`offset ${offset.x} ${offset.y}; ${results.filter((r) => r.pass).length} of ${N} seeds pass`);
console.log('seed pass score | cream% top mid bot stem | strong% top mid bot stem');
for (const r of ranked.slice(0, 12)) {
  const s = r.share;
  console.log(
    `${String(r.seed).padStart(4)} ${r.pass ? ' yes' : '  no'} ${pct(r.score)}   |      ${pct(s.top.cream)} ${pct(s.middle.cream)} ${pct(s.bottom.cream)} ${pct(s.stem.cream)} |        ${pct(s.top.strong)} ${pct(s.middle.strong)} ${pct(s.bottom.strong)} ${pct(s.stem.strong)}`
  );
}
