import os from 'node:os';
import path from 'node:path';

export const PLUGIN_NAME = 'tungnt-ai-skills';

const REQUIRED_SKILL_FILES = [
  'skills/using-tungnt-ai-skills/SKILL.md',
];

const ANTIGRAVITY_PLUGIN_ENTRIES = [
  'plugin.json',
  'skills',
];

const ANTIGRAVITY_PLUGIN_REQUIRED_FILES = [
  'plugin.json',
  ...REQUIRED_SKILL_FILES,
];

const ANTIGRAVITY_GLOBAL_ENTRIES = [
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  'gemini-extension.json',
];

function homeDir(env = process.env) {
  return env.HOME || env.USERPROFILE || os.homedir();
}

function joinHome(env, ...segments) {
  return path.join(homeDir(env), ...segments);
}

export const TARGETS = [
  {
    id: 'claude',
    displayName: 'Claude Code',
    defaultTarget: (env = process.env) => joinHome(env, '.claude', 'plugins', 'cache'),
    expectedParent: (env = process.env) => joinHome(env, '.claude', 'plugins'),
    requiredFiles: [...REQUIRED_SKILL_FILES, '.claude-plugin/marketplace.json', '.claude-plugin/plugin.json'],
    nativeCommands: [
      ['claude', 'plugin', 'marketplace', 'add', 'tungnt1405/tungnt-ai-skills-marketplace'],
      ['claude', 'plugin', 'install', 'tungnt-ai-skills@tungnt-ai-skills-marketplace'],
      ['claude', 'plugin', 'enable', 'tungnt-ai-skills@tungnt-ai-skills-marketplace'],
    ],
    postInstallNotes: 'Installed and enabled through Claude Code marketplace commands.',
  },
  {
    id: 'codex',
    displayName: 'Codex',
    defaultTarget: (env = process.env) => joinHome(env, '.codex', '.tmp', 'plugins', 'plugins', 'tungnt-ai-skills-marketplace'),
    expectedParent: (env = process.env) => joinHome(env, '.codex', '.tmp', 'plugins', 'plugins'),
    includedEntries: ['.codex-plugin', 'assets', 'skills'],
    requiredFiles: [...REQUIRED_SKILL_FILES, '.codex-plugin/plugin.json'],
    marketplaceFile: (env = process.env) => joinHome(env, '.codex', '.tmp', 'plugins', '.agents', 'plugins', 'marketplace.json'),
    marketplaceEntry: {
      name: PLUGIN_NAME,
      source: {
        source: 'local',
        path: './plugins/tungnt-ai-skills-marketplace',
      },
      policy: {
        installation: 'AVAILABLE',
        authentication: 'ON_INSTALL',
      },
      category: 'Coding',
    },
    postInstallNotes: 'Codex local marketplace entry written. Open /plugins and install tungnt-ai-skills if it is not already enabled.',
  },
  {
    id: 'copilot',
    displayName: 'GitHub Copilot CLI',
    defaultTarget: (env = process.env) => joinHome(env, '.copilot', 'plugins', PLUGIN_NAME),
    expectedParent: (env = process.env) => joinHome(env, '.copilot', 'plugins'),
    requiredFiles: [...REQUIRED_SKILL_FILES, 'AGENTS.md'],
    postInstallNotes: 'Enable tungnt-ai-skills through the Copilot plugin flow if your Copilot CLI requires activation.',
  },
  {
    id: 'gemini',
    displayName: 'Gemini CLI',
    defaultTarget: (env = process.env) => joinHome(env, '.gemini', 'extensions', PLUGIN_NAME),
    expectedParent: (env = process.env) => joinHome(env, '.gemini', 'extensions'),
    requiredFiles: [...REQUIRED_SKILL_FILES, 'GEMINI.md', 'gemini-extension.json'],
    postInstallNotes: 'Restart Gemini CLI or reload extensions after installation.',
  },
  {
    id: 'agy',
    displayName: 'Antigravity CLI',
    defaultTarget: (env = process.env) => joinHome(env, '.gemini', 'antigravity-cli', 'plugins', PLUGIN_NAME),
    expectedParent: (env = process.env) => joinHome(env, '.gemini', 'antigravity-cli', 'plugins'),
    includedEntries: ANTIGRAVITY_PLUGIN_ENTRIES,
    extraCopies: [
      {
        destination: (env = process.env) => joinHome(env, '.gemini'),
        includedEntries: ANTIGRAVITY_GLOBAL_ENTRIES,
      },
    ],
    requiredFiles: ANTIGRAVITY_PLUGIN_REQUIRED_FILES,
    postInstallNotes: 'Restart Antigravity CLI or reload plugins after installation.',
  },
  {
    id: 'antigravity',
    displayName: 'Google Antigravity',
    defaultTarget: (env = process.env) => joinHome(env, '.gemini', 'config', 'plugins', PLUGIN_NAME),
    expectedParent: (env = process.env) => joinHome(env, '.gemini', 'config', 'plugins'),
    includedEntries: ANTIGRAVITY_PLUGIN_ENTRIES,
    extraCopies: [
      {
        destination: (env = process.env) => joinHome(env, '.gemini'),
        includedEntries: ANTIGRAVITY_GLOBAL_ENTRIES,
      },
    ],
    includeInAll: false,
    requiredFiles: ANTIGRAVITY_PLUGIN_REQUIRED_FILES,
    postInstallNotes: 'Restart Antigravity or reload plugins after installation.',
  },
  {
    id: 'antigravity-ide',
    displayName: 'Antigravity IDE',
    defaultTarget: (env = process.env) => joinHome(env, '.gemini', 'config', 'plugins', PLUGIN_NAME),
    expectedParent: (env = process.env) => joinHome(env, '.gemini', 'config', 'plugins'),
    includedEntries: ANTIGRAVITY_PLUGIN_ENTRIES,
    extraCopies: [
      {
        destination: (env = process.env) => joinHome(env, '.gemini'),
        includedEntries: ANTIGRAVITY_GLOBAL_ENTRIES,
      },
    ],
    requiredFiles: ANTIGRAVITY_PLUGIN_REQUIRED_FILES,
    postInstallNotes: 'Restart Antigravity IDE or reload plugins after installation.',
  },
  {
    id: 'antigravity-all',
    displayName: 'All Antigravity targets',
    defaultTarget: (env = process.env) => joinHome(env, '.gemini'),
    expectedParent: (env = process.env) => joinHome(env),
    aggregateTargetIds: ['agy', 'antigravity-ide'],
    postInstallNotes: 'Installs Antigravity CLI and Antigravity IDE plugin folders.',
  },
];

export function resolveHome(env = process.env) {
  return homeDir(env);
}

export function getAllTargets() {
  return [...TARGETS];
}

export function getTargetById(id) {
  return TARGETS.find((target) => target.id === id);
}

export function supportedTargetIds() {
  return TARGETS.map((target) => target.id);
}
