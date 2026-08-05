import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const domainSkills = {
  'api-design': {
    description: 'Use when the brainstorming skill is activated and invokes this skill; the skill is a supporting lens for brainstorming evaluation, design, and edits when working with APIs',
  },
  'security-and-hardening': {
    description: 'Use when the brainstorming skill is activated and invokes this skill; the skill is a supporting lens for brainstorming when help is needed with security decisions and system hardening.',
  },
  'ui-ux-pro-max': {
    description: 'Use when the brainstorming skill is activated and invokes this skill; the skill is a supporting lens for brainstorming evaluation, design, and edits when designing UI/UX',
  },
};

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function frontmatter(content, relativePath) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  assert.notEqual(match, null, `${relativePath} missing YAML frontmatter`);
  return match[1];
}

function frontmatterField(content, field, relativePath) {
  const match = frontmatter(content, relativePath).match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
  assert.notEqual(match, null, `${relativePath} missing frontmatter ${field}`);
  return match[1].trim().replace(/^["']|["']$/g, '');
}

function assertDomainDescription(skillName, config) {
  const relativePath = `skills/${skillName}/SKILL.md`;
  const content = read(relativePath);
  const description = frontmatterField(content, 'description', relativePath);

  assert.equal(
    description,
    config.description,
    `${skillName} description must use its brainstorming-only domain-lens trigger`,
  );
  assert.equal(
    content.includes('Domain Workflow Trigger') || content.includes('Domain skill'),
    true,
    `${skillName} must declare domain workflow behavior in the body`,
  );
}

for (const [skillName, config] of Object.entries(domainSkills)) {
  assertDomainDescription(skillName, config);
}

const bootstrap = read('skills/using-tungnt-ai-skills/SKILL.md');
for (const skillName of Object.keys(domainSkills)) {
  assert.equal(
    bootstrap.includes(`- \`${skillName}\``),
    true,
    `using-tungnt-ai-skills must list domain skill ${skillName}`,
  );
}
assert.equal(
  bootstrap.includes('Domain skills add specialized judgment inside the selected workflow'),
  true,
  'using-tungnt-ai-skills must state domain skills run inside selected workflows',
);
assert.equal(
  bootstrap.includes('do not satisfy or bypass'),
  true,
  'using-tungnt-ai-skills must forbid domain skills from bypassing process gates',
);

for (const required of [
  '## Ambiguous Project Triage',
  '## Domain Lens Routing',
  'security/data loss > public API contract > UI/UX',
  'REST, HTTP, endpoint',
  '`api-design`',
  'auth, authentication, authorization',
  '`security-and-hardening`',
  'UI, UX, dashboard',
  '`ui-ux-pro-max`',
  'Tests auth middleware are failing',
  'Add REST endpoint to create invoice',
  'Build permissions dashboard',
]) {
  assert.equal(
    bootstrap.includes(required),
    true,
    `using-tungnt-ai-skills missing domain routing/triage text: ${required}`,
  );
}

// Plan shape and phased output validation
const writingPlans = read('skills/writing-plans/SKILL.md');
assert.equal(
  writingPlans.includes('## Plan Shape'),
  true,
  'writing-plans must have a Plan Shape section',
);
assert.equal(
  writingPlans.includes('Phase frontmatter is the primary reference source'),
  true,
  'writing-plans must declare phase frontmatter authority',
);
assert.equal(
  writingPlans.includes('## Verification'),
  true,
  'writing-plans must have a Verification section',
);
assert.equal(
  writingPlans.includes('only when user explicitly invokes'),
  true,
  'writing-plans validation must be explicit-only',
);

console.log('skill structure validation passed');
