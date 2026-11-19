# `setting.json` Configuration Guide

The framework skill supports security policy and workflow customization through a centralized `setting.json` configuration file.

## Configuration File Location

The AI hook system searches for and applies configuration in the following priority order:

1. **Local Project Workspace (Highest Priority):** `tais/setting.json` (in the root directory of the project you're working on with AI).
2. **Global Fallback:** `setting.json` (in the plugin's root installation directory).

To customize per project, simply create a `tais/` directory and place `setting.json` inside your project root.

## Default Configuration Structure

```json
{
  "policy": {
    "autoCommit": false,
    "autoTest": false,
    "dangerousCommands": {
      "blocked": [
        "rm -rf /",
        "rm -rf *",
        "mkfs",
        "dd",
        "chmod -R 777 /",
        "chown -R"
      ],
      "askConfirmation": true
    },
    "sensitiveFiles": {
      "blocked": [
        "**/.env",
        "**/*.pem",
        "**/.ssh/id_*",
        "**/secrets.json"
      ],
      "askConfirmation": true
    },
    "installAndUpdate": {
      "askUser": true
    },
    "thirdPartySkills": {
      "allowed": [],
      "denied": []
    }
  }
}
```

## Configuration Field Descriptions

### 1. `autoCommit` (boolean)
- **`true`**: Allows AI to automatically handle git operations (stage, commit) on the current branch after completing a task.
- **`false` (Default)**: AI **REFUSES** to auto-commit. It will keep changes and ask for your explicit decision to keep, merge, or discard.

### 2. `autoTest` (boolean)
- **`true`**: Allows AI to proactively run project test commands (e.g., `npm test`) to verify code before reporting completion.
- **`false` (Default)**: AI disables auto-testing. If you want tests run, AI must ask for permission (prevents unexpected long-running test suites). It also must not install dependencies or create new test files unless you agree.

### 3. `dangerousCommands` (object)
Manages sensitive shell operations:
- **`blocked` (array)**: List of commands that are absolutely forbidden. AI is never allowed to execute these.
- **`askConfirmation` (boolean)**: For other destructive commands (outside the blocked list), AI must use the `ask_question` tool to request user approval directly.

### 4. `sensitiveFiles` (object)
Manages access to sensitive files:
- **`blocked` (array)**: File patterns that AI must not read or write.
- **`askConfirmation` (boolean)**: When `true`, AI must ask the user before touching files matching sensitive patterns.

### 5. `installAndUpdate` (object)
- **`askUser` (boolean)**: When `true`, AI must ask the user before installing or updating dependencies.

### 6. `thirdPartySkills` (object)
Controls which named skills `third-party-skill-dispatch` may run when the user says "dùng/sử dụng `<skill>` để ..." or "use `<skill>` to ...".
- **`allowed` (array)**: Skill names authorized for dispatch. Defaults to `[]` — nothing is dispatched until you add names in the global plugin `setting.json` or in `tais/setting.json` of a project. A skill outside this list is refused with the exact setting key to edit; an authorized skill that is not installed is refused with install instructions. `["*"]` authorizes every installed skill.
- **`denied` (array)**: Skill names refused for dispatch before any prompt is written or any skill file is read. Deny wins over allow, including `"allowed": ["*"]`. The refusal asks the user for another approach or a deny-list edit.