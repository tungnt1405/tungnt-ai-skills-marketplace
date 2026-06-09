---
name: security-and-hardening
description: Use when securing or reviewing software that handles user input, authentication, authorization, sessions, secrets, sensitive data, file uploads, webhooks, URL fetches, external integrations, dependencies, CI/CD pipelines, LLM output, OWASP Top 10 risks, or DevSecOps gates
---

# Security and Hardening

## Overview

Treat security as a design constraint, not a release chore. Any boundary that accepts data, identity, code, model output, or infrastructure configuration needs explicit validation, authorization, observability, and abuse-case tests.

Use stricter local security standards first.

## When to Use

- Building or reviewing authentication, authorization, session, tenant isolation, or admin behavior.
- Accepting untrusted input: forms, APIs, files, URLs, webhooks, callbacks, queues, imports, third-party responses, or LLM output.
- Handling secrets, credentials, PII, payment data, tokens, encryption, audit logs, or error disclosure.
- Changing CORS, cross-origin browser access, cookie credentials, CSRF-sensitive requests, or frontend/backend origin policy.
- Adding dependencies, containers, CI/CD workflows, deployment automation, IaC, or security gates.
- Mapping code to OWASP Top 10, OWASP Cheat Sheet Series, DevSecOps, SAST, DAST, IAST, SCA, or secret scanning concerns.

Do not use this as a replacement for a qualified security review, threat model, penetration test, or compliance assessment.

## Domain Workflow Trigger

This is a domain skill for application security and DevSecOps. It supplies security judgment inside the selected process workflow; it does not replace `brainstorming`, `writing-plans`, `executing-plans`, `subagent-driven-development`, or review skills.

Invoke this skill during a workflow when the work includes security-sensitive behavior:

- During `brainstorming`, use it to identify assets, trust boundaries, abuse cases, and security acceptance criteria.
- During `writing-plans`, use it to convert threat-model findings into failing tests, CI checks, review gates, and explicit non-goals.
- During execution, use it before changing security-sensitive code; if implementation reveals an unmodeled risk, stop and revise the spec or plan instead of inventing security behavior in code.
- During review, use it as a security lens for diffs that touch input handling, access control, secrets, dependency changes, CI/CD, infrastructure, external calls, or LLM/tool output.

## TDD Trigger Coverage

These are the RED scenarios this skill must prevent:

| Trigger | Baseline failure | Skill counter |
| --- | --- | --- |
| "Just add the endpoint; auth is already handled" | Missing object-level authorization or tenant check | Test ownership, roles, and deny-by-default paths |
| "The framework validates input" | Trusts body/query/path/file/URL data outside a schema | Validate every external boundary with allowlists and size/type limits |
| "This URL comes from a trusted user" | SSRF to localhost, cloud metadata, or private networks | Allowlist hosts, restrict schemes, block private IPs and redirects |
| "Dependency update is routine" | Supply-chain risk enters through packages, lockfiles, scripts, or CI | Review new dependencies, lock installs, run SCA, inspect install scripts |
| "We can add security checks after feature work" | No abuse cases, logging, rate limits, or negative tests | Threat model first and encode abuse cases as tests |
| "LLM output is only text" | Model output reaches SQL, shell, DOM, tools, or file paths | Treat model output as untrusted input; parse, validate, authorize, encode |

## Core Pattern

| Concern | Rule |
| --- | --- |
| Trust boundaries | Name every place untrusted data crosses into the system before coding. |
| Assets | Identify credentials, PII, money movement, admin actions, tenant data, and deployment authority. |
| Abuse cases | Write misuse paths beside use cases and test the denial path first. |
| Input | Validate path, query, header, body, file, webhook, third-party, and model-output data at the boundary. |
| Authorization | Check permissions at the object/action boundary; authentication alone is never enough. |
| Secrets | Keep secrets out of source, logs, prompts, build output, and client-accessible storage. Rotate any exposed secret. |
| Output | Encode for the target context: HTML, SQL, shell, JSON, URLs, files, logs, and LLM tools are different sinks. |
| Dependencies | Commit lockfiles, use reproducible installs, review new packages, and triage reachable vulnerabilities. |
| Observability | Log security events without sensitive values; alert on meaningful failure patterns. |
| Pipeline | Add fast local checks first, then CI gates for SCA, SAST, secrets, IaC/container scans, tests, and release policy. |
| CORS | Use exact origin allowlists, credentials only when required, `Vary: Origin` for dynamic origins, and authorization on every protected resource. |

## OWASP Top 10:2025 Quick Map

Use the 2025 categories as the default map for modern web application work:

| Risk | Prevention focus |
| --- | --- |
| A01:2025 Broken Access Control | Object-level authorization, tenant isolation, deny-by-default policies. |
| A02:2025 Security Misconfiguration | Harden defaults, headers, CORS, error handling, cloud/service config. |
| A03:2025 Software Supply Chain Failures | Dependency review, SCA, lockfiles, signed/provenance-aware builds, CI hardening. |
| A04:2025 Cryptographic Failures | Strong algorithms, key management, TLS, secret rotation, no custom crypto. |
| A05:2025 Injection | Parameterized queries, command allowlists, contextual encoding, schema validation. |
| A06:2025 Insecure Design | Threat modeling, abuse cases, rate limits, safe workflows, secure defaults. |
| A07:2025 Authentication Failures | MFA where needed, secure sessions, password hashing, reset-token expiry, rate limits. |
| A08:2025 Software or Data Integrity Failures | Trusted update paths, artifact integrity, safe deserialization, protected CI/CD. |
| A09:2025 Security Logging and Alerting Failures | Audit trails, detection, alerting, incident-ready logs without secrets. |
| A10:2025 Mishandling of Exceptional Conditions | Generic user errors, bounded retries, safe fallbacks, no stack traces or secret leaks. |

