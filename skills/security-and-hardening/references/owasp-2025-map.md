# OWASP 2025 Security Map

Use this reference when mapping a feature, diff, or plan to OWASP Top 10:2025 and OWASP Cheat Sheet Series topics. Prefer local standards when they are stricter.

## Top 10:2025 Categories

| Category | Check first | Common tests |
| --- | --- | --- |
| A01 Broken Access Control | Object ownership, role checks, tenant boundaries, admin-only actions, path traversal | Cross-user access, forced browsing, IDOR, missing deny path |
| A02 Security Misconfiguration | Headers, CORS, debug mode, default credentials, cloud/service permissions, error disclosure | Header assertions, config review, production-mode checks |
| A03 Software Supply Chain Failures | New dependencies, lockfiles, CI actions, build provenance, package scripts, transitive CVEs | SCA/audit, lockfile diff review, install-script review |
| A04 Cryptographic Failures | TLS, key storage, password hashing, encryption at rest, token signing, algorithm choices | Weak algorithm rejection, key absence/failure tests |
| A05 Injection | SQL/NoSQL/LDAP/template/command/HTML/markdown sinks | Parameterization tests, encoded output tests, malicious payload cases |
| A06 Insecure Design | Missing threat model, unsafe workflow, missing abuse cases, no rate limits | Abuse-case tests, race/replay tests, workflow bypass tests |
| A07 Authentication Failures | Login, sessions, MFA, password reset, account recovery, brute force controls | Rate-limit tests, reset-token expiry, cookie flag tests |
| A08 Software or Data Integrity Failures | Unsafe deserialization, unsigned updates, CI/CD tampering, untrusted artifacts | Tampered artifact tests, deserialization rejection |
| A09 Security Logging and Alerting Failures | Missing audit events, leaked secrets in logs, alert gaps | Assert events are logged and sensitive values are redacted |
| A10 Mishandling of Exceptional Conditions | Stack traces, unsafe retries, open failover, inconsistent errors, leaked internals | Fault injection, generic user error assertions, retry bounds |

## Cheat Sheet Pointers

Use the OWASP Cheat Sheet Series for concrete controls. The most common starting points are:

- Authentication, Password Storage, Session Management, Forgot Password, Multifactor Authentication.
- Authorization, Access Control, Insecure Direct Object Reference Prevention.
- Input Validation, SQL Injection Prevention, OS Command Injection Defense, XSS Prevention, DOM-based XSS Prevention.
- File Upload, SSRF Prevention, Deserialization, Error Handling, Logging.
- Secrets Management, Transport Layer Security, Cryptographic Storage.
- REST Security, GraphQL, Webhook Security, Docker Security, Kubernetes Security, CI/CD Security.
- LLM Prompt Injection Prevention and output handling guidance from OWASP LLM Top 10 materials when AI features are present.

## Review Prompts

Ask these before approving security-sensitive work:

- What data or authority crosses a trust boundary?
- What is the most valuable asset touched by this change?
- What action should an authenticated but unauthorized user fail to perform?
- What happens when validation fails, dependencies are vulnerable, a third party lies, or a downstream service times out?
- Which log line proves the security event happened without leaking the secret or PII?
- Which CI gate would catch a regression before deployment?
