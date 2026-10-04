#!/usr/bin/env node
// npm audit gate: fail on high/critical advisories unless accepted in
// .npm-audit-allowlist.json. Moderate and below never fail the gate.
//
// Allowlist format (documented, reviewed like code):
//   { "advisories": [ { "id": "GHSA-xxxx-xxxx-xxxx",
//                       "reason": "why this is accepted",
//                       "expires": "YYYY-MM-DD" } ] }
// An entry past its `expires` date no longer suppresses the advisory.
//
// A transitive entry (one npm reports only as "via <package>") is resolved
// down to the advisories underneath it. It passes only when every root
// advisory is accepted; one it cannot resolve to any root always fails.

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

function evaluate(report, allowlist, today) {
  const accepted = new Set(
    (allowlist.advisories ?? [])
      .filter((a) => !a.expires || a.expires >= today)
      .map((a) => a.id)
  );
  const vulns = report.vulnerabilities ?? {};

  const roots = (name, seen = new Set()) => {
    if (seen.has(name) || !vulns[name]) return [];
    seen.add(name);
    return (vulns[name].via ?? []).flatMap((v) =>
      typeof v === "string" ? roots(v, seen) : v.url ? [v.url.split("/").pop()] : []
    );
  };

  const failing = [];
  for (const [name, vuln] of Object.entries(vulns)) {
    if (!["high", "critical"].includes(vuln.severity)) continue;
    const ids = [...new Set(roots(name))];
    const unaccepted = ids.filter((id) => !accepted.has(id));
    if (ids.length === 0 || unaccepted.length > 0) {
      failing.push({ name, severity: vuln.severity, advisories: unaccepted.length ? unaccepted : ["(transitive, no root advisory)"] });
    }
  }
  return failing;
}

// Self-check: the gate must refuse before it is trusted to pass.
{
  const adv = (id) => ({ url: `https://github.com/advisories/${id}` });
  const report = {
    vulnerabilities: {
      root: { severity: "high", via: [adv("GHSA-aaaa"), adv("GHSA-bbbb")] },
      mid: { severity: "high", via: ["root"] },
      top: { severity: "high", via: ["mid"] },
      orphan: { severity: "high", via: ["missing"] },
    },
  };
  const ok = (id) => ({ id, reason: "test", expires: "2099-01-01" });
  const names = (allow) => evaluate(report, { advisories: allow }, "2026-01-01").map((f) => f.name).sort();
  const cases = [
    ["all roots accepted: transitive passes", [ok("GHSA-aaaa"), ok("GHSA-bbbb")], ["orphan"]],
    ["one root not accepted: transitive fails", [ok("GHSA-aaaa")], ["mid", "orphan", "root", "top"]],
    ["expired entry: transitive fails", [ok("GHSA-aaaa"), { ...ok("GHSA-bbbb"), expires: "2025-12-31" }], ["mid", "orphan", "root", "top"]],
  ];
  for (const [label, allow, want] of cases) {
    const got = names(allow);
    if (got.join() !== want.join()) {
      console.error(`npm audit gate self-check failed: ${label}\n  want ${want.join(", ")}\n  got  ${got.join(", ")}`);
      process.exit(2);
    }
  }
}

const allowlistFile = new URL("../.npm-audit-allowlist.json", import.meta.url);
const allow = JSON.parse(readFileSync(allowlistFile, "utf8"));
const today = new Date().toISOString().slice(0, 10);

let audit;
try {
  audit = execSync("npm audit --json", { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
} catch (e) {
  // npm audit exits non-zero when vulnerabilities exist; the JSON is still on stdout
  audit = e.stdout;
}
const failing = evaluate(JSON.parse(audit), allow, today);

if (failing.length) {
  console.error("npm audit gate: unaccepted high/critical advisories:\n");
  for (const f of failing) {
    console.error(`  ${f.name} [${f.severity}] ${f.advisories.join(", ")}`);
  }
  console.error("\nFix, or accept explicitly in .npm-audit-allowlist.json with a reason and expiry.");
  process.exit(1);
}
console.log("npm audit gate: clean (high/critical, allowlist applied)");
