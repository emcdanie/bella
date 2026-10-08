#!/usr/bin/env node
// Gate check: AGENTS.md stays consumer-first and in sync with src/components/.
// Fails if:
//   1. Any hex colour literal appears in AGENTS.md
//   2. The consumer part (whole file) exceeds 70 lines
//   3. A component directory in src/components/ is missing from the component map
//   4. AGENTS.md names a component that has no directory in src/components/
//   5. A "Not in BELLA yet" item now exists as a component directory

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AGENTS = path.join(ROOT, 'AGENTS.md');
const COMPONENTS_DIR = path.join(ROOT, 'src/components');

const text = fs.readFileSync(AGENTS, 'utf8');
const lines = text.split('\n');
const failures = [];

// 1. No hex literals
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(HEX_RE);
  if (m) {
    failures.push(`AGENTS.md line ${i + 1}: hex literal found: ${m.join(', ')} — use CSS var names, not values`);
  }
}

// 2. Line count
if (lines.length > 70) {
  failures.push(`AGENTS.md has ${lines.length} lines (limit 70). Move maintainer detail to docs/agents/maintaining.md.`);
}

// 3+4. Component map sync
// Component dirs (exclude 'shared')
const compDirs = fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'shared')
  .map(d => d.name);

// Extract component names from the "Which component" table rows in AGENTS.md.
// We look for backtick-quoted tokens that start with an uppercase letter.
const COMP_RE = /`([A-Z][A-Za-z]+)(?:\s+[^`]*)?\`/g;
const mentionedInFile = new Set();
for (const m of text.matchAll(COMP_RE)) {
  mentionedInFile.add(m[1]);
}

// 3. Every component dir must be mentioned in AGENTS.md
for (const dir of compDirs) {
  if (!mentionedInFile.has(dir)) {
    failures.push(`src/components/${dir}/ is missing from AGENTS.md's component map`);
  }
}

// 4. Every component name in AGENTS.md must have a directory
// (Only check names that look like they could be component names: PascalCase)
const PASCAL_RE = /`([A-Z][A-Za-z]+)(?:\s+[^`]*)?\`/g;
const dirSet = new Set(compDirs);
for (const m of text.matchAll(PASCAL_RE)) {
  const name = m[1];
  // Skip known non-component names that are Pascal-cased
  const SKIP = new Set(['Button', 'Link', 'Input']); // these ARE components
  // Actually skip only non-component tokens (e.g. prop values like "primary", "secondary")
  // We check: if the name looks like a component (matches a dir OR is a known component name)
  // and appears in the map section — just check the dir exists for every name in the map table
  if (!dirSet.has(name) && name.length > 3 && !['variant', 'primary', 'secondary'].includes(name.toLowerCase())) {
    // Only fail if it appears in the job table (between ## Which component and ## Not in BELLA yet)
    const tableSection = text.match(/## Which component for which job[\s\S]*?## Not in BELLA yet/)?.[0] ?? '';
    if (tableSection.includes('`' + name + '`') || tableSection.includes('`' + name + ' ')) {
      failures.push(`AGENTS.md names component "${name}" but src/components/${name}/ does not exist`);
    }
  }
}

// 5. "Not in BELLA yet" items must not exist as component dirs
const NOT_YET_LINE = lines.find(l => l.startsWith('Switch/toggle'));
if (NOT_YET_LINE) {
  // Extract names: "Switch/toggle, Checkbox, Radio, Dialog/Modal, Alert/Toast, Textarea, Pagination, destructive Button"
  const NOT_YET_MAP = {
    'Switch': 'Switch',
    'Checkbox': 'Checkbox',
    'Radio': 'Radio',
    'Dialog': 'Dialog',
    'Modal': 'Modal',
    'Alert': 'Alert',
    'Toast': 'Toast',
    'Textarea': 'Textarea',
    'Pagination': 'Pagination',
  };
  for (const [label, dirName] of Object.entries(NOT_YET_MAP)) {
    if (dirSet.has(dirName)) {
      failures.push(`"Not in BELLA yet" lists "${label}" but src/components/${dirName}/ now exists — update both AGENTS.md and this check`);
    }
  }
}

if (failures.length) {
  console.error('agents-md-check FAILED:');
  for (const f of failures) console.error('  ' + f);
  process.exit(1);
}

console.log(`agents-md-check: OK (${lines.length} lines, ${compDirs.length} components mapped)`);
