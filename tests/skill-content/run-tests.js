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

const ownerSyncName = ['owner', 'skill', 'sync', 'updater'].join('-');

assert.equal(exists('skills/investigation/SKILL.md'), true, 'investigation skill must exist');
assert.equal(exists('skills/quick-dev/SKILL.md'), true, 'quick-dev skill must exist');
assert.equal(exists(`skills/${ownerSyncName}/SKILL.md`), false, 'owner sync skill must stay off main');
assert.equal(exists('skills/api-design/SKILL.md'), true, 'api-design skill must exist');
assert.equal(exists('skills/security-and-hardening/SKILL.md'), true, 'security-and-hardening skill must exist');

const bootstrap = read('skills/using-tungnt-ai-skills/SKILL.md');
assertIncludes(bootstrap, '- `investigation`', 'bootstrap');
assertIncludes(bootstrap, '- `quick-dev`', 'bootstrap');
assert.equal(bootstrap.includes(ownerSyncName), false, 'bootstrap must not trigger owner sync on main');

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

const apiDesign = read('skills/api-design/SKILL.md');
assert.equal(frontmatterName(apiDesign), 'api-design', 'api-design frontmatter name');
assertIncludes(apiDesign, 'TDD Trigger Coverage', 'api-design TDD coverage');
assertIncludes(apiDesign, 'Baseline failure', 'api-design TDD coverage');
assertIncludes(apiDesign, 'Skill counter', 'api-design TDD coverage');
assertIncludes(apiDesign, 'Contract-first resources', 'api-design TDD coverage');
assertIncludes(apiDesign, 'One structured error shape', 'api-design error semantics');
assertIncludes(apiDesign, 'Idempotency/repeatability requirement', 'api-design retry safety');
assertIncludes(apiDesign, 'Additive evolution', 'api-design compatibility');
assertIncludes(apiDesign, 'Boundary validation', 'api-design validation');
assertIncludes(apiDesign, 'Compatibility Review', 'api-design compatibility review');

const security = read('skills/security-and-hardening/SKILL.md');
assert.equal(frontmatterName(security), 'security-and-hardening', 'security-and-hardening frontmatter name');
assertIncludes(security, 'Use when securing or reviewing software', 'security-and-hardening trigger');
assertIncludes(security, 'Domain Workflow Trigger', 'security-and-hardening workflow trigger');
assertIncludes(security, 'TDD Trigger Coverage', 'security-and-hardening TDD coverage');
assertIncludes(security, 'OWASP Top 10:2025', 'security-and-hardening OWASP 2025');
assertIncludes(security, 'A03:2025 Software Supply Chain Failures', 'security-and-hardening supply chain');
assertIncludes(security, 'DevSecOps Pipeline Gates', 'security-and-hardening devsecops');
assertIncludes(security, 'scripts/security-smoke-scan.mjs', 'security-and-hardening smoke scan');
assert.equal(exists('skills/security-and-hardening/references/owasp-2025-map.md'), true, 'security OWASP reference must exist');
assert.equal(exists('skills/security-and-hardening/references/devsecops-gates.md'), true, 'security DevSecOps reference must exist');
assert.equal(exists('skills/security-and-hardening/references/cors.md'), true, 'security CORS reference must exist');
assert.equal(exists('skills/security-and-hardening/scripts/security-smoke-scan.mjs'), true, 'security smoke scan script must exist');

const cors = read('skills/security-and-hardening/references/cors.md');
assertIncludes(cors, 'CORS is not authorization', 'CORS reference auth warning');
assertIncludes(cors, 'Do not reflect arbitrary `Origin` values', 'CORS reference origin reflection');
assertIncludes(cors, 'Vary: Origin', 'CORS reference vary origin');
assertIncludes(cors, 'Access-Control-Allow-Credentials', 'CORS reference credentials');

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