For deeper mapping and cheat sheet pointers, read `references/owasp-2025-map.md`.

## CORS Review

Read `references/cors.md` before changing `Access-Control-*` headers, framework CORS middleware, credentialed browser requests, cookie-based APIs, or cross-origin frontend/backend integration. CORS is not authorization and does not replace CSRF protection.

## DevSecOps Pipeline Gates

Use progressive gates instead of one late security phase:

| Stage | Minimum gate |
| --- | --- |
| Design | Threat model trust boundaries, assets, abuse cases, and privacy impact. |
| Pre-commit | Secret scan, lint, focused tests, and a local security smoke scan where useful. |
| Build | SCA/dependency audit, SAST or code scanning, reproducible install from lockfile. |
| Package | Container/image/IaC scan when those artifacts exist. |
| Test | Negative security tests, API auth tests, DAST/IAST when an environment exists. |
| Release | Review high/critical findings, documented deferrals, owner, and review date. |
| Operate | Security logs, alerting, vulnerability management, incident response hooks. |

For pipeline details, read `references/devsecops-gates.md`.

## Local Smoke Scan

Use `scripts/security-smoke-scan.mjs` for a fast heuristic pass when a repo has JavaScript/TypeScript or text config files:

```bash
node skills/security-and-hardening/scripts/security-smoke-scan.mjs --path . --fail-on high
node skills/security-and-hardening/scripts/security-smoke-scan.mjs --path . --json
```

The script detects common red flags such as likely secrets, `eval`, unsafe HTML sinks, wildcard CORS, insecure cookies, SQL string interpolation, risky URL fetches, missing lockfiles, and CI workflows that install without a lockfile. It is intentionally zero-dependency and conservative. It does not replace SAST, SCA, DAST, IAST, secret-scanning, or a human review.

## Security Review Checklist

- [ ] Trust boundaries and assets are named.
- [ ] Abuse cases have tests, including denial paths.
- [ ] User-controlled input is schema-validated at the boundary.
- [ ] Authorization is checked for every protected object/action.
- [ ] SQL, NoSQL, shell, DOM, URL, file, and LLM/tool sinks are parameterized, allowlisted, or encoded.
- [ ] Sessions use `httpOnly`, `secure`, `sameSite`, expiry, and rotation where appropriate.
- [ ] Secrets are loaded from a secret store or environment, never committed, logged, or prompted into an LLM.
- [ ] Dependencies are locked, reviewed, and audited; critical/high reachable findings are fixed or formally deferred.
- [ ] Security headers, CORS, error handling, and rate limits match the deployment context.
- [ ] Logs capture security events without sensitive data and have alerting for meaningful patterns.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Treating authentication as authorization | Add object/action permission checks and tests for cross-user access. |
| Validating only on the client | Validate again at the server or service boundary. |
| Logging full request bodies | Redact tokens, passwords, cookies, authorization headers, PII, and payment data. |
| Allowing arbitrary outbound URLs | Use scheme/host allowlists and block private/reserved IPs and redirects. |
| Deferring high/critical dependency findings without context | Determine reachability, mitigation, owner, and review date. |
| Relying on prompts as a security boundary | Enforce permissions and validation in code, not model instructions. |

## Red Flags

- API endpoint, action, job, or resolver has authentication but no resource-level authorization.
- String concatenation reaches SQL, NoSQL, LDAP, shell, file paths, HTML, markdown-to-HTML, or templates.
- Server fetches a URL influenced by users, third parties, or model output.
- CORS allows `*` with credentials, or cookies are missing `httpOnly`, `secure`, or `sameSite`.
- New dependency, container image, workflow action, or install script enters without review.
- Secrets, tokens, cookies, authorization headers, stack traces, or PII appear in logs or errors.
- CI/CD workflow can deploy from untrusted branches, mutable actions, or unchecked artifacts.
- LLM output invokes tools, queries databases, writes files, or renders HTML without validation.

## Verification

After security-sensitive changes:

- [ ] Run focused negative tests for access control, validation, rate limits, and failure behavior.
- [ ] Run the project audit/scanning commands available in the repo (`npm audit`, SCA, SAST, secret scan, IaC/container scan).
- [ ] Run `node skills/security-and-hardening/scripts/security-smoke-scan.mjs --path . --fail-on high` when applicable.
- [ ] Review the diff for new sinks, dependencies, secrets, and deployment authority.
- [ ] Document any accepted risk with severity, reachability, mitigation, owner, and review date.

## Source Notes

Based on OWASP Top 10:2025, OWASP Cheat Sheet Series, OWASP DevSecOps Guideline, OWASP Top 10 for LLM Applications, and common secure coding review practice.
