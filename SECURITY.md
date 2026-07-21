# Security policy

## Reporting a vulnerability

Report vulnerabilities privately through GitHub:
**[Security → Report a vulnerability](https://github.com/emcdanie/bella/security/advisories/new)**.

Do not open a public issue for security problems, and do not email — private advisories are the only reporting channel. You'll get a response there; fixes ship as ordinary tagged releases with a `CHANGELOG.md` entry.

## Scope

BELLA is a design-token package: JSON sources, a Python build script, and generated CSS/JSON/HTML plus a Storybook workspace. Relevant reports include things like malicious or injectable content in generated output, build-script issues, and supply-chain problems in the npm dev-dependencies. Visual or accessibility bugs are not security issues — use the normal issue templates.

## Supported versions

Only the latest tagged release (`vX.Y.Z-bella`) is supported.
