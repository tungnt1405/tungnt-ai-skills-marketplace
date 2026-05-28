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

const CODEX_LOCAL_MARKETPLACE_ENTRIES = [
  '.codex-plugin',
  'assets',
  'skills',
];

const CLAUDE_LOCAL_MARKETPLACE_ENTRIES = [
  '.claude-plugin',
  'hooks',
  'skills',
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
    fallbackInstall: {
      mode: 'package',
      displayName: 'Claude local marketplace',
      defaultTarget: (env = process.env) => joinHome(env, '.claude', 'plugins', 'cache', 'tungnt-ai-skills-marketplace'),
      expectedParent: (env = process.env) => joinHome(env, '.claude', 'plugins', 'cache'),
      includedEntries: CLAUDE_LOCAL_MARKETPLACE_ENTRIES,
      requiredFiles: [...REQUIRED_SKILL_FILES, '.claude-plugin/marketplace.json', '.claude-plugin/plugin.json'],
    },
    nextSteps: [
      'Claude Code app: Open Claude Code.',
      'Claude Code app: Open the Plugins tab.',
      'Claude Code app: Search for tungnt-ai-skills.',
      'Claude Code app: Add the plugin.',
      'Claude CLI: claude plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace',
      'Claude CLI: claude plugin enable tungnt-ai-skills@tungnt-ai-skills-marketplace',
    ],
    postInstallNotes: 'Installed and enabled through Claude Code marketplace commands.',
  },
  {
    id: 'codex',
    displayName: 'Codex',
    defaultTarget: (env = process.env) => joinHome(env, '.codex'),
    expectedParent: (env = process.env) => joinHome(env),
    requiredFiles: ['.agents/plugins/marketplace.json', '.codex-plugin/plugin.json', ...REQUIRED_SKILL_FILES],
    nativeCommands: [
      ['codex', 'plugin', 'marketplace', 'add', 'tungnt1405/tungnt-ai-skills-marketplace'],
      ['codex', 'plugin', 'add', 'tungnt-ai-skills@tungnt-ai-skills-marketplace'],
    ],
    fallbackInstall: {
      mode: 'package',
      displayName: 'Codex local marketplace',
      defaultTarget: (env = process.env) => joinHome(env, '.codex', 'plugins', 'tungnt-ai-skills-marketplace'),
      expectedParent: (env = process.env) => joinHome(env, '.codex', 'plugins'),
      includedEntries: CODEX_LOCAL_MARKETPLACE_ENTRIES,
      requiredFiles: ['.codex-plugin/plugin.json', ...REQUIRED_SKILL_FILES],
      marketplaceFile: (env = process.env) => joinHome(env, '.agents', 'plugins', 'marketplace.json'),
      marketplaceRoot: {
        name: 'tungnt-ai-skills-marketplace',
        interface: {
          displayName: 'Tungnt AI Skills',
        },
      },
      marketplaceEntry: {
        name: PLUGIN_NAME,
        source: {
          source: 'local',
          path: './.codex/plugins/tungnt-ai-skills-marketplace',
        },
        policy: {
          installation: 'AVAILABLE',
          authentication: 'ON_INSTALL',
        },
        category: 'Coding',
      },
    },
    nextSteps: [
      'Codex CLI: Open a terminal and run codex.',
      'Codex CLI: Run /plugins tungnt-ai-skills.',
      'Codex CLI: Add the plugin from the plugins screen.',
      'Codex app: Open Codex.',
      'Codex app: Open the Plugins tab.',
      'Codex app: Search for tungnt-ai-skills.',
      'Codex app: Add the plugin.',
    ],
    postInstallNotes: 'Codex plugin installed through Codex CLI.',
  },
  {
    id: 'copilot',
    displayName: 'GitHub Copilot CLI',
    defaultTarget: (env = process.env) => joinHome(env, '.copilot'),
    expectedParent: (env = process.env) => joinHome(env),
    requiredFiles: [],
    nativeCommands: [
      ['copilot', 'plugin', 'marketplace', 'add', 'tungnt1405/tungnt-ai-skills-marketplace'],
      ['copilot', 'plugin', 'install', 'tungnt-ai-skills@tungnt-ai-skills-marketplace'],
    ],
    fallbackInstall: {
      mode: 'copilotSettings',
      settingsFile: (env = process.env) => joinHome(env, '.copilot', 'settings.json'),
      marketplaceId: 'tungnt-ai-skills-marketplace',
      marketplaceSource: {
        source: {
          source: 'github',
          repo: 'tungnt1405/tungnt-ai-skills-marketplace',
        },
      },
      pluginId: 'tungnt-ai-skills@tungnt-ai-skills-marketplace',
    },
    nextSteps: [
      'Copilot app: Open GitHub Copilot.',
      'Copilot app: Open the Plugins tab.',
      'Copilot app: Search for tungnt-ai-skills.',
      'Copilot app: Add the plugin.',
      'Copilot CLI: copilot plugin install tungnt-ai-skills@tungnt-ai-skills-marketplace',
    ],
    postInstallNotes: 'Copilot marketplace registered and plugin installed through Copilot CLI.',
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
