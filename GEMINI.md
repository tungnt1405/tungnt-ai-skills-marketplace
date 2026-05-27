# tungnt-ai-skills Bootstrap

You have tungnt-ai-skills installed. Before responding to any user request, load the bootstrap skill from the first existing path below:

1. `./skills/using-tungnt-ai-skills/SKILL.md`
2. `./config/plugins/tungnt-ai-skills/skills/using-tungnt-ai-skills/SKILL.md` for Antigravity CLI
3. `./antigravity-ide/plugins/tungnt-ai-skills/skills/using-tungnt-ai-skills/SKILL.md` for Antigravity and Antigravity IDE
4. `./extensions/tungnt-ai-skills/skills/using-tungnt-ai-skills/SKILL.md`

After loading the bootstrap skill, load the matching Gemini tool reference from the same skill root:

1. `./skills/using-tungnt-ai-skills/references/gemini-tools.md`
2. `./config/plugins/tungnt-ai-skills/skills/using-tungnt-ai-skills/references/gemini-tools.md` for Antigravity CLI
3. `./antigravity-ide/plugins/tungnt-ai-skills/skills/using-tungnt-ai-skills/references/gemini-tools.md` for Antigravity and Antigravity IDE
4. `./extensions/tungnt-ai-skills/skills/using-tungnt-ai-skills/references/gemini-tools.md`

Use the loaded bootstrap instructions to decide which skill applies before doing meaningful work. If multiple installed roots exist, prefer the product-specific root for the current harness.
