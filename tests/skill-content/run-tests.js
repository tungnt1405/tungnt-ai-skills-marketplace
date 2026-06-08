import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

function assertIncludes(content, expected, label) {
  assert.equal(content.includes(expected), true, `${label} missing: ${expected}`);
}

function frontmatterName(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  assert.notEqual(match, null, 'missing YAML frontmatter');
  const name = match[1].match(/^name:\s*(.+)$/m);
  assert.notEqual(name, null, 'missing frontmatter name');
  return name[1].trim();
}

assert.equal(exists('skills/investigation/SKILL.md'), true, 'investigation skill must exist');
assert.equal(exists('skills/quick-dev/SKILL.md'), true, 'quick-dev skill must exist');
assert.equal(exists('skills/owner-skill-sync-updater/SKILL.md'), true, 'owner skill sync updater must exist');

const bootstrap = read('skills/using-tungnt-ai-skills/SKILL.md');
assertIncludes(bootstrap, '- `investigation`', 'bootstrap');
assertIncludes(bootstrap, '- `quick-dev`', 'bootstrap');
assertIncludes(bootstrap, '- `owner-skill-sync-updater`', 'bootstrap');

const investigation = read('skills/investigation/SKILL.md');
assert.equal(frontmatterName(investigation), 'investigation', 'investigation frontmatter name');
assertIncludes(investigation, '**Confirmed.**', 'investigation evidence grading');
assertIncludes(investigation, '**Deduced.**', 'investigation evidence grading');
assertIncludes(investigation, '**Hypothesized.**', 'investigation evidence grading');
assertIncludes(investigation, '## Case File Template', 'investigation case template');

const quickDev = read('skills/quick-dev/SKILL.md');
assert.equal(frontmatterName(quickDev), 'quick-dev', 'quick-dev frontmatter name');
assertIncludes(quickDev, 'under 30 minutes', 'quick-dev scope gate');
assertIncludes(quickDev, '1-2 non-test/non-doc files', 'quick-dev scope gate');
assertIncludes(quickDev, 'Escalate Out Of Quick Dev', 'quick-dev red flags');
assertIncludes(quickDev, 'switch to `brainstorming` then `writing-plans`', 'quick-dev red flags');

const ownerSkillSync = read('skills/owner-skill-sync-updater/SKILL.md');
assert.equal(frontmatterName(ownerSkillSync), 'owner-skill-sync-updater', 'owner skill sync frontmatter name');
assertIncludes(ownerSkillSync, 'review-only', 'owner skill sync policy');
assertIncludes(ownerSkillSync, 'Preserve trigger order', 'owner skill sync trigger order');
assertIncludes(ownerSkillSync, 'ui-ux-pro-max', 'owner skill sync domain policy');

const requestReview = read('skills/requesting-code-review/SKILL.md');
assertIncludes(requestReview, 'Blind Hunter', 'requesting-code-review lenses');
assertIncludes(requestReview, 'Edge Case Hunter', 'requesting-code-review lenses');
assertIncludes(requestReview, 'Acceptance Auditor', 'requesting-code-review lenses');
assertIncludes(requestReview, 'Must-Fix', 'requesting-code-review triage');
assertIncludes(requestReview, 'Should-Fix', 'requesting-code-review triage');
assertIncludes(requestReview, 'Consider', 'requesting-code-review triage');
assertIncludes(requestReview, 'Praise', 'requesting-code-review triage');

const codeQualityPrompt = read('skills/subagent-driven-development/code-quality-reviewer-prompt.md');
assertIncludes(codeQualityPrompt, 'Run all three lenses inside this single reviewer pass', 'code quality reviewer prompt');

const executingPlans = read('skills/executing-plans/SKILL.md');
assertIncludes(executingPlans, 'docs/superpowers/status/<plan-name>-status.yaml', 'executing-plans status tracking');
assertIncludes(executingPlans, 'review continuation', 'executing-plans continuation');

const sdd = read('skills/subagent-driven-development/SKILL.md');
assertIncludes(sdd, 'status tracking', 'subagent-driven-development status tracking');

const brainstorming = read('skills/brainstorming/SKILL.md');
assertIncludes(brainstorming, '## Spec Kernel', 'brainstorming spec kernel');
assertIncludes(brainstorming, 'Acceptance Criteria', 'brainstorming spec kernel');

const finishing = read('skills/finishing-a-development-branch/SKILL.md');
assertIncludes(finishing, 'Definition-of-Done', 'finishing DoD gate');
assertIncludes(finishing, 'Acceptance criteria mapped to tests', 'finishing DoD gate');

const forbiddenSkillTokens = [
  'resolve_customization.py',
  'customize.toml',
  '{communication_language}',
  '{user_skill_level}',
  '{implementation_artifacts}',
  '<frozen-after-approval',
];

for (const relativePath of ['skills/investigation/SKILL.md', 'skills/quick-dev/SKILL.md']) {
  const content = read(relativePath);
  for (const token of forbiddenSkillTokens) {
    assert.equal(content.includes(token), false, `${relativePath} must not contain ${token}`);
  }
}

const scannedDirs = [
  path.join(root, 'skills'),
  path.join(root, 'docs', 'superpowers', 'specs'),
];

const absolutePathPattern = /(?:^|[^A-Za-z])(?:[A-Za-z]:[\\/]|\/e\/tungnt\.it\/|\/mnt\/[a-z]\/)/m;
for (const dir of scannedDirs) {
  for (const file of walk(dir)) {
    const content = fs.readFileSync(file, 'utf8');
    assert.equal(absolutePathPattern.test(content), false, `${path.relative(root, file)} contains an absolute local path`);
  }
}

console.log('skill content tests passed');
