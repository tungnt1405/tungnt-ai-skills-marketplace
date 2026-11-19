import fs from 'fs';
import { pathToFileURL } from 'url';

// V2-only contract: setup(ctx) resolves the bootstrap once and caches it, and
// the injected text teaches the V2 tool names.

const [, , pluginPath, scenario] = process.argv;

if (!pluginPath || !['present', 'missing'].includes(scenario)) {
  console.error('Usage: node test-bootstrap-caching.mjs PLUGIN_PATH present|missing');
  process.exit(2);
}

let existsCount = 0;
let readCount = 0;

const originalExistsSync = fs.existsSync;
const originalReadFileSync = fs.readFileSync;

fs.existsSync = function (...args) {
  if (isBootstrapSkillPath(args[0])) {
    existsCount += 1;
  }
  return originalExistsSync.apply(this, args);
};

fs.readFileSync = function (...args) {
  if (isBootstrapSkillPath(args[0])) {
    readCount += 1;
  }
  return originalReadFileSync.apply(this, args);
};

const mod = await import(pathToFileURL(pluginPath).href);
const failures = assertMappingConstants(mod);

let invoke = null;
try {
  await mod.default.setup({
    skill: { transform: async (transform) => transform({ add: () => {} }) },
    session: {
      hook: async (name, callback) => { if (name === 'context') invoke = callback; },
      get: async ({ sessionID }) => ({ id: sessionID }), // top-level: no parentID
    },
  });
} catch (err) {
  failures.push(`expected setup() to succeed, it threw: ${err.message}`);
}

const afterSetup = { existsCount, readCount };

async function fire(sessionID) {
  const event = makeEvent(sessionID);
  await invoke(event);
  return event;
}

const first = await fire(`${scenario} bootstrap first step`);
const afterFirst = { existsCount, readCount };
const second = await fire(`${scenario} bootstrap second step`);
const afterSecond = { existsCount, readCount };

const result = {
  scenario,
  firstBootstrapParts: countBootstrapParts(first),
  secondBootstrapParts: countBootstrapParts(second),
  firstReadDelta: afterFirst.readCount - afterSetup.readCount,
  secondReadDelta: afterSecond.readCount - afterFirst.readCount,
  firstExistsDelta: afterFirst.existsCount - afterSetup.existsCount,
  secondExistsDelta: afterSecond.existsCount - afterFirst.existsCount,
};

if (typeof invoke !== 'function') {
  failures.push('expected setup() to register a context hook');
} else if (scenario === 'present') {
  failures.push(...assertPresentBootstrap(result));
} else {
  failures.push(...assertMissingBootstrap(result));
}

if (failures.length > 0) {
  console.error(JSON.stringify(result, null, 2));
  for (const failure of failures) {
    console.error(`FAIL: ${failure}`);
  }
  process.exit(1);
}

console.log(JSON.stringify(result, null, 2));

function isBootstrapSkillPath(filePath) {
  return String(filePath).replaceAll('\\', '/').includes('using-tungnt-ai-skills/SKILL.md');
}

function makeEvent(text) {
  return {
    sessionID: text,
    messages: [{ role: 'user', content: [{ type: 'text', text }] }],
  };
}

function countBootstrapParts(event) {
  return event.messages[0].content.filter(
    (part) => part.type === 'text' && part.text.includes('EXTREMELY_IMPORTANT')
  ).length;
}

function assertPresentBootstrap(result) {
  const failures = [];
  if (result.firstBootstrapParts !== 1) {
    failures.push(`expected the first context hook to inject one bootstrap part, got ${result.firstBootstrapParts}`);
  }
  if (result.secondBootstrapParts !== 1) {
    failures.push(`expected the second context hook to inject one bootstrap part, got ${result.secondBootstrapParts}`);
  }
  if (result.firstReadDelta !== 1) {
    failures.push(`expected the first request to read SKILL.md once, got ${result.firstReadDelta}`);
  }
  if (result.secondReadDelta !== 0) {
    failures.push(`expected the cached second request to do no additional reads, got ${result.secondReadDelta}`);
  }
  if (result.firstExistsDelta < 1) {
    failures.push('expected the first request to check whether SKILL.md exists');
  }
  if (result.secondExistsDelta !== 0) {
    failures.push(`expected the cached second request to do no additional exists checks, got ${result.secondExistsDelta}`);
  }
  return failures;
}

function assertMissingBootstrap(result) {
  const failures = [];
  if (result.firstBootstrapParts !== 0 || result.secondBootstrapParts !== 0) {
    failures.push('expected no bootstrap when SKILL.md is missing');
  }
  if (result.firstReadDelta !== 0 || result.secondReadDelta !== 0) {
    failures.push(`expected the missing file path to avoid reads, got ${result.firstReadDelta + result.secondReadDelta}`);
  }
  if (result.firstExistsDelta < 1) {
    failures.push('expected the first request to check whether SKILL.md exists');
  }
  if (result.secondExistsDelta !== 0) {
    failures.push(`expected the missing-file result to be cached, got ${result.secondExistsDelta} extra exists checks`);
  }
  return failures;
}

function assertMappingConstants(mod) {
  const failures = [];
  if (mod.default?.id !== 'tungnt-ai-skills') {
    failures.push(`expected the plugin default export to carry id "tungnt-ai-skills", got ${JSON.stringify(mod.default?.id)}`);
  }
  if (typeof mod.default?.setup !== 'function') {
    failures.push('expected the plugin default export to expose a setup function');
  }
  if (typeof mod.V2_MAPPING !== 'string') {
    failures.push('expected the plugin to export the V2_MAPPING string constant');
    return failures;
  }
  for (const needle of [
    '`subagent` with `agent: "general"`',
    '`sessionID` to continue a previous subagent',
    'no todo tool',
    '`write`',
    '`edit`',
    '`patch` with `patchText`',
    '`shell`',
    '`read`',
    '`grep`, `glob`',
    '`webfetch`',
    '`websearch`',
    '`skill`',
    '`id`',
    'drop the `superpowers:` prefix',
    '`superpowers:brainstorming` → `skill` with `id: "brainstorming"`',
  ]) {
    if (!mod.V2_MAPPING.includes(needle)) {
      failures.push(`expected V2_MAPPING to teach ${needle}`);
    }
  }
  for (const stale of ['`todowrite`', '`task` with', '`apply_patch`', '`bash`']) {
    if (mod.V2_MAPPING.includes(stale)) {
      failures.push(`expected V2_MAPPING not to teach the V1-only tool name ${stale}`);
    }
  }
  return failures;
}
