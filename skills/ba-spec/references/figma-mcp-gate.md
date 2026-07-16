# Figma MCP Evidence Gate

This rule file is mandatory whenever the input contains:

- Any `figma.com` URL.
- A Figma screenshot.
- A user instruction to use Figma.

## Core rule

Do not create or edit `feature-spec.md` or `feature-spec.html` until the Figma evidence gate is completed.

The gate is completed only when one of these outcomes is recorded:

1. `MCP_SUCCESS`: Figma MCP was used and evidence was extracted.
2. `MCP_UNAVAILABLE`: No Figma MCP tool/server is available in the current agent environment.
3. `MCP_FAILED`: MCP was attempted but failed.
4. `USER_SKIPPED`: User explicitly asked to skip Figma/MCP and proceed from business text only.
5. `SCREENSHOT_ONLY`: No MCP was available, but user supplied screenshots/exported frames that were analyzed.

## Scope boundary

Use Figma only as BA evidence for fields, labels, actions, states, layout cues, and open UI questions. Do not generate frontend code, invoke UI implementation workflows, or treat Figma as confirmed business logic.

Prefer focused frame/component evidence. Do not inspect a full Figma document unless debugging an unavailable/missing selected node, because full documents often include sibling frames, hidden variants, and unrelated screens.

## Required steps

### Step 1. Detect Figma links

List every Figma URL with a stable ID.

```markdown
| ID | Label | URL | Business step | File key | Node ID |
|---|---|---|---|---|---|
| FIG-LINK-001 | app1 | https://... | Step 1 | L03ABdfodfQk6x1GzuURDI | 5691:298220 |
```

### Step 2. Probe MCP availability

Use the host agent's available MCP discovery mechanism if present.

Examples by client, when available:

- List MCP servers/tools/resources.
- Check whether a Figma MCP server is configured.
- Check whether tools can inspect Figma file/frame/node.
- Check whether Figma Desktop/plugin bridge is running for local bridge servers.

Do not invent a successful MCP result.

If MCP tooling is not exposed by the current host, mark `MCP_UNAVAILABLE`.

### Step 3. Attempt extraction per Figma link or selected node

For every Figma URL, attempt to extract BA-relevant data:

- File name.
- Page or frame name.
- Node ID.
- Visible screen title.
- Visible labels.
- Buttons/actions.
- Input fields.
- Status badges.
- Error/success/empty/loading states.
- Dialogs/modals.
- Prototype/interactions if available.
- Notes/annotations if available.

### Step 4. Record result before spec generation

Create a Figma evidence log section or file in the output language before spec generation.

Required format, shown below as an example:

```markdown
## Figma evidence log

| ID | Label | Business step | Original Figma link | Node ID | MCP result | Extracted UI evidence | Notes |
|---|---|---|---|---|---|---|---|
| FIG-001 | app1 | Step 1 | [app1](https://www.figma.com/design/...) | 5691:298220 | MCP_SUCCESS | Screen ..., button ..., field ... | ... |
| FIG-002 | app2 | Step 1 | [app2](https://www.figma.com/design/...) | 5688:298030 | MCP_FAILED | Could not extract evidence | Error: ... |
```

### Step 5. Decide whether to proceed

Proceed only with the evidence that exists:

- If `MCP_SUCCESS`, mark extracted UI facts as `[FIGMA]`.
- If `MCP_UNAVAILABLE` or `MCP_FAILED`, do not write any `[FIGMA]` facts for that link unless there is a screenshot/exported frame.
- If business text is sufficient, create a draft using `[PROVIDED]` and mark UI details as `[OPEN_QUESTION]`.
- If UI details are critical and unavailable, ask for fallback input.

## Required fallback message

When MCP is unavailable or failed, write a short message in the output language. Example:

```text
I cannot read Figma directly through MCP in the current environment. I will not assume Figma has been analyzed. You can provide a screenshot, exported frame, or copied text from Figma, or confirm that I should create a draft based only on the available business description.
```

## What not to do

Do not say:

- "I analyzed Figma" without evidence rows.
- "Based on Figma" if no MCP/screenshot extraction happened.
- "The Figma screens show..." unless extracted UI facts are listed.
- "MCP is not needed" when the user supplied Figma links.

## Evidence interpretation

Figma evidence can support UI observations, not full business rules.

Correct:

```text
[FIGMA] The screen has a "Save" button.
[INFERRED] The user may be able to save information at this step.
[OPEN_QUESTION] Does saving at this step create a draft state or move to the next step?
```

Incorrect:

```text
[FIGMA] When "Save" is clicked, the system changes the state to `pending_approval`.
```

Only write the second statement if the transition is explicitly visible in Figma annotation/prototype or supplied by user/file.


## Original link preservation

Every original Figma URL supplied by the user must appear in the final package. Do not shorten the final handoff to only node IDs.
