# Security Policy

## Supported versions

Only the latest published version of `radix-tour` receives security fixes.

## Reporting a vulnerability

Please do not open a public issue. Use GitHub's private vulnerability reporting:
https://github.com/bw3sley/radix-tour/security/advisories/new

Expect an acknowledgement within 7 days. Confirmed vulnerabilities are fixed in a new release and
disclosed in a GitHub security advisory once a fix is available.

## Supply chain

- Releases are published from GitHub Actions with npm provenance attestations.
- The package has no install scripts and ships only the `dist` folder.
- Verify a release with `npm audit signatures`.
