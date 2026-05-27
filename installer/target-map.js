import os from 'node:os';
import path from 'node:path';

export const PLUGIN_NAME = 'tungnt-ai-skills';

const SHARED_REQUIRED_FILES = [
  'skills/using-tungnt-ai-skills/SKILL.md',
];

const ANTIGRAVITY_PLUGIN_ENTRIES = [
  'plugin.json',
  'skills',
];

const ANTIGRAVITY_REQUIRED_FILES = [
  'plugin.json',
  ...SHARED_REQUIRED_FILES,
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
    defaultTarget: (env = process.env) => joinHome(env, '.claude', 'plugins', PLUGIN_NAME),
    expectedParent: (env = process.env) => joinHome(env, '.claude', 'plugins'),
    requiredFiles: [...SHARED_REQUIRED_FILES, 'CLAUDE.md'],
    postInstallNotes: 'Enable tungnt-ai-skills from Claude Code plugins if it is not already active.',
  },
  {
    id: 'codex',
    displayName: 'Codex',
    defaultTarget: (env = process.env) => joinHome(env, '.codex', 'tmp', 'plugins', 'plugins', PLUGIN_NAME),
    expectedParent: (env = process.env) => joinHome(env, '.codex', 'tmp', 'plugins', 'plugins'),
    requiredFiles: [...SHARED_REQUIRED_FILES, 'AGENTS.md'],
    postInstallNotes: 'Open Codex plugins and enable tungnt-ai-skills after installation.',
  },
  {
    id: 'copilot',
    displayName: 'GitHub Copilot CLI',
    defaultTarget: (env = process.env) => joinHome(env, '.copilot', 'plugins', PLUGIN_NAME),
    expectedParent: (env = process.env) => joinHome(env, '.copilot', 'plugins'),
    requiredFiles: [...SHARED_REQUIRED_FILES, 'AGENTS.md'],
    postInstallNotes: 'Enable tungnt-ai-skills through the Copilot plugin flow if your Copilot CLI requires activation.',
  },
  {
    id: 'gemini',
    displayName: 'Gemini CLI',
    defaultTarget: (env = process.env) => joinHome(env, '.gemini', 'extensions', PLUGIN_NAME),
    expectedParent: (env = process.env) => joinHome(env, '.gemini', 'extensions'),
    requiredFiles: [...SHARED_REQUIRED_FILES, 'GEMINI.md', 'gemini-extension.json'],
    postInstallNotes: 'Restart Gemini CLI or reload extensions after installation.',
  },
  {
    id: 'antigravity',
    displayName: 'Google Antigravity 2.0',
    defaultTarget: (env = process.env) => joinHome(env, '.gemini', 'antigravity', 'plugins', PLUGIN_NAME),
    expectedParent: (env = process.env) => joinHome(env, '.gemini', 'antigravity', 'plugins'),
    includedEntries: ANTIGRAVITY_PLUGIN_ENTRIES,
    requiredFiles: ANTIGRAVITY_REQUIRED_FILES,
    postInstallNotes: 'Restart Antigravity or reload plugins after installation.',
  },
  {
    id: 'agy',
    displayName: 'Antigravity CLI',
    defaultTarget: (env = process.env) => joinHome(env, '.gemini', 'antigravity-cli', 'plugins', PLUGIN_NAME),
    expectedParent: (env = process.env) => joinHome(env, '.gemini', 'antigravity-cli', 'plugins'),
    includedEntries: ANTIGRAVITY_PLUGIN_ENTRIES,
    requiredFiles: ANTIGRAVITY_REQUIRED_FILES,
    postInstallNotes: 'Restart Antigravity CLI or reload plugins after installation.',
  },
  {
    id: 'antigravity-ide',
    displayName: 'Antigravity IDE',
    defaultTarget: (env = process.env) => joinHome(env, '.gemini', 'antigravity-ide', 'plugins', PLUGIN_NAME),
    expectedParent: (env = process.env) => joinHome(env, '.gemini', 'antigravity-ide', 'plugins'),
    includedEntries: ANTIGRAVITY_PLUGIN_ENTRIES,
    requiredFiles: ANTIGRAVITY_REQUIRED_FILES,
    postInstallNotes: 'Restart Antigravity IDE or reload plugins after installation.',
  },
  {
    id: 'antigravity-all',
    displayName: 'All Antigravity targets',
    defaultTarget: (env = process.env) => joinHome(env, '.gemini'),
    expectedParent: (env = process.env) => joinHome(env),
    aggregateTargetIds: ['agy', 'antigravity', 'antigravity-ide'],
    postInstallNotes: 'Installs Antigravity CLI, Antigravity 2.0, and Antigravity IDE plugin folders.',
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
