---
name: configuring-settings
description: Use this skill when the user needs to configure the security and workflow settings (setting.json) for tungnt-ai-skills, either globally or locally.
---

# Configuring Settings

## Overview
This skill helps the user configure the `setting.json` file that governs Auto-Commit, Auto-Test, blocked commands, and sensitive files. It is typically invoked during first-time installation, updates, or when explicitly requested by the user.

## Step 1: Ask Configuration Scope
If the user hasn't specified their preference, ask them:
"Bạn muốn cấu hình settings ở mức **Chung (Global)** (áp dụng cho mọi dự án dùng AI) hay **Cục bộ (Local)** (chỉ áp dụng cho dự án hiện tại)?"
*Recommendation:* Always recommend **Global** for first-time setup so the settings apply everywhere.

## Step 2: Determine File Path
Read the `<SECURITY_POLICY>` from your system context to find the `Plugin Root`.
- **Global**: The settings file must be saved exactly at `[Plugin Root]/setting.json`.
- **Local**: The settings file must be saved at `tais/setting.json` relative to the user's current working directory.

## Step 3: Ask Configuration Preferences
Ask the user for their preferences on each configuration key. You can use an interactive prompt or standard chat. 
Explicitly tell the user: *"Nếu bạn để trống, hệ thống sẽ tự động sử dụng giá trị mặc định an toàn."*

The keys to configure are:
1. **autoCommit**: `true` or `false` (Default: `false`)
2. **autoTest**: `true` or `false` (Default: `false`)
3. **dangerousCommands.blocked**: A list of blocked shell commands (Default: `["rm -rf /", "rm -rf *", "mkfs", "dd", "chmod -R 777 /", "chown -R"]`)
4. **sensitiveFiles.blocked**: A list of blocked sensitive file patterns (Default: `["**/.env", "**/*.pem", "**/.ssh/id_*", "**/secrets.json"]`)

## Step 4: Write Configuration
Create or update the target `setting.json` file using the JSON template below. Substitute the placeholders with the user's choices. If the user provided no input for a specific key, substitute the placeholder with the default values listed in Step 3.

```json
{
  "policy": {
    "autoCommit": <autoCommit_value>,
    "autoTest": <autoTest_value>,
    "dangerousCommands": {
      "blocked": [
        <blockedCommands_list>
      ],
      "askConfirmation": true
    },
    "sensitiveFiles": {
      "blocked": [
        <sensitiveFiles_list>
      ],
      "askConfirmation": true
    },
    "installAndUpdate": {
      "askUser": true
    }
  }
}
```

## Step 5: Wrap up
After writing the file successfully, inform the user that their settings have been applied. Tell them that the warnings will now disappear, and the framework will follow their defined policies.
