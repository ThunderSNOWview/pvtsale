# Security policy

## Supported versions

Security fixes are applied on the default branch (`main`). There are no long-term release branches yet; pin a commit or tag for production-like deployments.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for undisclosed security problems.

Instead:

1. Open a **private** [GitHub security advisory](https://github.com/ThunderSNOWview/pvtsale/security/advisories/new) for this repository, **or**
2. Contact the maintainers with enough detail to reproduce the issue (affected component, steps, impact).

We aim to acknowledge reports within a few business days. Coordinated disclosure is preferred: allow time for a fix before public discussion.

## Out of scope

- Issues that require compromising a user’s wallet or machine outside this codebase
- Denial-of-service against public RPC endpoints you do not operate
- Findings in third-party dependencies (report upstream; we will bump versions when fixes exist)

## Secrets

Never commit API keys, private keys, or personal access tokens. If something sensitive was pushed, rotate the credential immediately and remove it from git history if necessary.
