# DevSecOps Gates

Use this reference when adding security into a development pipeline. The goal is early detection with the lightest gate that catches the risk.

## Gate Selection

| SDLC stage | Gate | Evidence to keep |
| --- | --- | --- |
| Design | Threat model with trust boundaries, assets, abuse cases, and privacy notes | Spec section, issue, or plan task |
| Pre-commit | Secret scan, lint, unit tests, local smoke scan | Local command output or pre-commit hook result |
| Build | Reproducible install, SCA/dependency audit, SAST/code scanning | CI job URL, SARIF/report, dependency diff |
| Package | Container image scan, Dockerfile hardening, SBOM if required | Image scan report, SBOM artifact |
| Infrastructure | IaC scan for Terraform, Helm, Kubernetes, cloud policies | IaC scan report and accepted-risk notes |
| Test | Negative auth tests, API security tests, DAST/IAST where an environment exists | Test report and target environment |
| Release | High/critical finding review, documented deferrals, owner and review date | Release checklist or risk register |
| Operate | Logging, alerting, vulnerability management, incident response hooks | Dashboards, alerts, runbook links |

## Minimum Policy

- Fail fast on committed secrets, production debug mode, missing lockfile in package-managed apps, or unauthenticated protected endpoints.
- Fail release on reachable critical/high vulnerabilities unless there is a documented compensating control and owner-approved deferral.
- Pin CI actions or equivalent workflow dependencies where the platform supports it.
- Prefer `npm ci`, `pnpm install --frozen-lockfile`, `yarn --frozen-lockfile`, or equivalent deterministic install commands in CI.
- Keep scans scoped to the artifact being changed; broad slow scans belong in scheduled jobs unless the release risk justifies blocking.

## Finding Triage

Use this shape for accepted risk:

```markdown
- Finding:
- Severity:
- Reachability:
- Affected asset:
- Mitigation or compensating control:
- Owner:
- Review date:
```

Do not defer a finding only because the scanner is noisy. First determine whether the vulnerable path is reachable in production and whether the deployment context makes exploitation plausible.
