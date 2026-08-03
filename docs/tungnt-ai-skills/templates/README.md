# Shared Template Root

This directory is the shared template root for root skills in `tungnt-ai-skills`.
Root skills reference templates from here and from `plans/templates/` — there is no
separate `skills/templates/` directory.

## Template Registry

| Root | Contents |
| --- | --- |
| `plans/templates/` | Plan templates: `bug-fix-template.md`, `feature-implementation-template.md`, `refactor-template.md`, `template-usage-guide.md` |
| `docs/tungnt-ai-skills/templates/` | Shared design and workflow templates for root skills |

### How root skills reference templates

1. Look up the template name in the registry above.
2. Use a relative path from the repo root (e.g., `plans/templates/feature-implementation-template.md`).
3. Do **not** create a `skills/templates/` directory — all shared templates live under the two roots listed here.
