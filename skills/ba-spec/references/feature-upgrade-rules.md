# Feature Upgrade Rules

Apply when the input includes:

- Existing spec.
- Current behavior.
- Change request.
- User says "upgrade", "fix", "add", "change", or "change request". Vietnamese examples: "nâng cấp", "sửa", "bổ sung", "thay đổi".

## Required upgrade sections

Add these sections to the spec:

1. Current behavior.
2. Required changes.
3. Impact scope.
4. Affected roles.
5. Affected data/state.
6. Affected business rules.
7. Backward compatibility.
8. Regression risks.
9. Migration or transition notes, if applicable.

## Comparison table

Use this format:

```markdown
| ID | Area | Current state | After change | Impact / risk |
|---|---|---|---|---|
| CHG-001 | ... | ... | ... | ... |
```

## Preservation rule

If old requirement IDs exist, preserve them. Add new IDs only for new/changed requirements.

## Do not assume

Do not infer old behavior from the new request unless it is explicitly described. If missing, add an open question.
