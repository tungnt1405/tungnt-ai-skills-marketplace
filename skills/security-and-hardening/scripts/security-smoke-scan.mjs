#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.json', '.yaml', '.yml', '.env', '.example',
  '.html', '.md', '.toml', '.tf', '.Dockerfile',
]);

const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  'vendor',
]);

const RULES = [
  {
    id: 'likely-secret',
    severity: 'high',
    pattern: /\b(?:api[_-]?key|secret|token|password|private[_-]?key|client[_-]?secret)\b\s*[:=]\s*['"][^'"\n]{12,}['"]/i,
    message: 'Likely hard-coded secret or credential.',
  },
  {
    id: 'private-key',
    severity: 'high',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
    message: 'Private key material appears in source.',
  },
  {
    id: 'eval',
    severity: 'high',
    pattern: /\beval\s*\(/,
    message: 'Dynamic code evaluation can execute attacker-controlled code.',
  },
  {
    id: 'function-constructor',
    severity: 'high',
    pattern: /\bnew\s+Function\s*\(/,
    message: 'Function constructor can execute attacker-controlled code.',
  },
  {
    id: 'unsafe-html-sink',
    severity: 'medium',
    pattern: /\.(?:innerHTML|outerHTML)\s*=/,
    message: 'HTML sink requires trusted input or sanitization.',
  },
  {
    id: 'document-write',
    severity: 'medium',
    pattern: /\bdocument\.write\s*\(/,
    message: 'document.write can introduce XSS risks.',
  },
  {
    id: 'sql-template',
    severity: 'high',
    pattern: /(?:query|execute|raw|sql)\s*\(\s*`[^`]*(?:SELECT|INSERT|UPDATE|DELETE|WHERE)[^`]*\$\{/is,
    message: 'SQL template interpolation may be injectable; use parameters.',
  },
  {
    id: 'shell-exec',
    severity: 'high',
    pattern: /\b(?:exec|execSync)\s*\([^)]*(?:req\.|body|query|params|input|argv)/,
    message: 'Shell execution appears to include external input.',
  },
  {
    id: 'wildcard-cors',
    severity: 'medium',
    pattern: /(?:Access-Control-Allow-Origin['"]?\s*[:,]\s*['"]\*|origin\s*:\s*['"]\*)/,
    message: 'Wildcard CORS should be reviewed, especially with credentials.',
  },
  {
    id: 'insecure-cookie',
    severity: 'medium',
    pattern: /cookie\s*:\s*\{(?:(?!httpOnly|secure|sameSite)[\s\S]){0,400}\}/,
    message: 'Cookie options may be missing httpOnly, secure, or sameSite.',
  },
  {
    id: 'risky-url-fetch',
    severity: 'medium',
    pattern: /\bfetch\s*\(\s*(?:req\.|body|query|params|input|url|webhook|callback)/i,
    message: 'Server-side fetch of influenced URL needs SSRF controls.',
  },
  {
    id: 'stack-trace-response',
    severity: 'medium',
    pattern: /(?:res|reply|response)\.(?:send|json)\s*\([^)]*(?:err|error)\.(?:stack|message)/,
    message: 'Error responses may expose internal details.',
  },
];

const SEVERITY_ORDER = { low: 0, medium: 1, high: 2 };

function parseArgs(argv) {
  const options = { root: '.', json: false, failOn: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--path') {
      options.root = argv[++i];
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--fail-on') {
      options.failOn = argv[++i];
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (options.failOn && !Object.hasOwn(SEVERITY_ORDER, options.failOn)) {
    throw new Error('--fail-on must be one of: low, medium, high');
  }
  return options;
}

function printHelp() {
  console.log(`security-smoke-scan

Usage:
  node security-smoke-scan.mjs --path . [--fail-on high] [--json]

Options:
  --path DIR       Directory to scan. Defaults to current directory.
  --fail-on LEVEL Exit with code 1 when findings at LEVEL or above exist.
  --json          Emit JSON instead of text.
  --help          Show this help.
`);
}

function shouldScanFile(filePath) {
  const base = path.basename(filePath);
  if (base === 'Dockerfile' || base.startsWith('.env')) return true;
  if (base.includes('.min.')) return false;
  return DEFAULT_EXTENSIONS.has(path.extname(filePath));
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        walk(path.join(dir, entry.name), files);
      }
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isFile() && shouldScanFile(full)) {
      files.push(full);
    }
  }
  return files;
}

function lineFor(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function scanFile(file, root) {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(root, file).split(path.sep).join('/');
  const findings = [];

  for (const rule of RULES) {
    const match = rule.pattern.exec(content);
    if (match) {
      findings.push({
        rule: rule.id,
        severity: rule.severity,
        file: relativePath,
        line: lineFor(content, match.index),
        message: rule.message,
      });
    }
  }

  return findings;
}

function hasPackageManifest(root) {
  return fs.existsSync(path.join(root, 'package.json'));
}

function hasAnyLockfile(root) {
  return ['package-lock.json', 'npm-shrinkwrap.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb']
    .some((file) => fs.existsSync(path.join(root, file)));
}

function scanRepo(root) {
  const findings = [];
  for (const file of walk(root)) {
    findings.push(...scanFile(file, root));
  }

  if (hasPackageManifest(root) && !hasAnyLockfile(root)) {
    findings.push({
      rule: 'missing-lockfile',
      severity: 'medium',
      file: 'package.json',
      line: 1,
      message: 'Package manifest exists without a lockfile; reproducible installs may be missing.',
    });
  }

  return findings.sort((a, b) => {
    const severity = SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity];
    if (severity !== 0) return severity;
    return `${a.file}:${a.line}`.localeCompare(`${b.file}:${b.line}`);
  });
}

function printText(findings) {
  if (findings.length === 0) {
    console.log('No smoke-scan findings.');
    return;
  }
  for (const finding of findings) {
    console.log(`${finding.severity.toUpperCase()} ${finding.rule} ${finding.file}:${finding.line}`);
    console.log(`  ${finding.message}`);
  }
}

function shouldFail(findings, failOn) {
  if (!failOn) return false;
  const threshold = SEVERITY_ORDER[failOn];
  return findings.some((finding) => SEVERITY_ORDER[finding.severity] >= threshold);
}

try {
  const options = parseArgs(process.argv.slice(2));
  const root = path.resolve(options.root);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    throw new Error(`Path is not a directory: ${root}`);
  }
  const findings = scanRepo(root);
  if (options.json) {
    console.log(JSON.stringify({ findings }, null, 2));
  } else {
    printText(findings);
  }
  process.exitCode = shouldFail(findings, options.failOn) ? 1 : 0;
} catch (error) {
  console.error(error.message);
  process.exitCode = 2;
}
