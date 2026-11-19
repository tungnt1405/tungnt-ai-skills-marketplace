---
name: third-party-skill-dispatch
description: Use when the user names an installed third-party skill and asks to run work through it - "dùng/sử dụng <skill> để/làm <task>", "use <skill> to <task>", "với skill <skill>, <task>", or "skill <skill>: <task>". Rewrites the raw ask into that skill's own input contract with prompt-leverage, checks the third-party allowlist in setting.json, and routes through any activation gate the target declares.
---

# Third-Party Skill Dispatch

Route a named third-party skill correctly instead of improvising around it.

Core principle: **the target skill's own contract decides the prompt shape and the activation path.** Never rewrite a skill's rules from memory, and never bypass its gate to reach the work faster.

## Trigger Forms

| User says | Target skill | Raw task |
| --- | --- | --- |
| `hãy sử dụng ponytail làm <task>` | `ponytail` | `<task>` |
| `use ui-ux-pro-max to <task>` | `ui-ux-pro-max` | `<task>` |
| `với skill <name>, <task>` | `<name>` | `<task>` |
| `<name>: <task>` | `<name>` | `<task>` |

No named skill: this skill does not apply. Continue the normal workflow.

<HARD-GATE>
Before reading any target skill, running any other search, or writing any prompt, print two lines:

```text
find: <path printed by bash scripts/find-skill.sh <name>>
policy: allowed=[<list>] denied=[<list>]
```

Empty `allowed` refuses every name. A refused name gets no prompt, no plan, no code, and no "I'll just do it myself instead". The reply is the refusal block, then stop.
</HARD-GATE>

## Workflow

1. **Parse.** Extract the target skill name and the raw task. If either is missing, ask one short question and stop.
2. **Authorize.** Read settings in order: `tais/setting.json` → plugin `setting.json` → safe defaults. Check `policy.thirdPartySkills.denied` first: a denied name is refused even when it is also in `allowed` or `allowed` is `["*"]`. Then check `policy.thirdPartySkills.allowed`. `allowed` defaults to empty, and an empty list authorizes nothing — the user adds names in the global plugin `setting.json` or in `tais/setting.json` when needed.
3. **Locate the target with the helper script, not free-form search.** Run:
   `bash scripts/find-skill.sh <name>`
   It searches the harness roots — `./.claude/skills`, `./.agents/skills`, `./.opencode/skills`, `./skills`, `~/.claude`, `~/.agents`, `~/.codex`, `~/.copilot`, `~/.gemini` (Gemini CLI and Antigravity), `~/.config/opencode`, `~/.hermes`, `~/.pi`, `~/.cursor` — plus any `<harness>/skills` directory found there, and prints every matching `SKILL.md`. Read the path it prints. Only when the script exits non-zero, report the missing install. Do not scan the filesystem with your own `grep`/`find`/glob calls first.
4. **Read the target's contract.** Read the whole `SKILL.md`, plus any file it points at (`PROMPT.md`, `references/`, scripts). Record three things:
   - **Gate:** may anything invoke it, or only a named parent skill?
   - **Inputs:** what the skill needs before it can start.
   - **No-go:** what the skill forbids (editing files, writing code, committing).
5. **Rewrite the ask.** Load the `prompt-leverage` skill and run its `prompt:` mode on a draft that restates the user's task in the target's input contract: the target's required inputs, its scope, its output shape, its stop condition. Preserve the user's language and intent; add only the blocks the target actually consumes.
6. **Show the rewritten prompt** as one short block before executing: objective, inputs, output contract, stop condition.
7. **Route.**
   - Gate names a parent skill: invoke the parent with the rewritten prompt, naming the target skill as the lens. The parent invokes the target.
   - No gate: invoke the target skill with the rewritten prompt.
8. **Execute inside the target's rules.** A design or analysis lens stays a lens: no coding, no file edits, no commits it forbids. Offer the workflow's next step instead of doing the forbidden work quietly.
9. **Report** which skill ran, the prompt used, and what it produced.

## Denied, Not Allowlisted, Or Not Installed

Refuse. Do not invoke the skill, do not approximate its behavior from memory, and do not continue the task with a different skill unless the user asks.

Denied — no prompt is written, no skill is read:

```text
Skill "<name>" is denied by policy.thirdPartySkills.denied.
No prompt was written and the skill was not invoked.
Choose another approach: remove "<name>" from the deny list, or name a different skill.
```

Deny wins over allow. `denied` beats `allowed`, including `"allowed": ["*"]`.

Not authorized:

```text
Skill "<name>" is not authorized for third-party dispatch.
Allowed: <policy.thirdPartySkills.allowed>.
Add "<name>" to policy.thirdPartySkills.allowed in tais/setting.json (or the plugin setting.json), then ask again.
```

```json
{ "policy": { "thirdPartySkills": { "allowed": ["ponytail", "ui-ux-pro-max"], "denied": [] } } }
```

Allowed but missing — `bash scripts/find-skill.sh <name>` exited non-zero:

```text
Skill "<name>" is allowed but not installed. find-skill.sh searched the harness skill roots (.claude/skills, .agents/skills, .opencode/skills, skills/, ~/.claude, ~/.agents, ~/.codex, ~/.copilot, ~/.gemini, ~/.config/opencode, ~/.hermes, ~/.pi, ~/.cursor).
Install it, then ask again: claude plugin install <plugin>@<marketplace>
```

Extra install roots go in as arguments: `bash scripts/find-skill.sh <name> /custom/skills`.

`"allowed": ["*"]` authorizes every installed skill.

## Rationalizations

| Thought | Reality |
| --- | --- |
| "The task is clear, skip the prompt rewrite" | The rewrite is what the user asked for. Produce it, then execute. |
| "The target's gate is bureaucracy, invoke it directly" | The gate is part of the skill. Bypassing it means you did not use that skill. |
| "The parent skill just adds a round trip" | The parent carries the approval gate the target expects. Route through it. |
| "Not allowlisted, but installed and harmless" | Refusal is the configured behavior. Report the key to edit. |
| "It is also allowlisted, so allow wins" | `denied` wins over `allowed`, including `"allowed": ["*"]`. Write no prompt. |
| "I'll write the prompt anyway, the user can decide" | A denied skill gets no prompt. Refuse and ask for another approach. |
| "The find script might miss a path, I'll search myself" | Run the script; pass extra roots as arguments. It is the search contract. |
| "Empty allowlist probably means allow everything" | Empty `allowed` refuses every name. Print the refusal block. |
| "The skill is refused, but I can do the task myself" | Refused means no work on that task. Ask for another approach. |
| "I know what this skill does from an earlier session" | Read the installed `SKILL.md`. Versions differ. |
| "I'll fill the skill's missing inputs with sensible guesses" | Missing required input means ask. A guessed contract produces confident wrong output. |

## Red Flags

- The rewritten prompt was not shown before execution.
- The target's `SKILL.md` was not read in this session.
- Work continued after a refusal.
- A rewritten prompt exists for a denied skill.
- `scripts/find-skill.sh` was skipped in favor of ad-hoc `grep`/`find`/glob calls.
- No `find:` / `policy:` lines printed before the work started.
- A plan or implementation appeared for a refused skill.
- Output shaped like the user's raw ask instead of the target's output contract.
