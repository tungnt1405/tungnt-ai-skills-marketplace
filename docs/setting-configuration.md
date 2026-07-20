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
- **`false` (Default)**: AI disables auto-testing. If you want tests run, AI must ask for permission (prevents unexpected long-running test suites).

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