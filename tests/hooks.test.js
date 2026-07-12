import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = path.resolve(__dirname, '..');

let pass = true;
function assert(condition, message) {
    if (!condition) {
        console.error('❌ FAIL:', message);
        pass = false;
    } else {
        console.log('✅ PASS:', message);
    }
}

try {
    const stdout = execSync('bash hooks/framework-skills-hook', { cwd: PLUGIN_ROOT }).toString();
    
    assert(stdout.includes('@@PRIVACY_PROMPT@@'), 'Contains @@PRIVACY_PROMPT@@ marker');
    assert(stdout.includes('BLOCKED Commands'), 'Mentions BLOCKED Commands');
    assert(stdout.includes('SENSITIVE Files'), 'Mentions SENSITIVE Files');
    
    // Check default fallback behavior
    assert(stdout.includes('rm -rf /'), 'Default deny commands are present');
    assert(stdout.includes('.env'), 'Default sensitive files are blocked');
    assert(stdout.includes('Auto-Commit is DISABLED'), 'Mentions Auto-Commit rule is disabled by default');
    assert(stdout.includes('Auto-Test is DISABLED'), 'Mentions Auto-Test rule is disabled by default');
    
} catch (error) {
    console.error('Test execution failed', error);
    pass = false;
}

if (!pass) process.exit(1);
