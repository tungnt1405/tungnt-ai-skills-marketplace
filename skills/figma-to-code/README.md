# vit-agent-skill: Figma implement fidelity

This package contains an agent skill for converting a single Figma selection into production frontend code with deterministic extraction and visual validation.

Bundled location in this repo:

```text
skills/figma-to-code/SKILL.md
skills/figma-to-code/scripts/extract_figma_ir.py
```

The key design choice is to run the extractor before the agent reads the raw MCP dump. This reduces token usage and prevents sibling frames, hidden layers, and off-canvas variants from contaminating implementation.
