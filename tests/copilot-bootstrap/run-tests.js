import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function runHookCommand(cwd, command, env = {}) {
  const processEnv = {
    ...process.env,
    ...env,
  };

  if (process.platform === 'win32') {
    return spawnSync(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command],
      { cwd, encoding: 'utf8', env: processEnv },
    );
  }

  return spawnSync(command, {
    cwd,
    encoding: 'utf8',
    shell: true,
    env: processEnv,
  });
}

function diagnostic(result) {
  return [
    `status: ${result.status}`,
    `stdout: ${result.stdout || '<empty>'}`,
    `stderr: ${result.stderr || '<empty>'}`,
  ].join('\n');
}

const manifestPath = path.join(PACKAGE_ROOT, 'hooks', 'hooks.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const [entry] = manifest.hooks.sessionStart;
const command = process.platform === 'win32' ? entry.powershell : entry.bash;
const hookEnv = {
  TUNGNT_AI_SKILLS_PLUGIN_ROOT: PACKAGE_ROOT,
};

assert.equal(typeof command, 'string');
assert.equal(Object.hasOwn(entry, 'cwd'), false);
assert.match(command, /TUNGNT_AI_SKILLS_PLUGIN_ROOT/);
assert.doesNotMatch(command, /^\s*&\s*\.\\/);
assert.doesNotMatch(command, /bash\s+\.\/hooks\/session-start/);
assert.match(entry.bash, /TUNGNT_AI_SKILLS_PLUGIN_ROOT/);
assert.match(entry.powershell, /TUNGNT_AI_SKILLS_PLUGIN_ROOT/);
assert.doesNotMatch(entry.powershell, /^\s*&\s*\.\\/);
assert.doesNotMatch(entry.bash, /bash\s+\.\/hooks\/session-start/);

const pluginRootRun = runHookCommand(PACKAGE_ROOT, command, hookEnv);
assert.equal(
  pluginRootRun.status,
  0,
  `Copilot bootstrap hook should run when cwd is the plugin root.\n${diagnostic(pluginRootRun)}`,
);
assert.match(pluginRootRun.stdout, /"additionalContext"/);
assert.match(pluginRootRun.stdout, /using-tungnt-ai-skills/);

const workspaceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copilot-hook-workspace-'));
const workspaceRun = runHookCommand(workspaceDir, command, hookEnv);

assert.equal(
  workspaceRun.status,
  0,
  [
    'Copilot bootstrap hook should run when cwd is a normal session workspace.',
    'This reproduces the runtime failure where relative hook commands resolve against the session cwd instead of the installed plugin root.',
    diagnostic(workspaceRun),
  ].join('\n'),
);
assert.match(workspaceRun.stdout, /"additionalContext"/);
assert.match(workspaceRun.stdout, /using-tungnt-ai-skills/);

console.log('Copilot bootstrap hook cwd test passed');
