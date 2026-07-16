# Output Language Rules

## Default language

All user-facing deliverables must follow the conversation language unless the user explicitly requests another language.

Use the output language for:

- Section names.
- Business descriptions.
- User stories.
- Functional requirements.
- Business rules.
- Acceptance criteria.
- Assumptions.
- Open questions.
- Clarification questions.
- Dev/QA notes.
- HTML visible text.

Keep these items in English for machine readability:

- Requirement IDs: `FR-001`, `BR-001`, `AC-001`, etc.
- Confidence tags: `[PROVIDED]`, `[FIGMA]`, `[FILE]`, `[INFERRED]`, `[ASSUMPTION]`, `[OPEN_QUESTION]`.
- File names unless the user requests localization.
- Gherkin keywords may remain `Given`, `When`, `Then`, `And`.

## Writing style

Prefer concise BA language in the output language.

When the output language is Vietnamese, prefer:

- “Hệ thống phải…” for mandatory system behavior.
- “Người dùng có thể…” for user capability.
- “Không được…” for prohibition.
- “Khi… thì…” for conditional rules.
- “Cần xác nhận…” for unresolved items.

Avoid vague phrasing in any language:

- “xử lý phù hợp” / “handle appropriately”
- “vân vân” / “etc.” without a closed list
- “tùy trường hợp” / “case by case” without listing cases
- “nếu cần” / “if needed” without owner/condition

## Do not translate tags

Correct:

```text
The system must record the transaction status as `approved`. [PROVIDED]
```

Incorrect:

```text
The system must record the transaction status as `approved`. [TRANSLATED_TAG]
```
