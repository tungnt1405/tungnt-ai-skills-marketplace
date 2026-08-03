# Input Classification Rules

At the start of every task, classify input into these categories:

| Category | Meaning |
|---|---|
| `business_text` | Natural-language business requirement, workflow, policy, or stakeholder note. |
| `figma_screenshot` | Screenshot/exported image from Figma. |
| `figma_link` | Any URL containing `figma.com`. |
| `related_files` | Uploaded/referenced Markdown, PDF, spreadsheet, HTML, text, ticket, PRD, meeting note, API note. |
| `existing_spec` | Old feature spec or current behavior documentation. |
| `change_request` | Request to modify an existing behavior. |
| `unclear_input` | Input too small, conflicting, or missing critical details. |

## Required generated section

Every generated spec must include an input summary section in the output language. Vietnamese example:

```markdown
## Input summary

| Input type | Yes? | Notes |
|---|---:|---|
| Business text | Yes/No | ... |
| Figma screenshot | Yes/No | ... |
| Figma link | Yes/No | ... |
| Related files | Yes/No | ... |
| Existing spec | Yes/No | ... |
| Change request | Yes/No | ... |
| Unclear input | Yes/No | ... |
```

## Classification behavior

- If at least one Figma URL exists, set `figma_link` to the output-language equivalent of yes and trigger the Figma MCP evidence gate.
- If the user provides a business workflow with numbered steps, treat it as `business_text` and extract flow steps.
- If the user provides both an old spec and requested changes, treat as `feature_upgrade` unless they say it is a new feature.
- If input is very small but user asks to proceed, create a draft with assumptions and open questions.
