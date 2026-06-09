# CORS Reference

Use this when reviewing Cross-Origin Resource Sharing behavior, browser-origin access, frontend/backend origin policy, cookie credentials, or `Access-Control-*` headers.

## Core Rules

| Concern | Rule |
| --- | --- |
| Authorization | CORS is not authorization. Protected resources still need authentication, object-level authorization, and CSRF controls where relevant. |
| Origins | Allow exact origins only: scheme, host, and port. Do not use broad suffix, prefix, substring, or permissive regex checks. |
| Reflection | Do not reflect arbitrary `Origin` values into `Access-Control-Allow-Origin`. Reflect only after an exact allowlist match. |
| Credentials | Use `Access-Control-Allow-Credentials: true` only when cookies or HTTP auth are required. Never pair credentialed access with wildcard origins. |
| Wildcards | `Access-Control-Allow-Origin: *` is only acceptable for public, non-sensitive, non-credentialed resources. |
| Null origin | Do not allow `Origin: null` unless there is a specific documented reason and no sensitive data exposure. |
| Dynamic origins | When returning a specific origin dynamically, include `Vary: Origin` so caches do not reuse one origin's response for another. |
| Preflight | Treat `OPTIONS` handling as policy, not as a bypass. Allowed methods and headers should be minimal. |
| Exposed headers | Expose only response headers that browser JavaScript actually needs. |

## Safe Pattern

```typescript
const ALLOWED_ORIGINS = new Set([
  'https://app.example.com',
  'https://admin.example.com',
]);

function corsHeaders(origin: string | undefined) {
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Vary': 'Origin',
  };
}
```

Tighten the allowed methods and headers per route when the framework makes that practical.

## Dangerous Patterns

```typescript
// Reflects any attacker-controlled Origin.
res.setHeader('Access-Control-Allow-Origin', req.headers.origin);

// Substring checks can be bypassed by attacker-controlled hostnames.
if (origin.includes('example.com')) allow(origin);

// Credentials plus broad origin exposure leaks sensitive responses.
res.setHeader('Access-Control-Allow-Origin', origin);
res.setHeader('Access-Control-Allow-Credentials', 'true');
```

## Review Checklist

- [ ] Every protected endpoint enforces authorization independent of CORS.
- [ ] Allowed origins are exact strings, including scheme and port where applicable.
- [ ] Origin reflection occurs only after an allowlist match.
- [ ] `Access-Control-Allow-Credentials` is absent unless cookies or HTTP auth are required.
- [ ] Wildcard origin is used only for public, non-sensitive, non-credentialed resources.
- [ ] `Origin: null` is denied unless explicitly justified.
- [ ] Dynamic `Access-Control-Allow-Origin` responses include `Vary: Origin`.
- [ ] Allowed methods, allowed headers, and exposed headers are minimal.
- [ ] CSRF protections are present for cookie-authenticated state-changing requests.

## Sources

- MDN Cross-Origin Resource Sharing guide.
- PortSwigger Web Security Academy CORS guidance.
