/**
 * tungnt-ai-skills plugin for OpenCode.ai
 *
 * OpenCode 1.18.30 loads `default { id, server }`, where `server` returns the
 * classic hooks (`config`, `experimental.chat.messages.transform`). Newer V2
 * hosts load `default { id, setup }` and register skills through
 * `skill.transform`. Both contracts are exported so either host works.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SKILLS_DIR = path.resolve(__dirname, '../../skills');
const BOOTSTRAP_SKILL_PATH = path.join(SKILLS_DIR, 'using-tungnt-ai-skills', 'SKILL.md');
const MARKER = `<EXTREMELY_IMPORTANT>
You have tungnt-ai-skills.`;
const CLASSIFICATION_LIMIT = 512;

export const V2_MAPPING = `**Tool Mapping for OpenCode (V2):**
When skills reference tools you don't have, substitute OpenCode equivalents:
- "Create a todo" / "mark it complete in the todo list" -> V2 has no todo tool; track the plan in a markdown file instead
- \`Subagent (general-purpose):\` -> \`subagent\` with \`agent: "general"\` (or \`agent: "explore"\` for codebase exploration); pass \`sessionID\` to continue a previous subagent
- "Invoke a skill" -> OpenCode's native \`skill\` tool, with the skill directory name as its \`id\` parameter
- "Read a file" -> \`read\`
- "Create a file" / "edit a file" / "delete a file" -> \`patch\` with \`patchText\` when available; otherwise \`write\` to create or overwrite a file, \`edit\` for targeted changes, and \`shell\` for deletion
- "Run a shell command" -> \`shell\` (\`command\`, \`workdir\`, \`timeout\`, \`background\`)
- "Search file contents" / "find files by name" -> \`grep\`, \`glob\`
- "Fetch a URL" -> \`webfetch\`
- "Search the web" -> \`websearch\`

Skills refer to each other as \`superpowers:<name>\`. OpenCode registers bare ids, so drop the \`superpowers:\` prefix: \`superpowers:brainstorming\` → \`skill\` with \`id: "brainstorming"\`.`;

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;

const isOpenValue = (lines) => {
  const first = lines[0];
  if (first === '>' || first === '|') return true;
  const quote = first[0];
  if (quote !== '"' && quote !== "'") return false;
  const joined = lines.join(' ').trim();
  return joined.length < 2 || !joined.endsWith(quote);
};

const foldValue = (lines) => {
  if (lines[0] === '>' || lines[0] === '|') {
    return lines.slice(1).join(' ').trim();
  }
  const quote = lines[0][0];
  let value = lines.join(' ').trim();
  if (quote === '"' || quote === "'") {
    if (value.startsWith(quote)) value = value.slice(1);
    if (value.endsWith(quote)) value = value.slice(0, -1);
  }
  return value.trim();
};

const parseFrontmatter = (block) => {
  const fields = {};
  const lines = block.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    const valueLines = [match[2]];
    while (isOpenValue(valueLines) && i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) {
      valueLines.push(lines[++i].trim());
    }
    fields[match[1]] = foldValue(valueLines);
  }
  return fields;
};

const extractAndStripFrontmatter = (content) => {
  const match = content.match(FRONTMATTER);
  if (!match) return { frontmatter: {}, content };
  return { frontmatter: parseFrontmatter(match[1]), content: match[2] };
};

let bootstrapCache;

const getBootstrapContent = () => {
  if (bootstrapCache !== undefined) return bootstrapCache;
  if (!fs.existsSync(BOOTSTRAP_SKILL_PATH)) {
    bootstrapCache = null;
    return null;
  }
  const { content } = extractAndStripFrontmatter(fs.readFileSync(BOOTSTRAP_SKILL_PATH, 'utf8'));
  bootstrapCache = `${MARKER}

**IMPORTANT: The using-tungnt-ai-skills skill content is included below. It is ALREADY LOADED - you are currently following it. Do NOT use the skill tool to load "using-tungnt-ai-skills" again - that would be redundant.**

${content}

${V2_MAPPING}
</EXTREMELY_IMPORTANT>`;
  return bootstrapCache;
};

const listSkillIds = () => {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort();
};

const partsOf = (message) => {
  if (Array.isArray(message.content)) return message.content;
  if (Array.isArray(message.parts)) return message.parts;
  return [];
};

const isBootstrapPart = (part) =>
  part?.type === 'text' && typeof part.text === 'string' && part.text.startsWith(MARKER);

// Classic OpenCode contract (<= 1.18.30): the host calls `server()` and merges
// the returned hooks. Skills are registered by mutating the merged config.
export const TungntAiSkillsPlugin = async () => ({
  config: async (config) => {
    config.skills = config.skills || {};
    config.skills.paths = config.skills.paths || [];
    if (!config.skills.paths.includes(SKILLS_DIR)) {
      config.skills.paths.push(SKILLS_DIR);
    }
  },

  'experimental.chat.messages.transform': async (_input, output) => {
    const bootstrap = getBootstrapContent();
    const messages = output?.messages;
    if (!bootstrap || !Array.isArray(messages) || messages.length === 0) return;

    const firstUser = messages.find((message) => message?.info?.role === 'user');
    const parts = firstUser?.parts;
    if (!Array.isArray(parts) || parts.length === 0) return;
    if (parts.some((part) => part?.type === 'text' && typeof part.text === 'string' && part.text.startsWith(MARKER))) {
      return;
    }

    parts.unshift({ ...parts[0], type: 'text', text: bootstrap });
  },
});

export default {
  id: 'tungnt-ai-skills',
  server: TungntAiSkillsPlugin,

  setup: async (ctx) => {
    await ctx.skill.transform(async (draft) => {
      for (const id of listSkillIds()) {
        const skillPath = path.join(SKILLS_DIR, id, 'SKILL.md');
        if (!fs.existsSync(skillPath)) continue;

        let parsed;
        try {
          parsed = extractAndStripFrontmatter(fs.readFileSync(skillPath, 'utf8'));
        } catch {
          continue;
        }

        const skill = {
          id,
          name: parsed.frontmatter.name || id,
          path: skillPath,
          content: parsed.content,
        };
        if (parsed.frontmatter.description) {
          skill.description = parsed.frontmatter.description;
        }

        try {
          await draft.add(skill);
        } catch {
          // One rejected skill must not abort the remaining registrations.
        }
      }
    });

    const classifications = new Map();

    // 'child' for a subagent session, 'root' when the bootstrap belongs.
    // A failed or inconsistent lookup is 'root' and is never cached, so the
    // next request classifies again instead of silencing the session forever.
    const classify = async (sessionID) => {
      const cached = classifications.get(sessionID);
      if (cached) return cached;

      let session;
      try {
        session = await ctx.session.get({ sessionID });
      } catch {
        session = undefined;
      }
      if (!session || typeof session !== 'object' || session.id !== sessionID) return 'root';

      const { parentID } = session;
      if (parentID !== undefined && parentID !== null && typeof parentID !== 'string') {
        return 'root';
      }

      const kind = typeof parentID === 'string' ? 'child' : 'root';
      classifications.set(sessionID, kind);
      while (classifications.size > CLASSIFICATION_LIMIT) {
        classifications.delete(classifications.keys().next().value);
      }
      return kind;
    };

    const handler = async (event) => {
      const bootstrap = getBootstrapContent();
      if (!bootstrap) return;

      if (event?.sessionID && (await classify(event.sessionID)) === 'child') return;

      const messages = event?.messages;
      if (!Array.isArray(messages) || messages.length === 0) return;
      if (messages.some((message) => partsOf(message).some(isBootstrapPart))) {
        return;
      }

      const userMessage = messages.find(
        (message) => message.role === 'user' && Array.isArray(message.content)
      );
      if (userMessage) {
        userMessage.content.unshift({ type: 'text', text: bootstrap });
        return;
      }

      // Compaction checkpoints carry no user message: append one after it and
      // leave the checkpoint and the system prompt untouched.
      messages.push({ role: 'user', content: [{ type: 'text', text: bootstrap }] });
    };

    await ctx.session.hook('context', handler);
    await ctx.session.hook('compaction', handler);
    await ctx.session.hook('generate', handler);
  },
};
