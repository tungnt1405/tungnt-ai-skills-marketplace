# Hook Manifests Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove duplicate `hooks.copilot.json`, point `plugin.json` to `hooks.json`, and fix Claude `matcher` values.

**Architecture:** Two independent, mechanical changes: (1) delete one duplicate manifest file + update all references (plugin.json, installer, tests); (2) add missing `resume` event to Claude's `SessionStart` matcher in `hooks.unix.json` and `hooks.windows.json`. No logic changes to hook scripts or installer behavior.

**Tech Stack:** JSON, Node.js (tests), bash/PowerShell (unchanged hook scripts)

---

### Task 1: Delete `hooks.copilot.json` and update `plugin.json`

**Files:**
- Delete: `hooks/hooks.copilot.json`
- Modify: `plugin.json:24`

- [ ] **Step 1: Delete the duplicate manifest**

```bash
git rm hooks/hooks.copilot.json
```

- [ ] **Step 2: Update `plugin.json` path reference**

Edit `plugin.json` line 24:
```diff
-  "hooks": "hooks/hooks.copilot.json"
+  "hooks": "hooks/hooks.json"
```

- [ ] **Step 3: Commit**

```bash
git add hooks/ plugin.json
git commit -m "chore: remove duplicate hooks.copilot.json, point plugin.json to hooks.json"
```

---

### Task 2: Update Copilot requiredFiles in installer target-map

**Files:**
- Modify: `installer/target-map.js:203`

- [ ] **Step 1: Remove `hooks.hooks.copilot.json` from Copilot requiredFiles**

Edit `installer/target-map.js` lines 197-204. Remove the line `'hooks/hooks.copilot.json',`:

```diff
 requiredFiles: [
   'plugin.json',
   ...REQUIRED_SKILL_FILES,
   'hooks/session-start',
   'hooks/session-start.cmd',
   'hooks/session-start.ps1',
-  'hooks/hooks.copilot.json',
 ],
```

- [ ] **Step 2: Commit**

```bash
git add installer/target-map.js
git commit -m "chore: remove hooks.copilot.json from copilot requiredFiles"
```

---

### Task 3: Update tests

**Files:**
- Modify: `tests/installer/run-tests.js:346-398`
- Modify: `tests/copilot-bootstrap/run-tests.js:40`

- [ ] **Step 1: Fix `tests/installer/run-tests.js` — 3 assertions**

Edit line 350: change expected hook path from `hooks/hooks.copilot.json` to `hooks/hooks.json`:
```diff
-  assert.equal(plugin.hooks, 'hooks/hooks.copilot.json');
+  assert.equal(plugin.hooks, 'hooks/hooks.json');
```

Edit line 354: change read file from `hooks.copilot.json` to `hooks.json`:
```diff
-  const hooks = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'hooks', 'hooks.copilot.json'), 'utf8'));
+  const hooks = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'hooks', 'hooks.json'), 'utf8'));
```

Edit line 398: change existence check from `hooks.copilot.json` to `hooks.json`:
```diff
-  assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'hooks.copilot.json')), true);
+  assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, 'hooks', 'hooks.json')), true);
```

- [ ] **Step 2: Fix `tests/copilot-bootstrap/run-tests.js` — manifest path**

Edit line 40: change manifest path from `hooks.copilot.json` to `hooks.json`:
```diff
- const manifestPath = path.join(PACKAGE_ROOT, 'hooks', 'hooks.copilot.json');
+ const manifestPath = path.join(PACKAGE_ROOT, 'hooks', 'hooks.json');
```

- [ ] **Step 3: Run installer tests to verify**

```bash
node tests/installer/run-tests.js
```

Expected output: all tests pass, especially:
- `PASS copilot plugin declares native bootstrap hook manifest`
- `PASS copilot hook manifest uses documented sessionStart command shape`
- `PASS copilot source validation requires bootstrap hook files`

- [ ] **Step 4: Run copilot bootstrap tests to verify**

```bash
node tests/copilot-bootstrap/run-tests.js
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add tests/installer/run-tests.js tests/copilot-bootstrap/run-tests.js
git commit -m "chore: update test references from hooks.copilot.json to hooks.json"
```

---

### Task 4: Fix Claude matcher values

**Files:**
- Modify: `hooks/hooks.unix.json`
- Modify: `hooks/hooks.windows.json`

- [ ] **Step 1: Add `resume` to `hooks.unix.json` matcher**

Edit `hooks/hooks.unix.json` line 5:
```diff
-        "matcher": "startup|clear|compact",
+        "matcher": "startup|resume|clear|compact",
```

- [ ] **Step 2: Add `resume` to `hooks.windows.json` matcher**

Edit `hooks/hooks.windows.json` line 5:
```diff
-        "matcher": "startup|clear|compact",
+        "matcher": "startup|resume|clear|compact",
```

- [ ] **Step 3: Run installer tests to verify Claude deploy still passes**

```bash
node tests/installer/run-tests.js
```

Expected: `PASS install --agent claude writes platform-specific hooks manifest` and all other tests pass.

- [ ] **Step 4: Commit**

```bash
git add hooks/hooks.unix.json hooks/hooks.windows.json
git commit -m "fix: add resume event to Claude SessionStart matcher"
```

---

### Task 5: Final verification

- [ ] **Step 1: Run all tests together**

```bash
node tests/installer/run-tests.js && node tests/copilot-bootstrap/run-tests.js
```

Expected: all pass, 0 failures.

- [ ] **Step 2: Verify file tree**

```bash
ls hooks/hooks.copilot.json 2>&1 || echo "Confirmed: deleted"
ls hooks/hooks.json | head -1
```

Expected:
- `hooks/hooks.copilot.json` does not exist
- `hooks/hooks.json` exists (Copilot manifest)

- [ ] **Step 3: Verify `plugin.json` content**

```bash
grep '"hooks"' plugin.json
```

Expected: `"hooks": "hooks/hooks.json"`

- [ ] **Step 4: Create final commit**

```bash
git log --oneline -5
```

Expected: 4 commits — one per task above.

## Self-Review

**1. Spec coverage check:**
- ✅ Delete `hooks/hooks.copilot.json` → Task 1 Step 1
- ✅ Update `plugin.json` → Task 1 Step 2
- ✅ Update `installer/target-map.js` → Task 2 Step 1
- ✅ Update `tests/installer/run-tests.js` → Task 3 Step 1
- ✅ Update `tests/copilot-bootstrap/run-tests.js` → Task 3 Step 2
- ✅ Fix `hooks.unix.json` matcher → Task 4 Step 1
- ✅ Fix `hooks.windows.json` matcher → Task 4 Step 2
- ✅ All tests pass → Task 5 Step 1

**2. Placeholder scan:** No TBD, TODO, incomplete sections, or vague requirements found.

**3. Type consistency:** All assertions and paths consistent between tasks.
