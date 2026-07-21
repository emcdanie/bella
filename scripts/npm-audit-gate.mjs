#!/usr/bin/env node
// npm audit gate: fail on high/critical advisories unless accepted in
// .npm-audit-allowlist.json. Moderate and below never fail the gate.
//
// Allowlist format (documented, reviewed like code):
//   { "advisories": [ { "id": "GHSA-xxxx-xxxx-xxxx",
//                       "reason": "why this is accepted",
//                       "expires": "YYYY-MM-DD" } ] }
// An entry past its `expires` date no longer suppresses the advisory.

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const allowlistFile = new URL("../.npm-audit-allowlist.json", import.meta.url);
const allow = JSON.parse(readFileSync(allowlistFile, "utf8"));
const today = new Date().toISOString().slice(0, 10);
const accepted = new Map(
  (allow.advisories ?? [])
    .filter((a) => !a.expires || a.expires >= today)
    .map((a) => [a.id, a])
);

let audit;
try {
  audit = execSync("npm audit --json", { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
} catch (e) {
  // npm audit exits non-zero when vulnerabilities exist; the JSON is still on stdout
  audit = e.stdout;
}
const report = JSON.parse(audit);

const failing = [];
for (const [name, vuln] of Object.entries(report.vulnerabilities ?? {})) {
  if (!["high", "critical"].includes(vuln.severity)) continue;
  const ids = (vuln.via ?? [])
    .filter((v) => typeof v === "object" && v.url)
    .map((v) => v.url.split("/").pop());
  const unaccepted = ids.filter((id) => !accepted.has(id));
  if (ids.length === 0 || unaccepted.length > 0) {
    failing.push({ name, severity: vuln.severity, advisories: unaccepted.length ? unaccepted : ["(transitive)"] });
  }
}

if (failing.length) {
  console.error("npm audit gate: unaccepted high/critical advisories:\n");
  for (const f of failing) {
    console.error(`  ${f.name} [${f.severity}] ${f.advisories.join(", ")}`);
  }
  console.error("\nFix, or accept explicitly in .npm-audit-allowlist.json with a reason and expiry.");
  process.exit(1);
}
console.log("npm audit gate: clean (high/critical, allowlist applied)");
