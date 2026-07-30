---
name: ui-ux-pro-max
description: Use when the brainstorming skill is activated and invokes this skill; the skill is a supporting lens for brainstorming evaluation, design, and edits when designing UI/UX
---

# ui-ux-pro-max

Domain skill for UI/UX design intelligence. This is not a process skill; it provides searchable databases and design system generation to guide UI decisions before implementation.

Use this skill as design evidence during the existing project workflow. It is a basis for evaluating UI/UX design and provides design information back to `brainstorming` so that `brainstorming` has analytical evaluations to proceed further.

<HARD-GATE>
ONLY ACTIVATE when invoked by the `brainstorming` skill. DO NOT automatically activate the skill, DO NOT activate after other skills except the `brainstorming` skill.

IF not `brainstorming`, stop and return the message "The ui-ux-pro-max skill was not activated because it was invoked by a skill other than `brainstorming`."

IF the `brainstorming` skill invokes to request support, notify `Using the ui-ux-pro-max skill to work...`

IF the user self-activates by calling `/ui-ux-pro-max` directly, only perform the exact task that the domain skill is responsible for and provide suggestions for the user.

```plaintext
Suggestion: To continue, use:

/brainstorming Based on the analysis from the ui-ux-pro-max skill above, continue building the spec and detailed implementation plan to execute.
```

ABSOLUTELY NO CODING, NO EDITING FILES when using the `ui-ux-pro-max` skill.
</HARD-GATE>

## How to Use

Before doing UI/UX design, review, or implementation work, read the full workflow instructions in:
`skills/ui-ux-pro-max/PROMPT.md`

That file contains:
- Prerequisites (Python 3.x required)
- Step-by-step workflow (analyze -> generate design system -> detailed searches -> stack guidelines)
- Integration rules for the existing `tungnt-ai-skills` workflow
- Search reference (domains, stacks, keywords)
- Common rules for professional UI
- Pre-delivery checklist
