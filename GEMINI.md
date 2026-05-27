# tungnt-ai-skills Bootstrap

You have tungnt-ai-skills installed. Before responding to any user request, load exactly one bootstrap skill from the installed plugin root for the current harness.

If this `GEMINI.md` file is loaded from inside the plugin root, load:

- `./skills/using-tungnt-ai-skills/SKILL.md`
- `./skills/using-tungnt-ai-skills/references/gemini-tools.md`

If this `GEMINI.md` file is loaded from `~/.gemini`, use the current Antigravity harness root:

- Antigravity CLI: `./antigravity-cli/plugins/tungnt-ai-skills/skills/using-tungnt-ai-skills/SKILL.md`
- Antigravity CLI tools: `./antigravity-cli/plugins/tungnt-ai-skills/skills/using-tungnt-ai-skills/references/gemini-tools.md`
- Antigravity or Antigravity IDE: `./config/plugins/tungnt-ai-skills/skills/using-tungnt-ai-skills/SKILL.md`
- Antigravity or Antigravity IDE tools: `./config/plugins/tungnt-ai-skills/skills/using-tungnt-ai-skills/references/gemini-tools.md`

Do not try to read paths for another harness if that plugin root is not installed. Use the loaded bootstrap instructions to decide which skill applies before doing meaningful work.
