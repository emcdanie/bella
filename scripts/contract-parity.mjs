#!/usr/bin/env node
// Contract parity: every Tier 3 contract in tokens/component.json that has a
// shipped component in src/components/ must match that component's exported
// API — the `variants` and `props` arrays in $extensions.bella against the
// component's exported Props interface. Contracts without an implementation
// are exempt, but always listed so a silent gap can't hide.
//
// Added per the 2026-07-21 inspection baseline, finding 1 (stale card
// contract): docs/inspection/2026-07-21-baseline.md.

import { readFileSync, existsSync } from "node:fs";

const kebabToPascal = (s) =>
  s.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("");

const contracts = JSON.parse(readFileSync("tokens/component.json", "utf8")).component;

const failures = [];
const checked = [];
const exempt = [];

for (const key of Object.keys(contracts)) {
  const name = kebabToPascal(key);
  const file = `src/components/${name}/${name}.tsx`;
  if (!existsSync(file)) {
    exempt.push(key);
    continue;
  }

  const meta = contracts[key]?.$extensions?.bella ?? {};
  const src = readFileSync(file, "utf8");
  const ifaceMatch = src.match(
    new RegExp(`export interface ${name}Props\\s*\\{([\\s\\S]*?)\\n\\}`)
  );
  if (!ifaceMatch) {
    failures.push(`${key}: ${file} exports no "interface ${name}Props" the check can read`);
    continue;
  }
  const body = ifaceMatch[1].replace(/\/\*[\s\S]*?\*\//g, "");

  const codeProps = [...body.matchAll(/^\s*([A-Za-z_$][\w$]*)\??:/gm)].map((m) => m[1]);
  const variantMatch = body.match(/\bvariant\?\s*:\s*([^;]+);/);
  const codeVariants = variantMatch
    ? [...variantMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
    : null;

  const diff = (label, contractList, codeList) => {
    const c = new Set(contractList ?? []);
    const k = new Set(codeList ?? []);
    const missing = [...k].filter((x) => !c.has(x));
    const stale = [...c].filter((x) => !k.has(x));
    if (missing.length || stale.length) {
      failures.push(
        `${key}: ${label} out of sync — contract lacks [${missing.join(", ")}], ` +
          `contract has stale [${stale.join(", ")}] (code: ${[...k].join(" | ") || "none"})`
      );
    }
  };

  if (codeVariants || meta.variants) diff("variants", meta.variants, codeVariants);
  if (!meta.props) {
    failures.push(`${key}: contract declares no "props" array but ${name} ships — declare the API`);
  } else {
    diff("props", meta.props, codeProps);
  }
  checked.push(key);
}

console.log(`contract parity: checked ${checked.length ? checked.join(", ") : "none"}`);
console.log(
  `unimplemented contracts (exempt): ${exempt.length ? exempt.join(", ") : "none"}`
);
if (failures.length) {
  console.error("\nContract parity FAILED:");
  for (const f of failures) console.error(`  ${f}`);
  console.error(
    "\nSync tokens/component.json $extensions.bella (variants/props) with the shipped component, or vice versa."
  );
  process.exit(1);
}
console.log("contract parity: OK");
